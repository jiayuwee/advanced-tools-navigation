# 🔄 更新部署决策指南

## 📋 全局部署架构分析

基于您的项目配置，以下是更新部署时的全局决策指南：

### 🏗️ 当前部署架构

```
GitHub (代码) → GitHub Actions (CI/CD) → Netlify (前端) + Supabase (后端)
     ↓                ↓                      ↓              ↓
   代码推送        自动触发工作流           自动部署        数据库迁移
```

## 🎯 更新部署决策矩阵

### ✅ **需要操作的情况**

| 更新类型 | GitHub Actions | Netlify 设置 | Supabase 迁移 | 说明 |
|----------|----------------|--------------|---------------|------|
| **前端代码更新** | ❌ 自动触发 | ❌ 自动部署 | ❌ 不需要 | 推送到 main 分支即可 |
| **数据库结构变更** | ✅ 手动触发 | ❌ 自动部署 | ✅ 需要迁移 | 修改 supabase/ 目录 |
| **环境变量更新** | ✅ 更新 Secrets | ⚠️ 可能需要 | ❌ 不需要 | 更新配置后重新部署 |
| **依赖包更新** | ❌ 自动处理 | ❌ 自动处理 | ❌ 不需要 | package.json 变更自动处理 |
| **域名/SSL 变更** | ❌ 不需要 | ✅ 需要配置 | ❌ 不需要 | 在 Netlify 控制台操作 |
| **新功能发布** | ❌ 自动触发 | ❌ 自动部署 | ⚠️ 视情况而定 | 根据是否有数据库变更 |

### ❌ **不需要操作的情况**

| 场景 | 原因 | 自动化程度 |
|------|------|------------|
| **日常代码更新** | GitHub Actions 自动 CI/CD | 100% 自动 |
| **样式调整** | 前端构建自动处理 | 100% 自动 |
| **配置文件更新** | 构建时自动包含 | 100% 自动 |
| **文档更新** | 不影响生产环境 | 100% 自动 |

## 🚀 具体操作指南

### 1. **纯前端更新**（最常见）

**触发条件**：
- 修改 Vue 组件、样式、路由
- 更新 package.json 依赖
- 修改 Vite 配置

**操作步骤**：
```bash
# 1. 提交代码
git add .
git commit -m "feat: 更新功能"
git push origin main

# 2. 等待自动部署（无需手动操作）
# - GitHub Actions 自动运行 CI 检查
# - Netlify 自动拉取并部署
# - 3-5 分钟后生效
```

**监控**：
- GitHub Actions: https://github.com/jiayuwee/advanced-tools-navigation/actions
- Netlify 部署: https://app.netlify.com/sites/spiffy-torrone-5454e1/deploys

### 2. **数据库结构更新**

**触发条件**：
- 修改 `supabase/migrations/` 文件
- 新增表、字段、索引
- 更新 RLS 策略

**操作步骤**：
```bash
# 1. 创建迁移文件
npx supabase migration new "add_new_feature"

# 2. 编写迁移 SQL
# 编辑 supabase/migrations/新文件.sql

# 3. 提交代码（自动触发 Supabase 部署）
git add supabase/
git commit -m "feat: 添加新数据库功能"
git push origin main

# 4. 或手动触发 Supabase 部署
npm run deployment:trigger
```

**验证**：
```bash
# 检查部署状态
npm run deployment:status

# 验证数据库连接
npm run supabase:verify
```

### 3. **环境变量更新**

**需要更新的情况**：
- Supabase 项目迁移
- API 密钥轮换
- 新增第三方服务

**操作步骤**：
```bash
# 1. 更新 GitHub Secrets
# 访问: https://github.com/jiayuwee/advanced-tools-navigation/settings/secrets/actions

# 2. 更新本地环境
# 编辑 .env.local 文件

# 3. 验证配置
npm run secrets:check

# 4. 触发重新部署
git commit --allow-empty -m "chore: 更新环境变量"
git push origin main
```

### 4. **紧急修复部署**

**快速部署流程**：
```bash
# 1. 修复代码
git add .
git commit -m "fix: 紧急修复"

# 2. 推送并监控
git push origin main

# 3. 实时监控部署
npm run monitor:health

# 4. 验证修复效果
curl -I https://ramusi.cn
```

## 🔍 部署状态检查

### 自动化检查工具

```bash
# 全面配置检查
npm run config:verify

# GitHub Secrets 检查
npm run secrets:check

# 完整部署流程测试
npm run test:deployment

# 实时健康监控
npm run monitor:health
```

### 手动检查清单

- [ ] **GitHub Actions** 工作流状态正常
- [ ] **Netlify** 部署成功且网站可访问
- [ ] **Supabase** 数据库连接正常
- [ ] **域名** SSL 证书有效
- [ ] **监控** 健康检查通过

## ⚠️ 特殊情况处理

### 回滚策略

**前端回滚**：
```bash
# Netlify 控制台一键回滚
# 或重新部署之前的提交
git revert HEAD
git push origin main
```

**数据库回滚**：
```bash
# 创建回滚迁移
npx supabase migration new "rollback_feature"
# 编写反向 SQL 操作
```

### 故障排除

**构建失败**：
```bash
# 清理依赖重试
npm run deps:clean
```

**部署超时**：
```bash
# 检查 Netlify 构建日志
# 优化构建配置或拆分部署
```

**数据库连接失败**：
```bash
# 验证 Secrets 配置
npm run secrets:check

# 检查 Supabase 项目状态
# 访问: https://supabase.com/dashboard/project/ndmxwdejswybvbwrxsai
```

## 📊 部署频率建议

| 更新类型 | 建议频率 | 风险等级 |
|----------|----------|----------|
| **功能更新** | 每周 1-2 次 | 🟡 中等 |
| **Bug 修复** | 随时 | 🟢 低 |
| **依赖更新** | 每月 1 次 | 🟡 中等 |
| **数据库迁移** | 谨慎规划 | 🔴 高 |
| **安全更新** | 立即 | 🟢 低 |

## 🎯 最佳实践

1. **渐进式部署**：先测试，后生产
2. **监控优先**：部署后立即检查状态
3. **文档同步**：更新代码同时更新文档
4. **备份策略**：重要变更前备份数据
5. **团队协作**：重大更新提前沟通

---

**总结**：您的项目已高度自动化，大部分更新只需推送代码即可。只有数据库结构变更和环境配置更新需要额外操作。
