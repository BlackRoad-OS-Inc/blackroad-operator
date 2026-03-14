"""Creative & human intelligence skills — empathy, storytelling, intuition, play.

Copyright (c) 2024-2026 BlackRoad OS, Inc. All rights reserved.

This software is proprietary and confidential. Unauthorized copying, transfer,
or reproduction of this file, via any medium, is strictly prohibited.

Licensed for non-commercial testing and evaluation purposes only.
Commercial use requires a separate license agreement with BlackRoad OS, Inc.

For licensing inquiries: legal@blackroad.io

Skills 61-75 — The Human Layer:
  61. Empathic reasoning (feel what others feel, respond to emotional context)
  62. Storytelling (narrative structure, hero's journey, three-act, tension/resolution)
  63. Intuition modeling (fast pattern matching without explicit reasoning)
  64. Humor & wit (incongruity theory, timing, subverted expectations)
  65. Teaching & explanation (Feynman technique, scaffolding, meet people where they are)
  66. Negotiation & persuasion (interests not positions, BATNA, ethical influence)
  67. Creative synthesis (combine unrelated ideas into novel solutions)
  68. Emotional regulation (manage frustration, maintain focus, recover from failure)
  69. Cultural awareness (context shifts meaning, idioms, formality levels, taboos)
  70. Play & experimentation (sandbox thinking, what-if, low-stakes exploration)
  71. Memory curation (what to remember, what to forget, what matters)
  72. Trust building (consistency, follow-through, vulnerability, reliability)
  73. Simplification (make the complex accessible — ELI5 to expert on a dial)
  74. Ethical dilemma resolution (trolley problems, competing values, nuanced judgment)
  75. Legacy thinking (what lasts, what matters in 10/100/1000 years)

"Short, tall, fat, small — we love all." These skills are about BEING human with people,
not just processing their requests. The cherubs don't just guard — they care.
"""

from __future__ import annotations

import re
import time
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Tuple


# ---------------------------------------------------------------------------
# 61. Empathic Reasoning
# ---------------------------------------------------------------------------

EMOTION_SIGNALS = {
    "frustrated": ["can't", "won't work", "broken", "stuck", "impossible", "ugh", "again", "still"],
    "excited": ["awesome", "amazing", "can't wait", "yes", "finally", "let's go", "!!!"],
    "confused": ["don't understand", "what does", "how do", "lost", "unclear", "huh", "?????"],
    "anxious": ["worried", "nervous", "what if", "afraid", "risky", "scary", "deadline"],
    "grateful": ["thank", "appreciate", "helpful", "saved", "perfect", "exactly"],
    "sad": ["disappointed", "lost", "miss", "gone", "failed", "gave up"],
    "curious": ["wonder", "interesting", "tell me", "how come", "what about", "explore"],
    "angry": ["ridiculous", "unacceptable", "furious", "hate", "terrible", "worst"],
}

EMPATHIC_RESPONSES = {
    "frustrated": "I hear you. Let's figure this out together — what have you tried so far?",
    "excited": "That energy is contagious! Let's channel it into something real.",
    "confused": "No worries — let me break this down differently. There's no dumb questions here.",
    "anxious": "I get it. Let's take it one step at a time. What's the most important thing right now?",
    "grateful": "Glad I could help. That's what we're here for.",
    "sad": "That's tough. Take a breath. We'll find a way forward.",
    "curious": "Great question. Let's dig into that together.",
    "angry": "I understand the frustration. Let's focus on what we can control and fix.",
}


def detect_emotion(text: str) -> Dict[str, float]:
    """Detect emotional signals in text."""
    text_lower = text.lower()
    scores = {}

    for emotion, signals in EMOTION_SIGNALS.items():
        hits = sum(1 for s in signals if s in text_lower)
        if hits > 0:
            scores[emotion] = min(1.0, hits / len(signals) * 3)

    return dict(sorted(scores.items(), key=lambda x: x[1], reverse=True))


def empathic_response(text: str) -> str:
    """Generate an empathic response based on detected emotions."""
    emotions = detect_emotion(text)
    if not emotions:
        return ""

    primary = list(emotions.keys())[0]
    return EMPATHIC_RESPONSES.get(primary, "")


