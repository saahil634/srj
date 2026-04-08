import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#102033",
        mist: "#edf3f9",
        slate: "#49617a",
        signal: "#0f6d67",
        ember: "#d97706",
      },
      boxShadow: {
        panel: "0 20px 50px rgba(16, 32, 51, 0.12)",
      },
      backgroundImage: {
        "grid-fade":
          "linear-gradient(to right, rgba(16, 32, 51, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(16, 32, 51, 0.05) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};

export default config;
