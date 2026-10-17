/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Soft, pastel mint palette — gentle, accessible, low-saturation
        mint: {
          50: '#f4faf6',
          100: '#e3f1e8',
          200: '#c9e2d3',
          300: '#a4cdb5',
          400: '#7bb392',
          500: '#5a9a78',
          600: '#427d60',
          700: '#35644e',
          800: '#2c5241',
          900: '#264438',
        },
        cream: {
          50: '#fdfcf8',
          100: '#faf7ee',
          200: '#f3ecd5',
        },
        clay: {
          400: '#c98a6f',
          500: '#b67356',
          600: '#9a5d44',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}