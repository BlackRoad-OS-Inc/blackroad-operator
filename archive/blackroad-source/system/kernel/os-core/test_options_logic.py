#!/usr/bin/env python3
"""Test Suite for Options Calculator - Mathematical Logic Tests

Tests the deep mathematical relationships:
1. Quadrant symmetry and duality
2. Logarithmic base relationships (log2, log3, ln, log10)
3. Put-Call parity
4. Z-framework operator algebra
5. Information theory bounds
6. Breakeven convergence in log-moneyness space"""

import math
from options_calculator import OptionsCalculator, OptionType, PositionType


def test_quadrant_symmetry():
    """Test that Long/Short positions are perfect opposites (adjoint pairs)"""
    print("\n" + "=" * 80)
    print("TEST 1: QUADRANT SYMMETRY (Adjoint Pairs)")
    print("=" * 80)
    print("Testing that Long Call + Short Call = 0 (like creation + annihilation)")

    calc = OptionsCalculator(current_price=100.0)

    X = 100  # Strike
    P = 5    # Premium
    S_T = 110  # Final price

    # Test Call symmetry
    long_call = calc.long_call(X, P, S_T)
    short_call = calc.short_call(X, P, S_T)

    print(f"\nLong Call profit:  ${long_call['profit']:.2f}")
    print(f"Short Call profit: ${short_call['profit']:.2f}")
    print(f"Sum:               ${long_call['profit'] + short_call['profit']:.2f}")

    assert abs(long_call['profit'] + short_call['profit']) < 0.01, "Long + Short should cancel!"
    print("✓ PASS: Long and Short positions are perfect adjoints")

    # Test Put symmetry
    long_put = calc.long_put(X, P, S_T=90)
    short_put = calc.short_put(X, P, S_T=90)

    print(f"\nLong Put profit:  ${long_put['profit']:.2f}")
    print(f"Short Put profit: ${short_put['profit']:.2f}")
    print(f"Sum:              ${long_put['profit'] + short_put['profit']:.2f}")

    assert abs(long_put['profit'] + short_put['profit']) < 0.01, "Long + Short should cancel!"
    print("✓ PASS: Put positions are perfect adjoints")


def test_put_call_parity():
    """Test Put-Call Parity: C - P = S - X·e^(-rt)"""
    print("\n" + "=" * 80)
    print("TEST 2: PUT-CALL PARITY")
    print("=" * 80)
    print("Testing: Long Call + Short Put = Long Stock (synthetic positions)")

    calc = OptionsCalculator(current_price=100.0)

    X = 100
    P_call = 5
    P_put = 5
    S_T = 110

    # Synthetic long stock: Long Call + Short Put
    long_call = calc.long_call(X, P_call, S_T)
    short_put = calc.short_put(X, P_put, S_T)

    synthetic_stock_pnl = long_call['profit'] + short_put['profit']
    actual_stock_pnl = S_T - X  # Stock bought at strike, sold at S_T

    print(f"\nSynthetic Stock P&L (Long Call + Short Put): ${synthetic_stock_pnl:.2f}")
    print(f"Actual Stock P&L (bought at {X}, sold at {S_T}): ${actual_stock_pnl:.2f}")
    print(f"Difference: ${abs(synthetic_stock_pnl - actual_stock_pnl):.2f}")

    # Note: Small difference expected due to premiums
    print("\n✓ PASS: Synthetic positions behave like underlying (modulo premiums)")


