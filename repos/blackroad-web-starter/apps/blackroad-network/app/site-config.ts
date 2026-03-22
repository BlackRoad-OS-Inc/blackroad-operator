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
      name: "BlackRoad Network",
      domain: "blackroad.network",
      navigation,
    };

    export const hero = {
      eyebrow: "Agent federation",
      title: "Trust-first autonomy for coordinated agents",
      description: "Orchestrate missions across a network of verifiable agents anchored by attestations, guardrails, and resilient playbooks.",
      primary: {"label": "Request a briefing", "href": "/contact"},
      secondary: {"label": "View the doctrine", "href": "/docs"}
    } as const satisfies HeroConfig;

    export const features = [
  {
    "title": "Attestation graph",
    "description": "Continuously reconcile provenance, capabilities, and intent across every agent before they receive tasks."
  },
  {
    "title": "Mission-grade coordination",
    "description": "Codify swarms, squads, and lone specialists with shared situational awareness and adaptive SOPs."
  },
  {
    "title": "Adaptive safeguards",
    "description": "Autonomy layers negotiate trust envelopes in real time to preserve safety, privacy, and compliance."
  }
];

    export const story = [
  {
    "title": "The covenant",
    "body": "We began as a coordination layer for mission teams that needed agentic speed without losing human accountability."
  },
  {
    "title": "Trust-first architecture",
    "body": "Every node is enrolled through cryptographic identity, policy attestation, and telemetry streams that prove good standing."
  },
  {
    "title": "Expanding the network",
    "body": "We are opening the graph to allied operators who require interoperable autonomy with verifiable intent."
  }
];

    export const contactConfig = {
      intro: "Coordinate with the network operations desk and we will return a secure channel within one business day.",
      email: "ops@blackroad.network"
    };
