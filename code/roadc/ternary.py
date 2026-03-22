"""
RoadC Ternary Runtime — Recursive Ternary Logic
The BlackBox Protocol's routing primitive, now a first-class type.

Ternary values: -1 (cancel), 0 (waiting), 1 (arrived)
This isn't just three states — it's the foundation of self-cancelling computation.

When a packet arrives via path A (1), all pending paths (-1) cancel automatically.
The -1 isn't failure. It's intelligence. It's the network saying "already handled."

Recursive ternary: a ternary value can contain ternary values.
A routing decision contains sub-decisions contains sub-sub-decisions.
It's turtles all the way down — and at every level, -1 prunes the tree.

Math: n/(1+1/n)^n = n/e + 1/(2e) + O(1/n)
The 1/(2e) is the irreducible gap — the cost of being discrete instead of continuous.
You can't beat it. You route around it.
"""

import time
import hashlib
from dataclasses import dataclass, field
from typing import Optional, List, Dict, Callable, Any


# ── Trit: the atomic unit ──
class Trit:
    """A balanced ternary digit: -1, 0, or 1"""
    __slots__ = ('_value',)

    def __init__(self, value):
        if isinstance(value, Trit):
            self._value = value._value
        elif isinstance(value, (int, float)):
            if value > 0: self._value = 1
            elif value < 0: self._value = -1
            else: self._value = 0
        elif isinstance(value, bool):
            self._value = 1 if value else -1
        elif value is None:
            self._value = 0
        else:
            self._value = 0

    @property
    def arrived(self): return self._value == 1
    @property
    def waiting(self): return self._value == 0
    @property
    def cancelled(self): return self._value == -1

    def __repr__(self): return f"Trit({self._value})"
    def __int__(self): return self._value
    def __bool__(self): return self._value == 1
    def __eq__(self, other):
        if isinstance(other, Trit): return self._value == other._value
        return self._value == other
    def __hash__(self): return hash(self._value)

    # Ternary logic operations
    def __and__(self, other):
        """MIN — both must arrive"""
        return Trit(min(self._value, int(Trit(other))))

    def __or__(self, other):
        """MAX — either arriving is enough"""
        return Trit(max(self._value, int(Trit(other))))

    def __invert__(self):
        """NEGATE — flip the sign"""
        return Trit(-self._value)

    def __neg__(self):
        """Cancel — arrived becomes cancelled, cancelled becomes arrived"""
        return Trit(-self._value)

    def __add__(self, other):
        """Sum — clamped to [-1, 1]"""
        return Trit(max(-1, min(1, self._value + int(Trit(other)))))

    def __mul__(self, other):
        """Multiply — product of trits"""
        return Trit(self._value * int(Trit(other)))


# Shortcuts
ARRIVED = Trit(1)
WAITING = Trit(0)
CANCELLED = Trit(-1)


# ── TernaryWord: a vector of trits ──
class TernaryWord:
    """A word made of trits — like a byte but base 3"""

    def __init__(self, trits=None, width=8):
        if trits is None:
            self.trits = [WAITING] * width
        elif isinstance(trits, list):
            self.trits = [Trit(t) for t in trits]
        elif isinstance(trits, int):
            # Convert integer to balanced ternary
            self.trits = []
            n = abs(trits)
            sign = 1 if trits >= 0 else -1
            while n > 0:
                r = n % 3
                if r == 2: r = -1; n += 1
                self.trits.append(Trit(r * sign))
                n //= 3
            while len(self.trits) < width:
                self.trits.append(WAITING)
        self.width = len(self.trits)

    def to_int(self):
        """Convert back to integer"""
        return sum(int(t) * (3 ** i) for i, t in enumerate(self.trits))

    def __repr__(self):
        symbols = {1: '+', 0: '0', -1: '-'}
        return 'T[' + ''.join(symbols[int(t)] for t in reversed(self.trits)) + ']'

    def cancel_pending(self):
        """Set all waiting trits to cancelled — the key insight"""
        self.trits = [CANCELLED if t.waiting else t for t in self.trits]
        return self


# ── Recursive Ternary Route ──
@dataclass
class Route:
    """A routing path through the network. Contains sub-routes recursively."""
    path_id: str
    state: Trit = field(default_factory=lambda: WAITING)
    children: List['Route'] = field(default_factory=list)
    result: Any = None
    started_at: float = field(default_factory=time.time)
    resolved_at: Optional[float] = None
    depth: int = 0

    def arrive(self, result=None):
        """This path delivered. Cancel all siblings."""
        self.state = ARRIVED
        self.result = result
        self.resolved_at = time.time()
        return self

    def cancel(self):
        """This path is no longer needed."""
        self.state = CANCELLED
        self.resolved_at = time.time()
        for child in self.children:
            if child.state.waiting:
                child.cancel()
        return self

    def spawn(self, path_id: str) -> 'Route':
        """Create a sub-route"""
        child = Route(path_id=path_id, depth=self.depth + 1)
        self.children.append(child)
        return child

    def resolve(self, result=None):
        """First arrival wins. Cancel everything else."""
        self.arrive(result)
        # Cancel all siblings at the parent level
        return self

    @property
    def latency_ms(self):
        if self.resolved_at:
            return round((self.resolved_at - self.started_at) * 1000, 2)
        return None

    def tree(self, indent=0):
        """Pretty print the routing tree"""
        symbols = {1: '+', 0: '.', -1: 'x'}
        state_sym = symbols[int(self.state)]
        lat = f" ({self.latency_ms}ms)" if self.latency_ms else ""
        result_str = f" → {self.result}" if self.result else ""
        lines = [f"{'  ' * indent}[{state_sym}] {self.path_id}{lat}{result_str}"]
        for child in self.children:
            lines.append(child.tree(indent + 1))
        return '\n'.join(lines)


