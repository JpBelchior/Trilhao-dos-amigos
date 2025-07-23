/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        trilhao: {
          green: "#1a5f3f", // Verde customizado para o Trilhão
          orange: "#ea580c", // Laranja customizado
        },
      },
      fontFamily: {
        trilhao: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
