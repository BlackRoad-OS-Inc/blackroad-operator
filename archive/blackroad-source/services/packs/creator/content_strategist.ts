export interface BrandGoals {
  primaryObjective: string;
  secondaryObjectives?: string[];
  kpis?: string[];
}

export interface AudienceProfile {
  name: string;
  motivations: string[];
  painPoints: string[];
  preferredChannels: string[];
}

export interface ContentPillar {
  id: string;
  label: string;
  description: string;
  primaryChannels?: string[];
}

export interface CadenceConfig {
  frequency: "daily" | "weekly" | "biweekly" | "monthly";
  slotsPerWeek?: number;
  preferredDays?: string[];
}

export interface CalendarEntry {
  pillarId: string;
  title: string;
  channel: string;
  scheduledFor: string;
  format: string;
}

export function designContentPillars(
  goals: BrandGoals,
  audience: AudienceProfile
): ContentPillar[] {
  const basePillars: ContentPillar[] = [
    {
      id: "vision-roadmap",
      label: "Vision & Roadmap",
      description: `Connecting ${audience.name} to where the brand is headed and why it matters to their goals`,
      primaryChannels: ["blog", "linkedin"],
    },
    {
      id: "behind-the-scenes",
      label: "Behind the Scenes",
      description: "Transparent builds, sprints, and what the team is learning along the way",
      primaryChannels: ["youtube", "newsletter"],
    },
    {
      id: "education-deep-dives",
      label: "Education / Deep Dives",
      description: `How-tos and explainers that remove the pain points: ${audience.painPoints.join(", ")}`,
      primaryChannels: ["blog", "youtube", "twitter"],
    },
  ];

  if (goals.primaryObjective.toLowerCase().includes("community")) {
    basePillars.push({
      id: "community-spotlight",
      label: "Community Spotlight",
      description: "Featuring collaborators, partners, and early adopters to build trust",
      primaryChannels: audience.preferredChannels,
    });
  }

  return basePillars;
}

export function generateContentCalendar(
  pillars: ContentPillar[],
  cadence: CadenceConfig
): CalendarEntry[] {
  const slots = cadence.slotsPerWeek ?? 3;
  const days = cadence.preferredDays ?? ["Mon", "Wed", "Fri"];
  const calendar: CalendarEntry[] = [];

  // Track how many entries are scheduled for each day to stagger times
  const dayEntryCount: Record<string, number> = {};

  for (let i = 0; i < slots; i += 1) {
    const day = days[i % days.length];
    const pillar = pillars[i % pillars.length];
    const channel = pillar.primaryChannels?.[0] ?? "blog";
    // Determine the hour for this entry (start at 10:00, increment by 1 for each additional entry on the same day)
    const entryCount = dayEntryCount[day] ?? 0;
    const hour = 10 + entryCount;
    dayEntryCount[day] = entryCount + 1;
    calendar.push({
      pillarId: pillar.id,
      title: `${pillar.label}: ${pillar.description.slice(0, 40)}...`,
      channel,
      scheduledFor: `${day} ${hour.toString().padStart(2, "0")}:00`,
      format: channel === "youtube" ? "video" : "article",
    });
  }

  return calendar;
}
