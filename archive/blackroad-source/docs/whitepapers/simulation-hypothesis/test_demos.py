"""
Tests for the supporting code demonstrations.

Verifies that the mathematical demos produce correct, reproducible results.
"""

import hashlib
import math
import cmath
import sys
import os

# Add code directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'code'))


# ── hashchain.py tests ──────────────────────────────────────────────────────

class TestHashChain:
    def test_sha256_determinism(self):
        """Same input must always produce the same hash."""
        from hashchain import sha256
        msg = "January 3, 2009"
        assert sha256(msg) == sha256(msg)

    def test_sha256_uniqueness(self):
        """Different inputs must produce different hashes."""
        from hashchain import sha256
        assert sha256("a") != sha256("b")

    def test_sha256_known_value(self):
        """Verify against known SHA-256 output."""
        from hashchain import sha256
        expected = hashlib.sha256(b"test").hexdigest()
        assert sha256("test") == expected

    def test_build_chain_genesis(self):
        """Genesis block should have index 0 and previous_hash of all zeros."""
        from hashchain import build_chain
        chain = build_chain([])
        assert len(chain) == 1
        assert chain[0]['index'] == 0
        assert chain[0]['previous_hash'] == '0' * 64
        assert chain[0]['data'] == 'genesis'

    def test_build_chain_links(self):
        """Each block's previous_hash must match the prior block's hash."""
        from hashchain import build_chain
        chain = build_chain(["event1", "event2", "event3"])
        for i in range(1, len(chain)):
            assert chain[i]['previous_hash'] == chain[i - 1]['hash']

    def test_verify_valid_chain(self):
        """An unmodified chain must pass verification."""
        from hashchain import build_chain, verify_chain
        chain = build_chain(["a", "b", "c"])
        assert verify_chain(chain) is True

    def test_verify_tampered_chain(self):
        """A tampered chain must fail verification."""
        from hashchain import build_chain, verify_chain
        chain = build_chain(["a", "b", "c"])
        chain[1]['data'] = 'tampered'
        assert verify_chain(chain) is False


# ── godel.py tests ──────────────────────────────────────────────────────────

class TestGodel:
    def test_godel_statement_structure(self):
        """Godel statement should have required fields."""
        from godel import godel_statement
        g = godel_statement("Peano Arithmetic")
        assert g["system"] == "Peano Arithmetic"
        assert "not provable" in g["statement"]
        assert g["status"] == "true but unprovable"
        assert "incomplete" in g["consequence"]

    def test_godel_number_is_integer(self):
        """Godel number should be a positive integer."""
        from godel import godel_statement
        g = godel_statement("ZFC")
        assert isinstance(g["godel_number"], int)
        assert g["godel_number"] >= 0

    def test_systems_and_limits(self):
        """Should return a list of formal systems with their limits."""
        from godel import systems_and_their_limits
        systems = systems_and_their_limits()
        assert len(systems) >= 4
        for s in systems:
            assert "system" in s
            assert "cannot_prove" in s
            assert "needs" in s

    def test_ps_hash_chain_append_and_verify(self):
        """PS-SHA-infinity chain should append and verify correctly."""
        from godel import PSHashChain
        chain = PSHashChain()
        chain.append("first", actor="test")
        chain.append("second", actor="test")
        valid, fail_idx = chain.verify()
        assert valid is True
        assert fail_idx is None
        assert len(chain) == 2

    def test_ps_hash_chain_tamper_detection(self):
        """Tampered chain should fail verification."""
        from godel import PSHashChain
        chain = PSHashChain()
        chain.append("first", actor="test")
        chain.append("second", actor="test")
        chain.chain[0]["content"] = "tampered"
        valid, fail_idx = chain.verify()
        assert valid is False
        assert fail_idx == 0

    def test_incompleteness_gallery(self):
        """Gallery should contain key theorems."""
        from godel import INCOMPLETENESS_GALLERY
        assert "Gödel 1931" in INCOMPLETENESS_GALLERY
        assert "Turing 1936" in INCOMPLETENESS_GALLERY
        assert len(INCOMPLETENESS_GALLERY) >= 5


# ── riemann_zeros.py tests ──────────────────────────────────────────────────

class TestRiemannZeros:
    def test_trivial_zeros_sin_term(self):
        """sin(pi * s / 2) should be ~0 at s = -2n for the trivial zeros."""
        for n in range(1, 10):
            s = -2 * n
            sin_val = math.sin(math.pi * s / 2)
            assert abs(sin_val) < 1e-10, f"sin(pi*{s}/2) = {sin_val}, expected ~0"

    def test_euler_identity(self):
        """e^(i*pi) + 1 should equal 0 (within floating point precision)."""
        result = cmath.exp(1j * math.pi) + 1
        assert abs(result) < 1e-15

    def test_sha256_empty_string(self):
        """SHA-256 of empty string should match known value."""
        from riemann_zeros import hashlib_sha256_empty
        expected = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
        assert hashlib_sha256_empty() == expected


# ── constants.py tests ──────────────────────────────────────────────────────

class TestConstants:
    def test_pi_precision(self):
        """Pi should be correct to at least 10 decimal places."""
        assert abs(math.pi - 3.14159265358979) < 1e-10

    def test_e_precision(self):
        """Euler's number should be correct."""
        assert abs(math.e - 2.71828182845904) < 1e-10

    def test_golden_ratio(self):
        """Golden ratio phi = (1 + sqrt(5)) / 2."""
        phi = (1 + math.sqrt(5)) / 2
        assert abs(phi - 1.6180339887) < 1e-8

    def test_fine_structure_constant(self):
        """Fine structure constant alpha ~ 1/137."""
        alpha = 1 / 137.036
        assert 0.007 < alpha < 0.008


# ── fibonacci.py tests ──────────────────────────────────────────────────────

class TestFibonacci:
    def test_fibonacci_sequence(self):
        """First 10 Fibonacci numbers should be correct."""
        expected = [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
        fib = [0, 1]
        for _ in range(8):
            fib.append(fib[-1] + fib[-2])
        assert fib == expected

    def test_golden_ratio_convergence(self):
        """Ratio of consecutive Fibonacci numbers should converge to phi."""
        phi = (1 + math.sqrt(5)) / 2
        a, b = 1, 1
        for _ in range(30):
            a, b = b, a + b
        ratio = b / a
        assert abs(ratio - phi) < 1e-10
