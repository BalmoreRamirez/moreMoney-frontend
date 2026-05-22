/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['Roboto Mono', 'monospace'],
      },
      colors: {
        // Primario — confianza institucional
        navy: {
          DEFAULT: '#0A192F',
          50:  '#E8EDF5',
          100: '#C6D2E5',
          200: '#8FA8C8',
          300: '#5880AD',
          400: '#2D5991',
          500: '#0A192F',
          600: '#081423',
          700: '#060F1A',
          800: '#040A12',
          900: '#020509',
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
