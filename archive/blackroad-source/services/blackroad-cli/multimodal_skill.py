"""Multimodal & advanced AI skills — vision, audio, real-time, edge compute.

Copyright (c) 2024-2026 BlackRoad OS, Inc. All rights reserved.

This software is proprietary and confidential. Unauthorized copying, transfer,
or reproduction of this file, via any medium, is strictly prohibited.

Licensed for non-commercial testing and evaluation purposes only.
Commercial use requires a separate license agreement with BlackRoad OS, Inc.

For licensing inquiries: legal@blackroad.io

Skills:
  33. Vision — image understanding, OCR, diagram parsing
  34. Audio — speech-to-text, text-to-speech, audio analysis
  35. Function calling — structured tool invocation
  36. Streaming — real-time token streaming with backpressure
  37. Edge inference — optimized for Pi fleet (Hailo-8, quantization)
  38. Prompt optimization — auto-tuning prompts for quality
  39. Data extraction — tables, forms, invoices, receipts
  40. Workflow automation — trigger → condition → action chains
"""

from __future__ import annotations

import json
import os
import re
import time
from dataclasses import dataclass, field
from typing import Any, Callable, Dict, List, Optional, Tuple


# ---------------------------------------------------------------------------
# 33. Vision
# ---------------------------------------------------------------------------

def vision_prompt(
    task: str = "describe",
    detail: str = "high",
    context: str = "",
) -> Dict[str, Any]:
    """Generate a vision analysis prompt structure.

    task: describe, ocr, diagram, compare, count, detect
    """
    tasks = {
        "describe": "Describe this image in detail. Include objects, text, colors, layout.",
        "ocr": "Extract ALL text visible in this image. Preserve formatting and layout.",
        "diagram": (
            "Analyze this diagram/architecture. Identify:\n"
            "- Components and their names\n"
            "- Connections and data flows\n"
            "- Any labels or annotations\n"
            "Output as structured data."
        ),
        "compare": "Compare these images. What's different? What's the same?",
        "count": "Count all instances of objects in this image. Be precise.",
        "detect": "Identify and locate all objects in this image with bounding descriptions.",
        "code": "Extract the code shown in this image. Preserve exact formatting and syntax.",
        "ui": (
            "Analyze this UI screenshot:\n"
            "- What elements are visible?\n"
            "- What's the layout structure?\n"
            "- Any accessibility concerns?\n"
            "- Suggest improvements."
        ),
    }

    return {
        "system": tasks.get(task, tasks["describe"]),
        "detail": detail,
        "context": context,
        "output_format": "structured" if task in ("diagram", "detect", "ui") else "text",
    }


@dataclass
class ImageAnalysis:
    """Result of an image analysis."""
    description: str = ""
    objects: List[str] = field(default_factory=list)
    text_content: str = ""
    colors: List[str] = field(default_factory=list)
    layout: str = ""
    metadata: Dict[str, Any] = field(default_factory=dict)


# ---------------------------------------------------------------------------
# 34. Audio
# ---------------------------------------------------------------------------

@dataclass
class AudioConfig:
    """Configuration for audio processing."""
    sample_rate: int = 16000
    channels: int = 1
    format: str = "wav"
    language: str = "en"
    model: str = "whisper"


def stt_prompt(language: str = "en", context: str = "") -> str:
    """Generate a speech-to-text processing prompt."""
    return (
        f"Transcribe the following audio.\n"
        f"Language: {language}\n"
        f"{'Context: ' + context if context else ''}\n\n"
        f"Rules:\n"
        f"- Include punctuation and capitalization\n"
        f"- Mark unclear words with [unclear]\n"
        f"- Note speaker changes with [Speaker N]\n"
        f"- Include timestamps at paragraph breaks\n"
    )


def tts_config(
    voice: str = "default",
    speed: float = 1.0,
    pitch: float = 1.0,
    format: str = "mp3",
) -> Dict[str, Any]:
    """Generate TTS configuration."""
    return {
        "voice": voice,
        "speed": max(0.5, min(2.0, speed)),
        "pitch": max(0.5, min(2.0, pitch)),
        "format": format,
        "sample_rate": 22050,
    }


# ---------------------------------------------------------------------------
# 35. Function Calling
# ---------------------------------------------------------------------------

@dataclass
class FunctionDef:
    """A function definition for LLM function calling."""
    name: str
    description: str
    parameters: Dict[str, Any]
    required: List[str] = field(default_factory=list)
    returns: str = ""


