/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#0a0a0a',
          card: '#0f0f0f',
          hover: '#181818',
          border: '#252525',
        },
        accent: {
          DEFAULT: '#FFA300',
          light: '#FFB733',
          dim: '#7A4F00',
          glow: 'rgba(255,163,0,0.15)',
        },
        brand: {
          gold: '#FFA300',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        accent: '0 0 28px rgba(255,163,0,0.22)',
        card: '0 4px 32px rgba(0,0,0,0.7)',
        'card-hover': '0 8px 40px rgba(0,0,0,0.8)',
        'orange-glow': '0 0 50px rgba(255,163,0,0.10)',
      },
    },
  },
  plugins: [],
}
