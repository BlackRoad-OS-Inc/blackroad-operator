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
      name: "BlackRoad Quantum",
      domain: "blackroadquantum.com",
      navigation,
    };

    export const hero = {
      eyebrow: "Quantum research",
      title: "Quantum demonstrations for decisive insights",
      description: "Run provable demos, share papers, and explore hardware partnerships with the BlackRoad quantum research collective.",
      primary: {"label": "Request a demo", "href": "/contact"},
      secondary: {"label": "Browse papers", "href": "/docs"}
    } as const satisfies HeroConfig;

    export const features = [
  {
    "title": "Applied experiments",
    "description": "We move from theoretical constructs to field demonstrations with annotated data."
  },
  {
    "title": "Hybrid compute",
    "description": "Classical acceleration meets quantum tooling for tractable workloads."
  },
  {
    "title": "Scholarly cadence",
    "description": "Peer-reviewed releases and community briefings keep collaborators aligned."
  }
];

    export const story = [
  {
    "title": "Bridging theory and practice",
    "body": "Our researchers partner with operators to focus on solvable, high-impact quantum problems."
  },
  {
    "title": "Transparent instrumentation",
    "body": "All demos include reproducible notebooks, calibration data, and governance context."
  },
  {
    "title": "Publishing together",
    "body": "We invite partners to co-author findings and accelerate discovery."
  }
];

    export const contactConfig = {
      intro: "Connect with the research desk to align on objectives and disclosure cadence.",
      email: "papers@blackroadquantum.com"
    };
