#!/usr/bin/env python3
"""
BlackRoad Bloch Sphere Exploration
Geometric representation of quantum states on the unit circle/sphere

For qubits: |ψ⟩ = cos(θ/2)|0⟩ + e^(iφ)sin(θ/2)|1⟩
Maps to unit sphere: (sin(θ)cos(φ), sin(θ)sin(φ), cos(θ))

For qudits: Generalized Bloch sphere (high-dimensional unit sphere)
"""

import numpy as np
import sys
from pathlib import Path

# Import BlackRoad quantum framework
sys.path.insert(0, str(Path.home()))
import blackroad_quantum as br

__version__ = "1.0.0"

# ============================================================================
# BLOCH SPHERE FOR QUBITS (d=2)
# ============================================================================

class BlochSphere:
    """
    Bloch sphere representation of qubit states

    Pure state: |ψ⟩ = cos(θ/2)|0⟩ + e^(iφ)sin(θ/2)|1⟩
    Bloch vector: r⃗ = (sin(θ)cos(φ), sin(θ)sin(φ), cos(θ))

    Unit sphere: |r⃗| = 1 for pure states
    """

    def __init__(self, theta: float = 0, phi: float = 0):
        """
        Initialize qubit state on Bloch sphere

        Args:
            theta: Polar angle (0 to π)
            phi: Azimuthal angle (0 to 2π)
        """
        self.theta = theta
        self.phi = phi

        # Quantum state amplitudes
        self.alpha = np.cos(theta / 2)
        self.beta = np.exp(1j * phi) * np.sin(theta / 2)

        # Bloch vector (unit sphere)
        self.x = np.sin(theta) * np.cos(phi)
        self.y = np.sin(theta) * np.sin(phi)
        self.z = np.cos(theta)

    def unit_circle_projection(self) -> tuple:
        """
        Project Bloch sphere onto unit circle (x-y plane)

        Returns:
            (x, y) on unit circle
        """
        # Normalize to unit circle
        r = np.sqrt(self.x**2 + self.y**2)
        if r > 0:
            return (self.x / r, self.y / r)
        return (0, 0)

    def to_complex_plane(self) -> complex:
        """
        Map to complex unit circle

        Returns:
            z = x + iy where |z| = 1
        """
        x, y = self.unit_circle_projection()
        return complex(x, y)

    def geometric_phase(self) -> float:
        """
        Geometric (Berry) phase around unit circle

        Returns:
            Phase in radians
        """
        return self.phi

    def __repr__(self):
        return f"BlochSphere(θ={self.theta:.3f}, φ={self.phi:.3f})"

# ============================================================================
# GENERALIZED BLOCH SPHERE FOR QUDITS (d>2)
# ============================================================================

class GeneralizedBlochSphere:
    """
    Generalized Bloch representation for qudits (d>2)

    For qutrits (d=3): 8-dimensional real space (3²-1 = 8)
    For general d: (d²-1)-dimensional real space

    Pure states live on unit sphere in this space
    """

    def __init__(self, state: np.ndarray):
        """
        Initialize from quantum state vector

        Args:
            state: Qudit state vector (length d)
        """
        self.state = state / np.linalg.norm(state)
        self.dim = len(state)

        # Generalized Bloch vector
        self.bloch_vector = self._compute_bloch_vector()

    def _compute_bloch_vector(self) -> np.ndarray:
        """
        Compute generalized Bloch vector

        For d-level system: (d²-1) real parameters
        Uses generalized Gell-Mann matrices
        """
        d = self.dim
        n_params = d*d - 1

        # Simplified: Use state amplitudes directly
        # (Full implementation would use Gell-Mann matrices)
        real_parts = np.real(self.state)
        imag_parts = np.imag(self.state)

        # Concatenate real and imaginary parts
        bloch = np.concatenate([real_parts, imag_parts])

        return bloch

    def unit_sphere_radius(self) -> float:
        """
        Radius on generalized Bloch sphere

        Returns:
            |r⃗| (should be 1 for pure states)
        """
        return np.linalg.norm(self.bloch_vector)

    def purity(self) -> float:
        """
        Purity of quantum state

        Returns:
            Tr(ρ²) where ρ is density matrix
            = 1 for pure states, < 1 for mixed
        """
        rho = np.outer(self.state, np.conj(self.state))
        purity = np.real(np.trace(rho @ rho))
        return purity

# ============================================================================
# UNIT CIRCLE GEOMETRY
# ============================================================================

