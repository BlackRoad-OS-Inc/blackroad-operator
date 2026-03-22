import pytest


MODULES = [
    "math.amundson.spiral_noether",
    "math.amundson.qutrit_ternary",
    "math.amundson.compliance_lagrangian",
    "math.amundson.consensus_clock",
    "math.amundson.thermo_ledger",
    "math.amundson.spiral_rg",
    "math.amundson.ladder_holography",
]


@pytest.mark.parametrize("modname", MODULES)
def test_optional_modules_present(modname):
    mod = pytest.importorskip(modname)
    assert mod is not None
