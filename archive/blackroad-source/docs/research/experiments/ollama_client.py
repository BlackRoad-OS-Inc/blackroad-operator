"""
BlackRoad Labs — Ollama Client
Provider-free local LLM inference via Ollama (https://ollama.com).
No external API keys or cloud providers required.

Usage:
    python -m src.ollama_client generate --model llama3 --prompt "Hello"
    python -m src.ollama_client chat --model llama3 --message "Hello"
    python -m src.ollama_client list
    python -m src.ollama_client check
"""
from __future__ import annotations

import argparse
import json
import sys
import urllib.error
import urllib.request
from dataclasses import dataclass, field
from typing import Any, Dict, Iterator, List, Optional

DEFAULT_HOST = "http://localhost:11434"
_DEFAULT_TIMEOUT = 30


# ──────────────────────────────────────────────────────────────────────────────
# Response data classes
# ──────────────────────────────────────────────────────────────────────────────

@dataclass
class GenerateResponse:
    """
    Response from ``/api/generate``.

    Attributes:
        model:      Model name used for the response.
        response:   Generated text.
        done:       Whether generation is complete.
        context:    Token context for follow-up requests.
        total_duration_ns:  Total wall-clock time (nanoseconds).
        load_duration_ns:   Model load time (nanoseconds).
        prompt_eval_count:  Number of tokens in the prompt.
        eval_count:         Number of tokens generated.
        raw:        Full raw response dict from the server.
    """

    model: str
    response: str
    done: bool
    context: List[int] = field(default_factory=list)
    total_duration_ns: int = 0
    load_duration_ns: int = 0
    prompt_eval_count: int = 0
    eval_count: int = 0
    raw: Dict[str, Any] = field(default_factory=dict)

    @classmethod
    def from_dict(cls, d: Dict[str, Any]) -> "GenerateResponse":
        return cls(
            model=d.get("model", ""),
            response=d.get("response", ""),
            done=d.get("done", False),
            context=d.get("context", []),
            total_duration_ns=d.get("total_duration", 0),
            load_duration_ns=d.get("load_duration", 0),
            prompt_eval_count=d.get("prompt_eval_count", 0),
            eval_count=d.get("eval_count", 0),
            raw=d,
        )


@dataclass
class ChatMessage:
    """A single message in a chat conversation."""

    role: str    # "system" | "user" | "assistant"
    content: str

    def to_dict(self) -> Dict[str, str]:
        return {"role": self.role, "content": self.content}

    @classmethod
    def user(cls, content: str) -> "ChatMessage":
        return cls(role="user", content=content)

    @classmethod
    def assistant(cls, content: str) -> "ChatMessage":
        return cls(role="assistant", content=content)

    @classmethod
    def system(cls, content: str) -> "ChatMessage":
        return cls(role="system", content=content)


@dataclass
class ChatResponse:
    """
    Response from ``/api/chat``.

    Attributes:
        model:      Model name used for the response.
        message:    The assistant's reply message.
        done:       Whether generation is complete.
        total_duration_ns:  Total wall-clock time (nanoseconds).
        eval_count:         Number of tokens generated.
        raw:        Full raw response dict from the server.
    """

    model: str
    message: ChatMessage
    done: bool
    total_duration_ns: int = 0
    eval_count: int = 0
    raw: Dict[str, Any] = field(default_factory=dict)

    @classmethod
    def from_dict(cls, d: Dict[str, Any]) -> "ChatResponse":
        msg_dict = d.get("message", {})
        return cls(
            model=d.get("model", ""),
            message=ChatMessage(
                role=msg_dict.get("role", "assistant"),
                content=msg_dict.get("content", ""),
            ),
            done=d.get("done", False),
            total_duration_ns=d.get("total_duration", 0),
            eval_count=d.get("eval_count", 0),
            raw=d,
        )


@dataclass
class ModelInfo:
    """Metadata for a single locally-available Ollama model."""

    name: str
    modified_at: str = ""
    size_bytes: int = 0
    digest: str = ""
    details: Dict[str, Any] = field(default_factory=dict)

    @classmethod
    def from_dict(cls, d: Dict[str, Any]) -> "ModelInfo":
        return cls(
            name=d.get("name", ""),
            modified_at=d.get("modified_at", ""),
            size_bytes=d.get("size", 0),
            digest=d.get("digest", ""),
            details=d.get("details", {}),
        )


# ──────────────────────────────────────────────────────────────────────────────
# Client
# ──────────────────────────────────────────────────────────────────────────────

