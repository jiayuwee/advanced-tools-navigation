# 部署指南

## 📋 部署概览

本指南将帮助您将 Ramusi 工具导航站部署到生产环境。项目支持多种部署方式，推荐使用 Netlify + Supabase 的组合。

## 🏗️ 架构概览

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   前端 (Netlify) │    │  数据库 (Supabase) │    │   CDN (Netlify)  │
│                 │    │                 │    │                 │
│ • Vue 3 应用     │◄──►│ • PostgreSQL    │    │ • 静态资源       │
│ • 静态文件       │    │ • 实时订阅       │    │ • 图片优化       │
│ • 自动部署       │    │ • 认证系统       │    │ • 全球分发       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 快速部署

### 方式一：一键部署到 Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/jiayuwee/advanced-tools-navigation)

1. 点击上方按钮
2. 连接您的 GitHub 账户
3. 配置环境变量
4. 等待自动部署完成

### 方式二：手动部署

#### 1. 准备工作

**前置要求:**
- Node.js 18+ 
- npm 或 yarn
- Git
- Supabase 账户
- Netlify 账户

#### 2. 克隆项目

```bash
git clone https://github.com/jiayuwee/advanced-tools-navigation.git
cd advanced-tools-navigation
```

#### 3. 安装依赖

```bash
# 使用 npm
npm install

# 或使用 yarn
yarn install
```

#### 4. 配置环境变量

复制环境变量模板：

```bash
cp .env.example .env.local
```

编辑 `.env.local` 文件：

```env
# Supabase 配置
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# 应用配置
VITE_APP_NAME=Ramusi 工具导航站
VITE_APP_URL=https://your-domain.com
VITE_APP_DESCRIPTION=现代化的工具发现和管理平台

# 功能开关
VITE_PERFORMANCE_MONITORING=true
VITE_ERROR_TRACKING=true
VITE_ANALYTICS_ENABLED=true
VITE_NOTIFICATIONS_ENABLED=true
VITE_REVIEWS_ENABLED=true
VITE_THEME_SWITCHING=true

# 开发环境配置
VITE_DEV_MODE=false
VITE_MOCK_DATA=false
```

#### 5. 构建项目

```bash
# 运行构建
npm run build

# 或使用优化构建
npm run build:optimize
```

#### 6. 部署到 Netlify

**方式 A: 通过 Netlify CLI**

```bash
# 安装 Netlify CLI
npm install -g netlify-cli

# 登录 Netlify
netlify login

# 部署
netlify deploy --prod --dir=dist
```

**方式 B: 通过 Git 集成**

1. 将代码推送到 GitHub
2. 在 Netlify 中连接 GitHub 仓库
3. 配置构建设置：
   - Build command: `npm run build`
   - Publish directory: `dist`
4. 配置环境变量
5. 触发部署

## 🗄️ 数据库设置

### 1. 创建 Supabase 项目

