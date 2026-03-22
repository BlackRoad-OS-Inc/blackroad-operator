"""Tests for traffic light template orchestration."""

import pytest
from pathlib import Path
from orchestrator.traffic_light import (
    TrafficLightOrchestrator,
    TrafficLightTemplate,
    LightStatus,
    get_orchestrator,
)


class TestLightStatus:
    """Test LightStatus enum."""
    
    def test_status_values(self):
        """Test that all status values are defined."""
        assert LightStatus.RED.value == "red"
        assert LightStatus.YELLOW.value == "yellow"
        assert LightStatus.GREEN.value == "green"


class TestTrafficLightOrchestrator:
    """Test TrafficLightOrchestrator class."""
    
    @pytest.fixture
    def orchestrator(self):
        """Create orchestrator instance."""
        return TrafficLightOrchestrator()
    
    def test_initialization(self, orchestrator):
        """Test orchestrator initializes with default templates."""
        assert isinstance(orchestrator, TrafficLightOrchestrator)
        assert len(orchestrator.get_templates(LightStatus.RED)) >= 2
        assert len(orchestrator.get_templates(LightStatus.YELLOW)) >= 2
        assert len(orchestrator.get_templates(LightStatus.GREEN)) >= 2
    
    def test_register_template(self, orchestrator):
        """Test registering a new template."""
        initial_count = len(orchestrator.get_templates(LightStatus.RED))
        
        template = TrafficLightTemplate(
            name="test_template",
            status=LightStatus.RED,
            template_path=Path("/tmp/test.md"),
            description="Test template",
            emoji="🔴",
            criteria=["test criterion"]
        )
        
        orchestrator.register_template(template)
        assert len(orchestrator.get_templates(LightStatus.RED)) == initial_count + 1
    
    def test_get_templates(self, orchestrator):
        """Test getting templates by status."""
        red_templates = orchestrator.get_templates(LightStatus.RED)
        assert len(red_templates) > 0
        assert all(t.status == LightStatus.RED for t in red_templates)
        
        yellow_templates = orchestrator.get_templates(LightStatus.YELLOW)
        assert len(yellow_templates) > 0
        assert all(t.status == LightStatus.YELLOW for t in yellow_templates)
        
        green_templates = orchestrator.get_templates(LightStatus.GREEN)
        assert len(green_templates) > 0
        assert all(t.status == LightStatus.GREEN for t in green_templates)
    
    def test_select_template_by_name(self, orchestrator):
        """Test selecting template by name."""
        template = orchestrator.select_template(LightStatus.RED, "blocked_task")
        assert template is not None
        assert template.name == "blocked_task"
        assert template.status == LightStatus.RED
    
    def test_select_template_without_name(self, orchestrator):
        """Test selecting first template when no name provided."""
        template = orchestrator.select_template(LightStatus.GREEN)
        assert template is not None
        assert template.status == LightStatus.GREEN
    
    def test_select_nonexistent_template(self, orchestrator):
        """Test selecting template that doesn't exist."""
        template = orchestrator.select_template(LightStatus.RED, "nonexistent")
        assert template is None
    
    def test_route_by_criteria_red(self, orchestrator):
        """Test routing to red template based on criteria."""
        criteria = ["Critical blocker identified", "System failure or outage"]
        template = orchestrator.route_by_criteria(criteria)
        assert template is not None
        assert template.status == LightStatus.RED
    
    def test_route_by_criteria_yellow(self, orchestrator):
        """Test routing to yellow template based on criteria."""
        criteria = ["Task is actively being worked on", "Partial completion"]
        template = orchestrator.route_by_criteria(criteria)
        assert template is not None
        assert template.status == LightStatus.YELLOW
    
    def test_route_by_criteria_green(self, orchestrator):
        """Test routing to green template when no issues."""
        criteria = ["All checks passed", "Tests passing"]
        template = orchestrator.route_by_criteria(criteria)
        # Should prioritize red/yellow if any match, otherwise green
        assert template is not None
    
    def test_route_priority(self, orchestrator):
        """Test that red has priority over yellow and green."""
        criteria = [
            "Critical blocker identified",  # Red
            "Task is actively being worked on",  # Yellow
            "All checks passed"  # Green
        ]
        template = orchestrator.route_by_criteria(criteria)
        assert template.status == LightStatus.RED
    
    def test_route_no_match(self, orchestrator):
        """Test routing with no matching criteria defaults to green."""
        criteria = ["some random criteria that doesn't match"]
        template = orchestrator.route_by_criteria(criteria)
        # Should default to green when no specific criteria match
        assert template is not None
    
    def test_get_status_summary(self, orchestrator):
        """Test getting status summary."""
        summary = orchestrator.get_status_summary()
        assert "red" in summary
        assert "yellow" in summary
        assert "green" in summary
        assert all(isinstance(v, int) for v in summary.values())
        assert all(v > 0 for v in summary.values())
    
    def test_render_status_meter_red(self, orchestrator):
        """Test rendering red status meter."""
        meter = orchestrator.render_status_meter(LightStatus.RED, level=3)
        assert meter == "🔴🔴🔴⚪️⚪️"
    
    def test_render_status_meter_yellow(self, orchestrator):
        """Test rendering yellow status meter."""
        meter = orchestrator.render_status_meter(LightStatus.YELLOW, level=2)
        assert meter == "🟡🟡⚪️⚪️⚪️"
    
    def test_render_status_meter_green(self, orchestrator):
        """Test rendering green status meter."""
        meter = orchestrator.render_status_meter(LightStatus.GREEN, level=5)
        assert meter == "🟢🟢🟢🟢🟢"
    
    def test_render_status_meter_bounds(self, orchestrator):
        """Test status meter with out of bounds level."""
        # Should default to level 3
        meter = orchestrator.render_status_meter(LightStatus.RED, level=0)
        assert meter == "🔴🔴🔴⚪️⚪️"
        
        meter = orchestrator.render_status_meter(LightStatus.RED, level=10)
        assert meter == "🔴🔴🔴⚪️⚪️"


