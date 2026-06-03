/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        law: {
          50:  '#f0f4ff',
          100: '#dce6ff',
          200: '#b9ceff',
          600: '#3b5bdb',
          700: '#2f4ac4',
          800: '#243ba0',
        },
      },
    },
  },
  plugins: [],
};

