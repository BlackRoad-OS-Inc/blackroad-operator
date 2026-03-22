"""Tests for BlackRoad Data Pipeline."""
import json
import os
import sys
import tempfile
import unittest
from pathlib import Path

os.environ["PIPELINE_DB"] = str(Path(tempfile.mkdtemp()) / "test_pipelines.db")
sys.path.insert(0, str(Path(__file__).parent))
from main import DataSource, PipelineService, Transform, Sink, init_db


class TestTransform(unittest.TestCase):
    DATA = [
        {"name": "Alice", "age": "30", "dept": "eng"},
        {"name": "Bob", "age": "25", "dept": "eng"},
        {"name": "Carol", "age": "35", "dept": "pm"},
    ]

    def _make(self, t_type, config):
        return Transform("t1", "p1", "t", t_type, config, [], 0)

    def test_filter_eq(self):
        t = self._make("filter", {"field": "dept", "op": "eq", "value": "eng"})
        result = t.apply(self.DATA)
        self.assertEqual(len(result), 2)

    def test_map_upper(self):
        t = self._make("map", {"field": "dept", "operation": "upper"})
        result = t.apply(self.DATA)
        self.assertTrue(all(r["dept"] == r["dept"].upper() for r in result))

    def test_aggregate_count(self):
        t = self._make("aggregate", {"group_by": ["dept"], "field": "name", "function": "count"})
        result = t.apply(self.DATA)
        depts = {r["dept"]: r["name_count"] for r in result}
        self.assertEqual(depts["eng"], 2)
        self.assertEqual(depts["pm"], 1)

    def test_sort(self):
        t = self._make("sort", {"field": "age"})
        result = t.apply(self.DATA)
        self.assertEqual(result[0]["name"], "Bob")

    def test_deduplicate(self):
        data = self.DATA + [{"name": "Alice", "age": "30", "dept": "eng"}]
        t = self._make("deduplicate", {"keys": ["name"]})
        result = t.apply(data)
        self.assertEqual(len(result), 3)


class TestPipelineService(unittest.TestCase):
    def setUp(self):
        init_db()
        self.svc = PipelineService()
        self.tmp = Path(tempfile.mkdtemp())

    def test_create_pipeline(self):
        p = self.svc.create_pipeline("Test Pipeline")
        self.assertIsNotNone(p.id)
        self.assertEqual(p.name, "Test Pipeline")

    def test_run_pipeline_inline(self):
        p = self.svc.create_pipeline("Inline Pipeline")
        self.svc.add_source(p.id, "data", "inline", {"data": [{"x": 1}, {"x": 2}]})
        self.svc.add_sink(p.id, "out", "stdout", {})
        result = self.svc.run_pipeline(p.id)
        self.assertEqual(result["status"], "success")
        self.assertEqual(result["rows_read"], 2)

    def test_run_pipeline_with_transform(self):
        p = self.svc.create_pipeline("Transform Pipeline")
        data = [{"v": str(i), "keep": str(i % 2 == 0)} for i in range(10)]
        self.svc.add_source(p.id, "data", "inline", {"data": data})
        self.svc.add_transform(p.id, "f", "filter", {"field": "keep", "op": "eq", "value": "True"})
        self.svc.add_sink(p.id, "out", "stdout", {})
        result = self.svc.run_pipeline(p.id)
        self.assertEqual(result["status"], "success")

    def test_run_pipeline_csv(self):
        csv_path = self.tmp / "data.csv"
        csv_path.write_text("name,score\nAlice,90\nBob,80\n")
        p = self.svc.create_pipeline("CSV Pipeline")
        self.svc.add_source(p.id, "csv", "csv", {"path": str(csv_path)})
        out_path = str(self.tmp / "out.json")
        self.svc.add_sink(p.id, "out", "json", {"path": out_path})
        result = self.svc.run_pipeline(p.id)
        self.assertEqual(result["status"], "success")
        self.assertTrue(Path(out_path).exists())

    def test_list_pipelines(self):
        self.svc.create_pipeline("L1")
        self.svc.create_pipeline("L2")
        items = self.svc.list_pipelines()
        self.assertGreaterEqual(len(items), 2)


if __name__ == "__main__":
    unittest.main()