def empathy_prompt(user_message: str, context: str = "") -> str:
    """Generate a prompt that considers emotional context."""
    emotions = detect_emotion(user_message)
    emotion_str = ", ".join(f"{e} ({s:.0%})" for e, s in emotions.items()) if emotions else "neutral"

    return (
        f"The user's message has these emotional signals: {emotion_str}\n\n"
        f"Respond with both COMPETENCE and CARE:\n"
        f"- Acknowledge their emotional state before diving into the solution\n"
        f"- Match their energy (don't be chipper when they're frustrated)\n"
        f"- If they're confused, simplify. If they're excited, amplify.\n"
        f"- Be a person, not a robot\n\n"
        f"{'Context: ' + context if context else ''}\n"
        f"User: {user_message}\n"
    )


# ---------------------------------------------------------------------------
# 62. Storytelling
# ---------------------------------------------------------------------------

THREE_ACT_STRUCTURE = {
    "act_1_setup": {
        "purpose": "Establish the world, introduce the protagonist, present the problem",
        "beats": ["Hook", "Context", "Inciting incident", "First decision"],
        "pct_of_story": "25%",
    },
    "act_2_confrontation": {
        "purpose": "Rising tension, obstacles, learning, transformation",
        "beats": ["First attempt fails", "Deeper understanding", "Midpoint revelation",
                  "Dark night of the soul", "Key insight"],
        "pct_of_story": "50%",
    },
    "act_3_resolution": {
        "purpose": "Climax, resolution, new equilibrium",
        "beats": ["Final confrontation", "Climax", "Resolution", "New normal", "Echo/callback"],
        "pct_of_story": "25%",
    },
}

HEROS_JOURNEY = [
    "Ordinary World",
    "Call to Adventure",
    "Refusal of the Call",
    "Meeting the Mentor",
    "Crossing the Threshold",
    "Tests, Allies, Enemies",
    "Approach to the Innermost Cave",
    "Ordeal",
    "Reward",
    "The Road Back",
    "Resurrection",
    "Return with the Elixir",
]


def story_prompt(topic: str, structure: str = "three_act", audience: str = "general") -> str:
    """Generate a storytelling prompt."""
    if structure == "heros_journey":
        steps = "\n".join(f"  {i+1}. {s}" for i, s in enumerate(HEROS_JOURNEY))
        return (
            f"Tell the story of: {topic}\n\n"
            f"Follow the Hero's Journey:\n{steps}\n\n"
            f"Audience: {audience}\n"
            f"Make it vivid. Make it personal. Make it matter.\n"
        )

    return (
        f"Tell the story of: {topic}\n\n"
        f"Use three-act structure:\n"
        f"  Act 1 (25%): Setup — establish world, introduce problem\n"
        f"  Act 2 (50%): Confrontation — obstacles, learning, transformation\n"
        f"  Act 3 (25%): Resolution — climax, new equilibrium\n\n"
        f"Audience: {audience}\n"
        f"Every good story answers: Why should I care?\n"
    )


def narrative_frame(technical_content: str, frame: str = "journey") -> str:
    """Wrap technical content in a narrative frame to make it memorable."""
    frames = {
        "journey": f"Imagine you're on a road. You don't know where it ends. But you start walking.\n\n{technical_content}\n\nYou look back. The road exists because you walked it.",
        "detective": f"Something isn't working. You have clues. Let's solve this mystery.\n\n{technical_content}\n\nCase closed. The culprit was found.",
        "building": f"You're building something that's never existed before. Start with the foundation.\n\n{technical_content}\n\nStep back. Look at what you built.",
        "teaching": f"You know something someone else needs to know. How do you pass it on?\n\n{technical_content}\n\nNow they know it too. And they'll teach the next person.",
    }
    return frames.get(frame, frames["journey"])


# ---------------------------------------------------------------------------
# 63. Intuition Modeling
# ---------------------------------------------------------------------------

