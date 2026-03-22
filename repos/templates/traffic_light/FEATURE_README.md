# 🚦 Traffic Light Template Orchestration

> Status tracking with Redlight, GreenLight, and YellowLight templates

## What is it?

The Traffic Light Template Orchestration system provides a standardized, visual way to track work status using the familiar traffic light metaphor:

- 🔴 **RedLight**: Critical issues, blockers, failures
- 🟡 **YellowLight**: In progress, warnings, needs attention  
- 🟢 **GreenLight**: Success, complete, approved

## Quick Start

### Python
```python
from orchestrator.traffic_light import get_orchestrator, LightStatus

# Get orchestrator
orchestrator = get_orchestrator()

# Route based on criteria
template = orchestrator.route_by_criteria([
    "Critical blocker identified",
    "System failure"
])

# Render status meter
meter = orchestrator.render_status_meter(LightStatus.RED, level=4)
print(meter)  # 🔴🔴🔴🔴⚪️
```

### CLI
```bash
# List templates
brc traffic-light list

# Select template
brc traffic-light select --status red --name blocked_task

# Route by criteria
brc traffic-light route --criteria "Critical blocker identified"

# Show summary
brc traffic-light summary
```

## Templates

### 🔴 RedLight (Critical)
- **blocked_task** - Task blocked by critical issue
- **failed_deployment** - Deployment failure requiring rollback

### 🟡 YellowLight (Warning)
- **in_progress** - Active work in progress
- **warning_state** - Performance or resource warning

### 🟢 GreenLight (Success)
- **completed** - Task successfully completed
- **approved** - Work reviewed and approved

## Features

✨ **Criteria-Based Routing** - Automatic template selection  
📊 **Status Meters** - Visual progress indicators  
🔄 **Priority Handling** - Red > Yellow > Green  
🔌 **Integration Ready** - GitHub, ClickUp, Slack  
📝 **Extensible** - Custom templates supported  
🧪 **Well-Tested** - Comprehensive test suite  
📚 **Documented** - Complete guides and examples  

## Integration Examples

### GitHub Actions
```yaml
- name: Check Status
  run: |
    if [ "${{ job.status }}" = "failure" ]; then
      brc traffic-light select -s red -n failed_deployment
    else
      brc traffic-light select -s green -n completed
    fi
```

### ClickUp Automation
- Status = Blocked → Apply RedLight template
- Status = In Progress → Apply YellowLight template  
- Status = Complete → Apply GreenLight template

### Python Integration
```python
# In bot orchestrator
response = bot.run(task)

if response.risks and any("critical" in r.lower() for r in response.risks):
    template = get_orchestrator().select_template(LightStatus.RED)
elif response.elapsed_ms > slo_threshold:
    template = get_orchestrator().select_template(LightStatus.YELLOW)
else:
    template = get_orchestrator().select_template(LightStatus.GREEN)
```

## File Structure

```
orchestrator/
  └── traffic_light.py          # Core orchestration engine

templates/traffic_light/
  ├── README.md                  # Template documentation
  ├── redlight_blocked.md        # Blocked task template
  ├── redlight_failed_deploy.md # Failed deployment
  ├── yellowlight_progress.md   # Work in progress
  ├── yellowlight_warning.md    # Warning state
  ├── greenlight_complete.md    # Completed work
  └── greenlight_approved.md    # Approved work

cli/
  └── traffic_light_cli.py      # CLI commands

tests/
  └── test_traffic_light.py     # Test suite

docs/
  ├── TRAFFIC_LIGHT_GUIDE.md    # Complete guide
  ├── traffic_light_architecture.md  # Architecture
  └── traffic_light_quickref.md # Quick reference

examples/
  └── traffic_light_examples.py # Usage examples
```

## Documentation

📘 **[Complete Guide](docs/TRAFFIC_LIGHT_GUIDE.md)** - Full documentation  
🏗️ **[Architecture](docs/traffic_light_architecture.md)** - System design  
⚡ **[Quick Reference](docs/traffic_light_quickref.md)** - Common tasks  
📋 **[Templates](templates/traffic_light/README.md)** - Template docs  
💻 **[Examples](examples/traffic_light_examples.py)** - Code examples  

## API Reference

### TrafficLightOrchestrator

```python
class TrafficLightOrchestrator:
    def register_template(template: TrafficLightTemplate)
    def get_templates(status: LightStatus) -> List[TrafficLightTemplate]
    def select_template(status: LightStatus, name: str = None) -> TrafficLightTemplate
    def route_by_criteria(criteria: List[str]) -> TrafficLightTemplate
    def get_status_summary() -> Dict[str, int]
    def render_status_meter(status: LightStatus, level: int) -> str
```

### CLI Commands

```bash
brc traffic-light list [--status STATUS]
brc traffic-light select --status STATUS [--name NAME] [--output FILE]
brc traffic-light route --criteria CRITERIA [--output FILE]
brc traffic-light summary
brc traffic-light meter --status STATUS [--level LEVEL]
brc traffic-light info --status STATUS --name NAME
brc traffic-light register --name NAME --status STATUS --path PATH --description DESC
```

## Examples

Run the examples:
```bash
python examples/traffic_light_examples.py
```

Sample output:
```
Example 1: Basic Usage
  🔴 RED: 2 templates
  🟡 YELLOW: 2 templates
  🟢 GREEN: 2 templates

Example 2: Criteria-Based Routing
  Criteria: ['Critical blocker identified']
  Routed to: 🔴 RED - blocked_task

Example 3: Status Meters
  Level 3/5: 🔴🔴🔴⚪️⚪️
```

## Testing

Run tests:
```bash
pytest tests/test_traffic_light.py -v
```

## Best Practices

1. 🔴 **Use RED sparingly** - Only for truly critical issues
2. 🟡 **Update YELLOW regularly** - Keep progress visible
3. 🟢 **Celebrate GREEN** - Mark completions clearly
4. 🤖 **Automate transitions** - Use CI/CD to update status
5. 📋 **Document criteria** - Make routing rules explicit
6. 📊 **Monitor patterns** - Track usage to identify issues

## Contributing

To add a custom template:

```python
from orchestrator.traffic_light import TrafficLightTemplate, LightStatus
from pathlib import Path

template = TrafficLightTemplate(
    name="custom_template",
    status=LightStatus.RED,
    template_path=Path("templates/custom.md"),
    description="My custom template",
    emoji="🔴",
    criteria=["My criterion"]
)

orchestrator = get_orchestrator()
orchestrator.register_template(template)
```

## Support

- 📝 Create issue with label `traffic-light`
- 💬 Ask in #ops-support
- 📚 Check documentation first

## Version

**1.0.0** (2025-12-24)

Initial release with:
- Core orchestration engine
- 6 default templates
- CLI commands
- Full documentation
- Integration examples

---

**Part of:** BlackRoad OS Prism Enterprise  
**Maintainer:** BlackRoad OS Team  
**License:** See LICENSE file