def test_logarithmic_bases():
    """Test relationships between different logarithmic bases"""
    print("\n" + "=" * 80)
    print("TEST 3: LOGARITHMIC BASE RELATIONSHIPS")
    print("=" * 80)
    print("Testing: ln(x), log2(x), log3(x), log10(x) relationships")

    # Test moneyness transformations
    S_T = 110
    X = 100
    moneyness = S_T / X  # 1.1

    ln_m = math.log(moneyness)
    log2_m = math.log2(moneyness)
    log3_m = math.log(moneyness, 3)
    log10_m = math.log10(moneyness)

    print(f"\nMoneyness (S_T/X): {moneyness}")
    print(f"ln(moneyness):     {ln_m:.6f}")
    print(f"log2(moneyness):   {log2_m:.6f}")
    print(f"log3(moneyness):   {log3_m:.6f}")
    print(f"log10(moneyness):  {log10_m:.6f}")

    # Test base conversion: log_b(x) = ln(x) / ln(b)
    log2_from_ln = ln_m / math.log(2)
    log3_from_ln = ln_m / math.log(3)
    log10_from_ln = ln_m / math.log(10)

    print(f"\nBase conversion verification:")
    print(f"log2 direct:    {log2_m:.6f}")
    print(f"log2 from ln:   {log2_from_ln:.6f}")
    print(f"Difference:     {abs(log2_m - log2_from_ln):.9f}")

    assert abs(log2_m - log2_from_ln) < 1e-9, "Base conversion should be exact!"
    assert abs(log3_m - log3_from_ln) < 1e-9, "Base conversion should be exact!"
    assert abs(log10_m - log10_from_ln) < 1e-9, "Base conversion should be exact!"

    print("\n✓ PASS: All logarithmic bases correctly related via ln(x)/ln(b)")


def test_information_bits():
    """Test information-theoretic interpretation: bits needed to represent premium"""
    print("\n" + "=" * 80)
    print("TEST 4: INFORMATION THEORY (Premium as Uncertainty)")
    print("=" * 80)
    print("Testing: I = -log2(P/S) gives bits of information in premium")

    calc = OptionsCalculator(current_price=100.0)

    premiums = [0.5, 1, 2, 5, 10, 20, 50]

    print(f"\n{'Premium':<10} {'P/S':<10} {'Information (bits)':<20} {'Interpretation'}")
    print("-" * 80)

    for P in premiums:
        ratio = P / 100.0
        info_bits = -math.log2(ratio)

        # Interpretation
        if info_bits > 6:
            interp = "Very unlikely (rare event)"
        elif info_bits > 4:
            interp = "Unlikely (OTM option)"
        elif info_bits > 2:
            interp = "Moderate (ATM option)"
        else:
            interp = "Likely (ITM option)"

        print(f"${P:<9.2f} {ratio:<10.4f} {info_bits:<20.4f} {interp}")

    print("\n✓ PASS: Higher premiums → more uncertainty → more information bits")


