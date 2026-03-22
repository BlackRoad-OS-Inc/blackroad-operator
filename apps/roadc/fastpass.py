"""
BlackRoad FastPass — Circuit-based request routing
Not yes/no. Not allow/deny. Just: "Wanna skip the line?"

Each node has a circuit. The circuit has three states:
  OPEN    (+1) — fast lane, come on through
  HALF    ( 0) — testing, might be slow, try it but have a backup
  CLOSED  (-1) — this lane is blocked, skip it, don't even try

When a node is fast → circuit stays OPEN → requests fly through
When a node slows down → circuit goes HALF → we try but have backup ready
When a node dies → circuit goes CLOSED → we skip it instantly, zero wait

The FastPass: before your request even leaves, the circuit tells you
which nodes are worth trying. You don't wait in line to find out
the ride is broken. You already know.

This is ternary at the infrastructure level.
"""

import time
import threading
import urllib.request
import json
from ternary import Trit, ARRIVED, WAITING, CANCELLED, TernaryRouter


class Circuit:
    """A circuit breaker with ternary state.
    Not on/off. OPEN/HALF/CLOSED."""

    def __init__(self, name, url, check_path='/api/health'):
        self.name = name
        self.url = url
        self.check_path = check_path
        self.state = ARRIVED  # start optimistic — OPEN
        self.failures = 0
        self.successes = 0
        self.last_check = 0
        self.last_latency = 0
        self.avg_latency = 0
        self.total_requests = 0
        self.total_skipped = 0
        self.half_open_after = 5  # seconds before retrying a closed circuit

    @property
    def is_open(self): return self.state == ARRIVED
    @property
    def is_half(self): return self.state == WAITING
    @property
    def is_closed(self): return self.state == CANCELLED

    def record_success(self, latency_ms):
        self.successes += 1
        self.failures = 0
        self.last_latency = latency_ms
        self.avg_latency = (self.avg_latency * 0.8) + (latency_ms * 0.2) if self.avg_latency else latency_ms
        self.state = ARRIVED  # OPEN
        self.last_check = time.time()

    def record_failure(self):
        self.failures += 1
        self.successes = 0
        if self.failures >= 3:
            self.state = CANCELLED  # CLOSED — skip this node
        elif self.failures >= 1:
            self.state = WAITING  # HALF — try but have backup

    def should_try(self):
        """Should we send a request to this node?"""
        self.total_requests += 1
        if self.is_open:
            return True  # fast lane
        if self.is_half:
            return True  # worth a shot
        if self.is_closed:
            # Check if enough time passed to retry
            if time.time() - self.last_check > self.half_open_after:
                self.state = WAITING  # give it another chance
                return True
            self.total_skipped += 1
            return False  # skip the line

    def status_symbol(self):
        if self.is_open: return '🟢'
        if self.is_half: return '🟡'
        return '🔴'

    def __repr__(self):
        return f"{self.status_symbol()} {self.name} ({self.avg_latency:.0f}ms avg, {self.failures}f)"


class FastPassRouter:
    """Route requests through circuits. Skip closed lanes.
    Try open lanes first. Half-open lanes get a cautious try."""

    def __init__(self):
        self.circuits = {}
        self.router = TernaryRouter()
        self.req_count = 0

    def add_node(self, name, url, check_path='/api/health'):
        self.circuits[name] = Circuit(name, url, check_path)

    def probe(self, name, path='/', timeout=3):
        """Hit a node and update its circuit"""
        circuit = self.circuits[name]
        t0 = time.time()
        try:
            req = urllib.request.urlopen(circuit.url + path, timeout=timeout)
            data = req.read()
            ms = (time.time() - t0) * 1000
            circuit.record_success(ms)
            return True, ms, data
        except Exception as e:
            circuit.record_failure()
            return False, (time.time() - t0) * 1000, str(e)

    def fastpass(self, path='/', timeout=3):
        """Route a request. Skip closed circuits. Race open ones."""
        self.req_count += 1
        rid = f'fp-{self.req_count}'

        # Sort by circuit state: OPEN first, HALF second, CLOSED skip
        candidates = []
        skipped = []
        for name, circuit in self.circuits.items():
            if circuit.should_try():
                candidates.append((name, circuit))
            else:
                skipped.append(name)

        if not candidates:
            return None, 0, "All circuits closed", skipped

        # Race all candidates
        root = self.router.route(rid, [c[0] for c in candidates])
        winner_lock = threading.Lock()
        winner = [None]
        winner_data = [None]
        winner_ms = [0]
        t0 = time.time()

        def try_node(name, circuit):
            ok, ms, data = self.probe(name, path, timeout)
            if ok:
                with winner_lock:
                    if not winner[0]:
                        winner[0] = name
                        winner_data[0] = data
                        winner_ms[0] = ms
                        try:
                            self.router.resolve(rid, name, f"{ms:.0f}ms")
                        except:
                            pass

        threads = []
        for name, circuit in candidates:
            t = threading.Thread(target=try_node, args=(name, circuit))
            t.start()
            threads.append(t)

        # Wait for winner only
        deadline = time.time() + timeout
        while not winner[0] and time.time() < deadline:
            time.sleep(0.001)

        return winner[0], winner_ms[0], winner_data[0], skipped

    def board(self):
        """Display the FastPass board — which lanes are open"""
        lines = ["FastPass Board:"]
        for name, c in sorted(self.circuits.items(), key=lambda x: -int(x[1].state)):
            skip_rate = f"{c.total_skipped}/{c.total_requests}" if c.total_requests else "0/0"
            lines.append(f"  {c.status_symbol()} {name:20s} {c.avg_latency:6.0f}ms  skipped: {skip_rate}")
        return '\n'.join(lines)


# ═══════════════════════════════════════════════════════════
if __name__ == '__main__':
    print("=" * 60)
    print("BlackRoad FastPass — Skip the Line")
    print("=" * 60)

    fp = FastPassRouter()
    fp.add_node('cecilia', 'http://192.168.4.96:11434')
    fp.add_node('octavia', 'http://192.168.4.101:11434')
    fp.add_node('gematria', 'http://10.8.0.8:11434')  # will fail/be slow

    print("\n--- Initial probe (all circuits start OPEN) ---")
    for name in fp.circuits:
        ok, ms, _ = fp.probe(name, '/api/tags', timeout=2)
        status = f"{ms:.0f}ms" if ok else "FAILED"
        print(f"  {name}: {status}")

    print(f"\n{fp.board()}")

    print("\n--- FastPass routing (5 requests) ---")
    for i in range(5):
        winner, ms, data, skipped = fp.fastpass('/api/tags', timeout=2)
        skip_str = f" (skipped: {', '.join(skipped)})" if skipped else ""
        print(f"  Request {i+1}: {winner} won in {ms:.0f}ms{skip_str}")

    print(f"\n{fp.board()}")

    print(f"""
HOW IT WORKS:
  🟢 OPEN   = Fast lane. No wait. Come through.
  🟡 HALF   = Maybe slow. We'll try, but backup is ready.
  🔴 CLOSED = Skip it. Don't even try. Zero ms wasted.

  After 3 failures → circuit CLOSES → node gets skipped
  After 5 seconds → circuit goes HALF → gets one more chance
  One success → circuit OPENS → back in the fast lane

  This is not a load balancer. This is not a health check.
  This is a FastPass. You skip the line because the system
  already knows which rides are working.
""")
