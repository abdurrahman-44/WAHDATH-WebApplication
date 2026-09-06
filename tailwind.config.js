/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Core palette — deep mosque-tile emerald + warm brass, not the default
        // cream/terracotta or near-black/neon AI palettes.
        ink: {
          DEFAULT: '#10201A',
          soft: '#3A4A42'
        },
        emerald: {
          50: '#EAF4EF',
          100: '#CFE6D9',
          400: '#1C7A5D',
          600: '#146C4B',
          900: '#0F3D2E'
        },
        brass: {
          400: '#C9A05C',
          600: '#B98A3D'
        },
        parchment: {
          DEFAULT: '#F6F8F5',
          card: '#FFFFFF'
        },
        night: {
          DEFAULT: '#0B1512',
          card: '#12211B',
          line: '#1D2E27'
        }
      },
      fontFamily: {
        display: ['"Fraunces"', 'ui-serif', 'Georgia', 'serif'],
        sans: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        arabic: ['"Amiri Quran"', '"Scheherazade New"', 'serif']
      },
      borderRadius: {
        card: '20px',
        pill: '999px'
      }
    }
  },
  plugins: []
}
