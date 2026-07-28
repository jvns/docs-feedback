set -eu

esbuild ./static/script.js --sourcemap --bundle --outfile=static/bundle.js --loader:.html=text

exec go run . serve --dev
