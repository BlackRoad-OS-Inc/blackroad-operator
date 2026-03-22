# BlackRoad OS - Google Sheets with Macros

Enterprise-grade spreadsheet templates with Google Apps Script automation.

## Setup Instructions

1. **Import the CSV** to Google Sheets
2. Go to **Extensions > Apps Script**
3. Delete any existing code
4. **Paste the corresponding .gs file** contents
5. Click **Save** (Ctrl+S)
6. **Refresh** your Google Sheet
7. Look for the new **custom menu** in the menu bar

## Templates (32 Total)

### Business Operations

#### 📄 Invoice Generator
**Files:** `invoice-generator.csv` + `invoice-generator.gs`
- Auto-increment invoice numbers
- Calculate due dates from payment terms
- Send invoices via Gmail as PDF
- Track invoice status (Draft/Sent/Paid/Overdue)
- Generate monthly reports, overdue alerts

#### 💰 Expense Tracker
**Files:** `expense-tracker.csv` + `expense-tracker.gs`
- Quick add expense dialog
- Attach receipts from Google Drive
- Approval workflow (Approve/Reject)
- Mileage calculator (IRS rate $0.67/mi)
- Per diem calculator (GSA rates)
- Export for QuickBooks/Xero

#### 📊 Financial Dashboard
**Files:** `financial-dashboard.csv` + `financial-dashboard.gs`
- KPI cards with trend analysis
- Import bank CSV statements
- Cash flow forecasting, AR aging
- Budget vs actual tracking
- Auto-refresh triggers (daily/weekly)

#### 💼 Sales Pipeline
**Files:** `sales-pipeline.csv` + `sales-pipeline.gs`
- Visual pipeline stages with probability weighting
- Revenue forecasting (weighted/unweighted)
- Sales velocity metrics
- Rep performance dashboards
- Win/loss analysis, stalled deal alerts

#### 💵 Budget Planning with Scenario Modeling
**Files:** `budget-planning.csv` + `budget-planning.gs`
- Multiple budget scenarios (Best/Base/Worst case)
- Revenue forecasting with growth models
- Cash flow projections (12-month)
- Break-even analysis
- Variance analysis (Actual vs Budget)
- Department budgets, quarterly rollups
- Startup runway calculator

#### 💎 Cap Table & Investor Relations
**Files:** `cap-table.csv` + `cap-table.gs`
- Shareholder management
- Equity grant tracking with vesting schedules
- SAFE & convertible note tracking
- Round modeling (Pre-seed to Series C)
- Dilution calculator, waterfall analysis
- Option pool management
- Investor update emails

#### 📈 SaaS Metrics Dashboard
**Files:** `saas-metrics.csv` + `saas-metrics.gs`
- MRR/ARR tracking and forecasting
- Churn analysis by reason and cohort
- Customer LTV calculation
- CAC and LTV:CAC ratio
- Subscription management
- Trial expiration alerts
- Executive dashboard

---

### HR & People

#### ⏰ Time Tracking with Payroll
**Files:** `time-tracking.csv` + `time-tracking.gs`
- Clock in/out with timestamps
- Break time tracking
- Overtime calculations (40hr weekly, 8hr daily)
- Double-time support (12+ hrs/day)
- PTO/sick time requests
- Payroll export

#### 👥 HR Onboarding Workflow
**Files:** `hr-onboarding.csv` + `hr-onboarding.gs`
- 17-task checklist automation
- Individual checklist sheets per employee
- Welcome email sequences
- 30/60/90 day review reminders
- Manager notifications

#### 🎯 CRM with Email Automation
**Files:** `crm-automation.csv` + `crm-automation.gs`
- Contact management with lead scoring
- Email templates with merge fields
- Automated follow-up sequences
- Pipeline reporting, activity logging

