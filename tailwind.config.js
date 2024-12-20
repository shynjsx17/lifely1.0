/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        'system-background': "url('./Images/BG.png')",
      },
      fontFamily: {
        'poppins': ['poppins', 'san-serif']
      },
    },
  },
  plugins: [],
}

