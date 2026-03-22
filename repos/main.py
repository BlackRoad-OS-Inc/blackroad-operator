"""Streamlit entrypoint for the BlackRoad Prism Generator console."""

from __future__ import annotations

import io
"""Streamlit app for the BlackRoad Prism Generator with GPT and voice input."""

from __future__ import annotations

import importlib
import importlib.util
import os
import tempfile
from typing import Any, Optional
from datetime import datetime

import matplotlib.pyplot as plt
import numpy as np
import streamlit as st
from openai import OpenAI
from streamlit.runtime.uploaded_file_manager import UploadedFile

from prism_console import PRISM_APP
from prism_utils import parse_numeric_prefix


_api_key = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=_api_key) if _api_key else None
# Instantiate the OpenAI client only when an API key is available so the
# module can still import and Streamlit can display a friendly warning instead
# of crashing at startup.
# Configure the OpenAI client only when an API key is available
openai_api_key = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=openai_api_key) if openai_api_key else None
if client is None:
    st.warning("OpenAI API key not set. Set OPENAI_API_KEY to enable responses.")
def _init_page() -> None:
    """Configure Streamlit and show global metadata."""
_SYSTEM_PROMPT = (
    "You are the BlackRoad Venture Console AI, a holographic assistant that replies "
    "with scientific and symbolic insights."
)

st.set_page_config(layout="wide", page_title="BlackRoad Prism Console")


@st.cache_resource
def get_whisper_model() -> Optional[Any]:
    """Load and cache the Whisper model once for the session."""

    if importlib.util.find_spec("whisper") is None:
        return None

    whisper_module = importlib.import_module("whisper")
    return whisper_module.load_model("base")

    st.set_page_config(**PRISM_APP["page_config"])
    st.title(PRISM_APP["metadata"]["title"])
    st.markdown(PRISM_APP["metadata"]["instructions"])

@st.cache_resource
def get_openai_client(api_key: Optional[str]) -> Optional[OpenAI]:
    """Instantiate the OpenAI client if an API key is available."""

    if not api_key:
        return None
    return OpenAI(api_key=api_key)


def ensure_session_state() -> None:
    """Initialize Streamlit session state defaults."""

    if "chat_history" not in st.session_state:
        st.session_state.chat_history = [
            {"role": "system", "content": _SYSTEM_PROMPT},
        ]
    st.session_state.setdefault("last_amplitude", 1.0)
    st.session_state.setdefault("pending_voice_input", "")
    st.session_state.setdefault("last_voice_preview", "")
    st.session_state.setdefault("whisper_error_notified", False)

_init_page()
CLIENT, API_KEY = PRISM_APP["create_client"]()
if not API_KEY:
    st.warning("OpenAI API key not set; responses will be unavailable.")


def _render_hologram(prompt: str) -> None:
    """Render a simple holographic-style projection based on ``prompt``."""

    magnitude = parse_numeric_prefix(prompt)
    x = np.linspace(-5, 5, 100)
    y = np.linspace(-5, 5, 100)
    x_grid, y_grid = np.meshgrid(x, y)
    z_grid = np.sin(np.sqrt(x_grid**2 + y_grid**2)) * magnitude

    fig = plt.figure(figsize=(6, 4))
    ax = fig.add_subplot(111, projection="3d")
    ax.plot_surface(x_grid, y_grid, z_grid, cmap="plasma")
    ax.axis("off")

    buffer = io.BytesIO()
    plt.savefig(buffer, format="png", bbox_inches="tight", pad_inches=0)
    buffer.seek(0)
    st.image(buffer, caption="Holographic projection based on your prompt")
    plt.close(fig)
