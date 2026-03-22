import { strict as assert } from "assert";
import {
  AudienceProfile,
  BrandGoals,
  CadenceConfig,
  designContentPillars,
  generateContentCalendar,
} from "../agents/content_strategist";

describe("content strategist", () => {
  const goals: BrandGoals = {
    primaryObjective: "Grow community and brand trust",
    secondaryObjectives: ["newsletter signups"],
  };

  const audience: AudienceProfile = {
    name: "Builder-operators",
    motivations: ["stay ahead", "ship faster"],
    painPoints: ["context switching", "content fatigue"],
    preferredChannels: ["youtube", "twitter"],
  };

  const cadence: CadenceConfig = {
    frequency: "weekly",
    slotsPerWeek: 3,
    preferredDays: ["Mon", "Wed", "Fri"],
  };

  it("designs content pillars from goals and audience", () => {
    const pillars = designContentPillars(goals, audience);
    assert.ok(pillars.length > 0, "at least one pillar is produced");
    pillars.forEach((pillar) => {
      assert.ok(pillar.id, "pillar has an id");
      assert.ok(pillar.label, "pillar has a label");
      assert.ok(pillar.description, "pillar has a description");
    });
  });

  it("generates a calendar that references pillars", () => {
    const pillars = designContentPillars(goals, audience);
    const calendar = generateContentCalendar(pillars, cadence);
    assert.equal(calendar.length, cadence.slotsPerWeek);
    calendar.forEach((entry) => {
      const pillarMatch = pillars.find((pillar) => pillar.id === entry.pillarId);
      assert.ok(pillarMatch, "calendar entry references a valid pillar");
      assert.ok(entry.title.length > 0, "entry has a title");
      assert.ok(entry.channel.length > 0, "entry has a channel");
      assert.ok(entry.scheduledFor.length > 0, "entry has a schedule slot");
    });
  });
});
