/** @type {import('tailwindcss').Config} */
export default {
  // THIS LINE IS THE FIX: It tells Tailwind to scan these files
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        chantilly: {
          light: '#7B5EB3',
          DEFAULT: '#4B2E83',
          dark: '#2D1B50',
        },
        darkBg: '#0F172A',
      },
    },
  },
  plugins: [],
}
