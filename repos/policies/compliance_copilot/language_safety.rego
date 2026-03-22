package policy.language_safety

default allow = true

violation[{
  "rule_id": "language_safety_001",
  "message": "Disallowed phrases such as 'inside tip' or 'zero downside' must not appear in outbound materials.",
  "severity": "critical"
}] {
  some banned
  banned := ["secret insight", "inside tip", "zero downside"][_]
  lower := lower(input.profile.marketing_material)
  contains(lower, banned)
}

violation[{
  "rule_id": "language_safety_002",
  "message": "Statements using 'will' should include softeners like 'may' or 'could' to avoid guarantees.",
  "severity": "warning"
}] {
  lower := lower(input.profile.marketing_material)
  contains(lower, " will ")
  not contains(lower, "may")
  not contains(lower, "could")
}

violation[{
  "rule_id": "language_safety_003",
  "message": "Communications must reference risk considerations to remain balanced.",
  "severity": "critical"
}] {
  not contains(lower(input.profile.marketing_material), "risk")
}
