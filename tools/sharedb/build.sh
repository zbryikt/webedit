#!/usr/bin/env bash
OUTDIR=../../static/assets/sharedb
echo "compiling sharedb bundle.ls livescript..."
lsc -cb bundle.ls
echo "browserify sharedb bundle.js..."
browserify bundle.js > $OUTDIR/index.js
echo "minimize sharedb..."
uglifyjs $OUTDIR/index.js > $OUTDIR/index.min.js
rm bundle.js
echo "Done."
