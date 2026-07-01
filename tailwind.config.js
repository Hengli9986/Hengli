/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#E85D4E',
          light: '#FFF5F3',
          dark: '#D45040',
        },
        ink: {
          DEFAULT: '#1a1a2e',
          light: '#252540',
          softer: '#3d3d5c',
        },
        surface: {
          DEFAULT: '#F8F7F4',
          warm: '#F5F0EB',
          cream: '#FFFBF7',
        },
        primary: '#E85D4E',
        'primary-hover': '#D45040',
        success: '#00C9A7',
        'success-light': '#E6FAF5',
        warning: '#FFB800',
        'warning-light': '#FFF8E6',
        error: '#FF4757',
        'error-light': '#FFF0F1',
        info: '#4A90D9',
        'info-light': '#EDF4FC',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'PingFang SC', 'Microsoft YaHei', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0,0,0,0.04)',
        'card': '0 4px 16px rgba(0,0,0,0.06)',
        'card-hover': '0 8px 32px rgba(0,0,0,0.12)',
        'glow': '0 0 20px rgba(232,93,78,0.15)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.25rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
}
