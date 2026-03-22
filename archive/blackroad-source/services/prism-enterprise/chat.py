"""Chat helpers for interacting with the OpenAI client."""

from __future__ import annotations

from typing import Dict, List

from openai import OpenAI

SYSTEM_PROMPT = (
    "You are the BlackRoad Venture Console AI, a holographic assistant that replies "
    "with scientific and symbolic insights."
)


def _ensure_history(session_state: Dict) -> List[Dict[str, str]]:
    """Ensure the session state contains the seeded chat history."""

    session_state.setdefault("chat_history", [{"role": "system", "content": SYSTEM_PROMPT}])
    return session_state["chat_history"]


def run_chat_completion(client: OpenAI, user_input: str, session_state: Dict) -> str:
    """Send the conversation to OpenAI and persist the assistant reply."""

    history = _ensure_history(session_state)
    history.append({"role": "user", "content": user_input})
    response = client.chat.completions.create(model="gpt-4o-mini", messages=history)
    reply = response.choices[0].message["content"]
    history.append({"role": "assistant", "content": reply})
    return reply
