import type { Job } from "./jobTypes";

export function startJob<J extends Job>(job: J, now: string): J {
  return {
    ...job,
    status: "running",
    updatedAt: now,
  };
}

export function completeJob<J extends Job, O>(job: J, output: O, now: string): J {
  return {
    ...job,
    status: "completed",
    output,
    updatedAt: now,
  } as J;
}

export function failJob<J extends Job>(job: J, errorMessage: string, now: string): J {
  return {
    ...job,
    status: "failed",
    errorMessage,
    updatedAt: now,
  };
}
