# Traffic Light Template Orchestration System

## Overview

The Traffic Light orchestration system provides a standardized way to track and manage work status using the familiar traffic light metaphor:

- 🔴 **RedLight**: Critical issues, blockers, failures
- 🟡 **YellowLight**: In progress, warnings, needs attention  
- 🟢 **GreenLight**: Success, complete, approved

## Quick Start

### Python Usage

```python
from orchestrator.traffic_light import get_orchestrator, LightStatus

# Get the orchestrator
orchestrator = get_orchestrator()

# Select a template by status
template = orchestrator.select_template(LightStatus.RED, "blocked_task")

# Route based on criteria
criteria = ["Critical blocker identified", "Dependencies unavailable"]
template = orchestrator.route_by_criteria(criteria)

# Render status meter
meter = orchestrator.render_status_meter(LightStatus.YELLOW, level=3)
print(meter)  # 🟡🟡🟡⚪️⚪️
```

### CLI Usage

```bash
# List available templates
brc traffic-light:list

# Select a template
brc traffic-light:select --status red --name blocked_task

# Get status summary
brc traffic-light:summary
```

## Templates

### RedLight Templates 🔴

**Critical/Blocked States**

1. **blocked_task** - For tasks blocked by dependencies or issues
   - Use when: Critical blocker prevents progress
   - Triggers: `blocked` label, failed dependencies
   - Template: `redlight_blocked.md`

2. **failed_deployment** - For deployment failures
   - Use when: Deployment fails and needs rollback
   - Triggers: CI/CD failure, health check failure
   - Template: `redlight_failed_deploy.md`

### YellowLight Templates 🟡

**In Progress/Warning States**

1. **in_progress** - For active work in progress
   - Use when: Task is actively being worked on
   - Triggers: `in-progress` label, assigned task
   - Template: `yellowlight_progress.md`

2. **warning_state** - For warning conditions
   - Use when: System metrics show warnings
   - Triggers: Threshold warnings, non-critical alerts
   - Template: `yellowlight_warning.md`

### GreenLight Templates 🟢

**Success/Complete States**

1. **completed** - For completed tasks
   - Use when: All work is done and verified
   - Triggers: All checks passed, tests green
   - Template: `greenlight_complete.md`

2. **approved** - For approved work
   - Use when: Work is reviewed and approved
   - Triggers: All approvals collected, ready to merge
   - Template: `greenlight_approved.md`

## Integration

### GitHub Actions

Add to `.github/workflows/traffic-light.yml`:

```yaml
name: Traffic Light Status
on:
  issues:
    types: [labeled]
  pull_request:
    types: [labeled]

jobs:
  status-template:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Apply Template
        run: |
          python -c "
          from orchestrator.traffic_light import get_orchestrator, LightStatus
          
          label = '${{ github.event.label.name }}'
          status_map = {
            'blocked': LightStatus.RED,
            'in-progress': LightStatus.YELLOW, 
            'approved': LightStatus.GREEN
          }
          
          if label in status_map:
            orchestrator = get_orchestrator()
            template = orchestrator.select_template(status_map[label])
            print(f'Apply template: {template.name}')
          "
```

### Bot Integration

The traffic light system integrates with the bot orchestrator:

```python
from orchestrator.traffic_light import get_orchestrator, LightStatus
from orchestrator.orchestrator import route

# Route task to bot and check status
response = route(task, "Treasury-BOT")

# Determine traffic light status based on response
if response.risks and any("critical" in r.lower() for r in response.risks):
    status = LightStatus.RED
elif response.elapsed_ms and response.p95_target and response.elapsed_ms > response.p95_target:
    status = LightStatus.YELLOW
else:
    status = LightStatus.GREEN

# Get appropriate template
template = get_orchestrator().select_template(status)
```

### ClickUp Integration

Create automation rules:
- **Status = Blocked** → Apply RedLight template + notify owner
- **Status = In Progress** → Apply YellowLight template + start timer
- **Status = Complete** → Apply GreenLight template + close task

