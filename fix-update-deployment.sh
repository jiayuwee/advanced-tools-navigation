#!/bin/bash

# 更新发布问题修复脚本
# 自动生成于 2025-06-30T08:10:21.561Z

echo "🔧 开始修复更新发布问题..."

# 1. 清理缓存和依赖
echo "📦 清理依赖和缓存..."
rm -rf node_modules
rm -rf dist
rm -rf .vite

# 2. 统一包管理器（使用 npm）
echo "🔄 统一包管理器..."
if [ -f "yarn.lock" ]; then
    echo "删除 yarn.lock..."
    rm yarn.lock
fi

# 3. 重新安装依赖
echo "📥 重新安装依赖..."
npm install

# 4. 验证构建
echo "🔨 验证构建..."
npm run build

# 5. 运行测试
echo "🧪 运行测试..."
npm run test:run || echo "⚠️ 测试失败，但继续执行..."

# 6. 检查健康状态
echo "🏥 检查健康状态..."
npm run monitor:health || echo "⚠️ 健康检查失败，但继续执行..."

echo "✅ 修复脚本执行完成！"
echo "📝 请检查上述输出，确认没有错误后再进行部署。"
