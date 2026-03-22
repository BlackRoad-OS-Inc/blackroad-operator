from pathlib import Path

from blackroad_core import Catalog, RoleGuard

catalog = Catalog.load(str(Path(__file__).parent.parent / "tests" / "fixtures" / "catalog.json"))
guard = RoleGuard(["admin"], policy_path=str(Path(__file__).parent.parent / "policy" / "role_matrix.yaml"))
print("Agents", len(catalog.agents))
print("Can manage policy?", guard.can_perform("manage", "policy"))