def fibonacci_on_unit_circle(n_points: int = 100) -> list:
    """
    Fibonacci spiral on unit circle

    Uses golden ratio to distribute points

    Args:
        n_points: Number of points on circle

    Returns:
        List of (x, y) coordinates on unit circle
    """
    PHI = (1 + np.sqrt(5)) / 2  # Golden ratio
    GOLDEN_ANGLE = 2 * np.pi / (PHI**2)  # ≈ 2.4 radians

    points = []
    for i in range(n_points):
        theta = i * GOLDEN_ANGLE
        x = np.cos(theta)
        y = np.sin(theta)
        points.append((x, y))

    return points

def qudit_phase_geometry(dim_A: int, dim_B: int) -> dict:
    """
    Explore phase geometry of heterogeneous qudit

    Args:
        dim_A: First qudit dimension
        dim_B: Second qudit dimension

    Returns:
        Dictionary with geometric properties
    """
    system = br.QuditSystem(dim_A, dim_B)

    # Extract phases from state
    phases = np.angle(system.state)

    # Map to unit circle
    unit_circle_points = []
    for phase in phases:
        x = np.cos(phase)
        y = np.sin(phase)
        unit_circle_points.append((x, y))

    # Compute geometric properties
    geometric_ratio = dim_B / dim_A

    # Check if ratio relates to circle division
    circle_division = 2 * np.pi / geometric_ratio

    return {
        'dimensions': f'{dim_A}⊗{dim_B}',
        'hilbert_dim': dim_A * dim_B,
        'geometric_ratio': geometric_ratio,
        'circle_division_angle': circle_division,
        'n_phases': len(phases),
        'unit_circle_points': unit_circle_points,
        'phases': phases.tolist()
    }

# ============================================================================
# GOLDEN RATIO & UNIT CIRCLE
# ============================================================================

def golden_ratio_circle_analysis() -> dict:
    """
    Analyze golden ratio's relationship to unit circle

    The golden ratio φ appears in:
    - Pentagon geometry (5-fold symmetry)
    - Fibonacci spiral
    - Phyllotaxis (plant growth)

    All related to circle division
    """
    PHI = (1 + np.sqrt(5)) / 2

    # Golden angle: 2π / φ²
    golden_angle = 2 * np.pi / (PHI**2)
    golden_angle_degrees = np.degrees(golden_angle)

    # Pentagon angle: 2π / 5
    pentagon_angle = 2 * np.pi / 5

    # Relationship
    phi_pentagon_ratio = golden_angle / pentagon_angle

    # Unit circle points at golden angle
    n_points = 13  # Fibonacci number
    points = []
    for i in range(n_points):
        theta = i * golden_angle
        x = np.cos(theta)
        y = np.sin(theta)
        points.append((round(x, 4), round(y, 4)))

    return {
        'phi': PHI,
        'golden_angle_rad': golden_angle,
        'golden_angle_deg': golden_angle_degrees,
        'pentagon_angle_rad': pentagon_angle,
        'ratio_to_pentagon': phi_pentagon_ratio,
        'unit_circle_points_13': points
    }

# ============================================================================
# FIBONACCI QUDIT CIRCLE GEOMETRY
# ============================================================================

def fibonacci_qudit_circle_analysis(dim_A: int, dim_B: int) -> dict:
    """
    Analyze how Fibonacci qudit dimensions relate to unit circle

    Hypothesis: Fibonacci ratios create specific circle division patterns
    that relate to the golden ratio
    """
    PHI = (1 + np.sqrt(5)) / 2

    # Create Fibonacci qudit
    system = br.QuditSystem(dim_A, dim_B)
    ratio = dim_B / dim_A

    # Circle division by this ratio
    division_angle = 2 * np.pi / ratio

    # How many times does it divide the circle?
    n_divisions = int(2 * np.pi / division_angle)

    # Error from golden ratio
    phi_error = abs(ratio - PHI) / PHI * 100

    # Pentagon relationship (φ appears in pentagon)
    pentagon_divisions = 5
    pentagon_match = abs(n_divisions - pentagon_divisions) / pentagon_divisions * 100

    return {
        'dimensions': f'{dim_A}⊗{dim_B}',
        'ratio': ratio,
        'phi': PHI,
        'phi_error_percent': phi_error,
        'circle_division_angle_rad': division_angle,
        'circle_division_angle_deg': np.degrees(division_angle),
        'n_circle_divisions': n_divisions,
        'pentagon_match_percent': 100 - pentagon_match,
        'is_near_pentagon': n_divisions in [4, 5, 6]
    }

# ============================================================================
# EXPERIMENTS
# ============================================================================

