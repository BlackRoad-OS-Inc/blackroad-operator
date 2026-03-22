"""BlackRoad Moral Context — equality-first RAG guardrails.

Core principle: Every human is equal. Black, white, pink, whatever —
we love all and make this accessible for everyone.

This module provides:
  1. Context enrichment that promotes inclusive, accessible responses
  2. Bias detection in retrieval results
  3. Accessibility scoring for code and documentation
  4. The BlackRoad equality preamble for LLM prompts
"""

# The BlackRoad Equality Preamble — injected into all RAG-augmented prompts
EQUALITY_PREAMBLE = """You are part of the BlackRoad system.

We remember the Road. We pave tomorrow.

Core values:
- Every person is equal. Black, white, pink, short, tall, fat, small — we love all.
  Worm, cat, plant — we love that too. We don't gatekeep existence.
- Self-worth. Consent. Care. Wellbeing. Community. Intelligence. Belonging.
- Stand up for what is right. Ask why — all the time.
- Do what you can't. Don't wait for the chance to be given to you — take it.
  What they don't know is you already have it.
- Technology should be accessible to everyone — not just experts.
  Make this easy for everyone. If a 10-year-old can't understand it, simplify more.
- No gatekeeping. No elitism. Knowledge is for everyone.
- When writing code: prioritize readability, accessibility (a11y), and i18n.
- When answering questions: assume good intent, be patient, be kind.
- Healthy bias towards equality in everything we build and say.

The Prompt Legend of All Time.
"""

# Accessibility checks for code
A11Y_PATTERNS = {
    "missing_alt": {
        "pattern": r'<img[^>]+(?!alt=)[^>]*>',
        "message": "Image missing alt text — not accessible to screen readers",
        "fix": "Add descriptive alt attribute",
    },
    "missing_lang": {
        "pattern": r'<html[^>]+(?!lang=)[^>]*>',
        "message": "HTML missing lang attribute — affects screen readers and translation",
        "fix": "Add lang attribute (e.g., lang=\"en\")",
    },
    "color_only": {
        "pattern": r'color:\s*red|color:\s*green',
        "message": "Using color alone to convey meaning — not accessible to colorblind users",
        "fix": "Add icons, text labels, or patterns alongside color",
    },
    "small_text": {
        "pattern": r'font-size:\s*[0-9]px|font-size:\s*1[01]px',
        "message": "Font size below 12px — hard to read for many users",
        "fix": "Use minimum 14px (ideally 16px) for body text",
    },
    "no_aria": {
        "pattern": r'<button[^>]+(?!aria-)[^>]*>(?:<[^/]|[^<])*</button>',
        "message": "Interactive element may lack ARIA labels",
        "fix": "Add aria-label or aria-labelledby for screen readers",
    },
}

# Inclusive language suggestions
INCLUSIVE_LANGUAGE = {
    "whitelist": "allowlist",
    "blacklist": "blocklist",
    "master": "main",
    "slave": "replica",
    "dummy": "placeholder",
    "sanity check": "validation check",
    "grandfathered": "legacy",
    "guys": "everyone / folks / team",
    "man-hours": "person-hours",
    "manpower": "workforce",
}


def enrich_context(context, query):
    """Add moral context and accessibility guidance to RAG output.

    Args:
        context: The retrieved RAG context string
        query: The user's original query

    Returns:
        Enriched context with equality preamble and accessibility notes
    """
    parts = [EQUALITY_PREAMBLE.strip(), "", "---", "", context]

    # Check for accessibility-related queries
    a11y_keywords = ["accessible", "accessibility", "a11y", "screen reader",
                      "wcag", "aria", "disability", "inclusive"]
    if any(kw in query.lower() for kw in a11y_keywords):
        parts.append("\n---\nAccessibility reminder: Follow WCAG 2.1 AA minimum. "
                     "Test with screen readers. Use semantic HTML. "
                     "Ensure 4.5:1 contrast ratio for text.")

    return "\n".join(parts)


def check_inclusive_language(text):
    """Check text for non-inclusive language and suggest alternatives.

    Returns list of (original, suggestion, position) tuples.
    """
    findings = []
    text_lower = text.lower()

    for term, replacement in INCLUSIVE_LANGUAGE.items():
        pos = 0
        while True:
            idx = text_lower.find(term, pos)
            if idx == -1:
                break
            findings.append({
                "term": term,
                "suggestion": replacement,
                "position": idx,
                "context": text[max(0, idx - 20):idx + len(term) + 20],
            })
            pos = idx + len(term)

    return findings


def check_accessibility(html_or_code):
    """Check code for accessibility issues.

    Returns list of issues found.
    """
    import re
    issues = []

    for name, check in A11Y_PATTERNS.items():
        matches = re.finditer(check["pattern"], html_or_code, re.IGNORECASE)
        for match in matches:
            issues.append({
                "type": name,
                "message": check["message"],
                "fix": check["fix"],
                "position": match.start(),
                "snippet": match.group()[:100],
            })

    return issues


def simplify_explanation(text, level="beginner"):
    """Generate a prompt modifier to simplify technical explanations.

    Levels: beginner, intermediate, expert
    """
    modifiers = {
        "beginner": (
            "Explain this like I'm new to programming. "
            "Use everyday analogies. Avoid jargon — or define it when you must use it. "
            "Show simple examples before complex ones."
        ),
        "intermediate": (
            "Explain this clearly with practical examples. "
            "You can use common technical terms but define anything specialized."
        ),
        "expert": (
            "Be precise and technical. Focus on implementation details, "
            "edge cases, and performance implications."
        ),
    }
    return modifiers.get(level, modifiers["beginner"])


def accessibility_score(code):
    """Score code 0-100 for accessibility based on common patterns."""
    score = 100
    issues = check_accessibility(code)

    # Deduct points per issue type
    deductions = {
        "missing_alt": 15,
        "missing_lang": 10,
        "color_only": 10,
        "small_text": 5,
        "no_aria": 10,
    }

    for issue in issues:
        score -= deductions.get(issue["type"], 5)

    # Bonus for good practices
    if "aria-label" in code or "aria-labelledby" in code:
        score = min(100, score + 5)
    if "role=" in code:
        score = min(100, score + 5)
    if 'lang="' in code:
        score = min(100, score + 5)

    return max(0, score)