#### 📅 Meeting Scheduler with Calendar
**Files:** `meeting-scheduler.csv` + `meeting-scheduler.gs`
- Create calendar events directly from sheet
- Recurring meeting templates
- Attendee management, availability checking
- Meeting templates (1:1, Standup, Sprint, Board)
- Meeting notes and action items
- Meeting cost calculator
- Analytics and reporting

#### 🎯 OKR Tracker (Objectives & Key Results)
**Files:** `okr-tracker.csv` + `okr-tracker.gs`
- Company, Team, Individual OKRs
- Key Results with measurable targets
- Progress tracking and scoring (0.0 - 1.0)
- Weekly check-ins
- Quarterly reviews and archiving
- Alignment visualization
- Cascading objectives

#### 👔 Applicant Tracking System (ATS)
**Files:** `applicant-tracking.csv` + `applicant-tracking.gs`
- Job requisition management
- Candidate pipeline (Applied → Hired)
- Interview scheduling with scorecards
- Offer generation and tracking
- Source analytics, time-to-hire metrics
- Hiring funnel visualization
- Automated candidate emails

#### 📊 Employee Performance Reviews
**Files:** `performance-reviews.csv` + `performance-reviews.gs`
- Annual/quarterly performance reviews
- 360-degree feedback (self, manager, peer)
- Competency ratings (10 competencies)
- Goal tracking with OKR alignment
- Calibration grid and distribution
- Performance improvement plans (PIP)
- Review document generation

#### 👥 Employee Directory & Org Chart ⭐ NEW
**Files:** `employee-directory.csv` + `employee-directory.gs`
- Complete employee directory management
- Org chart visualization by department
- Skills matrix and expertise tracking
- Birthday and anniversary alerts
- Department and location reports
- Quick search and filter
- Manager hierarchy tracking

#### 📚 Training & Certification Tracker ⭐ NEW
**Files:** `training-tracker.csv` + `training-tracker.gs`
- Training course catalog management
- Employee training assignments
- Certification tracking with expiry alerts
- Compliance training management
- Learning path creation
- Training completion reports
- Automatic renewal reminders

---

### Project & Inventory

#### 📈 Project Management with Gantt
**Files:** `project-management.csv` + `project-management.gs`
- Visual Gantt chart auto-generation
- Task dependency tracking
- Resource allocation, milestone alerts
- Progress tracking, status emails
- PDF export

#### 📦 Inventory Management
**Files:** `inventory-management.csv` + `inventory-management.gs`
- SKU/Barcode lookup
- Stock in/out with history
- Low stock alerts, reorder points
- Purchase order generation
- ABC analysis, inventory valuation

#### 📝 Contract Management
**Files:** `contract-management.csv` + `contract-management.gs`
- Contract lifecycle tracking
- Renewal/expiration alerts (60-day notice)
- E-signature status monitoring
- Amendment management
- Approval workflow, value tracking

#### 🏢 Vendor Scoring & Management
**Files:** `vendor-scoring.csv` + `vendor-scoring.gs`
- Vendor evaluation scorecards
- Weighted criteria scoring (7 criteria)
- RFP/RFI generation
- Performance monitoring, SLA tracking
- Risk assessment, compliance verification
- Vendor comparison reports
- Renewal alerts

#### 💻 IT Asset Management
**Files:** `it-asset-management.csv` + `it-asset-management.gs`
- Hardware inventory (laptops, monitors, etc.)
- Software license tracking
- Assignment to employees (check-in/out)
- Depreciation calculations
- Warranty tracking and alerts
- Maintenance scheduling
- Full audit trail

#### 🎫 Customer Support Ticketing
**Files:** `support-ticketing.csv` + `support-ticketing.gs`
- Ticket creation and tracking
- Priority management (P1-P4) with SLAs
- Agent assignment and performance
- Customer communication templates
- CSAT surveys and NPS tracking
- SLA breach alerts
- Category analysis and reporting

#### 🗺️ Product Roadmap & Sprint Planning
**Files:** `product-roadmap.csv` + `product-roadmap.gs`
- Product roadmap with quarterly planning
- RICE scoring for prioritization
- Sprint management and velocity tracking
- Burndown charts
- Release notes generation
- Capacity planning
- Feature pipeline (Backlog → Done)