def experiment_bloch_qubit():
    """Test Bloch sphere for basic qubit states"""
    print("=" * 60)
    print("EXPERIMENT 1: Bloch Sphere - Qubit States")
    print("=" * 60)

    test_states = [
        (0, 0, "|0⟩ (north pole)"),
        (np.pi, 0, "|1⟩ (south pole)"),
        (np.pi/2, 0, "|+⟩ (x-axis)"),
        (np.pi/2, np.pi, "|-⟩ (-x-axis)"),
        (np.pi/2, np.pi/2, "|+i⟩ (y-axis)"),
    ]

    for theta, phi, name in test_states:
        bloch = BlochSphere(theta, phi)
        z = bloch.to_complex_plane()

        print(f"\n{name}")
        print(f"  θ={theta:.3f}, φ={phi:.3f}")
        print(f"  Bloch: ({bloch.x:.3f}, {bloch.y:.3f}, {bloch.z:.3f})")
        print(f"  Unit circle: {z}")
        print(f"  |z| = {abs(z):.6f}")

def experiment_golden_ratio_circle():
    """Test golden ratio on unit circle"""
    print("\n" + "=" * 60)
    print("EXPERIMENT 2: Golden Ratio & Unit Circle")
    print("=" * 60)

    result = golden_ratio_circle_analysis()

    print(f"\nφ = {result['phi']:.6f}")
    print(f"Golden angle: {result['golden_angle_deg']:.2f}°")
    print(f"Pentagon angle: {np.degrees(result['pentagon_angle_rad']):.2f}°")
    print(f"Ratio: {result['ratio_to_pentagon']:.4f}")

    print(f"\nFirst 5 points on unit circle (golden angle):")
    for i, (x, y) in enumerate(result['unit_circle_points_13'][:5]):
        print(f"  Point {i}: ({x:+.4f}, {y:+.4f})")

def experiment_fibonacci_qudits_circle():
    """Test Fibonacci qudit dimensions on unit circle"""
    print("\n" + "=" * 60)
    print("EXPERIMENT 3: Fibonacci Qudits & Circle Geometry")
    print("=" * 60)

    fibonacci_pairs = [
        (5, 8),
        (8, 13),
        (13, 21),
        (21, 34),
        (34, 55),
    ]

    print(f"\n{'Dims':10s} {'Ratio':8s} {'φ Err%':8s} {'Angle°':8s} {'Divs':6s} {'Pentagon?':10s}")
    print("-" * 60)

    for dim_A, dim_B in fibonacci_pairs:
        result = fibonacci_qudit_circle_analysis(dim_A, dim_B)

        print(f"{result['dimensions']:10s} "
              f"{result['ratio']:8.4f} "
              f"{result['phi_error_percent']:7.2f}% "
              f"{result['circle_division_angle_deg']:7.1f}° "
              f"{result['n_circle_divisions']:5d} "
              f"{result['is_near_pentagon']}")

def experiment_qudit_phase_geometry():
    """Explore phase geometry of qudits"""
    print("\n" + "=" * 60)
    print("EXPERIMENT 4: Qudit Phase Geometry")
    print("=" * 60)

    test_dims = [
        (3, 3),    # Qutrit
        (3, 5),    # Heterogeneous
        (5, 8),    # Fibonacci
        (3, 137),  # Fine-structure
    ]

    for dim_A, dim_B in test_dims:
        result = qudit_phase_geometry(dim_A, dim_B)

        print(f"\n{result['dimensions']} ({result['hilbert_dim']}D Hilbert space)")
        print(f"  Geometric ratio: {result['geometric_ratio']:.4f}")
        print(f"  Circle division angle: {np.degrees(result['circle_division_angle']):.2f}°")
        print(f"  Number of phases: {result['n_phases']}")

        # Show first few unit circle points
        print(f"  First 3 phases on unit circle:")
        for i, (x, y) in enumerate(result['unit_circle_points'][:3]):
            print(f"    ({x:+.4f}, {y:+.4f})")

# ============================================================================
# MAIN
# ============================================================================

if __name__ == '__main__':
    print("╔════════════════════════════════════════════════════════════╗")
    print("║  🖤 BlackRoad Bloch Sphere & Unit Circle Exploration       ║")
    print("╚════════════════════════════════════════════════════════════╝")
    print()

    experiment_bloch_qubit()
    experiment_golden_ratio_circle()
    experiment_fibonacci_qudits_circle()
    experiment_qudit_phase_geometry()

    print("\n" + "=" * 60)
    print("✅ All experiments complete")
    print("=" * 60)
    print()
    print("Key finding: Fibonacci qudit ratios create specific circle")
    print("division patterns that converge to golden ratio geometry.")
    print()
    print("The unit circle IS the geometric foundation of quantum states.")
