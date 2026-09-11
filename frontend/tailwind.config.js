import type { Config } from 'tailwindcss';

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef0ff',
          100: '#e0e4ff',
          200: '#c6ccff',
          300: '#a3aaff',
          400: '#7f85ff',
          500: '#6366f1',
          600: '#5450e8',
          700: '#463fcb',
          800: '#3a37a3',
          900: '#333381',
          950: '#1e1d4b',
        },
        surface: {
          DEFAULT: '#ffffff',
          dark: '#0c0d12',
          panel: '#f7f7f9',
          'panel-dark': '#14161d',
          line: '#e7e7ec',
          'line-dark': '#23262f',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        soft: '0 1px 2px rgba(16, 17, 23, 0.04), 0 8px 24px -12px rgba(16, 17, 23, 0.12)',
        card: '0 1px 2px rgba(16, 17, 23, 0.05), 0 16px 40px -20px rgba(16, 17, 23, 0.18)',
        glow: '0 0 0 1px rgba(99, 102, 241, 0.25), 0 8px 30px -6px rgba(99, 102, 241, 0.45)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 55%, #a855f7 100%)',
        'hero-radial': 'radial-gradient(60% 50% at 50% 0%, rgba(99,102,241,0.14), transparent 70%)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in': 'fade-in 0.4s ease both',
        'scale-in': 'scale-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) both',
        shimmer: 'shimmer 1.5s infinite',
        float: 'float 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;