class OllamaClient:
    """
    Lightweight HTTP client for a locally-running Ollama server.
    No API keys, no cloud providers — 100% local inference.

    Example::

        client = OllamaClient()
        if not client.is_available():
            print("Start Ollama with: ollama serve")
        else:
            resp = client.generate("llama3", "Explain neural nets in one line.")
            print(resp.response)
    """

    def __init__(
        self,
        host: str = DEFAULT_HOST,
        timeout: int = _DEFAULT_TIMEOUT,
    ) -> None:
        self.host    = host.rstrip("/")
        self.timeout = timeout

    # ── Connectivity ──────────────────────────────────────────────────────────

    def is_available(self) -> bool:
        """
        Return ``True`` if the Ollama server is reachable.

        Does a lightweight ``GET /`` health check.  Does **not** raise on
        connection failure — returns ``False`` instead.
        """
        try:
            self._get("/")
            return True
        except Exception:
            return False

    # ── Model management ──────────────────────────────────────────────────────

    def list_models(self) -> List[ModelInfo]:
        """
        Return metadata for every model that Ollama has pulled locally.

        Returns:
            List of :class:`ModelInfo` objects (empty if none pulled yet).

        Raises:
            OllamaError: on HTTP or JSON errors.
        """
        data = self._get("/api/tags")
        return [ModelInfo.from_dict(m) for m in data.get("models", [])]

    # ── Text generation ───────────────────────────────────────────────────────

    def generate(
        self,
        model: str,
        prompt: str,
        system: Optional[str] = None,
        context: Optional[List[int]] = None,
        options: Optional[Dict[str, Any]] = None,
        stream: bool = False,
    ) -> GenerateResponse:
        """
        Generate a single text completion (non-chat).

        Args:
            model:    Model name (e.g. ``"llama3"``, ``"mistral"``).
            prompt:   Input text.
            system:   Optional system prompt to prepend.
            context:  Token context returned by a previous call for multi-turn.
            options:  Model parameter overrides (``temperature``, ``top_p``, …).
            stream:   If ``True``, returns the **final** streamed chunk only.
                      Use :meth:`generate_stream` for per-token iteration.

        Returns:
            :class:`GenerateResponse` with the full generated text.

        Raises:
            OllamaError: on HTTP or JSON errors.
        """
        body: Dict[str, Any] = {"model": model, "prompt": prompt, "stream": stream}
        if system is not None:
            body["system"] = system
        if context is not None:
            body["context"] = context
        if options:
            body["options"] = options

        data = self._post("/api/generate", body)
        return GenerateResponse.from_dict(data)

    def generate_stream(
        self,
        model: str,
        prompt: str,
        system: Optional[str] = None,
        options: Optional[Dict[str, Any]] = None,
    ) -> Iterator[GenerateResponse]:
        """
        Stream text generation token-by-token.

        Yields:
            :class:`GenerateResponse` for each streamed chunk.
            The final chunk has ``done=True``.

        Raises:
            OllamaError: on HTTP or JSON errors.
        """
        body: Dict[str, Any] = {"model": model, "prompt": prompt, "stream": True}
        if system is not None:
            body["system"] = system
        if options:
            body["options"] = options

        yield from self._post_stream("/api/generate", body, GenerateResponse.from_dict)

    # ── Chat ──────────────────────────────────────────────────────────────────

    def chat(
        self,
        model: str,
        messages: List[ChatMessage],
        options: Optional[Dict[str, Any]] = None,
        stream: bool = False,
    ) -> ChatResponse:
        """
        Send a multi-turn chat request.

        Args:
            model:    Model name (e.g. ``"llama3"``).
            messages: Conversation history — list of :class:`ChatMessage`.
            options:  Model parameter overrides.
            stream:   Reserved; set ``False`` for a complete blocking response.

        Returns:
            :class:`ChatResponse` containing the assistant's reply.

        Raises:
            OllamaError: on HTTP or JSON errors.
        """
        body: Dict[str, Any] = {
            "model":    model,
            "messages": [m.to_dict() for m in messages],
            "stream":   stream,
        }
        if options:
            body["options"] = options

        data = self._post("/api/chat", body)
        return ChatResponse.from_dict(data)

    def chat_stream(
        self,
        model: str,
        messages: List[ChatMessage],
        options: Optional[Dict[str, Any]] = None,
    ) -> Iterator[ChatResponse]:
        """
        Stream a chat response token-by-token.

        Yields:
            :class:`ChatResponse` for each chunk.

        Raises:
            OllamaError: on HTTP or JSON errors.
        """
        body: Dict[str, Any] = {
            "model":    model,
            "messages": [m.to_dict() for m in messages],
            "stream":   True,
        }
        if options:
            body["options"] = options

        yield from self._post_stream("/api/chat", body, ChatResponse.from_dict)

    # ── Internal HTTP helpers ─────────────────────────────────────────────────

    def _get(self, path: str) -> Dict[str, Any]:
        url = self.host + path
        req = urllib.request.Request(url, method="GET")
        try:
            with urllib.request.urlopen(req, timeout=self.timeout) as resp:
                return json.loads(resp.read().decode())
        except urllib.error.HTTPError as exc:
            raise OllamaError(f"HTTP {exc.code} from {url}: {exc.read().decode()}") from exc
        except urllib.error.URLError as exc:
            raise OllamaError(f"Cannot reach Ollama at {url}: {exc.reason}") from exc

    def _post(self, path: str, body: Dict[str, Any]) -> Dict[str, Any]:
        url     = self.host + path
        payload = json.dumps(body).encode()
        req     = urllib.request.Request(
            url, data=payload, method="POST",
            headers={"Content-Type": "application/json"},
        )
        try:
            with urllib.request.urlopen(req, timeout=self.timeout) as resp:
                return json.loads(resp.read().decode())
        except urllib.error.HTTPError as exc:
            raise OllamaError(f"HTTP {exc.code} from {url}: {exc.read().decode()}") from exc
        except urllib.error.URLError as exc:
            raise OllamaError(f"Cannot reach Ollama at {url}: {exc.reason}") from exc

    def _post_stream(
        self,
        path: str,
        body: Dict[str, Any],
        parse_fn: Any,
    ) -> Iterator[Any]:
        url     = self.host + path
        payload = json.dumps(body).encode()
        req     = urllib.request.Request(
            url, data=payload, method="POST",
            headers={"Content-Type": "application/json"},
        )
        try:
            with urllib.request.urlopen(req, timeout=self.timeout) as resp:
                for raw_line in resp:
                    line = raw_line.decode().strip()
                    if line:
                        yield parse_fn(json.loads(line))
        except urllib.error.HTTPError as exc:
            raise OllamaError(f"HTTP {exc.code} from {url}: {exc.read().decode()}") from exc
        except urllib.error.URLError as exc:
            raise OllamaError(f"Cannot reach Ollama at {url}: {exc.reason}") from exc


