"""Tests for prompt templates."""

import pytest

from app.templates import PromptChain, PromptTemplate, get_system_template, get_task_template


def test_prompt_template_basic():
    """Test basic template rendering."""
    template = PromptTemplate("Hello, {{ name }}!")
    result = template.render(name="World")
    assert result == "Hello, World!"


def test_prompt_template_multiple_vars():
    """Test template with multiple variables."""
    template = PromptTemplate("{{ greeting }}, {{ name }}! You are {{ age }} years old.")
    result = template.render(greeting="Hi", name="Alice", age=25)
    assert result == "Hi, Alice! You are 25 years old."


def test_prompt_template_conditional():
    """Test template with conditional logic."""
    template = PromptTemplate("{% if premium %}Premium{% else %}Free{% endif %} user")
    assert template.render(premium=True) == "Premium user"
    assert template.render(premium=False) == "Free user"


def test_prompt_template_loop():
    """Test template with loop."""
    template = PromptTemplate("Items: {% for item in items %}{{ item }}{% if not loop.last %}, {% endif %}{% endfor %}")
    result = template.render(items=["a", "b", "c"])
    assert result == "Items: a, b, c"


def test_prompt_template_invalid():
    """Test invalid template raises error."""
    with pytest.raises(ValueError, match="Invalid template"):
        PromptTemplate("{{ unclosed")


def test_prompt_template_render_error():
    """Test template render error."""
    template = PromptTemplate("{{ missing_var }}")
    with pytest.raises(ValueError, match="Template rendering failed"):
        template.render()


def test_get_system_template():
    """Test getting predefined system templates."""
    template = get_system_template("assistant")
    result = template.render()
    assert "helpful" in result.lower()

    template = get_system_template("coder")
    result = template.render()
    assert "engineer" in result.lower() or "code" in result.lower()


def test_get_system_template_invalid():
    """Test getting invalid system template."""
    with pytest.raises(KeyError):
        get_system_template("nonexistent")


def test_get_task_template():
    """Test getting predefined task templates."""
    template = get_task_template("summarize")
    result = template.render(text="This is a long text that needs summarization.")
    assert "summarize" in result.lower() or "summary" in result.lower()

    template = get_task_template("translate")
    result = template.render(source_lang="English", target_lang="Spanish", text="Hello")
    assert "translate" in result.lower()


def test_get_task_template_invalid():
    """Test getting invalid task template."""
    with pytest.raises(KeyError):
        get_task_template("nonexistent")


@pytest.mark.asyncio
async def test_prompt_chain():
    """Test prompt chain execution."""

    async def mock_llm(prompt: str) -> str:
        """Mock LLM that echoes input."""
        return f"Response to: {prompt}"

    chain = PromptChain(
        [
            {"template": "Step 1: {{ input }}", "output_key": "step1"},
            {"template": "Step 2: Previous was {{ step1 }}", "output_key": "step2"},
        ]
    )

    result = await chain.run(mock_llm, {"input": "test"})

    assert "step1" in result
    assert "step2" in result
    assert "test" in result["step1"]
    assert "Response to: Step 1: test" == result["step1"]


@pytest.mark.asyncio
async def test_prompt_chain_missing_template():
    """Test prompt chain with missing template."""

    async def mock_llm(prompt: str) -> str:
        return prompt

    chain = PromptChain([{"output_key": "step1"}])  # Missing template

    with pytest.raises(ValueError, match="missing 'template' key"):
        await chain.run(mock_llm, {})
