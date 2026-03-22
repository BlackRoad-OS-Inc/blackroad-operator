"""
Example usage of the Traffic Light Template Orchestration system.

This script demonstrates how to use the traffic light orchestrator for
status tracking and template routing.
"""

from pathlib import Path
import sys

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from orchestrator.traffic_light import (
    get_orchestrator,
    LightStatus,
    TrafficLightTemplate,
)


def example_basic_usage():
    """Demonstrate basic traffic light usage."""
    print("=" * 60)
    print("Example 1: Basic Usage")
    print("=" * 60)
    
    # Get the orchestrator instance
    orchestrator = get_orchestrator()
    
    # Show summary
    summary = orchestrator.get_status_summary()
    print("\nTemplate Summary:")
    for status, count in summary.items():
        emoji = {"red": "🔴", "yellow": "🟡", "green": "🟢"}[status]
        print(f"  {emoji} {status.upper()}: {count} templates")
    
    # Select a red template
    print("\n" + "-" * 60)
    red_template = orchestrator.select_template(LightStatus.RED, "blocked_task")
    if red_template:
        print(f"\nSelected RED template: {red_template.emoji} {red_template.name}")
        print(f"Description: {red_template.description}")
    
    # Select a yellow template
    yellow_template = orchestrator.select_template(LightStatus.YELLOW, "in_progress")
    if yellow_template:
        print(f"\nSelected YELLOW template: {yellow_template.emoji} {yellow_template.name}")
        print(f"Description: {yellow_template.description}")
    
    # Select a green template
    green_template = orchestrator.select_template(LightStatus.GREEN, "completed")
    if green_template:
        print(f"\nSelected GREEN template: {green_template.emoji} {green_template.name}")
        print(f"Description: {green_template.description}")


def example_criteria_routing():
    """Demonstrate criteria-based routing."""
    print("\n\n" + "=" * 60)
    print("Example 2: Criteria-Based Routing")
    print("=" * 60)
    
    orchestrator = get_orchestrator()
    
    # Example 1: Critical blocker (should route to RED)
    print("\nScenario 1: Critical Blocker")
    criteria1 = ["Critical blocker identified", "Dependencies unavailable"]
    template1 = orchestrator.route_by_criteria(criteria1)
    if template1:
        print(f"  Criteria: {criteria1}")
        print(f"  Routed to: {template1.emoji} {template1.status.value.upper()} - {template1.name}")
    
    # Example 2: Work in progress (should route to YELLOW)
    print("\nScenario 2: Work In Progress")
    criteria2 = ["Task is actively being worked on", "Waiting for review or approval"]
    template2 = orchestrator.route_by_criteria(criteria2)
    if template2:
        print(f"  Criteria: {criteria2}")
        print(f"  Routed to: {template2.emoji} {template2.status.value.upper()} - {template2.name}")
    
    # Example 3: All checks passed (should route to GREEN)
    print("\nScenario 3: Success")
    criteria3 = ["All checks passed", "Tests passing", "Ready to proceed"]
    template3 = orchestrator.route_by_criteria(criteria3)
    if template3:
        print(f"  Criteria: {criteria3}")
        print(f"  Routed to: {template3.emoji} {template3.status.value.upper()} - {template3.name}")
    
    # Example 4: Priority routing (RED overrides others)
    print("\nScenario 4: Priority Routing (Multiple criteria)")
    criteria4 = [
        "Critical blocker identified",  # RED
        "Task is actively being worked on",  # YELLOW
        "All checks passed"  # GREEN
    ]
    template4 = orchestrator.route_by_criteria(criteria4)
    if template4:
        print(f"  Criteria: {criteria4}")
        print(f"  Routed to: {template4.emoji} {template4.status.value.upper()} - {template4.name}")
        print(f"  Note: RED criteria takes priority over YELLOW and GREEN")


def example_status_meters():
    """Demonstrate status meter rendering."""
    print("\n\n" + "=" * 60)
    print("Example 3: Status Meters")
    print("=" * 60)
    
    orchestrator = get_orchestrator()
    
    print("\nRED Status Meters:")
    for level in [1, 3, 5]:
        meter = orchestrator.render_status_meter(LightStatus.RED, level)
        print(f"  Level {level}/5: {meter}")
    
    print("\nYELLOW Status Meters:")
    for level in [1, 3, 5]:
        meter = orchestrator.render_status_meter(LightStatus.YELLOW, level)
        print(f"  Level {level}/5: {meter}")
    
    print("\nGREEN Status Meters:")
    for level in [1, 3, 5]:
        meter = orchestrator.render_status_meter(LightStatus.GREEN, level)
        print(f"  Level {level}/5: {meter}")


