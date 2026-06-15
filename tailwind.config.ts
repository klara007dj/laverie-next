import type { Config } from 'tailwindcss'
const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      colors: {
        ocean: { 50:'#e8f4fd', 100:'#c5e3f9', 500:'#3A7CA5', 700:'#1a5e82', 900:'#0A2472' },
      },
    },
  },
  plugins: [],
}
export default config
