# PowerShell 自动部署脚本
# 使用方法：在 PowerShell 中运行 ./deploy.ps1

Write-Host "🚀 开始部署 Ramusi 工具导航站..."

# 检查 Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js 未安装，请先安装 Node.js"
    exit 1
}

# 检查 npm
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "❌ npm 未安装，请先安装 npm"
    exit 1
}

# 安装依赖
Write-Host "📦 安装依赖..."
npm install

# 构建项目
Write-Host "🔨 构建项目..."
npm run build

# 检查 dist 目录
if (-not (Test-Path "dist")) {
    Write-Host "❌ 构建失败，dist 目录不存在"
    exit 1
}

Write-Host "✅ 构建完成"

# 部署到服务器（请根据实际情况修改 scp 命令）
Write-Host "🚀 部署到服务器..."
scp -r dist/* user@ramusi.cn:/var/www/ramusi.cn/

Write-Host "✅ 部署完成！"
