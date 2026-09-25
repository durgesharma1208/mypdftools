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
        mono: [
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          '"Liberation Mono"',
          '"Courier New"',
          'monospace',
        ],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '0.9375rem' }],
        display: ['2.25rem', { lineHeight: '2.625rem', letterSpacing: '-0.025em' }],
        headline: ['1.75rem', { lineHeight: '2.125rem', letterSpacing: '-0.02em' }],
        title: ['1.25rem', { lineHeight: '1.625rem', letterSpacing: '-0.015em' }],
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
        hairline: '0 1px 0 0 rgb(var(--c-line) / 1)',
        raised: '0 1px 2px rgb(16 17 20 / 0.04), 0 8px 24px -16px rgb(16 17 20 / 0.18)',
        pop: '0 2px 4px rgb(16 17 20 / 0.05), 0 20px 44px -24px rgb(16 17 20 / 0.28)',
      },
      transitionTimingFunction: {
        out: 'cubic-bezier(0.16, 1, 0.3, 1)',
        spring: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
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
        indeterminate: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(300%)' },
        },
        sheen: {
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
      },
    },
  },
  plugins: [],
};
