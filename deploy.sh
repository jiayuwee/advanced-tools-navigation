#!/bin/bash
# 通用部署脚本
# 1. 安装依赖
# 2. 构建项目
# 3. 验证构建输出
# 4. 部署到 Netlify (如果配置了CLI)

echo "🚀 开始部署流程..."

# 安装依赖
echo "🔧 安装依赖..."
npm ci
if [ $? -ne 0 ]; then
    echo "❌ 依赖安装失败"
    exit 1
fi

# 构建项目
echo "🔨 构建项目..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ 构建失败"
    exit 1
fi

# 验证构建输出
echo "🔍 验证构建输出..."
if [ ! -d "dist" ]; then
    echo "❌ 构建失败: dist 目录不存在"
    exit 1
fi

if [ ! -f "dist/index.html" ]; then
    echo "❌ 构建失败: index.html 不存在"
    exit 1
fi

echo "✅ 构建成功"

# 检查是否安装了 Netlify CLI
if command -v netlify &> /dev/null; then
    echo "🚀 使用 Netlify CLI 部署..."
    netlify deploy --prod
else
    echo "ℹ️ Netlify CLI 未安装，请手动部署"
    echo "🔗 部署指南: https://docs.netlify.com/site-deploys/create-deploys/"
fi

echo "🎉 部署流程完成"