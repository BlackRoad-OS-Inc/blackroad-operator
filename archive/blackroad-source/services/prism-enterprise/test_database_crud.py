"""
Integration tests for database CRUD operations

Tests Create, Read, Update, Delete operations for all major entities
Uses SQLite database from srv/blackroad-api/blackroad.db
"""
import pytest
import sqlite3
import os
from datetime import datetime
from typing import Dict, List, Any
from contextlib import contextmanager


@contextmanager
def get_db_connection(db_path="srv/blackroad-api/blackroad.db"):
    """Context manager for database connections"""
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row  # Return rows as dictionaries
    try:
        yield conn
    finally:
        conn.close()


class TestUserCRUD:
    """Test CRUD operations for users table"""

    @pytest.fixture
    def test_user_data(self):
        """Sample user data for testing"""
        return {
            "email": "test@blackroad.io",
            "username": "testuser",
            "password_hash": "hashed_password_123",
            "created_at": datetime.utcnow().isoformat(),
        }

    @pytest.fixture(autouse=True)
    def setup_teardown(self):
        """Setup and teardown for tests"""
        # Setup
        yield
        # Teardown - Clean up test data
        with get_db_connection() as conn:
            conn.execute("DELETE FROM users WHERE email LIKE 'test%@blackroad.io'")
            conn.commit()

    def test_create_user_success(self, test_user_data):
        """Test creating a new user"""
        # Act
        with get_db_connection() as conn:
            cursor = conn.execute(
                """
                INSERT INTO users (email, username, password_hash, created_at)
                VALUES (:email, :username, :password_hash, :created_at)
                """,
                test_user_data,
            )
            conn.commit()
            user_id = cursor.lastrowid

        # Assert
        assert user_id is not None
        assert user_id > 0

        # Verify user was created
        with get_db_connection() as conn:
            result = conn.execute(
                "SELECT * FROM users WHERE id = ?", (user_id,)
            ).fetchone()

        assert result is not None
        assert result["email"] == test_user_data["email"]
        assert result["username"] == test_user_data["username"]

    def test_create_user_duplicate_email_fails(self, test_user_data):
        """Test creating user with duplicate email fails"""
        # Arrange - Create first user
        with get_db_connection() as conn:
            conn.execute(
                """
                INSERT INTO users (email, username, password_hash, created_at)
                VALUES (:email, :username, :password_hash, :created_at)
                """,
                test_user_data,
            )
            conn.commit()

        # Act & Assert - Try to create duplicate
        with pytest.raises(sqlite3.IntegrityError):
            with get_db_connection() as conn:
                conn.execute(
                    """
                    INSERT INTO users (email, username, password_hash, created_at)
                    VALUES (:email, :username, :password_hash, :created_at)
                    """,
                    test_user_data,
                )
                conn.commit()

    def test_read_user_by_id(self, test_user_data):
        """Test reading user by ID"""
        # Arrange - Create user
        with get_db_connection() as conn:
            cursor = conn.execute(
                """
                INSERT INTO users (email, username, password_hash, created_at)
                VALUES (:email, :username, :password_hash, :created_at)
                """,
                test_user_data,
            )
            conn.commit()
            user_id = cursor.lastrowid

        # Act
        with get_db_connection() as conn:
            result = conn.execute(
                "SELECT * FROM users WHERE id = ?", (user_id,)
            ).fetchone()

        # Assert
        assert result is not None
        assert result["id"] == user_id
        assert result["email"] == test_user_data["email"]

    def test_read_user_by_email(self, test_user_data):
        """Test reading user by email"""
        # Arrange
        with get_db_connection() as conn:
            conn.execute(
                """
                INSERT INTO users (email, username, password_hash, created_at)
                VALUES (:email, :username, :password_hash, :created_at)
                """,
                test_user_data,
            )
            conn.commit()

        # Act
        with get_db_connection() as conn:
            result = conn.execute(
                "SELECT * FROM users WHERE email = ?", (test_user_data["email"],)
            ).fetchone()

        # Assert
        assert result is not None
        assert result["email"] == test_user_data["email"]

    def test_update_user_email(self, test_user_data):
        """Test updating user email"""
        # Arrange
        with get_db_connection() as conn:
            cursor = conn.execute(
                """
                INSERT INTO users (email, username, password_hash, created_at)
                VALUES (:email, :username, :password_hash, :created_at)
                """,
                test_user_data,
            )
            conn.commit()
            user_id = cursor.lastrowid

        # Act
        new_email = "updated@blackroad.io"
        with get_db_connection() as conn:
            conn.execute(
                "UPDATE users SET email = ? WHERE id = ?", (new_email, user_id)
            )
            conn.commit()

        # Assert
        with get_db_connection() as conn:
            result = conn.execute(
                "SELECT email FROM users WHERE id = ?", (user_id,)
            ).fetchone()

        assert result["email"] == new_email

    def test_delete_user(self, test_user_data):
        """Test deleting a user"""
        # Arrange
        with get_db_connection() as conn:
            cursor = conn.execute(
                """
                INSERT INTO users (email, username, password_hash, created_at)
                VALUES (:email, :username, :password_hash, :created_at)
                """,
                test_user_data,
            )
            conn.commit()
            user_id = cursor.lastrowid

        # Act
        with get_db_connection() as conn:
            conn.execute("DELETE FROM users WHERE id = ?", (user_id,))
            conn.commit()

        # Assert
        with get_db_connection() as conn:
            result = conn.execute(
                "SELECT * FROM users WHERE id = ?", (user_id,)
            ).fetchone()

        assert result is None

    def test_list_all_users(self):
        """Test listing all users"""
        # Act
        with get_db_connection() as conn:
            results = conn.execute("SELECT * FROM users LIMIT 10").fetchall()

        # Assert
        assert isinstance(results, list)


