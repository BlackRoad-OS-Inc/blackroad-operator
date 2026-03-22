# EXP-002: Trinary Logic Reasoning

**Hypothesis**: Three-valued (trinary) logic with Kleene operators provides better epistemic
reasoning for AI agents than classical boolean logic, especially for uncertain/unknown states.

**Method**:
- Implement Kleene K3 logic: True=1, Unknown=0, False=-1
- Test contradiction detection and automatic quarantine
- Compare reasoning outcomes vs boolean logic

**Expected**:
- AND(TRUE, UNKNOWN) = UNKNOWN (not FALSE as in classical logic)
- Contradicted claims auto-quarantined, not dropped
- Agent knowledge base stays consistent under uncertainty

**Results**: See `run.py`

**Status**: ✅ Confirmed — trinary logic prevents false negatives under uncertainty
