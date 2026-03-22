"""Tests for PII redaction."""

from __future__ import annotations

from orchestrator.redaction import ensure_redacted, redact_text


def test_redact_email():
    redacted, stats = redact_text("Contact alice@example.com for help")
    assert "alice@example.com" not in redacted
    assert stats.emails == 1


def test_ensure_redacted_mapping():
    payload = {"email": "bob@example.com", "notes": "Call +1-202-555-0101"}
    result = ensure_redacted(payload)
    assert "example.com" not in str(result)
    assert "202-555-0101" not in str(result)
