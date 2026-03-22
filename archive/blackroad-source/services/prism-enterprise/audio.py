"""Audio transcription helpers used by the Streamlit console."""

from __future__ import annotations

import os
import tempfile
from typing import Protocol

import streamlit as st
import whisper


class UploadedAudio(Protocol):
    """Subset of Streamlit's UploadedFile API used for transcription."""

    name: str

    def read(self) -> bytes:  # pragma: no cover - defined by Streamlit
        ...


@st.cache_resource
def load_whisper_model(model_size: str = "base"):
    """Load and cache the Whisper model across Streamlit reruns."""

    return whisper.load_model(model_size)


def transcribe_audio(uploaded_file: UploadedAudio) -> str:
    """Transcribe an uploaded audio file using Whisper."""

    suffix = os.path.splitext(uploaded_file.name)[1] or ".wav"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_audio:
        temp_audio.write(uploaded_file.read())
        temp_path = temp_audio.name

    model = load_whisper_model()
    result = model.transcribe(temp_path)
    os.remove(temp_path)
    return result["text"]
