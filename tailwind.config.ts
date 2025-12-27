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
          50: '#E8F4FA',   // Very light Rich Cerulean tint
          100: '#D1E9F5',   // Light Rich Cerulean tint
          200: '#A3D3EB',   // Lighter Rich Cerulean (hover states)
          300: '#75BDE1',   // Light Rich Cerulean
          400: '#4799D7',   // Medium Rich Cerulean (gradient middle)
          500: '#2274A5',   // Rich Cerulean (main)
          600: '#1B5C84',   // Darker Rich Cerulean (gradient end)
          700: '#144463',   // Dark Rich Cerulean
          800: '#0D2C42',   // Darker Rich Cerulean
          900: '#061421',   // Darkest Rich Cerulean
        },
        accent: {
          richCerulean: '#2274A5', // Rich Cerulean
          blazeOrange: '#F75C03',   // Blaze Orange
          brightAmber: '#F1C40F',   // Bright Amber
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

