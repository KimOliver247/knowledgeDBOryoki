/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#59140b',
        'primary-hover': '#6b1a0f'
      },
      fontFamily: {
        sans: ['"niveau-grotesk"', 'sans-serif']
      }
    },
  },
  plugins: [],
};