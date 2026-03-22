#!/usr/bin/env python3
"""
KPI Generator for Prism Console
Generates comprehensive KPIs across all business domains with realistic sample data
"""

import json
import random
from datetime import datetime, timedelta
from typing import Dict, List, Any
from dataclasses import dataclass, asdict
from collections import defaultdict

random.seed(42)

@dataclass
class KPI:
    category: str
    name: str
    value: Any
    unit: str
    status: str  # good, warning, critical
    trend: str  # up, down, flat
    change_percent: float
    description: str
    data_source: str

class KPIGenerator:
    def __init__(self):
        self.now = datetime.now()
        self.kpis: List[KPI] = []

    def generate_all(self) -> Dict[str, Any]:
        """Generate all KPIs across all categories"""
        self.generate_sales_revenue_kpis()
        self.generate_hiring_talent_kpis()
        self.generate_marketing_kpis()
        self.generate_operations_kpis()
        self.generate_people_analytics_kpis()
        self.generate_compliance_kpis()
        self.generate_financial_kpis()
        self.generate_product_engineering_kpis()
        self.generate_system_health_kpis()
        self.generate_composite_kpis()

        return {
            "generated_at": self.now.isoformat(),
            "total_kpis": len(self.kpis),
            "categories": self._group_by_category(),
            "kpis": [asdict(kpi) for kpi in self.kpis]
        }

    def _group_by_category(self) -> Dict[str, int]:
        categories = defaultdict(int)
        for kpi in self.kpis:
            categories[kpi.category] += 1
        return dict(categories)

    def add_kpi(self, category: str, name: str, value: Any, unit: str,
                status: str, trend: str, change_percent: float,
                description: str, data_source: str):
        kpi = KPI(
            category=category,
            name=name,
            value=value,
            unit=unit,
            status=status,
            trend=trend,
            change_percent=change_percent,
            description=description,
            data_source=data_source
        )
        self.kpis.append(kpi)

    def generate_sales_revenue_kpis(self):
        """Generate Sales & Revenue KPIs"""
        cat = "Sales & Revenue"

        # Pipeline Velocity
        velocity = random.uniform(18, 35)
        self.add_kpi(cat, "Sales Pipeline Velocity", round(velocity, 1), "days",
                    "good" if velocity < 25 else "warning",
                    "down", -8.5, "Average days between pipeline stages",
                    "data/crm/opps.jsonl")

        # Win Rate
        win_rate = random.uniform(15, 30)
        self.add_kpi(cat, "Win Rate", round(win_rate, 1), "%",
                    "good" if win_rate > 20 else "warning",
                    "up", 12.3, "Closed-won / total opportunities",
                    "data/crm/opps.jsonl")

        # Average Deal Size
        deal_size = random.uniform(45000, 95000)
        self.add_kpi(cat, "Average Deal Size", f"${deal_size:,.0f}", "USD",
                    "good", "up", 15.2, "Total pipeline value / opportunity count",
                    "data/crm/opps.jsonl")

        # Sales Cycle Length
        cycle = random.uniform(45, 90)
        self.add_kpi(cat, "Sales Cycle Length", round(cycle, 0), "days",
                    "warning" if cycle > 70 else "good",
                    "up", 5.8, "Time from lead to closed-won",
                    "data/crm/opps.jsonl")

        # Quota Attainment
        quota = random.uniform(85, 125)
        self.add_kpi(cat, "Quota Attainment", round(quota, 1), "%",
                    "good" if quota >= 100 else "warning",
                    "up", 8.4, "Actual revenue / assigned quota",
                    "data/crm/opps.jsonl")

        # Forecast Accuracy
        forecast_acc = random.uniform(75, 95)
        self.add_kpi(cat, "Forecast Accuracy", round(forecast_acc, 1), "%",
                    "good" if forecast_acc > 85 else "warning",
                    "up", 4.2, "Forecasted vs actual revenue variance",
                    "data/crm/opps.jsonl")

        # Commission Burn Rate
        commission = random.uniform(8, 15)
        self.add_kpi(cat, "Commission Burn Rate", round(commission, 1), "%",
                    "good", "flat", 0.3, "Accrued commissions / revenue",
                    "data/crm/opps.jsonl")

        # Renewal Rate
        renewal = random.uniform(82, 98)
        self.add_kpi(cat, "Renewal Rate", round(renewal, 1), "%",
                    "good" if renewal > 90 else "warning",
                    "down", -2.1, "Renewed ARR / at-risk ARR",
                    "data/crm/opps.jsonl")

        # Territory Performance (Top territory)
        territory_rev = random.uniform(850000, 1500000)
        self.add_kpi(cat, "Top Territory Revenue", f"${territory_rev:,.0f}", "USD",
                    "good", "up", 22.5, "Revenue by assigned territory (West Region)",
                    "data/crm/opps.jsonl")

        # Lead Quality Score
        lead_quality = random.uniform(55, 85)
        self.add_kpi(cat, "Lead Quality Score", round(lead_quality, 1), "score",
                    "good" if lead_quality > 70 else "warning",
                    "up", 6.8, "Conversion rate by source (weighted avg)",
                    "data/crm/opps.jsonl")

    def generate_hiring_talent_kpis(self):
        """Generate Hiring & Talent KPIs"""
        cat = "Hiring & Talent"

        # Time to Hire
        tth = random.uniform(28, 55)
        self.add_kpi(cat, "Time to Hire", round(tth, 0), "days",
                    "good" if tth < 40 else "warning",
                    "down", -8.2, "Average days from application to offer accepted",
                    "data/ats/applications.jsonl")

        # Offer Acceptance Rate
        offer_acc = random.uniform(75, 92)
        self.add_kpi(cat, "Offer Acceptance Rate", round(offer_acc, 1), "%",
                    "good" if offer_acc > 85 else "warning",
                    "up", 5.3, "Offers accepted / offers extended",
                    "data/ats/offers.jsonl")

        # Source Quality (top source)
        source_quality = random.uniform(18, 35)
        self.add_kpi(cat, "Top Source Quality", round(source_quality, 1), "%",
                    "good", "up", 12.1, "Hire rate by candidate source (LinkedIn)",
                    "data/ats/applications.jsonl")

        # Interview Completion Rate
        interview_comp = random.uniform(82, 96)
        self.add_kpi(cat, "Interview Completion Rate", round(interview_comp, 1), "%",
                    "good" if interview_comp > 90 else "warning",
                    "down", -3.2, "Completed / scheduled interviews",
                    "data/ats/interviews.jsonl")

        # Hiring Velocity
        hiring_vel = random.uniform(3, 8)
        self.add_kpi(cat, "Hiring Velocity", round(hiring_vel, 1), "hires/week",
                    "good", "up", 15.8, "Offers accepted per week",
                    "data/ats/applications.jsonl")

        # Cost per Hire
        cph = random.uniform(4500, 8500)
        self.add_kpi(cat, "Cost per Hire", f"${cph:,.0f}", "USD",
                    "good" if cph < 6000 else "warning",
                    "down", -5.2, "Total recruiting spend / hires",
                    "data/ats/analytics.jsonl")

        # Onboarding Completion Rate
        onboard = random.uniform(88, 99)
        self.add_kpi(cat, "Onboarding Completion Rate", round(onboard, 1), "%",
                    "good" if onboard > 95 else "warning",
                    "up", 2.8, "% completing onboarding checklist",
                    "data/hr/onboarding.jsonl")

        # Diversity Rate (example: female hires)
        diversity = random.uniform(35, 48)
        self.add_kpi(cat, "Female Hire Rate", round(diversity, 1), "%",
                    "good", "up", 8.5, "% female hires (all roles)",
                    "data/ats/applications.jsonl")

    def generate_marketing_kpis(self):
        """Generate Marketing & Demand Generation KPIs"""
        cat = "Marketing & Demand Generation"

        # ROAS
        roas = random.uniform(2.8, 6.5)
        self.add_kpi(cat, "Return on Ad Spend (ROAS)", round(roas, 2), "ratio",
                    "good" if roas > 4.0 else "warning",
                    "up", 18.5, "Attribution value / spend",
                    "data/mkt/attribution_results.jsonl")

        # CPA
        cpa = random.uniform(85, 250)
        self.add_kpi(cat, "Cost per Acquisition (CPA)", f"${cpa:,.0f}", "USD",
                    "good" if cpa < 150 else "warning",
                    "down", -12.3, "Campaign spend / conversions",
                    "data/mkt/touches.jsonl")

        # Campaign ROI
        campaign_roi = random.uniform(180, 420)
        self.add_kpi(cat, "Campaign ROI", round(campaign_roi, 0), "%",
                    "good", "up", 25.8, "Revenue from campaign / campaign cost",
                    "data/mkt/touches.jsonl")

        # Multi-Touch Attribution Value
        mta_val = random.uniform(850000, 1500000)
        self.add_kpi(cat, "Multi-Touch Attribution Value", f"${mta_val:,.0f}", "USD",
                    "good", "up", 15.2, "Credit distribution across all channels",
                    "data/mkt/attribution_results.jsonl")

        # First-Touch Attribution
        ft_attr = random.uniform(28, 42)
        self.add_kpi(cat, "First-Touch Attribution", round(ft_attr, 1), "%",
                    "good", "flat", 1.2, "% conversions by first touchpoint",
                    "data/mkt/attribution_results.jsonl")

        # Last-Touch Attribution
        lt_attr = random.uniform(35, 52)
        self.add_kpi(cat, "Last-Touch Attribution", round(lt_attr, 1), "%",
                    "good", "flat", -0.8, "% conversions by last touchpoint",
                    "data/mkt/attribution_results.jsonl")

        # Channel Mix - Paid Search
        paid_search = random.uniform(32, 48)
        self.add_kpi(cat, "Paid Search Share", round(paid_search, 1), "%",
                    "good", "up", 5.2, "% spend on paid search",
                    "data/mkt/touches.jsonl")

        # MQL Rate
        mql_rate = random.uniform(12, 28)
        self.add_kpi(cat, "MQL Rate", round(mql_rate, 1), "%",
                    "good" if mql_rate > 18 else "warning",
                    "up", 8.5, "% leads becoming MQL",
                    "data/mkt/touches.jsonl")

        # Journey Length
        journey = random.uniform(4.2, 8.5)
        self.add_kpi(cat, "Average Journey Length", round(journey, 1), "touches",
                    "good", "down", -5.2, "Average touches before conversion",
                    "data/mkt/touches.jsonl")

        # Segment Engagement
        segment_eng = random.uniform(58, 85)
        self.add_kpi(cat, "Segment Engagement Rate", round(segment_eng, 1), "%",
                    "good" if segment_eng > 70 else "warning",
                    "up", 12.5, "% segment activity over time (Enterprise segment)",
                    "data/mkt/touches.jsonl")

    def generate_operations_kpis(self):
        """Generate Operations & Reliability KPIs"""
        cat = "Operations & Reliability"

        # Service Availability
        availability = random.uniform(99.85, 99.98)
        self.add_kpi(cat, "Service Availability", round(availability, 3), "%",
                    "good" if availability >= 99.9 else "warning",
                    "up", 0.05, "Uptime % (target: 99.9%)",
                    "data/obs/slo_eval.jsonl")

        # Error Budget Remaining
        error_budget = random.uniform(65, 95)
        self.add_kpi(cat, "Error Budget Remaining", round(error_budget, 1), "%",
                    "good" if error_budget > 50 else "warning",
                    "down", -8.2, "% SLO error budget remaining",
                    "data/obs/slo_eval.jsonl")

        # P95 Latency
        p95 = random.uniform(120, 280)
        self.add_kpi(cat, "P95 Latency", round(p95, 0), "ms",
                    "good" if p95 <= 250 else "warning",
                    "down", -12.5, "95th percentile response time (target: ≤250ms)",
                    "data/obs/metrics.jsonl")

        # Mean Response Time
        mean_rt = random.uniform(45, 95)
        self.add_kpi(cat, "Mean Response Time", round(mean_rt, 0), "ms",
                    "good", "down", -8.5, "Average API response time",
                    "data/obs/metrics.jsonl")

        # Error Rate
        error_rate = random.uniform(0.05, 0.35)
        self.add_kpi(cat, "Error Rate", round(error_rate, 2), "%",
                    "good" if error_rate < 0.2 else "warning",
                    "down", -15.2, "Failed requests / total requests",
                    "data/obs/metrics.jsonl")

        # Request Volume
        req_vol = random.uniform(8500, 15000)
        self.add_kpi(cat, "Request Volume", f"{req_vol:,.0f}", "req/min",
                    "good", "up", 18.5, "Requests per minute",
                    "data/obs/metrics.jsonl")

        # Alert Firing Frequency
        alerts = random.randint(12, 45)
        self.add_kpi(cat, "Alert Firing Frequency", alerts, "alerts/day",
                    "good" if alerts < 25 else "warning",
                    "down", -22.5, "Alerts per day",
                    "data/obs/alerts.jsonl")

        # MTTR
        mttr = random.uniform(8, 35)
        self.add_kpi(cat, "Mean Time To Recover", round(mttr, 1), "minutes",
                    "good" if mttr < 20 else "warning",
                    "down", -18.5, "Average alert duration",
                    "data/obs/alerts.jsonl")

        # Policy Evaluation Success Rate
        policy_success = random.uniform(94, 99.5)
        self.add_kpi(cat, "Policy Evaluation Success", round(policy_success, 1), "%",
                    "good" if policy_success > 97 else "warning",
                    "up", 2.5, "Pass / (pass + warn + fail)",
                    "apps/api/src/metrics/metrics.ts")

        # Policy Engine Efficiency
        engine_eff = random.uniform(75, 92)
        self.add_kpi(cat, "Policy Engine Efficiency", round(engine_eff, 1), "%",
                    "good", "up", 5.2, "Engine latency / total latency",
                    "apps/api/src/metrics/metrics.ts")

    def generate_people_analytics_kpis(self):
        """Generate People Analytics KPIs"""
        cat = "People Analytics"

        # MAU
        mau = random.randint(8500, 15000)
        self.add_kpi(cat, "Monthly Active Users", f"{mau:,}", "users",
                    "good", "up", 12.5, "Unique users per month",
                    "data/pa/metrics.jsonl")

        # User Retention
        retention = random.uniform(82, 94)
        self.add_kpi(cat, "User Retention", round(retention, 1), "%",
                    "good" if retention > 85 else "warning",
                    "up", 3.2, "Month-over-month active users",
                    "data/pa/metrics.jsonl")

        # Churn Rate
        churn = random.uniform(3.5, 8.5)
        self.add_kpi(cat, "Churn Rate", round(churn, 1), "%",
                    "good" if churn < 5 else "warning",
                    "down", -12.5, "Users lost / starting users",
                    "data/pa/metrics.jsonl")

        # DAU/MAU Ratio
        dau_mau = random.uniform(0.25, 0.45)
        self.add_kpi(cat, "DAU/MAU Ratio", round(dau_mau, 2), "ratio",
                    "good" if dau_mau > 0.3 else "warning",
                    "up", 8.5, "Daily active / monthly active users",
                    "data/pa/metrics.jsonl")

        # Engagement Score
        engagement = random.uniform(35, 75)
        self.add_kpi(cat, "Engagement Score", round(engagement, 1), "events/user",
                    "good" if engagement > 50 else "warning",
                    "up", 15.2, "Average events per user",
                    "data/pa/metrics.jsonl")

        # Feature Adoption
        feature_adopt = random.uniform(42, 78)
        self.add_kpi(cat, "Feature Adoption Rate", round(feature_adopt, 1), "%",
                    "good" if feature_adopt > 60 else "warning",
                    "up", 25.8, "% users using new dashboard feature",
                    "data/pa/metrics.jsonl")

        # Segment Growth
        segment_growth = random.uniform(1200, 3500)
        self.add_kpi(cat, "Segment Growth", f"{segment_growth:,.0f}", "users",
                    "good", "up", 18.5, "New users added to power user segment",
                    "data/pa/metrics.jsonl")

    def generate_compliance_kpis(self):
        """Generate Compliance & Risk KPIs"""
        cat = "Compliance & Risk"

        # Policy Compliance Rate
        compliance = random.uniform(94, 99.5)
        self.add_kpi(cat, "Policy Compliance Rate", round(compliance, 1), "%",
                    "good" if compliance > 97 else "warning",
                    "up", 2.8, "Passed policies / total policies",
                    "apps/api/src/metrics/metrics.ts")

        # Attestation Success Rate
        attest = random.uniform(96, 99.8)
        self.add_kpi(cat, "Attestation Success Rate", round(attest, 1), "%",
                    "good" if attest > 98 else "warning",
                    "up", 1.5, "Successful attestations / total",
                    "apps/api/src/metrics/metrics.ts")

        # PQC Coverage
        pqc = random.uniform(75, 92)
        self.add_kpi(cat, "Post-Quantum Crypto Coverage", round(pqc, 1), "%",
                    "good" if pqc > 85 else "warning",
                    "up", 12.5, "Systems with PQC enabled / total",
                    "apps/api/src/metrics/metrics.ts")

        # Audit Trail Completeness
        audit = random.uniform(98, 100)
        self.add_kpi(cat, "Audit Trail Completeness", round(audit, 1), "%",
                    "good" if audit > 99 else "warning",
                    "flat", 0.2, "Logged actions / total actions",
                    "data/audit/{orgId}.jsonl")

        # Data Lineage Coverage
        lineage = random.uniform(82, 96)
        self.add_kpi(cat, "Data Lineage Coverage", round(lineage, 1), "%",
                    "good" if lineage > 90 else "warning",
                    "up", 8.5, "Tracked assets / total assets",
                    "orchestrator/lineage.py")

    def generate_financial_kpis(self):
        """Generate Financial & Cost KPIs"""
        cat = "Financial & Cost"

        # Budget Variance
        variance = random.uniform(-8.5, 5.2)
        self.add_kpi(cat, "Budget Variance", round(variance, 1), "%",
                    "good" if abs(variance) < 5 else "warning",
                    "flat", 0.5, "(Actual - Budget) / Budget",
                    "data/finops/budget_eval.jsonl")

        # Cost Trend
        cost_trend = random.uniform(2.5, 8.5)
        self.add_kpi(cat, "Cost Trend", round(cost_trend, 1), "%",
                    "warning" if cost_trend > 5 else "good",
                    "up", cost_trend, "Cost month-over-month increase",
                    "data/finops/budget_eval.jsonl")

        # Cost per Unit
        cpu = random.uniform(125, 285)
        self.add_kpi(cat, "Cost per Employee", f"${cpu:,.0f}", "USD/month",
                    "good", "down", -3.2, "Total cost / employee count",
                    "data/finops/budget_eval.jsonl")

        # Burn Rate
        burn = random.uniform(450000, 850000)
        self.add_kpi(cat, "Monthly Burn Rate", f"${burn:,.0f}", "USD/month",
                    "good", "down", -5.8, "Monthly operating costs",
                    "data/finops/budget_eval.jsonl")

        # Headroom to Budget
        headroom = random.uniform(12, 35)
        self.add_kpi(cat, "Budget Headroom", round(headroom, 1), "%",
                    "good" if headroom > 15 else "warning",
                    "down", -8.5, "(Budget - Actual) / Budget",
                    "data/finops/budget_eval.jsonl")

    def generate_product_engineering_kpis(self):
        """Generate Product & Engineering KPIs"""
        cat = "Product & Engineering"

        # Test Coverage
        coverage = random.uniform(75, 92)
        self.add_kpi(cat, "Test Coverage", round(coverage, 1), "%",
                    "good" if coverage > 80 else "warning",
                    "up", 5.2, "% code covered by tests",
                    "agents/metrics_muse.py")

        # Build Performance
        build_time = random.uniform(2.5, 5.8)
        self.add_kpi(cat, "Build Time", round(build_time, 1), "minutes",
                    "good" if build_time < 4 else "warning",
                    "down", -12.5, "Average build duration",
                    "agents/metrics_muse.py")

        # Bundle Size
        bundle = random.uniform(850, 1500)
        self.add_kpi(cat, "Bundle Size", round(bundle, 0), "KB",
                    "good" if bundle < 1000 else "warning",
                    "up", 8.5, "JavaScript bundle size",
                    "agents/metrics_muse.py")

        # Experiment Velocity
        exp_vel = random.uniform(12, 28)
        self.add_kpi(cat, "Experiment Velocity", round(exp_vel, 0), "tests/week",
                    "good", "up", 15.8, "A/B tests running per week",
                    "data/exp/results.jsonl")

        # Experiment Lift
        lift = random.uniform(5.2, 25.8)
        self.add_kpi(cat, "Average Experiment Lift", round(lift, 1), "%",
                    "good" if lift > 10 else "warning",
                    "up", 12.5, "Variant performance vs control",
                    "data/exp/results.jsonl")

        # Bug Resolution Time
        bug_time = random.uniform(2.5, 8.5)
        self.add_kpi(cat, "Bug Resolution Time", round(bug_time, 1), "days",
                    "good" if bug_time < 5 else "warning",
                    "down", -18.5, "Average days to fix reported bugs",
                    "apps/api/src/routes/metrics.ts")

    def generate_system_health_kpis(self):
        """Generate System Health KPIs"""
        cat = "System Health"

        # Agent Uptime
        agent_uptime = random.uniform(94, 99.5)
        self.add_kpi(cat, "Agent Uptime", round(agent_uptime, 1), "%",
                    "good" if agent_uptime > 97 else "warning",
                    "down", -1.5, "% of agents online vs total",
                    "services/prism-console-api/src/prism/models.py")

        # Agent Memory Usage
        memory = random.uniform(245, 425)
        self.add_kpi(cat, "Agent Memory Usage", round(memory, 0), "MB",
                    "good" if memory < 350 else "warning",
                    "up", 8.5, "Average MB per agent",
                    "services/prism-console-api/src/prism/models.py")

        # Runbook Success Rate
        runbook_success = random.uniform(92, 98.5)
        self.add_kpi(cat, "Runbook Success Rate", round(runbook_success, 1), "%",
                    "good" if runbook_success > 95 else "warning",
                    "up", 3.2, "Successful runs / total runs",
                    "services/prism-console-api/src/prism/observability/metrics.py")

        # Bot Execution Frequency
        bot_freq = random.uniform(850, 1500)
        self.add_kpi(cat, "Bot Execution Frequency", f"{bot_freq:,.0f}", "tasks/day",
                    "good", "up", 15.2, "Task executions per day",
                    "orchestrator/lineage.py")

        # Artifact Generation Rate
        artifact_rate = random.uniform(2500, 5000)
        self.add_kpi(cat, "Artifact Generation Rate", f"{artifact_rate:,.0f}", "artifacts/day",
                    "good", "up", 18.5, "Artifacts created per day",
                    "orchestrator/lineage.py")

    def generate_composite_kpis(self):
        """Generate Composite/Derived KPIs"""
        cat = "Composite Metrics"

        # Sales Efficiency
        sales_eff = random.uniform(3.5, 8.5)
        self.add_kpi(cat, "Sales Efficiency", round(sales_eff, 2), "ratio",
                    "good" if sales_eff > 5 else "warning",
                    "up", 12.5, "Revenue / sales spend",
                    "Calculated from CRM + FinOps data")

        # Marketing Efficiency
        mkt_eff = random.uniform(4.2, 9.8)
        self.add_kpi(cat, "Marketing Efficiency", round(mkt_eff, 2), "ratio",
                    "good" if mkt_eff > 6 else "warning",
                    "up", 15.8, "Revenue / marketing spend",
                    "Calculated from Marketing + FinOps data")

        # Unit Economics
        unit_econ = random.uniform(35, 65)
        self.add_kpi(cat, "Unit Economics", round(unit_econ, 1), "%",
                    "good" if unit_econ > 50 else "warning",
                    "up", 8.5, "(Revenue - COGS) / Revenue",
                    "Calculated from Financial data")

        # Operational Maturity Score
        ops_maturity = random.uniform(75, 92)
        self.add_kpi(cat, "Operational Maturity", round(ops_maturity, 1), "score",
                    "good" if ops_maturity > 80 else "warning",
                    "up", 5.2, "Composite: policies + SLOs + alerts",
                    "Calculated from Compliance + Ops data")

        # Data Quality Score
        dq_score = random.uniform(82, 95)
        self.add_kpi(cat, "Data Quality Score", round(dq_score, 1), "score",
                    "good" if dq_score > 90 else "warning",
                    "up", 3.8, "Composite: completeness + validity + lineage",
                    "Calculated from Data platform metrics")

        # Compliance Score
        compliance_score = random.uniform(88, 98)
        self.add_kpi(cat, "Overall Compliance Score", round(compliance_score, 1), "score",
                    "good" if compliance_score > 95 else "warning",
                    "up", 2.5, "Composite: policies + audits + breaches",
                    "Calculated from Compliance data")

        # System Health Index
        health_index = random.uniform(85, 97)
        self.add_kpi(cat, "System Health Index", round(health_index, 1), "score",
                    "good" if health_index > 90 else "warning",
                    "down", -1.2, "Composite: availability + latency + errors",
                    "Calculated from Operations data")

def main():
    generator = KPIGenerator()
    results = generator.generate_all()

    # Save to file
    output_file = "data/kpi/kpi_latest.json"
    with open(output_file, 'w') as f:
        json.dump(results, f, indent=2)

    # Also save a detailed report
    report_file = "data/kpi/kpi_report.json"
    with open(report_file, 'w') as f:
        json.dump(results, f, indent=2)

    print(f"✓ Generated {results['total_kpis']} KPIs")
    print(f"✓ Categories: {len(results['categories'])}")
    print(f"\nKPIs by category:")
    for category, count in results['categories'].items():
        print(f"  • {category}: {count} KPIs")
    print(f"\n✓ Saved to {output_file}")
    print(f"✓ Detailed report: {report_file}")

    return results

if __name__ == "__main__":
    main()
