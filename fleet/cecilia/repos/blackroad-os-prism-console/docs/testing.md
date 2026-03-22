# Testing Guide

This document describes the testing setup and practices for the Prism Console application.

## Test Framework

The project uses **Jest** with **React Testing Library** for unit and component testing.

### Key Dependencies

- `jest` - Test runner and framework
- `@testing-library/react` - React component testing utilities
- `@testing-library/jest-dom` - Custom Jest matchers for DOM assertions
- `jest-environment-jsdom` - DOM environment for Jest

## Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode (for development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Test Structure

Tests are organized in the `tests/` directory, mirroring the `src/` structure:

```
tests/
├── components/          # Component unit tests
│   ├── AppShell.test.tsx
│   └── StatusCard.test.tsx
└── pages/              # Page/route tests
    └── home.test.tsx
```

## Writing Tests

### Component Tests

Component tests should verify:

1. **Rendering** - Component renders without errors
2. **Props** - Component responds correctly to different props
3. **User interactions** - Click handlers, form inputs, etc.
4. **Conditional rendering** - Shows/hides elements based on state
5. **Accessibility** - ARIA labels, semantic HTML

Example component test:

```tsx
import React from 'react'
import { render, screen } from '@testing-library/react'
import { MyComponent } from '@/components/MyComponent'

describe('MyComponent', () => {
  it('renders the title', () => {
    render(<MyComponent title="Test Title" />)
    expect(screen.getByText('Test Title')).toBeInTheDocument()
  })

  it('handles click events', () => {
    const handleClick = jest.fn()
    render(<MyComponent onClick={handleClick} />)

    const button = screen.getByRole('button')
    button.click()

    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

### Mocking Dependencies

Use Jest mocks for external dependencies:

```tsx
// Mock Next.js config
jest.mock('@/lib/config', () => ({
  serverConfig: {
    environment: 'test',
  },
}))

// Mock child components
jest.mock('@/components/ChildComponent', () => ({
  ChildComponent: () => <div data-testid="child">Mocked Child</div>,
}))
```

### Testing Best Practices

1. **Use data-testid sparingly** - Prefer accessible queries (getByRole, getByLabelText)
2. **Test user behavior, not implementation** - Focus on what users see and do
3. **One assertion per test (when possible)** - Makes failures easier to diagnose
4. **Keep tests isolated** - Each test should be independent
5. **Mock external dependencies** - Network requests, environment variables, etc.

## Coverage Goals

- **Statements**: 80%+ coverage
- **Branches**: 75%+ coverage
- **Functions**: 80%+ coverage
- **Lines**: 80%+ coverage

View coverage reports:

```bash
npm run test:coverage
open coverage/lcov-report/index.html
```

## CI/CD Integration

Tests run automatically on:

- Every push to `main` or `develop` branches
- Every pull request
- Multiple Node.js versions (20.x, 22.x)

See `.github/workflows/test.yml` for CI configuration.

## Debugging Tests

```bash
# Run specific test file
npm test -- tests/components/AppShell.test.tsx

# Run tests matching pattern
npm test -- --testNamePattern="renders the title"

# Run with verbose output
npm test -- --verbose

# Debug in VS Code
# Add a debugger statement and run "Jest: Debug" from command palette
```

## Common Issues

### Tests fail with "Cannot find module '@/...'"

Ensure `jest.config.js` has the correct path mapping:

```js
moduleNameMapper: {
  '^@/(.*)$': '<rootDir>/src/$1',
}
```

### Tests timeout

Increase timeout for async operations:

```tsx
it('fetches data', async () => {
  // Test code
}, 10000) // 10 second timeout
```

### Mock not working

Ensure mocks are declared before imports:

```tsx
// ✅ Correct
jest.mock('@/lib/api')
import { MyComponent } from '@/components/MyComponent'

// ❌ Incorrect
import { MyComponent } from '@/components/MyComponent'
jest.mock('@/lib/api')
```

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Library Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Next.js Testing Guide](https://nextjs.org/docs/testing/jest)
