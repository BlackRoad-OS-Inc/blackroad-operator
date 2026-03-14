"""Utility skills used by BlackRoad agents.

50 AI skills across 10 categories — the complete AI orchestration toolkit.

Categories:
- Reasoning: CoT, ReAct, Tree-of-Thought, Reflection (1-4)
- Collaboration: Multi-agent debate, consensus (5)
- Execution: Tool selection, function calling (6, 35)
- Planning: Hierarchical task planning (7)
- Memory: Working memory, continuous learning (8, 43)
- Generation: Code, structured output, summarization, translation, style (9-16)
- Infrastructure: Model routing, pipelines, rate limiting, circuit breakers (17-18, 21, 24)
- Evaluation: LLM-as-judge, A/B testing, benchmarking (19, 22)
- Safety: Guardrails, PII detection, prompt injection (20)
- Knowledge: RAG, NER, sentiment, QA, fact checking, anomaly detection (25-32)
- Multimodal: Vision, audio, streaming, edge inference (33-40)
- Frontier: Autonomous coding, ensemble, federated, sovereign AI (41-50)

Copyright (c) 2024-2026 BlackRoad OS, Inc. All rights reserved.

This software is proprietary and confidential. Unauthorized copying, transfer,
or reproduction of this file, via any medium, is strictly prohibited.

Licensed for non-commercial testing and evaluation purposes only.
Commercial use requires a separate license agreement with BlackRoad OS, Inc.

For licensing inquiries: legal@blackroad.io
"""

__all__ = [
    # Original skills
    "math_skill",
    "quantum_skill",
    "viz_skill",
    # Core skills
    "ai_skill",
    "devops_skill",
    "data_skill",
    "security_skill",
    # NEW: Top 50 AI skills
    "agentic_skill",       # 1-8:  CoT, ReAct, ToT, Reflection, Debate, Tools, Planning, Memory
    "generation_skill",    # 9-16: Code gen, structured output, conversation, summarization, translation
    "orchestration_skill", # 17-24: Routing, pipelines, eval, guardrails, rate limiting, A/B, cache
    "knowledge_skill",     # 25-32: RAG, classification, NER, knowledge graphs, sentiment, QA
    "multimodal_skill",    # 33-40: Vision, audio, function calling, streaming, edge, workflows
    "frontier_skill",      # 41-50: Autonomous coding, ensemble, federated, sovereign AI
]
