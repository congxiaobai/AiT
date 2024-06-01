const {nextui} = require("@nextui-org/react");

/** @type {import('tailwindcss').Config} */


module.exports = {
  content: [
    './src/**/*.{html,js,ts,jsx,tsx}', 
    './public/**/*.{html}', 
     "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
     "./node_modules/tw-noti/**/*.{js,ts,jsx,tsx}",
     
],
  theme: {
    extend: {},
  },
  darkMode: "class",
  plugins: [nextui()],
}

