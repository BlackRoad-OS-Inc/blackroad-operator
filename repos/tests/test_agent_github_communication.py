"""
Test Suite for Agent GitHub Communication Platform

Tests the functionality of agent GitHub interactions including:
- Agent identity loading
- Permission validation
- PR submission
- Issue creation
- Comment posting
- Action logging
"""

import json
import os
import tempfile
import unittest
from pathlib import Path
from unittest.mock import MagicMock, Mock, patch

# Import the communication hub
import sys
sys.path.insert(0, str(Path(__file__).parent.parent))

from agents.github_communication_hub import (
    ActionType,
    AgentGitHubIdentity,
    GitHubAction,
    GitHubCommunicationHub,
)


class TestAgentGitHubIdentity(unittest.TestCase):
    """Test AgentGitHubIdentity class"""

    def test_identity_creation(self):
        """Test creating an agent identity"""
        identity = AgentGitHubIdentity(
            id="P1",
            github_username="cece_blackroad",
            github_handle="@cece_blackroad",
            name="Cece",
            role="swe",
            category="copilot",
            permissions=["pr_create", "pr_review", "issue_create", "comment"],
        )

        self.assertEqual(identity.id, "P1")
        self.assertEqual(identity.github_username, "cece_blackroad")
        self.assertEqual(identity.name, "Cece")
        self.assertTrue(identity.has_permission("pr_create"))
        self.assertFalse(identity.has_permission("deploy"))

    def test_permission_checking(self):
        """Test permission checking"""
        identity = AgentGitHubIdentity(
            id="P4",
            github_username="sentinel_blackroad",
            github_handle="@sentinel_blackroad",
            name="Sentinel",
            role="security",
            category="copilot",
            permissions=["pr_review", "security_scan", "issue_create"],
        )

        self.assertTrue(identity.has_permission("security_scan"))
        self.assertTrue(identity.has_permission("pr_review"))
        self.assertFalse(identity.has_permission("deploy"))


class TestGitHubAction(unittest.TestCase):
    """Test GitHubAction class"""

    def test_action_creation(self):
        """Test creating a GitHub action"""
        action = GitHubAction(
            agent_id="P1",
            action_type=ActionType.PR_CREATE,
            timestamp="2025-11-10T12:00:00Z",
            metadata={"branch": "test-branch", "title": "Test PR"},
            success=True,
        )

        self.assertEqual(action.agent_id, "P1")
        self.assertEqual(action.action_type, ActionType.PR_CREATE)
        self.assertTrue(action.success)
        self.assertIsNone(action.error)

    def test_failed_action(self):
        """Test creating a failed action"""
        action = GitHubAction(
            agent_id="P1",
            action_type=ActionType.PR_CREATE,
            timestamp="2025-11-10T12:00:00Z",
            success=False,
            error="Permission denied",
        )

        self.assertFalse(action.success)
        self.assertEqual(action.error, "Permission denied")


