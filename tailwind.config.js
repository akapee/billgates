/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        navy: {
          50:  '#f0f4ff',
          100: '#e0e9ff',
          200: '#c0d3ff',
          300: '#93b4fd',
          400: '#6090fa',
          500: '#3b6ef6',
          600: '#2350eb',
          700: '#1a3dd4',
          800: '#1e2f6e',
          850: '#172454',
          900: '#0f1a3e',
          950: '#0a1128',
        },
        bpjs: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        slate: {
          850: '#1a2234',
        },
        risk: {
          critical: '#ef4444',
          'critical-bg': '#fef2f2',
          high: '#f97316',
          'high-bg': '#fff7ed',
          medium: '#eab308',
          'medium-bg': '#fefce8',
          low: '#22c55e',
          'low-bg': '#f0fdf4',
        },
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 12px 0 rgba(0,0,0,0.10), 0 2px 6px -1px rgba(0,0,0,0.06)',
        'sidebar': '2px 0 12px 0 rgba(0,0,0,0.15)',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      screens: {
        'xs': '480px',
      },
    },
  },
  plugins: [],
}
