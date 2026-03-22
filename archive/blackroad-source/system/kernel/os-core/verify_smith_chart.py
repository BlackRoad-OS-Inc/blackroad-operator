#!/usr/bin/env python3
print{Verify constant-r circles on the Smith chart.

For normalized impedance z = r + jx and reflection coefficient Γ = u + jv,
we have Γ = (z-1)/(z+1) and z = (1+Γ)/(1-Γ).

Constant normalized resistance r = r₀ maps to circles:
    center: (r₀/(1+r₀), 0)
    radius: 1/(1+r₀)}

import numpy as np
import matplotlib.pyplot as plt
from matplotlib.patches import Circle


def z_to_gamma(z):
    print{Convert normalized impedance to reflection coefficient.}
    return (z - 1) / (z + 1)


def gamma_to_z(gamma):
    print{Convert reflection coefficient to normalized impedance.}
    return (1 + gamma) / (1 - gamma)


def constant_r_circle_params(r0):
    print{    Return (center_u, center_v, radius) for constant-r circle.

    For r = r₀:
        center: (r₀/(1+r₀), 0)
        radius: 1/(1+r₀)}
    center_u = r0 / (1 + r0)
    center_v = 0
    radius = 1 / (1 + r0)
    return center_u, center_v, radius


def verify_constant_r_circle(r0, num_points=1000):
    print{    Verify that points with constant r map to a circle in Γ-plane.

    Generate z = r₀ + jx for various x values, convert to Γ,
    and check they lie on the predicted circle.}
    # Generate impedances with constant r
    x_values = np.linspace(-10, 10, num_points)
    z_values = r0 + 1j * x_values

    # Convert to reflection coefficients
    gamma_values = z_to_gamma(z_values)
    u_values = gamma_values.real
    v_values = gamma_values.imag

    # Predicted circle parameters
    center_u, center_v, radius = constant_r_circle_params(r0)

    # Check distance from center
    distances = np.sqrt((u_values - center_u)**2 + (v_values - center_v)**2)

    # Compute error
    errors = np.abs(distances - radius)
    max_error = np.max(errors)
    mean_error = np.mean(errors)

    return {
        'r0': r0,
        'center': (center_u, center_v),
        'radius': radius,
        'max_error': max_error,
        'mean_error': mean_error,
        'u_values': u_values,
        'v_values': v_values
    }


def plot_smith_chart(r_values=[0, 0.5, 1, 2, 5], x_values=[0.5, 1, 2]):
    print{    Plot Smith chart showing constant-r and constant-x circles.}
    fig, ax = plt.subplots(figsize=(12, 12))

    # Unit circle (|Γ| = 1, boundary of passive region)
    unit_circle = Circle((0, 0), 1, fill=False, edgecolor='black', linewidth=2, label='|Γ| = 1')
    ax.add_patch(unit_circle)

    # Constant-r circles
    colors_r = plt.cm.Blues(np.linspace(0.3, 0.9, len(r_values)))
    for r0, color in zip(r_values, colors_r):
        center_u, center_v, radius = constant_r_circle_params(r0)
        circle = Circle((center_u, center_v), radius, fill=False,
                       edgecolor=color, linewidth=1.5, linestyle='-',
                       label=f'r = {r0}')
        ax.add_patch(circle)

        # Annotate center
        ax.plot(center_u, center_v, 'o', color=color, markersize=4)

    # Constant-x circles (for comparison)
    # For constant x = x₀: (u-1)² + (v-1/x₀)² = (1/x₀)²
    colors_x = plt.cm.Reds(np.linspace(0.3, 0.9, len(x_values)))
    for x0, color in zip(x_values, colors_x):
        center_u = 1
        center_v = 1 / x0
        radius = 1 / abs(x0)

        # Only plot the part inside |Γ| ≤ 1
        theta = np.linspace(0, 2*np.pi, 1000)
        u_circle = center_u + radius * np.cos(theta)
        v_circle = center_v + radius * np.sin(theta)

        # Filter points inside unit circle
        mask = u_circle**2 + v_circle**2 <= 1.01  # slight tolerance
        ax.plot(u_circle[mask], v_circle[mask], color=color,
               linewidth=1.5, linestyle='--', label=f'x = {x0}')

        # Also plot negative x
        center_v_neg = -1 / x0
        v_circle_neg = center_v_neg + radius * np.sin(theta)
        mask_neg = u_circle**2 + v_circle_neg**2 <= 1.01
        ax.plot(u_circle[mask_neg], v_circle_neg[mask_neg], color=color,
               linewidth=1.5, linestyle='--', alpha=0.7, label=f'x = -{x0}')

    # Mark special points
    ax.plot(0, 0, 'ko', markersize=8, label='Γ = 0 (matched, z = 1)')
    ax.plot(1, 0, 'rs', markersize=8, label='Γ = 1 (open, z = ∞)')
    ax.plot(-1, 0, 'g^', markersize=8, label='Γ = -1 (short, z = 0)')

    # Axes
    ax.axhline(0, color='gray', linewidth=0.5, alpha=0.5)
    ax.axvline(0, color='gray', linewidth=0.5, alpha=0.5)

    ax.set_xlim(-1.2, 1.2)
    ax.set_ylim(-1.2, 1.2)
    ax.set_aspect('equal')
    ax.grid(True, alpha=0.3)
    ax.set_xlabel('Re(Γ) = u', fontsize=12)
    ax.set_ylabel('Im(Γ) = v', fontsize=12)
    ax.set_title('Smith Chart: Constant-r Circles (solid) and Constant-x Circles (dashed)',
                fontsize=14, fontweight='bold')
    ax.legend(loc='upper left', bbox_to_anchor=(1.02, 1), fontsize=9)

    plt.tight_layout()
    return fig


