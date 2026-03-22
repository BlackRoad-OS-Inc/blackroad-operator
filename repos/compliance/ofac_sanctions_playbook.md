# OFAC Sanctions Response Playbook – DPRK Cheil Credit Bank Cluster (Nov 2025)

## Overview
On **4 November 2025**, the U.S. Treasury's Office of Foreign Assets Control (OFAC) designated **53 cryptocurrency addresses** associated with Cheil Credit Bank (CCB), a North Korean financial institution under sanction since 2017. Blockchain analytics providers (Elliptic, TRM Labs) report that the cluster:

- Holds approximately **USD 5.4 million** in digital assets.
- Receives steady "payroll-like" inflows tied to overseas IT worker networks attributed to the DPRK.
- Has historic touchpoints with major centralized exchanges, signalling potential downstream exposure for service providers.

This designation fits within a broader enforcement campaign responding to DPRK cyber-enabled theft exceeding **USD 3 billion** over the past three years (more than USD 2 billion in 2025 alone).

## Immediate Response Checklist
1. **Sanctions Screening Update**
   - Import the 53 addresses (plus near-cluster derivatives) into screening lists for wallet vetting, transaction monitoring, and customer onboarding.
   - Re-run nightly batch screening against historical counterparties to identify past exposure.

2. **Counterparty & Flow Analysis**
   - Execute graph clustering (forward and backward) from the designated addresses to flag first- and second-hop entities.
   - Escalate any direct hits or high-probability indirect links to compliance/legal for review and potential Suspicious Activity Reports (SARs).

3. **Exchange / VASP Assurance**
   - Secure written confirmation from each exchange, broker, or hosted wallet provider that they have ingested the new designations.
   - Capture evidence of their screening controls (policy excerpts, SOC reports, API logs).

4. **Governance Communication**
   - Brief General Counsel, Chief Compliance Officer, and Risk leadership on the exposure, remediation plan, and regulator expectations.
   - Document board-level notification if policy requires.

5. **Controls & Documentation**
   - Update AML/CTF policies and customer risk-scoring models to reference the OFAC action.
   - Preserve audit trails: address ingestion logs, alert review notes, outreach emails, SAR filings, and decision records.

## Technical Integration Notes
- **Data Sources**: ingest address lists from OFAC (SDN XML/CSV), Elliptic, TRM Labs, and any other trusted blockchain intelligence partners.
- **Automation**: extend sanctions microservice to support incremental address loads, deduplication, and cluster tagging (e.g., `ofac_ccb_nov2025`).
- **Alert Prioritization**: score alerts higher when transactions originate from payroll-like patterns or route through known DPRK exchange funnels.
- **Testing**: add regression tests that simulate inbound transfers from sanctioned addresses and assert block/alert behaviour.

## Regulatory Follow-Through
- File required notifications or SARs based on jurisdictional thresholds.
- Monitor OFAC, FinCEN, and allied (EU/UK/KR) bulletins for follow-on designations.
- Schedule a post-incident review within 30 days to assess control performance and residual risk.

## Ownership
- **Primary**: Compliance (Sanctions Operations Lead)
- **Supporting**: Risk Engineering, Legal, Security Intelligence

## References
- OFAC SDN List Update – 4 Nov 2025 (Cheil Credit Bank cluster)
- Elliptic: *OFAC lists 53 crypto addresses of sanctioned North Korean Cheil Credit Bank*
- TRM Labs: *US Treasury sanctions DPRK bankers and front companies laundering proceeds from cybercrime and IT worker operations*
