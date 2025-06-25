# 🚀 GitHub Actions 自动化部署指南

## 📋 概述

本项目已配置完整的 GitHub Actions 自动化部署流程，支持：
- 🗄️ Supabase 数据库自动迁移
- 🌐 前端应用自动构建和部署
- 🔍 部署前环境检查
- 📊 部署后状态验证
- 🔔 部署结果通知

## ✅ 已完成的配置

### 1. GitHub Actions 工作流
- ✅ **supabase-deploy.yml** - 完整的 Supabase 部署流程
- ✅ **deploy.yml** - 前端应用部署流程
- ✅ **ci.yml** - 持续集成检查

### 2. 自动化脚本
- ✅ **check-deployment-status.js** - 部署状态检查
- ✅ **trigger-deployment.js** - 手动触发部署
- ✅ **verify-deployment.js** - 部署验证
- ✅ **setup-supabase-auto.ps1** - 本地自动化设置

### 3. 配置文档
- ✅ **docs/GITHUB_SECRETS_SETUP.md** - Secrets 配置指南
- ✅ **docs/SUPABASE_SETUP.md** - Supabase 设置指南
- ✅ **DEPLOYMENT_STATUS.md** - 部署状态总览

## 🔐 必需的 GitHub Secrets

在仓库设置中需要配置以下 Secrets：

| Secret 名称 | 用途 | 获取方式 |
|------------|------|----------|
| `SUPABASE_ACCESS_TOKEN` | Supabase CLI 认证 | [Supabase Dashboard](https://supabase.com/dashboard/account/tokens) |
| `SUPABASE_PROJECT_REF` | 项目标识符 | Supabase 项目设置页面 |
| `VITE_SUPABASE_URL` | 前端连接地址 | Supabase 项目 API 设置 |
| `VITE_SUPABASE_ANON_KEY` | 前端匿名密钥 | Supabase 项目 API 设置 |

### 配置步骤
1. 访问 `https://github.com/jiayuwee/advanced-tools-navigation/settings/secrets/actions`
2. 点击 "New repository secret"
3. 添加上述所有 secrets

## 🚀 部署触发方式

### 1. 自动触发
- **推送到 main 分支**：自动触发完整部署
- **修改 supabase/ 目录**：触发数据库迁移
- **修改工作流文件**：触发相应的部署流程

### 2. 手动触发
```bash
# 方式 1: 通过 GitHub 网页界面
# 访问: https://github.com/jiayuwee/advanced-tools-navigation/actions
# 选择 "Deploy to Supabase" 工作流
# 点击 "Run workflow"

# 方式 2: 通过脚本触发
npm run deployment:trigger

# 方式 3: 通过 GitHub CLI
gh workflow run "Deploy to Supabase"
```

### 3. 强制部署
在手动触发时可以选择：
- **强制部署**：跳过环境检查
- **指定环境**：production 或 staging

## 📊 监控和检查

### 部署状态检查
```bash
# 检查最近的部署状态
npm run deployment:status

# 验证 Supabase 连接
npm run supabase:verify

# 检查本地环境
npm run supabase:status
```

### 实时监控
- **Actions 页面**：https://github.com/jiayuwee/advanced-tools-navigation/actions
- **部署历史**：查看所有部署记录和日志
- **实时日志**：点击运行中的工作流查看详细进度

## 🔄 部署流程

### 完整部署流程
1. **环境检查** (30秒)
   - 验证 GitHub Secrets 配置
   - 检查前端和后端环境变量

2. **数据库部署** (2-3分钟)
   - 链接 Supabase 项目
   - 运行数据库迁移
   - 部署 Edge Functions（如有）
   - 验证部署状态

3. **前端部署** (3-5分钟)
   - 安装依赖
   - 代码检查和类型验证
   - 构建生产版本
   - 验证构建输出

4. **部署后验证** (1分钟)
   - 生成部署报告
   - 测试站点可用性
   - 发送状态通知

### 总耗时：约 6-9 分钟

## 🚨 故障排除

### 常见问题

**1. Secrets 未配置**
```
❌ 错误：secrets not configured
✅ 解决：检查 GitHub Secrets 设置
```

**2. 数据库连接失败**
```
❌ 错误：project link failed
✅ 解决：验证 SUPABASE_PROJECT_REF 和 ACCESS_TOKEN
```

**3. 前端构建失败**
```
❌ 错误：build failed
✅ 解决：检查 VITE_SUPABASE_URL 和 ANON_KEY
```

**4. 迁移失败**
```
❌ 错误：migration failed
✅ 解决：检查 SQL 语法和数据库权限
```

### 调试步骤
1. **查看详细日志**：点击失败的工作流步骤
2. **本地测试**：运行 `npm run supabase:verify`
3. **检查配置**：运行 `npm run deployment:status`
4. **重新触发**：使用强制部署选项

## 📈 部署统计

### 成功率监控
- 查看 Actions 页面的成功/失败统计
- 监控部署时间趋势
- 跟踪错误模式

### 性能指标
- **平均部署时间**：6-9 分钟
- **数据库迁移**：通常 < 2 分钟
- **前端构建**：通常 < 5 分钟
- **站点可用性**：部署后 30 秒内

## 🔧 高级配置

### 环境变量
```bash
# 可选的环境变量
GITHUB_TOKEN=ghp_xxx  # 用于脚本触发部署
NODE_ENV=production   # 构建环境
VITE_DEV_MODE=false   # 开发模式开关
```

### 自定义触发条件
可以修改 `.github/workflows/supabase-deploy.yml` 中的触发条件：
```yaml
on:
  push:
    branches: [main, develop]  # 添加更多分支
    paths:
      - 'supabase/**'
      - 'src/**'              # 添加更多路径
```

## 📚 相关文档

- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [Supabase CLI 文档](https://supabase.com/docs/reference/cli)
- [Netlify 部署文档](https://docs.netlify.com/)

## 🎯 下一步

1. **配置 GitHub Secrets**（如未完成）
2. **测试手动部署**：`npm run deployment:trigger`
3. **监控自动部署**：推送代码到 main 分支
4. **设置通知**：配置 GitHub 通知或集成 Slack/Discord

---

**状态**: ✅ 自动化部署已完全配置
**最后更新**: 2025-06-25
**维护者**: jiayuwee
