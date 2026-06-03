/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9f9',
          100: '#e0f2f2',
          200: '#c0e5e5',
          300: '#a0d8d8',
          400: '#80cbcb',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0a7364',
          800: '#065f50',
          900: '#034e41',
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
      },
      borderRadius: {
        lg: '0.5rem',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      },
      animation: {
        'spin-slow': 'spin 2s linear infinite',
      },
    },
  },
  plugins: [],
};
