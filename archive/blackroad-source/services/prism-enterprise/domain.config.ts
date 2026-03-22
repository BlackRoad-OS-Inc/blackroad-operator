export type Site = {
  domain: string;
  title: string;
  tagline: string;
  twitter?: string;
  ogImageText?: string;
};

export const SITES: Site[] = [
  { domain: "blackroad.network", title: "BlackRoad Network", tagline: "Trust-first agent network" },
  { domain: "blackroad.systems", title: "BlackRoad Systems", tagline: "Infra • OS • Zero-trust" },
  { domain: "blackroad.me", title: "BlackRoad ID", tagline: "Identity & profile" },
  { domain: "blackroadai.com", title: "BlackRoad AI", tagline: "API • SDK • Keys" },
  { domain: "blackroadqi.com", title: "BlackRoad Qi", tagline: "Intelligence experiments" },
  { domain: "blackroadquantum.com", title: "BlackRoad Quantum", tagline: "Lab • Demos • Papers" },
  { domain: "lucidia.earth", title: "Lucidia", tagline: "City-in-the-garden creator campus" },
  { domain: "lucidia.studio", title: "Lucidia Studio", tagline: "Design • Courses • Tools" },
  { domain: "aliceqi.com", title: "Alice Qi", tagline: "Narrative & press" },
  { domain: "lucidiaqi.com", title: "Lucidia Qi", tagline: "Persona portal" },
];

export const getSite = (host: string) =>
  SITES.find((site) => host?.trim().toLowerCase().endsWith(site.domain)) ?? SITES[0];
