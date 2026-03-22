"""Configuration helpers for the Prism console app."""

from __future__ import annotations

import os
from typing import Dict, Optional, Tuple

from openai import OpenAI

PAGE_CONFIG: Dict[str, str] = {"layout": "wide"}

APP_METADATA: Dict[str, str] = {
    "title": "BlackRoad Prism Generator with GPT + Voice Console",
    "instructions": (
        "#### Speak or type an idea, formula, or question. The AI will respond and "
        "project a hologram:"
    ),
}


def create_openai_client() -> Tuple[Optional[OpenAI], Optional[str]]:
    """Create an OpenAI client and return it alongside the API key used."""

    api_key = os.getenv("OPENAI_API_KEY")
    client = OpenAI(api_key=api_key) if api_key else None
    return client, api_key
