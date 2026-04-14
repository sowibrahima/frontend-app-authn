/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './public/index.html',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#590D22',
          burgundy: '#590D22',
        },
        action: {
          gold: '#FFBA08',
        },
        neutral: {
          bg: '#FAFAF7',
          900: '#111827',
          500: '#6B7280',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        xl: '24px',
        '3xl': '48px',
      },
      transitionTimingFunction: {
        magnetic: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      },
      boxShadow: {
        premium: '0 4px 40px rgba(0,0,0,0.06)',
      },
    },
  },
  plugins: [],
};
