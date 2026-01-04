/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './resources/**/*.{blade.php,js,jsx,ts,tsx}',
    './resources/js/legacy-spa/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Instrument Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        background: '#f5f6fa',
        foreground: '#1a1a1a',
        primary: 'rgb(89, 86, 157)',
        secondary: 'rgb(242, 82, 146)',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        card: '#ffffff',
      },
    },
  },
  plugins: [],
}
