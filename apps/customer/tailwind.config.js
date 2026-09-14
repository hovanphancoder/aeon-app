/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        aeon: {
          primary: '#E40046',
          dark: '#C0003C',
          light: '#FFF0F3',
          accent: '#FF5C8D',
          gold: '#F6A623',
          gray: '#F8F9FA',
          charcoal: '#1F2937',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'aeon': '0 10px 25px -5px rgba(228, 0, 70, 0.2), 0 8px 10px -6px rgba(228, 0, 70, 0.2)',
        'card': '0 4px 20px rgba(0, 0, 0, 0.06)',
      },
      animation: {
        'pulse-subtle': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
