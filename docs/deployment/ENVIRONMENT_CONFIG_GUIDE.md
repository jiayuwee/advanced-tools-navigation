# =================================================================
# 环境配置和部署指南
# =================================================================

## 📋 文档概述

本指南提供完整的环境配置、部署流程和平台兼容性说明。

## 🔧 环境变量配置

### 前端环境变量 (VITE_前缀)

这些变量在构建时被嵌入到前端代码中，请妥善保管：

```bash
# ==================================================
# 必需的环境变量 - 所有环境都需要
# ==================================================

# Supabase 配置
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# 应用基本信息
VITE_APP_NAME="高效工具导航站"
VITE_APP_DESCRIPTION="现代化设计的工具导航平台"
VITE_APP_URL=https://ramusi.cn

# ==================================================
# 可选的环境变量 - 根据功能需求配置
# ==================================================

# Stripe 支付（如果使用）
VITE_STRIPE_PUBLIC_KEY=pk_live_your_publishable_key

# 应用环境标识
VITE_APP_ENV=production  # development | production | test

# 调试模式（生产环境请设为 false）
VITE_DEBUG_MODE=false

# 启用分析统计
VITE_ENABLE_ANALYTICS=true
```

### 后端环境变量 (服务器专用)

这些变量仅在服务器端使用，**切勿以VITE_前缀**：

```bash
# ==================================================
# 后端专用变量 - 请勿提交到版本控制系统
# ==================================================

# Stripe 私钥（服务器签名使用）
STRIPE_SECRET_KEY=sk_live_your_secret_key

# 支付宝配置（服务器签名使用）
ALIPAY_APP_ID=your_app_id
ALIPAY_PRIVATE_KEY_FILE=/secure/path/alipay_private_key.pem
ALIPAY_PUBLIC_KEY_FILE=/secure/path/alipay_public_key.pem

# 微信支付配置（服务器签名使用）
WECHAT_MCH_ID=your_merchant_id
WECHAT_API_V3_KEY=your_v3_key_32_bytes
WECHAT_PRIVATE_KEY_FILE=/secure/path/wechat_private_key.pem
WECHAT_PLATFORM_CERT_FILE=/secure/path/platform_cert.pem
WECHAT_APICLIENT_P12_FILE=/secure/path/apiclient_cert.p12
WECHAT_APICLIENT_P12_PASSWORD=your_p12_password
```

## 🚀 平台部署配置

### Netlify 部署

#### 1. 环境变量配置

在 Netlify 控制台的 "Site Settings" > "Build & Deploy" > "Environment variables" 中设置：

```
# 必需变量
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx

# 可选变量（根据功能需求）
VITE_STRIPE_PUBLIC_KEY=pk_live_xxx
VITE_APP_ENV=production
VITE_DEBUG_MODE=false
VITE_ENABLE_ANALYTICS=true
```

#### 2. 构建配置

`netlify.toml` 已优化配置：

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "20.x"
  NODE_ENV = "production"
  NPM_CONFIG_PREFER_OFFLINE = "true"

[context.production.environment]
  VITE_APP_ENV = "production"
  NODE_OPTIONS = "--max-old-space-size=4096"
```

#### 3. 部署流程

1. 代码推送到 main 分支
2. 触发 CI 检查（ESLint + TypeScript + 测试）
3. Netlify 自动拉取构建产物并部署
4. 部署完成后可通过 https://ramusi.cn 访问

### Vercel 部署

#### 环境变量配置

在 Vercel 项目设置中添加环境变量：

```bash
# 生产环境
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
VITE_APP_ENV=production

# 预览环境（可选）
VERCEL_ENV=preview
```

#### 构建配置

`vercel.json` 配置：

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

### GitHub Pages 部署

#### 环境变量配置

GitHub Pages 不支持运行时环境变量，所有配置需要在构建时设置：

```bash
# 在 GitHub Actions 中设置
- name: Build
  run: |
    echo "VITE_SUPABASE_URL=${{ secrets.VITE_SUPABASE_URL }}" >> .env.production
    npm run build:gh-pages
```

## 🔒 安全性配置

### GitHub Secrets 配置

在仓库 Settings > Secrets and variables > Actions 中配置：

```
# 必需的 Secrets
SUPABASE_ACCESS_TOKEN=your_personal_access_token
SUPABASE_PROJECT_REF=your_project_ref
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key

# 部署相关
NETLIFY_AUTH_TOKEN=your_netlify_token
NETLIFY_SITE_ID=your_site_id
```

### 敏感文件管理

```
📁 项目结构建议：
project/
├── .env.local          # 开发环境（已加入 .gitignore）
├── .env.production     # 生产环境（已加入 .gitignore）
├── .npmrc             # NPM 配置
└── secure/            # 敏感文件目录（已加入 .gitignore）
    ├── alipay_private_key.pem
    ├── wechat_private_key.pem
    └── certificates/