class TestGitHubCommunicationHub(unittest.TestCase):
    """Test GitHubCommunicationHub class"""

    def setUp(self):
        """Set up test fixtures"""
        # Create temporary directory for test files
        self.temp_dir = tempfile.mkdtemp()
        self.registry_path = Path(self.temp_dir) / "registry.json"
        self.archetypes_path = Path(self.temp_dir) / "archetypes.jsonl"
        self.specialized_path = Path(self.temp_dir) / "specialized.jsonl"
        self.actions_log = Path(self.temp_dir) / "actions"
        self.actions_log.mkdir(parents=True, exist_ok=True)

        # Create test registry
        registry_data = {
            "agents": [
                {
                    "id": "P1",
                    "github_username": "cece_blackroad",
                    "github_handle": "@cece_blackroad",
                    "name": "Cece",
                    "role": "swe",
                    "category": "copilot",
                    "permissions": ["pr_create", "pr_review", "issue_create", "comment"],
                },
                {
                    "id": "P4",
                    "github_username": "sentinel_blackroad",
                    "github_handle": "@sentinel_blackroad",
                    "name": "Sentinel",
                    "role": "security",
                    "category": "copilot",
                    "permissions": ["pr_review", "issue_create", "comment"],
                },
            ],
            "service_bots": {"agents": []},
        }

        with open(self.registry_path, 'w') as f:
            json.dump(registry_data, f)

        # Create hub
        self.hub = GitHubCommunicationHub(
            registry_path=self.registry_path,
            archetypes_path=self.archetypes_path,
            specialized_path=self.specialized_path,
            actions_log=self.actions_log,
        )

    def tearDown(self):
        """Clean up test files"""
        import shutil
        shutil.rmtree(self.temp_dir)

    def test_load_identities(self):
        """Test loading agent identities"""
        self.assertEqual(len(self.hub._identities), 2)
        self.assertIn("P1", self.hub._identities)
        self.assertIn("P4", self.hub._identities)

    def test_get_agent(self):
        """Test getting agent by ID"""
        agent = self.hub.get_agent("P1")
        self.assertIsNotNone(agent)
        self.assertEqual(agent.name, "Cece")
        self.assertEqual(agent.github_username, "cece_blackroad")

    def test_get_nonexistent_agent(self):
        """Test getting non-existent agent"""
        agent = self.hub.get_agent("P999")
        self.assertIsNone(agent)

    @patch('subprocess.run')
    def test_submit_pull_request_success(self, mock_run):
        """Test successful PR submission"""
        mock_run.return_value = Mock(returncode=0, stderr="")

        action = self.hub.submit_pull_request(
            agent_id="P1",
            branch_name="test-branch",
            pr_title="Test PR",
            pr_body="Test description",
        )

        self.assertTrue(action.success)
        self.assertIsNone(action.error)
        self.assertEqual(action.action_type, ActionType.PR_CREATE)
        mock_run.assert_called_once()

    def test_submit_pull_request_no_permission(self):
        """Test PR submission without permission"""
        action = self.hub.submit_pull_request(
            agent_id="P4",  # Sentinel doesn't have pr_create permission
            branch_name="test-branch",
            pr_title="Test PR",
            pr_body="Test description",
        )

        self.assertFalse(action.success)
        self.assertIn("permission", action.error.lower())

    def test_submit_pull_request_agent_not_found(self):
        """Test PR submission with non-existent agent"""
        action = self.hub.submit_pull_request(
            agent_id="P999",
            branch_name="test-branch",
            pr_title="Test PR",
            pr_body="Test description",
        )

        self.assertFalse(action.success)
        self.assertIn("not found", action.error.lower())

    @patch('subprocess.run')
    def test_create_issue_success(self, mock_run):
        """Test successful issue creation"""
        mock_run.return_value = Mock(returncode=0, stderr="")

        action = self.hub.create_issue(
            agent_id="P1",
            issue_title="Test Issue",
            issue_body="Test description",
            labels=["bug", "high-priority"],
        )

        self.assertTrue(action.success)
        self.assertIsNone(action.error)
        self.assertEqual(action.action_type, ActionType.ISSUE_CREATE)

    @patch('subprocess.run')
    def test_post_comment_success(self, mock_run):
        """Test successful comment posting"""
        mock_run.return_value = Mock(returncode=0, stderr="")

        action = self.hub.post_comment(
            agent_id="P1",
            target_type="pr",
            target_number=123,
            comment_body="Test comment",
        )

        self.assertTrue(action.success)
        self.assertEqual(action.action_type, ActionType.COMMENT)

    @patch('subprocess.run')
    def test_request_feature(self, mock_run):
        """Test feature request creation"""
        mock_run.return_value = Mock(returncode=0, stderr="")

        action = self.hub.request_feature(
            agent_id="P1",
            feature_title="New Feature",
            feature_description="Feature description",
            rationale="Why we need it",
        )

        self.assertTrue(action.success)
        self.assertEqual(action.action_type, ActionType.ISSUE_CREATE)

    def test_get_agent_actions(self):
        """Test getting agent actions"""
        # Create some test actions
        action1 = GitHubAction(
            agent_id="P1",
            action_type=ActionType.PR_CREATE,
            timestamp="2025-11-10T12:00:00Z",
            success=True,
        )
        action2 = GitHubAction(
            agent_id="P1",
            action_type=ActionType.ISSUE_CREATE,
            timestamp="2025-11-10T13:00:00Z",
            success=True,
        )

        # Log them
        self.hub._log_action(action1)
        self.hub._log_action(action2)

        # Retrieve
        actions = self.hub.get_agent_actions("P1")
        self.assertEqual(len(actions), 2)

    def test_get_all_actions(self):
        """Test getting all actions"""
        # Create test actions for different agents
        action1 = GitHubAction(
            agent_id="P1",
            action_type=ActionType.PR_CREATE,
            timestamp="2025-11-10T12:00:00Z",
            success=True,
        )
        action2 = GitHubAction(
            agent_id="P4",
            action_type=ActionType.COMMENT,
            timestamp="2025-11-10T13:00:00Z",
            success=True,
        )

        self.hub._log_action(action1)
        self.hub._log_action(action2)

        actions = self.hub.get_all_actions()
        self.assertEqual(len(actions), 2)

    def test_get_communication_stats(self):
        """Test communication statistics"""
        # Create test actions
        for i in range(5):
            action = GitHubAction(
                agent_id="P1",
                action_type=ActionType.PR_CREATE,
                timestamp=f"2025-11-10T12:{i:02d}:00Z",
                success=True,
            )
            self.hub._log_action(action)

        stats = self.hub.get_communication_stats()
        self.assertEqual(stats['total_actions'], 5)
        self.assertEqual(stats['active_agents'], 1)
        self.assertEqual(stats['success_rate'], 100.0)


