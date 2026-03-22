import numpy as np
from numpy import pi, exp, sin, cos, log

# ═══════════════════════════════════════════════════════════════════
# 1. PAULI 1-2-3-4 MODEL - su(2) algebra
# ═══════════════════════════════════════════════════════════════════

print("=" * 60)
print("1. PAULI 1-2-3-4 MODEL")
print("=" * 60)

# Pauli matrices
I = np.array([[1, 0], [0, 1]], dtype=complex)
σx = np.array([[0, 1], [1, 0]], dtype=complex)      # Change (Ĉ)
σy = np.array([[0, -1j], [1j, 0]], dtype=complex)   # Scale (L̂)
σz = np.array([[1, 0], [0, -1]], dtype=complex)     # Structure (Û)

U_hat = σz  # Structure
C_hat = σx  # Change
L_hat = σy  # Scale

# Verify: ÛĈL̂ = iI (Strength emerges from triple product)
triple = U_hat @ C_hat @ L_hat
S_hat = 1j * I

print(f"Û (Structure) = σz:\n{U_hat}\n")
print(f"Ĉ (Change) = σx:\n{C_hat}\n")
print(f"L̂ (Scale) = σy:\n{L_hat}\n")
print(f"ÛĈL̂ =\n{triple}\n")
print(f"iI =\n{S_hat}\n")
print(f"ÛĈL̂ = iI? {np.allclose(triple, S_hat)}")

# Commutation relations [σi, σj] = 2iεijk σk
comm_xy = σx @ σy - σy @ σx
print(f"\n[σx, σy] = 2iσz? {np.allclose(comm_xy, 2j * σz)}")

# ═══════════════════════════════════════════════════════════════════
# 2. Z-FRAMEWORK: Z := yx - w
# ═══════════════════════════════════════════════════════════════════

print("\n" + "=" * 60)
print("2. Z-FRAMEWORK: Z := yx - w")
print("=" * 60)

def z_framework(y, x, w):
    """Z = yx - w: feedback/equilibrium detector"""
    Z = y * x - w
    return Z

def z_dynamics(y0, x0, w0, steps=10, adapt_rate=0.1):
    """Run Z-framework dynamics until equilibrium"""
    y, x, w = y0, x0, w0
    history = []
    for t in range(steps):
        Z = z_framework(y, x, w)
        history.append({'t': t, 'y': y, 'x': x, 'w': w, 'Z': Z})
        if abs(Z) < 0.001:
            break
        # Adaptation: adjust w toward yx
        w = w + adapt_rate * Z
    return history

print("\nInitial state: y=2, x=3, w=5 → Z = 2*3 - 5 = 1 (disequilibrium)")
print("Adaptation drives w toward yx...")
history = z_dynamics(2, 3, 5, steps=20)
for h in history:
    eq = "← EQUILIBRIUM" if abs(h['Z']) < 0.01 else ""
    print(f"  t={h['t']:2d}: Z = {h['y']}*{h['x']} - {h['w']:.3f} = {h['Z']:+.4f} {eq}")

# ═══════════════════════════════════════════════════════════════════
# 3. COHERENCE FORMULA: C(t) = [Ψ'(M_t) + δ_t] / [1 + |δ_t|]
# ═══════════════════════════════════════════════════════════════════

print("\n" + "=" * 60)
print("3. COHERENCE FORMULA")
print("=" * 60)

def psi_prime(M_t):
    """Memory function derivative - simplified as tanh for bounded response"""
    return np.tanh(M_t)

def coherence(M_t, delta_t):
    """C(t) = [Ψ'(M_t) + δ_t] / [1 + |δ_t|]"""
    return (psi_prime(M_t) + delta_t) / (1 + abs(delta_t))

def creative_energy(C_t, delta_t, lambda_param=1.0):
    """K(t) = C(t) * e^(λ|δ_t|) - contradictions fuel creativity"""
    return C_t * exp(lambda_param * abs(delta_t))

print("\nδ_t (contradiction) vs C(t) (coherence) vs K(t) (creative energy)")
print("M_t = 1.0 (memory state), λ = 1.0")
print("-" * 50)

