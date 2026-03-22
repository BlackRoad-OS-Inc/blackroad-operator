from pathlib import Path
import sys

import torch

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from quantum_lab.core.open_system import (  # noqa: E402
    AmundsonIntegrator,
    apply_channel_mix,
    dagger,
    kraus_channel,
    project_psd_trace1,
)


def _two_level_setup():
    dtype = torch.cdouble
    sz = torch.tensor([[1.0, 0.0], [0.0, -1.0]], dtype=dtype)
    hamiltonian = 0.5 * sz

    sqrt = torch.sqrt
    lindblad_ops = [
        sqrt(torch.tensor(0.02, dtype=torch.double)).item()
        * torch.tensor([[1.0, 0.0], [0.0, -1.0]], dtype=dtype),
        sqrt(torch.tensor(0.04, dtype=torch.double)).item()
        * torch.tensor([[0.0, 1.0], [0.0, 0.0]], dtype=dtype),
    ]

    gamma = 0.05
    sqrt_1_minus_gamma = torch.sqrt(torch.tensor(1 - gamma, dtype=torch.double)).item()
    sqrt_gamma = torch.sqrt(torch.tensor(gamma, dtype=torch.double)).item()
    kraus_amp = (
        torch.tensor([[1.0, 0.0], [0.0, sqrt_1_minus_gamma]], dtype=dtype),
        torch.tensor([[0.0, sqrt_gamma], [0.0, 0.0]], dtype=dtype),
    )

    p_dephase = 0.03
    sqrt_keep = torch.sqrt(torch.tensor(1 - p_dephase, dtype=torch.double)).item()
    sqrt_flip = torch.sqrt(torch.tensor(p_dephase, dtype=torch.double)).item()
    kraus_dephase = (
        sqrt_keep * torch.eye(2, dtype=dtype),
        sqrt_flip * torch.tensor([[1.0, 0.0], [0.0, -1.0]], dtype=dtype),
    )

    channels = [kraus_channel(kraus_dephase), kraus_channel(kraus_amp)]
    return hamiltonian, lindblad_ops, channels


def test_project_psd_trace1_returns_valid_density():
    dtype = torch.cdouble
    rho = torch.tensor([[1.2, 0.3 - 0.1j], [0.3 + 0.1j, -0.1]], dtype=dtype)
    projected = project_psd_trace1(rho)
    assert torch.allclose(projected, dagger(projected), atol=1e-8)
    trace = torch.trace(projected).real.item()
    assert abs(trace - 1.0) < 1e-10
    eigvals = torch.linalg.eigvalsh(projected)
    assert torch.all(eigvals >= -1e-10)


def test_amundson_integrator_step_preserves_density_properties():
    hamiltonian, lindblad_ops, channels = _two_level_setup()
    rho0 = torch.tensor([[1.0, 0.0], [0.0, 0.0]], dtype=torch.cdouble)
    integrator = AmundsonIntegrator(hamiltonian, lindblad_ops, channels, dt=0.005, tau=0.01, lam=0.2)
    weights = torch.tensor([0.6, 0.4], dtype=torch.double)
    rho1 = integrator(rho0, weights)
    assert torch.allclose(rho1, dagger(rho1), atol=1e-8)
    trace = torch.trace(rho1).real.item()
    assert abs(trace - 1.0) < 1e-10
    eigvals = torch.linalg.eigvalsh(rho1)
    assert torch.all(eigvals >= -1e-10)


def test_amundson_integrator_is_autograd_friendly():
    hamiltonian, lindblad_ops, channels = _two_level_setup()
    rho0 = torch.tensor([[1.0, 0.0], [0.0, 0.0]], dtype=torch.cdouble)
    integrator = AmundsonIntegrator(hamiltonian, lindblad_ops, channels, dt=0.002, tau=0.01, lam=0.15)
    weights_logits = torch.tensor([0.3, -0.1], dtype=torch.double, requires_grad=True)
    weights = torch.softmax(weights_logits, dim=0)
    rho1 = integrator(rho0, weights)
    loss = rho1.abs().sum()
    loss.backward()
    assert weights_logits.grad is not None
    assert torch.all(torch.isfinite(weights_logits.grad))


def test_apply_channel_mix_normalizes_weights():
    _, _, channels = _two_level_setup()
    rho0 = torch.tensor([[0.7, 0.1], [0.1, 0.3]], dtype=torch.cdouble)
    weights = torch.tensor([0.3, 0.3], dtype=torch.double)
    mixed = apply_channel_mix(rho0, channels, weights)
    manual_weights = torch.tensor([0.5, 0.5], dtype=torch.double)
    mixed_manual = apply_channel_mix(rho0, channels, manual_weights)
    assert torch.allclose(mixed, mixed_manual, atol=1e-8)
