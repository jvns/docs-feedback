set -eu

esbuild ./static/script.js --sourcemap --bundle --alias:vue=./static/js/vue.esm-browser.js --outfile=static/bundle.js --loader:.html=text

exec go run . serve --dev
