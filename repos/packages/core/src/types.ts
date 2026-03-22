export type Subject = 'communication' | 'client' | 'employee' | 'trade' | 'vendor'

export interface EvalContext {
  state?: string
  track?: string
  date?: string
}

export interface EvalInput<T = unknown> {
  subject: Subject
  data: T
  context: EvalContext
}

export interface EvalResult {
  pass: boolean
  riskScore: number
  breaches: string[]
  requiredDisclosures?: string[]
  requiredEvidence?: string[]
  gateRecommendation?: 'block' | 'allow' | 'review'
}

export interface PolicyEvaluator<T = unknown> {
  key: string
  title: string
  version: number
  evaluate(input: EvalInput<T>): EvalResult
}

export type LicenseCategory = 'securities' | 'insurance' | 'real_estate'
export type LicenseStatus = 'Active' | 'Expired' | 'Requalify' | 'Unknown' | 'Barred'

export interface Person {
  id: string
  legalName: string
  aka?: string[]
  crdNumber?: string
  homeState: string
  tracks: LicenseCategory[]
  targetStates: string[]
  disclosures: string[]
  designations: string[]
  priorEmployers: Array<{ name: string; role: string }>
}

export interface LicenseTrack {
  id: string
  personId: string
  track: LicenseCategory
  stateCode: string
  licenseType: string
  status: LicenseStatus
  expiration?: Date
  ceHoursEarned?: number
  metadata?: Record<string, unknown>
}

export interface TransitionRule {
  from: LicenseStatus
  to: 'Active' | 'Requalify'
  conditions: string[]
  tasks: TaskTemplateKey[]
}

export interface ReinstatementRule {
  graceWindowDays?: number
  reinstatementWindowDays?: number
  requiresExamRetakeIfBeyondDays?: number
  requiresPrelicensingIfBeyondDays?: number
  ce?: {
    requiredHours: number
    ethicsHours?: number
    carryover?: boolean
  } | null
  backgroundCheck?: {
    fingerprints?: boolean
  } | null
  sponsorRequired?: boolean
  formSet: string[]
  fees?: Record<string, number> | null
  appointmentsResetOnReinstatement?: boolean
  docsNeeded: string[]
  transitions: TransitionRule[]
}

export interface Rulebook {
  id: string
  stateCode: string
  track: LicenseCategory
  licenseType: string
  version: number
  sourceUrls: string[]
  rules: ReinstatementRule
}

export type FilingArtifactKind =
  | 'Form'
  | 'ExamPass'
  | 'ProofCE'
  | 'Fee'
  | 'Fingerprint'
  | 'Appointment'
  | 'Affidavit'
  | 'Background'

export type TaskTemplateKey =
  | 'FETCH_CRD_HISTORY'
  | 'PARSE_BROKERCHECK_PDF'
  | 'VERIFY_DISCLOSURES'
  | 'SCHEDULE_SERIES65_EXAM'
  | 'FILE_U4'
  | 'ADV_FILE_FIRM'
  | 'INSURANCE_REINSTATE_VIA_SIRCON'
  | 'UPLOAD_CE_CERTS'
  | 'PAY_REINSTATEMENT_FEE'
  | 'REAL_ESTATE_REINSTATE'
  | 'FINGERPRINTS'
  | 'APPOINTMENTS_REAPPLY'
  | 'SECURE_BD_SPONSOR'
  | 'VERIFY_LICENSE_EXPIRATION'
  | 'COMPLETE_BACKGROUND_CHECK'
  | 'SUBMIT_STATE_APPLICATION'
  | 'PAY_STATE_FEES'
  | 'PRELICENSING_COURSE'
  | 'SCHEDULE_INSURANCE_EXAM'
  | 'NEW_APPLICATION'
  | 'SCHEDULE_REAL_ESTATE_EXAM'

export type TaskStatus = 'Open' | 'Completed'

export interface TaskTemplate {
  key: TaskTemplateKey
  title: string
  description: string
  blocking: boolean
  requiredArtifacts: FilingArtifactKind[]
}

export interface PlannedTask {
  id: string
  personId: string
  stateCode: string
  track: LicenseCategory
  licenseType: string
  template: TaskTemplateKey
  title: string
  status: TaskStatus
  blocking: boolean
  due: Date | null
  payload?: Record<string, unknown>
  requiredArtifacts: FilingArtifactKind[]
}

export interface RuleEvaluationResult {
  target: 'Active' | 'Requalify'
  tasks: PlannedTask[]
  blockers: string[]
  fees: Record<string, number> | null
  notes: string[]
}

export interface PlanOptions {
  now?: Date
  targetStates: string[]
  targetTracks: LicenseCategory[]
}

export interface PlanSummary {
  stateCode: string
  track: LicenseCategory
  licenseType: string
  targetStatus: 'Active' | 'Requalify'
  blockers: string[]
  fees: Record<string, number> | null
  tasks: PlannedTask[]
}

export interface PlannerResult {
  tasks: PlannedTask[]
  summaries: PlanSummary[]
}

export interface GateResult {
  allowed: boolean
  reason?: string
  requiredEvidence?: string[]
}
