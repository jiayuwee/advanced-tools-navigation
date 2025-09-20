# 🔐 环境配置和安全设置指南

## 📋 环境变量配置

### 开发环境 (.env.local)
创建 `.env.local` 文件（不要提交到 Git）：

```bash
# Supabase 配置
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# 应用配置
VITE_APP_VERSION=dev
VITE_APP_ENV=development
VITE_DEBUG_MODE=true
VITE_ENABLE_ANALYTICS=false

# 支付配置（开发环境）
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_ALIPAY_APP_ID=test_app_id
```

### 生产环境 (Netlify 环境变量)
在 Netlify 控制台设置以下环境变量：

```bash
# 必需的环境变量
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_production_anon_key

# 应用配置
VITE_APP_ENV=production
VITE_DEBUG_MODE=false
VITE_ENABLE_ANALYTICS=true

# 支付配置（生产环境）
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
VITE_ALIPAY_APP_ID=production_app_id
```

### GitHub Secrets 配置
在 GitHub 仓库设置以下 Secrets：

```bash
# Supabase
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY

# Netlify 部署
NETLIFY_AUTH_TOKEN
NETLIFY_SITE_ID

# 可选：通知和监控
SLACK_WEBHOOK_URL
DISCORD_WEBHOOK_URL
```

## 🛡️ 安全配置

### 1. Supabase 安全设置

#### RLS (Row Level Security) 策略
```sql
-- 启用 RLS
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 用户只能访问公开内容
CREATE POLICY "Public tools are viewable by everyone" 
  ON tools FOR SELECT 
  USING (is_public = true);

-- 用户只能修改自己的数据
CREATE POLICY "Users can update own profile" 
  ON user_profiles FOR UPDATE 
  USING (auth.uid() = id);
```

#### 存储桶安全策略
```sql
-- 头像上传策略
CREATE POLICY "Avatar upload policy" 
  ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 产品图片上传策略（仅管理员）
CREATE POLICY "Product images admin only" 
  ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'product-images' AND auth.uid() IN (
    SELECT id FROM user_profiles WHERE role IN ('admin', 'super_admin')
  ));
```

### 2. Netlify 安全设置

#### Headers 配置 (netlify.toml)
```toml
[[headers]]
  for = "/*"
  [headers.values]
    # 安全头部
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"
    
    # HTTPS 强制
    Strict-Transport-Security = "max-age=31536000; includeSubDomains"
    
    # 内容安全策略
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co https://api.stripe.com"

[[headers]]
  for = "/api/*"
  [headers.values]
    # API 特定头部
    Access-Control-Allow-Origin = "https://ramusi.cn"
    Access-Control-Allow-Methods = "GET, POST, PUT, DELETE, OPTIONS"
    Access-Control-Allow-Headers = "Content-Type, Authorization"
```

### 3. 环境变量验证

#### 客户端验证 (src/utils/envValidation.ts)
```typescript
interface EnvConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  appEnv: 'development' | 'production' | 'test';
  debugMode: boolean;
  enableAnalytics: boolean;
}

export function validateEnvironment(): EnvConfig {
  const requiredVars = {
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
  };

  // 检查必需变量
  for (const [key, value] of Object.entries(requiredVars)) {
    if (!value || value.includes('your-project') || value.includes('your-anon-key')) {
      throw new Error(`环境变量 ${key} 未正确配置`);
    }
  }

  return {
    supabaseUrl: requiredVars.VITE_SUPABASE_URL,
    supabaseAnonKey: requiredVars.VITE_SUPABASE_ANON_KEY,
    appEnv: (import.meta.env.VITE_APP_ENV as any) || 'development',
    debugMode: import.meta.env.VITE_DEBUG_MODE === 'true',
    enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  };
}
```

### 4. API 密钥管理

#### 密钥轮换策略
```bash
# 定期更新 Supabase 密钥（建议每90天）
supabase projects api-keys --project-ref your-project-ref

# 更新 Netlify 部署密钥（建议每180天）
netlify api tokens create --description "GitHub Actions Deploy"
```

#### 密钥存储最佳实践
- ✅ 使用 GitHub Secrets 存储敏感信息
- ✅ 使用 Netlify 环境变量存储部署配置
- ✅ 定期轮换 API 密钥
- ❌ 不要在代码中硬编码密钥
- ❌ 不要在 .env 文件中存储生产密钥

### 5. 监控和告警

#### 安全事件监控
```javascript
// src/utils/securityMonitor.ts
export class SecurityMonitor {
  static logSecurityEvent(event: string, details: any) {
    if (import.meta.env.PROD) {
      // 发送到监控服务
      console.warn(`Security Event: ${event}`, details);
    }
  }

  static detectAnomalousActivity(user: any) {
    // 检测异常活动模式
    const suspiciousPatterns = [
      'rapid_login_attempts',
      'unusual_access_patterns',
      'privilege_escalation_attempts'
    ];
    
    // 实现检测逻辑
  }
}
```

#### 错误监控集成
```typescript
// src/utils/errorTracking.ts
import { SecurityMonitor } from './securityMonitor';

export function setupErrorTracking() {
  window.addEventListener('error', (event) => {
    SecurityMonitor.logSecurityEvent('javascript_error', {
      message: event.message,
      filename: event.filename,
      line: event.lineno,
      timestamp: Date.now()
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    SecurityMonitor.logSecurityEvent('unhandled_promise_rejection', {
      reason: event.reason,
      timestamp: Date.now()
    });
  });
}
```

## 🔍 安全检查清单

### 部署前检查
- [ ] 所有环境变量已正确配置
- [ ] Supabase RLS 策略已启用
- [ ] 敏感信息未暴露在客户端
- [ ] HTTPS 已强制启用
- [ ] 安全头部已配置
- [ ] CSP 策略已设置
- [ ] API 密钥已更新

### 定期安全维护
- [ ] 每月检查依赖包安全更新
- [ ] 每季度轮换 API 密钥
- [ ] 每半年审查权限设置
- [ ] 持续监控安全日志

### 应急响应计划
- [ ] 密钥泄露应对流程
- [ ] 安全事件报告机制
- [ ] 系统回滚计划
- [ ] 用户通知程序

## 📞 获取帮助

如需安全配置帮助：
1. 查看 [Supabase 安全文档](https://supabase.com/docs/guides/auth/row-level-security)
2. 参考 [Netlify 安全指南](https://docs.netlify.com/security/)
3. 联系系统管理员
4. 提交安全问题到 GitHub Issues