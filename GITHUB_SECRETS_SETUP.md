# 🔐 GitHub Secrets 配置指南

## 📋 概述

为了让 GitHub Actions 工作流正常运行，您需要配置以下 GitHub Secrets。这些 secrets 包含敏感信息，用于连接 Supabase 数据库和部署应用。

## 🔑 必需的 Secrets

### 1. VITE_SUPABASE_URL
- **描述**: Supabase 项目的 API URL
- **值**: `https://fytiwsutzgmygfxnqoft.supabase.co`
- **获取方式**: 从 Supabase Dashboard > Settings > API

### 2. VITE_SUPABASE_ANON_KEY
- **描述**: Supabase 项目的匿名密钥
- **值**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5dGl3c3V0emdteWdmeG5xb2Z0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4MDM1ODcsImV4cCI6MjA2NjM3OTU4N30.LM9vazR9QCZ4vLC_Q1lJmtCj3pEVqM6vpW4TKzntAQA`
- **获取方式**: 从 Supabase Dashboard > Settings > API

### 3. SUPABASE_PROJECT_REF
- **描述**: Supabase 项目引用 ID
- **值**: `ndmxwdejswybvbwrxsai`
- **获取方式**: 从项目 URL 中获取

### 4. SUPABASE_ACCESS_TOKEN
- **描述**: Supabase 访问令牌（用于 CLI 操作）
- **获取方式**: 
  1. 访问 [Supabase Dashboard](https://supabase.com/dashboard)
  2. 进入 Settings > API
  3. 在 "Personal access tokens" 部分点击 "Create new token"
  4. 输入令牌名称（如 "GitHub Actions"）
  5. 复制生成的令牌

## 🛠️ 配置步骤

### 方法一：手动配置

1. 访问 GitHub 仓库: https://github.com/jiayuwee/advanced-tools-navigation
2. 点击 "Settings" 标签页
3. 在左侧菜单中点击 "Secrets and variables" > "Actions"
4. 点击 "New repository secret" 按钮
5. 输入 Secret 名称和值：

```
名称: VITE_SUPABASE_URL
值: https://fytiwsutzgmygfxnqoft.supabase.co

名称: VITE_SUPABASE_ANON_KEY
值: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5dGl3c3V0emdteWdmeG5xb2Z0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4MDM1ODcsImV4cCI6MjA2NjM3OTU4N30.LM9vazR9QCZ4vLC_Q1lJmtCj3pEVqM6vpW4TKzntAQA

名称: SUPABASE_PROJECT_REF
值: ndmxwdejswybvbwrxsai

名称: SUPABASE_ACCESS_TOKEN
值: [您的 Supabase 访问令牌]
```

6. 点击 "Add secret" 保存每个 secret

### 方法二：使用 GitHub CLI（推荐）

如果您已安装 GitHub CLI，可以运行：

```bash
# 设置 Supabase URL
gh secret set VITE_SUPABASE_URL --body "https://fytiwsutzgmygfxnqoft.supabase.co" --repo jiayuwee/advanced-tools-navigation

# 设置 Supabase 匿名密钥
gh secret set VITE_SUPABASE_ANON_KEY --body "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5dGl3c3V0emdteWdmeG5xb2Z0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4MDM1ODcsImV4cCI6MjA2NjM3OTU4N30.LM9vazR9QCZ4vLC_Q1lJmtCj3pEVqM6vpW4TKzntAQA" --repo jiayuwee/advanced-tools-navigation

# 设置项目引用 ID
gh secret set SUPABASE_PROJECT_REF --body "ndmxwdejswybvbwrxsai" --repo jiayuwee/advanced-tools-navigation

# 设置访问令牌（需要您先获取）
gh secret set SUPABASE_ACCESS_TOKEN --body "YOUR_ACCESS_TOKEN_HERE" --repo jiayuwee/advanced-tools-navigation
```

## 🧪 验证配置

配置完成后，您可以：

1. **检查 Secrets 列表**:
   - 访问 GitHub 仓库 > Settings > Secrets and variables > Actions
   - 确认所有 4 个 secrets 都已列出

2. **触发工作流测试**:
   ```bash
   # 手动触发 Supabase 部署工作流
   gh workflow run "Deploy to Supabase (Fixed)" --repo jiayuwee/advanced-tools-navigation
   ```

3. **查看工作流状态**:
   - 访问 https://github.com/jiayuwee/advanced-tools-navigation/actions
   - 检查最新的工作流运行是否成功

## 🔍 故障排除

### 工作流仍然失败？

1. **检查 Secret 值**:
   - 确保没有多余的空格
   - 确保值完全正确

2. **检查 Supabase 项目状态**:
   - 访问 Supabase Dashboard
   - 确认项目状态为 "Active"

3. **检查访问令牌权限**:
   - 确保令牌有足够的权限
   - 尝试重新生成令牌

### 常见错误

- **"secrets not found"**: 检查 secret 名称是否正确
- **"unauthorized"**: 检查访问令牌是否有效
- **"project not found"**: 检查项目引用 ID 是否正确

## 🚀 下一步

配置完成后，您的 GitHub Actions 工作流应该能够：

- ✅ 自动构建和测试代码
- ✅ 部署数据库迁移到 Supabase
- ✅ 构建前端应用
- ✅ 自动部署到 Netlify

## 📞 获取帮助

如果遇到问题：

1. 检查 [GitHub Actions 日志](https://github.com/jiayuwee/advanced-tools-navigation/actions)
2. 查看 [Supabase 文档](https://supabase.com/docs)
3. 在项目中创建 Issue
