import { loadCatalog, RoleGuard } from "@blackroad/core";

async function main() {
  const catalog = await loadCatalog("../tests/fixtures/catalog.json");
  const guard = new RoleGuard(["operator"]);
  console.log("Agents", catalog.agents.length);
  console.log("Can execute?", guard.canPerform("execute", "task"));
}

main();
