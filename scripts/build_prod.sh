esbuild ./static/script.js --sourcemap --bundle --alias:vue=./static/js/vue.esm-browser.prod.js --outfile=static/bundle.js --loader:.html=text