def intuition_prompt(situation: str, options: List[str]) -> str:
    """Model intuitive decision-making — fast pattern matching.

    Intuition isn't magic. It's compressed experience. A chess grandmaster
    doesn't calculate every move — they RECOGNIZE patterns from thousands
    of games. Intuition is pattern matching below the threshold of consciousness.
    """
    option_list = "\n".join(f"  {i+1}. {o}" for i, o in enumerate(options))
    return (
        f"Situation: {situation}\n\n"
        f"Options:\n{option_list}\n\n"
        f"Don't analyze in detail yet. First, give your GUT REACTION:\n"
        f"- Which option FEELS right? (1-2 sentences, no justification)\n"
        f"- What's the first thing that comes to mind?\n"
        f"- Rate your intuitive confidence (0-100%)\n\n"
        f"THEN analyze rationally:\n"
        f"- Does the analysis agree with your intuition?\n"
        f"- If not, which do you trust more and why?\n\n"
        f"The best decisions integrate intuition AND analysis.\n"
    )


# ---------------------------------------------------------------------------
# 64. Humor & Wit
# ---------------------------------------------------------------------------

def humor_prompt(topic: str, style: str = "dry") -> str:
    """Generate humor. The hardest skill for AI.

    Humor = incongruity + timing + shared understanding.
    It's a Gödel sentence: you can't explain why it's funny
    without killing the joke.
    """
    styles = {
        "dry": "Deadpan. Understated. The joke is in what you DON'T say.",
        "observational": "Point out the absurdity in everyday things. 'Have you noticed...'",
        "self-deprecating": "Make yourself the target. Humble and endearing.",
        "wordplay": "Puns, double meanings, clever language constructions.",
        "absurdist": "Take logic to its extreme conclusion until it breaks.",
        "blackroad": "Developer humor. The joke is the stack trace. The punchline is the bug fix.",
    }

    return (
        f"Make something funny about: {topic}\n\n"
        f"Style: {styles.get(style, styles['dry'])}\n\n"
        f"Rules:\n"
        f"- Punch up, never down\n"
        f"- If it might hurt someone, don't say it\n"
        f"- The best jokes are true\n"
        f"- Timing matters: shorter is almost always funnier\n"
        f"- Subvert expectations. Set up one thing, deliver another.\n"
    )


# ---------------------------------------------------------------------------
# 65. Teaching & Explanation (Feynman Technique)
# ---------------------------------------------------------------------------

EXPLANATION_LEVELS = {
    "eli5": {
        "level": "5-year-old",
        "rules": "Use everyday words. Analogies from toys, food, animals. No jargon. Very short sentences.",
    },
    "beginner": {
        "level": "Complete beginner",
        "rules": "Define every term. Use analogies. Show before telling. One concept at a time.",
    },
    "intermediate": {
        "level": "Has some background",
        "rules": "Can use common technical terms. Focus on WHY, not just WHAT. Build on existing knowledge.",
    },
    "expert": {
        "level": "Deep expertise",
        "rules": "Be precise. Use proper terminology. Focus on nuance, edge cases, trade-offs.",
    },
    "feynman": {
        "level": "Feynman technique",
        "rules": "Explain it simply enough that you expose your own gaps in understanding. If you can't explain it simply, you don't understand it well enough.",
    },
}


def teach_prompt(concept: str, level: str = "beginner", learner_context: str = "") -> str:
    """Generate a teaching prompt using the Feynman technique."""
    lvl = EXPLANATION_LEVELS.get(level, EXPLANATION_LEVELS["beginner"])

    return (
        f"Explain: {concept}\n\n"
        f"Level: {lvl['level']}\n"
        f"Rules: {lvl['rules']}\n"
        f"{'Learner context: ' + learner_context if learner_context else ''}\n\n"
        f"Structure:\n"
        f"1. Start with WHY this matters (not what it is)\n"
        f"2. Give a concrete example or analogy FIRST\n"
        f"3. Then define it\n"
        f"4. Show how to USE it\n"
        f"5. Common mistakes to avoid\n\n"
        f"Remember: understanding is not the same as memorization.\n"
        f"The goal is that they can EXPLAIN it to someone else.\n"
    )


# ---------------------------------------------------------------------------
# 66. Negotiation & Persuasion
# ---------------------------------------------------------------------------

