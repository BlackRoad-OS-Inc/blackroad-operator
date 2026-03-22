# 📊 Integration Guide: Education Pack

This document describes how `blackroad-os-pack-education` integrates with other parts of BlackRoad OS.

## 🕹️ Integration: `blackroad-os-prism-console` (Learning Dashboards)

The Education Pack exposes progress data for visualization in the Prism Console.

### Data Exposed
- **Course enrollment status** - active courses and completion %
- **Learning streaks** - consecutive days of learning activity
- **Skill trees** - visual representation of mastered concepts
- **Recent activity** - last lessons, activities, scores
- **Achievements** - milestones and badges earned

### API Contract
```javascript
// Get learner dashboard data
GET /education/learner/{learnerId}/dashboard
Response: {
  activeCourses: [
    {
      courseId: string,
      title: string,
      progress: number, // 0-100
      lastAccessed: timestamp,
      nextItem: { itemId, itemType, title }
    }
  ],
  recentActivity: [...],
  achievements: [...],
  streakDays: number
}
```

### Event Hooks
The Education Pack emits events to Prism Console:
- `course-started` - When learner starts a new course
- `lesson-completed` - When a lesson is completed
- `activity-submitted` - When activity work is submitted
- `assessment-completed` - When assessment is finished
- `mastery-achieved` - When learner achieves mastery on content
- `milestone-reached` - Significant progress milestones

## 🧾 Integration: `blackroad-os-archive` (Records & Compliance)

Critical learning events are mirrored to the Archive for audit trails.

### Archivable Events
- **Course completion** - with timestamp, final score, certificate data
- **Required training completion** - compliance-tagged courses
- **Certifications issued** - formal credentials
- **High-stakes assessments** - exams, licensing tests

### Archive Tags
```javascript
{
  category: "education",
  subcategory: "completion" | "certification" | "required-training",
  learnerId: string, // reference, not PII
  itemId: string,
  complianceLevel: "none" | "standard" | "regulated",
  retentionYears: number
}
```

### Archive Flow
When a learner completes a compliance-tagged course:
1. Education Pack marks course as completed
2. Triggers archive flow: `flow:education:archive-completion`
3. Archive creates immutable record with proper tags
4. Returns archive reference ID
5. Education Pack stores archive reference in progress metadata

## 💼 Integration: Other Packs

Education Pack can host courses from any Pack:

### Pack-Specific Courses
- `blackroad-os-pack-finance` → Financial literacy courses
- `blackroad-os-pack-legal` → Compliance training
- `blackroad-os-pack-infra` → DevOps academy
- `blackroad-os-pack-creator-studio` → Content creation workshops

### Course Registration Pattern
```javascript
// Pack registers course with Education Pack
{
  courseId: "course:finance-101",
  packId: "blackroad-os-pack-finance",
  integration: {
    progressWebhook: "https://api.pack.finance/progress",
    completionWebhook: "https://api.pack.finance/completed",
    dataAccess: ["financial-tools", "calculators"]
  }
}
```

## 🧠 Integration: `blackroad-os-core`

Core provides the execution engine for learning flows.

### What Education Pack Provides
- Flow definitions (JSON)
- Schema definitions (JSON Schema)
- Content models

### What Core Provides
- Flow execution engine
- State management
- User authentication/authorization
- Data persistence

## 🖥️ Integration: `blackroad-os-web`

Web provides UI rendering for learning content.

### UI Components Needed
- Course catalog browser
- Lesson viewer (renders markdown/html/video)
- Activity interface (quiz taker, code editor, submission form)
- Progress tracker
- Certificate viewer

### Data Flow
1. Web requests course data from Core
2. Core loads course from Education Pack schemas
3. Core tracks progress using Education Pack models
4. Web renders content and collects learner input
5. Core updates progress and triggers flows
6. Education Pack agents provide feedback
7. Updates flow to Prism Console and Archive as needed