class TestProjectCRUD:
    """Test CRUD operations for projects table"""

    @pytest.fixture
    def test_project_data(self):
        """Sample project data"""
        return {
            "name": "Test Project",
            "description": "A test project",
            "owner_id": 1,  # Assumes user ID 1 exists
            "created_at": datetime.utcnow().isoformat(),
        }

    @pytest.fixture(autouse=True)
    def setup_teardown(self):
        """Cleanup test projects"""
        yield
        with get_db_connection() as conn:
            conn.execute("DELETE FROM projects WHERE name LIKE 'Test%'")
            conn.commit()

    def test_create_project(self, test_project_data):
        """Test creating a project"""
        # Act
        with get_db_connection() as conn:
            cursor = conn.execute(
                """
                INSERT INTO projects (name, description, owner_id, created_at)
                VALUES (:name, :description, :owner_id, :created_at)
                """,
                test_project_data,
            )
            conn.commit()
            project_id = cursor.lastrowid

        # Assert
        assert project_id > 0

        with get_db_connection() as conn:
            result = conn.execute(
                "SELECT * FROM projects WHERE id = ?", (project_id,)
            ).fetchone()

        assert result["name"] == test_project_data["name"]

    def test_read_project_by_id(self, test_project_data):
        """Test reading project by ID"""
        # Arrange
        with get_db_connection() as conn:
            cursor = conn.execute(
                """
                INSERT INTO projects (name, description, owner_id, created_at)
                VALUES (:name, :description, :owner_id, :created_at)
                """,
                test_project_data,
            )
            conn.commit()
            project_id = cursor.lastrowid

        # Act
        with get_db_connection() as conn:
            result = conn.execute(
                "SELECT * FROM projects WHERE id = ?", (project_id,)
            ).fetchone()

        # Assert
        assert result is not None
        assert result["id"] == project_id

    def test_update_project_name(self, test_project_data):
        """Test updating project name"""
        # Arrange
        with get_db_connection() as conn:
            cursor = conn.execute(
                """
                INSERT INTO projects (name, description, owner_id, created_at)
                VALUES (:name, :description, :owner_id, :created_at)
                """,
                test_project_data,
            )
            conn.commit()
            project_id = cursor.lastrowid

        # Act
        new_name = "Updated Test Project"
        with get_db_connection() as conn:
            conn.execute(
                "UPDATE projects SET name = ? WHERE id = ?", (new_name, project_id)
            )
            conn.commit()

        # Assert
        with get_db_connection() as conn:
            result = conn.execute(
                "SELECT name FROM projects WHERE id = ?", (project_id,)
            ).fetchone()

        assert result["name"] == new_name

    def test_delete_project(self, test_project_data):
        """Test deleting a project"""
        # Arrange
        with get_db_connection() as conn:
            cursor = conn.execute(
                """
                INSERT INTO projects (name, description, owner_id, created_at)
                VALUES (:name, :description, :owner_id, :created_at)
                """,
                test_project_data,
            )
            conn.commit()
            project_id = cursor.lastrowid

        # Act
        with get_db_connection() as conn:
            conn.execute("DELETE FROM projects WHERE id = ?", (project_id,))
            conn.commit()

        # Assert
        with get_db_connection() as conn:
            result = conn.execute(
                "SELECT * FROM projects WHERE id = ?", (project_id,)
            ).fetchone()

        assert result is None


