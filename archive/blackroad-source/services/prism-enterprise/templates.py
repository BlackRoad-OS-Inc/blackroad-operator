"""Prompt templating and chain support."""

from __future__ import annotations

import logging
from typing import Any

from jinja2 import Environment, Template, TemplateError

logger = logging.getLogger(__name__)


class PromptTemplate:
    """Jinja2-based prompt template."""

    def __init__(self, template: str):
        """Initialize prompt template.

        Args:
            template: Jinja2 template string
        """
        self.env = Environment(autoescape=False)
        try:
            self.template: Template = self.env.from_string(template)
        except TemplateError as e:
            logger.error(f"Invalid template: {e}")
            raise ValueError(f"Invalid template: {e}")

    def render(self, **kwargs: Any) -> str:
        """Render template with variables.

        Args:
            **kwargs: Template variables

        Returns:
            Rendered template

        Raises:
            ValueError: If rendering fails
        """
        try:
            return self.template.render(**kwargs)
        except TemplateError as e:
            logger.error(f"Template rendering failed: {e}")
            raise ValueError(f"Template rendering failed: {e}")


# Common prompt templates
SYSTEM_TEMPLATES = {
    "assistant": PromptTemplate(
        "You are a helpful AI assistant. You provide clear, accurate, and concise responses."
    ),
    "coder": PromptTemplate(
        "You are an expert software engineer. You write clean, efficient, and well-documented code. "
        "You follow best practices and design patterns."
    ),
    "analyst": PromptTemplate(
        "You are a data analyst and researcher. You provide thorough, evidence-based analysis "
        "with clear explanations of your reasoning."
    ),
    "tutor": PromptTemplate(
        "You are a patient and knowledgeable tutor. You break down complex topics into "
        "understandable parts and provide examples to aid learning."
    ),
    "creative": PromptTemplate(
        "You are a creative writer with a vivid imagination. You craft engaging narratives "
        "and explore ideas from unique perspectives."
    ),
}


TASK_TEMPLATES = {
    "summarize": PromptTemplate(
        """Summarize the following text concisely, capturing the key points:

{{ text }}

Summary:"""
    ),
    "explain": PromptTemplate(
        """Explain {{ topic }} in {{ level }} terms.

{% if context %}Context: {{ context }}{% endif %}

Explanation:"""
    ),
    "code_review": PromptTemplate(
        """Review the following code and provide feedback on:
- Code quality and readability
- Potential bugs or issues
- Performance considerations
- Best practices

```{{ language }}
{{ code }}
```

Review:"""
    ),
    "translate": PromptTemplate(
        """Translate the following text from {{ source_lang }} to {{ target_lang }}:

{{ text }}

Translation:"""
    ),
    "qa": PromptTemplate(
        """Answer the following question based on the provided context:

Context:
{{ context }}

Question: {{ question }}

Answer:"""
    ),
}


class PromptChain:
    """Chain multiple LLM calls together."""

    def __init__(self, steps: list[dict[str, Any]]):
        """Initialize prompt chain.

        Args:
            steps: List of chain steps, each with 'template' and optional 'output_key'
        """
        self.steps = steps

    async def run(self, llm_callable, initial_context: dict[str, Any]) -> dict[str, Any]:
        """Execute the prompt chain.

        Args:
            llm_callable: Async function to call LLM (takes prompt string, returns response)
            initial_context: Initial context variables

        Returns:
            Final context with all outputs
        """
        context = initial_context.copy()

        for i, step in enumerate(self.steps):
            template_str = step.get("template")
            if not template_str:
                raise ValueError(f"Step {i} missing 'template' key")

            # Render template with current context
            template = PromptTemplate(template_str)
            prompt = template.render(**context)

            # Call LLM
            logger.debug(f"Chain step {i}: {prompt[:100]}...")
            response = await llm_callable(prompt)

            # Store output
            output_key = step.get("output_key", f"step_{i}_output")
            context[output_key] = response

            logger.debug(f"Chain step {i} output: {response[:100]}...")

        return context


def get_system_template(name: str) -> PromptTemplate:
    """Get predefined system template.

    Args:
        name: Template name

    Returns:
        Prompt template

    Raises:
        KeyError: If template not found
    """
    if name not in SYSTEM_TEMPLATES:
        available = ", ".join(SYSTEM_TEMPLATES.keys())
        raise KeyError(f"System template '{name}' not found. Available: {available}")
    return SYSTEM_TEMPLATES[name]


def get_task_template(name: str) -> PromptTemplate:
    """Get predefined task template.

    Args:
        name: Template name

    Returns:
        Prompt template

    Raises:
        KeyError: If template not found
    """
    if name not in TASK_TEMPLATES:
        available = ", ".join(TASK_TEMPLATES.keys())
        raise KeyError(f"Task template '{name}' not found. Available: {available}")
    return TASK_TEMPLATES[name]
