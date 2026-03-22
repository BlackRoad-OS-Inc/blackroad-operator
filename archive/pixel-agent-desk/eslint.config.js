const js = require('@eslint/js');

module.exports = [
  // Shared base config
  {
    ...js.configs.recommended,
    rules: {
      ...js.configs.recommended.rules,
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-empty': ['warn', { allowEmptyCatch: false }],
      'eqeqeq': ['warn', 'smart'],
    },
  },

  // Node.js (main process)
  {
    files: ['src/main.js', 'src/main/**/*.js', 'src/agentManager.js', 'src/dashboardAdapter.js',
            'src/dashboard-server.js', 'src/sessionScanner.js', 'src/heatmapScanner.js',
            'src/pricing.js', 'src/errorHandler.js', 'src/errorConstants.js', 'src/errorMessages.js',
            'src/utils.js', 'src/hook.js', 'src/sessionend_hook.js', 'src/install.js',
            'src/preload.js', 'src/dashboardPreload.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: {
        require: 'readonly',
        module: 'readonly',
        exports: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        process: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        Buffer: 'readonly',
        URL: 'readonly',
        Map: 'readonly',
        Set: 'readonly',
        Promise: 'readonly',
      },
    },
  },

  // Browser (renderer + office) — scripts share global scope via <script> tags
  {
    files: ['src/renderer/**/*.js', 'src/office/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      globals: {
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        requestAnimationFrame: 'readonly',
        cancelAnimationFrame: 'readonly',
        HTMLCanvasElement: 'readonly',
        Image: 'readonly',
        Map: 'readonly',
        Set: 'readonly',
        Promise: 'readonly',
        fetch: 'readonly',
        EventSource: 'readonly',
        performance: 'readonly',
        Audio: 'readonly',
      },
    },
    rules: {
      'no-undef': 'off', // scripts share global scope, cross-file refs are expected
    },
  },

  // Test files
  {
    files: ['__tests__/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: {
        require: 'readonly',
        module: 'readonly',
        exports: 'readonly',
        __dirname: 'readonly',
        process: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        Map: 'readonly',
        Set: 'readonly',
        Promise: 'readonly',
        describe: 'readonly',
        test: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        jest: 'readonly',
      },
    },
  },

  // Ignore patterns
  {
    ignores: ['node_modules/**', 'coverage/**', 'release/**', 'public/**', '*.html'],
  },
];