class TestActionLogging(unittest.TestCase):
    """Test action logging functionality"""

    def setUp(self):
        """Set up test environment"""
        self.temp_dir = tempfile.mkdtemp()
        self.actions_log = Path(self.temp_dir) / "actions"
        self.actions_log.mkdir(parents=True, exist_ok=True)

        # Create minimal hub
        registry_data = {
            "agents": [
                {
                    "id": "P1",
                    "github_username": "cece_blackroad",
                    "github_handle": "@cece_blackroad",
                    "name": "Cece",
                    "role": "swe",
                    "category": "copilot",
                    "permissions": ["pr_create"],
                }
            ],
            "service_bots": {"agents": []},
        }

        registry_path = Path(self.temp_dir) / "registry.json"
        with open(registry_path, 'w') as f:
            json.dump(registry_data, f)

        self.hub = GitHubCommunicationHub(
            registry_path=registry_path,
            actions_log=self.actions_log,
        )

    def tearDown(self):
        """Clean up"""
        import shutil
        shutil.rmtree(self.temp_dir)

    def test_log_action_creates_file(self):
        """Test that logging creates the correct file"""
        action = GitHubAction(
            agent_id="P1",
            action_type=ActionType.PR_CREATE,
            timestamp="2025-11-10T12:00:00Z",
            success=True,
        )

        self.hub._log_action(action)

        log_file = self.actions_log / "pr_create_actions.jsonl"
        self.assertTrue(log_file.exists())

    def test_log_action_format(self):
        """Test that log entries have correct format"""
        action = GitHubAction(
            agent_id="P1",
            action_type=ActionType.PR_CREATE,
            timestamp="2025-11-10T12:00:00Z",
            metadata={"test": "data"},
            success=True,
        )

        self.hub._log_action(action)

        log_file = self.actions_log / "pr_create_actions.jsonl"
        with open(log_file, 'r') as f:
            logged_action = json.loads(f.read().strip())

        self.assertEqual(logged_action['agent_id'], "P1")
        self.assertEqual(logged_action['action_type'], "pr_create")
        self.assertTrue(logged_action['success'])
        self.assertEqual(logged_action['metadata'], {"test": "data"})


def run_tests():
    """Run all tests"""
    loader = unittest.TestLoader()
    suite = unittest.TestSuite()

    suite.addTests(loader.loadTestsFromTestCase(TestAgentGitHubIdentity))
    suite.addTests(loader.loadTestsFromTestCase(TestGitHubAction))
    suite.addTests(loader.loadTestsFromTestCase(TestGitHubCommunicationHub))
    suite.addTests(loader.loadTestsFromTestCase(TestActionLogging))

    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)

    return result.wasSuccessful()


if __name__ == "__main__":
    import sys
    success = run_tests()
    sys.exit(0 if success else 1)
