"""Property-based tests for redaction."""

from __future__ import annotations

import string

from hypothesis import given
from hypothesis import strategies as st

from orchestrator.redaction import redact_text


@given(st.text(alphabet=string.ascii_letters + string.digits + "@._-"))
def test_redaction_never_raises(random_text: str) -> None:
    """Redaction should never raise for arbitrary strings."""

    redacted, _ = redact_text(random_text)
    assert isinstance(redacted, str)
