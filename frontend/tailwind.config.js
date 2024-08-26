/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily:{
        display:'Poppins, sans-serif',
      },
    },
  },
  daisyui: {
    themes: [
      {
        mytheme: {
          
              "primary": "#f3f4f6",
                        
              "secondary": "#0023ff",
                        
              "accent": "#b91c1c",
                        
              "neutral": "#e7e5e4",
                        
              "base-100": "#fafffd",
                        
              "info": "#009ed3",
                        
              "success": "#1b9200",
                        
              "warning": "#da5400",
                        
              "error": "#dc002b",
          },
        },
      ],
    },
  plugins: [
    require('daisyui'),
  ],
}

