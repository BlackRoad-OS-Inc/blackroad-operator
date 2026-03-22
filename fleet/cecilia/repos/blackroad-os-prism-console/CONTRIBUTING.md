# Contributing to Prism Console

Thank you for your interest in contributing to the Prism Console! This document provides guidelines for contributing to this repository within the BlackRoad OS ecosystem.

## BlackRoad OS Core Principles

Before contributing, please familiarize yourself with the BlackRoad OS core principles:

1. **NEVER** introduce secrets, tokens, API keys, or credentials
2. **NEVER** commit binary files, images, videos, PDFs, zips, or proprietary blobs
3. **ALWAYS** follow atomic commit logic:
   - 1 PR = 1 logical change
   - Never mix concerns
4. **ALWAYS** follow repo rules, file paths, and established structures
5. **ALWAYS** maintain compatibility with Railway, Cloudflare, and GitHub Actions CI

## Repository Context

The **blackroad-os-prism-console** repository is the single-pane-of-glass admin console for BlackRoad OS. It provides:

- Real-time dashboards for agent health and environment monitoring
- Deployment and job scheduling interfaces
- Identity and audit trail visualization
- Integration with the BlackRoad OS ecosystem

See `docs/REPOSITORY_ROLE.md` for more details on this repository's role in the ecosystem.

## Getting Started

### Prerequisites

- Node.js >= 20
- pnpm >= 9.12.0
- Git

### Setup

```bash
# Clone the repository
git clone https://github.com/BlackRoad-OS/blackroad-os-prism-console.git
cd blackroad-os-prism-console

# Install dependencies
pnpm install

# Copy environment template
cp prisma-console.env.example .env.local

# Start development server
pnpm dev
```

Visit http://localhost:3000 to see the console.

## Development Workflow

### 1. Create an Issue

Before starting work, create an issue using one of our templates:
- **Agent Issue** - for agent-related changes
- **Pack Issue** - for pack-related changes
- **Feature Request** - for new features
- **Bug Report** - for bugs
- **Infrastructure Issue** - for infra/deployment issues
- **Documentation Issue** - for documentation improvements

Ensure your issue has the proper labels:
- `team:*` (e.g., `team:prism`)
- `type:*` (e.g., `type:feature`)
- `prio:*` (e.g., `prio:P1`)
- `status:*` (e.g., `status:ready`)

### 2. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

### 3. Make Changes

- Write clean, well-documented code
- Follow existing code style and conventions
- Add tests for new functionality
- Update documentation as needed

### 4. Test Your Changes

```bash
# Run linter
pnpm lint

# Run tests
pnpm test

# Build the project
pnpm build

# Test locally
pnpm dev
```

### 5. Commit Your Changes

Follow conventional commit format:

```bash
git commit -m "feat: add agent health monitoring dashboard"
git commit -m "fix: resolve memory leak in environment monitor"
git commit -m "docs: update README with setup instructions"
```

Commit types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### 6. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Create a PR using the pull request template. Ensure:
- PR title is clear and descriptive
- All checklist items are completed
- Proper labels are applied
- Related issues are linked

## Code Style

### TypeScript/React

- Use TypeScript for all new code
- Follow existing patterns in the codebase
- Use functional components and hooks
- Prefer named exports over default exports
- Use Tailwind CSS for styling

### File Organization

```
app/              # Next.js app router pages
components/       # Shared React components
frontend/         # Frontend-specific code
  app/            # Frontend app pages
  components/     # Frontend components
lib/              # Utility libraries
types/            # TypeScript type definitions
tests/            # Test files
docs/             # Documentation
infra/            # Infrastructure configuration
```

### Component Structure

```tsx
import { FC } from 'react';

interface MyComponentProps {
  title: string;
  count: number;
}

export const MyComponent: FC<MyComponentProps> = ({ title, count }) => {
  return (
    <div className="rounded-lg bg-zinc-900 p-4">
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <p className="text-zinc-400">{count} items</p>
    </div>
  );
};
```

## Testing

- Write tests for all new features
- Maintain or improve code coverage
- Use Vitest for unit tests
- Use React Testing Library for component tests

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent title="Test" count={5} />);
    expect(screen.getByText('Test')).toBeInTheDocument();
    expect(screen.getByText('5 items')).toBeInTheDocument();
  });
});
```

## Documentation

- Update README.md for significant changes
- Add JSDoc comments for complex functions
- Update docs/ directory for architectural changes
- Keep CHANGELOG.md updated (if applicable)

## Integration with BlackRoad OS Ecosystem

### Agent Registry

When adding agent-related features, ensure compatibility with:
- `blackroad-os-agents/registry/agents.json`
- Agent schema and permissions model

### Pack System

When adding pack-related features, reference:
- `blackroad-os-agents/registry/packs.yml`
- Pack IDs and vertical structure

### Infrastructure

Ensure compatibility with:
- Railway deployment (`railway.toml`, `railway.json`)
- Cloudflare (for domains and DNS)
- GitHub Actions CI (`.github/workflows/`)

## Code Review Process

1. All PRs require at least one review
2. Address all review comments
3. Keep PRs focused and atomic
4. Update PR based on feedback
5. Merge only when all checks pass

## Security

- Never commit secrets or credentials
- Use environment variables for sensitive data
- Report security vulnerabilities privately
- Follow security best practices

## Getting Help

- Check existing issues and documentation
- Ask questions in issue comments
- Refer to [BlackRoad OS Documentation](https://github.com/BlackRoad-OS/blackroad-os-docs)
- Review [Agent Registry](https://github.com/BlackRoad-OS/blackroad-os-agents)

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (see LICENSE file).

---

Thank you for contributing to BlackRoad OS! 🚀
