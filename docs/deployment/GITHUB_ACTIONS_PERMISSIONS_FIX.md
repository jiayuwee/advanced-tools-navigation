# 🔧 GitHub Actions 权限修复指南

## 🚨 问题描述

**错误信息**:
```
actions/checkout@v4 is not allowed to be used in jiayuwee/advanced-tools-navigation. 
Actions in this workflow must be: within a repository owned by jiayuwee.
```

**问题原因**: 
仓库的GitHub Actions权限设置过于严格，只允许使用仓库所有者的Actions，禁用了GitHub官方Actions。

## 🛠️ 解决步骤

### 步骤 1: 修改Actions权限设置

1. **访问仓库设置**
   ```
   https://github.com/jiayuwee/advanced-tools-navigation/settings/actions
   ```

2. **找到"Actions permissions"部分**

3. **选择合适的权限设置**：

   **🟢 推荐选项 (最安全)**:
   ```
   ☑️ Allow GitHub Actions created by GitHub, and select non-GitHub actions
   ```
   
   **🟡 备选选项 (完全开放)**:
   ```
   ☑️ Allow all actions and reusable workflows
   ```

4. **如果选择了第一个选项，还需要添加允许的Actions**：
   - `actions/checkout@v4`
   - `actions/setup-node@v4`
   - `supabase/setup-cli@v1`

5. **点击"Save"保存设置**

### 步骤 2: 验证修复

修改权限后，推送代码触发工作流验证：

```bash
git add .
git commit -m "test: 验证GitHub Actions权限修复"
git push origin main
```

### 步骤 3: 检查工作流运行

访问Actions页面查看运行状态：
```
https://github.com/jiayuwee/advanced-tools-navigation/actions
```

## 📋 权限设置详解

### 选项 1: Allow GitHub Actions created by GitHub (推荐)
- ✅ 允许GitHub官方Actions (如 actions/checkout)
- ✅ 可以选择性允许第三方Actions
- ✅ 更安全，防止恶意Actions
- ❌ 需要手动添加每个第三方Action

### 选项 2: Allow all actions and reusable workflows
- ✅ 允许所有Actions，无需手动配置
- ✅ 最大灵活性
- ❌ 安全风险较高
- ❌ 可能运行未验证的第三方代码

### 选项 3: Disable actions (当前设置)
- ❌ 禁用所有外部Actions
- ❌ 只能使用仓库内的Actions
- ❌ 严重限制CI/CD功能

## 🔍 常见问题

### Q: 为什么会有这个限制？
A: GitHub为了安全考虑，允许仓库所有者控制可以运行的Actions，防止恶意代码执行。

### Q: 修改权限安全吗？
A: 允许GitHub官方Actions是安全的。对于第三方Actions，建议只添加信任的来源。

### Q: 如何知道需要哪些Actions？
A: 查看工作流文件中的`uses:`语句，这些就是需要允许的Actions。

## 📝 需要允许的Actions列表

基于当前项目的工作流，需要允许以下Actions：

### GitHub官方Actions
- `actions/checkout@v4` - 代码检出
- `actions/setup-node@v4` - Node.js环境设置
- `actions/cache@v3` - 依赖缓存

### 第三方Actions
- `supabase/setup-cli@v1` - Supabase CLI设置

## 🚀 修复后的好处

权限修复后，您将能够：
- ✅ 使用完整的CI/CD流程
- ✅ 自动化Supabase数据库部署
- ✅ 自动化前端构建和部署
- ✅ 代码质量检查和测试
- ✅ 依赖缓存和性能优化

## 📞 获取帮助

如果遇到问题：
1. 检查Actions页面的错误日志
2. 确认权限设置已正确保存
3. 尝试重新推送代码触发工作流
4. 查看GitHub官方文档：https://docs.github.com/en/actions

---

**重要提醒**: 修改权限设置后，所有现有的工作流都应该能够正常运行。