class TestTaskCRUD:
    """Test CRUD operations for tasks table"""

    @pytest.fixture
    def test_task_data(self):
        """Sample task data"""
        return {
            "title": "Test Task",
            "description": "A test task",
            "status": "pending",
            "project_id": 1,  # Assumes project ID 1 exists
            "assigned_to": 1,  # Assumes user ID 1 exists
            "created_at": datetime.utcnow().isoformat(),
        }

    @pytest.fixture(autouse=True)
    def setup_teardown(self):
        """Cleanup test tasks"""
        yield
        with get_db_connection() as conn:
            conn.execute("DELETE FROM tasks WHERE title LIKE 'Test%'")
            conn.commit()

    def test_create_task(self, test_task_data):
        """Test creating a task"""
        # Act
        with get_db_connection() as conn:
            cursor = conn.execute(
                """
                INSERT INTO tasks (title, description, status, project_id, assigned_to, created_at)
                VALUES (:title, :description, :status, :project_id, :assigned_to, :created_at)
                """,
                test_task_data,
            )
            conn.commit()
            task_id = cursor.lastrowid

        # Assert
        assert task_id > 0

    def test_read_task_by_id(self, test_task_data):
        """Test reading task by ID"""
        # Arrange
        with get_db_connection() as conn:
            cursor = conn.execute(
                """
                INSERT INTO tasks (title, description, status, project_id, assigned_to, created_at)
                VALUES (:title, :description, :status, :project_id, :assigned_to, :created_at)
                """,
                test_task_data,
            )
            conn.commit()
            task_id = cursor.lastrowid

        # Act
        with get_db_connection() as conn:
            result = conn.execute(
                "SELECT * FROM tasks WHERE id = ?", (task_id,)
            ).fetchone()

        # Assert
        assert result is not None
        assert result["title"] == test_task_data["title"]

    def test_update_task_status(self, test_task_data):
        """Test updating task status"""
        # Arrange
        with get_db_connection() as conn:
            cursor = conn.execute(
                """
                INSERT INTO tasks (title, description, status, project_id, assigned_to, created_at)
                VALUES (:title, :description, :status, :project_id, :assigned_to, :created_at)
                """,
                test_task_data,
            )
            conn.commit()
            task_id = cursor.lastrowid

        # Act
        new_status = "completed"
        with get_db_connection() as conn:
            conn.execute(
                "UPDATE tasks SET status = ? WHERE id = ?", (new_status, task_id)
            )
            conn.commit()

        # Assert
        with get_db_connection() as conn:
            result = conn.execute(
                "SELECT status FROM tasks WHERE id = ?", (task_id,)
            ).fetchone()

        assert result["status"] == new_status

    def test_filter_tasks_by_status(self):
        """Test filtering tasks by status"""
        # Act
        with get_db_connection() as conn:
            results = conn.execute(
                "SELECT * FROM tasks WHERE status = ?", ("pending",)
            ).fetchall()

        # Assert
        assert isinstance(results, list)
        for task in results:
            assert task["status"] == "pending"


