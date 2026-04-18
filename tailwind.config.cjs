/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{astro,html,js,jsx,ts,tsx,md,mdx}"],
  theme: {
    extend: {
      colors: {
        sand: {
          50: "#fbf7f0",
          100: "#f4ebd9",
          200: "#e6d3a8",
        },
        baobab: {
          600: "#1f7a4d",
          700: "#155f3b",
          800: "#0f4a2e",
        },
        sun: {
          500: "#e8a33d",
          600: "#c9831f",
        },
        ink: {
          900: "#0f1115",
          700: "#3a3f4a",
          500: "#6b7280",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      maxWidth: {
        prose: "70ch",
      },
    },
  },
  plugins: [],
};
