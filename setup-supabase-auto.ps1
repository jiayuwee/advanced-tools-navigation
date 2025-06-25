# Supabase 自动化部署脚本
# 使用方法: .\setup-supabase-auto.ps1 -ProjectRef "your-project-ref" -AnonKey "your-anon-key"

param(
    [Parameter(Mandatory=$true)]
    [string]$ProjectRef,
    
    [Parameter(Mandatory=$true)]
    [string]$AnonKey,
    
    [Parameter(Mandatory=$false)]
    [string]$AccessToken
)

Write-Host "🚀 开始自动化部署 Supabase 数据库..." -ForegroundColor Green

# 检查必要的工具
Write-Host "🔍 检查环境..." -ForegroundColor Cyan

# 检查 Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js 未安装，请先安装 Node.js" -ForegroundColor Red
    exit 1
}

# 检查 npm
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "❌ npm 未安装，请先安装 npm" -ForegroundColor Red
    exit 1
}

Write-Host "✅ 环境检查通过" -ForegroundColor Green

# 创建环境变量文件
Write-Host "📝 创建环境变量文件..." -ForegroundColor Cyan

$ProjectUrl = "https://$ProjectRef.supabase.co"

$EnvContent = @"
# Supabase 配置
VITE_SUPABASE_URL=$ProjectUrl
VITE_SUPABASE_ANON_KEY=$AnonKey

# 应用配置
VITE_APP_NAME=工具导航站
VITE_APP_DESCRIPTION=高效的工具导航和产品展示平台
VITE_APP_URL=https://ramusi.cn

# 开发环境配置
VITE_DEV_MODE=true
VITE_API_BASE_URL=$ProjectUrl
"@

$EnvContent | Out-File -FilePath ".env.local" -Encoding UTF8
Write-Host "✅ 环境变量文件已创建: .env.local" -ForegroundColor Green

# 设置访问令牌（如果提供）
if ($AccessToken) {
    Write-Host "🔐 设置 Supabase 访问令牌..." -ForegroundColor Cyan
    $env:SUPABASE_ACCESS_TOKEN = $AccessToken
}

# 链接到项目
Write-Host "🔗 链接到 Supabase 项目..." -ForegroundColor Cyan
try {
    npx supabase link --project-ref $ProjectRef
    Write-Host "✅ 项目链接成功" -ForegroundColor Green
} catch {
    Write-Host "⚠️  项目链接失败，但继续执行迁移..." -ForegroundColor Yellow
}

# 运行数据库迁移
Write-Host "📊 运行数据库迁移..." -ForegroundColor Cyan
try {
    npx supabase db push
    Write-Host "✅ 数据库迁移完成" -ForegroundColor Green
} catch {
    Write-Host "❌ 数据库迁移失败" -ForegroundColor Red
    Write-Host "请检查项目配置和网络连接" -ForegroundColor Yellow
    exit 1
}

# 生成类型定义
Write-Host "🔧 生成 TypeScript 类型定义..." -ForegroundColor Cyan
try {
    npx supabase gen types typescript --linked | Out-File -FilePath "src/types/database.ts" -Encoding UTF8
    Write-Host "✅ 类型定义生成完成" -ForegroundColor Green
} catch {
    Write-Host "⚠️  类型定义生成失败，但不影响项目运行" -ForegroundColor Yellow
}

# 验证部署
Write-Host "🧪 验证部署..." -ForegroundColor Cyan
Write-Host "项目 URL: $ProjectUrl" -ForegroundColor White
Write-Host "项目引用: $ProjectRef" -ForegroundColor White

Write-Host ""
Write-Host "🎉 Supabase 数据库部署完成！" -ForegroundColor Green
Write-Host ""
Write-Host "下一步操作：" -ForegroundColor Cyan
Write-Host "1. 在 Supabase Dashboard 中配置认证设置" -ForegroundColor White
Write-Host "2. 设置存储桶和文件上传策略" -ForegroundColor White
Write-Host "3. 运行 npm run dev 启动开发服务器" -ForegroundColor White
Write-Host "4. 测试数据库连接和基本功能" -ForegroundColor White
Write-Host ""
Write-Host "Supabase Dashboard: https://supabase.com/dashboard/project/$ProjectRef" -ForegroundColor Blue
