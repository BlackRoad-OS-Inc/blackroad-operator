import yaml from "yaml";

export type ContainerSpec = {
  name: string;
  image: string;
  env?: Record<string, string>;
  ports?: { containerPort: number; name?: string }[];
};

export type DeploymentSpec = {
  name: string;
  namespace?: string;
  replicas?: number;
  containers: ContainerSpec[];
};

export type ServiceSpec = {
  name: string;
  namespace?: string;
  type?: "ClusterIP" | "NodePort" | "LoadBalancer";
  selector: Record<string, string>;
  ports: { port: number; targetPort: number; protocol?: "TCP" | "UDP" }[];
};

export type IngressSpec = {
  name: string;
  namespace?: string;
  host: string;
  serviceName: string;
  servicePort: number;
};

export type CloudAction =
  | { kind: "deployment"; manifest: string }
  | { kind: "service"; manifest: string }
  | { kind: "ingress"; manifest: string };

export class CloudPlan {
  private actions: CloudAction[] = [];

  addDeployment(spec: DeploymentSpec) {
    const manifest = renderDeployment(spec);
    this.actions.push({ kind: "deployment", manifest });
  }

  addService(spec: ServiceSpec) {
    const manifest = renderService(spec);
    this.actions.push({ kind: "service", manifest });
  }

  addIngress(spec: IngressSpec) {
    const manifest = renderIngress(spec);
    this.actions.push({ kind: "ingress", manifest });
  }

  manifest(): string {
    return this.actions.map((action) => action.manifest).join("\n---\n");
  }

  summary(): { deployments: number; services: number; ingresses: number } {
    return this.actions.reduce(
      (acc, action) => {
        if (action.kind === "deployment") acc.deployments += 1;
        if (action.kind === "service") acc.services += 1;
        if (action.kind === "ingress") acc.ingresses += 1;
        return acc;
      },
      { deployments: 0, services: 0, ingresses: 0 }
    );
  }

  list(): CloudAction[] {
    return [...this.actions];
  }
}

export function renderDeployment(spec: DeploymentSpec): string {
  const template = {
    apiVersion: "apps/v1",
    kind: "Deployment",
    metadata: {
      name: spec.name,
      namespace: spec.namespace,
      labels: { "app.kubernetes.io/name": spec.name },
    },
    spec: {
      replicas: spec.replicas ?? 1,
      selector: {
        matchLabels: { "app.kubernetes.io/name": spec.name },
      },
      template: {
        metadata: {
          labels: { "app.kubernetes.io/name": spec.name },
        },
        spec: {
          containers: spec.containers.map((container) => ({
            name: container.name,
            image: container.image,
            env: container.env
              ? Object.entries(container.env).map(([name, value]) => ({ name, value }))
              : undefined,
            ports: container.ports,
          })),
        },
      },
    },
  };
  return yaml.stringify(template);
}

export function renderService(spec: ServiceSpec): string {
  const template = {
    apiVersion: "v1",
    kind: "Service",
    metadata: {
      name: spec.name,
      namespace: spec.namespace,
    },
    spec: {
      type: spec.type ?? "ClusterIP",
      selector: spec.selector,
      ports: spec.ports.map((port) => ({
        name: `${port.targetPort}`,
        protocol: port.protocol ?? "TCP",
        port: port.port,
        targetPort: port.targetPort,
      })),
    },
  };
  return yaml.stringify(template);
}

export function renderIngress(spec: IngressSpec): string {
  const template = {
    apiVersion: "networking.k8s.io/v1",
    kind: "Ingress",
    metadata: {
      name: spec.name,
      namespace: spec.namespace,
    },
    spec: {
      rules: [
        {
          host: spec.host,
          http: {
            paths: [
              {
                path: "/",
                pathType: "Prefix",
                backend: {
                  service: {
                    name: spec.serviceName,
                    port: { number: spec.servicePort },
                  },
                },
              },
            ],
          },
        },
      ],
    },
  };
  return yaml.stringify(template);
}