class TestAgentRegistryCRUD:
    """Test CRUD operations for agent registry"""

    @pytest.fixture
    def test_agent_data(self):
        """Sample agent data"""
        return {
            "agent_id": "TEST-AGENT-123",
            "name": "Test Agent",
            "type": "test_agent",
            "status": "active",
            "capabilities": '["test", "demo"]',
            "created_at": datetime.utcnow().isoformat(),
        }

    @pytest.fixture(autouse=True)
    def setup_teardown(self):
        """Cleanup test agents"""
        yield
        with get_db_connection() as conn:
            conn.execute("DELETE FROM agents WHERE agent_id LIKE 'TEST-%'")
            conn.commit()

    def test_register_agent(self, test_agent_data):
        """Test registering a new agent"""
        # Act
        with get_db_connection() as conn:
            cursor = conn.execute(
                """
                INSERT INTO agents (agent_id, name, type, status, capabilities, created_at)
                VALUES (:agent_id, :name, :type, :status, :capabilities, :created_at)
                """,
                test_agent_data,
            )
            conn.commit()
            row_id = cursor.lastrowid

        # Assert
        assert row_id > 0

    def test_read_agent_by_id(self, test_agent_data):
        """Test reading agent by agent_id"""
        # Arrange
        with get_db_connection() as conn:
            conn.execute(
                """
                INSERT INTO agents (agent_id, name, type, status, capabilities, created_at)
                VALUES (:agent_id, :name, :type, :status, :capabilities, :created_at)
                """,
                test_agent_data,
            )
            conn.commit()

        # Act
        with get_db_connection() as conn:
            result = conn.execute(
                "SELECT * FROM agents WHERE agent_id = ?", (test_agent_data["agent_id"],)
            ).fetchone()

        # Assert
        assert result is not None
        assert result["agent_id"] == test_agent_data["agent_id"]

    def test_update_agent_status(self, test_agent_data):
        """Test updating agent status"""
        # Arrange
        with get_db_connection() as conn:
            conn.execute(
                """
                INSERT INTO agents (agent_id, name, type, status, capabilities, created_at)
                VALUES (:agent_id, :name, :type, :status, :capabilities, :created_at)
                """,
                test_agent_data,
            )
            conn.commit()

        # Act
        new_status = "inactive"
        with get_db_connection() as conn:
            conn.execute(
                "UPDATE agents SET status = ? WHERE agent_id = ?",
                (new_status, test_agent_data["agent_id"]),
            )
            conn.commit()

        # Assert
        with get_db_connection() as conn:
            result = conn.execute(
                "SELECT status FROM agents WHERE agent_id = ?",
                (test_agent_data["agent_id"],),
            ).fetchone()

        assert result["status"] == new_status

    def test_deregister_agent(self, test_agent_data):
        """Test deregistering an agent"""
        # Arrange
        with get_db_connection() as conn:
            conn.execute(
                """
                INSERT INTO agents (agent_id, name, type, status, capabilities, created_at)
                VALUES (:agent_id, :name, :type, :status, :capabilities, :created_at)
                """,
                test_agent_data,
            )
            conn.commit()

        # Act
        with get_db_connection() as conn:
            conn.execute(
                "DELETE FROM agents WHERE agent_id = ?", (test_agent_data["agent_id"],)
            )
            conn.commit()

        # Assert
        with get_db_connection() as conn:
            result = conn.execute(
                "SELECT * FROM agents WHERE agent_id = ?", (test_agent_data["agent_id"],)
            ).fetchone()

        assert result is None


class TestTransactionHandling:
    """Test database transaction scenarios"""

    def test_commit_transaction(self):
        """Test successful transaction commit"""
        test_email = "transaction_test@blackroad.io"

        # Act
        with get_db_connection() as conn:
            conn.execute(
                "INSERT INTO users (email, username) VALUES (?, ?)",
                (test_email, "txtest"),
            )
            conn.commit()

        # Assert
        with get_db_connection() as conn:
            result = conn.execute(
                "SELECT * FROM users WHERE email = ?", (test_email,)
            ).fetchone()

        assert result is not None

        # Cleanup
        with get_db_connection() as conn:
            conn.execute("DELETE FROM users WHERE email = ?", (test_email,))
            conn.commit()

    def test_rollback_transaction(self):
        """Test transaction rollback"""
        test_email = "rollback_test@blackroad.io"

        # Act
        with get_db_connection() as conn:
            conn.execute(
                "INSERT INTO users (email, username) VALUES (?, ?)",
                (test_email, "rollback"),
            )
            conn.rollback()  # Explicitly rollback

        # Assert - User should not exist
        with get_db_connection() as conn:
            result = conn.execute(
                "SELECT * FROM users WHERE email = ?", (test_email,)
            ).fetchone()

        assert result is None
