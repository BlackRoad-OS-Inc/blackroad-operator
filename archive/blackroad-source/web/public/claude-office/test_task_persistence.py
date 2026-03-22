"""Tests for the task persistence module."""

from collections.abc import AsyncGenerator

import pytest
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.task_persistence import clear_tasks, load_tasks, save_tasks
from app.db.database import Base, override_engine
from app.db.models import TaskRecord
from app.models.common import TodoItem, TodoStatus


@pytest.fixture
async def test_db() -> AsyncGenerator[async_sessionmaker[AsyncSession]]:
    """Create a test database with in-memory SQLite."""
    engine = create_async_engine("sqlite+aiosqlite:///:memory:", echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    override_engine(engine)

    session_factory = async_sessionmaker(
        bind=engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )
    yield session_factory

    # Cleanup: dispose of the engine to release resources
    await engine.dispose()


class TestTaskPersistence:
    """Tests for task persistence functions."""

    @pytest.mark.asyncio
    async def test_save_and_load_tasks(self, test_db: async_sessionmaker[AsyncSession]) -> None:
        """Test saving and loading tasks."""
        session_id = "test-session-1"
        todos = [
            TodoItem(task_id="1", content="First task", status=TodoStatus.PENDING),
            TodoItem(
                task_id="2",
                content="Second task",
                status=TodoStatus.IN_PROGRESS,
                active_form="Working",
            ),
            TodoItem(task_id="3", content="Third task", status=TodoStatus.COMPLETED),
        ]

        # Save tasks
        await save_tasks(session_id, todos)

        # Load tasks
        loaded = await load_tasks(session_id)

        assert len(loaded) == 3
        assert loaded[0].task_id == "1"
        assert loaded[0].content == "First task"
        assert loaded[0].status == TodoStatus.PENDING
        assert loaded[1].task_id == "2"
        assert loaded[1].content == "Second task"
        assert loaded[1].status == TodoStatus.IN_PROGRESS
        assert loaded[1].active_form == "Working"
        assert loaded[2].task_id == "3"
        assert loaded[2].content == "Third task"
        assert loaded[2].status == TodoStatus.COMPLETED

    @pytest.mark.asyncio
    async def test_save_replaces_existing_tasks(
        self, test_db: async_sessionmaker[AsyncSession]
    ) -> None:
        """Test that saving tasks replaces existing ones."""
        session_id = "test-session-2"

        # Save initial tasks
        initial_todos = [
            TodoItem(content="Old task 1", status=TodoStatus.PENDING),
            TodoItem(content="Old task 2", status=TodoStatus.PENDING),
        ]
        await save_tasks(session_id, initial_todos)

        # Save new tasks (should replace)
        new_todos = [
            TodoItem(content="New task", status=TodoStatus.IN_PROGRESS),
        ]
        await save_tasks(session_id, new_todos)

        # Load and verify
        loaded = await load_tasks(session_id)
        assert len(loaded) == 1
        assert loaded[0].content == "New task"

    @pytest.mark.asyncio
    async def test_load_empty_session(self, test_db: async_sessionmaker[AsyncSession]) -> None:
        """Test loading tasks from a session with no tasks."""
        loaded = await load_tasks("nonexistent-session")
        assert loaded == []

    @pytest.mark.asyncio
    async def test_clear_tasks(self, test_db: async_sessionmaker[AsyncSession]) -> None:
        """Test clearing tasks for a session."""
        session_id = "test-session-3"
        todos = [
            TodoItem(content="Task to clear", status=TodoStatus.PENDING),
        ]

        await save_tasks(session_id, todos)
        loaded_before = await load_tasks(session_id)
        assert len(loaded_before) == 1

        await clear_tasks(session_id)
        loaded_after = await load_tasks(session_id)
        assert len(loaded_after) == 0

    @pytest.mark.asyncio
    async def test_tasks_ordered_correctly(self, test_db: async_sessionmaker[AsyncSession]) -> None:
        """Test that tasks maintain their order."""
        session_id = "test-session-4"
        todos = [
            TodoItem(content="First", status=TodoStatus.PENDING),
            TodoItem(content="Second", status=TodoStatus.PENDING),
            TodoItem(content="Third", status=TodoStatus.PENDING),
            TodoItem(content="Fourth", status=TodoStatus.PENDING),
        ]

        await save_tasks(session_id, todos)
        loaded = await load_tasks(session_id)

        assert [t.content for t in loaded] == ["First", "Second", "Third", "Fourth"]

    @pytest.mark.asyncio
    async def test_sessions_isolated(self, test_db: async_sessionmaker[AsyncSession]) -> None:
        """Test that tasks from different sessions are isolated."""
        await save_tasks("session-a", [TodoItem(content="Task A", status=TodoStatus.PENDING)])
        await save_tasks("session-b", [TodoItem(content="Task B", status=TodoStatus.PENDING)])

        loaded_a = await load_tasks("session-a")
        loaded_b = await load_tasks("session-b")

        assert len(loaded_a) == 1
        assert loaded_a[0].content == "Task A"
        assert len(loaded_b) == 1
        assert loaded_b[0].content == "Task B"

    @pytest.mark.asyncio
    async def test_handles_invalid_status(self, test_db: async_sessionmaker[AsyncSession]) -> None:
        """Test that invalid status values default to pending."""
        session_id = "test-session-5"

        # Manually insert a task with invalid status
        async with test_db() as db:
            task = TaskRecord(
                session_id=session_id,
                task_id="1",
                content="Invalid status task",
                status="invalid_status",
                sort_order=0,
            )
            db.add(task)
            await db.commit()

        loaded = await load_tasks(session_id)
        assert len(loaded) == 1
        assert loaded[0].status == TodoStatus.PENDING

    @pytest.mark.asyncio
    async def test_save_and_load_all_fields(
        self, test_db: async_sessionmaker[AsyncSession]
    ) -> None:
        """Test saving and loading tasks with all fields."""
        session_id = "test-session-all-fields"
        todos = [
            TodoItem(
                task_id="1",
                content="Task with all fields",
                status=TodoStatus.IN_PROGRESS,
                active_form="Processing task",
                description="A detailed description of the task",
                blocks=["2", "3"],
                blocked_by=["0"],
                owner="agent-456",
                metadata={"priority": "high", "tags": ["urgent", "backend"]},
            ),
        ]

        await save_tasks(session_id, todos)
        loaded = await load_tasks(session_id)

        assert len(loaded) == 1
        task = loaded[0]
        assert task.task_id == "1"
        assert task.content == "Task with all fields"
        assert task.status == TodoStatus.IN_PROGRESS
        assert task.active_form == "Processing task"
        assert task.description == "A detailed description of the task"
        assert task.blocks == ["2", "3"]
        assert task.blocked_by == ["0"]
        assert task.owner == "agent-456"
        assert task.metadata == {"priority": "high", "tags": ["urgent", "backend"]}

    @pytest.mark.asyncio
    async def test_save_and_load_empty_optional_fields(
        self, test_db: async_sessionmaker[AsyncSession]
    ) -> None:
        """Test saving and loading tasks with empty optional fields."""
        session_id = "test-session-empty-fields"
        todos = [
            TodoItem(
                task_id="1",
                content="Task with minimal fields",
                status=TodoStatus.PENDING,
            ),
        ]

        await save_tasks(session_id, todos)
        loaded = await load_tasks(session_id)

        assert len(loaded) == 1
        task = loaded[0]
        assert task.task_id == "1"
        assert task.content == "Task with minimal fields"
        assert task.status == TodoStatus.PENDING
        assert task.active_form is None
        assert task.description is None
        assert task.blocks == []
        assert task.blocked_by == []
        assert task.owner is None
        assert task.metadata is None

    @pytest.mark.asyncio
    async def test_task_id_from_todo_preserved(
        self, test_db: async_sessionmaker[AsyncSession]
    ) -> None:
        """Test that task_id from TodoItem is preserved, not overwritten with index."""
        session_id = "test-session-task-id"
        todos = [
            TodoItem(task_id="custom-id-abc", content="Task A", status=TodoStatus.PENDING),
            TodoItem(task_id="custom-id-xyz", content="Task B", status=TodoStatus.PENDING),
        ]

        await save_tasks(session_id, todos)
        loaded = await load_tasks(session_id)

        assert len(loaded) == 2
        assert loaded[0].task_id == "custom-id-abc"
        assert loaded[1].task_id == "custom-id-xyz"
