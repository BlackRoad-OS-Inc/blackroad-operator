from __future__ import annotations
import cmath, math, hashlib
from typing import Callable, Iterable, Tuple

C = complex

# 1) Exponential transport U(θ,a) z = e^{(a+i)θ} z
def transport(z: C, theta: float, a: float = 0.0) -> C:
    return z * cmath.exp((a + 1j) * theta)

# 4) Spiral ODE discretization
def spiral_step(z: C, dt: float, a: float, omega: float) -> C:
    growth = math.exp(a * dt)
    rot = cmath.exp(1j * omega * dt)
    return z * growth * rot

# 5) Log-spiral distance
def dlog(z1: C, z2: C) -> float:
    r1 = math.log(max(abs(z1), 1e-12))
    r2 = math.log(max(abs(z2), 1e-12))
    dphi = cmath.phase(z2) - cmath.phase(z1)
    while dphi > math.pi: dphi -= 2*math.pi
    while dphi < -math.pi: dphi += 2*math.pi
    return math.hypot(r2 - r1, dphi)

# 6) Phase-aligned regression loss
def phase_loss(z: C, zh: C) -> float:
    # Align zh by the relative phase of z and zh
    phi = cmath.phase(z * zh.conjugate())
    zh_aligned = zh * cmath.exp(1j * phi)
    d = z - zh_aligned
    return (d.real*d.real + d.imag*d.imag)

# 7) Complex EMA with phase snapping
def ema_phase(m_prev: C, z: C, beta: float) -> C:
    if not (0.0 < beta < 1.0):
        raise ValueError("beta must be in (0,1)")
    mag = abs(m_prev)
    u = (z/abs(z)) if abs(z) > 0 else 1+0j
    return beta*m_prev + (1-beta)*(u*(mag if mag>0 else abs(z)))

# 9) Phase-difference operator
def phase_diff(xk: C, xk_1: C) -> float:
    d = cmath.phase(xk * xk_1.conjugate())
    if d > math.pi: d -= 2*math.pi
    if d < -math.pi: d += 2*math.pi
    return d

# 13) Policy-filtered update (projection callback)
Projector = Callable[[C], C]

def safe_update(z: C, g: C, dt: float, a: float, omega: float, eta: float, proj: Projector) -> C:
    step = transport(g, omega*dt, a*dt)
    return proj(z + eta*step)

# 14) Audit hash-link

def audit_hash_hex(prev_hex: str, z: C, decimals: int = 6) -> str:
    r = lambda x: f"{x:.{decimals}f}"
    payload = f"{prev_hex}|{r(z.real)},{r(z.imag)}".encode()
    return hashlib.sha256(payload).hexdigest()

# 15) Agent consensus on the circle
def circular_mean(us: Iterable[C]) -> Tuple[C, float]:
    values = list(us)
    if not values:
        return 1+0j, 0.0
    vec = sum((u/abs(u) if abs(u)>0 else 1+0j) for u in values)
    n = len(values)
    m = vec / n
    kappa = min(1.0, abs(m))
    return (m/abs(m) if abs(m)>0 else 1+0j, kappa)
