import numpy as np

from amundson_blackroad.autonomy import step_transport, conserved_mass
from amundson_blackroad.thermo import spiral_entropy, energy_increment, landauer_min


def test_br1_mass_conservation():
    x = np.linspace(-5.0, 5.0, 1024)
    dx = x[1] - x[0]
    dt = 1e-3
    A = np.exp(-x**2)
    rho = -(np.exp(-(x - 1.5) ** 2) + np.exp(-(x + 1.5) ** 2))
    initial_mass = conserved_mass(x, A)
    for _ in range(1000):
        A, _ = step_transport(A, rho, dx, dt, mu_A=1.0)
    final_mass = conserved_mass(x, A)
    assert abs(final_mass - initial_mass) / initial_mass < 1e-3


def test_am4_units_and_floor():
    T = 300.0
    a = 0.2
    theta = 1.4
    da = 0.01
    dtheta = 0.02
    Omega = 1e-21
    Sa = spiral_entropy(a, theta)
    assert Sa > 0.0
    dE = energy_increment(T, da, dtheta, a, theta, Omega)
    Emin = landauer_min(T, n_bits=1.0)
    assert isinstance(dE, float) and isinstance(Emin, float)
    assert Emin > 0.0
