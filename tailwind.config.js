/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './booking_app/templates/**/*.html',
    './booking_app/static/js/**/*.js',
  ],
  theme: {
    extend: {
      colors: {
        base: '#000000', // Pure Black
        surface: '#0A0A0A', // Dark Obsidian Surface
        surfaceAlt: '#141414',
        deep: '#FFFFFF',
        line: 'rgba(255, 255, 255, 0.08)',
        lineFocus: 'rgba(30, 96, 255, 0.5)',
        muted: '#94A3B8',
        subtle: '#64748B',
        cobalt: {
          DEFAULT: '#1E60FF',
          400: '#3B82F6',
          500: '#1E60FF',
          600: '#1A4EDB',
          700: '#123A9E',
        },
        brand: {
          50: '#141414',
          100: 'rgba(30, 96, 255, 0.15)',
          200: 'rgba(30, 96, 255, 0.3)',
          300: 'rgba(30, 96, 255, 0.45)',
          400: '#3B82F6',
          500: '#1E60FF',
          600: '#1A4EDB',
          700: '#123A9E',
          800: '#0A0A0A',
          900: '#050505',
          950: '#000000',
        },
      },
      fontFamily: {
        cairo: ['Cairo', 'Alexandria', 'sans-serif'],
        alexandria: ['Alexandria', 'Cairo', 'sans-serif'],
        outfit: ['Outfit', 'Cairo', 'sans-serif'],
        body: ['Cairo', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Cairo', 'Alexandria', 'sans-serif'],
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '16px',
        xl: '20px',
        pill: '9999px',
      },
      maxWidth: {
        container: '1280px',
        content: '960px',
        modal: '480px',
        'modal-sm': '440px',
      },
      boxShadow: {
        subtle: '0 4px 24px rgba(0, 0, 0, 0.9)',
        card: '0 10px 30px rgba(0, 0, 0, 0.95), 0 0 1px rgba(255, 255, 255, 0.08)',
        active: '0 12px 35px rgba(30, 96, 255, 0.25), 0 0 0 1.5px #1E60FF',
      },
      animation: {
        'splash-pulse': 'splashPulse 2s infinite alternate ease-in-out',
        'pulse-dot': 'pulse 1.8s infinite',
        'rev-needle': 'egsRevNeedle 3.2s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite',
      },
      keyframes: {
        splashPulse: {
          '0%': { transform: 'scale(1)', boxShadow: '0 10px 35px rgba(0, 0, 0, 0.8)' },
          '100%': { transform: 'scale(1.02)', boxShadow: '0 14px 45px rgba(30, 96, 255, 0.3)' },
        },
        pulse: {
          '0%': { transform: 'scale(0.95)' },
          '70%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(0.95)' },
        },
        egsRevNeedle: {
          '0%': { transform: 'rotate(-50deg)' },
          '22%': { transform: 'rotate(38deg)' },
          '36%': { transform: 'rotate(10deg)' },
          '54%': { transform: 'rotate(42deg)' },
          '70%': { transform: 'rotate(-15deg)' },
          '86%': { transform: 'rotate(25deg)' },
          '100%': { transform: 'rotate(-50deg)' },
        },
      },
    },
  },
  plugins: [],
};