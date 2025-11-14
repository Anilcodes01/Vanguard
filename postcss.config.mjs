const config = {
  theme: {
    extend: {
      animation: {
        'fade-in': 'fadeIn 0.7s ease-in-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
      },
    },
  },
  plugins: ["@tailwindcss/postcss"],
};

export default config;
