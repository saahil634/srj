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
        ink: "#231b17",
        mist: "#efe4d6",
        slate: "#6f5f50",
        signal: "#6f7a44",
        ember: "#b86d32",
      },
      boxShadow: {
        panel: "0 20px 50px rgba(35, 27, 23, 0.14)",
      },
      backgroundImage: {
        "grid-fade":
          "linear-gradient(to right, rgba(35, 27, 23, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(35, 27, 23, 0.05) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};

export default config;
