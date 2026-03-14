"""Content generation skills — text, code, structured data, multimodal.

Copyright (c) 2024-2026 BlackRoad OS, Inc. All rights reserved.

This software is proprietary and confidential. Unauthorized copying, transfer,
or reproduction of this file, via any medium, is strictly prohibited.

Licensed for non-commercial testing and evaluation purposes only.
Commercial use requires a separate license agreement with BlackRoad OS, Inc.

For licensing inquiries: legal@blackroad.io

Skills:
  9.  Code generation with test scaffolding
  10. Structured output (JSON, YAML, SQL, GraphQL)
  11. Multi-turn conversation management
  12. Summarization (extractive + abstractive)
  13. Translation & localization
  14. Creative writing with style transfer
  15. Document generation (reports, specs, proposals)
  16. Few-shot & zero-shot prompting
"""

from __future__ import annotations

import json
import re
import time
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Tuple


# ---------------------------------------------------------------------------
# 9. Code Generation with Test Scaffolding
# ---------------------------------------------------------------------------

LANG_TEMPLATES = {
    "python": {
        "function": "def {name}({params}):\n    \"\"\"{docstring}\"\"\"\n    {body}\n",
        "test": (
            "import pytest\n\n"
            "def test_{name}_basic():\n"
            "    result = {name}({test_input})\n"
            "    assert result == {expected}\n\n"
            "def test_{name}_edge():\n"
            "    # Edge case\n"
            "    pass\n\n"
            "def test_{name}_error():\n"
            "    with pytest.raises({error_type}):\n"
            "        {name}({bad_input})\n"
        ),
        "class": (
            "class {name}:\n"
            "    \"\"\"{docstring}\"\"\"\n\n"
            "    def __init__(self{init_params}):\n"
            "        {init_body}\n"
        ),
    },
    "typescript": {
        "function": (
            "export function {name}({params}): {return_type} {{\n"
            "  {body}\n"
            "}}\n"
        ),
        "test": (
            "import {{ describe, it, expect }} from 'vitest'\n"
            "import {{ {name} }} from './{module}'\n\n"
            "describe('{name}', () => {{\n"
            "  it('should handle basic case', () => {{\n"
            "    expect({name}({test_input})).toBe({expected})\n"
            "  }})\n\n"
            "  it('should handle edge case', () => {{\n"
            "    // TODO\n"
            "  }})\n\n"
            "  it('should throw on invalid input', () => {{\n"
            "    expect(() => {name}({bad_input})).toThrow()\n"
            "  }})\n"
            "}})\n"
        ),
    },
    "shell": {
        "function": (
            "{name}() {{\n"
            "    # {docstring}\n"
            "    {body}\n"
            "}}\n"
        ),
    },
}


def code_gen_prompt(
    description: str,
    language: str = "python",
    with_tests: bool = True,
    with_types: bool = True,
    style: str = "clean",
) -> str:
    """Generate a code generation prompt with test scaffolding."""
    prompt = (
        f"Generate {language} code for the following:\n\n"
        f"{description}\n\n"
        f"Requirements:\n"
        f"- Language: {language}\n"
        f"- Style: {style} (readable, minimal, no over-engineering)\n"
    )

    if with_types:
        prompt += "- Include full type annotations\n"

    if with_tests:
        prompt += (
            "- Include comprehensive tests:\n"
            "  - Happy path (basic functionality)\n"
            "  - Edge cases (empty input, boundary values)\n"
            "  - Error cases (invalid input, expected exceptions)\n"
        )

    prompt += (
        "\n"
        "Output format:\n"
        "```{lang}\n"
        "// Implementation\n"
        "```\n\n"
        "```{lang}\n"
        "// Tests\n"
        "```\n"
    ).format(lang=language)

    return prompt


def scaffold_test(
    function_name: str,
    language: str = "python",
    params: Optional[List[str]] = None,
) -> str:
    """Generate a test scaffold for an existing function."""
    templates = LANG_TEMPLATES.get(language, LANG_TEMPLATES["python"])
    test_template = templates.get("test", "")
    return test_template.format(
        name=function_name,
        test_input=", ".join(params) if params else "...",
        expected="...",
        error_type="ValueError",
        bad_input="None",
        module=function_name,
    )


# ---------------------------------------------------------------------------
# 10. Structured Output
# ---------------------------------------------------------------------------

