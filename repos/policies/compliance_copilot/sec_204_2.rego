package policy.sec_204_2

default allow = true

violation[{
  "rule_id": "sec_204_2_001",
  "message": "Record-keeping must retain supporting data sources for any quantitative statement.",
  "severity": "warning"
}] {
  count(input.profile.data_sources) == 0
}

violation[{
  "rule_id": "sec_204_2_002",
  "message": "Each record needs the advisor's email and representative identifier.",
  "severity": "info"
}] {
  input.advisor_email == ""
  or input.representative_id == ""
}

violation[{
  "rule_id": "sec_204_2_003",
  "message": "The system must stamp each review with an immutable UTC timestamp.",
  "severity": "info"
}] {
  not input.submitted_at
}

violation[{
  "rule_id": "sec_204_2_004",
  "message": "Suitability rationales must contain at least forty words to be audit-ready.",
  "severity": "warning"
}] {
  count(split(trim(input.rationale_text), " ")) < 40
}
