# Supabase 部署指南

本指南将帮助您将项目部署到 Supabase 并配置数据库。

## 🚀 快速开始

### 1. 创建 Supabase 项目

1. 访问 [Supabase Dashboard](https://supabase.com/dashboard)
2. 点击 "New Project"
3. 选择组织（jiayuwee）
4. 填写项目信息：
   - **Name**: `advanced-tools-navigation`
   - **Database Password**: 设置一个强密码
   - **Region**: 选择离用户最近的区域（推荐 Singapore）
5. 点击 "Create new project"

### 2. 获取项目配置信息

项目创建完成后，在 Settings > API 页面获取：
- **Project URL**: `https://your-project-ref.supabase.co`
- **Project Reference ID**: `your-project-ref`
- **anon public key**: `eyJ...`
- **service_role key**: `eyJ...` (仅用于服务端)

### 3. 配置环境变量

#### 本地开发
创建 `.env.local` 文件：
```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

#### GitHub Actions
在 GitHub 仓库设置中添加以下 Secrets：
```
SUPABASE_ACCESS_TOKEN=your-access-token
SUPABASE_PROJECT_REF=your-project-ref
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

#### Netlify 部署
在 Netlify 站点设置中添加环境变量：
```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 📊 数据库设置

### 自动部署（推荐）
1. 推送代码到 `main` 分支
2. GitHub Actions 会自动运行数据库迁移
3. 检查 Actions 日志确认部署成功

### 手动部署
```bash
# 安装 Supabase CLI
npm install -g supabase

# 登录 Supabase
supabase login

# 链接到项目
supabase link --project-ref your-project-ref

# 运行迁移
supabase db push

# 重置数据库（如果需要）
supabase db reset
```

## 🔐 认证设置

### 邮箱认证
1. 在 Supabase Dashboard > Authentication > Settings
2. 配置 SMTP 设置或使用 Supabase 内置邮件服务
3. 设置邮件模板

### 第三方登录（可选）
#### GitHub 登录
1. 在 GitHub 创建 OAuth App
2. 在 Supabase Dashboard > Authentication > Providers 启用 GitHub
3. 配置 Client ID 和 Client Secret

#### Google 登录
1. 在 Google Cloud Console 创建 OAuth 2.0 客户端
2. 在 Supabase Dashboard > Authentication > Providers 启用 Google
3. 配置 Client ID 和 Client Secret

### 重定向 URL 配置
在 Authentication > URL Configuration 添加：
```
https://ramusi.cn
https://spiffy-torrone-5454e1.netlify.app
http://localhost:3000
```

## 🗄️ 存储设置

### 存储桶
项目包含以下存储桶：
- `avatars`: 用户头像（公开）
- `product-images`: 产品图片（公开）
- `tool-icons`: 工具图标（公开）
- `uploads`: 用户上传文件（私有）

### 存储策略
存储策略已在迁移文件中定义，会自动应用。

## 🔧 本地开发

### 启动本地 Supabase
```bash
# 启动本地 Supabase 服务
supabase start

# 查看服务状态
supabase status

# 停止服务
supabase stop
```

### 本地服务地址
- **API URL**: http://localhost:54321
- **DB URL**: postgresql://postgres:postgres@localhost:54322/postgres
- **Studio URL**: http://localhost:54323
- **Inbucket URL**: http://localhost:54324

### 数据库管理
```bash
# 创建新迁移
supabase migration new migration_name

# 应用迁移
supabase db push

# 重置本地数据库
supabase db reset

# 生成类型定义
supabase gen types typescript --local > src/types/database.ts
```

## 📈 监控和分析

### 数据库监控
- 在 Supabase Dashboard > Reports 查看数据库性能
- 监控 API 使用情况和错误率
- 设置告警通知

### 日志查看
```bash
# 查看实时日志
supabase logs

# 查看特定服务日志
supabase logs --type api
supabase logs --type db
```

## 🔒 安全配置

### 行级安全策略 (RLS)
- 所有表都启用了 RLS
- 用户只能访问自己的数据
- 管理员有额外权限

### API 密钥管理
- 仅在客户端使用 `anon` 密钥
- 服务端操作使用 `service_role` 密钥
- 定期轮换密钥

### 数据备份
- Supabase 自动备份数据库
- 可以手动创建备份点
- 支持时间点恢复

## 🚨 故障排除

### 常见问题

**连接失败**
- 检查 URL 和密钥是否正确
- 确认网络连接正常
- 查看 Supabase 服务状态

**迁移失败**
- 检查 SQL 语法错误
- 确认权限设置正确
- 查看迁移日志

**认证问题**
- 检查重定向 URL 配置
- 确认邮件设置正确
- 验证第三方登录配置

### 获取帮助
- [Supabase 文档](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)
- [GitHub Issues](https://github.com/supabase/supabase/issues)

## 📋 部署检查清单

- [ ] Supabase 项目已创建
- [ ] 环境变量已配置
- [ ] 数据库迁移已运行
- [ ] 认证设置已配置
- [ ] 存储桶已创建
- [ ] RLS 策略已启用
- [ ] 前端已部署到 Netlify
- [ ] 域名已配置
- [ ] SSL 证书已启用
- [ ] 监控已设置

## 🔄 持续部署

### 自动化流程
1. 代码推送到 `main` 分支
2. GitHub Actions 运行数据库迁移
3. Netlify 自动部署前端
4. 部署完成通知

### 版本管理
- 使用语义化版本号
- 标记重要发布版本
- 维护变更日志

---

更多详细信息请参考：
- [Supabase 官方文档](https://supabase.com/docs)
- [项目部署指南](./DEPLOYMENT.md)