def structured_output_prompt(
    description: str,
    schema: Dict[str, Any],
    format_type: str = "json",
) -> str:
    """Generate a prompt that enforces structured output."""
    schema_str = json.dumps(schema, indent=2)

    format_instructions = {
        "json": f"Output ONLY valid JSON matching this schema:\n```json\n{schema_str}\n```",
        "yaml": f"Output ONLY valid YAML matching this structure:\n```yaml\n{schema_str}\n```",
        "sql": "Output ONLY valid SQL statements. No explanations.",
        "graphql": "Output ONLY valid GraphQL. No explanations.",
        "csv": "Output ONLY valid CSV with headers. No explanations.",
    }

    return (
        f"{description}\n\n"
        f"{format_instructions.get(format_type, format_instructions['json'])}\n\n"
        f"Do not include any text before or after the {format_type}. "
        f"Do not wrap in markdown code blocks.\n"
    )


def extract_json(text: str) -> Optional[Dict]:
    """Extract JSON from LLM output, handling markdown code blocks."""
    # Try direct parse
    try:
        return json.loads(text.strip())
    except json.JSONDecodeError:
        pass

    # Try extracting from code blocks
    patterns = [
        r'```json\s*\n(.*?)\n```',
        r'```\s*\n(.*?)\n```',
        r'\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}',
    ]

    for pattern in patterns:
        match = re.search(pattern, text, re.DOTALL)
        if match:
            try:
                return json.loads(match.group(1) if '```' in pattern else match.group())
            except (json.JSONDecodeError, IndexError):
                continue

    return None


def validate_output(output: Any, schema: Dict[str, Any]) -> Dict[str, Any]:
    """Validate structured output against a simple schema.

    schema format: {"field_name": "type_name", ...}
    type_name: "string", "number", "boolean", "array", "object"
    """
    if not isinstance(output, dict):
        return {"valid": False, "errors": ["Output is not a dict"]}

    errors = []
    type_map = {
        "string": str,
        "number": (int, float),
        "boolean": bool,
        "array": list,
        "object": dict,
    }

    for field_name, type_name in schema.items():
        if field_name not in output:
            errors.append(f"Missing field: {field_name}")
            continue

        expected_type = type_map.get(type_name)
        if expected_type and not isinstance(output[field_name], expected_type):
            errors.append(f"Field {field_name}: expected {type_name}, got {type(output[field_name]).__name__}")

    return {"valid": len(errors) == 0, "errors": errors}


# ---------------------------------------------------------------------------
# 11. Multi-Turn Conversation Management
# ---------------------------------------------------------------------------

@dataclass
class Message:
    role: str  # system, user, assistant, tool
    content: str
    name: Optional[str] = None
    timestamp: float = field(default_factory=time.time)
    metadata: Dict[str, Any] = field(default_factory=dict)


class ConversationManager:
    """Manage multi-turn conversations with context windowing."""

    def __init__(self, system_prompt: str = "", max_tokens: int = 8000):
        self.messages: List[Message] = []
        self.max_tokens = max_tokens

        if system_prompt:
            self.messages.append(Message(role="system", content=system_prompt))

    def add(self, role: str, content: str, **kwargs):
        self.messages.append(Message(role=role, content=content, **kwargs))

    def get_context(self, token_budget: Optional[int] = None) -> List[Dict[str, str]]:
        """Get conversation context within token budget."""
        budget = token_budget or self.max_tokens
        result = []
        used = 0

        # Always include system message
        for msg in self.messages:
            if msg.role == "system":
                result.append({"role": msg.role, "content": msg.content})
                used += len(msg.content.split()) * 1.3
                break

        # Add messages from most recent, working backwards
        recent = [m for m in self.messages if m.role != "system"]
        for msg in reversed(recent):
            msg_tokens = len(msg.content.split()) * 1.3
            if used + msg_tokens > budget:
                break
            result.insert(1 if result else 0, {"role": msg.role, "content": msg.content})
            used += msg_tokens

        return result

    def summarize_context(self) -> str:
        """Create a summary of the conversation for context compression."""
        return (
            f"Conversation summary ({len(self.messages)} messages):\n"
            f"- System: {self.messages[0].content[:100]}...\n"
            f"- Topics discussed: [extract from messages]\n"
            f"- Key decisions: [extract from messages]\n"
            f"- Current thread: {self.messages[-1].content[:200]}...\n"
        )

    def fork(self, from_index: int = 0) -> "ConversationManager":
        """Fork the conversation from a specific point."""
        new = ConversationManager(max_tokens=self.max_tokens)
        new.messages = [Message(**m.__dict__) for m in self.messages[:from_index + 1]]
        return new


