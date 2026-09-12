/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary:    '#6366f1',
        'primary-lt':'#818cf8',
        accent:     '#f59e0b',
        'bg-deep':  '#0a0a0f',
        'bg-card':  '#111118',
        'bg-surface':'#16161f',
        'text-hi':  '#f1f5f9',
        'text-mid': '#94a3b8',
        'text-lo':  '#475569',
        // keep these for any legacy refs
        secondary:  '#7b2cbf',
      },
      fontFamily: {
        poppins:  ['var(--font-poppins)',  'sans-serif'],
        rajdhani: ['var(--font-rajdhani)', 'sans-serif'],
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          from: { backgroundPosition: '-200% center' },
          to:   { backgroundPosition:  '200% center' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        shimmer:   'shimmer 4s linear infinite',
      },
    },
  },
  plugins: [],
};
