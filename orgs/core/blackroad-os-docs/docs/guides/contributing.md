---
id: guides-contributing
title: "Contributing to BlackRoad OS"
slug: /guides/contributing
description: "How to contribute to BlackRoad OS projects"
tags: ["guides", "contributing"]
status: stable
---

# Contributing to BlackRoad OS

Thank you for your interest in contributing to BlackRoad OS! This guide will help you get started.

## Code of Conduct

We are committed to providing a welcoming and inclusive environment. All contributors are expected to:

- Be respectful and professional
- Provide constructive feedback
- Focus on what's best for the community
- Show empathy towards others

## Getting Started

### 1. Choose a Repository

BlackRoad OS consists of multiple repositories:

- [blackroad-os-core](https://github.com/BlackRoad-OS/blackroad-os-core) - Core library and types
- [blackroad-os-api](https://github.com/BlackRoad-OS/blackroad-os-api) - API service
- [blackroad-os-operator](https://github.com/BlackRoad-OS/blackroad-os-operator) - Job orchestration
- [blackroad-os-web](https://github.com/BlackRoad-OS/blackroad-os-web) - Web application
- [blackroad-os-docs](https://github.com/BlackRoad-OS/blackroad-os-docs) - Documentation

See [Stack Map](../overview/STACK_MAP.md) for a complete list.

### 2. Fork and Clone

```bash
# Fork the repository on GitHub, then:
git clone https://github.com/YOUR-USERNAME/REPO-NAME.git
cd REPO-NAME

# Add upstream remote
git remote add upstream https://github.com/BlackRoad-OS/REPO-NAME.git
```

### 3. Set Up Development Environment

Follow the local development guide for your repository:
- [Getting Started - Local Development](./getting-started-local.md)

## Contribution Workflow

### 1. Create a Branch

```bash
# Sync with upstream
git fetch upstream
git checkout main
git merge upstream/main

# Create feature branch
git checkout -b feature/my-feature
```

Branch naming conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Test additions/fixes

### 2. Make Changes

- Write clean, well-documented code
- Follow existing code style
- Add tests for new functionality
- Update documentation as needed

### 3. Test Your Changes

```bash
# Run tests
npm test

# Run linter
npm run lint

# Build to verify
npm run build
```

### 4. Commit Changes

Use clear, descriptive commit messages:

```bash
git add .
git commit -m "Add feature: brief description

Longer description if needed, explaining:
- What changed
- Why it changed
- Any breaking changes"
```

Commit message format:
```
<type>: <subject>

<body>

<footer>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

### 5. Push and Create Pull Request

```bash
git push origin feature/my-feature
```

Then create a Pull Request on GitHub:

1. Go to your fork on GitHub
2. Click "Compare & pull request"
3. Fill in the PR template
4. Link related issues
5. Request review

## Pull Request Guidelines

### PR Description

Include:
- **What:** What changes were made
- **Why:** Why these changes are needed
- **How:** How to test the changes
- **Screenshots:** For UI changes (if applicable)

### PR Checklist

Before submitting:

- [ ] Code follows the project style guide
- [ ] Tests added/updated and passing
- [ ] Documentation updated
- [ ] No console errors or warnings
- [ ] Branch is up to date with main
- [ ] Commit messages are clear
- [ ] PR description is complete

## Code Review Process

### What to Expect

1. Automated checks run (tests, linting, build)
2. Maintainers review your code
3. Feedback may be provided
4. You may need to make changes
5. Once approved, your PR will be merged

### Responding to Feedback

- Be open to suggestions
- Ask questions if unclear
- Make requested changes promptly
- Push updates to the same branch

## Coding Standards

### TypeScript/JavaScript

- Use TypeScript strict mode
- Prefer `const` over `let`
- Use async/await over promises chains
- Write self-documenting code
- Add JSDoc comments for public APIs

Example:
```typescript
/**
 * Fetches agent by ID
 * @param id - Agent identifier
 * @returns Agent object or null if not found
 */
async function getAgent(id: string): Promise<Agent | null> {
  // Implementation
}
```

### Testing

- Write unit tests for logic
- Write integration tests for APIs
- Aim for >80% coverage
- Test edge cases and errors

### Documentation

- Update README if needed
- Add/update inline comments
- Update docs/ for features
- Include examples

## Community

### Getting Help

- **GitHub Issues:** Report bugs or request features
- **Discussions:** Ask questions or share ideas
- **Discord:** _(if available)_ Real-time chat

### Reporting Bugs

When reporting bugs, include:

1. **Description:** What went wrong
2. **Steps to Reproduce:** How to recreate the bug
3. **Expected Behavior:** What should happen
4. **Actual Behavior:** What actually happened
5. **Environment:** OS, Node version, etc.
6. **Logs/Screenshots:** Any relevant output

### Suggesting Features

When suggesting features:

1. **Use Case:** Why is this needed
2. **Proposed Solution:** How it could work
3. **Alternatives:** Other approaches considered
4. **Additional Context:** Any other info

## Recognition

Contributors are recognized in:
- Repository CONTRIBUTORS file
- Release notes
- Project documentation

Thank you for making BlackRoad OS better! 🖤✨

## See Also

- [Getting Started - Local](./getting-started-local.md)
- [Style Guide](meta/STYLE_GUIDE.md)
- [System Prompt](meta/SYSTEM_PROMPT.md)
