export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        sand: '#fdf9f6',
        clay: '#c45a3b',
        charcoal: '#1f1f1f',
        fog: '#f4f1ec',
        blush: '#fde6da',
      },
      fontFamily: {
        sans: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'serif'],
      },
      boxShadow: {
        card: '0 25px 60px rgba(15, 23, 42, 0.08)',
      },
    },
  },
  plugins: [],
};

