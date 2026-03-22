"""Tests for BlackRoad Notebook Server."""
import json
import os
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

os.environ["NOTEBOOK_DB"] = str(Path(tempfile.mkdtemp()) / "test_notebooks.db")
sys.path.insert(0, str(Path(__file__).parent))
from main import Cell, JupyterService, Notebook, OllamaService, init_db


class TestCell(unittest.TestCase):
    def test_to_ipynb_code(self):
        cell = Cell(cell_type="code", source="x = 1")
        d = cell.to_ipynb()
        self.assertEqual(d["cell_type"], "code")
        self.assertIn("outputs", d)

    def test_to_ipynb_markdown(self):
        cell = Cell(cell_type="markdown", source="# Hello")
        d = cell.to_ipynb()
        self.assertEqual(d["cell_type"], "markdown")
        self.assertNotIn("outputs", d)

    def test_from_ipynb_list_source(self):
        data = {"cell_type": "code", "source": ["x = 1\n", "y = 2"], "outputs": [], "execution_count": None}
        cell = Cell.from_ipynb(data)
        self.assertIn("x = 1", cell.source)
        self.assertIn("y = 2", cell.source)


class TestJupyterService(unittest.TestCase):
    def setUp(self):
        init_db()
        self.svc = JupyterService()
        self.tmp = Path(tempfile.mkdtemp())

    def test_notebook_create_and_load(self):
        nb = self.svc.notebook_create("Test NB", str(self.tmp / "test.ipynb"))
        self.assertTrue(Path(nb.path).exists())
        loaded = self.svc.notebook_load(nb.id)
        self.assertEqual(loaded.id, nb.id)
        self.assertEqual(loaded.name, "Test NB")

    def test_notebook_create_with_cells(self):
        cells = [{"cell_type": "code", "source": "print('hello')"}]
        nb = self.svc.notebook_create("With Cells", str(self.tmp / "cells.ipynb"), cells=cells)
        loaded = self.svc.notebook_load(nb.id)
        self.assertEqual(len(loaded.cells), 1)

    def test_notebook_execute_success(self):
        cells = [{"cell_type": "code", "source": "x = 2 + 2\nprint(x)"}]
        nb = self.svc.notebook_create("Exec Test", str(self.tmp / "exec.ipynb"), cells=cells)
        results = self.svc.notebook_execute(nb.id)
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0].status, "success")
        self.assertIn("4", results[0].output)

    def test_notebook_execute_error(self):
        cells = [{"cell_type": "code", "source": "raise ValueError('fail')"}]
        nb = self.svc.notebook_create("Err Test", str(self.tmp / "err.ipynb"), cells=cells)
        results = self.svc.notebook_execute(nb.id)
        self.assertEqual(results[0].status, "error")

    def test_notebook_export_script(self):
        cells = [{"cell_type": "code", "source": "x = 1"}]
        nb = self.svc.notebook_create("Export Test", str(self.tmp / "export.ipynb"), cells=cells)
        out = self.svc.notebook_export(nb.id, fmt="script")
        self.assertTrue(out.endswith(".py"))
        self.assertTrue(Path(out).exists())

    def test_notebook_list(self):
        self.svc.notebook_create("List NB", str(self.tmp / "list.ipynb"))
        items = self.svc.notebook_list()
        self.assertGreaterEqual(len(items), 1)

    def test_execution_history(self):
        cells = [{"cell_type": "code", "source": "print(42)"}]
        nb = self.svc.notebook_create("Hist Test", str(self.tmp / "hist.ipynb"), cells=cells)
        self.svc.notebook_execute(nb.id)
        hist = self.svc.execution_history(nb.id)
        self.assertGreaterEqual(len(hist), 1)


class TestOllamaService(unittest.TestCase):
    class _FakeOllamaResponse:
        """Minimal stub for urllib.request.urlopen context manager."""
        def __init__(self, response_text: str) -> None:
            self._data = json.dumps({"response": response_text}).encode()

        def read(self):
            return self._data

        def __enter__(self):
            return self

        def __exit__(self, *a):
            pass
    def test_has_mention_ollama(self):
        self.assertTrue(OllamaService.has_mention("@ollama what is 2+2?"))

    def test_has_mention_copilot(self):
        self.assertTrue(OllamaService.has_mention("@copilot explain recursion"))

    def test_has_mention_lucidia(self):
        self.assertTrue(OllamaService.has_mention("@lucidia summarize this"))

    def test_has_mention_blackboxprogramming(self):
        self.assertTrue(OllamaService.has_mention("@blackboxprogramming write a sort"))

    def test_has_mention_case_insensitive(self):
        self.assertTrue(OllamaService.has_mention("@Copilot help"))
        self.assertTrue(OllamaService.has_mention("@OLLAMA test"))

    def test_no_mention(self):
        self.assertFalse(OllamaService.has_mention("x = 1 + 2"))
        self.assertFalse(OllamaService.has_mention("print('hello')"))

    def test_query_strips_mention_and_calls_ollama(self):
        with patch("urllib.request.urlopen", return_value=self._FakeOllamaResponse("42")):
            svc = OllamaService(base_url="http://localhost:11434", model="llama3")
            text, status = svc.query("@ollama what is 6*7?")
        self.assertEqual(status, "success")
        self.assertEqual(text, "42")

    def test_query_connection_error_returns_error_status(self):
        import urllib.error
        with patch("urllib.request.urlopen", side_effect=urllib.error.URLError("refused")):
            svc = OllamaService(base_url="http://localhost:11434", model="llama3")
            text, status = svc.query("@ollama hello")
        self.assertEqual(status, "error")
        self.assertIn("refused", text)

    def test_run_cell_routes_mention_to_ollama(self):
        with patch("urllib.request.urlopen", return_value=self._FakeOllamaResponse("ollama answer")):
            output, status = JupyterService._run_cell("@copilot what is gravity?")
        self.assertEqual(status, "success")
        self.assertEqual(output, "ollama answer")

    def test_run_cell_plain_python_not_routed(self):
        output, status = JupyterService._run_cell("print('hello')")
        self.assertEqual(status, "success")
        self.assertIn("hello", output)


if __name__ == "__main__":
    unittest.main()
