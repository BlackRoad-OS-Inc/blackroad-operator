# blackroad-agents — Safe Change Boundaries

## SAFE (do freely)
- Read any agent definition or Modelfile
- Read coordination schemas and scripts
- Edit documentation (PI_SETUP.md, CHANGELOG.md)
- Add comments or annotations to existing Modelfiles
- Run `ollama list` to check loaded models

## CAUTION (test first, verify after)
- Modify Modelfile system prompts (changes agent behavior fleet-wide)
- Edit coordination scripts (broadcast, DM, skill-matcher)
- Add new agent Modelfiles
- Change `cece-profile.json` personality parameters
- Update `directory-structure.json` registry

## DANGEROUS (ask before doing)
- Delete or rename existing Modelfiles
- Change agent temperature/context parameters in production
- Run `ollama create` on Pi nodes (loads model into memory)
- Modify broadcast schemas (breaks all consumers)
- Push changes that affect live agent routing

## NEVER
- Embed API keys or secrets in Modelfiles
- Delete cece-profile.json
- Force push to main
- Remove agents from the directory without migrating dependents
