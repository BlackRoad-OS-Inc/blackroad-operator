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
      name: "Lucidia Studio",
      domain: "lucidia.studio",
      navigation,
    };

    export const hero = {
      eyebrow: "Courses & tools",
      title: "Studio courses for expressive technologists",
      description: "Curriculum, toolchains, and critique rituals to help creative teams master emerging media.",
      primary: {"label": "Join the next cohort", "href": "/contact"},
      secondary: {"label": "View the catalog", "href": "/docs"}
    } as const satisfies HeroConfig;

    export const features = [
  {
    "title": "Live studio sessions",
    "description": "Weekly critiques led by mentors across motion, sound, and interactive arts."
  },
  {
    "title": "Toolchain library",
    "description": "Preconfigured workspaces, templates, and asset packs accelerate production."
  },
  {
    "title": "Studio companion",
    "description": "Agentic assistants provide feedback and guardrails inside your creative tools."
  }
];

    export const story = [
  {
    "title": "Craft meets code",
    "body": "Lucidia Studio launched to help artists navigate the frontier of immersive tech."
  },
  {
    "title": "Learning in public",
    "body": "Cohorts share process logs and open-source utilities back to the commons."
  },
  {
    "title": "Scaling the studio",
    "body": "We are launching micro-courses and pop-up studios to reach more creators."
  }
];

    export const contactConfig = {
      intro: "Tell us about your practice and the tools you rely on so we can recommend the right track.",
      email: "hello@lucidia.studio"
    };
