"""Central registry describing the working pieces of the console app."""

from __future__ import annotations

from . import audio, chat, config

PRISM_APP = {
    "page_config": config.PAGE_CONFIG,
    "metadata": config.APP_METADATA,
    "create_client": config.create_openai_client,
    "transcribe_audio": audio.transcribe_audio,
    "run_completion": chat.run_chat_completion,
    "system_prompt": chat.SYSTEM_PROMPT,
}
