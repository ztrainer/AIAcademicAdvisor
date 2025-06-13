/** @type {import('tailwindcss').Config} */
export default {
  // This 'content' array tells Tailwind which files to scan for class names.
  // It's crucial for Tailwind to generate the necessary CSS for production.
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // This line ensures all your React component files are scanned
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
