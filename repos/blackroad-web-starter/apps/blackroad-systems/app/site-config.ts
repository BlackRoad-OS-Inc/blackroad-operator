import type { Route } from "next";

    type NavigationItem = {
      label: string;
      href: Route<string>;
    };

    type HeroAction = {
      label: string;
      href: Route<string>;
    };

    type HeroConfig = {
      eyebrow: string;
      title: string;
      description: string;
      primary: HeroAction;
      secondary: HeroAction;
    };

    export const navigation = [
  {
    "label": "Home",
    "href": "/"
  },
  {
    "label": "About",
    "href": "/about"
  },
  {
    "label": "Contact",
    "href": "/contact"
  },
  {
    "label": "Docs",
    "href": "/docs"
  },
  {
    "label": "Privacy",
    "href": "/privacy"
  },
  {
    "label": "Terms",
    "href": "/terms"
  },
  {
    "label": "Status",
    "href": "/status"
  }
] as const satisfies NavigationItem[];

    export const siteConfig = {
      name: "BlackRoad Systems",
      domain: "blackroad.systems",
      navigation,
    };

    export const hero = {
      eyebrow: "Zero-trust orchestration",
      title: "Infrastructure OS for autonomous estates",
      description: "Provision, harden, and monitor the platforms that power high-assurance agent teams with policy-as-code at every layer.",
      primary: {"label": "Schedule a readiness review", "href": "/contact"},
      secondary: {"label": "Inspect controls", "href": "/docs"}
    } as const satisfies HeroConfig;

    export const features = [
  {
    "title": "Policy lattice",
    "description": "Declarative guardrails extend from silicon to session, anchored by just-in-time privileges."
  },
  {
    "title": "Compliant supply chain",
    "description": "SBOM tracking, infrastructure attestation, and automatic drift remediation keep estates audit-ready."
  },
  {
    "title": "Observability mesh",
    "description": "Unified telemetry, anomaly detection, and response automations reduce mean time to trust."
  }
];

    export const story = [
  {
    "title": "Field-hardened",
    "body": "Our operators battled brittle automation stacks and codified the lessons into an operating system for resilient autonomy."
  },
  {
    "title": "Zero-trust always on",
    "body": "Identity, device posture, and workload integrity converge to enforce least privilege in milliseconds."
  },
  {
    "title": "Future-forward",
    "body": "We continuously certify new environments, hardware, and agent modalities as they emerge."
  }
];

    export const contactConfig = {
      intro: "Engage the systems command team for an environment assessment tailored to your regulatory surface.",
      email: "security@blackroad.network"
    };
