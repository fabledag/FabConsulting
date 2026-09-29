/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'purple-900': '#1E1145',
        'purple-800': '#543BAA',
        'purple-600': '#7C5DC4',
        'purple-200': '#E8DFF5',
        'purple-100': '#EDE8FA',
        'purple-50':  '#F5F2FD',
        'orange':     '#FD8A46',
        'orange-dark':'#E57030',
        'cream':      '#FAF8F5',
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
