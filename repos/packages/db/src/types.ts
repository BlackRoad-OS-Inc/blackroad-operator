export type UserRole = "admin" | "user";

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
}

export type PolicyStatus = "Active" | "Draft" | "Retired";

export interface PolicyRecord {
  id: string;
  key: string;
  title: string;
  version: number;
  status: PolicyStatus;
  body: unknown;
  controls: string[];
  effectiveAt: Date;
  supersedesId?: string | null;
  createdAt: Date;
}

export type AttestationPeriod = "Annual" | "Initial" | "AdHoc";

export interface AttestationRecord {
  id: string;
  userId: string;
  policyId: string;
  period: AttestationPeriod;
  answers: unknown;
  signedAt: Date;
}

export interface EvidenceRecord {
  id: string;
  kind: string;
  path: string;
  sha256: string;
  meta: unknown;
  createdAt: Date;
}

export type ReviewOutcome =
  | "Approved"
  | "Rejected"
  | "NeedsChanges"
  | "AutoApproved"
  | "Escalated";

export interface ReviewRecord {
  id: string;
  type: string;
  input: unknown;
  outcome: ReviewOutcome;
  riskScore: number;
  breaches: string[];
  notes?: string | null;
  reviewerId?: string | null;
  createdAt: Date;
}

export type ReviewArtifactRole = "Input" | "Output" | "Approval" | "Disclosure";

export interface ReviewArtifactRecord {
  id: string;
  reviewId: string;
  evidenceId: string;
  role: ReviewArtifactRole;
}

export type CalendarStatus = "Open" | "Done" | "Snoozed" | "Waived";

export interface CalendarItemRecord {
  id: string;
  key: string;
  summary: string;
  due: Date;
  track: string;
  stateCode?: string | null;
  status: CalendarStatus;
  blockers: string[];
  createdAt: Date;
}

export interface GateRecord {
  id: string;
  action: string;
  context: unknown;
  allowed: boolean;
  reason?: string | null;
  createdAt: Date;
}

export interface WormBlockRecord {
  id: string;
  idx: number;
  ts: Date;
  payload: unknown;
export type ClientType = "INDIVIDUAL" | "TRUST" | "BUSINESS";
export type ClientStatus = "Prospect" | "KYC_PENDING" | "DocsPending" | "ReadyToOpen" | "Active" | "Rejected";
export type ClientRiskBand = "LOW" | "MODERATE" | "HIGH" | "SPECULATIVE";

export type PersonRole =
  | "PRIMARY"
  | "JOINT"
  | "BENEFICIAL_OWNER"
  | "CONTROL_PERSON"
  | "TRUSTEE"
  | "GRANTOR"
  | "AUTH_TRADER";

export type AccountChannel = "RIA" | "BD" | "INSURANCE" | "CRYPTO";
export type AccountRiskTolerance = "Low" | "Moderate" | "High" | "Speculative";
export type AccountAppStatus = "Draft" | "NeedsReview" | "ReadyToSubmit" | "Submitted" | "Opened" | "Rejected";

export type ScreeningSubjectType = "PERSON" | "BUSINESS" | "WALLET";
export type ScreeningStatus = "CLEAR" | "REVIEW" | "HIT";
export type GateAction = "advise" | "open_account" | "trade" | "enable_options" | "enable_margin" | "enable_crypto";
export type WalletChain = "BTC" | "ETH" | "SOL" | "OTHER";
export type WalletStatus = "UNVERIFIED" | "VERIFIED" | "RESTRICTED";

export interface Client {
  id: string;
  type: ClientType;
  status: ClientStatus;
  riskBand?: ClientRiskBand;
  suitability: unknown;
  createdAt: Date;
}

export interface Person {
  id: string;
  clientId: string;
  role: PersonRole;
  name: string;
  dob?: Date;
  ssnLast4?: string;
  tin?: string;
  phones: string[];
  emails: string[];
  addresses: Record<string, unknown>;
  kyc: Record<string, unknown>;
  pep?: boolean;
  sanctionsHit?: boolean;
}

export interface Business {
  id: string;
  clientId: string;
  legalName: string;
  formationCountry: string;
  formationState?: string;
  ein?: string;
  naics?: string;
  controlPersons: string[];
  beneficialOwners: string[];
  kyb: Record<string, unknown>;
}

export interface AccountApp {
  id: string;
  clientId: string;
  channel: AccountChannel;
  accountType: string;
  optionsLevel?: number;
  margin?: boolean;
  objectives: string[];
  timeHorizon: string;
  liquidityNeeds: string;
  riskTolerance: AccountRiskTolerance;
  disclosuresAccepted: string[];
  eSignEnvelopeId?: string;
  status: AccountAppStatus;
  meta: Record<string, unknown>;
}

export interface Document {
  id: string;
  clientId?: string;
  accountAppId?: string;
  kind: string;
  path: string;
  sha256: string;
  meta: Record<string, unknown>;
  createdAt: Date;
}

export interface Screening {
  id: string;
  clientId: string;
  subjectType: ScreeningSubjectType;
  subjectId: string;
  provider: string;
  result: Record<string, unknown>;
  score: number;
  status: ScreeningStatus;
  createdAt: Date;
}

export interface Wallet {
  id: string;
  clientId: string;
  chain: WalletChain;
  address: string;
  label?: string;
  riskScore?: number;
  lastScreenedAt?: Date;
  status: WalletStatus;
}

export interface WormBlock {
  id: string;
  idx: number;
  ts: Date;
  payload: Record<string, unknown>;
  prevHash: string;
  hash: string;
}

export interface CreateEvidenceInput {
  kind: string;
  path: string;
  sha256: string;
  meta: unknown;
}

export interface CreateReviewInput {
  type: string;
  input: unknown;
  outcome: ReviewOutcome;
  riskScore: number;
  breaches: string[];
  notes?: string | null;
  reviewerId?: string | null;
}

export interface ComplianceDb {
  policy: {
    findByKey(key: string): Promise<PolicyRecord | null>;
    create(input: Omit<PolicyRecord, "id" | "createdAt">): Promise<PolicyRecord>;
    update(id: string, input: Partial<Omit<PolicyRecord, "id" | "createdAt">>): Promise<PolicyRecord>;
    list(): Promise<PolicyRecord[]>;
  };
  attestation: {
    create(input: Omit<AttestationRecord, "id">): Promise<AttestationRecord>;
    findLatest(userId: string, policyId: string): Promise<AttestationRecord | null>;
  };
  review: {
    create(input: CreateReviewInput): Promise<ReviewRecord>;
  };
  evidence: {
    create(input: CreateEvidenceInput): Promise<EvidenceRecord>;
  };
  reviewArtifact: {
    link(input: Omit<ReviewArtifactRecord, "id">): Promise<ReviewArtifactRecord>;
  };
  calendar: {
    upsertByKey(
      key: string,
      input: Omit<CalendarItemRecord, "id" | "createdAt" | "key">
    ): Promise<CalendarItemRecord>;
    listOpen(): Promise<CalendarItemRecord[]>;
    setStatus(id: string, status: CalendarStatus, reason?: string): Promise<CalendarItemRecord>;
  };
  gate: {
    create(input: Omit<GateRecord, "id" | "createdAt">): Promise<GateRecord>;
  };
  worm: {
    getLatest(): Promise<WormBlockRecord | null>;
    append(input: Omit<WormBlockRecord, "id">): Promise<WormBlockRecord>;
    list(): Promise<WormBlockRecord[]>;
  };
export interface Gate {
  id: string;
  clientId: string;
  action: GateAction;
  allowed: boolean;
  reason?: string;
  createdAt: Date;
}