### Slack Integration

Create slash commands:
- `/traffic-light red` - Post RedLight template
- `/traffic-light yellow` - Post YellowLight template
- `/traffic-light green` - Post GreenLight template

## Status Meter

The system uses emoji-based status meters for visual tracking:

```
🔴🔴🔴🔴🔴  - Critical (Level 5)
🔴🔴🔴🔴⚪️  - High severity (Level 4)
🔴🔴🔴⚪️⚪️  - Medium severity (Level 3)
🔴🔴⚪️⚪️⚪️  - Low severity (Level 2)
🔴⚪️⚪️⚪️⚪️  - Minimal (Level 1)

🟡🟡🟡🟡🟡  - Significant progress (Level 5)
🟡🟡🟡⚪️⚪️  - Mid progress (Level 3)
🟡⚪️⚪️⚪️⚪️  - Just started (Level 1)

🟢🟢🟢🟢🟢✅ - Fully complete (Level 5)
🟢🟢🟢🟢⚪️  - Almost there (Level 4)
🟢🟢🟢⚪️⚪️  - Good progress (Level 3)
```

## Routing Logic

The orchestrator routes to templates based on priority:

1. **RedLight (Highest Priority)**: Any critical condition triggers red
2. **YellowLight (Medium Priority)**: Warnings and in-progress states
3. **GreenLight (Default)**: Success states when no issues present

### Criteria-Based Routing

```python
# Define criteria
criteria = [
    "Critical blocker identified",  # → RedLight
    "Task is actively being worked on",  # → YellowLight (if no red criteria)
    "All checks passed"  # → GreenLight (if no red/yellow criteria)
]

# Route automatically
template = orchestrator.route_by_criteria(criteria)
```

## Customization

### Adding New Templates

```python
from orchestrator.traffic_light import TrafficLightTemplate, LightStatus
from pathlib import Path

# Create custom template
custom_template = TrafficLightTemplate(
    name="custom_state",
    status=LightStatus.RED,
    template_path=Path("templates/traffic_light/custom.md"),
    description="Custom critical state",
    emoji="🔴",
    criteria=["Custom condition met"]
)

# Register it
orchestrator = get_orchestrator()
orchestrator.register_template(custom_template)
```

### Custom Status Meters

```python
# Create custom meter
meter = orchestrator.render_status_meter(
    status=LightStatus.YELLOW,
    level=4  # 4 out of 5 filled
)
```

## Best Practices

1. **Use RedLight sparingly** - Only for truly critical issues
2. **Update YellowLight regularly** - Keep progress visible
3. **Celebrate GreenLight** - Mark completions clearly
4. **Automate transitions** - Use CI/CD to update status
5. **Document criteria** - Make routing rules explicit
6. **Monitor patterns** - Track how often each state is used

## API Reference

### TrafficLightOrchestrator

Main orchestrator class for managing templates.

**Methods:**
- `register_template(template)` - Add a new template
- `get_templates(status)` - Get all templates for a status
- `select_template(status, name=None)` - Select specific template
- `route_by_criteria(criteria_met)` - Auto-route based on criteria
- `get_status_summary()` - Get template counts by status
- `render_status_meter(status, level)` - Create visual meter

### LightStatus Enum

Status values: `RED`, `YELLOW`, `GREEN`

### TrafficLightTemplate Dataclass

Template definition with:
- `name` - Unique template identifier
- `status` - LightStatus value
- `template_path` - Path to template file
- `description` - Human-readable description
- `emoji` - Status emoji
- `criteria` - List of routing criteria

## Examples

See `tests/test_traffic_light.py` for comprehensive examples.

## Support

For questions or issues with the traffic light system:
- Create an issue with label `traffic-light`
- Contact the DevOps team in #ops-support
- Refer to the main orchestrator documentation

---

**Version:** 1.0.0  
**Last Updated:** 2025-12-24  
**Maintainer:** BlackRoad OS Team
