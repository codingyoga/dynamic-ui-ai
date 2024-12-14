To setup tailwind 

npm install -D tailwindcss postcss autoprefixer

Create/update your postcss.config.js file in your project root:

javascriptCopymodule.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  }
}

Create/update your tailwind.config.js file in your project root:

javascriptCopy/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

your src/index.css has exactly:

cssCopy@tailwind base;
@tailwind components;
@tailwind utilities;

package.json includes these Tailwind-related development dependencies:

jsonCopy{
  "devDependencies": {
    "autoprefixer": "^10.4.x",
    "postcss": "^8.4.x",
    "tailwindcss": "^3.x.x"
  }
}

npm install

npm start