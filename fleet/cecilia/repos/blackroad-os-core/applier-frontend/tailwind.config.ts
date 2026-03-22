import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        'applier-orange': '#FF9D00',
        'applier-orange-bright': '#FF6B00',
        'applier-pink': '#FF0066',
        'applier-pink-alt': '#FF006B',
        'applier-purple': '#D600AA',
        'applier-purple-deep': '#7700FF',
        'applier-blue': '#0066FF',
      },
    },
  },
  plugins: [],
};

export default config;