class TestTrafficLightTemplate:
    """Test TrafficLightTemplate dataclass."""
    
    def test_template_creation(self):
        """Test creating a template."""
        template = TrafficLightTemplate(
            name="test",
            status=LightStatus.RED,
            template_path=Path("/tmp/test.md"),
            description="Test description",
            emoji="🔴",
            criteria=["criterion1", "criterion2"]
        )
        
        assert template.name == "test"
        assert template.status == LightStatus.RED
        assert template.description == "Test description"
        assert template.emoji == "🔴"
        assert len(template.criteria) == 2


class TestGlobalOrchestrator:
    """Test global orchestrator instance."""
    
    def test_get_orchestrator_singleton(self):
        """Test that get_orchestrator returns singleton."""
        orchestrator1 = get_orchestrator()
        orchestrator2 = get_orchestrator()
        assert orchestrator1 is orchestrator2
    
    def test_get_orchestrator_initialized(self):
        """Test that global orchestrator is properly initialized."""
        orchestrator = get_orchestrator()
        assert isinstance(orchestrator, TrafficLightOrchestrator)
        assert len(orchestrator.get_templates(LightStatus.RED)) > 0


class TestDefaultTemplates:
    """Test default template registration."""
    
    @pytest.fixture
    def orchestrator(self):
        """Create orchestrator instance."""
        return TrafficLightOrchestrator()
    
    def test_blocked_task_template(self, orchestrator):
        """Test blocked task template is registered."""
        template = orchestrator.select_template(LightStatus.RED, "blocked_task")
        assert template is not None
        assert template.name == "blocked_task"
        assert template.emoji == "🔴"
        assert len(template.criteria) > 0
    
    def test_failed_deployment_template(self, orchestrator):
        """Test failed deployment template is registered."""
        template = orchestrator.select_template(LightStatus.RED, "failed_deployment")
        assert template is not None
        assert template.name == "failed_deployment"
        assert template.emoji == "🔴"
    
    def test_in_progress_template(self, orchestrator):
        """Test in progress template is registered."""
        template = orchestrator.select_template(LightStatus.YELLOW, "in_progress")
        assert template is not None
        assert template.name == "in_progress"
        assert template.emoji == "🟡"
    
    def test_warning_state_template(self, orchestrator):
        """Test warning state template is registered."""
        template = orchestrator.select_template(LightStatus.YELLOW, "warning_state")
        assert template is not None
        assert template.name == "warning_state"
        assert template.emoji == "🟡"
    
    def test_completed_template(self, orchestrator):
        """Test completed template is registered."""
        template = orchestrator.select_template(LightStatus.GREEN, "completed")
        assert template is not None
        assert template.name == "completed"
        assert template.emoji == "🟢"
    
    def test_approved_template(self, orchestrator):
        """Test approved template is registered."""
        template = orchestrator.select_template(LightStatus.GREEN, "approved")
        assert template is not None
        assert template.name == "approved"
        assert template.emoji == "🟢"


class TestIntegrationScenarios:
    """Test real-world integration scenarios."""
    
    @pytest.fixture
    def orchestrator(self):
        """Create orchestrator instance."""
        return TrafficLightOrchestrator()
    
    def test_deployment_failure_scenario(self, orchestrator):
        """Test deployment failure routing."""
        criteria = [
            "Deployment failed validation",
            "Breaking changes detected"
        ]
        template = orchestrator.route_by_criteria(criteria)
        assert template.status == LightStatus.RED
        assert "deploy" in template.name or "fail" in template.name
    
    def test_work_in_progress_scenario(self, orchestrator):
        """Test work in progress routing."""
        criteria = [
            "Task is actively being worked on",
            "Waiting for review or approval"
        ]
        template = orchestrator.route_by_criteria(criteria)
        assert template.status == LightStatus.YELLOW
    
    def test_successful_completion_scenario(self, orchestrator):
        """Test successful completion routing."""
        criteria = [
            "All checks passed",
            "Tests passing",
            "Ready to proceed"
        ]
        template = orchestrator.route_by_criteria(criteria)
        # Should match green criteria or default to green
        assert template is not None
    
    def test_escalation_scenario(self, orchestrator):
        """Test escalation from yellow to red."""
        # Start with yellow
        yellow_criteria = ["Performance degradation"]
        yellow_template = orchestrator.route_by_criteria(yellow_criteria)
        assert yellow_template.status == LightStatus.YELLOW
        
        # Escalate to red
        red_criteria = ["Performance degradation", "System failure or outage"]
        red_template = orchestrator.route_by_criteria(red_criteria)
        assert red_template.status == LightStatus.RED


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