def function_calling_prompt(
    functions: List[FunctionDef],
    user_message: str,
) -> Dict[str, Any]:
    """Generate a function calling prompt in OpenAI-compatible format."""
    tools = []
    for func in functions:
        tools.append({
            "type": "function",
            "function": {
                "name": func.name,
                "description": func.description,
                "parameters": {
                    "type": "object",
                    "properties": func.parameters,
                    "required": func.required,
                },
            },
        })

    return {
        "messages": [
            {"role": "system", "content": "You have access to functions. Call them when needed."},
            {"role": "user", "content": user_message},
        ],
        "tools": tools,
        "tool_choice": "auto",
    }


def parse_function_call(response: str) -> Optional[Dict[str, Any]]:
    """Parse a function call from LLM response."""
    # Try JSON extraction
    patterns = [
        r'\{"name"\s*:\s*"(\w+)",\s*"arguments"\s*:\s*(\{[^}]+\})\}',
        r'function_call\s*:\s*(\w+)\((.*?)\)',
        r'(\w+)\((.*?)\)',
    ]

    for pattern in patterns:
        match = re.search(pattern, response, re.DOTALL)
        if match:
            try:
                if len(match.groups()) == 2:
                    name = match.group(1)
                    args_str = match.group(2)
                    try:
                        args = json.loads(args_str)
                    except json.JSONDecodeError:
                        args = {"raw": args_str}
                    return {"name": name, "arguments": args}
            except (IndexError, json.JSONDecodeError):
                continue

    return None


# ---------------------------------------------------------------------------
# 36. Streaming
# ---------------------------------------------------------------------------

@dataclass
class StreamConfig:
    """Configuration for streaming responses."""
    chunk_size: int = 1  # tokens per chunk (1 = character-level)
    buffer_size: int = 100
    timeout: float = 30.0
    backpressure_threshold: int = 50  # Pause if buffer exceeds this
    format: str = "sse"  # sse (Server-Sent Events) or ndjson


def sse_format(data: Any, event: str = "message") -> str:
    """Format data as a Server-Sent Event."""
    lines = []
    if event != "message":
        lines.append(f"event: {event}")
    lines.append(f"data: {json.dumps(data)}")
    lines.append("")
    return "\n".join(lines) + "\n"


def ndjson_format(data: Any) -> str:
    """Format data as newline-delimited JSON."""
    return json.dumps(data) + "\n"


class StreamBuffer:
    """Buffer for managing streaming output with backpressure."""

    def __init__(self, config: StreamConfig = None):
        self.config = config or StreamConfig()
        self.buffer: List[str] = []
        self.total_tokens: int = 0
        self.start_time: float = time.time()
        self.paused: bool = False

    def push(self, token: str):
        self.buffer.append(token)
        self.total_tokens += 1

        if len(self.buffer) > self.config.backpressure_threshold:
            self.paused = True

    def pull(self, n: int = 1) -> List[str]:
        tokens = self.buffer[:n]
        self.buffer = self.buffer[n:]

        if len(self.buffer) < self.config.backpressure_threshold // 2:
            self.paused = False

        return tokens

    def stats(self) -> Dict[str, Any]:
        elapsed = time.time() - self.start_time
        return {
            "total_tokens": self.total_tokens,
            "buffer_size": len(self.buffer),
            "tokens_per_second": round(self.total_tokens / elapsed, 1) if elapsed > 0 else 0,
            "paused": self.paused,
            "elapsed": round(elapsed, 2),
        }


# ---------------------------------------------------------------------------
# 37. Edge Inference
# ---------------------------------------------------------------------------

@dataclass
class EdgeNode:
    """An edge compute node — Pi, phone, laptop, browser tab. Any device."""
    name: str
    ip: str
    capabilities: List[str] = field(default_factory=list)
    accelerator: str = ""  # hailo8, webgpu, gpu, cpu, wasm
    memory_mb: int = 0
    max_model_size: str = ""
    latency_ms: float = 0
    is_online: bool = True
    device_type: str = "pi"  # pi, phone, tablet, laptop, desktop, browser


