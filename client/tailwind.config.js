/** @type {import('tailwindcss').Config} */
module.exports = {
  //content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    '*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

