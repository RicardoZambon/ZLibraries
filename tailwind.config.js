const colors = require('tailwindcss/colors');

module.exports = {
  content: [
    './apps/**/*.{html,ts,scss}',
    './libs/**/*.{html,ts,scss,stories.ts}',
  ],
  theme: {
    extend: {
      colors: {
        'primary': {
          50: '#e6f4ff',
          100: '#9acaed',
          200: '#59a5db',
          300: '#2585c8',
          400: '#006bb6',
          500: '#005794',
          600: '#004372',
          700: '#002f50',
          800: '#001b2f',
          900: '#00070d',
        }
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};
