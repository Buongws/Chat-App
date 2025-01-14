import tailwindScrollbar from "tailwind-scrollbar";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        Green: "#1fdf64",
        Black: "#000",
        DeepNightBlack: "#121212",
        MidNightBlack: "#181818",
        EveningBlack: "#1a1a1a",
        DarkGray: "#282828",
        SlateGray: "#404040",
        LightGray: "#959595",
        SilverGray: "#B3B3B3",
        Snow: "#ffffff",
        DiscordPurple: "#5865f2",
        DiscordPurpleDark: "#505ef2", 
        LoginGray: "#313338",
        InputFieldDark: "#1e1f22",
      },
      fontFamily: {
        cairoRegular: ["cairo-regular", "sans-serif"],
      },
    },
  },
  plugins: [tailwindScrollbar],
};
