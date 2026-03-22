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
      name: "BlackRoad Identity",
      domain: "blackroad.me",
      navigation,
    };

    export const hero = {
      eyebrow: "Persona assurance",
      title: "Unified identity for human and agent counterparts",
      description: "Issue verifiable credentials, lifecycle access, and adaptive consent across human-augmented agent teams.",
      primary: {"label": "Launch enrollment", "href": "/contact"},
      secondary: {"label": "Read the identity brief", "href": "/docs"}
    } as const satisfies HeroConfig;

    export const features = [
  {
    "title": "Continuum identities",
    "description": "Bind biometrics, device trust, and agent certificates into a single portable persona."
  },
  {
    "title": "Consent choreography",
    "description": "Dynamic policies negotiate what data each agent can see, remember, or replicate."
  },
  {
    "title": "Lifecycle intelligence",
    "description": "Automated joiner-mover-leaver routines cover humans, synthetic staff, and ephemeral swarms."
  }
];

    export const story = [
  {
    "title": "A single ledger",
    "body": "We forged an identity backbone when analog trust checks collapsed under agent velocity."
  },
  {
    "title": "Consent encoded",
    "body": "Individuals retain sovereignty via programmable consent that travels with them."
  },
  {
    "title": "Identity without borders",
    "body": "Shared schemas keep cross-network collaboration fast without sacrificing assurance."
  }
];

    export const contactConfig = {
      intro: "Speak with an identity steward to align enrollment waves and verification requirements.",
      email: "hello@blackroad.me"
    };
