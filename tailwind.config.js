/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        // Tokens map to CSS variables defined in src/index.css.
        // Light values live on :root, dark values on html.dark.
        bg: {
          deep: 'var(--bg-deep)',
          elev: 'var(--bg-elev)',
        },
        surface: {
          1: 'var(--surface-1)',
          2: 'var(--surface-2)',
          3: 'var(--surface-3)',
        },
        line: {
          1: 'var(--border-1)',
          2: 'var(--border-2)',
        },
        ink: {
          1: 'var(--text-1)',
          2: 'var(--text-2)',
          3: 'var(--text-3)',
        },
        accent: {
          violet: 'var(--accent-1)',
          cyan: 'var(--accent-2)',
        },
        ok: 'var(--ok)',
        warn: 'var(--warn)',
        err: 'var(--err)',
      },
      backgroundImage: {
        'accent-grad': 'var(--accent-grad)',
        'accent-grad-soft': 'var(--accent-grad-soft)',
      },
      boxShadow: {
        'glow-sm': 'var(--glow-sm)',
        'glow-md': 'var(--glow-md)',
        lift: 'var(--lift)',
        soft: 'var(--lift)', // legacy alias to ease migration
        card: 'var(--lift)', // legacy alias
      },
      borderRadius: {
        sm: '6px',
        md: '8px',
        lg: '10px',
        xl: '14px',
        '2xl': '18px',
      },
      keyframes: {
        bounceDot: {
          '0%, 80%, 100%': { transform: 'scale(0.6)', opacity: '0.6' },
          '40%': { transform: 'scale(1)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        tokenFade: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        haloPulse: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.8' },
          '50%': { transform: 'scale(1.08)', opacity: '0.3' },
        },
        orbDrift: {
          '0%, 100%': { transform: 'translate(0,0)' },
          '50%': { transform: 'translate(30px, 20px)' },
        },
        cursorBlink: {
          '50%': { opacity: '0' },
        },
      },
      animation: {
        bounceDot: 'bounceDot 1.2s infinite ease-in-out',
        fadeIn: 'fadeIn 0.25s ease-out both',
        tokenFade: 'tokenFade 80ms ease-out both',
        haloPulse: 'haloPulse 3s ease-in-out infinite',
        orbDrift1: 'orbDrift 12s ease-in-out infinite',
        orbDrift2: 'orbDrift 14s ease-in-out infinite reverse',
        cursorBlink: 'cursorBlink 1s steps(2) infinite',
      },
    },
  },
  plugins: [],
}
