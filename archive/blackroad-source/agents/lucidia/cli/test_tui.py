"""Tests for the Lucidia TUI app and AppsTab component."""

import os
import sys
import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))


# ─── AppsTab unit tests (no TUI required) ────────────────────────────────────

class TestAppsTabHelpText:
    def test_help_text_has_all_apps(self):
        from components.apps import APPS
        from components.apps_tab import AppsTab
        for app_name in APPS:
            assert app_name in AppsTab.HELP_TEXT


# ─── LucidiaApp TUI tests ─────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_app_launches():
    """LucidiaApp should start with the Shell tab active."""
    from lucidia import LucidiaApp
    from textual.widgets import TabbedContent

    async with LucidiaApp().run_test() as pilot:
        tabs = pilot.app.query_one(TabbedContent)
        assert tabs.active == "shell"


@pytest.mark.asyncio
async def test_tab_switching_ctrl1_to_ctrl5():
    """Ctrl+1–5 keybindings should switch tabs correctly."""
    from lucidia import LucidiaApp
    from textual.widgets import TabbedContent

    async with LucidiaApp().run_test() as pilot:
        tabs = pilot.app.query_one(TabbedContent)

        await pilot.press("ctrl+2")
        assert tabs.active == "web"

        await pilot.press("ctrl+3")
        assert tabs.active == "files"

        await pilot.press("ctrl+4")
        assert tabs.active == "agents"

        await pilot.press("ctrl+5")
        assert tabs.active == "apps"

        await pilot.press("ctrl+1")
        assert tabs.active == "shell"


@pytest.mark.asyncio
async def test_app_has_all_five_tabs():
    """All five TabPanes should be present."""
    from lucidia import LucidiaApp
    from textual.widgets import TabbedContent

    async with LucidiaApp().run_test() as pilot:
        tabs = pilot.app.query_one(TabbedContent)
        pane_ids = {pane.id for pane in tabs.query("TabPane")}
        assert {"shell", "web", "files", "agents", "apps"} == pane_ids


@pytest.mark.asyncio
async def test_apps_tab_runs_fortune():
    """Typing 'fortune' in the Apps tab should produce output."""
    from lucidia import LucidiaApp
    from textual.widgets import RichLog

    async with LucidiaApp().run_test() as pilot:
        # Switch to apps tab
        await pilot.press("ctrl+5")

        # Type a command and submit
        await pilot.click("#apps-input")
        await pilot.press(*list("fortune"))
        await pilot.press("enter")

        log = pilot.app.query_one("#apps-output", RichLog)
        assert len(log.lines) > 1  # Should have more than the welcome message


@pytest.mark.asyncio
async def test_shell_tab_help_command():
    """Typing 'help' in the Shell tab should produce output."""
    from lucidia import LucidiaApp
    from textual.widgets import RichLog

    async with LucidiaApp().run_test() as pilot:
        await pilot.click("#shell-input")
        await pilot.press(*list("help"))
        await pilot.press("enter")

        log = pilot.app.query_one("#shell-output", RichLog)
        assert len(log.lines) > 1
