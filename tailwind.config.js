/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      // You can extend your theme here (e.g., add your custom orange/blue colors)
      colors: {
        primary: "#2563eb", // Your Electric Blue
        secondary: "#fbbf24", // Your Gold
      },
    },
  },
  plugins: [],
};
