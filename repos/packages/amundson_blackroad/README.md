# Amundson–BlackRoad Instruments

## Resolution (Auto Resolver)
Fills coherence payloads with contextual defaults (`rad`, `J`, dimensionless gains) and returns a provenance map explaining each value.

## Projective Phase (AM-VI)
Integrates the AM-2 dynamics in the projective coordinate `u = tan(θ/2)` to keep phase derivatives finite near `π/2`, reporting `a_dot`, `u_dot`, and `θ_dot` in `1/s` and `rad/s`.

## Quadratic Ladder (AM-VII)
Tabulates special-angle sin/cos/tan triples and verifies the identity `sin²θ = (1 - cos 2θ)/2` to `1e-12`, keeping all quantities dimensionless.

## Chebyshev Resonance (AM-VIII)
Evaluates Chebyshev polynomials to expose when `θ/π` approaches rational ratios, returning harmonic indices `n`, numerators `p`, and resonance scores (dimensionless).

## Collatz Flow (BR-8)
Advects integer mass distributions through the Collatz map while tracking Landauer energy (`J`) using `k_B T ln 2` per irreversible step and ensuring total mass conservation.

## Fibonacci–Pascal Instrument
Provides Pascal rows and diagonal sums alongside Fibonacci targets (`1` units) and a golden-ratio rotation step that updates amplitude (dimensionless) and phase (`rad`).
