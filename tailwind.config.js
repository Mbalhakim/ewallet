const colors = require('tailwindcss/colors');
const defaultTheme = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    colors: {
      ditblue: {
        50: '#E6F3FF',
        100: '#B3CEE8',
        200: '#86ACD1',
        300: '#608DBA',
        400: '#3F71A2',
        500: '#0F4274',
        600: '#002F5D',
        700: '#002142',
        800: '#001326',
        900: '#000D1A'
      },
      transparent: 'transparent',
      current: 'currentColor',
      black: colors.black,
      white: colors.white,
      slate: colors.slate,
      gray: colors.gray,
      red: colors.red,
      green: colors.green,
      yellow: colors.yellow,
      blue: colors.blue
    },
    extend: {
      fontFamily: {
        anton: ['"Anton-Regular"']
      }
    }
  },
  plugins: [require('@tailwindcss/typography')],
  content: [
    './screens/**/*.tsx',
    './components/**/*.tsx',
    './navigation/**/*.tsx'
  ]
};
