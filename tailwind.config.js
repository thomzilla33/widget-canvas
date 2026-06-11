/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        aims: {
          dark: '#0D0E12', // Topbar + sidebar background
          sidebar: '#13151A', // Sidebar
          nav: '#1A1D24', // Nav hover
          border: '#2A2D35', // Dark border
          blue: '#2563EB', // Primary blue
          'blue-dark': '#1F3864', // Dark blue
          'blue-mid': '#2E75B6', // Mid blue
          'blue-light': '#D6E4F0', // Light blue
          governed: '#16A34A', // Governed metric green
          ungoverned: '#D97706', // Ungoverned metric amber
          fresh: '#16A34A', // Fresh timestamp
          aging: '#D97706', // Aging timestamp
          stale: '#DC2626', // Stale timestamp
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
