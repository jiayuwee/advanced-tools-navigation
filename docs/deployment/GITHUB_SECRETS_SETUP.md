# GitHub Secrets 配置指南

本指南将帮助您配置 GitHub Actions 所需的 secrets，以实现自动化部署。

## 🔐 关于 GitHub Actions 警告

您可能会在 GitHub Actions 工作流文件中看到类似这样的警告：

```
Context access might be invalid: SUPABASE_ACCESS_TOKEN
```

**这些警告是正常的！** 它们出现是因为：

1. GitHub Actions 在静态分析时无法验证 secrets 是否存在
2. 这是 GitHub 的安全机制，防止意外暴露不存在的 secrets
3. 这些警告不会影响工作流的实际运行
4. 一旦您配置了相应的 secrets，工作流就会正常工作

## 📋 需要配置的 Secrets

### Supabase 相关 Secrets

1. **SUPABASE_ACCESS_TOKEN**
   - 用途：Supabase CLI 认证
   - 获取方式：
     1. 访问 [Supabase Dashboard](https://supabase.com/dashboard/account/tokens)
     2. 点击 "Generate new token"
     3. 复制生成的令牌

2. **SUPABASE_PROJECT_REF**
   - 用途：标识您的 Supabase 项目
   - 获取方式：
     1. 在 Supabase Dashboard 中打开您的项目
     2. 在 Settings > General 中找到 "Reference ID"
     3. 复制该 ID（通常是一串字母数字组合）

3. **VITE_SUPABASE_URL**
   - 用途：前端应用连接 Supabase
   - 获取方式：
     1. 在 Supabase Dashboard 中打开您的项目
     2. 在 Settings > API 中找到 "Project URL"
     3. 复制 URL（格式：`https://xxx.supabase.co`）

4. **VITE_SUPABASE_ANON_KEY**
   - 用途：前端应用的匿名访问密钥
   - 获取方式：
     1. 在 Supabase Dashboard 中打开您的项目
     2. 在 Settings > API 中找到 "anon public" 密钥
     3. 复制该密钥

## 🔧 如何添加 GitHub Secrets

### 步骤 1：访问仓库设置
1. 打开您的 GitHub 仓库
2. 点击 "Settings" 选项卡
3. 在左侧菜单中找到 "Secrets and variables"
4. 点击 "Actions"

### 步骤 2：添加 Secrets
1. 点击 "New repository secret"
2. 输入 Secret 名称（如 `SUPABASE_ACCESS_TOKEN`）
3. 输入 Secret 值
4. 点击 "Add secret"
5. 重复以上步骤添加所有需要的 secrets

### 步骤 3：验证配置
添加完所有 secrets 后，您的 secrets 列表应该包含：
- ✅ SUPABASE_ACCESS_TOKEN
- ✅ SUPABASE_PROJECT_REF  
- ✅ VITE_SUPABASE_URL
- ✅ VITE_SUPABASE_ANON_KEY

## 🚀 测试部署

### 触发部署
配置完 secrets 后，您可以通过以下方式触发部署：

1. **自动触发**：推送代码到 `main` 分支
2. **手动触发**：
   1. 访问 GitHub 仓库的 "Actions" 选项卡
   2. 选择 "Deploy to Supabase" 工作流
   3. 点击 "Run workflow"

### 检查部署状态
1. 在 "Actions" 选项卡中查看工作流运行状态
2. 点击具体的运行实例查看详细日志
3. 绿色勾号表示成功，红色叉号表示失败

## 🔍 故障排除

### 常见问题

**问题 1：工作流显示 "secrets not configured"**
- 解决方案：检查 secrets 名称是否正确，确保没有拼写错误

**问题 2：Supabase CLI 认证失败**
- 解决方案：
  1. 确认 `SUPABASE_ACCESS_TOKEN` 是有效的
  2. 检查令牌是否有足够的权限
  3. 尝试重新生成访问令牌

**问题 3：项目链接失败**
- 解决方案：
  1. 确认 `SUPABASE_PROJECT_REF` 是正确的
  2. 检查项目是否存在且可访问
  3. 确认您有项目的管理权限

**问题 4：前端构建失败**
- 解决方案：
  1. 检查 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY` 是否正确
  2. 确认 Supabase 项目的 API 设置
  3. 检查本地构建是否正常

### 调试技巧

1. **查看详细日志**：
   - 在 Actions 页面点击失败的工作流
   - 展开各个步骤查看详细输出

2. **本地测试**：
   ```bash
   # 测试 Supabase 连接
   supabase login
   supabase projects list
   
   # 测试本地构建
   npm run build
   ```

3. **验证 secrets**：
   - 在工作流中添加调试步骤（注意不要输出敏感信息）
   - 检查环境变量是否正确设置

## 🔒 安全最佳实践

### Secrets 管理
1. **定期轮换**：定期更新访问令牌和密钥
2. **最小权限**：只授予必要的权限
3. **监控使用**：定期检查 secrets 的使用情况

### 访问控制
1. **限制访问**：只有必要的团队成员才能访问 secrets
2. **审计日志**：定期检查 secrets 的访问和修改记录
3. **环境隔离**：为不同环境使用不同的 secrets

## 📚 相关文档

- [Supabase 部署指南](./SUPABASE_SETUP.md)
- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [Supabase CLI 文档](https://supabase.com/docs/reference/cli)

## 💡 提示

1. **备份配置**：记录您的配置信息（不包括敏感值）
2. **文档更新**：配置变更时及时更新文档
3. **团队协作**：确保团队成员了解配置流程

---

如果您在配置过程中遇到问题，请参考相关文档或寻求技术支持。
