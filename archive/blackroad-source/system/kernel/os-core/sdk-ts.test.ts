import path from "path";
import { generateOrgChartSVG, getAgent, loadCatalog, RoleGuard } from "../packages/sdk-ts/src";

describe("sdk-ts", () => {
  const catalogPath = path.resolve(__dirname, "fixtures", "catalog.json");

  it("loads catalog from file", async () => {
    const catalog = await loadCatalog(catalogPath);
    expect(catalog.agents).toHaveLength(2);
  });

  it("gets agent by id", async () => {
    const catalog = await loadCatalog(catalogPath);
    const agent = getAgent("a1", catalog);
    expect(agent?.name).toBe("Alice");
  });

  it("checks role guard positive/negative", () => {
    const guard = new RoleGuard(["viewer"], path.resolve(process.cwd(), "policy", "role_matrix.yaml"));
    expect(guard.canPerform("read", "catalog")).toBe(true);
    expect(guard.canPerform("manage", "policy")).toBe(false);
  });

  it("renders org chart svg snapshot", async () => {
    const catalog = await loadCatalog(catalogPath);
    const svg = generateOrgChartSVG(catalog);
    expect(svg).toMatchSnapshot();
  });
});
