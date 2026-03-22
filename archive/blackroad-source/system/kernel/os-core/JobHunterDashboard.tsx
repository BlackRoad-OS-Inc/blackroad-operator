/**
 * Job Hunter Dashboard
 * Main dashboard for automated job application system
 */

'use client'

import React, { useState } from 'react'
import {
  JobHunterStats,
  JobSearchCriteria,
  JobApplication,
  JobPosting,
  JobPlatform,
  UserProfile
} from '@/packs/job-hunter'

interface JobHunterDashboardProps {
  profile: UserProfile
  onProfileUpdate: (profile: UserProfile) => void
}

export function JobHunterDashboard({ profile, onProfileUpdate }: JobHunterDashboardProps) {
  const [stats, setStats] = useState<JobHunterStats>({
    jobs_discovered: 0,
    applications_generated: 0,
    applications_submitted: 0,
    applications_pending_review: 0,
    pending_applications: 0,
    submitted_applications: 0,
    total_jobs_discovered: 0
  })

  const [searching, setSearching] = useState(false)
  const [pendingApps, setPendingApps] = useState<JobApplication[]>([])

  const handleSearch = async (criteria: JobSearchCriteria) => {
    setSearching(true)
    try {
      const response = await fetch('/api/job-hunter/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ criteria })
      })
      const data = await response.json()
      setStats(data.stats)
      setPendingApps(data.pending_applications || [])
    } catch (error) {
      console.error('Job search failed:', error)
    } finally {
      setSearching(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">🎯 Job Hunter</h1>
        <p className="text-purple-100">Automated job applications powered by AI</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          label="Jobs Found"
          value={stats.total_jobs_discovered}
          icon="🔍"
          color="blue"
        />
        <StatCard
          label="Applications Generated"
          value={stats.applications_generated}
          icon="✍️"
          color="purple"
        />
        <StatCard
          label="Pending Review"
          value={stats.pending_applications}
          icon="⏸️"
          color="yellow"
        />
        <StatCard
          label="Submitted"
          value={stats.submitted_applications}
          icon="✅"
          color="green"
        />
      </div>

      {/* Search Form */}
      <JobSearchForm onSearch={handleSearch} loading={searching} />

      {/* Pending Applications */}
      {pendingApps.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">📝 Pending Review ({pendingApps.length})</h2>
          <div className="space-y-4">
            {pendingApps.map(app => (
              <ApplicationCard
                key={app.id}
                application={app}
                onApprove={() => handleApprove(app.id)}
                onReject={() => handleReject(app.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, icon, color }: {
  label: string
  value: number
  icon: string
  color: 'blue' | 'purple' | 'yellow' | 'green'
}) {
  const colors = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    green: 'bg-green-50 text-green-700 border-green-200'
  }

  return (
    <div className={`rounded-lg border-2 p-4 ${colors[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-80">{label}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </div>
  )
}

function JobSearchForm({ onSearch, loading }: {
  onSearch: (criteria: JobSearchCriteria) => void
  loading: boolean
}) {
  const [keywords, setKeywords] = useState('Software Engineer, Full Stack Developer')
  const [locations, setLocations] = useState('Remote, San Francisco')
  const [platforms, setPlatforms] = useState<JobPlatform[]>([
    JobPlatform.LINKEDIN,
    JobPlatform.INDEED
  ])
  const [maxApps, setMaxApps] = useState(10)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const criteria: JobSearchCriteria = {
      keywords: keywords.split(',').map(k => k.trim()),
      locations: locations.split(',').map(l => l.trim()),
      platforms,
      remote_only: false,
      max_days_old: 7,
      exclude_companies: [],
      auto_apply: false,
      max_applications_per_day: maxApps,
      require_manual_review: true
    }

    onSearch(criteria)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4">🔍 Start Job Search</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Keywords</label>
          <input
            type="text"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="Software Engineer, Developer"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
          />
          <p className="text-sm text-gray-500 mt-1">Comma-separated job titles</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Locations</label>
          <input
            type="text"
            value={locations}
            onChange={(e) => setLocations(e.target.value)}
            placeholder="Remote, San Francisco, New York"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Platforms</label>
          <div className="flex flex-wrap gap-2">
            {Object.values(JobPlatform).map(platform => (
              <label key={platform} className="flex items-center">
                <input
                  type="checkbox"
                  checked={platforms.includes(platform)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setPlatforms([...platforms, platform])
                    } else {
                      setPlatforms(platforms.filter(p => p !== platform))
                    }
                  }}
                  className="mr-2"
                />
                <span className="capitalize">{platform}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Max Applications per Day: {maxApps}
          </label>
          <input
            type="range"
            min="1"
            max="20"
            value={maxApps}
            onChange={(e) => setMaxApps(parseInt(e.target.value))}
            className="w-full"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {loading ? '🔍 Searching...' : '🚀 Start Job Hunt'}
        </button>
      </div>
    </form>
  )
}

function ApplicationCard({ application, onApprove, onReject }: {
  application: JobApplication
  onApprove: () => void
  onReject: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const matchScore = application.metadata.match_score || 0
  const jobTitle = application.metadata.job_title || 'Unknown'
  const company = application.metadata.company || 'Unknown'

  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold">{jobTitle}</h3>
          <p className="text-gray-600">{company}</p>
          <div className="flex items-center gap-4 mt-2">
            <span className="text-sm bg-purple-100 text-purple-700 px-2 py-1 rounded">
              {application.platform}
            </span>
            <span className="text-sm">
              Match: <strong>{(matchScore * 100).toFixed(0)}%</strong>
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50"
          >
            {expanded ? 'Hide' : 'Review'}
          </button>
          <button
            onClick={onApprove}
            className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            ✓ Approve
          </button>
          <button
            onClick={onReject}
            className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            ✗ Reject
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t">
          <h4 className="font-semibold mb-2">Cover Letter:</h4>
          <div className="bg-gray-50 p-4 rounded-lg text-sm whitespace-pre-wrap">
            {application.cover_letter}
          </div>

          {Object.keys(application.custom_answers).length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold mb-2">Custom Answers:</h4>
              {Object.entries(application.custom_answers).map(([key, value]) => (
                <div key={key} className="mb-2">
                  <p className="text-sm font-medium text-gray-700 capitalize">
                    {key.replace(/_/g, ' ')}:
                  </p>
                  <p className="text-sm text-gray-600 ml-4">{value}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

async function handleApprove(applicationId: string) {
  try {
    const response = await fetch('/api/job-hunter/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ application_id: applicationId })
    })
    const result = await response.json()
    if (result.success) {
      alert('✅ Application submitted successfully!')
      window.location.reload()
    }
  } catch (error) {
    console.error('Failed to approve application:', error)
    alert('❌ Failed to submit application')
  }
}

async function handleReject(applicationId: string) {
  try {
    await fetch('/api/job-hunter/reject', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ application_id: applicationId })
    })
    window.location.reload()
  } catch (error) {
    console.error('Failed to reject application:', error)
  }
}
