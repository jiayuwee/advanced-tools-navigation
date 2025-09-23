# 支付网关配置指南

## 重要提示
请将 `.env` 文件中的占位符替换为您的真实生产环境密钥。以下是获取各支付平台密钥的步骤：

## 1. Stripe 配置

### 获取 Stripe 密钥：
1. 访问 [Stripe Dashboard](https://dashboard.stripe.com/)
2. 登录您的 Stripe 账户
3. 导航到 **开发者** > **API密钥**
4. 复制您的 **公开密钥** (pk_live_...) 和 **秘密密钥** (sk_live_...)

### 更新配置：
```env
VITE_STRIPE_PUBLIC_KEY=YOUR_STRIPE_PUBLISHABLE_KEY
VITE_STRIPE_SECRET_KEY=YOUR_STRIPE_SECRET_KEY
```

## 2. 支付宝配置

### 获取支付宝密钥：
1. 访问 [支付宝开放平台](https://open.alipay.com/)
2. 登录并创建应用
3. 获取应用 APPID
4. 生成应用私钥和获取支付宝公钥

### 密钥生成工具：
- 下载支付宝官方 [RSA密钥生成工具](https://opendocs.alipay.com/common/02kipl)
- 生成 RSA2 格式的密钥对

### 更新配置：
```env
VITE_ALIPAY_APP_ID=您的真实应用APPID
VITE_ALIPAY_PRIVATE_KEY=您的应用私钥
VITE_ALIPAY_PUBLIC_KEY=支付宝公钥
```

## 3. 微信支付配置

### 获取微信支付密钥：
1. 访问 [微信支付商户平台](https://pay.weixin.qq.com/)
2. 登录商户账户
3. 获取商户号 (mch_id)
4. 在 **账户中心** > **API安全** 中设置API密钥

### 更新配置：
```env
VITE_WECHAT_APP_ID=您的微信应用ID
VITE_WECHAT_MCH_ID=您的商户号
VITE_WECHAT_API_KEY=您的API密钥
```

## 4. 安全注意事项

⚠️ **重要安全提示：**
- 永远不要将真实的生产环境密钥提交到版本控制系统
- 确保 `.env` 文件已添加到 `.gitignore`
- 在生产环境中使用环境变量而不是配置文件
- 定期轮换您的API密钥
- 限制API密钥的权限范围

## 5. 测试环境配置

在开发阶段，建议使用各平台的沙箱/测试环境：
- Stripe: 使用 `pk_test_` 和 `sk_test_` 前缀的测试密钥
- 支付宝: 使用沙箱环境的APPID和密钥
- 微信支付: 使用测试商户号

## 6. 下一步
配置完成后，请运行以下命令测试支付功能：
```bash
npm run dev
```

然后访问支付页面进行测试。