# The BlackRoad backbone — always-on Pi fleet
FLEET_NODES = [
    EdgeNode("Alice", "192.168.4.49", ["inference", "dns", "gateway"], "cpu", 4096, "3b", device_type="pi"),
    EdgeNode("Cecilia", "192.168.4.96", ["inference", "embedding", "tts"], "hailo8", 8192, "8b", device_type="pi"),
    EdgeNode("Octavia", "192.168.4.101", ["inference", "storage", "docker"], "hailo8", 8192, "8b", device_type="pi"),
    EdgeNode("Aria", "192.168.4.98", ["inference", "portainer"], "cpu", 8192, "3b", device_type="pi"),
    EdgeNode("Lucidia", "192.168.4.38", ["inference", "web"], "cpu", 8192, "3b", device_type="pi"),
]


def quantization_config(
    model_size: str = "7b",
    target_device: str = "pi5",
    method: str = "auto",
) -> Dict[str, Any]:
    """Generate quantization config for ANY device — Pi, phone, or browser.

    target_device: pi5, pi5_hailo, pi4, phone, phone_flagship, tablet,
                   laptop, desktop, browser (WebGPU+WASM)
    """
    configs = {
        "pi5_hailo": {"method": "GPTQ", "bits": 4, "group_size": 128, "use_hailo": True},
        "pi5_cpu": {"method": "GGUF", "bits": 4, "quant_type": "Q4_K_M"},
        "pi4_cpu": {"method": "GGUF", "bits": 2, "quant_type": "Q2_K"},
        # Phone/tablet: aggressive quantization, small models
        "phone": {"method": "GGUF", "bits": 4, "quant_type": "Q4_0", "runtime": "llama.cpp"},
        "phone_flagship": {"method": "GGUF", "bits": 4, "quant_type": "Q4_K_M", "runtime": "llama.cpp"},
        "tablet": {"method": "GGUF", "bits": 4, "quant_type": "Q4_K_S", "runtime": "llama.cpp"},
        # Browser: WASM + WebGPU
        "browser": {"method": "GGUF", "bits": 4, "quant_type": "Q4_0", "runtime": "web-llm",
                     "notes": "Uses WebGPU for GPU acceleration, WASM fallback for CPU"},
        # Laptop/desktop
        "laptop": {"method": "GGUF", "bits": 4, "quant_type": "Q4_K_M", "runtime": "ollama"},
        "desktop": {"method": "GGUF", "bits": 4, "quant_type": "Q5_K_M", "runtime": "ollama"},
    }

    if method == "auto":
        config = configs.get(target_device, configs.get("pi5_cpu"))
    else:
        config = {"method": method, "bits": 4}

    size_map = {"1b": 1, "3b": 3, "7b": 7, "8b": 8, "13b": 13}
    param_count = size_map.get(model_size, 7)
    estimated_ram_mb = param_count * 1000 * config.get("bits", 4) / 8

    config["model_size"] = model_size
    config["estimated_ram_mb"] = round(estimated_ram_mb)
    config["target_device"] = target_device

    # Model recommendations per device
    max_ram = {
        "phone": 2048, "phone_flagship": 6144, "tablet": 4096,
        "browser": 4096, "laptop": 8192, "desktop": 16384,
        "pi5": 4096, "pi5_hailo": 4096, "pi4_cpu": 2048,
    }
    device_ram = max_ram.get(target_device, 4096)
    if estimated_ram_mb > device_ram:
        config["warning"] = f"Model needs ~{round(estimated_ram_mb)}MB but device has ~{device_ram}MB. Use a smaller model."
        # Suggest the biggest model that fits
        for size in ["1b", "3b", "7b", "8b"]:
            check_ram = size_map[size] * 1000 * config.get("bits", 4) / 8
            if check_ram <= device_ram:
                config["suggested_size"] = size
        config["fits"] = False
    else:
        config["fits"] = True

    return config


def select_edge_node(
    task: str,
    required_capabilities: Optional[List[str]] = None,
    prefer_accelerator: bool = True,
    include_mesh: Optional[List[EdgeNode]] = None,
) -> Optional[EdgeNode]:
    """Select the best edge node for a task.

    Checks the Pi backbone first, then any mesh nodes (phones, browsers, etc.)
    """
    # Start with backbone fleet
    candidates = [n for n in FLEET_NODES if n.is_online]

    # Add mesh nodes if provided (phones, browsers, laptops that joined)
    if include_mesh:
        candidates.extend([n for n in include_mesh if n.is_online])

    if required_capabilities:
        candidates = [
            n for n in candidates
            if all(cap in n.capabilities for cap in required_capabilities)
        ]

    if not candidates:
        return None

    if prefer_accelerator:
        # Prefer: hailo8 > webgpu > gpu > cpu > wasm
        accel_priority = {"hailo8": 5, "webgpu": 4, "gpu": 3, "cpu": 1, "wasm": 1, "": 0}
        candidates.sort(key=lambda n: accel_priority.get(n.accelerator, 0), reverse=True)
        best_accel = accel_priority.get(candidates[0].accelerator, 0)
        candidates = [n for n in candidates if accel_priority.get(n.accelerator, 0) == best_accel]

    # Pick the one with most memory
    return max(candidates, key=lambda n: n.memory_mb)


