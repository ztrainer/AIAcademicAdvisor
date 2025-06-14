/** @type {import('tailwindcss').Config} */
export default {
  content: [
    // This is crucial: it tells Tailwind to scan your index.html
    // which might contain classes or references to where React injects its app.
    "./index.html",
    // This line tells Tailwind to scan ALL JavaScript, TypeScript, JSX, and TSX files
    // within your 'src' directory and ANY of its subdirectories.
    // This is where your React components with Tailwind classes are.
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/tailwind_input.css", // Add this line for completeness, though it may not be strictly necessary
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}