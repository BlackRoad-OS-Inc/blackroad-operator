/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './docs/**/*.{md,mdx}', './docusaurus.config.ts'],
  theme: {
    extend: {
      colors: {
        brand: {
          ink: 'var(--br-brand-ink)',
          surface: 'var(--br-brand-surface)',
          accent: 'var(--br-brand-accent)',
          glow: 'var(--br-brand-glow)',
        },
      },
    },
  },
  darkMode: 'class',
  plugins: [],
};
