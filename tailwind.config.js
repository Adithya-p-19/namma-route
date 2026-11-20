/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: 'rgb(var(--paper) / <alpha-value>)',
        ink: 'rgb(var(--ink) / <alpha-value>)',
        card: 'rgb(var(--card) / <alpha-value>)',
        raise: 'rgb(var(--raise) / <alpha-value>)',
        muted: 'rgb(var(--muted) / <alpha-value>)',
        line: 'rgb(var(--line) / <alpha-value>)',
        metro: 'rgb(var(--metro) / <alpha-value>)',
        bus: 'rgb(var(--bus) / <alpha-value>)',
        auto: '#F5C400',
        autog: '#1E8E3E',
        pin: '#E11D48',
      },
      fontFamily: {
        display: ['Sora', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
        sans: ['Manrope', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
