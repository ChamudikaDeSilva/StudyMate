const palette = require('./src/constants/themePalette.json');
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        brand: palette.brand,
        indigo: palette.brand,
        slate: palette.neutral,
        canvas: palette.neutral[50],
        ink: palette.neutral[900],
        muted: palette.neutral[500],
        line: palette.neutral[200],
      },
    },
  },
  plugins: [],
};