```

### .gitignore 配置

确保以下文件不被提交：

```gitignore
# 环境变量文件
.env
.env.local
.env.*.local
.env.production
.env.staging

# 敏感文件
secure/
*.pem
*.p12
*.key
*.crt

# 构建产物
dist/
build/
.next/
.nuxt/

# 依赖和缓存
node_modules/
.npm/
.yarn/
```

## 🏗️ 构建优化配置

### NPM 优化配置 (.npmrc)

```bash
# 禁用平台特定依赖，避免构建失败
optional=false

# 优化网络请求
prefer-offline=true
progress=false

# 安全和兼容性
audit=false
fund=false

# 严格版本控制
save-exact=false
```

### Vite 构建优化

`vite.config.ts` 已包含优化配置：

```typescript
export default defineConfig({
  build: {
    target: 'es2015',
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router'],
          supabase: ['@supabase/supabase-js'],
        }
      }
    }
  }
})
```

## 🔍 环境验证和诊断

### 使用内置诊断工具

```bash
# 检查环境变量配置
npm run env:check

# 检查 GitHub Secrets
npm run secrets:check

# 验证 Supabase 连接
npm run supabase:verify

# 全面部署诊断
npm run deployment:diagnose
```

### 手动验证步骤

#### 1. 本地开发环境测试

```bash
# 复制环境变量模板
cp .env.example .env.local

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 验证应用正常运行
```

#### 2. 构建测试

```bash
# 本地构建测试
npm run build

# 预览构建结果
npm run preview

# 检查构建产物
ls -la dist/
```

#### 3. 生产环境模拟

```bash
# 使用生产环境变量构建
VITE_APP_ENV=production npm run build

# 验证生产构建
npm run build:verify
```

## 📊 监控和告警

### 自动化健康检查

项目已配置自动监控：

1. **GitHub Actions 健康检查** - 每小时运行
2. **部署状态监控** - 集成到 CI/CD 流程
3. **Supabase 连接监控** - 数据库健康检查

### 手动监控命令

```bash
# 运行健康检查
npm run health:check

# 监控部署状态
npm run deployment:monitor

# 检查系统状态
npm run system:status
```

## 🐛 故障排除

### 常见的配置问题

#### 1. 构建失败：Rollup 二进制兼容性

```bash
# 检查 .npmrc 配置
cat .npmrc

# 清理 node_modules 并重新安装
rm -rf node_modules package-lock.json
npm install
```

#### 2. 环境变量未生效

```bash
# 检查环境变量
npm run env:check

# 验证 Vite 环境变量
npx vite --mode development --debug
```

#### 3. Supabase 连接失败

```bash
# 检查网络连接
curl -I https://your-project.supabase.co

# 验证 API 密钥
npm run supabase:verify
```

#### 4. 支付功能异常

```bash
# 检查支付配置
npm run payment:check

# 验证密钥文件路径
ls -la secure/
```

### 平台特定的问题解决

#### Netlify 部署问题

```bash
# 检查构建日志
# 访问: https://app.netlify.com/sites/your-site/deploys

# 常见解决方案：
# 1. 检查 NODE_VERSION（推荐 20.x）
# 2. 清理缓存重新部署
# 3. 检查 .npmrc 配置
```

#### Vercel 部署问题

```bash
# 检查部署日志
# 访问: https://vercel.com/dashboard

# 常见解决方案：
# 1. 检查构建命令
# 2. 验证环境变量
# 3. 检查路由配置
```

## 📋 部署检查清单

### 部署前检查

- [ ] 环境变量配置完整
- [ ] 敏感文件路径正确
- [ ] GitHub Secrets 已设置
- [ ] 本地构建测试通过
- [ ] 数据库迁移就绪

### 部署后验证

- [ ] 网站可正常访问
- [ ] Supabase 连接正常
- [ ] 支付功能测试通过
- [ ] 静态资源加载正常
- [ ] 监控告警配置完成

## 🔗 相关文档

- [部署流程说明](../deployment/DEPLOYMENT.md)
- [安全配置指南](../SECURITY_AND_ENV_CONFIG.md)
- [Supabase 配置指南](../guides/SUPABASE_SETUP.md)
- [工作流优化总结](../deployment/WORKFLOW_OPTIMIZATION_SUMMARY.md)

## 📞 技术支持

如遇配置问题，请按以下顺序排查：

1. 查看本文档的故障排除部分
2. 检查相关项目的 Issues
3. 运行诊断脚本收集信息
4. 在项目仓库提交 Issue

---

**最后更新**: 2025-01-05
**版本**: 1.1.0
