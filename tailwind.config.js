/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./pages/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        boya: {
          blush: "#f7f9ff",
          cocoa: "#34457b",
          cream: "#ffffff",
          ink: "#253152",
          line: "#d7e0f0",
          mist: "#f2f6fc",
          navy: "#202553",
          sand: "#e8eef8",
        },
      },
      fontFamily: {
        sans: [
          "Avenir Next",
          "Hiragino Sans",
          "Hiragino Kaku Gothic ProN",
          "Yu Gothic",
          "Noto Sans JP",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
