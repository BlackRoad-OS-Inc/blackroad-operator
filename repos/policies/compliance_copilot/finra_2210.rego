package policy.finra_2210

default allow = true

violation[{
  "rule_id": "finra_2210_001",
  "message": "Marketing copy cannot include promissory language such as 'guaranteed' or 'risk-free'.",
  "severity": "critical"
}] {
  some banned
  banned := ["guaranteed", "no risk", "best", "assured", "risk-free"][_]
  lower := lower(input.profile.marketing_material)
  contains(lower, banned)
}

violation[{
  "rule_id": "finra_2210_002",
  "message": "High-return positioning must be paired with explicit downside language in the same communication.",
  "severity": "critical"
}] {
  some hype
  hype := ["high yield", "double", "outperform", "alpha"][_]
  lower := lower(input.profile.marketing_material)
  contains(lower, hype)
  not contains(lower, "risk")
}

violation[{
  "rule_id": "finra_2210_003",
  "message": "Numerical claims must cite a verifiable data source in the submission payload.",
  "severity": "warning"
}] {
  lower := lower(input.profile.marketing_material)
  re_match("[0-9]+%", lower)
  count(input.profile.data_sources) == 0
}

violation[{
  "rule_id": "finra_2210_004",
  "message": "Communications must prominently include the supervising firm or representative identifier.",
  "severity": "warning"
}] {
  lower := lower(input.profile.marketing_material)
  not contains(lower, "blackroad")
  not contains(lower, lower(input.representative_id))
}

violation[{
  "rule_id": "finra_2210_005",
  "message": "Speculative objectives cannot be recommended for conservative risk tolerance clients.",
  "severity": "critical"
}] {
  input.profile.investment_objective == "speculation"
  input.profile.risk_tolerance == "conservative"
}
