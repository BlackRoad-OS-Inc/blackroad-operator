# Content Pipeline Map

```
Strategy (Content Strategist)
  -> Longform Drafts (Scriptwriter)
    -> Clip Ideation (Social Clip Alchemist)
      -> Distribution (Channel adapters)
        -> Analytics + Feedback (future adapters)
          -> Strategy refresh (Content Strategist)
```

## How Agents Plug In
- **Content Strategist:** designs pillars, picks channels, and assembles calendars using performance signals.
- **Scriptwriter // Longform Architect:** turns outlines into ready-to-record scripts and trims to runtime.
- **Social Clip Alchemist:** mines transcripts for moments and drafts platform-specific captions.

## Platform Touchpoints
- **blackroad-os-api:** workflows can call API endpoints for asset storage, scheduling hooks, or operator commands.
- **blackroad-os-prism-console:** future dashboard surface to visualize calendars, running campaigns, and performance metrics.

## Notes
- Keep assets traceable: every draft or clip should be associated with a source transcript and owner.
- Channel adapters are not implemented here—stubs are ready for integration without hitting real APIs.
