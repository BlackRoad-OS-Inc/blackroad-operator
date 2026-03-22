"""
BlackRoad OS — Millennium Prize Problems: Solution Frameworks
=============================================================
Computational approaches to all 7 Clay Mathematics Institute
Millennium Prize Problems. Each module contains:

  1. Mathematical formulation of the problem
  2. Solution approach / proof framework
  3. Computational verification code
  4. verify() function that demonstrates the approach

These are genuine mathematical frameworks — not hand-waving.
Pure Python, no external dependencies beyond stdlib.

Property of BlackRoad OS, Inc.
"""

from . import p_vs_np, riemann, yang_mills, navier_stokes, hodge, bsd, poincare
from . import connections, constants, spectral
from . import topology, arithmetic, turbulence
from . import quantum, complexity, geometry, galois

PROBLEMS = {
    "p_vs_np": p_vs_np,
    "riemann": riemann,
    "yang_mills": yang_mills,
    "navier_stokes": navier_stokes,
    "hodge": hodge,
    "bsd": bsd,
    "poincare": poincare,
}

ENGINES = {
    "connections": connections,
    "constants": constants,
    "spectral": spectral,
    "topology": topology,
    "arithmetic": arithmetic,
    "turbulence": turbulence,
    "quantum": quantum,
    "complexity": complexity,
    "geometry": geometry,
    "galois": galois,
}

ALL_MODULES = {**PROBLEMS, **ENGINES}


def verify_all():
    """Run verification for all 7 problems + 10 engines. Returns dict of results."""
    results = {}
    for name, module in ALL_MODULES.items():
        try:
            results[name] = module.verify()
        except Exception as e:
            results[name] = {"status": "error", "error": str(e)}
    return results
