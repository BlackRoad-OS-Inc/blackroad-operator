"""Core kernels for the Amundson-BlackRoad simulations."""

from .adaptive import gains_step, simulate_am5
from .autonomy import (
    compute_flux,
    conserved_mass,
    simulate_transport,
    step_transport,
    trust_field_step,
)
from .coupling import couple_curvature_response, curvature_source
from .curvature import simulate_a_field
from .resolution import AmbrContext, K_BOLTZMANN, resolve_coherence_inputs
from .spiral import (
    StabilityReport,
    am2_step,
    field_lift,
    fixed_point_stability,
    jacobian_am2,
    simulate_am2,
)
from .thermo import (
    annotate_run_with_thermo,
    energy_increment,
    irreversible_energy,
    landauer_floor,
    landauer_min,
    spiral_entropy,
)

__all__ = [
    "AmbrContext",
    "K_BOLTZMANN",
    "annotate_run_with_thermo",
    "am2_step",
    "compute_flux",
    "conserved_mass",
    "couple_curvature_response",
    "energy_increment",
    "field_lift",
    "fixed_point_stability",
    "gains_step",
    "irreversible_energy",
    "jacobian_am2",
    "landauer_floor",
    "landauer_min",
    "resolve_coherence_inputs",
    "simulate_a_field",
    "simulate_am2",
    "simulate_am5",
    "simulate_transport",
    "spiral_entropy",
    "StabilityReport",
    "step_transport",
    "trust_field_step",
    "compute_flux",
    "conserved_mass",
    "simulate_transport",
    "step_transport",
    "trust_field_step",
    "couple_curvature_response",
    "curvature_source",
    "simulate_a_field",
    "AmbrContext",
    "K_BOLTZMANN",
    "resolve_coherence_inputs",
    "StabilityReport",
    "am2_step",
    "field_lift",
    "fixed_point_stability",
    "jacobian_am2",
    "simulate_am2",
    "annotate_run_with_thermo",
    "energy_increment",
    "irreversible_energy",
    "landauer_floor",
    "landauer_min",
    "spiral_entropy",
]
