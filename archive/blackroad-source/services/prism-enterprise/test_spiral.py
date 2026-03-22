import math
from prism_math_spiral import (
    transport, spiral_step, dlog, phase_loss, ema_phase, phase_diff, audit_hash_hex, circular_mean
)

def test_transport_rotation():
    z = 1+0j
    z2 = transport(z, math.pi/2, 0.0)
    assert abs(z2.real) < 1e-9 and abs(z2.imag - 1.0) < 1e-9

def test_dlog_symmetry():
    a, b = 2+0j, 0+2j
    assert abs(dlog(a,b) - dlog(b,a)) < 1e-9

def test_spiral_step_damping():
    z0 = 1+0j
    z1 = spiral_step(z0, 0.1, -1.0, 0.0)
    assert abs(z1) < 1.0

def test_audit_hash_changes():
    h1 = audit_hash_hex('00', 1+0j)
    h2 = audit_hash_hex(h1, 1+0j)
    assert h1 != h2