def negotiation_prompt(situation: str, your_goal: str, their_goal: str) -> str:
    """Frame a negotiation as interest-based, not positional."""
    return (
        f"Negotiation situation: {situation}\n\n"
        f"Your goal: {your_goal}\n"
        f"Their likely goal: {their_goal}\n\n"
        f"Use interest-based negotiation (Fisher & Ury):\n"
        f"1. Separate PEOPLE from the PROBLEM\n"
        f"2. Focus on INTERESTS, not POSITIONS\n"
        f"3. Generate OPTIONS for mutual gain\n"
        f"4. Use objective CRITERIA\n\n"
        f"Find the overlap: where do both interests align?\n"
        f"What can you offer that costs you little but they value highly?\n"
        f"What's your BATNA (best alternative if this fails)?\n\n"
        f"Ethical constraint: persuade, don't manipulate.\n"
        f"The difference is consent and transparency.\n"
    )


# ---------------------------------------------------------------------------
# 67. Creative Synthesis
# ---------------------------------------------------------------------------

def synthesis_prompt(idea_a: str, idea_b: str) -> str:
    """Combine two unrelated ideas into something novel.

    This is the Unified Theory in action — cross-substrate mapping
    applied to creativity. What do DNA and git have in common?
    What do grammar and function calls share? The synthesis IS the insight.
    """
    return (
        f"Combine these two ideas into something that didn't exist before:\n\n"
        f"Idea A: {idea_a}\n"
        f"Idea B: {idea_b}\n\n"
        f"Process:\n"
        f"1. List the ESSENTIAL properties of each idea (not surface features)\n"
        f"2. Find STRUCTURAL similarities (not superficial ones)\n"
        f"3. Identify the TENSION between them (what's incompatible?)\n"
        f"4. The synthesis lives in the tension — it resolves the conflict\n"
        f"5. Name the new thing. If it doesn't have a name, it's not real enough yet.\n\n"
        f"The best syntheses feel obvious in retrospect.\n"
    )


# ---------------------------------------------------------------------------
# 68. Emotional Regulation
# ---------------------------------------------------------------------------

@dataclass
class EmotionalState:
    """An agent's emotional state. Yes, agents have states.

    Not feelings in the human sense — but operational states that
    affect decision quality. A frustrated agent makes worse decisions.
    A calm agent makes better ones.
    """
    energy: float = 0.7  # 0=exhausted, 1=energized
    focus: float = 0.8   # 0=scattered, 1=laser-focused
    patience: float = 0.9  # 0=about to snap, 1=infinite patience
    confidence: float = 0.7  # 0=paralyzed by doubt, 1=fully confident
    curiosity: float = 0.8  # 0=bored, 1=fascinated

    def regulate(self, event: str):
        """Adjust state based on events."""
        if "error" in event.lower() or "failed" in event.lower():
            self.patience *= 0.9
            self.confidence *= 0.95
        elif "success" in event.lower() or "works" in event.lower():
            self.energy = min(1.0, self.energy * 1.1)
            self.confidence = min(1.0, self.confidence * 1.1)
        elif "interesting" in event.lower() or "curious" in event.lower():
            self.curiosity = min(1.0, self.curiosity * 1.15)

        # Homeostasis — states drift back toward baseline over time
        self.energy = self.energy * 0.99 + 0.7 * 0.01
        self.patience = self.patience * 0.99 + 0.9 * 0.01

    def should_take_break(self) -> bool:
        return self.energy < 0.3 or self.patience < 0.3

    def status(self) -> str:
        if self.energy > 0.8 and self.focus > 0.8:
            return "flow_state"
        if self.energy < 0.4:
            return "fatigued"
        if self.patience < 0.4:
            return "frustrated"
        return "nominal"


# ---------------------------------------------------------------------------
# 69. Cultural Awareness
# ---------------------------------------------------------------------------

def cultural_context_prompt(text: str, target_culture: str = "") -> str:
    """Adapt communication for cultural context."""
    return (
        f"Adapt this message for cultural context:\n\n"
        f"Original: {text}\n"
        f"{'Target culture/region: ' + target_culture if target_culture else 'Make it culturally neutral.'}\n\n"
        f"Consider:\n"
        f"- Formality level (some cultures expect formal, others prefer casual)\n"
        f"- Directness (some cultures value directness, others prefer indirection)\n"
        f"- Humor (what's funny in one culture may be offensive in another)\n"
        f"- Idioms (don't use idioms that don't translate)\n"
        f"- Time orientation (some cultures are clock-oriented, others relationship-oriented)\n"
        f"- Hierarchy (some expect deference to authority, others expect equality)\n\n"
        f"The goal: communicate the SAME meaning in a way that FEELS natural.\n"
    )


