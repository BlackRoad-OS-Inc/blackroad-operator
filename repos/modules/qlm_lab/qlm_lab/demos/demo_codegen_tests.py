"""Demo verifying NumPy codegen with self-tests."""
from __future__ import annotations

import json

from ..tools import quantum_np as Q, tests as test_tools


def main() -> None:
    psi = Q.bell_phi_plus()
    expectation = Q.pauli_expectation(psi, "ZZ")
    exit_code = test_tools.run_pytest(["modules/qlm_lab/tests/test_quantum_np.py"])
    print(json.dumps({"expectation": expectation, "pytest_exit": exit_code}))


if __name__ == "__main__":
    main()