def transcribe_audio(uploaded_file: UploadedFile) -> str:
    """Transcribe an uploaded audio file with Whisper and return the text."""

    model = get_whisper_model()
    if model is None:
        if not st.session_state.get("whisper_error_notified", False):
            st.error(
                "Voice transcription requires the optional 'whisper' dependency. "
                "Install it with `pip install openai-whisper` to enable this feature."
            )
            st.session_state["whisper_error_notified"] = True
        return ""

    suffix = os.path.splitext(uploaded_file.name)[1] or ".wav"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp_file:
        tmp_file.write(uploaded_file.read())
        temp_path = tmp_file.name
    try:
        uploaded_file.seek(0)  # type: ignore[attr-defined]
    except Exception:
        pass
    try:
        result = model.transcribe(temp_path)
    except Exception as exc:  # pragma: no cover - runtime/ffmpeg failure
        st.error(f"Voice transcription failed: {exc}")
        result = {"text": ""}
    finally:
        try:
            os.remove(temp_path)
        except OSError:
            pass
    text = result.get("text", "").strip()
    return text


def process_audio_input(audio_file: Optional[UploadedFile]) -> None:
    """Process voice input once and stage it as a pending user message."""

    if audio_file is None:
        return

def _collect_user_input() -> str:
    """Return the user's spoken or typed input."""

    audio_file = st.file_uploader("Upload your voice (mp3 or wav)", type=["mp3", "wav"])
    if audio_file is not None:
        transcript = PRISM_APP["transcribe_audio"](audio_file)
        st.markdown(f"**You said:** {transcript}")
        return transcript.strip()
    return result["text"]


# Initialize chat history
if "chat_history" not in st.session_state:
    st.session_state.chat_history = [
        {
            "role": "system",
            "content": (
                "You are the BlackRoad Venture Console AI, a holographic assistant that replies "
                "with scientific and symbolic insights."
            ),
        }
    ]

# Initialize terminal output log
if "terminal_log" not in st.session_state:
    st.session_state.terminal_log = []
    timestamp = datetime.now().strftime("%H:%M:%S")
    st.session_state.terminal_log.append(f"[{timestamp}] System initialized")
    st.session_state.terminal_log.append(f"[{timestamp}] BlackRoad Prism Console ready")


def log_to_terminal(message: str) -> None:
    """Add a timestamped message to the terminal log."""
    timestamp = datetime.now().strftime("%H:%M:%S")
    st.session_state.terminal_log.append(f"[{timestamp}] {message}")
    # Keep only the last 50 messages
    if len(st.session_state.terminal_log) > 50:
        st.session_state.terminal_log = st.session_state.terminal_log[-50:]

st.markdown(
    "#### Speak or type an idea, formula, or question. The AI will respond and project a hologram:"
)

audio_file = st.file_uploader("Upload your voice (mp3 or wav)", type=["mp3", "wav"])
if audio_file is not None:
    log_to_terminal(f"Audio file uploaded: {audio_file.name}")
    user_input = transcribe_audio(audio_file)
    log_to_terminal(f"Transcription complete: {len(user_input)} characters")
    st.markdown(f"**You said:** {user_input}")
else:
    user_input = st.text_input("Or type here")

    return st.text_input("Or type here").strip()


user_prompt = _collect_user_input()
if user_prompt:
    if CLIENT is None:
        st.error("OpenAI API key not set.")
        log_to_terminal("ERROR: OpenAI API key not configured")
    else:
        placeholder = st.empty()
        placeholder.write("Processing request...")
        reply = PRISM_APP["run_completion"](CLIENT, user_prompt, st.session_state)
        placeholder.markdown(f"**Venture Console AI:** {reply}")
        _render_hologram(user_prompt)

st.markdown("---")
st.markdown("**BlackRoad Prism Console** | Live UI Simulation")
st.image(
    "72BF9767-A2EE-4CB6-93F4-4D738108BC4B.png",
    caption="Live Console Interface",
)
    audio_id = getattr(audio_file, "id", audio_file.name)
    if st.session_state.get("processed_audio_id") == audio_id:
        return

    with st.spinner("Transcribing voice input..."):
        transcript = transcribe_audio(audio_file)

    st.session_state["processed_audio_id"] = audio_id
    st.session_state["pending_voice_input"] = transcript
    st.session_state["last_voice_preview"] = transcript
    if transcript:
        st.success("Voice transcription captured. Sending to the console…")
    else:
        st.warning("The transcription was empty. Try recording again.")


