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
      name: "BlackRoad AI",
      domain: "blackroadai.com",
      navigation,
    };

    export const hero = {
      eyebrow: "APIs & SDKs",
      title: "Deploy agentic intelligence through one API",
      description: "Provision inference, planning, and orchestration primitives that plug into mission systems within hours.",
      primary: {"label": "Get API credentials", "href": "/contact"},
      secondary: {"label": "Explore the SDK", "href": "/docs"}
    } as const satisfies HeroConfig;

    export const features = [
  {
    "title": "Unified endpoint",
    "description": "Serve language, vision, and decisioning models with a consistent security posture."
  },
  {
    "title": "Mission kits",
    "description": "Starter templates encode playbooks for ops, research, and field deployments."
  },
  {
    "title": "Runtime observability",
    "description": "Tracing, metrics, and safety signals stream into your SIEM and analytics fabric."
  }
];

    export const story = [
  {
    "title": "Born from integration",
    "body": "We unified fractured agent pipelines into a single programmable platform."
  },
  {
    "title": "Built for operators",
    "body": "SDKs wrap auth, compliance, and telemetry so teams can ship faster."
  },
  {
    "title": "Scaling impact",
    "body": "We partner with customers to tune models and governance for each mission set."
  }
];

    export const contactConfig = {
      intro: "Request sandbox access and we will pair you with a solutions engineer.",
      email: "api@blackroadai.com"
    };
