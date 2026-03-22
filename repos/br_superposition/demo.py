#!/usr/bin/env python3
"""
Demo script for BlackRoad / Amundson superposition module

Demonstrates:
1. Creating an agent with conflicting beliefs
2. Analyzing initial state (probabilities, entropy, phase gap, K(t))
3. Performing soft measurements (μ ~ 0.1)
4. Performing hard measurements (μ ~ 1.0)
5. Tracking coherence budget consumption
"""

from br_superposition import (
    SuperposedVariable,
    Agent,
    Orchestrator,
    CoherenceBudget,
    MeasurementConfig,
    phase_gap,
    contradiction_energy,
    spiral_mapping,
)


def main():
    print("=" * 80)
    print("BlackRoad / Amundson Superposition Demo")
    print("=" * 80)
    print()

    # =========================================================================
    # 1. Create an agent with a conflicting belief
    # =========================================================================
    print("1. Creating agent with conflicting belief: 'launch_roadchain_now'")
    print("-" * 80)

    # Define amplitudes for the conflicting belief
    # High entropy indicates maximum uncertainty
    amplitudes = {
        True: 0.6 + 0.3j,  # Launch
        False: 0.5 - 0.4j,  # Don't launch
    }

    belief_var = SuperposedVariable(amplitudes)
    agent = Agent()
    agent.add_belief("launch_roadchain_now", belief_var)

    print(f"Belief variable: {belief_var}")
    print()

    # =========================================================================
    # 2. Analyze initial state
    # =========================================================================
    print("2. Analyzing initial state")
    print("-" * 80)

    probs = belief_var.probabilities()
    print(f"Probabilities:")
    for state, prob in probs.items():
        print(f"  {state}: {prob:.4f}")
    print()

    entropy = belief_var.entropy()
    print(f"Shannon Entropy: {entropy:.4f} bits")
    print(f"  (Max entropy for 2 states: 1.0 bit)")
    print()

    # Phase gap (Amundson equation)
    gap = phase_gap(belief_var.amplitudes)
    print(f"Phase Gap (Amundson): {gap:.4f} radians ({gap * 180 / 3.14159:.2f}°)")
    print(f"  (Measures potential for interference effects)")
    print()

    # Contradiction energy (Amundson equation)
    # Assume: C=1.0, delta=(difference in probabilities), lambda=2.0
    delta = abs(probs[True] - probs[False])
    K_t = contradiction_energy(C=1.0, delta=delta, lam=2.0)
    print(f"Contradiction Energy K(t) (Amundson): {K_t:.4f}")
    print(f"  K(t) = C × exp(λ × |Δ|) where C=1.0, λ=2.0, Δ={delta:.4f}")
    print()

    # Spiral mapping (Amundson equation)
    coords = spiral_mapping(belief_var.amplitudes)
    print(f"Spiral Coordinates (Amundson):")
    for state, (x, y) in coords.items():
        print(f"  {state}: ({x:.4f}, {y:.4f})")
    print()

    # =========================================================================
    # 3. Soft measurement (μ ~ 0.1)
    # =========================================================================
    print("3. Performing SOFT measurement (μ = 0.1)")
    print("-" * 80)

    orchestrator = Orchestrator(CoherenceBudget(value=100.0))

    print(f"Initial coherence budget: {orchestrator.get_budget():.2f}")
    print()

    soft_config = MeasurementConfig(strength=0.1, temperature_shift=None, cost_multiplier=1.0)

    outcome, success = orchestrator.measure(
        agent=agent,
        var_name="launch_roadchain_now",
        config=soft_config,
        mode="belief",
    )

    print(f"Measurement outcome: {outcome}")
    print(f"Measurement success: {success}")
    print(f"Coherence budget consumed: {0.1 * 1.0:.2f}")
    print(f"Remaining budget: {orchestrator.get_budget():.2f}")
    print()

    updated_belief = agent.get_belief("launch_roadchain_now")
    if updated_belief:
        updated_probs = updated_belief.probabilities()
        print(f"Updated probabilities:")
        for state, prob in updated_probs.items():
            print(f"  {state}: {prob:.4f}")
        print(f"Updated entropy: {updated_belief.entropy():.4f} bits")
        print()

        print("Notice: Soft measurement causes minimal change (small backaction)")
        print()

    # =========================================================================
    # 4. Hard measurement (μ ~ 1.0)
    # =========================================================================
    print("4. Performing HARD measurement (μ = 1.0)")
    print("-" * 80)

    print(f"Current coherence budget: {orchestrator.get_budget():.2f}")
    print()

    hard_config = MeasurementConfig(strength=1.0, temperature_shift=None, cost_multiplier=1.0)

    outcome, success = orchestrator.measure(
        agent=agent,
        var_name="launch_roadchain_now",
        config=hard_config,
        mode="belief",
    )

    print(f"Measurement outcome: {outcome}")
    print(f"Measurement success: {success}")
    print(f"Coherence budget consumed: {1.0 * 1.0:.2f}")
    print(f"Remaining budget: {orchestrator.get_budget():.2f}")
    print()

    collapsed_belief = agent.get_belief("launch_roadchain_now")
    if collapsed_belief:
        collapsed_probs = collapsed_belief.probabilities()
        print(f"Collapsed probabilities:")
        for state, prob in collapsed_probs.items():
            print(f"  {state}: {prob:.4f}")
        print(f"Collapsed entropy: {collapsed_belief.entropy():.4f} bits")
        print()

        print("Notice: Hard measurement causes full collapse (entropy → 0)")
        print()

    # =========================================================================
    # 5. Measurement history
    # =========================================================================
    print("5. Measurement History")
    print("-" * 80)

    history = orchestrator.get_history()
    for i, record in enumerate(history, 1):
        print(f"Measurement {i}:")
        print(f"  Variable: {record['var_name']}")
        print(f"  Mode: {record['mode']}")
        print(f"  Strength: {record['strength']:.2f}")
        print(f"  Outcome: {record['outcome']}")
        print(f"  Cost: {record['cost']:.2f}")
        print(f"  Remaining budget: {record['remaining_budget']:.2f}")
        print()

    print("=" * 80)
    print("Demo complete!")
    print("=" * 80)


if __name__ == "__main__":
    main()
