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
      name: "BlackRoad Qi",
      domain: "blackroadqi.com",
      navigation,
    };

    export const hero = {
      eyebrow: "Intelligence experiments",
      title: "Field intelligence through Qi-driven research",
      description: "Prototype emergent behaviors, intelligence loops, and cognitive stacks grounded in ethical experimentation.",
      primary: {"label": "Join a lab sprint", "href": "/contact"},
      secondary: {"label": "Survey the findings", "href": "/docs"}
    } as const satisfies HeroConfig;

    export const features = [
  {
    "title": "Cognition sandboxes",
    "description": "Instrumented environments for testing agent alignment, curiosity, and cooperation."
  },
  {
    "title": "Ethics-in-the-loop",
    "description": "Rapid review cells keep experiments accountable to human intent and safety."
  },
  {
    "title": "Qi knowledge base",
    "description": "A living atlas of protocols, metrics, and insights shared with partner institutes."
  }
];

    export const story = [
  {
    "title": "Origin in the field",
    "body": "Our Qi labs emerged to answer real-world questions about intelligence beyond benchmarks."
  },
  {
    "title": "Experiment, document, share",
    "body": "Every study includes replicable methods, telemetry, and reflection."
  },
  {
    "title": "Building the commons",
    "body": "We release insights and tools so aligned researchers can accelerate together."
  }
];

    export const contactConfig = {
      intro: "Research liaisons coordinate NDAs and onboarding for visiting scholars and partners.",
      email: "lab@blackroadqi.com"
    };