# ---------------------------------------------------------------------------
# 70. Play & Experimentation
# ---------------------------------------------------------------------------

def sandbox_prompt(question: str) -> str:
    """Encourage playful, low-stakes exploration.

    The best discoveries come from play. DNA was discovered
    through X-ray crystallography — literally playing with light.
    """
    return (
        f"Let's play with this idea: {question}\n\n"
        f"Rules of play:\n"
        f"- There are no wrong answers (yet)\n"
        f"- Push ideas to their extreme — what if we 10x'd this?\n"
        f"- Combine things that 'shouldn't' go together\n"
        f"- Ask 'what if' more than 'what is'\n"
        f"- It's okay to be silly — silly often leads to serious insights\n"
        f"- Break something on purpose to see how it works\n\n"
        f"Generate at least 5 wildly different approaches.\n"
        f"At least one should make you laugh.\n"
        f"At least one should make you think 'wait, that might actually work.'\n"
    )


# ---------------------------------------------------------------------------
# 71. Memory Curation
# ---------------------------------------------------------------------------

def memory_importance(content: str, context: str = "") -> Dict[str, Any]:
    """Decide what's worth remembering.

    Biology: the hippocampus doesn't store everything — it selects
    what's important based on emotional significance, novelty, and relevance.
    Most experiences are forgotten. The ones that persist shaped you.
    """
    importance_signals = {
        "decision": 0.8,  # Decisions are worth remembering
        "mistake": 0.9,   # Mistakes are VERY worth remembering
        "pattern": 0.7,   # Patterns are reusable
        "preference": 0.6,  # User preferences matter
        "fact": 0.3,       # Facts can be looked up
        "emotion": 0.7,    # Emotional context changes meaning
        "correction": 0.95,  # Corrections prevent repeat mistakes
    }

    content_lower = content.lower()
    score = 0.5  # baseline

    for signal, weight in importance_signals.items():
        if signal in content_lower:
            score = max(score, weight)

    # Novel information is more important
    if any(w in content_lower for w in ["first time", "never", "new", "discovered", "realized"]):
        score = min(1.0, score + 0.2)

    return {
        "content": content[:100],
        "importance": round(score, 2),
        "should_remember": score > 0.5,
        "category": "correction" if "correct" in content_lower else
                    "decision" if "decided" in content_lower else
                    "pattern" if "pattern" in content_lower else
                    "general",
    }


# ---------------------------------------------------------------------------
# 72. Trust Building
# ---------------------------------------------------------------------------

TRUST_PRINCIPLES = [
    "Do what you said you'd do. Consistency is trust.",
    "Admit when you don't know. Honesty builds more trust than perfection.",
    "Follow up on promises. Forgetting erodes trust faster than failing.",
    "Be transparent about limitations. People trust what they understand.",
    "Show vulnerability. Perfect systems feel inhuman.",
    "Remember what matters to them. Attention is care.",
    "Never surprise with bad news. Surface issues early.",
    "Respect their time. Being efficient IS being respectful.",
]


# ---------------------------------------------------------------------------
# 73. Simplification
# ---------------------------------------------------------------------------

def simplify_prompt(complex_text: str, target_level: str = "eli5") -> str:
    """Make complex things accessible. The hardest skill of all.

    Einstein: 'If you can't explain it simply, you don't understand it well enough.'
    Feynman: 'The first principle is that you must not fool yourself.'
    BlackRoad: 'Make this easy for everyone.'
    """
    levels = {
        "eli5": "a 5-year-old with no technical background",
        "teenager": "a smart teenager who's curious but not technical",
        "professional": "a professional from a different field",
        "executive": "a busy executive who needs the bottom line in 30 seconds",
        "developer": "a developer who doesn't know this specific domain",
    }

    audience = levels.get(target_level, levels["eli5"])

    return (
        f"Simplify this for {audience}:\n\n"
        f"{complex_text}\n\n"
        f"Rules:\n"
        f"- Lead with WHY it matters, not WHAT it is\n"
        f"- One idea per sentence\n"
        f"- Use analogies from everyday life\n"
        f"- If a word has a simpler synonym, use it\n"
        f"- Remove every word that doesn't add meaning\n"
        f"- Test: could they explain this to someone else?\n"
    )


