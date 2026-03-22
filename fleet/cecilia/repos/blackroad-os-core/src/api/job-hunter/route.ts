/**
 * Job Hunter API Routes
 * API endpoints for job hunter pack
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import {
  JobSearchCriteria,
  StartJobHuntRequest,
  ApproveApplicationRequest,
  RejectApplicationRequest
} from '@/packs/job-hunter'

// In production, these would connect to the Python backend
// For now, we'll create stub responses

export async function POST(request: NextRequest) {
  const path = request.nextUrl.pathname

  if (path === '/api/job-hunter/search') {
    return handleSearch(request)
  } else if (path === '/api/job-hunter/approve') {
    return handleApprove(request)
  } else if (path === '/api/job-hunter/reject') {
    return handleReject(request)
  }

  return NextResponse.json({ error: 'Not found' }, { status: 404 })
}

async function handleSearch(request: NextRequest) {
  try {
    const body: StartJobHuntRequest = await request.json()
    const { criteria } = body

    // In production, this would call the Python backend:
    // const response = await fetch('http://localhost:8000/api/job-hunter/search', {
    //   method: 'POST',
    //   body: JSON.stringify({ criteria })
    // })

    // For now, return mock data
    const mockResponse = {
      session: {
        session_id: 'session-123',
        duration_seconds: 5.2,
        jobs_found: 15,
        applications_generated: 8,
        applications_submitted: 0,
        pending_review: 8,
        top_matches: [
          {
            title: 'Senior Software Engineer',
            company: 'Tech Corp',
            platform: 'linkedin',
            match_score: 0.92,
            url: 'https://linkedin.com/jobs/...'
          },
          {
            title: 'Full Stack Developer',
            company: 'Startup Inc',
            platform: 'indeed',
            match_score: 0.85,
            url: 'https://indeed.com/...'
          }
        ]
      },
      stats: {
        jobs_discovered: 15,
        applications_generated: 8,
        applications_submitted: 0,
        applications_pending_review: 8,
        pending_applications: 8,
        submitted_applications: 0,
        total_jobs_discovered: 15
      },
      pending_applications: [
        {
          id: 'app-001',
          job_posting_id: 'job-001',
          user_profile_id: 'user-001',
          status: 'pending',
          platform: 'linkedin',
          cover_letter: 'Dear Hiring Manager,\n\nI am excited to apply for the Senior Software Engineer position at Tech Corp...',
          custom_answers: {
            why_interested: 'I\'m passionate about building scalable systems...',
            strengths: 'Strong full-stack development and system design'
          },
          last_updated: new Date().toISOString(),
          follow_up_dates: [],
          response_received: false,
          interview_scheduled: false,
          notes: '',
          metadata: {
            match_score: 0.92,
            job_title: 'Senior Software Engineer',
            company: 'Tech Corp',
            job_url: 'https://linkedin.com/jobs/...'
          }
        }
      ]
    }

    return NextResponse.json(mockResponse)
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    )
  }
}

async function handleApprove(request: NextRequest) {
  try {
    const body: ApproveApplicationRequest = await request.json()
    const { application_id, modifications } = body

    // In production, call Python backend to submit application
    // const response = await fetch('http://localhost:8000/api/job-hunter/approve', {
    //   method: 'POST',
    //   body: JSON.stringify({ application_id, modifications })
    // })

    return NextResponse.json({
      success: true,
      submitted: true,
      message: 'Application submitted successfully'
    })
  } catch (error) {
    console.error('Approve error:', error)
    return NextResponse.json(
      { success: false, error: 'Approval failed' },
      { status: 500 }
    )
  }
}

async function handleReject(request: NextRequest) {
  try {
    const body: RejectApplicationRequest = await request.json()
    const { application_id } = body

    // In production, call Python backend
    // await fetch('http://localhost:8000/api/job-hunter/reject', {
    //   method: 'POST',
    //   body: JSON.stringify({ application_id })
    // })

    return NextResponse.json({
      success: true,
      message: 'Application rejected'
    })
  } catch (error) {
    console.error('Reject error:', error)
    return NextResponse.json(
      { error: 'Rejection failed' },
      { status: 500 }
    )
  }
}