#### ⚠️ Risk Register & Mitigation
**Files:** `risk-register.csv` + `risk-register.gs`
- Risk identification (11 categories)
- Probability × Impact scoring (5×5 matrix)
- Risk ratings (Critical/High/Medium/Low)
- Mitigation action tracking
- Executive summary reports
- Trend analysis
- Overdue action alerts

#### 📅 Event Planning & Management ⭐ NEW
**Files:** `event-planning.csv` + `event-planning.gs`
- Event creation and lifecycle management
- Attendee registration and check-in
- Budget tracking per event
- Task checklists with templates
- Email communication to attendees
- Venue and capacity management
- ROI analysis and reporting

---

### Sales & Marketing

#### 🔍 Competitive Intelligence Tracker ⭐ NEW
**Files:** `competitive-intelligence.csv` + `competitive-intelligence.gs`
- Competitor profiles with SWOT analysis
- Product/feature comparison matrix
- Pricing intelligence tracking
- Win/loss analysis
- Battle cards for sales
- Market position mapping
- Weekly intel digest emails

#### 💬 Customer Feedback & NPS ⭐ NEW
**Files:** `customer-feedback.csv` + `customer-feedback.gs`
- NPS (Net Promoter Score) surveys
- CSAT (Customer Satisfaction) tracking
- CES (Customer Effort Score)
- Feedback categorization and tagging
- Sentiment analysis
- Response management workflow
- Trend analysis and reporting

---

### Marketing

#### 📅 Content Calendar & Social Media
**Files:** `content-calendar.csv` + `content-calendar.gs`
- Content planning across 8 platforms
- Campaign management
- Approval workflow (Idea → Published)
- Weekly/monthly calendar views
- Pipeline view (Kanban-style)
- Content ideas generator
- Optimal posting times
- Hashtag suggestions

---

### Compliance

#### 🏥 HIPAA Compliance
**Files:** `hipaa-compliance.csv` + `hipaa-compliance.gs`
- PHI access logging (Article 15)
- Business Associate Agreement tracking
- Security incident management
- Breach notification workflow (72-hour)
- Training compliance monitoring
- Annual audit checklists

#### 📈 SOX Compliance
**Files:** `sox-compliance.csv` + `sox-compliance.gs`
- Control testing automation
- Deficiency management (SD/MW tracking)
- Evidence collection
- Segregation of duties matrix
- Management certification workflow
- Quarter/year-end close checklists

#### 🇪🇺 GDPR Compliance
**Files:** `gdpr-compliance.csv` + `gdpr-compliance.gs`
- Data Subject Request (DSR) tracking
- Processing activities register (Article 30)
- Data breach notification (72-hour DPA, individual)
- Consent management
- DPIA templates
- Cross-border transfer tracking

---

### Productivity & Organization

#### 📁 Google Drive Organizer
**Files:** `drive-organizer.csv` + `drive-organizer.gs`
- Scan entire Drive for all files
- Auto-categorize by file type and keywords
- Duplicate file detection
- Create BlackRoad folder structure (29 folders)
- Batch move files to organized folders
- Archive old files (1+ year)
- Storage analytics and reporting

---

## Template Summary

