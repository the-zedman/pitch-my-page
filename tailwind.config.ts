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
          50: '#FEF5F3',   // Very light Spring Poppy tint
          100: '#FDE8E4',   // Light Spring Poppy tint
          200: '#FDD5CD',   // Lighter Spring Poppy (hover states)
          300: '#FCC2B6',   // Light Spring Poppy
          400: '#FCB2A9',   // Spring Poppy (gradient middle)
          500: '#FCB2A9',   // Spring Poppy (main)
          600: '#E89D94',   // Darker Spring Poppy (gradient end)
          700: '#D4887F',   // Dark Spring Poppy
          800: '#C0736A',   // Darker Spring Poppy
          900: '#AC5E55',   // Darkest Spring Poppy
        },
        accent: {
          ivory: '#FFFFF8',     // Ivory Crepe
          springPoppy: '#FCB2A9', // Spring Poppy
          englishPear: '#B0D5C0', // English Pear
          nimble: '#989CA0',     // Nimble
        },
        // Adding English Pear as a secondary color option
        secondary: {
          50: '#F0F7F3',
          100: '#E0EFE7',
          200: '#C1DFCF',
          300: '#B0D5C0',   // English Pear
          400: '#B0D5C0',   // English Pear
          500: '#B0D5C0',   // English Pear (main)
          600: '#9EC1AD',
          700: '#8CAD9A',
          800: '#7A9987',
          900: '#688574',
        },
        // Adding Nimble as a neutral gray
        neutral: {
          50: '#F5F5F6',
          100: '#EAEBEC',
          200: '#D5D7D8',
          300: '#BFC2C4',
          400: '#989CA0',   // Nimble
          500: '#989CA0',   // Nimble (main)
          600: '#7A7D81',
          700: '#5C5F62',
          800: '#3E4043',
          900: '#202224',
        },
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}
export default config

