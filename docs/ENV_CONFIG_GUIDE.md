# 环境变量配置指南

## 概述

本项目使用环境变量来管理不同环境下的配置。本指南将帮助你正确配置生产和开发环境的环境变量。

## 环境变量文件结构

```
项目根目录/
├── .env.example          # 环境变量模板
├── .env.local           # 本地开发环境变量（不提交到git）
├── .env.development     # 开发环境默认配置
└── .env.production      # 生产环境默认配置（不包含敏感信息）
```

## 必需的环境变量

### Supabase 配置
```bash
# Supabase 项目 URL
VITE_SUPABASE_URL=https://your-project.supabase.co

# Supabase 匿名密钥（公开密钥，可以暴露在前端）
VITE_SUPABASE_ANON_KEY=your-anon-key

# Supabase 服务密钥（仅服务端使用，不要在前端暴露）
SUPABASE_SERVICE_KEY=your-service-key
```

### 应用基础配置
```bash
# 应用环境：development | production | test
VITE_APP_ENV=development

# 应用版本
VITE_APP_VERSION=1.0.0

# 调试模式：true | false
VITE_DEBUG_MODE=true

# 启用分析：true | false
VITE_ENABLE_ANALYTICS=false
```

## 可选的环境变量

### 支付配置

#### Stripe
```bash
VITE_STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

#### 支付宝
```bash
VITE_ALIPAY_APP_ID=your-app-id
ALIPAY_PRIVATE_KEY=your-private-key
VITE_ALIPAY_PUBLIC_KEY=your-public-key
```

#### 微信支付
```bash
VITE_WECHAT_APP_ID=your-app-id
WECHAT_MCH_ID=your-mch-id
WECHAT_API_KEY=your-api-key
```

## 配置步骤

### 1. 本地开发环境配置

1. 复制 `.env.example` 为 `.env.local`：
```bash
cp .env.example .env.local
```

2. 编辑 `.env.local` 文件，填入你的实际配置：
```bash
# 替换为你的 Supabase 项目信息
VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 开发环境配置
VITE_APP_ENV=development
VITE_DEBUG_MODE=true
VITE_ENABLE_ANALYTICS=false
```

### 2. Netlify 生产环境配置

#### 方法一：通过 Netlify 网站界面配置

1. 登录 [Netlify](https://netlify.com)
2. 进入你的站点设置
3. 点击 "Environment variables"
4. 添加以下环境变量：

```
VITE_SUPABASE_URL = https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY = your-anon-key
VITE_APP_ENV = production
VITE_DEBUG_MODE = false
VITE_ENABLE_ANALYTICS = true
```

#### 方法二：通过 netlify.toml 文件配置

在项目根目录创建或编辑 `netlify.toml`：

```toml
[build.environment]
  VITE_APP_ENV = "production"
  VITE_DEBUG_MODE = "false"
  VITE_ENABLE_ANALYTICS = "true"

# 敏感信息通过 Netlify 界面设置
# VITE_SUPABASE_URL = "https://your-project.supabase.co"
# VITE_SUPABASE_ANON_KEY = "your-anon-key"
```

### 3. 获取 Supabase 配置信息

1. 登录 [Supabase](https://supabase.com)
2. 选择你的项目
3. 进入 Settings → API
4. 复制以下信息：
   - Project URL → `VITE_SUPABASE_URL`
   - anon public → `VITE_SUPABASE_ANON_KEY`

## 环境变量验证

本项目包含自动环境变量验证功能：

- **开发环境**：启动时会显示详细的验证信息
- **生产环境**：验证失败时会使用默认配置，确保应用能正常运行

### 验证规则

1. **必需变量检查**：确保 Supabase URL 和密钥已设置
2. **格式验证**：检查 URL 格式和密钥长度
3. **默认值检测**：防止使用模板中的占位符
4. **环境特定建议**：根据环境提供配置建议

## 故障排除

### 常见问题

#### 1. "环境变量未设置" 错误
**解决方案**：检查 `.env.local` 文件是否存在且包含必需的变量

#### 2. "仍使用默认值" 错误
**解决方案**：确保已将模板中的 `your-project` 和 `your-anon-key` 替换为实际值

#### 3. Netlify 部署时环境变量不生效
**解决方案**：
- 确保在 Netlify 界面正确设置了环境变量
- 变量名必须以 `VITE_` 开头才能在前端使用
- 检查变量值是否包含特殊字符，可能需要引号包围

#### 4. 本地开发正常，部署后出错
**解决方案**：
- 检查生产环境的环境变量是否与本地一致
- 确保没有在代码中硬编码开发环境的配置
- 查看 Netlify 构建日志中的环境变量信息

### 调试技巧

1. **启用调试模式**：
```bash
VITE_DEBUG_MODE=true
```

2. **检查环境变量加载**：
在浏览器控制台查看启动日志

3. **验证 Supabase 连接**：
使用项目内的连接测试工具

## 安全注意事项

### 前端安全
- 只在 `VITE_` 开头的环境变量会暴露给前端
- 不要在前端环境变量中存储敏感信息
- Supabase anon key 是公开的，可以安全暴露

### 后端安全
- 服务密钥、私钥等敏感信息不要以 `VITE_` 开头
- 在 Netlify 函数中使用服务器端环境变量
- 定期轮换密钥和令牌

## 示例配置文件

### .env.example
```bash
# Supabase 配置
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# 应用配置
VITE_APP_ENV=development
VITE_APP_VERSION=1.0.0
VITE_DEBUG_MODE=true
VITE_ENABLE_ANALYTICS=false

# 支付配置（可选）
VITE_STRIPE_PUBLIC_KEY=pk_test_...
VITE_ALIPAY_APP_ID=your-app-id
VITE_WECHAT_APP_ID=your-app-id
```

### .env.local (开发环境)
```bash
# 开发环境配置
VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_APP_ENV=development
VITE_DEBUG_MODE=true
VITE_ENABLE_ANALYTICS=false
```

## 自动化配置

### GitHub Actions
如果使用 GitHub Actions 进行 CI/CD，在仓库设置中添加相应的 Secrets：

```yaml
# .github/workflows/deploy.yml
env:
  VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
  VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
  VITE_APP_ENV: production
```

### 脚本工具
项目包含配置检查脚本：

```bash
# 检查环境变量配置
npm run check:env

# 初始化环境变量模板
npm run init:env
```

通过遵循这个指南，你应该能够成功配置各种环境下的环境变量，确保应用在开发和生产环境中都能正常运行。