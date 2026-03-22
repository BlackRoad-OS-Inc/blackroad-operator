"""Tests for EXP-002: Trinary Logic Reasoning"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from experiments.exp_002_trinary_logic.run import KnowledgeBase, kleene_and, kleene_or, kleene_not


def test_kleene_not():
    assert kleene_not(1) == -1
    assert kleene_not(-1) == 1
    assert kleene_not(0) == 0


def test_kleene_and():
    assert kleene_and(1, 1) == 1
    assert kleene_and(1, -1) == -1
    assert kleene_and(1, 0) == 0
    assert kleene_and(-1, -1) == -1
    assert kleene_and(0, -1) == -1


def test_kleene_or():
    assert kleene_or(1, 0) == 1
    assert kleene_or(1, -1) == 1
    assert kleene_or(-1, -1) == -1
    assert kleene_or(-1, 0) == 0
    assert kleene_or(0, 0) == 0


def test_assert_true():
    kb = KnowledgeBase()
    kb.assert_true("sky is blue")
    assert kb.states["sky is blue"].value == 1


def test_assert_false():
    kb = KnowledgeBase()
    kb.assert_false("2+2=5")
    assert kb.states["2+2=5"].value == -1


def test_contradiction_quarantines():
    kb = KnowledgeBase()
    kb.assert_true("API uses REST")
    kb.assert_false("API uses REST")
    assert "API uses REST" in kb.quarantine


def test_observe_is_unknown():
    kb = KnowledgeBase()
    kb.observe("user timezone")
    assert kb.states["user timezone"].value == 0


def test_no_contradiction_on_observe_then_assert():
    kb = KnowledgeBase()
    kb.observe("server is up")
    kb.assert_true("server is up")
    assert "server is up" not in kb.quarantine
    assert kb.states["server is up"].value == 1

