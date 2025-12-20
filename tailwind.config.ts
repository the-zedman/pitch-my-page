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
        primary: {
          50: '#f0f4ff',
          100: '#e0e9ff',
          200: '#c7d7fe',
          300: '#a5b9fc',
          400: '#8193f8',
          500: '#667eea',
          600: '#764ba2',
          700: '#5b4b7a',
          800: '#4a3f5f',
          900: '#3d3549',
        },
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}
export default config

