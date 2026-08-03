/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'purple-900': '#1E1145',
        'purple-800': '#523AA8',
        'purple-600': '#7C5DC4',
        'purple-200': '#E8DFF5',
        'purple-100': '#EDE8FA',
        'purple-50':  '#F5F2FD',
        'orange':     '#FF8A47',
        'orange-dark':'#E57030',
        'cream':      '#FAF9F6',
        'text-dark':  '#2C2C2C',
        'text-muted': '#6B6878',
        'border':     '#E5E0F0',
      },
      fontFamily: {
        fraunces: ['Fraunces', 'Georgia', 'serif'],
        sans: ['DM Sans', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      screens: {
        sm: '640px',
        md: '768px',
        lg: '900px',
        xl: '1200px',
      },
    },
  },
  plugins: [],
};