1. 访问 [Supabase](https://supabase.com)
2. 创建新项目
3. 等待数据库初始化完成

### 2. 运行数据库迁移

```bash
# 安装 Supabase CLI
npm install -g supabase

# 登录 Supabase
supabase login

# 链接项目
supabase link --project-ref your-project-ref

# 运行迁移
supabase db push
```

### 3. 设置行级安全策略

数据库迁移会自动创建必要的安全策略，包括：

- 用户数据隔离
- 角色权限控制
- 数据访问限制

### 4. 配置认证

在 Supabase 控制台中配置：

1. **认证设置**
   - 启用邮箱认证
   - 配置邮件模板
   - 设置重定向 URL

2. **第三方登录** (可选)
   - Google OAuth
   - GitHub OAuth
   - 其他社交登录

3. **安全设置**
   - JWT 过期时间
   - 密码策略
   - 会话管理

## 🌐 域名配置

### 1. 自定义域名

在 Netlify 控制台中：

1. 进入 Site settings > Domain management
2. 添加自定义域名
3. 配置 DNS 记录：

```
Type: CNAME
Name: www
Value: your-site-name.netlify.app

Type: A
Name: @
Value: 75.2.60.5
```

### 2. SSL 证书

Netlify 会自动为您的域名提供免费的 Let's Encrypt SSL 证书。

### 3. 重定向配置

创建 `public/_redirects` 文件：

```
# SPA 路由重定向
/*    /index.html   200

# 强制 HTTPS
http://your-domain.com/*    https://your-domain.com/:splat    301!
http://www.your-domain.com/*    https://www.your-domain.com/:splat    301!

# API 代理 (如果需要)
/api/*    https://your-api-domain.com/api/:splat    200
```

## 🔧 环境配置

### 生产环境变量

在 Netlify 控制台的 Environment variables 中配置：

```env
# 必需变量
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_APP_URL=https://your-domain.com

# 可选变量
VITE_ANALYTICS_ID=your-analytics-id
VITE_SENTRY_DSN=your-sentry-dsn
VITE_STRIPE_PUBLIC_KEY=your-stripe-key
```

### 构建优化

在 `netlify.toml` 中配置构建优化：

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"
  NPM_VERSION = "9"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "*.js"
  [headers.values]
    Cache-Control = "public, max-age=31536000"

[[headers]]
  for = "*.css"
  [headers.values]
    Cache-Control = "public, max-age=31536000"

[[headers]]
  for = "/manifest.json"
  [headers.values]
    Cache-Control = "public, max-age=86400"
```

## 📊 监控和分析

### 1. 性能监控

集成性能监控服务：

```typescript
// 在 main.ts 中
import { performanceService } from '@/services/performanceService'

// 启用性能监控
if (import.meta.env.VITE_PERFORMANCE_MONITORING === 'true') {
  performanceService.init({
    apiKey: import.meta.env.VITE_PERFORMANCE_API_KEY,
    environment: 'production'
  })
}
```

### 2. 错误追踪

配置错误追踪服务：

```typescript
// 错误边界
app.config.errorHandler = (err, vm, info) => {
  console.error('Vue Error:', err, info)
  
  if (import.meta.env.VITE_ERROR_TRACKING === 'true') {
    errorReporting.captureException(err, { context: info })
  }
}
```

### 3. 用户分析

集成分析服务：

```typescript
// 页面访问统计
router.afterEach((to) => {
  if (import.meta.env.VITE_ANALYTICS_ENABLED === 'true') {
    analytics.track('page_view', {
      page: to.path,
      title: to.meta.title
    })
  }
})
```

## 🔄 CI/CD 配置

### GitHub Actions

项目已配置自动化 CI/CD 流程：

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm run test:run
      
      - name: Build
        run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
      
      - name: Deploy to Netlify
        uses: netlify/actions/cli@master
        with:
          args: deploy --prod --dir=dist
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

### 部署钩子

配置部署后钩子：

```bash
# 部署成功通知
curl -X POST "https://api.slack.com/webhooks/..." \
  -d '{"text":"🚀 Ramusi 部署成功！"}'

# 清理缓存
curl -X POST "https://api.cloudflare.com/client/v4/zones/.../purge_cache"
```

## 🔍 故障排除

### 常见问题

1. **构建失败**
   - 检查 Node.js 版本
   - 清理 node_modules 重新安装
   - 检查环境变量配置

2. **数据库连接失败**
   - 验证 Supabase URL 和密钥
   - 检查网络连接
   - 确认数据库状态

3. **部署后页面空白**
   - 检查控制台错误
   - 验证路由配置
   - 确认静态资源路径

### 调试工具

```bash
# 本地调试
npm run dev

# 构建调试
npm run build && npm run preview

# 性能分析
npm run analyze

# 部署检查
npm run pre-deploy
```

## 📚 相关文档

- [Netlify 文档](https://docs.netlify.com/)
- [Supabase 文档](https://supabase.com/docs)
- [Vue 3 文档](https://vuejs.org/)
- [Vite 文档](https://vitejs.dev/)

---

*最后更新: 2024年12月27日*
*部署版本: v2.0.0*
