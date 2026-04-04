
export default {
  content: [
    './app/**/*.{js,ts,vue}',
    './app/components/**/*.{js,ts,vue}',
    './app/pages/**/*.{js,ts,vue}',
    './app/layouts/**/*.{js,ts,vue}',
    './node_modules/@nuxt/ui/dist/**/*.{js,ts,vue}'
  ],
  theme: {
    extend: {
      colors: {
        // New Custom Brand Colors
        brand: {
          50: '#FEF7F3',    // Lighter Blushed Peach
          100: '#FCE4D6',   // Blushed Peach (Primary Background)
          200: '#FAD1B8',
          300: '#F7B39E',
          400: '#F59A86',
          500: '#E37D4D',   // Burnt Orange (Secondary - Accents)
          600: '#E37D4D',
          700: '#CC6B41',
          800: '#B45C36',
          900: '#9D502B',
          950: '#7D3F20',
        },
        // Primary colors - Cocoa Brown (Updated)
        primary: {
          50: '#F8F4F1',
          100: '#F0E8E3',
          200: '#E8DEDB',
          300: '#E0D4D3',
          400: '#D8C9CB',
          500: '#D8A48F',   // Dusty Rose (Secondary Action)
          600: '#C99580',
          700: '#B98671',
          800: '#A97762',
          900: '#996853',
          950: '#5D3A2D',   // Cocoa Brown (Primary Action)
        },
        // Secondary colors - Burnt Orange variations
        secondary: {
          50: '#FEF7F3',
          100: '#FCE4D6',
          200: '#FAD1B8',
          300: '#F7B39E',
          400: '#F59A86',
          500: '#E37D4D',
          600: '#CC6B41',
          700: '#B45C36',
          800: '#9D502B',
          900: '#7D3F20',
          950: '#5D2F18',
        },
        // ...existing code...
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        // Danger colors - Red
        danger: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#450a0a',
        },
        // Warning colors - Amber
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
        // Info colors - Cyan
        info: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        // Neutral/gray scale
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0a0a0a',
        }
      }
    }
  }
}

