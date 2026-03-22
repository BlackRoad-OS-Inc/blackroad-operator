module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'blackroad': {
          50: '#f5f7fa',
          100: '#ebeef3',
          500: '#6366f1',
          600: '#4f46e5',
          900: '#1e1b4b'
        }
      }
    }
  },
  plugins: []
}