| # | Template | Menu | Key Features |
|---|----------|------|--------------|
| 1 | Invoice Generator | 📄 Invoice | Auto-numbering, PDF email |
| 2 | Expense Tracker | 💰 Expenses | Approval workflow, mileage |
| 3 | Financial Dashboard | 📊 Finance | KPIs, bank import |
| 4 | Sales Pipeline | 💼 Sales | Forecasting, velocity |
| 5 | Budget Planning | 💵 Budget | Scenarios, runway calc |
| 6 | Cap Table | 💎 Cap Table | Equity, SAFEs, waterfall |
| 7 | Time Tracking | ⏰ Time | Clock in/out, overtime |
| 8 | HR Onboarding | 👥 HR | 17-task checklist |
| 9 | CRM Automation | 🎯 CRM | Lead scoring, sequences |
| 10 | Meeting Scheduler | 📅 Meetings | Calendar sync, templates |
| 11 | OKR Tracker | 🎯 OKR Tools | Objectives, key results |
| 12 | Applicant Tracking | 👥 Recruiting | Pipeline, interviews |
| 13 | Project Management | 📈 Projects | Gantt, dependencies |
| 14 | Inventory Management | 📦 Inventory | SKU lookup, PO generation |
| 15 | Contract Management | 📝 Contracts | Lifecycle, renewals |
| 16 | Vendor Scoring | 🏢 Vendors | Scorecards, RFP |
| 17 | IT Asset Management | 💻 IT Assets | Hardware, software, depreciation |
| 18 | Support Ticketing | 🎫 Support | SLAs, CSAT, agents |
| 19 | HIPAA Compliance | 🏥 HIPAA | PHI logging, BAAs |
| 20 | SOX Compliance | 📈 SOX | Control testing |
| 21 | GDPR Compliance | 🇪🇺 GDPR | DSR tracking |
| 22 | Drive Organizer | 📁 Drive | File organization |
| 23 | SaaS Metrics | 📈 SaaS Metrics | MRR, churn, LTV |
| 24 | Performance Reviews | 📊 Performance | 360 feedback, goals |
| 25 | Product Roadmap | 🗺️ Roadmap | RICE scoring, sprints |
| 26 | Risk Register | ⚠️ Risk Register | Risk matrix, mitigation |
| 27 | Content Calendar | 📅 Content | Multi-platform, campaigns |
| 28 | Employee Directory | 👥 Directory | Org chart, skills matrix |
| 29 | Training Tracker | 📚 Training | Certifications, compliance |
| 30 | Event Planning | 📅 Events | Attendees, budget, tasks |
| 31 | Competitive Intel | 🔍 Intel | SWOT, battle cards, win/loss |
| 32 | Customer Feedback | 💬 Feedback | NPS, CSAT, sentiment |

---

## BlackRoad Folder Structure

The Drive Organizer creates this structure:

```
BlackRoad OS/
├── Corporate/
│   ├── Formation
│   ├── Legal
│   ├── Tax
│   └── Compliance
├── Finance/
│   ├── Invoices
│   ├── Expenses
│   └── Reports
├── HR/
│   ├── Recruiting
│   ├── Onboarding
│   └── Policies
├── Engineering/
│   ├── Architecture
│   ├── Documentation
│   └── Specs
├── Marketing/
│   ├── Pitch Decks
│   ├── Whitepapers
│   └── Brand
├── Sales/
│   ├── Proposals
│   ├── Contracts
│   └── Pipeline
├── Products/
│   ├── Prism Console
│   ├── Agent Swarm
│   └── Documentation
├── Templates/
│   ├── Sheets
│   ├── Docs
│   └── Slides
├── Archive/
│   ├── 2024
│   └── 2023
└── Personal/
    ├── Resumes
    └── Notes
```

## Security Notes

- Scripts run with **your permissions**
- Email sending uses **your Gmail**
- Grant permissions when prompted
- Review code before running

## Customization

Edit CONFIG sections in each script:

```javascript
const CONFIG = {
  COMPANY_NAME: 'BlackRoad OS, Inc.',
  SENDER_NAME: 'Your Name',
  // ... other settings
};
```

## Troubleshooting

**Menu not appearing?**
- Refresh the page
- Check Extensions > Apps Script for errors

**Permissions error?**
- Click through authorization prompts
- Check your Google account permissions

**Email not sending?**
- Check daily Gmail sending limits (500/day)
- Verify recipient email addresses

**Calendar events not syncing?**
- Ensure calendar permissions granted
- Check timezone settings in CONFIG

---

*Generated by BlackRoad OS, Inc.*
