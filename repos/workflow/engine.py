"""Workflow execution primitives.

This module intentionally keeps the execution surface very small but provides
robust validation so higher-level callers can rely on consistent behaviour.

The newly added voice trigger helpers make it possible to wire audio driven
workflows without leaking validation logic throughout the codebase.
"""

from __future__ import annotations

from collections.abc import Iterable, Mapping
from typing import Any, Dict, List, Optional


class WorkflowError(Exception):
    """Raised when a workflow definition or event payload is invalid."""


def run(workflow: Dict[str, Any]) -> bool:
    """Validate a workflow definition before executing it.

    The execution engine is intentionally simple – for now it only verifies the
    workflow structure.  Validation is centralised here to avoid duplicating the
    same defensive checks everywhere the workflow runner is used.
    """

    validate_workflow(workflow)
    return True


def validate_workflow(workflow: Dict[str, Any]) -> Dict[str, Any]:
    """Return a validated (and slightly normalised) workflow definition."""

    if not isinstance(workflow, dict):
        raise WorkflowError("INVALID_WORKFLOW")

    steps = workflow.get("steps")
    if not isinstance(steps, list) or not steps:
        raise WorkflowError("NO_STEPS")

    normalised_steps: List[Dict[str, Any]] = []
    for step in steps:
        if not isinstance(step, dict):
            raise WorkflowError("INVALID_STEP")
        if "action" not in step and "condition" not in step:
            raise WorkflowError("INVALID_STEP")
        normalised_steps.append(dict(step))

    trigger = workflow.get("trigger")
    normalised_trigger = _validate_trigger(trigger)

    validated: Dict[str, Any] = dict(workflow)
    validated["steps"] = normalised_steps
    if normalised_trigger is not None:
        validated["trigger"] = normalised_trigger
    elif "trigger" in validated:
        del validated["trigger"]

    return validated


def voice_should_trigger(workflow: Dict[str, Any], voice_event: Dict[str, Any]) -> bool:
    """Return True when a voice event satisfies the workflow's trigger rules."""

    validated = validate_workflow(workflow)
    trigger = validated.get("trigger")
    if not trigger or trigger.get("type") != "voice":
        return False

    if not isinstance(voice_event, dict):
        raise WorkflowError("VOICE_EVENT_INVALID")

    transcript = voice_event.get("transcript")
    if not isinstance(transcript, str):
        raise WorkflowError("VOICE_EVENT_INVALID_TRANSCRIPT")

    transcript_norm = transcript.strip().lower()
    if not transcript_norm:
        return False

    minimum_confidence = trigger.get("minimum_confidence")
    if minimum_confidence is not None:
        confidence = voice_event.get("confidence")
        if not isinstance(confidence, (int, float)):
            return False
        if confidence < minimum_confidence:
            return False

    intents_source: Optional[Any] = voice_event.get("intents")
    if intents_source is None and "intent" in voice_event:
        intents_source = voice_event["intent"]
    event_intents = _normalise_string_sequence(
        intents_source,
        error_code="VOICE_EVENT_INVALID_INTENTS",
        allow_empty=True,
    )

    wake_words: Iterable[str] = trigger.get("_voice_wake_words", [])
    if not any(word in transcript_norm for word in wake_words):
        return False

    trigger_intents: Iterable[str] = trigger.get("_voice_intents", [])
    if not trigger_intents:
        return True

    return bool(set(trigger_intents).intersection(event_intents))


def _validate_trigger(trigger: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    if trigger is None:
        return None
    if not isinstance(trigger, dict):
        raise WorkflowError("INVALID_TRIGGER")

    trigger_type = trigger.get("type")
    if not isinstance(trigger_type, str):
        raise WorkflowError("INVALID_TRIGGER")

    trigger_type_normalised = trigger_type.strip().lower()
    if trigger_type_normalised == "voice":
        return _validate_voice_trigger(trigger)

    if trigger_type_normalised in {"manual", "event", "schedule"}:
        normalised = dict(trigger)
        normalised["type"] = trigger_type_normalised
        return normalised

    raise WorkflowError("UNSUPPORTED_TRIGGER_TYPE")


def _validate_voice_trigger(trigger: Dict[str, Any]) -> Dict[str, Any]:
    normalised = dict(trigger)
    normalised["type"] = "voice"

    wake_source: Optional[Any] = trigger.get("wake_words")
    if wake_source is None and "wake_word" in trigger:
        wake_source = trigger["wake_word"]
    wake_words = _normalise_string_sequence(
        wake_source,
        error_code="VOICE_TRIGGER_NO_WAKE_WORDS",
        allow_empty=False,
    )
    normalised["wake_words"] = wake_words
    normalised["_voice_wake_words"] = wake_words

    intents_source: Optional[Any] = trigger.get("intents")
    if intents_source is None and "intent" in trigger:
        intents_source = trigger["intent"]
    intents = _normalise_string_sequence(
        intents_source,
        error_code="VOICE_TRIGGER_INVALID_INTENTS",
        allow_empty=True,
    )
    if intents:
        normalised["intents"] = intents
    elif "intents" in normalised:
        del normalised["intents"]
    normalised["_voice_intents"] = intents

    minimum_confidence = trigger.get("minimum_confidence")
    if minimum_confidence is not None:
        if not isinstance(minimum_confidence, (int, float)):
            raise WorkflowError("VOICE_TRIGGER_INVALID_CONFIDENCE")
        minimum_confidence = float(minimum_confidence)
        if not 0.0 <= minimum_confidence <= 1.0:
            raise WorkflowError("VOICE_TRIGGER_INVALID_CONFIDENCE")
        normalised["minimum_confidence"] = minimum_confidence

    return normalised


def _normalise_string_sequence(
    value: Optional[Any], *, error_code: str, allow_empty: bool
) -> List[str]:
    if value is None:
        return [] if allow_empty else _raise(error_code)

    if isinstance(value, str):
        candidates: Iterable[Any] = [value]
    elif isinstance(value, Mapping):
        candidates = list(value.values())
    elif isinstance(value, Iterable):
        candidates = list(value)
    else:
        raise WorkflowError(error_code)

    normalised: List[str] = []
    for candidate in candidates:
        if not isinstance(candidate, str):
            raise WorkflowError(error_code)
        cleaned = candidate.strip()
        if not cleaned:
            continue
        normalised.append(cleaned.lower())

    if not normalised and not allow_empty:
        raise WorkflowError(error_code)

    return normalised


def _raise(error_code: str) -> None:
    raise WorkflowError(error_code)
