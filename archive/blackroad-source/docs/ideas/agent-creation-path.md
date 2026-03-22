# Agent Creation Path

The journey from idea to shipped agent follows a predictable arc:

```
Idea → Concept → Agent Proposal → operators/registry YAML → agent class → orchestrator wiring → internal API → Prism Console → docs update
```

## Breakdown
1. **Idea**: Capture in `/ideas/raw/` and register in `registry/ideas.json`.
2. **Concept**: Draft a Concept Card outlining objectives, mechanisms, and risks.
3. **Agent Proposal**: Define purpose, inputs/outputs, behaviors, and safety using the template.
4. **Registry & YAML**: Add targets for `blackroad-os-operator` registries and any orchestrator config.
5. **Agent Class & Wiring**: Implement behaviors, triggers, and escalation in code; map to events.
6. **Internal API**: Expose capabilities to other agents and services.
7. **Prism Console**: Surface controls, visibility, and journaling hooks.
8. **Docs Update**: Reflect status changes in registries and roadmap files.
