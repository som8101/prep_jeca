import type { Config } from "tailwindcss";
const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./context/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: { extend: { colors: { ink: "#070b14", panel: "#0d1422", line: "#202b3e", electric: "#4f8cff" }, boxShadow: { glow: "0 0 50px rgba(79,140,255,.14)" } } },
  plugins: []
};
export default config;