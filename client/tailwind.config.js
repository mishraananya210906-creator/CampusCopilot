/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Outfit', 'sans-serif'],
        sans: ['Plus Jakarta Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        brand: {
          bg: '#070913',
          card: '#0e1326',
          cardHover: '#141c38',
          border: '#1f294d',
        },
        nebius: {
          cyan: '#00f2fe',
          purple: '#9d4edd',
          emerald: '#10b981',
          amber: '#fbbf24',
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'mesh-glow': 'radial-gradient(circle at 50% 0%, rgba(120, 58, 237, 0.25) 0%, rgba(7, 9, 19, 0) 70%)',
      }
    },
  },
  plugins: [],
}