def example_custom_template():
    """Demonstrate registering a custom template."""
    print("\n\n" + "=" * 60)
    print("Example 4: Custom Template Registration")
    print("=" * 60)
    
    orchestrator = get_orchestrator()
    
    # Create a custom template
    custom_template = TrafficLightTemplate(
        name="security_alert",
        status=LightStatus.RED,
        template_path=Path("templates/traffic_light/custom_security.md"),
        description="Security vulnerability requiring immediate action",
        emoji="🔴",
        criteria=[
            "Security vulnerability detected",
            "CVE identified",
            "Zero-day exploit"
        ]
    )
    
    # Register it
    initial_count = len(orchestrator.get_templates(LightStatus.RED))
    orchestrator.register_template(custom_template)
    new_count = len(orchestrator.get_templates(LightStatus.RED))
    
    print(f"\nRegistered custom template: {custom_template.name}")
    print(f"RED templates before: {initial_count}")
    print(f"RED templates after: {new_count}")
    
    # Test routing to the custom template
    criteria = ["Security vulnerability detected", "Zero-day exploit"]
    routed = orchestrator.route_by_criteria(criteria)
    if routed and routed.name == "security_alert":
        print(f"\nSuccessfully routed to custom template!")
        print(f"  Template: {routed.emoji} {routed.name}")
        print(f"  Criteria matched: {criteria}")


def example_integration_scenario():
    """Demonstrate a real-world integration scenario."""
    print("\n\n" + "=" * 60)
    print("Example 5: Real-World Integration Scenario")
    print("=" * 60)
    
    orchestrator = get_orchestrator()
    
    # Simulate a deployment workflow
    print("\nDeployment Workflow Simulation:")
    print("-" * 60)
    
    # Stage 1: Deployment starting
    print("\n1. Deployment Starting")
    meter1 = orchestrator.render_status_meter(LightStatus.YELLOW, 1)
    print(f"   Status: {meter1}")
    criteria1 = ["Task is actively being worked on"]
    template1 = orchestrator.route_by_criteria(criteria1)
    print(f"   Template: {template1.emoji} {template1.name}")
    
    # Stage 2: Tests running
    print("\n2. Tests Running")
    meter2 = orchestrator.render_status_meter(LightStatus.YELLOW, 3)
    print(f"   Status: {meter2}")
    
    # Stage 3: Test failed! (escalate to RED)
    print("\n3. Tests Failed!")
    meter3 = orchestrator.render_status_meter(LightStatus.RED, 4)
    print(f"   Status: {meter3}")
    criteria3 = ["Deployment failed validation", "Breaking changes detected"]
    template3 = orchestrator.route_by_criteria(criteria3)
    print(f"   Template: {template3.emoji} {template3.name}")
    print(f"   Action: Rollback required!")
    
    # Stage 4: After fix - tests passing
    print("\n4. After Fix - Tests Passing")
    meter4 = orchestrator.render_status_meter(LightStatus.GREEN, 4)
    print(f"   Status: {meter4}")
    criteria4 = ["All checks passed", "Tests passing"]
    template4 = orchestrator.route_by_criteria(criteria4)
    print(f"   Template: {template4.emoji} {template4.name}")
    
    # Stage 5: Deployment complete
    print("\n5. Deployment Complete")
    meter5 = orchestrator.render_status_meter(LightStatus.GREEN, 5)
    print(f"   Status: {meter5}")
    print(f"   ✅ Success!")


def main():
    """Run all examples."""
    print("\n" + "=" * 60)
    print("Traffic Light Template Orchestration - Examples")
    print("=" * 60)
    
    example_basic_usage()
    example_criteria_routing()
    example_status_meters()
    example_custom_template()
    example_integration_scenario()
    
    print("\n\n" + "=" * 60)
    print("All examples completed successfully!")
    print("=" * 60)
    print("\nFor more information, see:")
    print("  - templates/traffic_light/README.md")
    print("  - orchestrator/traffic_light.py")
    print("  - tests/test_traffic_light.py")
    print()


if __name__ == "__main__":
    main()