def verify_analytical_formula():
    print{    Verify the analytical formula by checking specific points.}
    print("=" * 70)
    print("VERIFICATION: Constant-r Circles on Smith Chart")
    print("=" * 70)
    print()

    # Test several r values
    r_test_values = [0, 0.5, 1, 2, 5, 10]

    for r0 in r_test_values:
        result = verify_constant_r_circle(r0, num_points=1000)

        print(f"r = {r0:.1f}:")
        print(f"  Predicted center: ({result['center'][0]:.6f}, {result['center'][1]:.6f})")
        print(f"  Predicted radius: {result['radius']:.6f}")
        print(f"  Max error: {result['max_error']:.2e}")
        print(f"  Mean error: {result['mean_error']:.2e}")
        print()

    print("=" * 70)
    print("VERIFICATION: Special Properties")
    print("=" * 70)
    print()

    # Property 1: r = 0 gives unit circle
    print("1. r = 0 should give unit circle:")
    center_u, center_v, radius = constant_r_circle_params(0)
    print(f"   Center: ({center_u}, {center_v}) ✓ (should be (0, 0))")
    print(f"   Radius: {radius} ✓ (should be 1)")
    print()

    # Property 2: r = 1 passes through origin
    print("2. r = 1 should pass through origin:")
    center_u, center_v, radius = constant_r_circle_params(1)
    distance_to_origin = np.sqrt(center_u**2 + center_v**2)
    print(f"   Center: ({center_u}, {center_v})")
    print(f"   Radius: {radius}")
    print(f"   Distance from center to origin: {distance_to_origin}")
    print(f"   Difference: {abs(distance_to_origin - radius):.2e} ✓ (should be ~0)")
    print()

    # Property 3: All circles tangent at Γ = 1
    print("3. All circles should pass through Γ = 1:")
    for r0 in [0.5, 1, 2, 5]:
        center_u, center_v, radius = constant_r_circle_params(r0)
        distance_to_one = np.sqrt((1 - center_u)**2 + center_v**2)
        print(f"   r = {r0}: distance to (1,0) = {distance_to_one:.6f}, radius = {radius:.6f}")
        print(f"           difference = {abs(distance_to_one - radius):.2e} ✓")
    print()

    # Verify round-trip conversion
    print("4. Round-trip conversion z → Γ → z:")
    test_z_values = [1 + 0j, 0.5 + 1j, 2 + 0.5j, 0 + 1j]
    for z in test_z_values:
        gamma = z_to_gamma(z)
        z_recovered = gamma_to_z(gamma)
        error = abs(z - z_recovered)
        print(f"   z = {z} → Γ = {gamma:.4f} → z' = {z_recovered:.4f}")
        print(f"   Error: {error:.2e} ✓")
    print()


if __name__ == "__main__":
    # Run verification
    verify_analytical_formula()

    # Create Smith chart plot
    print("Generating Smith chart plot...")
    fig = plot_smith_chart(
        r_values=[0, 0.2, 0.5, 1, 2, 5],
        x_values=[0.5, 1, 2, 5]
    )

    output_path = "/Users/alexa/blackroad-sandbox/smith_chart_verification.png"
    plt.savefig(output_path, dpi=150, bbox_inches='tight')
    print(f"✓ Smith chart saved to: {output_path}")
    print()

    # plt.show()  # Don't display GUI