# ---------------------------------------------------------------------------
# 12. Summarization
# ---------------------------------------------------------------------------

def extractive_summarize(text: str, num_sentences: int = 5) -> str:
    """Extract the most important sentences from text.

    Uses a simple TF-based importance scoring.
    """
    sentences = re.split(r'(?<=[.!?])\s+', text)
    if len(sentences) <= num_sentences:
        return text

    # Score sentences by word importance
    word_freq: Dict[str, int] = {}
    for sentence in sentences:
        for word in sentence.lower().split():
            word = re.sub(r'[^\w]', '', word)
            if len(word) > 2:
                word_freq[word] = word_freq.get(word, 0) + 1

    scored = []
    for i, sentence in enumerate(sentences):
        score = sum(
            word_freq.get(re.sub(r'[^\w]', '', w.lower()), 0)
            for w in sentence.split()
        )
        # Boost first and last sentences
        if i == 0:
            score *= 1.5
        if i == len(sentences) - 1:
            score *= 1.2
        scored.append((i, sentence, score))

    scored.sort(key=lambda x: x[2], reverse=True)
    top = sorted(scored[:num_sentences], key=lambda x: x[0])
    return " ".join(s[1] for s in top)


def summarization_prompt(
    text: str,
    style: str = "concise",
    max_length: str = "3 sentences",
    audience: str = "general",
) -> str:
    """Generate a summarization prompt."""
    styles = {
        "concise": "Be extremely brief. Every word must earn its place.",
        "detailed": "Include key details, examples, and nuance.",
        "eli5": "Explain like I'm 5. Use simple words and analogies.",
        "executive": "Focus on decisions, impact, and action items.",
        "technical": "Preserve technical accuracy and specific details.",
        "bullet": "Use bullet points. One key idea per bullet.",
    }

    return (
        f"Summarize the following text.\n\n"
        f"Style: {styles.get(style, style)}\n"
        f"Length: {max_length}\n"
        f"Audience: {audience}\n\n"
        f"Text:\n{text}\n"
    )


# ---------------------------------------------------------------------------
# 13. Translation & Localization
# ---------------------------------------------------------------------------

def translation_prompt(
    text: str,
    target_lang: str,
    source_lang: str = "auto",
    context: str = "",
    formality: str = "neutral",
) -> str:
    """Generate a translation prompt with cultural awareness."""
    return (
        f"Translate the following text to {target_lang}.\n\n"
        f"{'Source language: ' + source_lang if source_lang != 'auto' else ''}\n"
        f"Formality: {formality}\n"
        f"{'Context: ' + context if context else ''}\n\n"
        f"Important:\n"
        f"- Preserve the original meaning and tone\n"
        f"- Adapt idioms and cultural references naturally\n"
        f"- Use appropriate formality level\n"
        f"- Do NOT transliterate — translate the meaning\n"
        f"- If technical terms exist, keep them or provide both\n\n"
        f"Text:\n{text}\n"
    )


def localization_check(text: str) -> Dict[str, Any]:
    """Check text for localization readiness."""
    issues = []

    # Check for hardcoded dates
    date_patterns = [
        r'\d{1,2}/\d{1,2}/\d{2,4}',  # MM/DD/YYYY
        r'(January|February|March|April|May|June|July|August|September|October|November|December)',
    ]
    for pattern in date_patterns:
        if re.search(pattern, text):
            issues.append("Hardcoded date format — use ISO 8601 or locale-aware formatting")

    # Check for hardcoded currency
    if re.search(r'\$\d+', text):
        issues.append("Hardcoded USD currency — use locale-aware formatting")

    # Check for hardcoded strings
    if re.search(r'["\'](?:Click here|Submit|Cancel|OK|Yes|No)["\']', text):
        issues.append("Hardcoded UI strings — extract to translation files")

    # Check for concatenation (bad for i18n)
    if re.search(r'["\'] *\+ *["\']', text) or re.search(r'f".*\{.*\}.*"', text):
        issues.append("String concatenation — use proper i18n interpolation")

    return {
        "ready": len(issues) == 0,
        "issues": issues,
        "score": max(0, 100 - len(issues) * 20),
    }


# ---------------------------------------------------------------------------
# 14. Creative Writing & Style Transfer
# ---------------------------------------------------------------------------

