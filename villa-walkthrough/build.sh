#!/bin/bash
cd "$(dirname "$0")"
npx esbuild src/main.js --bundle --format=iife --outfile=dist/app.js --minify --log-level=warning && ls -la dist/app.js
