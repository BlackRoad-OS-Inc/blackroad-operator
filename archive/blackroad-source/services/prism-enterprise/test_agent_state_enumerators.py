from pathlib import Path
import sys

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from agents.blackroad_agent_framework_package5 import AgentStateEnumerators


def test_number_theory_utilities():
    assert AgentStateEnumerators.euler_totient(30) == 8
    assert AgentStateEnumerators.mobius(60) == 0  # squared prime factor present
    assert AgentStateEnumerators.mobius(30) == -1  # 3 distinct primes → (-1)^3
    assert AgentStateEnumerators.prime_factors(60) == [2, 2, 3, 5]
