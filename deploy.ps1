# Windows Deployment Script
# 1. Install dependencies
# 2. Build project
# 3. Verify build output
# 4. Deploy to Netlify (if CLI is configured)

Write-Host "Starting deployment process..."

# Install dependencies (using npm ci for consistency)
Write-Host "Installing dependencies (npm ci)..."
npm ci
if ($LASTEXITCODE -ne 0) {
    Write-Host "Dependency installation failed"
    exit 1
}

# Build project
Write-Host "Building project..."
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed"
    exit 1
}

# Verify build output
Write-Host "Verifying build output..."
if (-not (Test-Path -Path "dist")) {
    Write-Host "Build failed: dist directory does not exist"
    exit 1
}

if (-not (Test-Path -Path "dist/index.html")) {
    Write-Host "Build failed: index.html does not exist"
    exit 1
}

Write-Host "Build successful"

# Check if Netlify CLI is installed
if (Get-Command netlify -ErrorAction SilentlyContinue) {
    Write-Host "Deploying using Netlify CLI..."
    netlify deploy --prod
} else {
    Write-Host "Netlify CLI not installed, please deploy manually"
    Write-Host "Deployment guide: https://docs.netlify.com/site-deploys/create-deploys/"
}

Write-Host "Deployment process completed"