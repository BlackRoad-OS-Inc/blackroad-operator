#!/usr/bin/env python3
"""
🌌 BlackRoad Trinary Logic Engine
Implements 1/0/-1 reasoning with paraconsistent logic
Deploy across all Pis for distributed contradiction-tolerant computing
"""

import json
import time
import socket
from datetime import datetime
from enum import IntEnum

class TrinaryState(IntEnum):
    """Trinary logic states: -1, 0, 1"""
    FALSE = -1
    UNKNOWN = 0
    TRUE = 1

class TrinaryLogic:
    """
    Trinary logic system with paraconsistent reasoning
    
    States: 1 (true), 0 (unknown), -1 (false)
    Allows contradictions without system failure
    """
    
    @staticmethod
    def AND(a: int, b: int) -> int:
        """Trinary AND: min(a, b)"""
        return min(a, b)
    
    @staticmethod
    def OR(a: int, b: int) -> int:
        """Trinary OR: max(a, b)"""
        return max(a, b)
    
    @staticmethod
    def NOT(a: int) -> int:
        """Trinary NOT: flip sign"""
        return -a
    
    @staticmethod
    def IMPLIES(a: int, b: int) -> int:
        """Trinary implication: OR(NOT(a), b)"""
        return max(-a, b)
    
    @staticmethod
    def XOR(a: int, b: int) -> int:
        """
        Trinary XOR (exclusive or)
        Returns 1 if exactly one is true, -1 if both same, 0 otherwise
        """
        if a == b:
            return -1
        if a == 1 and b == -1:
            return 1
        if a == -1 and b == 1:
            return 1
        return 0
    
    @staticmethod
    def CONSENSUS(values: list[int]) -> int:
        """
        Find consensus among multiple trinary values
        Returns majority, or 0 if no clear consensus
        """
        if not values:
            return 0
        
        counts = {-1: 0, 0: 0, 1: 0}
        for v in values:
            if v in counts:
                counts[v] += 1
        
        # Find max count
        max_count = max(counts.values())
        # Get all states with max count
        winners = [k for k, v in counts.items() if v == max_count]
        
        # If tie, return UNKNOWN
        if len(winners) > 1:
            return 0
        
        return winners[0]
    
    @staticmethod
    def DETECT_CONTRADICTION(values: list[int]) -> bool:
        """Check if values contain contradiction (both 1 and -1)"""
        return 1 in values and -1 in values


class ParaconsistentStore:
    """
    Store that allows contradictory information
    Multiple agents can assert conflicting truths
    """
    
    def __init__(self):
        self.assertions = {}  # key -> [(value, agent, timestamp)]
        self.contradictions = []  # List of detected contradictions
    
    def assert_value(self, key: str, value: int, agent: str):
        """Assert a trinary value from an agent"""
        if key not in self.assertions:
            self.assertions[key] = []
        
        timestamp = datetime.utcnow().isoformat()
        self.assertions[key].append((value, agent, timestamp))
        
        # Check for contradiction
        values = [v for v, _, _ in self.assertions[key]]
        if TrinaryLogic.DETECT_CONTRADICTION(values):
            self.contradictions.append({
                'key': key,
                'values': values,
                'agents': [a for _, a, _ in self.assertions[key]],
                'detected_at': timestamp
            })
    
    def get_value(self, key: str) -> tuple[int, bool]:
        """
        Get consensus value for key
        Returns: (consensus_value, has_contradiction)
        """
        if key not in self.assertions:
            return (0, False)  # UNKNOWN, no contradiction
        
        values = [v for v, _, _ in self.assertions[key]]
        consensus = TrinaryLogic.CONSENSUS(values)
        contradiction = TrinaryLogic.DETECT_CONTRADICTION(values)
        
        return (consensus, contradiction)
    
    def get_history(self, key: str) -> list:
        """Get full assertion history for a key"""
        return self.assertions.get(key, [])
    
    def get_contradictions(self) -> list:
        """Get all detected contradictions"""
        return self.contradictions


