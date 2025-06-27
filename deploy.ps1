# Windows 部署脚本
# 1. 安装依赖
# 2. 构建项目
# 3. 验证构建输出
# 4. 部署到 Netlify (如果配置了CLI)

Write-Host "🚀 开始部署流程..."

# 安装依赖
Write-Host "🔧 安装依赖..."
npm ci
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 依赖安装失败"
    exit 1
}

# 构建项目
Write-Host "🔨 构建项目..."
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 构建失败"
    exit 1
}

# 验证构建输出
Write-Host "🔍 验证构建输出..."
if (-not (Test-Path -Path "dist")) {
    Write-Host "❌ 构建失败: dist 目录不存在"
    exit 1
}

if (-not (Test-Path -Path "dist/index.html")) {
    Write-Host "❌ 构建失败: index.html 不存在"
    exit 1
}

Write-Host "✅ 构建成功"

# 检查是否安装了 Netlify CLI
if (Get-Command netlify -ErrorAction SilentlyContinue) {
    Write-Host "🚀 使用 Netlify CLI 部署..."
    netlify deploy --prod
} else {
    Write-Host "ℹ️ Netlify CLI 未安装，请手动部署"
    Write-Host "🔗 部署指南: https://docs.netlify.com/site-deploys/create-deploys/"
}

Write-Host "🎉 部署流程完成"