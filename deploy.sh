#!/bin/bash

# Ramusi 工具导航站部署脚本
# 使用方法: ./deploy.sh

set -e

echo "🚀 开始部署 Ramusi 工具导航站..."

# 检查 Node.js 环境
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm 未安装，请先安装 npm"
    exit 1
fi

# 安装依赖
echo "📦 安装依赖..."
npm install

# 构建项目
echo "🔨 构建项目..."
npm run build

# 检查构建结果
if [ ! -d "dist" ]; then
    echo "❌ 构建失败，dist 目录不存在"
    exit 1
fi

echo "✅ 构建完成"

# 部署到服务器 (根据您的部署方式选择)
echo "🚀 部署到服务器..."

# 方式1: 使用 rsync 部署到服务器
# rsync -avz --delete dist/ user@ramusi.cn:/var/www/ramusi.cn/

# 方式2: 使用 scp 部署
# scp -r dist/* user@ramusi.cn:/var/www/ramusi.cn/

# 方式3: 使用 Git 部署
# git add dist/
# git commit -m "Deploy: $(date)"
# git push origin main

# 方式4: 使用 Docker 部署
# docker build -t ramusi-tools .
# docker run -d -p 80:80 --name ramusi-tools ramusi-tools

echo "✅ 部署完成！"
echo "🌐 网站地址: https://ramusi.cn"
echo "📊 请检查网站是否正常运行"

# 可选: 清理构建缓存
# rm -rf dist/
