# Compliance Notes (Informational Only)

- **Privacy by design:** Collect only the learner data required for progress
  tracking and interventions. Avoid storing unnecessary identifiers.
- **FERPA-like considerations:** Treat grades and behavioral signals as
  protected; limit access to authorized staff and ensure auditability of
  interventions recommended by Student Success Bot.
- **GDPR-like considerations:** Provide transparency on data use, enable
  deletion/rectification on request, and prefer pseudonymous identifiers in
  analytics streams.
- **Data minimization for events:** When sending events to `student_success_bot`,
  avoid embedding full submissions or personal identifiers. Include only the
  signals needed for risk detection (e.g., scores, activity timestamps).
- **No legal advice:** These notes are operational guidance. Consult legal
  counsel for jurisdiction-specific requirements.
