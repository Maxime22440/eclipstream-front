/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Lato', 'sans-serif'],  // Police par défaut pour tout le projet
        logo: ['"Open Sans"', 'sans-serif'],       // Police spéciale pour le titre de l'application
      },
      colors: {
        'main-green': '#00CC9B',
        'off-white': '#ececec',
      },
    },
    screens: {
      'xl-custom': '1100px', // Sidebar breakpoint
    },
  },
  plugins: [],
}

