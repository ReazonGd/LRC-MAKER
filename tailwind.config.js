/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
  darkMode: ["selector", '[data-mode="dark"]'],
  theme: {
    extend: {
      colors: {
        1: "#5A7D7C", // dark
        2: "#fff", // light secondary
        3: "#232C33", // dark
        4: "#5E548E", // light primary
        5: "#101316", // dark
        6: "#231942", // light
        7: "#F7F5FB", // light bg
      },
    },
    fontFamily: {
      body: ["Lexend", "sans-serif"],
    },
  },
  plugins: [],
};
