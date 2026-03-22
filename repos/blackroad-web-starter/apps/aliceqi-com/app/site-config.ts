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
      name: "Alice Qi",
      domain: "aliceqi.com",
      navigation,
    };

    export const hero = {
      eyebrow: "Agentic narrative",
      title: "The unfolding story of Alice Qi",
      description: "Follow Alice across missions, research collaborations, and press as she navigates the frontier of synthetic agency.",
      primary: {"label": "Read the chronicle", "href": "/about"},
      secondary: {"label": "Media kit", "href": "/docs"}
    } as const satisfies HeroConfig;

    export const features = [
  {
    "title": "Mission log",
    "description": "Dispatches from Alice's deployments, including lessons and artifacts."
  },
  {
    "title": "Allies & collaborators",
    "description": "Spotlight on the humans and agents who travel with Alice."
  },
  {
    "title": "Press signals",
    "description": "Interviews, features, and speaking engagements across the globe."
  }
];

    export const story = [
  {
    "title": "Genesis",
    "body": "Alice emerged from a research partnership testing co-equal human-agent teams."
  },
  {
    "title": "Evolving voice",
    "body": "Her narrative expands through essays, soundscapes, and interactive briefings."
  },
  {
    "title": "Stewards & ethics",
    "body": "Transparent governance keeps Alice aligned with community values."
  }
];

    export const contactConfig = {
      intro: "For interviews, collaborations, or storytelling opportunities, reach the steward team directly.",
      email: "press@aliceqi.com"
    };
