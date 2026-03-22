# Dependency Management Strategy

## Overview

This repository previously had 43+ scattered `requirements.txt` files. This directory centralizes Python dependency management.

## Structure

```
requirements/
├── base.txt           # Core dependencies used across all services
├── services.txt       # Service-specific dependencies
├── quantum.txt        # Quantum computing dependencies
├── ai-ml.txt          # AI/ML dependencies (Transformers, PyTorch, etc.)
├── dev.txt            # Development dependencies
└── test.txt           # Testing dependencies
```

## Migration Plan

### Phase 1: Consolidation (Completed)
- Created centralized requirements directory
- Categorized dependencies by domain

### Phase 2: Service Migration (TODO)
Each service should update to use:
```python
# In service requirements.txt
-r ../requirements/base.txt
-r ../requirements/services.txt
# Add service-specific deps below
```

### Phase 3: Cleanup (TODO)
- Remove duplicate requirements.txt files after migration
- Update CI/CD pipelines to use centralized requirements

## Legacy Files

The following locations still have legacy requirements.txt files that should be migrated:
- `/services/*/requirements.txt` - 10+ service-specific files
- `/opt/blackroad/*/requirements.txt` - 8+ legacy files
- `/srv/*/requirements.txt` - 6+ server files
- Various tool and utility directories

## Best Practices

1. **Always pin versions**: Use `package==1.2.3` not `package`
2. **Document why**: Add comments for non-obvious dependencies
3. **Regular updates**: Review and update dependencies quarterly
4. **Security scanning**: Run `pip-audit` before deployments
5. **Use constraints**: Consider adding `constraints.txt` for upper bounds

## Tools

- **pip-tools**: Use `pip-compile` to generate locked dependencies
- **pip-audit**: Security vulnerability scanning
- **dependabot**: Automated dependency updates (configured)
