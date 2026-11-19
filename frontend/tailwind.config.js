/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#f4f7f4',
          100: '#e5ece5',
          200: '#ceddce',
          300: '#abc4ab',
          400: '#7fa480',
          500: '#5e855f',
          600: '#486b49',
          700: '#3a553c',
          800: '#263b27',
          900: '#1e3220',
          950: '#0f1c10',
        },
        agri: {
          50: '#f6f9ee',
          100: '#eaf2d7',
          200: '#d7e7b3',
          300: '#bfd885',
          400: '#a7c65b',
          500: '#8ba93d',
          600: '#6c862d',
          700: '#536725',
          800: '#445322',
          900: '#3a471f',
        },
        sand: '#f8faf5',
        earth: '#2e382e',
      },
    },
  },
  plugins: [],
}
