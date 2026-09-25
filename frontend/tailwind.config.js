/**
 * Design tokens for MyPDFTools.
 *
 * Colour values are declared as CSS custom properties in `src/index.css` so a
 * single semantic class (e.g. `bg-surface`, `text-ink-muted`) resolves
 * correctly in both light and dark mode. Channels are stored space separated
 * so Tailwind's opacity modifier keeps working.
 */
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: 'rgb(var(--c-canvas) / <alpha-value>)',
        surface: {
          DEFAULT: 'rgb(var(--c-surface) / <alpha-value>)',
          muted: 'rgb(var(--c-surface-muted) / <alpha-value>)',
        },
        line: {
          DEFAULT: 'rgb(var(--c-line) / <alpha-value>)',
          strong: 'rgb(var(--c-line-strong) / <alpha-value>)',
        },
        ink: {
          DEFAULT: 'rgb(var(--c-ink) / <alpha-value>)',
          muted: 'rgb(var(--c-ink-muted) / <alpha-value>)',
          subtle: 'rgb(var(--c-ink-subtle) / <alpha-value>)',
          inverse: 'rgb(var(--c-ink-inverse) / <alpha-value>)',
        },
        accent: {
          DEFAULT: 'rgb(var(--c-accent) / <alpha-value>)',
          strong: 'rgb(var(--c-accent-strong) / <alpha-value>)',
          soft: 'rgb(var(--c-accent-soft) / <alpha-value>)',
          fg: 'rgb(var(--c-accent-fg) / <alpha-value>)',
        },
        positive: {
          DEFAULT: 'rgb(var(--c-positive) / <alpha-value>)',
          soft: 'rgb(var(--c-positive-soft) / <alpha-value>)',
        },
        caution: {
          DEFAULT: 'rgb(var(--c-caution) / <alpha-value>)',
          soft: 'rgb(var(--c-caution-soft) / <alpha-value>)',
        },
        critical: {
          DEFAULT: 'rgb(var(--c-critical) / <alpha-value>)',
          soft: 'rgb(var(--c-critical-soft) / <alpha-value>)',
        },
      },
      fontFamily: {
        sans: [
          '"Inter Variable"',
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          '"Segoe UI"',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem', letterSpacing: '0.04em' }],
        display: ['clamp(2.35rem, 1.6rem + 3.1vw, 3.75rem)', { lineHeight: '1.04', letterSpacing: '-0.028em' }],
        headline: ['clamp(1.6rem, 1.25rem + 1.2vw, 2.15rem)', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
        title: ['1.125rem', { lineHeight: '1.5', letterSpacing: '-0.01em' }],
      },
      spacing: {
        // 0.5-step beyond Tailwind's default scale, used for compact icon tiles.
        '4.5': '1.125rem',
      },
      borderRadius: {
        xs: '4px',
        sm: '6px',
        DEFAULT: '8px',
        md: '10px',
        lg: '14px',
        xl: '18px',
        '2xl': '24px',
      },
      boxShadow: {
<<<<<<< HEAD
        soft: '0 1px 2px rgba(16, 17, 23, 0.04), 0 8px 24px -12px rgba(16, 17, 23, 0.12)',
        card: '0 1px 2px rgba(16, 17, 23, 0.05), 0 16px 40px -20px rgba(16, 17, 23, 0.18)',
        glow: '0 0 0 1px rgba(99, 102, 241, 0.25), 0 8px 30px -6px rgba(99, 102, 241, 0.45)',
        'glow-sm': '0 0 0 1px rgba(99, 102, 241, 0.15), 0 4px 16px -4px rgba(99, 102, 241, 0.3)',
        elevated: '0 4px 6px -1px rgba(0,0,0,0.05), 0 20px 50px -12px rgba(0,0,0,0.15)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 55%, #a855f7 100%)',
        'brand-gradient-subtle': 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(139,92,246,0.08) 100%)',
        'hero-radial': 'radial-gradient(60% 50% at 50% 0%, rgba(99,102,241,0.14), transparent 70%)',
        'hero-mesh':
          'radial-gradient(ellipse at 20% 50%, rgba(99,102,241,0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(139,92,246,0.08) 0%, transparent 50%)',
        'card-gradient': 'linear-gradient(135deg, rgba(99,102,241,0.06) 0%, rgba(139,92,246,0.04) 100%)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
=======
        hairline: '0 1px 0 0 rgb(var(--c-line) / 1)',
        raised: '0 1px 2px rgb(16 17 20 / 0.04), 0 8px 24px -16px rgb(16 17 20 / 0.18)',
        pop: '0 2px 4px rgb(16 17 20 / 0.05), 0 20px 44px -24px rgb(16 17 20 / 0.28)',
      },
      transitionTimingFunction: {
        out: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
>>>>>>> 5d0f9ee86c7ec7d9c5a0815445eb7297e97c22eb
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        rise: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-down': {
          '0%': { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.985)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
<<<<<<< HEAD
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(12px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(1)', opacity: '0.6' },
          '100%': { transform: 'scale(1.4)', opacity: '0' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-2deg)' },
          '50%': { transform: 'rotate(2deg)' },
        },
        'progress-indeterminate': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(400%)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in': 'fade-in 0.3s ease both',
        'fade-down': 'fade-down 0.3s cubic-bezier(0.16, 1, 0.3, 1) both',
        'scale-in': 'scale-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) both',
        'slide-in-right': 'slide-in-right 0.3s cubic-bezier(0.16, 1, 0.3, 1) both',
        shimmer: 'shimmer 1.5s infinite',
        float: 'float 6s ease-in-out infinite',
        'pulse-ring': 'pulse-ring 1.5s cubic-bezier(0.215, 0.61, 0.355, 1) infinite',
        wiggle: 'wiggle 0.5s ease-in-out',
        'progress-indeterminate': 'progress-indeterminate 1.5s ease-in-out infinite',
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.16, 1, 0.3, 1)',
=======
        'indeterminate': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(300%)' },
        },
        'sheen': {
          '0%, 100%': { opacity: '0.35' },
          '50%': { opacity: '0.8' },
        },
      },
      animation: {
        'fade-in': 'fade-in 200ms ease-out both',
        rise: 'rise 320ms cubic-bezier(0.16, 1, 0.3, 1) both',
        'scale-in': 'scale-in 200ms cubic-bezier(0.16, 1, 0.3, 1) both',
        indeterminate: 'indeterminate 1.4s cubic-bezier(0.65, 0, 0.35, 1) infinite',
        sheen: 'sheen 2.6s ease-in-out infinite',
>>>>>>> 5d0f9ee86c7ec7d9c5a0815445eb7297e97c22eb
      },
    },
  },
  plugins: [],
};
