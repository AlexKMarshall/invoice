import fontMetrics from '@capsizecss/metrics/leagueSpartan'
import containerQueryPlugin from '@tailwindcss/container-queries'
import type { Config } from 'tailwindcss'
import defaultTheme from 'tailwindcss/defaultTheme.js'
import animatePlugin from 'tailwindcss-animate'
import radixPlugin from 'tailwindcss-radix'

export default {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  safelist: ['dark', 'light'],
  theme: {
    screens: {
      sm: '40rem',
      md: '48rem',
      lg: '64rem',
      xl: '80rem',
      '2xl': '96rem',
    },
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '90rem',
      },
    },
    extend: {
      spacing: { 4.5: '1.125rem' },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        success: {
          DEFAULT: 'hsl(var(--success))',
        },
        warning: {
          DEFAULT: 'hsl(var(--warning))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        palette: {
          4: 'hsl(var(--palette-4))',
          5: 'hsl(var(--palette-5))',
          6: 'hsl(var(--palette-6))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
      fontFamily: {
        sans: ['var(--font-sans)', ...defaultTheme.fontFamily.sans],
      },
      fontMetrics: {
        sans: fontMetrics,
      },
    },
  },
  plugins: [
    animatePlugin,
    radixPlugin,
    containerQueryPlugin,
    require('tailwindcss-capsize')({ className: 'leading-trim' }),
  ],
} satisfies Config
