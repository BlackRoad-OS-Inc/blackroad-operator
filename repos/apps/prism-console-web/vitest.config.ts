import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './vitest.setup.ts',
    include: ['**/*.spec.{ts,tsx}', '**/*.test.{ts,tsx}'],
    // Exclude integration tests located under tests/**; unit tests live alongside source files.
    exclude: ['e2e/**', 'tests/**', '**/node_modules/**', '**/.next/**', '**/dist/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'json-summary'],
      include: [
        'components/**/*.{ts,tsx}',
        'features/**/*.{ts,tsx}',
        'hooks/**/*.{ts,tsx}',
        'lib/**/*.{ts,tsx}'
      ],
      exclude: ['**/*.stories.{ts,tsx}', 'e2e/**'],
      thresholds: {
        statements: 70,
        branches: 70,
        functions: 70,
        lines: 70
      }
    }
  },
  resolve: {
    alias: {
      '~': path.resolve(__dirname, '.')
    }
  }
});
