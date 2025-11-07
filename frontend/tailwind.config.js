/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1a237e',
          light: '#534bae',
          dark: '#000051',
        },
        secondary: {
          DEFAULT: '#0d47a1',
          light: '#5472d3',
          dark: '#002171',
        },
        success: '#2e7d32',
        warning: '#f57c00',
        danger: '#c62828',
        info: '#0288d1',
      },
    },
  },
  plugins: [],
}
