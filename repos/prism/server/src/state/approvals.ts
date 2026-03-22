import { randomUUID } from 'crypto';

export type ApprovalStatus = 'pending' | 'approved' | 'denied';

export interface ApprovalRecord<T = unknown> {
  id: string;
  capability: string;
  status: ApprovalStatus;
  payload?: T;
  createdAt: string;
  decidedBy?: string;
  decidedAt?: string;
  requestedBy?: string;
}

const approvals: ApprovalRecord[] = [];
const MAX_APPROVAL_HISTORY = 100;

function prune() {
  if (approvals.length <= MAX_APPROVAL_HISTORY) {
    return;
  }
  let remove = approvals.length - MAX_APPROVAL_HISTORY;
  for (let i = 0; i < approvals.length && remove > 0;) {
    if (approvals[i].status !== 'pending') {
      approvals.splice(i, 1);
      remove -= 1;
    } else {
      i += 1;
    }
  }
}

export function createApproval<T = unknown>(capability: string, payload: T, requestedBy = 'lucidia'): ApprovalRecord<T> {
  const approval: ApprovalRecord<T> = {
    id: randomUUID(),
    capability,
    status: 'pending',
    payload,
    createdAt: new Date().toISOString(),
    requestedBy,
  };
  approvals.push(approval);
  prune();
  return approval;
}

export function listApprovals(status?: ApprovalStatus) {
  return approvals
    .filter((approval) => (status ? approval.status === status : true))
    .map(({ payload, ...rest }) => rest);
}

export function getApproval(id: string) {
  return approvals.find((a) => a.id === id);
}

export function resolveApproval(
  id: string,
  status: Exclude<ApprovalStatus, 'pending'>,
  decidedBy: string,
) {
  const approval = getApproval(id);
  if (!approval) {
    return undefined;
  }
  approval.status = status;
  approval.decidedAt = new Date().toISOString();
  approval.decidedBy = decidedBy;
  return approval;
}

export function clearApprovalPayload(id: string) {
  const approval = getApproval(id);
  if (approval) {
    delete approval.payload;
  }
}
