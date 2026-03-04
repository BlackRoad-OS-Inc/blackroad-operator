// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.strict,
  {
    languageOptions: {
      parserOptions: {
        project: './tsconfig.eslint.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/consistent-type-imports': 'error',
      'no-console': 'off',
    },
  },
  {
    ignores: [
      'dist/',
      'node_modules/',
      'orgs/',
      'repos/',
      'tools/',
      'scripts/',
      'blackroad-core/',
      'blackroad-*/!(.ts)',
      'dashboard/',
      'migration/',
      'mcp-bridge/',
      '**/*.js',
      '**/*.sh',
    ],
  },
)
