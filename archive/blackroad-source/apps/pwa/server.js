const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(compression());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// In-memory databases
const jobs = [
  {
    id: '1',
    title: 'Senior Full Stack Developer',
    company: 'BlackRoad Systems',
    location: 'Remote',
    type: 'full-time',
    salary: { min: 120000, max: 180000, currency: 'USD' },
    description: 'Build next-gen deployment systems',
    skills: ['Node.js', 'React', 'Docker', 'PostgreSQL'],
    posted: new Date('2024-01-15').toISOString(),
    applicants: 23,
    status: 'open'
  },
  {
    id: '2',
    title: 'DevOps Engineer',
    company: 'BlackRoad Infrastructure',
    location: 'Hybrid',
    type: 'full-time',
    salary: { min: 100000, max: 150000, currency: 'USD' },
    description: 'Manage Pi clusters and cloud infrastructure',
    skills: ['Kubernetes', 'Terraform', 'Go', 'Python'],
    posted: new Date('2024-01-20').toISOString(),
    applicants: 15,
    status: 'open'
  }
];

const entrepreneurs = [
  {
    id: '1',
    name: 'Alice Anderson',
    venture: 'AI-Powered Analytics Platform',
    stage: 'seed',
    funding_target: 500000,
    funding_raised: 150000,
    industry: 'SaaS',
    description: 'Building next-gen business intelligence tools',
    team_size: 5,
    looking_for: ['CTO', 'Investors', 'Advisors']
  },
  {
    id: '2',
    name: 'Bob Builder',
    venture: 'Sustainable Energy Solutions',
    stage: 'series-a',
    funding_target: 2000000,
    funding_raised: 800000,
    industry: 'CleanTech',
    description: 'Revolutionary solar panel technology',
    team_size: 12,
    looking_for: ['VP Engineering', 'Investors']
  }
];

const applications = [];

// Health check
const healthHandler = (req, res) => {
  res.json({
    status: 'healthy',
    service: 'RoadWork API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    stats: {
      active_jobs: jobs.filter(j => j.status === 'open').length,
      total_entrepreneurs: entrepreneurs.length,
      total_applications: applications.length
    }
  });
};
app.get('/health', healthHandler);
app.get('/api/health', healthHandler);

// Root
app.get('/', (req, res) => {
  res.json({
    name: 'RoadWork',
    description: 'Job Portal & Entrepreneur Platform',
    version: '1.0.0',
    features: [
      'Job board with AI matching',
      'Entrepreneur networking',
      'Funding connections',
      'Skill-based recommendations',
      'Real-time applications'
    ],
    endpoints: {
      jobs: '/api/jobs',
      entrepreneurs: '/api/entrepreneurs',
      applications: '/api/applications',
      stats: '/api/stats'
    }
  });
});

// Jobs API
app.get('/api/jobs', (req, res) => {
  const { type, location, skills } = req.query;
  let filtered = jobs;
  
  if (type) filtered = filtered.filter(j => j.type === type);
  if (location) filtered = filtered.filter(j => j.location.toLowerCase().includes(location.toLowerCase()));
  if (skills) {
    const skillsArray = skills.split(',');
    filtered = filtered.filter(j => 
      j.skills.some(s => skillsArray.includes(s))
    );
  }
  
  res.json({
    success: true,
    count: filtered.length,
    data: filtered
  });
});

app.get('/api/jobs/:id', (req, res) => {
  const job = jobs.find(j => j.id === req.params.id);
  if (!job) {
    return res.status(404).json({ success: false, error: 'Job not found' });
  }
  res.json({ success: true, data: job });
});

app.post('/api/jobs', (req, res) => {
  const newJob = {
    id: String(jobs.length + 1),
    ...req.body,
    posted: new Date().toISOString(),
    applicants: 0,
    status: 'open'
  };
  jobs.push(newJob);
  res.status(201).json({ success: true, data: newJob });
});

// Entrepreneurs API
app.get('/api/entrepreneurs', (req, res) => {
  const { stage, industry } = req.query;
  let filtered = entrepreneurs;
  
  if (stage) filtered = filtered.filter(e => e.stage === stage);
  if (industry) filtered = filtered.filter(e => e.industry === industry);
  
  res.json({
    success: true,
    count: filtered.length,
    data: filtered
  });
});

app.post('/api/entrepreneurs', (req, res) => {
  const newEntrepreneur = {
    id: String(entrepreneurs.length + 1),
    ...req.body,
    funding_raised: req.body.funding_raised || 0,
    team_size: req.body.team_size || 1
  };
  entrepreneurs.push(newEntrepreneur);
  res.status(201).json({ success: true, data: newEntrepreneur });
});

// Applications API
app.post('/api/applications', (req, res) => {
  const { jobId, applicant, resume, coverLetter } = req.body;
  
  const job = jobs.find(j => j.id === jobId);
  if (!job) {
    return res.status(404).json({ success: false, error: 'Job not found' });
  }
  
  const application = {
    id: String(applications.length + 1),
    jobId,
    applicant,
    resume,
    coverLetter,
    status: 'pending',
    appliedAt: new Date().toISOString()
  };
  
  applications.push(application);
  job.applicants += 1;
  
  res.status(201).json({ success: true, data: application });
});

app.get('/api/applications', (req, res) => {
  const { jobId, status } = req.query;
  let filtered = applications;
  
  if (jobId) filtered = filtered.filter(a => a.jobId === jobId);
  if (status) filtered = filtered.filter(a => a.status === status);
  
  res.json({
    success: true,
    count: filtered.length,
    data: filtered
  });
});

// Stats API
app.get('/api/stats', (req, res) => {
  res.json({
    success: true,
    data: {
      jobs: {
        total: jobs.length,
        open: jobs.filter(j => j.status === 'open').length,
        by_type: {
          'full-time': jobs.filter(j => j.type === 'full-time').length,
          'part-time': jobs.filter(j => j.type === 'part-time').length,
          'contract': jobs.filter(j => j.type === 'contract').length
        }
      },
      entrepreneurs: {
        total: entrepreneurs.length,
        by_stage: {
          seed: entrepreneurs.filter(e => e.stage === 'seed').length,
          'series-a': entrepreneurs.filter(e => e.stage === 'series-a').length,
          'series-b': entrepreneurs.filter(e => e.stage === 'series-b').length
        },
        total_funding_target: entrepreneurs.reduce((sum, e) => sum + e.funding_target, 0),
        total_funding_raised: entrepreneurs.reduce((sum, e) => sum + e.funding_raised, 0)
      },
      applications: {
        total: applications.length,
        pending: applications.filter(a => a.status === 'pending').length,
        reviewed: applications.filter(a => a.status === 'reviewed').length
      }
    }
  });
});

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🛣️  RoadWork running on port ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/health`);
  console.log(`   API: http://localhost:${PORT}/api`);
});
