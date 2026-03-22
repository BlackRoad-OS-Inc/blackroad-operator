"""Tests for voting_system.py"""
import pytest
from datetime import datetime, timezone, timedelta
from pathlib import Path
import tempfile

import sys
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))
from voting_system import (
    create_ballot, register_voter, cast_vote, tally, export_results,
    close_ballot, list_ballots, validate_eligibility, verify_vote, get_ballot
)


@pytest.fixture
def tmp_db(tmp_path):
    return tmp_path / "test_voting.db"


def _future(hours=2):
    return (datetime.now(timezone.utc) + timedelta(hours=hours)).isoformat()

def _past(hours=2):
    return (datetime.now(timezone.utc) - timedelta(hours=hours)).isoformat()


def test_create_ballot(tmp_db):
    b = create_ballot("Test Vote", "Desc", ["Yes", "No"], _past(1), _future(2), db_path=tmp_db)
    assert b.id
    assert b.title == "Test Vote"
    assert b.options == ["Yes", "No"]
    assert b.is_active is True


def test_create_ballot_requires_two_options(tmp_db):
    with pytest.raises(ValueError, match="at least 2"):
        create_ballot("Bad", "", ["Only"], _past(1), _future(2), db_path=tmp_db)


def test_register_and_validate_eligibility(tmp_db):
    b = create_ballot("Eligibility Test", "", ["A", "B"], _past(1), _future(2), db_path=tmp_db)
    assert validate_eligibility("voter1", b.id, db_path=tmp_db) is False
    register_voter("voter1", b.id, db_path=tmp_db)
    assert validate_eligibility("voter1", b.id, db_path=tmp_db) is True


def test_cast_vote(tmp_db):
    b = create_ballot("Vote Test", "", ["Yes", "No"], _past(1), _future(2), db_path=tmp_db)
    register_voter("alice", b.id, db_path=tmp_db)
    vote = cast_vote(b.id, "alice", "Yes", db_path=tmp_db)
    assert vote.voter_id == "alice"
    assert vote.choice == "Yes"
    assert len(vote.signature) == 64  # sha256 hex


def test_double_vote_prevented(tmp_db):
    b = create_ballot("Double Vote", "", ["Yes", "No"], _past(1), _future(2), db_path=tmp_db)
    register_voter("bob", b.id, db_path=tmp_db)
    cast_vote(b.id, "bob", "Yes", db_path=tmp_db)
    with pytest.raises(ValueError, match="already voted"):
        cast_vote(b.id, "bob", "No", db_path=tmp_db)


def test_ineligible_voter_rejected(tmp_db):
    b = create_ballot("Eligibility Check", "", ["Yes", "No"], _past(1), _future(2), db_path=tmp_db)
    with pytest.raises(ValueError, match="not registered"):
        cast_vote(b.id, "stranger", "Yes", db_path=tmp_db)


def test_invalid_choice_rejected(tmp_db):
    b = create_ballot("Choice Test", "", ["Yes", "No"], _past(1), _future(2), db_path=tmp_db)
    register_voter("voter", b.id, db_path=tmp_db)
    with pytest.raises(ValueError, match="Invalid choice"):
        cast_vote(b.id, "voter", "Maybe", db_path=tmp_db)


def test_tally(tmp_db):
    b = create_ballot("Tally Test", "", ["A", "B", "C"], _past(1), _future(2), db_path=tmp_db)
    for i, choice in enumerate(["A", "A", "B"]):
        voter = f"v{i}"
        register_voter(voter, b.id, db_path=tmp_db)
        cast_vote(b.id, voter, choice, db_path=tmp_db)
    result = tally(b.id, db_path=tmp_db)
    assert result["total_votes"] == 3
    assert result["counts"]["A"] == 2
    assert result["counts"]["B"] == 1
    assert result["winner"] == "A"


def test_tally_empty_ballot(tmp_db):
    b = create_ballot("Empty", "", ["X", "Y"], _past(1), _future(2), db_path=tmp_db)
    result = tally(b.id, db_path=tmp_db)
    assert result["total_votes"] == 0
    assert result["winner"] is None


def test_export_json(tmp_db):
    b = create_ballot("Export JSON", "", ["Yes", "No"], _past(1), _future(2), db_path=tmp_db)
    register_voter("v1", b.id, db_path=tmp_db)
    cast_vote(b.id, "v1", "Yes", db_path=tmp_db)
    output = export_results(b.id, fmt="json", db_path=tmp_db)
    data = __import__("json").loads(output)
    assert "summary" in data
    assert "votes" in data
    assert data["summary"]["total_votes"] == 1


def test_export_csv(tmp_db):
    b = create_ballot("Export CSV", "", ["Yes", "No"], _past(1), _future(2), db_path=tmp_db)
    register_voter("v1", b.id, db_path=tmp_db)
    cast_vote(b.id, "v1", "Yes", db_path=tmp_db)
    output = export_results(b.id, fmt="csv", db_path=tmp_db)
    assert "voter_id" in output
    assert "v1" in output


def test_close_ballot(tmp_db):
    b = create_ballot("Closeable", "", ["Yes", "No"], _past(1), _future(2), db_path=tmp_db)
    register_voter("v1", b.id, db_path=tmp_db)
    close_ballot(b.id, db_path=tmp_db)
    fetched = get_ballot(b.id, db_path=tmp_db)
    assert fetched["is_active"] is False
    with pytest.raises(ValueError, match="closed"):
        cast_vote(b.id, "v1", "Yes", db_path=tmp_db)


def test_verify_vote_signature(tmp_db):
    b = create_ballot("Sig Test", "", ["Yes", "No"], _past(1), _future(2), db_path=tmp_db)
    register_voter("sv1", b.id, db_path=tmp_db)
    vote = cast_vote(b.id, "sv1", "Yes", db_path=tmp_db)
    assert verify_vote(vote) is True
    vote.signature = "tampered"
    assert verify_vote(vote) is False


def test_list_ballots(tmp_db):
    create_ballot("B1", "", ["Yes", "No"], _past(1), _future(2), db_path=tmp_db)
    create_ballot("B2", "", ["A", "B"], _past(1), _future(2), db_path=tmp_db)
    ballots = list_ballots(db_path=tmp_db)
    assert len(ballots) == 2


def test_voting_window_not_open(tmp_db):
    b = create_ballot("Future Vote", "", ["Yes", "No"], _future(1), _future(3), db_path=tmp_db)
    register_voter("early", b.id, db_path=tmp_db)
    with pytest.raises(ValueError, match="not opened yet"):
        cast_vote(b.id, "early", "Yes", db_path=tmp_db)


def test_voting_window_closed(tmp_db):
    b = create_ballot("Past Vote", "", ["Yes", "No"], _past(4), _past(1), db_path=tmp_db)
    register_voter("late", b.id, db_path=tmp_db)
    with pytest.raises(ValueError, match="closed"):
        cast_vote(b.id, "late", "Yes", db_path=tmp_db)