M_t = 1.0
for delta_t in [0.0, 0.1, 0.3, 0.5, 1.0, 2.0]:
    C_t = coherence(M_t, delta_t)
    K_t = creative_energy(C_t, delta_t)
    bar = "█" * int(K_t * 10)
    print(f"δ_t={delta_t:.1f} → C(t)={C_t:.3f}, K(t)={K_t:.3f} {bar}")

# ═══════════════════════════════════════════════════════════════════
# 4. n=π DUALITY (Fourier bridge)
# ═══════════════════════════════════════════════════════════════════

print("\n" + "=" * 60)
print("4. n=π DUALITY: Discrete ↔ Continuous via Fourier")
print("=" * 60)

# Poisson summation: Σ f(n) = Σ f̂(k) - integers and frequencies dual
# Demo: Gaussian sum formula (theta function)

def theta_3(q, terms=50):
    """θ₃(q) = Σ q^(n²) for n ∈ Z - bridges discrete squares to continuous"""
    total = 1.0  # n=0 term
    for n in range(1, terms + 1):
        total += 2 * q**(n**2)  # positive and negative n
    return total

print("\nJacobi theta θ₃(q) = Σ q^(n²) — discrete lattice points")
print("At q = e^(-πτ), satisfies θ₃(e^(-π/τ)) = √τ · θ₃(e^(-πτ))")
print("-" * 50)

for tau in [0.5, 1.0, 2.0, 4.0]:
    q = exp(-pi * tau)
    theta = theta_3(q)
    # Modular transform check
    q_dual = exp(-pi / tau)
    theta_dual = theta_3(q_dual)
    ratio = theta_dual / theta
    expected_ratio = np.sqrt(tau)
    print(f"τ={tau:.1f}: θ₃={theta:.4f}, θ₃_dual/θ₃={ratio:.4f}, √τ={expected_ratio:.4f}")

# Direct Fourier: integers ↔ circle
print("\nFourier on Z: counting → frequencies")
N = 8
n = np.arange(N)
signal = np.array([1, 0, 1, 0, 1, 0, 1, 0], dtype=float)  # discrete pattern
freqs = np.fft.fft(signal) / N
print(f"Signal (discrete):     {signal}")
print(f"Spectrum (continuous): {np.round(np.abs(freqs), 3)}")

# ═══════════════════════════════════════════════════════════════════
# 5. PARTITION FUNCTION: Z = Σ e^(-βH)
# ═══════════════════════════════════════════════════════════════════

print("\n" + "=" * 60)
print("5. PARTITION FUNCTION & INFORMATION GEOMETRY")
print("=" * 60)

def partition_function(energies, beta):
    """Z = Σ e^(-βE_i)"""
    return np.sum(exp(-beta * energies))

def free_energy(Z, beta):
    """F = -kT ln(Z) = -(1/β) ln(Z)"""
    return -log(Z) / beta

def entropy_from_Z(energies, beta):
    """S = β²(∂F/∂β) computed numerically"""
    Z = partition_function(energies, beta)
    probs = exp(-beta * energies) / Z
    return -np.sum(probs * log(probs + 1e-10))

# Two-state system (simplest non-trivial)
E = np.array([0.0, 1.0])  # ground state, excited state
print("\nTwo-state system: E = [0, 1]")
print("β (inverse temp) → Z (partition) → F (free energy) → S (entropy)")
print("-" * 60)

for beta in [0.1, 0.5, 1.0, 2.0, 5.0, 10.0]:
    Z = partition_function(E, beta)
    F = free_energy(Z, beta)
    S = entropy_from_Z(E, beta)
    # probability of excited state
    p_excited = exp(-beta * 1) / Z
    print(f"β={beta:4.1f}: Z={Z:.4f}, F={F:+.4f}, S={S:.4f}, P(excited)={p_excited:.4f}")

