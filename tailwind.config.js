/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'system-ui', 'sans-serif'],
        display: ['Cormorant Garamond', 'Georgia', 'serif'],
      },
      colors: {
        cream: '#faf8f5',
        sand: '#f0ebe3',
        charcoal: '#2c2926',
        ink: '#1a1816',
        gold: {
          DEFAULT: '#c9a227',
          light: '#e5d4a1',
          dark: '#b8860b',
        },
      },
      boxShadow: {
        'soft': '0 4px 24px -4px rgba(44, 41, 38, 0.08)',
        'card': '0 8px 32px -8px rgba(44, 41, 38, 0.12)',
        'elevated': '0 16px 48px -12px rgba(44, 41, 38, 0.15)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
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
      },
    },
  },
  plugins: [],
}