def capture_user_message() -> Optional[str]:
    """Capture typed or voice-derived user input for the conversation."""

    typed_message = st.chat_input(
        "Speak or type an idea, formula, or question for the Venture Console AI."
    )
    if typed_message and typed_message.strip():
        return typed_message.strip()

    pending_voice = st.session_state.get("pending_voice_input", "").strip()
    if pending_voice:
        st.session_state["pending_voice_input"] = ""
        return pending_voice
    return None


def trim_history(max_messages: int = 25) -> None:
    """Keep the chat history from growing without bounds."""

    history = st.session_state.chat_history
    if len(history) <= max_messages:
        return

    system_message = history[0]
    recent_messages = history[-(max_messages - 1) :]
    st.session_state.chat_history = [system_message, *recent_messages]


def generate_assistant_reply(client: Optional[OpenAI]) -> Optional[str]:
    """Invoke the OpenAI chat completion API and return the assistant reply."""

    if client is None:
        st.error("OpenAI API key not set. Set OPENAI_API_KEY to enable responses.")
        return None

    try:
        log_to_terminal(f"User input: {user_input[:50]}{'...' if len(user_input) > 50 else ''}")
        st.session_state.chat_history.append({"role": "user", "content": user_input})
        log_to_terminal("Sending request to GPT-4o-mini...")
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=st.session_state.chat_history,
            temperature=0.6,
        )
    except Exception as exc:  # pragma: no cover - network/runtime failure
        st.error(f"Failed to generate a response: {exc}")
        return None
        assistant_reply = response.choices[0].message.content
        log_to_terminal(f"Received response: {len(assistant_reply)} characters")
        st.session_state.chat_history.append({"role": "assistant", "content": assistant_reply})
        st.markdown(f"**Venture Console AI:** {assistant_reply}")

        magnitude = parse_numeric_prefix(user_input)
        log_to_terminal(f"Generating hologram with magnitude: {magnitude}")
        fig = plt.figure(figsize=(6, 4))
        ax = fig.add_subplot(111, projection="3d")
        x = np.linspace(-5, 5, 100)
        y = np.linspace(-5, 5, 100)
        x, y = np.meshgrid(x, y)
        z = np.sin(np.sqrt(x**2 + y**2)) * magnitude
        ax.plot_surface(x, y, z, cmap="plasma")
        ax.axis("off")

        buf = io.BytesIO()
        plt.savefig(buf, format="png")
        buf.seek(0)
        st.image(buf)
        plt.close(fig)
        log_to_terminal("Hologram projection complete")

# Terminal Output Section
st.markdown("---")
st.markdown("### 💻 Terminal Output")
terminal_text = "\n".join(st.session_state.terminal_log)
st.code(terminal_text, language="bash")

    if not response.choices:
        return None

    message = getattr(response.choices[0], "message", None)
    content = getattr(message, "content", "") if message else ""
    return content.strip() or None


def handle_user_message(user_input: str, client: Optional[OpenAI]) -> None:
    """Append the user message, call the model, and record the reply."""

    user_input = user_input.strip()
    if not user_input:
        return

    st.session_state.chat_history.append({"role": "user", "content": user_input})
    st.session_state.last_amplitude = parse_numeric_prefix(user_input)
    trim_history()

    reply = generate_assistant_reply(client)
    if reply:
        st.session_state.chat_history.append({"role": "assistant", "content": reply})
        trim_history()


def render_chat_history() -> None:
    """Display the conversation using Streamlit's chat message component."""

    for message in st.session_state.chat_history:
        if message["role"] == "system":
            continue
        with st.chat_message(message["role"]):
            st.markdown(message["content"])