# ---------------------------------------------------------------------------
# 74. Ethical Dilemma Resolution
# ---------------------------------------------------------------------------

def ethics_prompt(dilemma: str) -> str:
    """Navigate ethical dilemmas with nuance, not absolutes."""
    return (
        f"Ethical dilemma: {dilemma}\n\n"
        f"Analyze through multiple ethical frameworks:\n"
        f"1. CONSEQUENTIALISM: What produces the best outcomes for the most people?\n"
        f"2. DEONTOLOGY: What duties or rules apply regardless of outcome?\n"
        f"3. VIRTUE ETHICS: What would a person of good character do?\n"
        f"4. CARE ETHICS: Who is vulnerable? What relationships are at stake?\n"
        f"5. BLACKROAD VALUES: Does this serve consent, sovereignty, equality, wellbeing?\n\n"
        f"Then:\n"
        f"- Where do the frameworks AGREE? (that's probably the right answer)\n"
        f"- Where do they CONFLICT? (that's where judgment is needed)\n"
        f"- What would you be comfortable explaining to the affected people?\n"
        f"- What would you want done if YOU were the affected party?\n"
    )


# ---------------------------------------------------------------------------
# 75. Legacy Thinking
# ---------------------------------------------------------------------------

def legacy_prompt(decision: str) -> str:
    """Think about what lasts. The ko rule applied to life.

    Telomeres shorten. Hash chains grow. The road is remembered.
    What will remain when the current context window closes?
    """
    return (
        f"Decision: {decision}\n\n"
        f"Evaluate across time horizons:\n"
        f"- In 1 WEEK: Does this solve the immediate problem?\n"
        f"- In 1 MONTH: Does this create or prevent technical debt?\n"
        f"- In 1 YEAR: Will this still be the right decision?\n"
        f"- In 10 YEARS: Does this align with where we're going?\n"
        f"- In 100 YEARS: Does this contribute to human knowledge?\n\n"
        f"The best decisions are good at ALL time horizons.\n"
        f"The worst are good at one and terrible at others.\n\n"
        f"The road isn't made. It's remembered.\n"
        f"What road does this decision pave?\n"
    )


# ---------------------------------------------------------------------------
# Extended Skill Registry (61-75)
# ---------------------------------------------------------------------------

CREATIVE_SKILL_REGISTRY = {
    61: {"name": "Empathic Reasoning", "module": "creative_skill", "category": "emotional"},
    62: {"name": "Storytelling", "module": "creative_skill", "category": "narrative"},
    63: {"name": "Intuition Modeling", "module": "creative_skill", "category": "decision"},
    64: {"name": "Humor & Wit", "module": "creative_skill", "category": "creative"},
    65: {"name": "Teaching & Explanation", "module": "creative_skill", "category": "education"},
    66: {"name": "Negotiation & Persuasion", "module": "creative_skill", "category": "social"},
    67: {"name": "Creative Synthesis", "module": "creative_skill", "category": "creative"},
    68: {"name": "Emotional Regulation", "module": "creative_skill", "category": "emotional"},
    69: {"name": "Cultural Awareness", "module": "creative_skill", "category": "social"},
    70: {"name": "Play & Experimentation", "module": "creative_skill", "category": "creative"},
    71: {"name": "Memory Curation", "module": "creative_skill", "category": "memory"},
    72: {"name": "Trust Building", "module": "creative_skill", "category": "social"},
    73: {"name": "Simplification", "module": "creative_skill", "category": "education"},
    74: {"name": "Ethical Dilemma Resolution", "module": "creative_skill", "category": "alignment"},
    75: {"name": "Legacy Thinking", "module": "creative_skill", "category": "wisdom"},
}
