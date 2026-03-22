# Creator Studio Pack Playbook

The Creator Studio pack gives any BlackRoad OS deployment a starter "creator / studio OS" with connected agents, workflows, and presets. It is designed to help solo creators, boutique studios, and in-house brand teams plan campaigns, draft scripts, and repurpose content across channels.

## Core Capabilities
- **Content planning:** translate business and brand goals into structured content pillars and calendars.
- **Longform scripting:** transform outlines into ready-to-record scripts and adjust runtimes for each format.
- **Clip orchestration:** identify shareable shortform moments and propose channel-specific captions.

## Agents
- **Content Strategist (cs-content-strategist-01):** maps goals to pillars, channels, and cadence.
- **Scriptwriter // Longform Architect (cs-scriptwriter-longform-01):** drafts and tightens scripts from outlines and pillars.
- **Social Clip Alchemist (cs-social-clip-alchemist-01):** extracts clip ideas from transcripts and drafts social-ready captions.

## Example: Campaign Idea to Live Posts
1. **Define goals and audience.** Feed goals and audience profile into the **Content Strategist** to generate pillars.
2. **Draft longform scripts.** Use pillars to create an outline and ask the **Scriptwriter** to produce a longform draft.
3. **Generate clips.** Send the draft transcript to the **Social Clip Alchemist** to surface shortform clip ideas with captions.
4. **Assemble the calendar.** Run **Content Strategist** again to assemble the weekly calendar with clip insertion.
5. **Launch.** Export calendar to your scheduling system or downstream channel adapters.

## Typical Use Cases
- Solo creators who need a reliable ideation-to-publishing loop.
- Small studios collaborating on weekly drops across YouTube, newsletters, and socials.
- In-house brand teams seeking repeatable campaign launches with clear accountability.

## Integration Notes
- All workflows are expressed in YAML and can be registered directly with the BlackRoad Operator API.
- Agents reference PS-SHA∞ identifiers and roles so they can be cataloged and governed centrally.
- Presets (pillars, voice) can be overridden per deployment without editing agent code.
