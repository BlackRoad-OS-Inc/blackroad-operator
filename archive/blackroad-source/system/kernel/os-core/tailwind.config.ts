import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        roadwork: {
          orange: '#FF6B00',
          pink: '#FF0066',
        },
        blackroad: {
          red: '#FF9D00',
          orange: '#FF6B00',
          pink: '#FF0066',
          magenta: '#FF006B',
          purple: '#D600AA',
          violet: '#7700FF',
          blue: '#0066FF',
        },
      },
      backgroundImage: {
        'roadwork-gradient': 'linear-gradient(135deg, #FF6B00 0%, #FF0066 100%)',
        'blackroad-gradient': 'linear-gradient(135deg, #FF9D00 0%, #FF6B00 14%, #FF0066 28%, #FF006B 42%, #D600AA 57%, #7700FF 71%, #0066FF 100%)',
      },
    },
  },
  plugins: [],
}
export default config
