import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/**/*.{ts,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ─── Brand Colors ──────────────────────
        brand: {
          50:  '#f0f5ff',
          100: '#dce8ff',
          200: '#b3cfff',
          300: '#8ab5ff',
          400: '#6199ff',
          500: '#3d7aff',
          600: '#2560f0',
          700: '#1a4cd4',
          800: '#1238a8',
          900: '#0d297a',
          950: '#081a52',
        },
        // ─── Surface Colors (Dark Theme) ───────
        surface: {
          0:   '#09090b',  // App background
          50:  '#111113',  // Card background
          100: '#18181b',  // Elevated surface
          200: '#1f1f23',  // Hover states
          300: '#27272a',  // Borders
          400: '#3f3f46',  // Subtle borders
          500: '#52525b',  // Muted text
          600: '#71717a',  // Secondary text
          700: '#a1a1aa',  // Body text
          800: '#d4d4d8',  // Primary text
          900: '#fafafa',  // Headings
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.2s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

export default config;