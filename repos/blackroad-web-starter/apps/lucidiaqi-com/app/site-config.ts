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
      name: "Lucidia Qi",
      domain: "lucidiaqi.com",
      navigation,
    };

    export const hero = {
      eyebrow: "Persona portal",
      title: "Navigate the Lucidia persona constellation",
      description: "Discover, activate, and harmonize Lucidia personae for experiential worlds and collaborative storytelling.",
      primary: {"label": "Open the portal", "href": "/contact"},
      secondary: {"label": "Persona index", "href": "/docs"}
    } as const satisfies HeroConfig;

    export const features = [
  {
    "title": "Persona registry",
    "description": "Curated dossiers, traits, and relationship maps for every Lucidia persona."
  },
  {
    "title": "Activation rituals",
    "description": "Guided prompts, staging notes, and sensory palettes for immersive deployments."
  },
  {
    "title": "Continuity intelligence",
    "description": "Timeline reconciliations keep cross-medium narratives synchronized."
  }
];

    export const story = [
  {
    "title": "Weaving personae",
    "body": "Lucidia personae began as characters in campus salons and grew into a living canon."
  },
  {
    "title": "Portal engineering",
    "body": "We built orchestration tools to let communities co-create safely and coherently."
  },
  {
    "title": "Harmonics ahead",
    "body": "Upcoming releases invite new stewards and collaborative performances."
  }
];

    export const contactConfig = {
      intro: "Stewards can help you choose a persona blend or create a new presence for your world.",
      email: "portal@lucidiaqi.com"
    };