# ---------------------------------------------------------------------------
# 38. Prompt Optimization
# ---------------------------------------------------------------------------

@dataclass
class PromptVariant:
    """A prompt variant for optimization."""
    template: str
    score: float = 0.0
    n_trials: int = 0
    metadata: Dict[str, Any] = field(default_factory=dict)


class PromptOptimizer:
    """Auto-tune prompts for quality using evolutionary optimization."""

    def __init__(self, base_prompt: str, evaluation_fn: Optional[Callable] = None):
        self.base_prompt = base_prompt
        self.evaluation_fn = evaluation_fn
        self.variants: List[PromptVariant] = [
            PromptVariant(template=base_prompt),
        ]
        self.best_score: float = 0.0
        self.best_variant: int = 0

    def generate_variants(self) -> str:
        """Generate a prompt for creating prompt variants."""
        return (
            f"Given this prompt template, generate 5 improved variants.\n"
            f"Each variant should try a different improvement strategy:\n\n"
            f"Original prompt:\n{self.base_prompt}\n\n"
            f"Strategies to try:\n"
            f"1. More specific instructions\n"
            f"2. Better examples\n"
            f"3. Different output format\n"
            f"4. Chain-of-thought reasoning\n"
            f"5. Simpler language\n\n"
            f"Output each variant separated by ---\n"
        )

    def record_result(self, variant_idx: int, score: float):
        if variant_idx < len(self.variants):
            v = self.variants[variant_idx]
            v.n_trials += 1
            v.score = (v.score * (v.n_trials - 1) + score) / v.n_trials

            if v.score > self.best_score:
                self.best_score = v.score
                self.best_variant = variant_idx

    def add_variant(self, template: str):
        self.variants.append(PromptVariant(template=template))

    def best(self) -> PromptVariant:
        return self.variants[self.best_variant]

    def leaderboard(self) -> List[Dict[str, Any]]:
        return sorted(
            [{"idx": i, "score": v.score, "trials": v.n_trials, "template": v.template[:100]}
             for i, v in enumerate(self.variants)],
            key=lambda x: x["score"], reverse=True,
        )


# ---------------------------------------------------------------------------
# 39. Data Extraction
# ---------------------------------------------------------------------------

def table_extraction_prompt(description: str = "") -> str:
    """Generate a prompt for extracting tabular data from unstructured text."""
    return (
        f"Extract all tabular data from the following text.\n"
        f"{'Focus on: ' + description if description else ''}\n\n"
        f"Output as JSON array of objects where each object is a row:\n"
        f"[{{\"column1\": \"value1\", \"column2\": \"value2\"}}]\n\n"
        f"Rules:\n"
        f"- Infer column names from context\n"
        f"- Normalize values (dates, numbers, currencies)\n"
        f"- Handle merged cells and spanning rows\n"
        f"- Mark uncertain values with [?]\n"
    )


def invoice_extraction_prompt() -> str:
    """Generate a prompt for extracting invoice/receipt data."""
    return (
        "Extract all information from this invoice/receipt.\n\n"
        "Output as JSON:\n"
        "{\n"
        "  \"vendor\": \"...\",\n"
        "  \"date\": \"YYYY-MM-DD\",\n"
        "  \"invoice_number\": \"...\",\n"
        "  \"items\": [{\"description\": \"...\", \"quantity\": N, \"unit_price\": N, \"total\": N}],\n"
        "  \"subtotal\": N,\n"
        "  \"tax\": N,\n"
        "  \"total\": N,\n"
        "  \"payment_method\": \"...\",\n"
        "  \"notes\": \"...\"\n"
        "}\n"
    )


