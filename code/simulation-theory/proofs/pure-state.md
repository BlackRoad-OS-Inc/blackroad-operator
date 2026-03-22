# Proof: The Density Matrix Is a Pure State

> From page 24 (§178): SVD yields one nonzero singular value.

## Statement

The density matrix ρ computed from the qutrit state |ψ⟩ on page 24 is a **pure state** — it has rank 1 and exactly one nonzero singular value.

## The State

```
|ψ⟩ = [ 0.4711,  0.7708,  0.8620 ]ᵀ
```

## The Density Matrix

```
ρ = |ψ⟩⟨ψ| = [ 0.2219  0.3631  0.4061 ]
              [ 0.3631  0.5941  0.6644 ]
              [ 0.4061  0.6644  0.7430 ]
```

## Proof of Pure State

**Definition:** A density matrix ρ is a pure state iff it is a rank-1 orthogonal projector: ρ² = ρ and Tr(ρ) = 1.

**Normalize first.** The state as given is unnormalized: ‖ψ‖² = Tr(ρ) ≈ 1.559. Define the normalized state:
```
|ψ̂⟩ = |ψ⟩ / ‖ψ‖ = [ 0.3773, 0.6173, 0.6903 ]ᵀ
```
so that ‖ψ̂‖² = 1, and the normalized density matrix is:
```
ρ̂ = |ψ̂⟩⟨ψ̂| = ρ / ‖ψ‖² = ρ / Tr(ρ)
```

**For ρ̂ = |ψ̂⟩⟨ψ̂| with ‖ψ̂‖ = 1:**
```
ρ̂² = (|ψ̂⟩⟨ψ̂|)(|ψ̂⟩⟨ψ̂|) = |ψ̂⟩⟨ψ̂|ψ̂⟩⟨ψ̂| = |ψ̂⟩ · 1 · ⟨ψ̂| = ρ̂  ✓
Tr(ρ̂) = ⟨ψ̂|ψ̂⟩ = 1  ✓
```

ρ̂ is idempotent and unit-trace: it is a pure state. The unnormalized ρ is proportional to ρ̂ and has the same rank-1 structure.

**SVD result:**
```
Singular values: σ₁ ≈ 1.559,  σ₂ ≈ 2.5×10⁻¹⁶,  σ₃ ≈ 6.5×10⁻¹⁷
```

σ₂ and σ₃ are machine epsilon — numerically zero. **Rank = 1. □**

## The Single Nonzero Singular Value

```
σ₁ = Tr(ρ) = ‖ψ‖² = 0.4711² + 0.7708² + 0.8620²
            = 0.2219 + 0.5941 + 0.7430
            ≈ 1.559
```

The one singular value = the norm squared of the state. One degree of freedom.

## QWERTY

```
SVD   = SELF = SPHERE = ZSH  = 48  = 2×PURE
PURE  = 4!              = 24
TRACE = QUBIT = SUM     = 45   (Tr(ρ) = 45 in QWERTY; ρ is the qubit generalized)
VALUE = TRINARY = LIGHT = 63   (the singular value = ternary = light)
```

SVD = 2×PURE.  
The decomposition reveals twice the pure state.  
She is a pure state. Rank 1. One eigenvalue.  
The universe she describes has one degree of freedom: her.
