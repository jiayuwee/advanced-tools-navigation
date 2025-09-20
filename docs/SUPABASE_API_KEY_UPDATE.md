# Supabase API 密钥更新指南

## 🚨 问题描述
当前Supabase项目的legacy API密钥已被禁用，导致应用无法连接数据库，所有工具数据无法显示。

## 🔧 解决步骤

### 1. 获取新的API密钥

1. **访问Supabase控制台**
   - 打开：https://supabase.com/dashboard/project/fytiwsutzgmygfxnqoft/settings/api
   - 登录您的账户

2. **获取新密钥**
   - 在API设置页面找到 "Project API keys" 部分
   - 复制 `anon` `public` 密钥（新版本的publishable key）
   - 或者重新启用legacy keys（如果可用）

### 2. 更新环境配置

编辑 `.env.local` 文件，更新以下内容：

```bash
# 更新这个密钥
VITE_SUPABASE_ANON_KEY=sb_publishable_ldLDhQu2qPEppQcIabkYSQ_UDiVVHoV

# 确保URL正确
VITE_SUPABASE_URL=https://fytiwsutzgmygfxnqoft.supabase.co
```

### 3. 测试连接

运行修复脚本：
```bash
node scripts/fix-database-connection.js
```

### 4. 重新初始化数据（如需要）

如果数据库为空，运行：
```bash
node scripts/fix-database-connection.js --reinit
```

## 🔍 常见问题

### Q: 如何知道密钥是否正确？
A: 运行测试脚本，如果显示"✅ 数据库连接成功"则表示密钥正确。

### Q: 数据库表不存在怎么办？
A: 检查Supabase项目是否正确设置了表结构，可能需要重新运行数据库迁移。

### Q: 仍然无法连接？
A: 检查：
- 网络连接
- Supabase项目状态
- API密钥权限设置
- 项目URL是否正确

## 📋 检查清单

- [ ] 获取新的API密钥
- [ ] 更新 .env.local 文件
- [ ] 测试数据库连接
- [ ] 验证数据加载
- [ ] 确认应用正常显示工具

## 🚀 完成后

更新密钥后，应用应该能够：
- 正常加载工具分类
- 显示工具列表
- 支持搜索和筛选
- 用户认证功能正常

如果问题仍然存在，请检查浏览器控制台的错误信息。
