# Supabase 项目初始化脚本 (PowerShell)
# 使用方法: .\scripts\setup-supabase.ps1

param(
    [string]$ProjectRef,
    [string]$DbPassword
)

Write-Host "🚀 开始设置 Supabase 项目..." -ForegroundColor Green

# 检查是否安装了 Supabase CLI
try {
    $null = Get-Command supabase -ErrorAction Stop
    Write-Host "✅ Supabase CLI 已安装" -ForegroundColor Green
} catch {
    Write-Host "❌ Supabase CLI 未安装" -ForegroundColor Red
    Write-Host "请先安装 Supabase CLI:" -ForegroundColor Yellow
    Write-Host "npm install -g supabase" -ForegroundColor Yellow
    exit 1
}

# 检查是否已登录
try {
    $null = supabase projects list 2>$null
    Write-Host "✅ 已登录 Supabase" -ForegroundColor Green
} catch {
    Write-Host "🔐 请先登录 Supabase:" -ForegroundColor Yellow
    supabase login
}

# 检查是否存在项目配置
if (-not (Test-Path "supabase/config.toml")) {
    Write-Host "❌ 未找到 Supabase 配置文件" -ForegroundColor Red
    Write-Host "请确保在项目根目录运行此脚本" -ForegroundColor Yellow
    exit 1
}

# 获取项目信息（如果未提供参数）
if (-not $ProjectRef) {
    Write-Host ""
    Write-Host "📝 请提供以下信息:" -ForegroundColor Cyan
    $ProjectRef = Read-Host "Supabase 项目引用 ID (project-ref)"
}

if (-not $DbPassword) {
    $SecurePassword = Read-Host "数据库密码" -AsSecureString
    $DbPassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($SecurePassword))
}

if (-not $ProjectRef) {
    Write-Host "❌ 项目引用 ID 不能为空" -ForegroundColor Red
    exit 1
}

if (-not $DbPassword) {
    Write-Host "❌ 数据库密码不能为空" -ForegroundColor Red
    exit 1
}

# 链接到项目
Write-Host "🔗 链接到 Supabase 项目..." -ForegroundColor Cyan
try {
    supabase link --project-ref $ProjectRef
    Write-Host "✅ 项目链接成功" -ForegroundColor Green
} catch {
    Write-Host "❌ 链接项目失败" -ForegroundColor Red
    exit 1
}

# 运行数据库迁移
Write-Host "📊 运行数据库迁移..." -ForegroundColor Cyan
try {
    supabase db push
    Write-Host "✅ 数据库迁移完成" -ForegroundColor Green
} catch {
    Write-Host "❌ 数据库迁移失败" -ForegroundColor Red
    exit 1
}

# 生成类型定义
Write-Host "🔧 生成 TypeScript 类型定义..." -ForegroundColor Cyan
try {
    supabase gen types typescript --linked | Out-File -FilePath "src/types/database.ts" -Encoding UTF8
    Write-Host "✅ 类型定义生成完成" -ForegroundColor Green
} catch {
    Write-Host "⚠️  类型定义生成失败，但不影响项目运行" -ForegroundColor Yellow
}

# 获取项目信息
Write-Host "📋 获取项目信息..." -ForegroundColor Cyan
try {
    $StatusOutput = supabase status
    $ProjectUrl = ($StatusOutput | Select-String "API URL" | ForEach-Object { $_.ToString().Split()[2] }) -replace "http:", "https:"
    $AnonKey = ($StatusOutput | Select-String "anon key" | ForEach-Object { $_.ToString().Split()[2] })

    if ($ProjectUrl -and $AnonKey) {
        # 创建本地环境变量文件
        Write-Host "📝 创建本地环境变量文件..." -ForegroundColor Cyan
        
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
    } else {
        Write-Host "⚠️  无法自动获取项目信息，请手动配置环境变量" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  无法自动获取项目信息，请手动配置环境变量" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 Supabase 项目设置完成！" -ForegroundColor Green
Write-Host ""
Write-Host "📋 接下来的步骤:" -ForegroundColor Cyan
Write-Host "1. 检查 .env.local 文件中的环境变量"
Write-Host "2. 在 Supabase Dashboard 中配置认证设置"
Write-Host "3. 设置存储桶和上传策略"
Write-Host "4. 配置邮件服务"
Write-Host "5. 运行 npm run dev 启动开发服务器"
Write-Host ""
Write-Host "🔗 有用的链接:" -ForegroundColor Cyan
Write-Host "- Supabase Dashboard: https://supabase.com/dashboard/project/$ProjectRef"
Write-Host "- 项目文档: docs/SUPABASE_SETUP.md"
Write-Host ""
Write-Host "✨ 祝您开发愉快！" -ForegroundColor Green
