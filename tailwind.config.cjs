/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#0f67fe',
        primaryDark: '#0043c5',
        accent: '#22c55e',
        accentSoft: '#dcfce7',
        muted: '#6b7280'
      },
      boxShadow: {
        'card': '0 20px 45px rgba(15, 23, 42, 0.08)'
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem'
      }
    }
  },
  plugins: []
};