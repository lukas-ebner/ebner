import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: '#F44900',
        teal: {
          DEFAULT: '#0D4F54',
          mid: '#1A7A82',
          light: '#E6EEEF',
        },
        surface: {
          light: '#F1F1F1',
          cool: '#F8FAFC',
          dark: '#020617',
        },
        text: {
          primary: '#191819',
          light: '#F1F1F1',
          muted: '#6B7280',
          dimmed: '#4B5563',
        },
        success: '#2D6A4F',
        warning: '#D97706',
        border: {
          DEFAULT: '#D1D5DB',
          dark: '#374151',
        },
      },
      fontFamily: {
        display: ['Degular Display', 'sans-serif'],
        body: ['Inter Display', 'sans-serif'],
        mono: ['Roboto Mono', 'monospace'],
        handwritten: ['RealBookPen', 'cursive'],
      },
      fontSize: {
        stat: ['clamp(48px, 8vw, 96px)', { lineHeight: '1.0' }],
        h1: ['clamp(36px, 5vw, 72px)', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        h2: ['clamp(28px, 3.5vw, 44px)', { lineHeight: '1.2' }],
        h3: ['clamp(22px, 2.5vw, 28px)', { lineHeight: '1.3' }],
        body: ['clamp(16px, 1.2vw, 20px)', { lineHeight: '1.65' }],
        pill: ['11px', { lineHeight: '1', letterSpacing: '0.12em' }],
        label: ['13px', { lineHeight: '1', letterSpacing: '0.08em' }],
      },
      spacing: {
        'section-mobile': '80px',
        'section-desktop': '128px',
        hero: '128px',
      },
      borderRadius: {
        card: '12px',
        button: '6px',
        pill: '999px',
      },
    },
  },
  plugins: [],
}

export default config