WRITING_STYLES = {
    "hemingway": "Short sentences. Simple words. Direct. No fluff. The truth, plainly.",
    "academic": "Formal register, precise terminology, hedged claims, citations expected.",
    "conversational": "Write like you're talking to a friend. Contractions are fine. Be warm.",
    "technical": "Precise, unambiguous, structured. Define terms. Use examples.",
    "poetic": "Lyrical, rhythmic, evocative imagery. Let the words breathe.",
    "journalistic": "Inverted pyramid. Lead with the news. Who, what, when, where, why.",
    "blackroad": (
        "Direct. Bold. No gatekeeping. We remember the Road, we pave tomorrow. "
        "Accessible to everyone. Short tall fat small — we love all. "
        "Make it easy. Make it real. Make it matter."
    ),
}


def style_transfer_prompt(
    text: str,
    target_style: str,
    preserve: str = "meaning",
) -> str:
    """Rewrite text in a different style."""
    style_desc = WRITING_STYLES.get(target_style, target_style)

    return (
        f"Rewrite the following text in this style:\n"
        f"{style_desc}\n\n"
        f"Preserve the {preserve}.\n\n"
        f"Original:\n{text}\n\n"
        f"Rewritten:\n"
    )


# ---------------------------------------------------------------------------
# 15. Document Generation
# ---------------------------------------------------------------------------

DOC_TEMPLATES = {
    "technical_spec": {
        "sections": [
            "Overview", "Requirements", "Architecture", "API Design",
            "Data Model", "Security", "Testing", "Deployment", "Timeline",
        ],
        "tone": "technical",
    },
    "proposal": {
        "sections": [
            "Executive Summary", "Problem Statement", "Proposed Solution",
            "Approach", "Timeline", "Budget", "Team", "Risks", "Next Steps",
        ],
        "tone": "professional",
    },
    "incident_report": {
        "sections": [
            "Summary", "Timeline", "Impact", "Root Cause",
            "Resolution", "Lessons Learned", "Action Items",
        ],
        "tone": "factual",
    },
    "changelog": {
        "sections": ["Added", "Changed", "Fixed", "Removed", "Security"],
        "tone": "concise",
    },
}


def doc_gen_prompt(
    topic: str,
    template: str = "technical_spec",
    context: str = "",
) -> str:
    """Generate a document generation prompt from a template."""
    tmpl = DOC_TEMPLATES.get(template, DOC_TEMPLATES["technical_spec"])
    sections = "\n".join(f"  ## {s}" for s in tmpl["sections"])

    return (
        f"Generate a {template.replace('_', ' ')} document about:\n{topic}\n\n"
        f"{'Context: ' + context if context else ''}\n\n"
        f"Use this structure:\n{sections}\n\n"
        f"Tone: {tmpl['tone']}\n"
        f"Be thorough but concise. Every section should add value.\n"
    )


# ---------------------------------------------------------------------------
# 16. Few-Shot & Zero-Shot Prompting
# ---------------------------------------------------------------------------

def few_shot_prompt(
    task: str,
    examples: List[Dict[str, str]],
    query: str,
) -> str:
    """Generate a few-shot learning prompt.

    examples: [{"input": "...", "output": "..."}, ...]
    """
    example_text = "\n\n".join(
        f"Input: {ex['input']}\nOutput: {ex['output']}"
        for ex in examples
    )

    return (
        f"Task: {task}\n\n"
        f"Examples:\n{example_text}\n\n"
        f"Input: {query}\n"
        f"Output:"
    )


def zero_shot_prompt(
    task: str,
    query: str,
    constraints: Optional[List[str]] = None,
) -> str:
    """Generate a zero-shot prompt with task description."""
    constraint_text = ""
    if constraints:
        constraint_text = "\nConstraints:\n" + "\n".join(f"- {c}" for c in constraints)

    return (
        f"Task: {task}\n{constraint_text}\n\n"
        f"Input: {query}\n"
        f"Output:"
    )


def auto_few_shot(
    task: str,
    examples_pool: List[Dict[str, str]],
    query: str,
    max_examples: int = 5,
) -> str:
    """Auto-select the most relevant few-shot examples for a query.

    Simple word-overlap selection. For production, use embeddings.
    """
    query_words = set(query.lower().split())

    scored = []
    for ex in examples_pool:
        ex_words = set(ex["input"].lower().split())
        overlap = len(query_words & ex_words)
        scored.append((ex, overlap))

    scored.sort(key=lambda x: x[1], reverse=True)
    selected = [ex for ex, _ in scored[:max_examples]]

    return few_shot_prompt(task, selected, query)
