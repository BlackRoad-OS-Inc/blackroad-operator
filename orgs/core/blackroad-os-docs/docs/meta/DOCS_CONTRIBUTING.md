---
id: meta-docs-contributing
title: "Docs Contributing Guide"
slug: /meta/docs-contributing
description: "Specific guide for contributing to BlackRoad OS documentation"
tags: ["meta", "contributing", "documentation"]
status: stable
---

# Docs Contributing Guide

> 📚 This is the detailed contributing guide specifically for the `blackroad-os-docs` repository.

For general contribution guidelines across all BlackRoad OS repositories, see the [main Contributing Guide](guides/contributing.md).

## Documentation Structure

See the [System Prompt](meta/SYSTEM_PROMPT.md) for the complete philosophy and structure of BlackRoad OS documentation.

## Quick Reference

### Adding New Documentation

1. **Choose the right location:**
   - `docs/overview/` - Architecture and high-level concepts
   - `docs/services/` - Service-specific documentation
   - `docs/agents/` - Agent ecosystem
   - `docs/guides/` - How-to guides
   - `docs/runbooks/` - Operational procedures
   - `docs/reference/` - API and technical reference
   - `docs/ops/` - Operations documentation
   - `docs/meta/` - Documentation about documentation

2. **Create the file:**
   ```bash
   # Use kebab-case for filenames
   touch docs/guides/my-new-guide.md
   ```

3. **Add frontmatter:**
   ```yaml
   ---
   id: guides-my-new-guide
   title: "My New Guide"
   slug: /guides/my-new-guide
   description: "Brief description"
   tags: ["guides", "topic"]
   status: stable  # or alpha, planned, deprecated
   ---
   ```

4. **Update sidebar:**
   Edit `sidebars.ts` to add your new page to navigation.

5. **Build and verify:**
   ```bash
   npm run build
   ```

## Writing Standards

Follow the [Style Guide](meta/STYLE_GUIDE.md) for:
- Markdown conventions
- Heading hierarchy
- Code block formatting
- Link formatting
- Diagram creation

## What NOT to Commit

Never commit:
- Binary images (PNG, JPEG, GIF, etc.)
- Secrets or credentials
- Large files
- Build artifacts
- IDE-specific files

See `.gitignore` for the complete list.

## Testing Documentation Changes

### Local Development
```bash
npm run start
# Visit http://localhost:3000
```

### Production Build
```bash
npm run build
npm run serve
# Visit http://localhost:3000
```

### Check for Broken Links
The build process will fail if there are broken links. Fix them before submitting.

## Pull Request Process

1. Create a feature branch
2. Make your documentation changes
3. Test locally with `npm run build`
4. Update sidebar if adding new pages
5. Create PR with clear description
6. Request review

## Documentation Types

Refer to the [Style Guide](meta/STYLE_GUIDE.md) for templates and conventions for:
- Architecture Docs
- Service Docs
- Runbooks
- How-To Guides
- Reference Docs

## Cross-Linking

Use relative links for internal documentation:

```md
See [Service API](../services/service-api.md)
See [Agent Ecosystem](../agents/agent-ecosystem.md)
```

## Marking Planned Content

For planned but not yet written content:

```md
> 📋 **Status:** This document is planned and will be developed.
```

Or mark links as planned:
```md
See [Future Guide](./future-guide.md) _(planned)_
```

## Questions?

- Check the [System Prompt](meta/SYSTEM_PROMPT.md)
- Review the [Style Guide](meta/STYLE_GUIDE.md)
- Look at existing docs for examples
- Open an issue for clarification

## See Also

- [System Prompt](meta/SYSTEM_PROMPT.md) - Documentation philosophy
- [Style Guide](meta/STYLE_GUIDE.md) - Writing standards
- [Contributing Guide](guides/contributing.md) - General contribution guide
- [CONTRIBUTING.md](https://github.com/BlackRoad-OS/blackroad-os-docs/blob/main/CONTRIBUTING.md) - Quick reference in root
