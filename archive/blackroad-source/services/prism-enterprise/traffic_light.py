"""
Traffic Light Template Orchestration System.

Provides Redlight, GreenLight, and YellowLight template orchestration
for status tracking and workflow management.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass
from enum import Enum
from pathlib import Path
from typing import Dict, List, Optional

logger = logging.getLogger(__name__)


class LightStatus(str, Enum):
    """Traffic light status indicators."""
    RED = "red"      # Critical/Blocked
    YELLOW = "yellow"  # Warning/In Progress
    GREEN = "green"   # Success/Complete


@dataclass
class TrafficLightTemplate:
    """A template with traffic light status."""
    name: str
    status: LightStatus
    template_path: Path
    description: str
    emoji: str
    criteria: List[str]


class TrafficLightOrchestrator:
    """
    Orchestrates template selection and routing based on traffic light status.
    
    The orchestrator manages three template states:
    - RedLight: Critical issues, blockers, failures
    - YellowLight: In-progress, warnings, needs attention
    - GreenLight: Success, complete, ready to proceed
    """
    
    def __init__(self, templates_dir: Optional[Path] = None):
        """Initialize the traffic light orchestrator."""
        if templates_dir is None:
            templates_dir = Path(__file__).parent.parent / "templates" / "traffic_light"
        self.templates_dir = templates_dir
        self._templates: Dict[LightStatus, List[TrafficLightTemplate]] = {
            LightStatus.RED: [],
            LightStatus.YELLOW: [],
            LightStatus.GREEN: [],
        }
        self._register_default_templates()
    
    def _register_default_templates(self):
        """Register default traffic light templates."""
        # RedLight templates
        self.register_template(TrafficLightTemplate(
            name="blocked_task",
            status=LightStatus.RED,
            template_path=self.templates_dir / "redlight_blocked.md",
            description="Task is blocked and needs immediate attention",
            emoji="🔴",
            criteria=[
                "Critical blocker identified",
                "Dependencies unavailable",
                "Security vulnerability detected",
                "System failure or outage"
            ]
        ))
        
        self.register_template(TrafficLightTemplate(
            name="failed_deployment",
            status=LightStatus.RED,
            template_path=self.templates_dir / "redlight_failed_deploy.md",
            description="Deployment has failed and requires rollback",
            emoji="🔴",
            criteria=[
                "Deployment failed validation",
                "Breaking changes detected",
                "Rollback required"
            ]
        ))
        
        # YellowLight templates
        self.register_template(TrafficLightTemplate(
            name="in_progress",
            status=LightStatus.YELLOW,
            template_path=self.templates_dir / "yellowlight_progress.md",
            description="Work is in progress and needs monitoring",
            emoji="🟡",
            criteria=[
                "Task is actively being worked on",
                "Partial completion",
                "Waiting for review or approval",
                "Minor issues detected"
            ]
        ))
        
        self.register_template(TrafficLightTemplate(
            name="warning_state",
            status=LightStatus.YELLOW,
            template_path=self.templates_dir / "yellowlight_warning.md",
            description="Warning state that needs attention",
            emoji="🟡",
            criteria=[
                "Performance degradation",
                "Approaching resource limits",
                "Non-critical issues found"
            ]
        ))
        
        # GreenLight templates
        self.register_template(TrafficLightTemplate(
            name="completed",
            status=LightStatus.GREEN,
            template_path=self.templates_dir / "greenlight_complete.md",
            description="Task completed successfully",
            emoji="🟢",
            criteria=[
                "All checks passed",
                "Deployment successful",
                "Tests passing",
                "Ready to proceed"
            ]
        ))
        
        self.register_template(TrafficLightTemplate(
            name="approved",
            status=LightStatus.GREEN,
            template_path=self.templates_dir / "greenlight_approved.md",
            description="Work approved and ready for next stage",
            emoji="🟢",
            criteria=[
                "Code review approved",
                "Security scan passed",
                "Quality gates met"
            ]
        ))
    
    def register_template(self, template: TrafficLightTemplate):
        """Register a new traffic light template."""
        self._templates[template.status].append(template)
        logger.info(f"Registered {template.status.value} template: {template.name}")
    
    def get_templates(self, status: LightStatus) -> List[TrafficLightTemplate]:
        """Get all templates for a given status."""
        return self._templates.get(status, [])
    
    def select_template(self, status: LightStatus, name: Optional[str] = None) -> Optional[TrafficLightTemplate]:
        """
        Select a template based on status and optional name.
        
        Args:
            status: The traffic light status
            name: Optional specific template name
            
        Returns:
            The selected template or None
        """
        templates = self.get_templates(status)
        
        if not templates:
            logger.warning(f"No templates found for status: {status.value}")
            return None
        
        if name:
            for template in templates:
                if template.name == name:
                    return template
            logger.warning(f"Template '{name}' not found for status: {status.value}")
            return None
        
        # Return first template if no specific name requested
        return templates[0]
    
    def route_by_criteria(self, criteria_met: List[str]) -> Optional[TrafficLightTemplate]:
        """
        Route to appropriate template based on criteria.
        
        Args:
            criteria_met: List of criteria that are currently met
            
        Returns:
            The best matching template or None
        """
        # Check for red light conditions first (highest priority)
        for template in self._templates[LightStatus.RED]:
            if any(criterion in criteria_met for criterion in template.criteria):
                logger.info(f"Routing to RED template: {template.name}")
                return template
        
        # Check for yellow light conditions
        for template in self._templates[LightStatus.YELLOW]:
            if any(criterion in criteria_met for criterion in template.criteria):
                logger.info(f"Routing to YELLOW template: {template.name}")
                return template
        
        # Default to green light if no issues
        green_templates = self._templates[LightStatus.GREEN]
        if green_templates:
            logger.info(f"Routing to GREEN template: {green_templates[0].name}")
            return green_templates[0]
        
        return None
    
    def get_status_summary(self) -> Dict[str, int]:
        """Get summary count of templates by status."""
        return {
            status.value: len(templates)
            for status, templates in self._templates.items()
        }
    
    def render_status_meter(self, status: LightStatus, level: int = 3) -> str:
        """
        Render a visual status meter with the given status.
        
        Args:
            status: Current traffic light status
            level: Number of filled indicators (1-5)
            
        Returns:
            Emoji-based status meter string
        """
        if not 1 <= level <= 5:
            level = 3  # Default to middle
        
        emoji_map = {
            LightStatus.RED: "🔴",
            LightStatus.YELLOW: "🟡",
            LightStatus.GREEN: "🟢",
        }
        
        filled = emoji_map[status]
        empty = "⚪️"
        
        meter = filled * level + empty * (5 - level)
        return meter


# Global orchestrator instance
_orchestrator: Optional[TrafficLightOrchestrator] = None


def get_orchestrator() -> TrafficLightOrchestrator:
    """Get the global traffic light orchestrator instance."""
    global _orchestrator
    if _orchestrator is None:
        _orchestrator = TrafficLightOrchestrator()
    return _orchestrator
