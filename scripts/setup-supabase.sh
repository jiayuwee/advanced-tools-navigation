#!/bin/bash

# Supabase 项目初始化脚本
# 使用方法: ./scripts/setup-supabase.sh

set -e

echo "🚀 开始设置 Supabase 项目..."

# 检查是否安装了 Supabase CLI
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI 未安装"
    echo "请先安装 Supabase CLI:"
    echo "npm install -g supabase"
    exit 1
fi

echo "✅ Supabase CLI 已安装"

# 检查是否已登录
if ! supabase projects list &> /dev/null; then
    echo "🔐 请先登录 Supabase:"
    supabase login
fi

echo "✅ 已登录 Supabase"

# 检查是否存在项目配置
if [ ! -f "supabase/config.toml" ]; then
    echo "❌ 未找到 Supabase 配置文件"
    echo "请确保在项目根目录运行此脚本"
    exit 1
fi

# 提示用户输入项目信息
echo ""
echo "📝 请提供以下信息:"
read -p "Supabase 项目引用 ID (project-ref): " PROJECT_REF
read -p "数据库密码: " -s DB_PASSWORD
echo ""

if [ -z "$PROJECT_REF" ]; then
    echo "❌ 项目引用 ID 不能为空"
    exit 1
fi

if [ -z "$DB_PASSWORD" ]; then
    echo "❌ 数据库密码不能为空"
    exit 1
fi

# 链接到项目
echo "🔗 链接到 Supabase 项目..."
supabase link --project-ref "$PROJECT_REF"

if [ $? -ne 0 ]; then
    echo "❌ 链接项目失败"
    exit 1
fi

echo "✅ 项目链接成功"

# 运行数据库迁移
echo "📊 运行数据库迁移..."
supabase db push

if [ $? -ne 0 ]; then
    echo "❌ 数据库迁移失败"
    exit 1
fi

echo "✅ 数据库迁移完成"

# 生成类型定义
echo "🔧 生成 TypeScript 类型定义..."
supabase gen types typescript --linked > src/types/database.ts

if [ $? -ne 0 ]; then
    echo "⚠️  类型定义生成失败，但不影响项目运行"
else
    echo "✅ 类型定义生成完成"
fi

# 获取项目信息
echo "📋 获取项目信息..."
PROJECT_URL=$(supabase status | grep "API URL" | awk '{print $3}' | sed 's/http:/https:/')
ANON_KEY=$(supabase status | grep "anon key" | awk '{print $3}')

if [ -z "$PROJECT_URL" ] || [ -z "$ANON_KEY" ]; then
    echo "⚠️  无法自动获取项目信息，请手动配置环境变量"
else
    # 创建本地环境变量文件
    echo "📝 创建本地环境变量文件..."
    cat > .env.local << EOF
# Supabase 配置
VITE_SUPABASE_URL=$PROJECT_URL
VITE_SUPABASE_ANON_KEY=$ANON_KEY

# 应用配置
VITE_APP_NAME=工具导航站
VITE_APP_DESCRIPTION=高效的工具导航和产品展示平台
VITE_APP_URL=https://ramusi.cn

# 开发环境配置
VITE_DEV_MODE=true
VITE_API_BASE_URL=$PROJECT_URL
EOF

    echo "✅ 环境变量文件已创建: .env.local"
fi

echo ""
echo "🎉 Supabase 项目设置完成！"
echo ""
echo "📋 接下来的步骤:"
echo "1. 检查 .env.local 文件中的环境变量"
echo "2. 在 Supabase Dashboard 中配置认证设置"
echo "3. 设置存储桶和上传策略"
echo "4. 配置邮件服务"
echo "5. 运行 npm run dev 启动开发服务器"
echo ""
echo "🔗 有用的链接:"
echo "- Supabase Dashboard: https://supabase.com/dashboard/project/$PROJECT_REF"
echo "- 项目文档: docs/SUPABASE_SETUP.md"
echo ""
echo "✨ 祝您开发愉快！"
