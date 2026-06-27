/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0071e3',
        'primary-hover': '#0077ed',
        success: '#34c759',
        warning: '#ff9f0a',
        error: '#ff3b30',
      },
    },
  },
  plugins: [],
}
