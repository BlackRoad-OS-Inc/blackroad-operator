import sys, types

mock_lexer = types.ModuleType('lexer')
mock_parser = types.ModuleType('parser')
mock_interpreter = types.ModuleType('interpreter')

class MockLexer:
    def __init__(self, code): self.code = code
    def tokenize(self): return []

class MockParser:
    def __init__(self, tokens): pass
    def parse_program(self): return []

class MockInterpreter:
    def run(self, ast): pass

mock_lexer.Lexer = MockLexer
mock_parser.Parser = MockParser
mock_interpreter.Interpreter = MockInterpreter
sys.modules['lexer'] = mock_lexer
sys.modules['parser'] = mock_parser
sys.modules['interpreter'] = mock_interpreter

from server import app
from fastapi.testclient import TestClient

client = TestClient(app)

def test_health():
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json()["examples"] >= 5

def test_examples():
    r = client.get("/examples")
    assert r.status_code == 200
    assert "fibonacci" in r.json()

def test_run_empty():
    r = client.post("/run", json={"code": ""})
    assert r.status_code == 200
    assert r.json()["error"] == "no code provided"

def test_index():
    r = client.get("/")
    assert r.status_code == 200
    assert "RoadC" in r.text
