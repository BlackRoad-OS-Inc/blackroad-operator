import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        'br-orange': '#FF9D00',
        'br-red': '#FF006B',
        'br-purple': '#7700FF',
        'br-blue': '#0066FF',
      },
    },
  },
  plugins: [],
};

export default config;
