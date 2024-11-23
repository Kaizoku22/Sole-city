/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./client/views/*.{html,js,mustache}'],
  theme: {
    extend:{
        colors:{
            'primary' : '#e85f39',
            'background' : '#22092C', 
            'background-secondary' :'#1C212C'
        },

    },
  },
  plugins: [],
}