# ──────────────────────────────────────────────────────────────────────────────
# Exceptions
# ──────────────────────────────────────────────────────────────────────────────

class OllamaError(Exception):
    """Raised when the Ollama server returns an error or is unreachable."""


# ──────────────────────────────────────────────────────────────────────────────
# CLI
# ──────────────────────────────────────────────────────────────────────────────

def _build_cli() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(
        prog="ollama_client",
        description="BlackRoad Labs — Ollama local LLM client (no external providers)",
    )
    p.add_argument("--host", default=DEFAULT_HOST, help="Ollama server URL")
    p.add_argument("--timeout", type=int, default=_DEFAULT_TIMEOUT)

    sub = p.add_subparsers(dest="command", required=True)

    # check
    sub.add_parser("check", help="Check if Ollama server is running")

    # list
    sub.add_parser("list", help="List locally available models")

    # generate
    gen = sub.add_parser("generate", help="Generate a text completion")
    gen.add_argument("--model",  required=True, help="Model name (e.g. llama3)")
    gen.add_argument("--prompt", required=True)
    gen.add_argument("--system", default=None)
    gen.add_argument("--temperature", type=float, default=None)
    gen.add_argument("--stream", action="store_true")

    # chat
    cht = sub.add_parser("chat", help="Send a single chat message")
    cht.add_argument("--model",   required=True)
    cht.add_argument("--message", required=True, help="User message text")
    cht.add_argument("--system",  default=None)
    cht.add_argument("--temperature", type=float, default=None)
    cht.add_argument("--stream", action="store_true")

    return p


def main(argv: Optional[List[str]] = None) -> int:
    args   = _build_cli().parse_args(argv)
    client = OllamaClient(host=args.host, timeout=args.timeout)

    if args.command == "check":
        if client.is_available():
            print("✅  Ollama is running at", args.host)
            return 0
        print("❌  Ollama is NOT reachable at", args.host)
        print("    Start it with: ollama serve")
        return 1

    elif args.command == "list":
        try:
            models = client.list_models()
        except OllamaError as e:
            print(f"Error: {e}")
            return 1
        if not models:
            print("No models found. Pull one with: ollama pull llama3")
            return 0
        print(f"\n{'Name':<40} {'Size':>10}  Modified")
        print(f"{'─'*40} {'─'*10}  {'─'*20}")
        for m in models:
            size_gb = m.size_bytes / 1_073_741_824
            print(f"{m.name:<40} {size_gb:>9.2f}G  {m.modified_at[:19]}")
        print()
        return 0

    elif args.command == "generate":
        options = {}
        if args.temperature is not None:
            options["temperature"] = args.temperature
        try:
            if args.stream:
                for chunk in client.generate_stream(
                    args.model, args.prompt,
                    system=args.system, options=options or None,
                ):
                    print(chunk.response, end="", flush=True)
                print()
            else:
                resp = client.generate(
                    args.model, args.prompt,
                    system=args.system, options=options or None,
                )
                print(resp.response)
        except OllamaError as e:
            print(f"Error: {e}")
            return 1
        return 0

    elif args.command == "chat":
        messages: List[ChatMessage] = []
        if args.system:
            messages.append(ChatMessage.system(args.system))
        messages.append(ChatMessage.user(args.message))
        options = {}
        if args.temperature is not None:
            options["temperature"] = args.temperature
        try:
            if args.stream:
                for chunk in client.chat_stream(
                    args.model, messages, options=options or None,
                ):
                    print(chunk.message.content, end="", flush=True)
                print()
            else:
                resp = client.chat(
                    args.model, messages, options=options or None,
                )
                print(resp.message.content)
        except OllamaError as e:
            print(f"Error: {e}")
            return 1
        return 0

    return 1


if __name__ == "__main__":
    sys.exit(main())
