# blackroad-cli — Safe Change Boundaries

## SAFE (do freely)
- Read any bot module or documentation
- Run bots locally for testing
- Add docstrings and comments
- Edit documentation

## CAUTION (test first, verify after)
- Modify existing bot behavior
- Change `__init__.py` bot registry
- Edit the Trinity subsystem
- Add new dependencies

## DANGEROUS (ask before doing)
- Change the CLI entry point or command routing
- Modify bots that interact with external services (finance, ops)
- Change bot output formats (downstream consumers may depend on them)

## NEVER
- Store API keys or credentials in bot source code
- Remove bots without checking for dependents
- Force push to main
