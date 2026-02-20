"""Utility skills used by BlackRoad agents.

Skills provide modular capabilities across multiple domains:
- AI/ML: embeddings, RAG, chunking, similarity
- DevOps: Docker, K8s, deployment, metrics
- Data: ETL, statistics, time series, analytics
- Security: encryption, auth, vulnerability scanning
- Math: primes, norms, FFT
- Quantum: Bell pairs, QFT
- Visualization: charts, histograms

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
    # New skills
    "ai_skill",
    "devops_skill",
    "data_skill",
    "security_skill",
]
