#!/bin/bash
# Universal Deployment Script
# 1. Install dependencies
# 2. Build project
# 3. Verify build output
# 4. Deploy to Netlify (if CLI is configured)

echo "Starting deployment process..."

# Install dependencies (using npm ci for consistency)
echo "Installing dependencies (npm ci)..."
npm ci
if [ $? -ne 0 ]; then
    echo "Dependency installation failed"
    exit 1
fi

# Build project
echo "Building project..."
npm run build
if [ $? -ne 0 ]; then
    echo "Build failed"
    exit 1
fi

# Verify build output
echo "Verifying build output..."
if [ ! -d "dist" ]; then
    echo "Build failed: dist directory does not exist"
    exit 1
fi

if [ ! -f "dist/index.html" ]; then
    echo "Build failed: index.html does not exist"
    exit 1
fi

echo "Build successful"

# Check if Netlify CLI is installed
if command -v netlify &> /dev/null; then
    echo "Deploying using Netlify CLI..."
    netlify deploy --prod
else
    echo "Netlify CLI not installed, please deploy manually"
    echo "Deployment guide: https://docs.netlify.com/site-deploys/create-deploys/"
fi

echo "Deployment process completed"