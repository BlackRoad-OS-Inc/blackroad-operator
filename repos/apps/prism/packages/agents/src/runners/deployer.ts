import { CloudPlan, DeploymentSpec, IngressSpec, ServiceSpec } from "../tools/cloud";
import { runCommand } from "../tools/shell";

export interface DeployOptions {
  planOnly?: boolean;
  kubeconfig?: string;
  cwd?: string;
}

export interface DeploymentPlan {
  actions: ReturnType<CloudPlan["list"]>;
  manifest: string;
}

export async function createDeploymentPlan(
  deployment: DeploymentSpec,
  service?: ServiceSpec,
  ingress?: IngressSpec
): Promise<DeploymentPlan> {
  const plan = new CloudPlan();
  plan.addDeployment(deployment);
  if (service) plan.addService(service);
  if (ingress) plan.addIngress(ingress);
  return { actions: plan.list(), manifest: plan.manifest() };
}

export async function applyPlan(plan: DeploymentPlan, options: DeployOptions = {}): Promise<void> {
  if (options.planOnly) return;
  const args = ["apply", "-f", "-"];
  if (options.kubeconfig) {
    args.unshift(`--kubeconfig=${options.kubeconfig}`);
  }
  await runCommand("kubectl", args, { cwd: options.cwd, input: plan.manifest });
}
