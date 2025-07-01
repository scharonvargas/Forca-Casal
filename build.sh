#!/bin/bash

echo "Building client and server..."

# Build frontend
echo "Building React frontend..."
npx vite build

# Build backend
echo "Building Express server..."
npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

# Reorganize files for deployment compatibility
echo "Reorganizing build output for deployment..."

# Copy public files to dist root for static deployment
cp -r dist/public/* dist/

# Also keep them in dist/public for Express server compatibility
echo "Build completed successfully!"
echo ""
echo "Build output structure:"
echo "- dist/index.html (for static deployment)"
echo "- dist/assets/ (for static deployment)"
echo "- dist/public/ (for Express server)"
echo "- dist/index.js (Express server bundle)"