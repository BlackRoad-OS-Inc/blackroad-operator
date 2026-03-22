# Bitcoin Mining Ops Dashboard — 11 Nov 2025

## Revenue & Fee Mix
- **Global miner revenue:** ~US$52.98M on 11 Nov (daily range high-$30M to low-$50M through early Nov).
- **Fee share:** Fees remain a small slice of total rewards; plan around <5% contribution when modeling upside.
- **Margin watch:** Treat any difficulty easing (e.g., −2% to −4%) as transient; assume flat-to-down fee levels when stress testing.

## Grid Interaction (ERCOT Focus)
- **LFL activity:** ERCOT "large flexible load" participants are actively invoicing curtailment and ancillary credits; expect more settlement adjustments through Q4.
- **Operational lever:** Keep curtailable sites synced to OpsMessages + MORA briefings so the desk can monetize fast-response events.
- **Budget linkage:** Cross-reference curtailment payouts against each site's power-cost budget to pre-trigger hedges when credits shift.

## Monitoring Checklist
1. **Grid signals:** Subscribe team pagers to ERCOT OpsMessages and MORA updates for curtailment/ANC opportunities.
2. **Mempool fee percentiles:** Track fee % of block reward via mempool.space (or equivalent) to catch upside inflections quickly.
3. **Firmware alerts:** Aggregate OEM + major firmware vendor feeds; flag unofficial/overclock builds for extra review.

## Scenario Planning
- **Base case:** Hold current revenue bands with neutral difficulty.
- **Downside:** Model at least −3% network difficulty change coupled with a 20–30% drop in fee revenue; verify margin headroom on each site.
- **Trigger thresholds:**
  - Fee share <3% of total revenue → launch deeper economic review.
  - Difficulty starts falling → re-run margin stack to avoid complacency.
  - Major ERCOT LFL curtailment call → prep curtailable sites for response.

## Immediate Actions for Ops Crew
- Turn on dashboard alerts for the three monitors above.
- Refresh firmware audit: log Oct–Nov official releases and warn technicians about stability/security risk on unofficial builds.
- Update runbooks to capture curtailment credit estimation + reconciliation steps before next ERCOT settlement window.

*Source cues: YCharts miner revenue (daily), Blockchain.com fee share, ERCOT LFL program briefing via EIA.*
