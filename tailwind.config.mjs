/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx,svelte}'],
  theme: {
    extend: {
      colors: {
        pi: {
          // Deep purple palette — Pi Network brand
          950: '#0D0520',
          900: '#1A0B3B',
          800: '#2D1A6B',
          700: '#3D2490',
          600: '#5235B8',
          500: '#6B4ECC',
          400: '#8B72E0',
          300: '#B4A0F0',
          200: '#D6CCF7',
          100: '#EDE8FC',
        },
        gold: {
          // Pi Gold palette
          900: '#8A6200',
          700: '#C48A00',
          500: '#F5C518',
          300: '#FAE080',
          100: '#FEF9E2',
        },
        glass: {
          white: 'rgba(255,255,255,0.06)',
          border: 'rgba(245,197,24,0.18)',
          highlight: 'rgba(245,197,24,0.08)',
        },
      },
      fontFamily: {
        sans: ['"Space Grotesk"', '"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      backdropBlur: {
        glass: '16px',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.16,1,0.3,1) both',
        'fade-in': 'fadeIn 0.4s ease both',
      },
      keyframes: {
        float: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        glowPulse: {
          '0%,100%': { boxShadow: '0 0 20px rgba(245,197,24,0.2)' },
          '50%': { boxShadow: '0 0 40px rgba(245,197,24,0.5), 0 0 60px rgba(107,78,204,0.3)' },
        },
        slideUp: {
          from: { opacity: 0, transform: 'translateY(24px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
      },
    },
  },
  plugins: [],
};
