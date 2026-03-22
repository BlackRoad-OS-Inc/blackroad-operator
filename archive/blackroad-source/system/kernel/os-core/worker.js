/**
 * RemoteJobs Platform - Cloudflare Worker
 * Simple job board where employers post, job seekers apply
 * $0/month to run, actually works
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Handle CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Health check
    if (url.pathname === '/' || url.pathname === '/health') {
      return jsonResponse({
        status: 'healthy',
        service: 'remotejobs-platform',
        timestamp: new Date().toISOString()
      });
    }

    // GET /api/jobs - List all jobs (with filters)
    if (url.pathname === '/api/jobs' && request.method === 'GET') {
      const category = url.searchParams.get('category');
      const search = url.searchParams.get('search');

      const jobs = await env.JOBS.list();
      let allJobs = [];

      for (const key of jobs.keys) {
        const job = await env.JOBS.get(key.name, { type: 'json' });
        if (job) {
          allJobs.push(job);
        }
      }

      // Filter by category
      if (category) {
        allJobs = allJobs.filter(j => j.category === category);
      }

      // Filter by search
      if (search) {
        const searchLower = search.toLowerCase();
        allJobs = allJobs.filter(j =>
          j.title.toLowerCase().includes(searchLower) ||
          j.company.toLowerCase().includes(searchLower) ||
          j.description.toLowerCase().includes(searchLower)
        );
      }

      // Sort by date (newest first)
      allJobs.sort((a, b) => new Date(b.posted_at) - new Date(a.posted_at));

      return jsonResponse({
        jobs: allJobs,
        total: allJobs.length
      });
    }

    // POST /api/jobs - Post a new job
    if (url.pathname === '/api/jobs' && request.method === 'POST') {
      const data = await request.json();

      // Validate required fields
      if (!data.title || !data.company || !data.description || !data.email) {
        return jsonResponse({
          error: 'Missing required fields: title, company, description, email'
        }, 400);
      }

      const jobId = `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const job = {
        id: jobId,
        title: data.title,
        company: data.company,
        description: data.description,
        category: data.category || 'Other',
        salary: data.salary || 'Not specified',
        email: data.email,
        url: data.url || '',
        posted_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        applications: 0
      };

      await env.JOBS.put(jobId, JSON.stringify(job), {
        expirationTtl: 30 * 24 * 60 * 60 // 30 days
      });

      return jsonResponse({
        success: true,
        job,
        message: 'Job posted successfully! It will be live for 30 days.'
      });
    }

    // GET /api/jobs/:id - Get single job
    if (url.pathname.startsWith('/api/jobs/') && request.method === 'GET') {
      const jobId = url.pathname.split('/').pop();
      const job = await env.JOBS.get(jobId, { type: 'json' });

      if (!job) {
        return jsonResponse({ error: 'Job not found' }, 404);
      }

      return jsonResponse({ job });
    }

    // POST /api/jobs/:id/apply - Apply to a job
    if (url.pathname.match(/\/api\/jobs\/[^\/]+\/apply$/) && request.method === 'POST') {
      const jobId = url.pathname.split('/')[3];
      const data = await request.json();

      const job = await env.JOBS.get(jobId, { type: 'json' });

      if (!job) {
        return jsonResponse({ error: 'Job not found' }, 404);
      }

      // Increment application count
      job.applications = (job.applications || 0) + 1;
      await env.JOBS.put(jobId, JSON.stringify(job), {
        expirationTtl: 30 * 24 * 60 * 60
      });

      // Store application (optional - for tracking)
      const appId = `app-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const application = {
        id: appId,
        job_id: jobId,
        job_title: job.title,
        company: job.company,
        applicant_name: data.name,
        applicant_email: data.email,
        resume: data.resume || '',
        cover_letter: data.cover_letter || '',
        applied_at: new Date().toISOString()
      };

      await env.APPLICATIONS.put(appId, JSON.stringify(application), {
        expirationTtl: 90 * 24 * 60 * 60 // 90 days
      });

      return jsonResponse({
        success: true,
        message: 'Application submitted successfully!',
        application
      });
    }

    // GET /api/stats - Platform stats
    if (url.pathname === '/api/stats' && request.method === 'GET') {
      const jobs = await env.JOBS.list();
      const applications = await env.APPLICATIONS.list();

      return jsonResponse({
        total_jobs: jobs.keys.length,
        total_applications: applications.keys.length,
        categories: {
          'Customer Service': 0,
          'Sales': 0,
          'Administrative': 0,
          'Tech': 0,
          'Creative': 0,
          'Other': 0
        }
      });
    }

    return jsonResponse({ error: 'Not found' }, 404);
  }
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders
    }
  });
}