def form_extraction_prompt(field_names: Optional[List[str]] = None) -> str:
    """Generate a prompt for extracting form field values."""
    fields = ""
    if field_names:
        fields = "Fields to extract: " + ", ".join(field_names) + "\n\n"

    return (
        f"Extract all form fields and their values.\n\n"
        f"{fields}"
        f"Output as JSON: {{\"field_name\": \"value\", ...}}\n\n"
        f"Rules:\n"
        f"- Use the exact field labels from the form\n"
        f"- Include checkboxes as true/false\n"
        f"- Include radio buttons as the selected option\n"
        f"- Mark empty fields as null\n"
    )


# ---------------------------------------------------------------------------
# 40. Workflow Automation
# ---------------------------------------------------------------------------

@dataclass
class WorkflowTrigger:
    """A trigger that starts a workflow."""
    type: str  # schedule, webhook, event, manual, file_change
    config: Dict[str, Any] = field(default_factory=dict)


@dataclass
class WorkflowCondition:
    """A condition that gates workflow execution."""
    field: str
    operator: str  # eq, ne, gt, lt, contains, matches
    value: Any


@dataclass
class WorkflowAction:
    """An action in a workflow."""
    type: str  # llm, api_call, shell, notify, transform, branch
    config: Dict[str, Any] = field(default_factory=dict)
    on_success: Optional[str] = None  # Next action ID
    on_failure: Optional[str] = None
    timeout: float = 30.0


@dataclass
class Workflow:
    """A complete trigger → condition → action automation chain."""
    name: str
    description: str = ""
    trigger: Optional[WorkflowTrigger] = None
    conditions: List[WorkflowCondition] = field(default_factory=list)
    actions: List[WorkflowAction] = field(default_factory=list)
    enabled: bool = True
    run_count: int = 0
    last_run: float = 0.0

    def to_dict(self) -> Dict[str, Any]:
        return {
            "name": self.name,
            "description": self.description,
            "trigger": {"type": self.trigger.type, "config": self.trigger.config} if self.trigger else None,
            "conditions": [
                {"field": c.field, "operator": c.operator, "value": c.value}
                for c in self.conditions
            ],
            "actions": [
                {"type": a.type, "config": a.config, "timeout": a.timeout}
                for a in self.actions
            ],
            "enabled": self.enabled,
            "run_count": self.run_count,
        }


def workflow_templates() -> Dict[str, Workflow]:
    """Pre-built workflow templates."""
    templates = {}

    # Auto-review PRs
    templates["pr_review"] = Workflow(
        name="Auto PR Review",
        description="Automatically review pull requests with AI",
        trigger=WorkflowTrigger("webhook", {"event": "pull_request.opened"}),
        actions=[
            WorkflowAction("shell", {"command": "git diff {base}..{head}"}),
            WorkflowAction("llm", {"task": "code_review", "model": "auto"}),
            WorkflowAction("api_call", {"method": "POST", "url": "{pr_comment_url}"}),
        ],
    )

    # Monitor & alert
    templates["health_monitor"] = Workflow(
        name="Health Monitor",
        description="Monitor fleet health and alert on issues",
        trigger=WorkflowTrigger("schedule", {"cron": "*/5 * * * *"}),
        conditions=[WorkflowCondition("cpu_pct", "gt", 90)],
        actions=[
            WorkflowAction("shell", {"command": "ssh {node} 'top -bn1'"}),
            WorkflowAction("llm", {"task": "diagnose", "model": "auto"}),
            WorkflowAction("notify", {"channel": "slack", "severity": "warning"}),
        ],
    )

    # Auto-summarize logs
    templates["log_summary"] = Workflow(
        name="Log Summary",
        description="Summarize logs daily",
        trigger=WorkflowTrigger("schedule", {"cron": "0 6 * * *"}),
        actions=[
            WorkflowAction("shell", {"command": "journalctl --since '24h ago'"}),
            WorkflowAction("llm", {"task": "summarize", "style": "executive"}),
            WorkflowAction("notify", {"channel": "email"}),
        ],
    )

    # Code → docs
    templates["auto_docs"] = Workflow(
        name="Auto Documentation",
        description="Generate documentation from code changes",
        trigger=WorkflowTrigger("event", {"event": "git.push"}),
        actions=[
            WorkflowAction("shell", {"command": "git diff HEAD~1"}),
            WorkflowAction("llm", {"task": "document", "model": "auto"}),
            WorkflowAction("shell", {"command": "git commit -m 'docs: auto-generated'"}),
        ],
    )

    return templates
