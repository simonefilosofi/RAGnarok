/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0f4ff",
          100: "#dbe4ff",
          500: "#4f72f5",
          600: "#3b5fe8",
          700: "#2d4fd4",
        },
      },
    },
  },
  plugins: [],
};
