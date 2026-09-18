/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Urbanist', 'sans-serif'],
        mono: ['Roboto Mono', 'monospace'],
      },
      colors: {
        // Primario — brand navy
        navy: {
          DEFAULT: '#03246B',
          50:  '#E8EDF8',
          100: '#C6D2EC',
          200: '#8FA8D5',
          300: '#5880BE',
          400: '#2D5991',
          500: '#03246B',
          600: '#021C53',
          700: '#01133B',
          800: '#010D2A',
          900: '#000714',
        },
        // Accent — golden
        gold: {
          DEFAULT: '#F8BD26',
          light:   '#FEDE81',
          dark:    '#D9970A',
        },
        // Éxito / Disponible / Pagado
        success: {
          DEFAULT: '#10B981',
          light:   '#34D399',
          dark:    '#059669',
        },
        // Alerta / Gastado / Pendiente
        alert: {
          DEFAULT: '#F59E0B',
          light:   '#FCD34D',
          dark:    '#D97706',
        },
        // Peligro / Límite crítico
        danger: {
          DEFAULT: '#DC2626',
          light:   '#F87171',
          dark:    '#B91C1C',
        },
      },
      borderRadius: {
        card: '1rem',
      },
      boxShadow: {
        glow:    '0 24px 80px rgba(15, 23, 42, 0.18)',
        card:    '0 4px 24px rgba(10, 25, 47, 0.35)',
        success: '0 0 20px rgba(16, 185, 129, 0.25)',
        danger:  '0 0 20px rgba(220, 38, 38, 0.25)',
      },
    },
  },
  plugins: [],
}
