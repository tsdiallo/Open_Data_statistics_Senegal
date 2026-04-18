/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{astro,html,js,jsx,ts,tsx,md,mdx}"],
  theme: {
    extend: {
      colors: {
        paper: "#FAFAF5",
        line: "#E8E4D6",
        sand: {
          50: "#FAFAF5",
          100: "#F2EEE2",
          200: "#E4DCC4",
        },
        baobab: {
          600: "#0F8A5B",
          700: "#0A7B4F",
          800: "#07573A",
        },
        sun: {
          500: "#F4C430",
          600: "#D4A71F",
        },
        flag: {
          green: "#0A7B4F",
          yellow: "#F4C430",
          red: "#B91C2C",
        },
        ink: {
          900: "#0D1B10",
          700: "#3A4539",
          500: "#6B7268",
          400: "#9AA198",
        },
      },
      fontFamily: {
        sans: ['"Inter"', "system-ui", "-apple-system", "sans-serif"],
        display: ['"Instrument Serif"', "Georgia", "serif"],
      },
      letterSpacing: {
        tightest: "-0.035em",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(13,27,16,.04), 0 8px 24px -12px rgba(13,27,16,.08)",
      },
      maxWidth: {
        prose: "68ch",
      },
    },
  },
  plugins: [],
};
