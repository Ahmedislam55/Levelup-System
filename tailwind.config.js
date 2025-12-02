/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",   
    "./node_modules/flowbite/**/*.js" 
  ],
  theme: {
    extend: {
      colors:{
        main:"#4A7142",
        yellow:"#CD953D",
      }
    },
  },
plugins: [
  require('flowbite/plugin')
]

}
