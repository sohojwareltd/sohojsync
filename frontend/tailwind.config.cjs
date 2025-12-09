/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#22177A',        // Dark Royal Blue
        accent: '#605EA1',          // Soft Indigo
        muted: '#8EA3A6',           // Muted Teal Grey
        highlight: '#E6E9AF',       // Soft Pastel Yellow
        background: '#F7F7FB',      // Main content background
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
