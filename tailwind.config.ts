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
          50: '#F4F1DE',   // Eggshell
          100: '#F2CC8F',   // Apricot Cream
          200: '#E07A5F',   // Burnt Peach
          300: '#81B29A',   // Muted Teal
          400: '#3D405B',   // Twilight Indigo
          500: '#E07A5F',   // Burnt Peach (main)
          600: '#3D405B',   // Twilight Indigo (dark)
          700: '#2D3142',   // Darker indigo
          800: '#1E2130',   // Darkest indigo
          900: '#0F1118',   // Almost black
        },
        accent: {
          eggshell: '#F4F1DE',
          apricot: '#F2CC8F',
          peach: '#E07A5F',
          teal: '#81B29A',
          indigo: '#3D405B',
        },
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}
export default config

