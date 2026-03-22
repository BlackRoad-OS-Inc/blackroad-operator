import type { Route } from "next";

type ExternalRoute = `https://${string}` | `http://${string}`;

type NavigationItem = {
  label: string;
  href: Route<string> | ExternalRoute;
  external?: boolean;
};

type HeroAction = {
  label: string;
  href: Route<string> | ExternalRoute;
  external?: boolean;
};

type HeroMetric = {
  label: string;
  value: string;
  description: string;
};

type HeroConfig = {
  eyebrow: string;
  title: string;
  description: string;
  primary: HeroAction;
  secondary: HeroAction;
  metrics: readonly HeroMetric[];
};

type Feature = {
  title: string;
  description: string;
};

type PipelineStatus = "ready" | "deploying" | "queued";

type PipelineTarget = {
  title: string;
  description: string;
  status: PipelineStatus;
  url?: ExternalRoute;
};

type ChecklistStatus = "complete" | "in-progress" | "pending";

type ChecklistItem = {
  label: string;
  description: string;
  status: ChecklistStatus;
};

export const navigation = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Docs", href: "/docs" },
  { label: "Status", href: "/status" },
  { label: "Deploy", href: "https://vercel.com/new/clone?repository-url=https://github.com/blackroad/blackroad-prism-console", external: true },
] as const satisfies readonly NavigationItem[];

export const vercelProject = {
  name: "Lucidia Landing",
  deployUrl: "https://vercel.com/new/clone?repository-url=https://github.com/blackroad/blackroad-prism-console",
  projectUrl: "https://vercel.com/blackroad/lucidia",
  docsUrl: "https://vercel.com/docs" as const,
};

export const siteConfig = {
  name: "Lucidia",
  domain: "lucidia.vercel.app",
  navigation,
};

export const hero = {
  eyebrow: "Lucidia platform",
  title: "Launch regenerative intelligence on Vercel in minutes",
  description:
    "Lucidia’s campus engine now ships with an opinionated Next.js landing page. Deploy it to Vercel, connect to the Prism Console backend, and invite collaborators into a living intelligence garden.",
  primary: { label: "Deploy to Vercel", href: vercelProject.deployUrl, external: true },
  secondary: { label: "View Vercel project", href: vercelProject.projectUrl, external: true },
  metrics: [
    {
      label: "SSR build",
      value: "45s",
      description: "Measured from git push to Vercel preview completion.",
    },
    {
      label: "Edge ready",
      value: "100%",
      description: "Static assets and data routes are deployable to the Vercel Edge network.",
    },
    {
      label: "Console link",
      value: "<60s",
      description: "Time to connect Prism Console health telemetry after provisioning.",
    },
  ],
} as const satisfies HeroConfig;

export const features = [
  {
    title: "Deploy-first storytelling",
    description: "Hero, pipeline, and telemetry sections are composed to communicate the Lucidia vision alongside actionable deployment steps.",
  },
  {
    title: "Operational instrumentation",
    description: "Server-rendered pipeline cards and a live hydration pulse confirm SSR and CSR paths are flowing correctly.",
  },
  {
    title: "Console alignment",
    description: "Copy, CTAs, and navigation mirror the Prism Console so teams can move from marketing to monitoring without context switching.",
  },
] as const satisfies readonly Feature[];

export const pipelineTargets = [
  {
    title: "Preview (SSR)",
    description: "Next.js server-rendered build promoted to the Lucidia preview domain with observability hooks pre-wired.",
    status: "ready",
    url: "https://lucidia.vercel.app",
  },
  {
    title: "Edge runtime",
    description: "Streaming responses prepared for Vercel’s edge network so Lucidia updates stay within 50ms of visitors.",
    status: "deploying",
    url: "https://vercel.com/blackroad/lucidia/deployments",
  },
  {
    title: "Production",
    description: "Final approval gate connected to Prism Console change requests for human-in-the-loop promotion.",
    status: "queued",
  },
] as const satisfies readonly PipelineTarget[];

export const launchChecklist = [
  {
    label: "Vercel link established",
    description: "Project connected and deploy button targets the official Lucidia repository.",
    status: "complete",
  },
  {
    label: "Prism Console telemetry",
    description: "API health dashboard receives heartbeat data from the backend aggregator.",
    status: "in-progress",
  },
  {
    label: "Lucidia campus narrative",
    description: "Landing page content reflects the current Lucidia residency and guild programming.",
    status: "complete",
  },
  {
    label: "Stakeholder review",
    description: "Product, operations, and infrastructure leads have approved the Vercel integration path.",
    status: "pending",
  },
] as const satisfies readonly ChecklistItem[];
