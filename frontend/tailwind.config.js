/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        background: {
          orange: "#fece4c",
          lightOrange: "#ffe9ad",
          blue: "#f3fcfe",
        },
      },
      animation: {
        fadeIn: "fadeIn 0.5s ease-in-out forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
