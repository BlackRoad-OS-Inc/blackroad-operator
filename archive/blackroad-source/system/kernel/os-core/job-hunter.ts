/**
 * Job Hunter Pack - TypeScript Types
 * Frontend types for the automated job application system
 */

export enum JobPlatform {
  LINKEDIN = 'linkedin',
  INDEED = 'indeed',
  ZIPRECRUITER = 'ziprecruiter',
  GLASSDOOR = 'glassdoor',
  CUSTOM = 'custom'
}

export enum ApplicationStatus {
  PENDING = 'pending',
  APPLYING = 'applying',
  SUBMITTED = 'submitted',
  VIEWED = 'viewed',
  INTERVIEWING = 'interviewing',
  REJECTED = 'rejected',
  ACCEPTED = 'accepted',
  WITHDRAWN = 'withdrawn'
}

export interface JobPosting {
  id: string
  platform: JobPlatform
  title: string
  company: string
  location: string
  url: string
  description: string
  requirements: string[]
  salary_range?: string
  posted_date?: string
  scraped_at: string
  metadata: Record<string, any>
}

export interface UserProfile {
  id: string
  full_name: string
  email: string
  phone: string
  location: string

  // Resume data
  resume_url: string
  resume_text: string

  // Profile sections
  summary: string
  skills: string[]
  experience: Experience[]
  education: Education[]

  // Application preferences
  target_roles: string[]
  target_locations: string[]
  target_companies: string[]
  excluded_companies: string[]
  min_salary?: number
  remote_only: boolean

  // Templates
  cover_letter_template: string
  custom_answers: Record<string, string>
}

export interface Experience {
  company: string
  title: string
  duration: string
  location?: string
  description?: string
  highlights?: string[]
}

export interface Education {
  institution: string
  degree: string
  field: string
  graduation_date?: string
  gpa?: string
}

export interface JobApplication {
  id: string
  job_posting_id: string
  user_profile_id: string

  status: ApplicationStatus
  platform: JobPlatform

  // Application content
  cover_letter: string
  custom_answers: Record<string, string>

  // Tracking
  applied_at?: string
  last_updated: string
  follow_up_dates: string[]

  // Results
  response_received: boolean
  interview_scheduled: boolean
  notes: string

  metadata: Record<string, any>
}

export interface JobSearchCriteria {
  keywords: string[]
  locations: string[]
  platforms: JobPlatform[]

  // Filters
  remote_only: boolean
  min_salary?: number
  max_days_old: number
  exclude_companies: string[]

  // Application settings
  auto_apply: boolean
  max_applications_per_day: number
  require_manual_review: boolean
}

export interface JobHuntSession {
  session_id: string
  duration_seconds: number
  jobs_found: number
  applications_generated: number
  applications_submitted: number
  pending_review: number
  top_matches: JobMatch[]
}

export interface JobMatch {
  title: string
  company: string
  platform: string
  match_score: number
  url: string
}

export interface JobHunterStats {
  jobs_discovered: number
  applications_generated: number
  applications_submitted: number
  applications_pending_review: number
  pending_applications: number
  submitted_applications: number
  total_jobs_discovered: number
}

// API Request/Response types

export interface StartJobHuntRequest {
  criteria: JobSearchCriteria
  auto_apply?: boolean
}

export interface StartJobHuntResponse {
  session: JobHuntSession
  stats: JobHunterStats
}

export interface ReviewApplicationRequest {
  application_id: string
}

export interface ReviewApplicationResponse {
  application: JobApplication
  job: JobPosting
}

export interface ApproveApplicationRequest {
  application_id: string
  modifications?: {
    cover_letter?: string
    custom_answers?: Record<string, string>
  }
}

export interface ApproveApplicationResponse {
  success: boolean
  submitted: boolean
  message: string
  error?: string
}

export interface RejectApplicationRequest {
  application_id: string
}

// Dashboard component props

export interface JobHunterDashboardProps {
  profile: UserProfile
  onProfileUpdate: (profile: UserProfile) => void
}

export interface JobSearchFormProps {
  initialCriteria?: Partial<JobSearchCriteria>
  onSearch: (criteria: JobSearchCriteria) => void
  loading?: boolean
}

export interface ApplicationQueueProps {
  applications: JobApplication[]
  jobs: JobPosting[]
  onApprove: (applicationId: string, modifications?: any) => void
  onReject: (applicationId: string) => void
  onReview: (applicationId: string) => void
}

export interface ApplicationCardProps {
  application: JobApplication
  job: JobPosting
  onApprove: () => void
  onReject: () => void
  onEdit: () => void
}

export interface JobListProps {
  jobs: JobPosting[]
  onApply: (jobId: string) => void
  onViewDetails: (jobId: string) => void
}

export interface StatsWidgetProps {
  stats: JobHunterStats
}

// Utility types

export type JobHunterConfig = {
  enabled: boolean
  default_criteria: JobSearchCriteria
  schedule?: {
    enabled: boolean
    cron: string // e.g., "0 9 * * 1-5" for weekdays at 9am
  }
  notifications: {
    email: boolean
    slack?: string
    discord?: string
  }
}