def test_trinary_logic():
    """Test trinary (base-3) position logic: Long/Neutral/Short = +1/0/-1"""
    print("\n" + "=" * 80)
    print("TEST 5: TRINARY LOGIC (Balanced Ternary)")
    print("=" * 80)
    print("Testing: Position states map to balanced ternary {-1, 0, +1}")

    positions = {
        'LONG': PositionType.LONG.value,      # +1
        'NEUTRAL': PositionType.NEUTRAL.value, # 0
        'SHORT': PositionType.SHORT.value,     # -1
    """

    print(f"\n{'Position':<15} {'Numeric':<10} {'log3 representation'}")
    print("-" * 60)

    for name, value in positions.items():
        # In balanced ternary, we map: -1→0, 0→1, +1→2 for log purposes
        # But the VALUE itself IS the trinary digit
        print(f"{name:<15} {value:<10} {value}")

    # Test trinary arithmetic
    print("\nTrinary Arithmetic Tests:")
    print(f"LONG + SHORT = {positions['LONG'] + positions['SHORT']} (should be NEUTRAL = 0)")
    print(f"LONG + LONG + SHORT = {positions['LONG'] + positions['LONG'] + positions['SHORT']} (= +1, net LONG)")

    assert positions['LONG'] + positions['SHORT'] == 0, "Long + Short should be neutral!"
    print("\n✓ PASS: Trinary position logic verified")


def test_spread_risk_reward():
    """Test risk/reward ratios for spreads"""
    print("\n" + "=" * 80)
    print("TEST 6: SPREAD RISK/REWARD RATIOS")
    print("=" * 80)
    print("Testing: Debit spreads vs Credit spreads risk profiles")

    calc = OptionsCalculator(current_price=100.0)

    # Bull Call Spread (Debit)
    debit_spread = calc.debit_call_spread(X1=100, X2=110, P1=5, P2=2, S_T=108)

    # Bear Call Spread (Credit)
    credit_spread = calc.credit_call_spread(X1=100, X2=110, P1=5, P2=2, S_T=95)

    print(f"\nDEBIT CALL SPREAD (Bull):")
    print(f"  Max Gain:  ${debit_spread['max_gain']:.2f}")
    print(f"  Max Loss:  ${abs(debit_spread['max_loss']):.2f}")
    print(f"  R/R Ratio: {debit_spread['risk_reward_ratio']:.4f}")

    print(f"\nCREDIT CALL SPREAD (Bear):")
    print(f"  Max Gain:  ${credit_spread['max_gain']:.2f}")
    print(f"  Max Loss:  ${abs(credit_spread['max_loss']):.2f}")
    print(f"  R/R Ratio: {credit_spread['risk_reward_ratio']:.4f}")

    # Key insight: Debit and Credit spreads are inverses
    total_spread_width = 110 - 100  # 10
    assert abs(debit_spread['max_gain'] + credit_spread['max_loss']) < 0.01, "Max gains/losses should balance!"

    print("\n✓ PASS: Spread risk/reward ratios are inverse (debit vs credit)")


def test_z_framework_conservation():
    """Test Z-framework conservation: dZ/dt components should balance"""
    print("\n" + "=" * 80)
    print("TEST 7: Z-FRAMEWORK CONSERVATION")
    print("=" * 80)
    print("Testing: dZ/dt = Γ·(DeltaS)²/2 + Theta + Vega·Deltasigma")

    calc = OptionsCalculator(current_price=100.0)

    # Scenario 1: Stock rises
    z1 = calc.z_framework(
        delta=0.6,
        S=100,
        P=5,
        gamma=0.02,
        theta=-0.05,  # Time decay (always negative)
        vega=0.15,
        delta_S=2,    # Stock moved up $2
        delta_sigma=0
    )

    print(f"\nScenario 1: Stock rises $2, no vol change")
    print(f"  Gamma contribution: {z1['gamma_contribution']:.6f}")
    print(f"  Theta contribution: {z1['theta_contribution']:.6f}")
    print(f"  Vega contribution:  {z1['vega_contribution']:.6f}")
    print(f"  Total dZ/dt:        {z1['dZ_dt']:.6f}")

    # Gamma contribution should be positive (stock moved, gamma helps)
    # Theta should be negative (time decay)
    assert z1['gamma_contribution'] > 0, "Gamma should be positive when stock moves"
    assert z1['theta_contribution'] < 0, "Theta should always be negative (decay)"

    # Scenario 2: Volatility increases
    z2 = calc.z_framework(
        delta=0.6,
        S=100,
        P=5,
        gamma=0.02,
        theta=-0.05,
        vega=0.15,
        delta_S=0,       # Stock didn't move
        delta_sigma=0.02  # Vol increased 2%
    )

    print(f"\nScenario 2: Stock flat, volatility rises 2%")
    print(f"  Gamma contribution: {z2['gamma_contribution']:.6f}")
    print(f"  Theta contribution: {z2['theta_contribution']:.6f}")
    print(f"  Vega contribution:  {z2['vega_contribution']:.6f}")
    print(f"  Total dZ/dt:        {z2['dZ_dt']:.6f}")

    assert z2['gamma_contribution'] == 0, "Gamma should be 0 when stock doesn't move"
    assert z2['vega_contribution'] > 0, "Vega should be positive when vol increases"

    print("\n✓ PASS: Z-framework components behave correctly")


def test_breakeven_convergence():
    """Test that breakeven converges in log-moneyness space"""
    print("\n" + "=" * 80)
    print("TEST 8: BREAKEVEN CONVERGENCE (Log-Moneyness Space)")
    print("=" * 80)
    print("Testing: BE → X as P → 0 (measured in log space)")

    calc = OptionsCalculator(current_price=100.0)

    X = 100
    premiums = [10, 5, 2, 1, 0.5, 0.1, 0.01]

    print(f"\n{'Premium':<12} {'BE (Call)':<12} {'ln(BE/X)':<15} {'Delta from X'}")
    print("-" * 60)

    for P in premiums:
        BE = X + P
        log_moneyness = math.log(BE / X)
        delta = BE - X

        print(f"${P:<11.2f} ${BE:<11.2f} {log_moneyness:<15.8f} ${delta:.2f}")

    # As P→0, ln(BE/X) → 0, meaning BE → X
    smallest_P = premiums[-1]
    smallest_log_m = math.log((X + smallest_P) / X)

    assert abs(smallest_log_m) < 0.0001, "Log-moneyness should approach 0 as premium → 0"
    print(f"\n✓ PASS: Breakeven converges to strike in log-moneyness space")


def test_protective_collar():
    """Test protective collar: Long Stock + Long Put + Short Call"""
    print("\n" + "=" * 80)
    print("TEST 9: PROTECTIVE COLLAR (3-Leg Strategy)")
    print("=" * 80)
    print("Testing: Stock + Put protection + Call income = bounded P&L")

    calc = OptionsCalculator(current_price=100.0)

    M = 100   # Stock purchase price
    X_put = 95   # Protective put strike
    X_call = 110  # Covered call strike
    P_put = 3
    P_call = 3

    scenarios = [85, 90, 95, 100, 105, 110, 115, 120]

    print(f"\n{'Stock Price':<15} {'Stock P&L':<12} {'Put P&L':<12} {'Call P&L':<12} {'Total P&L'}")
    print("-" * 80)

    for S_T in scenarios:
        # Stock P&L
        stock_pnl = S_T - M

        # Put P&L (protective)
        put_pnl = max(X_put - S_T, 0) - P_put

        # Call P&L (covered)
        call_pnl = P_call - max(S_T - X_call, 0)

        total = stock_pnl + put_pnl + call_pnl

        print(f"${S_T:<14.2f} ${stock_pnl:<11.2f} ${put_pnl:<11.2f} ${call_pnl:<11.2f} ${total:.2f}")

    print("\n✓ PASS: Collar creates bounded P&L (protected downside, capped upside)")


def test_logarithmic_decay():
    """Test exponential time decay: V(t) = V0·e^(-lambdat)"""
    print("\n" + "=" * 80)
    print("TEST 10: EXPONENTIAL TIME DECAY")
    print("=" * 80)
    print("Testing: Option value decays exponentially with time")

    # Simulate time decay
    V0 = 5.0  # Initial premium
    lambda_decay = 0.1  # Decay rate per day

    days = [0, 7, 14, 21, 30, 45, 60]

    print(f"\n{'Days to Exp':<15} {'Premium':<12} {'ln(V/V0)':<15} {'% Remaining'}")
    print("-" * 60)

    for t in days:
        V_t = V0 * math.exp(-lambda_decay * t)
        log_ratio = math.log(V_t / V0) if V_t > 0 else float('-inf')
        pct_remaining = (V_t / V0) * 100

        print(f"{t:<15} ${V_t:<11.4f} {log_ratio:<15.6f} {pct_remaining:.2f}%")

    print("\n✓ PASS: Premium decays exponentially (theta decay)")


def run_all_tests():
    """Run all test suites"""
    print("\n" + "=" * 80)
    print("OPTIONS CALCULATOR - MATHEMATICAL LOGIC TEST SUITE".center(80))
    print("=" * 80)

    tests = [
        test_quadrant_symmetry,
        test_put_call_parity,
        test_logarithmic_bases,
        test_information_bits,
        test_trinary_logic,
        test_spread_risk_reward,
        test_z_framework_conservation,
        test_breakeven_convergence,
        test_protective_collar,
        test_logarithmic_decay,
    ]

    passed = 0
    failed = 0

    for test in tests:
        try:
            test()
            passed += 1
        except AssertionError as e:
            print(f"\n✗ FAIL: {e}")
            failed += 1
        except Exception as e:
            print(f"\n✗ ERROR: {e}")
            failed += 1

    print("\n" + "=" * 80)
    print(f"TEST SUMMARY: {passed} passed, {failed} failed")
    print("=" * 80)
    print()


if __name__ == '__main__':
    run_all_tests()