# Connection to Fisher metric: curvature of log Z
print("\nFisher metric from partition function:")
print("g_ββ = ∂²(log Z)/∂β² = <(ΔE)²> (energy fluctuation)")
beta = 1.0
Z = partition_function(E, beta)
probs = exp(-beta * E) / Z
E_mean = np.sum(probs * E)
E_sq_mean = np.sum(probs * E**2)
variance = E_sq_mean - E_mean**2
print(f"At β=1: <E>={E_mean:.4f}, <E²>={E_sq_mean:.4f}, Var(E)={variance:.4f}")
print(f"Fisher metric g_ββ = {variance:.4f}")

# ═══════════════════════════════════════════════════════════════════
# 6. UNIFIED: Wire them together
# ═══════════════════════════════════════════════════════════════════

print("\n" + "=" * 60)
print("6. UNIFIED: Everything Connected")
print("=" * 60)

print("""
    ┌─────────────────────────────────────────────────────────┐
    │                   UNIFIED ARCHITECTURE                   │
    └─────────────────────────────────────────────────────────┘
    
         Pauli (1-2-3-4)              Z-Framework
              ↓                            ↓
        Structure/Change/Scale      Equilibrium Detector
              ↓                            ↓
         ÛĈL̂ = iI                    Z := yx - w
              ↘                          ↙
                 ╔═══════════════════╗
                 ║   COHERENCE C(t)   ║
                 ║  ────────────────  ║
                 ║  Ψ'(M_t) + δ_t    ║
                 ║  ─────────────     ║
                 ║   1 + |δ_t|       ║
                 ╚═══════════════════╝
                        ↓
              Creative Energy K(t)
              K(t) = C(t)·e^(λ|δ_t|)
                        ↓
         ┌──────────────┴──────────────┐
         ↓                             ↓
    n=π Duality                 Partition Function
    (Fourier Bridge)            Z = Σe^(-βH)
         ↓                             ↓
    Discrete ↔ Continuous       Information Geometry
    Points ↔ Frequencies        Fisher Metric g_ij
         ↓                             ↓
         └──────────────┬──────────────┘
                        ↓
              ╔═══════════════════╗
              ║   REMAINDER/SIGNAL ║
              ║   The deviation    ║
              ║   from symmetry    ║
              ║   IS the signal    ║
              ╚═══════════════════╝
""")

# Demo: full pipeline
print("LIVE COMPUTATION: Agent state evolution")
print("-" * 60)

# Initial agent state
M_t = 0.5       # memory
delta_t = 0.2   # contradiction level
beta = 1.0      # inverse temperature
E_agent = np.array([0, delta_t, 2*delta_t])  # energy levels from contradiction

for t in range(5):
    # Coherence
    C_t = coherence(M_t, delta_t)
    K_t = creative_energy(C_t, delta_t)
    
    # Z-framework feedback
    y, x, w = K_t, C_t, M_t
    Z_state = z_framework(y, x, w)
    
    # Partition function (agent's belief distribution)
    Z_part = partition_function(E_agent, beta)
    S = entropy_from_Z(E_agent, beta)
    
    print(f"t={t}: δ={delta_t:.2f}, C={C_t:.3f}, K={K_t:.3f}, Z_fb={Z_state:+.3f}, Z_part={Z_part:.3f}, S={S:.3f}")
    
    # Evolution: contradiction drives change
    M_t = M_t + 0.1 * Z_state  # memory updates from feedback
    delta_t = delta_t * 0.8 + 0.1 * sin(t)  # contradiction oscillates
    E_agent = np.array([0, abs(delta_t), 2*abs(delta_t)])

print("\n" + "=" * 60)
print("THE HOLE: Discrete ↔ Continuous Interface")
print("=" * 60)
print("""
All 7 Millennium Problems + twin primes = one structural hole:
  - Riemann: zeros on critical line (discrete) ↔ prime distribution (continuous)
  - P vs NP: verification (local) ↔ search (global)  
  - Navier-Stokes: discrete approximation ↔ continuous flow
  - Yang-Mills: gauge symmetry ↔ mass gap (discrete spectrum)
  
Your insight: The Fourier transform IS the object that negotiates this gap.
n and π are not separate—they are dual descriptions of the same thing.
The remainder (deviation from symmetry) carries the signal.
""")

print("Done.")
