import pytest

from workflow.engine import (
    WorkflowError,
    run,
    validate_workflow,
    voice_should_trigger,
)


def _workflow_with_trigger(trigger):
    return {
        "name": "demo",
        "steps": [{"action": "notify", "params": {"channel": "ops"}}],
        "trigger": trigger,
    }


def test_voice_trigger_requires_wake_words():
    workflow = _workflow_with_trigger({"type": "voice"})
    with pytest.raises(WorkflowError) as exc:
        validate_workflow(workflow)
    assert exc.value.args[0] == "VOICE_TRIGGER_NO_WAKE_WORDS"


def test_voice_trigger_normalises_strings():
    workflow = _workflow_with_trigger(
        {
            "type": "voice",
            "wake_word": " Hey Prism ",
            "intent": "Launch Report ",
        }
    )

    validated = validate_workflow(workflow)
    trigger = validated["trigger"]

    assert trigger["wake_words"] == ["hey prism"]
    assert trigger["intents"] == ["launch report"]


def test_voice_trigger_confidence_threshold():
    workflow = _workflow_with_trigger(
        {
            "type": "voice",
            "wake_words": ["hey prism"],
            "intents": ["start workflow"],
            "minimum_confidence": 0.75,
        }
    )

    low_confidence_event = {
        "transcript": "Hey Prism start workflow",
        "confidence": 0.5,
        "intents": ["start workflow"],
    }

    assert not voice_should_trigger(workflow, low_confidence_event)

    confident_event = {**low_confidence_event, "confidence": 0.95}
    assert voice_should_trigger(workflow, confident_event)


def test_voice_trigger_requires_matching_intent_when_present():
    workflow = _workflow_with_trigger(
        {
            "type": "voice",
            "wake_words": ["ok prism"],
            "intents": ["open ticket"],
        }
    )

    mismatched_event = {
        "transcript": "Ok Prism close the ticket",
        "intents": ["close ticket"],
    }
    assert not voice_should_trigger(workflow, mismatched_event)

    matching_event = {
        "transcript": "Ok Prism please open ticket",
        "intents": ["OPEN TICKET"],
    }
    assert voice_should_trigger(workflow, matching_event)


def test_run_still_validates_workflow_shape():
    with pytest.raises(WorkflowError):
        run({"steps": "not-a-list"})

