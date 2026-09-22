/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#1A1610",
        inkSoft: "#3B372E",
        muted: "#5B5648",
        faint: "#8A8578",
        line: "#D9D2BF",
        lineSoft: "#E7E2D6",
        rowHover: "#F9F7F1",
        paper: "#F3EFE4",
        card: "#FBF9F3",
        navy: "#1A2B3D",
        navyText: "#F3EFE4",
        navySoft: "#8FA8BC",
        amber: { DEFAULT: "#E8A33D", hover: "#D9932E" },
        blue: { DEFAULT: "#2B4C6F", hover: "#213C58" },
        teal: "#3F7A6E",
        rust: "#C4432A",
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
        display: ['"Space Grotesk"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
