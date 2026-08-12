esbuild static/script.js --sourcemap --bundle --alias:vue=./static/js/vue.esm-browser.prod.js --outfile=static/bundle.js --loader:.html=text
esbuild static/style.css  --bundle --loader:.svg=dataurl --loader:.ttf=file --target=chrome87,firefox83,safari14 --outfile=static/style.css --allow-overwrite
