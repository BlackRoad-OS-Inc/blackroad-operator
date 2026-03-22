package prism.gates.qlm_lab

default allow = false

allow {
  input.metrics.chsh > 2.2
  input.metrics.chsh <= 2.9
  input.coverage["qlm_lab/tools/quantum_np.py"] >= 0.90
  input.artifacts.count >= 3
  not input.policy.allow_network
}