class TrinaryEngine:
    """Main trinary logic engine"""
    
    def __init__(self, node_name: str = None):
        self.node_name = node_name or socket.gethostname()
        self.store = ParaconsistentStore()
        self.logic = TrinaryLogic()
        self.start_time = datetime.utcnow()
    
    def evaluate(self, key: str) -> dict:
        """Evaluate current state of a key"""
        consensus, has_contradiction = self.store.get_value(key)
        history = self.store.get_history(key)
        
        return {
            'key': key,
            'consensus': consensus,
            'has_contradiction': has_contradiction,
            'num_assertions': len(history),
            'assertions': [
                {
                    'value': v,
                    'agent': a,
                    'timestamp': t
                } for v, a, t in history
            ]
        }
    
    def status(self) -> dict:
        """Get engine status"""
        uptime = (datetime.utcnow() - self.start_time).total_seconds()
        
        return {
            'node': self.node_name,
            'uptime_seconds': uptime,
            'total_keys': len(self.store.assertions),
            'total_assertions': sum(len(v) for v in self.store.assertions.values()),
            'total_contradictions': len(self.store.contradictions),
            'logic_type': 'trinary_paraconsistent',
            'states': [-1, 0, 1]
        }
    
    def assert_truth(self, key: str, value: int, agent: str = None):
        """Assert a trinary truth value"""
        agent = agent or self.node_name
        self.store.assert_value(key, value, agent)
    
    def truth_table(self):
        """Display truth tables for all operations"""
        print("🔺 Trinary Logic Truth Tables")
        print("=" * 60)
        
        states = [-1, 0, 1]
        
        print("\nAND (∧):")
        print("  ∧  | -1   0   1")
        print("  ---|------------")
        for a in states:
            row = f"  {a:2} | "
            for b in states:
                row += f"{self.logic.AND(a, b):2}  "
            print(row)
        
        print("\nOR (∨):")
        print("  ∨  | -1   0   1")
        print("  ---|------------")
        for a in states:
            row = f"  {a:2} | "
            for b in states:
                row += f"{self.logic.OR(a, b):2}  "
            print(row)
        
        print("\nNOT (¬):")
        for a in states:
            print(f"  ¬({a:2}) = {self.logic.NOT(a):2}")
        
        print("\nIMPLIES (→):")
        print("  →  | -1   0   1")
        print("  ---|------------")
        for a in states:
            row = f"  {a:2} | "
            for b in states:
                row += f"{self.logic.IMPLIES(a, b):2}  "
            print(row)


def demo():
    """Demo the trinary logic engine"""
    print("🌌 BlackRoad Trinary Logic Engine")
    print("=" * 60)
    
    engine = TrinaryEngine()
    
    # Show truth tables
    engine.truth_table()
    
    # Demo paraconsistent store
    print("\n\n🔄 Paraconsistent Store Demo")
    print("=" * 60)
    
    # Multiple agents asserting about service health
    engine.assert_truth('service_health', 1, 'agent_cecilia')
    engine.assert_truth('service_health', -1, 'agent_lucidia')
    engine.assert_truth('service_health', 1, 'agent_alice')
    engine.assert_truth('service_health', 0, 'agent_octavia')
    
    result = engine.evaluate('service_health')
    print(f"\nKey: {result['key']}")
    print(f"Consensus: {result['consensus']} ({['FALSE', 'UNKNOWN', 'TRUE'][result['consensus'] + 1]})")
    print(f"Has Contradiction: {result['has_contradiction']}")
    print(f"\nAssertions:")
    for assertion in result['assertions']:
        state_name = ['FALSE', 'UNKNOWN', 'TRUE'][assertion['value'] + 1]
        print(f"  • {assertion['agent']}: {assertion['value']} ({state_name})")
    
    # Show status
    print("\n\n📊 Engine Status")
    print("=" * 60)
    status = engine.status()
    print(json.dumps(status, indent=2))
    
    print("\n✅ Trinary logic engine operational!")


if __name__ == '__main__':
    demo()