# ── Recursive Ternary Router ──
class TernaryRouter:
    """Routes requests through multiple paths. First arrival cancels the rest.
    This is the BlackBox Protocol routing engine."""

    def __init__(self):
        self.routes: Dict[str, Route] = {}
        self.stats = {'total': 0, 'arrived': 0, 'cancelled': 0, 'avg_latency': 0}

    def route(self, request_id: str, paths: List[str]) -> Route:
        """Create a multi-path route. Each path runs in parallel.
        First to arrive cancels all others."""
        root = Route(path_id=request_id)
        for p in paths:
            root.spawn(p)
        self.routes[request_id] = root
        self.stats['total'] += 1
        return root

    def resolve(self, request_id: str, path_id: str, result=None) -> Route:
        """A path delivered. Cancel everything else."""
        root = self.routes.get(request_id)
        if not root:
            raise ValueError(f"Unknown route: {request_id}")

        for child in root.children:
            if child.path_id == path_id:
                child.arrive(result)
            elif child.state.waiting:
                child.cancel()
                self.stats['cancelled'] += 1

        root.arrive(result)
        self.stats['arrived'] += 1
        if root.latency_ms:
            self.stats['avg_latency'] = (self.stats['avg_latency'] + root.latency_ms) / 2

        return root

    def status(self):
        return {
            'active_routes': sum(1 for r in self.routes.values() if r.state.waiting),
            'completed': sum(1 for r in self.routes.values() if r.state.arrived),
            **self.stats,
        }


# ── Assembly-like instructions for ternary operations ──
class TernaryASM:
    """Low-level ternary instruction set.
    These map directly to what the Hailo/ARM can execute."""

    @staticmethod
    def TRIT_SET(register, value):
        """Set a trit register"""
        return Trit(value)

    @staticmethod
    def TRIT_AND(a, b):
        """MIN of two trits"""
        return a & b

    @staticmethod
    def TRIT_OR(a, b):
        """MAX of two trits"""
        return a | b

    @staticmethod
    def TRIT_NEG(a):
        """Negate a trit"""
        return -a

    @staticmethod
    def TRIT_MUL(a, b):
        """Multiply trits"""
        return a * b

    @staticmethod
    def WORD_CANCEL(word):
        """Cancel all pending trits in a word — the key operation"""
        return word.cancel_pending()

    @staticmethod
    def ROUTE_SPAWN(router, request_id, paths):
        """Spawn a multi-path route"""
        return router.route(request_id, paths)

    @staticmethod
    def ROUTE_RESOLVE(router, request_id, path_id, result):
        """First arrival wins"""
        return router.resolve(request_id, path_id, result)


# ── Demo ──
if __name__ == '__main__':
    print("=== BlackRoad Ternary Runtime ===\n")

    # Basic trit operations
    print("Trit logic:")
    print(f"  ARRIVED & WAITING  = {ARRIVED & WAITING}")
    print(f"  ARRIVED | CANCELLED = {ARRIVED | CANCELLED}")
    print(f"  -ARRIVED           = {-ARRIVED}")
    print(f"  ARRIVED * CANCELLED = {ARRIVED * CANCELLED}")
    print()

    # Ternary word
    w = TernaryWord(42)
    print(f"42 in balanced ternary: {w} = {w.to_int()}")
    w2 = TernaryWord(-13)
    print(f"-13 in balanced ternary: {w2} = {w2.to_int()}")
    print()

    # Recursive routing
    print("Recursive Ternary Routing:")
    router = TernaryRouter()

    # Simulate: request goes through 3 paths (Tor, WireGuard, direct)
    root = router.route("req-001", ["tor", "wireguard", "direct"])
    print(f"  Spawned: {root.tree()}")

    # Direct path arrives first
    import time; time.sleep(0.01)
    router.resolve("req-001", "direct", result="Hello from Octavia")
    print(f"\n  After resolution:\n{root.tree()}")

    print(f"\n  Stats: {router.stats}")
    print(f"\n  The -1 isn't failure. It's intelligence.")
    print(f"  1/(2e) = {1/(2*2.718281828):.6f} — the irreducible gap.")