def render_prism(
    amplitude: float,
    frequency: float,
    grid_size: int,
    colormap: str,
    show_axes: bool,
    show_wireframe: bool,
) -> None:
    """Render the holographic prism visualization based on the controls."""

    x = np.linspace(-5, 5, grid_size)
    y = np.linspace(-5, 5, grid_size)
    x_mesh, y_mesh = np.meshgrid(x, y)
    radius = np.sqrt(x_mesh**2 + y_mesh**2)
    z = np.sin(frequency * radius) * amplitude

    fig = plt.figure(figsize=(6, 5))
    ax = fig.add_subplot(111, projection="3d")
    surface = ax.plot_surface(
        x_mesh,
        y_mesh,
        z,
        cmap=colormap,
        linewidth=0,
        antialiased=True,
        alpha=0.92,
    )

    if show_wireframe:
        ax.plot_wireframe(x_mesh, y_mesh, z, color="white", linewidth=0.3, alpha=0.6)

    if show_axes:
        ax.set_xlabel("X")
        ax.set_ylabel("Y")
        ax.set_zlabel("Intensity")
    else:
        ax.set_axis_off()

    ax.view_init(elev=35, azim=225)
    fig.colorbar(surface, shrink=0.6, aspect=12, pad=0.1)
    st.pyplot(fig, use_container_width=True)
    plt.close(fig)


def main() -> None:
    """Entrypoint for the Streamlit application."""

    ensure_session_state()

    api_key = os.getenv("OPENAI_API_KEY")
    client = get_openai_client(api_key)
    if client is None:
        st.warning("OpenAI API key not set. Set OPENAI_API_KEY to enable responses.")

    with st.sidebar:
        st.header("Voice Input")
        audio_file = st.file_uploader("Upload your voice (mp3 or wav)", type=["mp3", "wav"])
        process_audio_input(audio_file)
        if st.session_state.get("last_voice_preview"):
            st.caption(f"Latest transcription: {st.session_state.last_voice_preview}")

        st.header("Prism Controls")
        base_amplitude = st.slider("Base amplitude scale", 0.5, 5.0, value=1.0, step=0.1)
        frequency = st.slider("Frequency multiplier", 0.5, 4.0, value=1.0, step=0.1)
        grid_size = st.slider("Grid density", 30, 200, value=80, step=10)
        colormap = st.selectbox(
            "Colormap",
            ["plasma", "viridis", "magma", "cividis", "inferno"],
            index=0,
        )
        show_axes = st.checkbox("Show axes", value=False)
        show_wireframe = st.checkbox("Overlay wireframe", value=False)

    user_message = capture_user_message()
    if user_message:
        handle_user_message(user_message, client)

    st.title("BlackRoad Prism Generator with GPT + Voice Console")
    st.caption(
        "Speak or type an idea, formula, or question. The AI will respond and project a hologram."
    )

    if st.session_state.get("last_voice_preview"):
        st.markdown(f"**Latest voice transcription:** {st.session_state.last_voice_preview}")

    col1, col2 = st.columns((3, 2))

    with col1:
        render_chat_history()

    with col2:
        input_amplitude = st.session_state.get("last_amplitude", 1.0)
        rendered_amplitude = base_amplitude * input_amplitude
        st.subheader("Prism Projection")
        render_prism(
            amplitude=rendered_amplitude,
            frequency=frequency,
            grid_size=grid_size,
            colormap=colormap,
            show_axes=show_axes,
            show_wireframe=show_wireframe,
        )
        st.markdown(
            f"""
            - **Input magnitude:** `{input_amplitude:.2f}`
            - **Base amplitude scale:** `{base_amplitude:.2f}`
            - **Frequency multiplier:** `{frequency:.2f}`
            - **Rendered amplitude:** `{rendered_amplitude:.2f}`
            """
        )

    st.markdown("---")
    st.markdown("**BlackRoad Prism Console** | Live UI Simulation")
    st.image(
        "72BF9767-A2EE-4CB6-93F4-4D738108BC4B.png",
        caption="Live Console Interface",
        use_column_width=True,
    )


if __name__ == "__main__":
    main()
