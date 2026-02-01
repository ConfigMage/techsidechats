import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        cream: {
          50: "#FDFBF7",
          100: "#FAF6ED",
          200: "#F5EDDB",
        },
        charcoal: {
          DEFAULT: "#2D2A26",
          light: "#4A4640",
        },
        amber: {
          accent: "#C4956A",
          light: "#D4A574",
          dark: "#A67B4F",
        },
        warmgray: {
          DEFAULT: "#8B8680",
          light: "#A9A49E",
          dark: "#6B6660",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        serif: ["var(--font-lora)", "Georgia", "serif"],
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: "680px",
            lineHeight: "1.8",
          },
        },
      },
    },
  },
  plugins: [],
};

export default config;
