# 订单与支付API文档

<cite>
**本文档引用的文件**
- [orderService.ts](file://src/services/orderService.ts)
- [paymentService.ts](file://src/services/paymentService.ts)
- [StripePayment.vue](file://src/components/StripePayment.vue)
- [AlipayPayment.vue](file://src/components/AlipayPayment.vue)
- [WechatPayment.vue](file://src/components/WechatPayment.vue)
- [PaymentView.vue](file://src/views/PaymentView.vue)
- [index.ts](file://src/types/index.ts)
</cite>

## 目录
1. [简介](#简介)
2. [项目架构概览](#项目架构概览)
3. [核心服务组件](#核心服务组件)
4. [订单管理服务](#订单管理服务)
5. [支付集成服务](#支付集成服务)
6. [支付组件实现](#支付组件实现)
7. [支付流程详解](#支付流程详解)
8. [安全最佳实践](#安全最佳实践)
9. [错误处理策略](#错误处理策略)
10. [性能优化建议](#性能优化建议)
11. [故障排除指南](#故障排除指南)
12. [总结](#总结)

## 简介

本文档详细介绍了基于Vue 3和TypeScript构建的订单管理系统与支付集成API。该系统提供了完整的订单生命周期管理，支持多种支付方式（Stripe、支付宝、微信支付），并实现了安全可靠的支付流程。

系统采用现代化的前端架构，结合Supabase数据库，为用户提供流畅的购物体验和安全的支付保障。通过模块化的服务设计，确保了系统的可维护性和扩展性。

## 项目架构概览

```mermaid
graph TB
subgraph "前端层"
A[PaymentView.vue]
B[StripePayment.vue]
C[AlipayPayment.vue]
D[WechatPayment.vue]
end
subgraph "服务层"
E[OrderService]
F[PaymentService]
G[AuthService]
end
subgraph "数据层"
H[Supabase数据库]
I[订单表]
J[支付表]
K[用户表]
end
subgraph "第三方支付"
L[Stripe API]
M[支付宝开放平台]
N[微信支付]
end
A --> E
A --> F
B --> F
C --> F
D --> F
E --> H
F --> H
F --> L
F --> M
F --> N
G --> H
```

**图表来源**
- [PaymentView.vue](file://src/views/PaymentView.vue#L1-L50)
- [orderService.ts](file://src/services/orderService.ts#L1-L30)
- [paymentService.ts](file://src/services/paymentService.ts#L1-L30)

## 核心服务组件

系统的核心功能由两个主要服务类提供：

### OrderService - 订单管理服务
负责订单的创建、查询、状态管理和支付处理。

### PaymentService - 支付集成服务  
集成多种支付网关，提供统一的支付接口。

**章节来源**
- [orderService.ts](file://src/services/orderService.ts#L1-L50)
- [paymentService.ts](file://src/services/paymentService.ts#L1-L50)

## 订单管理服务

### 核心功能概述

```mermaid
classDiagram
class OrderService {
+createOrder(orderData, userId) Promise~Order~
+processPayment(paymentData) Promise~void~
+getUserOrders(userId) Promise~Order[]~
+getOrderById(orderId, userId) Promise~Order~
+cancelOrder(orderId, userId) Promise~void~
+verifyDownloadPermission(productId, userId) Promise~boolean~
+getAllOrders(filters) Promise~PaginatedOrders~
+updateOrderStatus(orderId, status, adminUserId) Promise~void~
+getOrderStats() Promise~OrderStats~
+exportOrders(filters) Promise~string~
}
class Order {
+string id
+string user_id
+OrderItem[] items
+number total_amount
+string currency
+string status
+string payment_method
+string payment_id
+BillingAddress billing_address
+string created_at
+string updated_at
+string completed_at
}
class OrderItem {
+string id
+string order_id
+string product_id
+number quantity
+number unit_price
+number total_price
+string created_at
+Product product
}
class BillingAddress {
+string full_name
+string email
+string phone
+string country
+string state
+string city
+string address
+string postal_code
}
OrderService --> Order : "管理"
Order --> OrderItem : "包含"
Order --> BillingAddress : "使用"
```

**图表来源**
- [orderService.ts](file://src/services/orderService.ts#L10-L50)
- [index.ts](file://src/types/index.ts#L100-L150)

### 订单创建流程

```mermaid
sequenceDiagram
participant User as 用户
participant View as PaymentView
participant OrderService as OrderService
participant DB as Supabase数据库
participant Product as 产品服务
User->>View : 提交订单信息
View->>OrderService : createOrder(orderData, userId)
OrderService->>Product : 验证产品信息
Product-->>OrderService : 产品详情
OrderService->>DB : 创建订单记录
DB-->>OrderService : 订单ID
OrderService->>DB : 创建订单项
DB-->>OrderService : 订单项ID
OrderService-->>View : 返回完整订单
View-->>User : 显示支付选项
```

**图表来源**
- [orderService.ts](file://src/services/orderService.ts#L50-L150)
- [PaymentView.vue](file://src/views/PaymentView.vue#L250-L300)

### 支付处理机制

订单支付处理采用乐观锁机制，确保支付状态的一致性：

```typescript
// 支付处理示例
static async processPayment(paymentData: PaymentData): Promise<void> {
  try {
    const orderUpdateData: OrderUpdateData = {
      status: "paid",
      payment_method: paymentData.payment_method,
      payment_id: paymentData.payment_id,
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // 使用状态过滤确保只更新待支付订单
    const { error } = await supabase
      .from("orders")
      .update(orderUpdateData)
      .eq("id", paymentData.order_id)
      .eq("status", "pending");

    if (error) throw error;

    // 创建支付记录
    const paymentInsertData: PaymentInsertData = {
      order_id: paymentData.order_id,
      amount: paymentData.amount,
      currency: "CNY",
      payment_method: paymentData.payment_method,
      provider_payment_id: paymentData.payment_id,
      status: "completed",
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { error: paymentError } = await supabase
      .from("payments")
      .insert([paymentInsertData]);

    if (paymentError) throw paymentError;
  } catch (error) {
    console.error("处理支付失败:", error);
    throw new Error("处理支付失败");
  }
}
```

**章节来源**
- [orderService.ts](file://src/services/orderService.ts#L150-L200)

## 支付集成服务

### 支付网关配置

```mermaid
graph LR
subgraph "支付配置"
A[VITE_STRIPE_PUBLIC_KEY]
B[VITE_STRIPE_SECRET_KEY]
C[VITE_ALIPAY_APP_ID]
D[VITE_ALIPAY_PRIVATE_KEY]
E[VITE_WECHAT_APP_ID]
F[VITE_WECHAT_MCH_ID]
end
subgraph "支付服务"
G[PaymentService]
H[Stripe处理]
I[支付宝处理]
J[微信支付处理]
end
A --> H
B --> H
C --> I
D --> I
E --> J
F --> J
G --> H
G --> I
G --> J
```

**图表来源**
- [paymentService.ts](file://src/services/paymentService.ts#L10-L50)

### 支付方式检测

系统自动检测可用的支付平台：

```typescript
// 检测可用支付平台
export const AVAILABLE_PAYMENT_METHODS = Object.entries(PAYMENT_CONFIG)
  .filter(([, config]) => config.enabled)
  .map(([method]) => method);

if (AVAILABLE_PAYMENT_METHODS.length === 0) {
  console.warn("⚠️ 没有配置任何支付平台，请设置至少一个支付平台的环境变量");
}
```

### 支付结果标准化

```mermaid
classDiagram
class PaymentResult {
+boolean success
+string paymentId
+string orderId
+number amount
+string currency
+string method
+string message
+string redirectUrl
+string clientSecret
+string paymentIntentId
}
class PaymentService {
+processStripePayment(paymentData) Promise~PaymentResult~
+confirmStripePayment(clientSecret, paymentMethodId) Promise~PaymentResult~
+processAlipayPayment(paymentData) Promise~PaymentResult~
+processWechatPayment(paymentData) Promise~PaymentResult~
+processPayment(paymentData, method) Promise~PaymentResult~
}
PaymentService --> PaymentResult : "返回"
```

**图表来源**
- [paymentService.ts](file://src/services/paymentService.ts#L40-L80)
- [index.ts](file://src/types/index.ts#L150-L180)

**章节来源**
- [paymentService.ts](file://src/services/paymentService.ts#L1-L100)

## 支付组件实现

### Stripe支付组件

Stripe支付组件提供安全的信用卡支付体验：

```mermaid
sequenceDiagram
participant User as 用户
participant Component as StripePayment
participant Service as PaymentService
participant Stripe as Stripe API
User->>Component : 点击支付
Component->>Service : processStripePayment()
Service->>Stripe : 创建PaymentIntent
Stripe-->>Service : 返回clientSecret
Service-->>Component : PaymentResult
Component->>Stripe : confirmPayment()
Stripe-->>Component : 支付结果
Component-->>User : 支付成功/失败
```

**图表来源**
- [StripePayment.vue](file://src/components/StripePayment.vue#L50-L100)
- [paymentService.ts](file://src/services/paymentService.ts#L60-L120)

### 支付宝支付组件

支付宝支付组件支持PC网站支付模式：

```typescript
// 支付宝支付处理
static async processAlipayPayment(
  paymentData: PaymentData,
): Promise<PaymentResult> {
  try {
    // 创建支付宝支付请求参数
    const alipayParams = {
      app_id: PAYMENT_CONFIG.alipay.appId,
      method: "alipay.trade.page.pay",
      charset: PAYMENT_CONFIG.alipay.charset,
      sign_type: PAYMENT_CONFIG.alipay.signType,
      timestamp: new Date().toISOString().slice(0, 19).replace("T", " "),
      version: "1.0",
      notify_url: `${window.location.origin}/api/payment/alipay/notify`,
      return_url: `${window.location.origin}/payment/success`,

      biz_content: JSON.stringify({
        out_trade_no: paymentData.order_id,
        total_amount: paymentData.amount.toFixed(2),
        subject: `订单支付 - ${paymentData.order_id}`,
        product_code: "FAST_INSTANT_TRADE_PAY",
        timeout_express: "30m",
      }),
    };

    // 生成支付URL
    const mockPaymentUrl = this.generateAlipayMockUrl(alipayParams);

    return {
      success: true,
      paymentId: `alipay_${Date.now()}`,
      orderId: paymentData.order_id,
      amount: paymentData.amount,
      currency: "CNY",
      method: "alipay",
      message: "跳转到支付宝支付页面",
      redirectUrl: mockPaymentUrl,
    };
  } catch (error) {
    return {
      success: false,
      orderId: paymentData.order_id,
      amount: paymentData.amount,
      currency: "CNY",
      method: "alipay",
      message: error instanceof Error ? error.message : "支付处理失败",
    };
  }
}
```

### 微信支付组件

微信支付组件提供二维码支付功能：

```mermaid
flowchart TD
A[用户点击支付] --> B[调用processWechatPayment]
B --> C[生成随机字符串nonce_str]
C --> D[构造支付参数]
D --> E[模拟生成二维码]
E --> F[返回redirectUrl]
F --> G[用户扫码支付]
G --> H[支付成功]
H --> I[跳转到成功页面]
```

**图表来源**
- [WechatPayment.vue](file://src/components/WechatPayment.vue#L50-L100)
- [paymentService.ts](file://src/services/paymentService.ts#L200-L250)

**章节来源**
- [AlipayPayment.vue](file://src/components/AlipayPayment.vue#L1-L100)
- [WechatPayment.vue](file://src/components/WechatPayment.vue#L1-L100)

## 支付流程详解

### 完整支付流程

```mermaid
sequenceDiagram
participant U as 用户
participant PV as PaymentView
participant OS as OrderService
participant PS as PaymentService
participant PG as 支付网关
participant DB as 数据库
U->>PV : 1. 选择支付方式
U->>PV : 2. 填写账单信息
PV->>OS : 3. createOrder()
OS->>DB : 4. 创建订单记录
DB-->>OS : 5. 返回订单ID
OS-->>PV : 6. 显示支付选项
PV->>PS : 7. processPayment()
PS->>PG : 8. 发起支付请求
PG-->>PS : 9. 返回支付结果
PS-->>PV : 10. 处理支付回调
PV->>OS : 11. processPayment()
OS->>DB : 12. 更新订单状态
DB-->>OS : 13. 确认更新
OS-->>PV : 14. 支付完成
PV->>U : 15. 显示成功页面
```

**图表来源**
- [PaymentView.vue](file://src/views/PaymentView.vue#L250-L400)
- [orderService.ts](file://src/services/orderService.ts#L150-L200)

### 支付状态管理

系统维护严格的订单状态流转：

```mermaid
stateDiagram-v2
[*] --> pending : 创建订单
pending --> paid : 支付成功
pending --> cancelled : 用户取消
paid --> refunded : 退款处理
cancelled --> [*]
refunded --> [*]
note right of pending
状态检查：
- 乐观锁验证
- 支付网关确认
end note
note right of paid
自动更新：
- completed_at
- payment_id
- payment_method
end note
```

**图表来源**
- [orderService.ts](file://src/services/orderService.ts#L150-L200)

### 回调处理机制

支付网关的异步回调处理：

1. **同步回调**：用户支付完成后直接跳转
2. **异步通知**：支付网关主动通知支付结果
3. **状态验证**：双重验证确保支付结果准确性

**章节来源**
- [PaymentView.vue](file://src/views/PaymentView.vue#L200-L400)

## 安全最佳实践

### 数据传输安全

1. **HTTPS加密**：所有支付数据通过HTTPS传输
2. **Token验证**：使用JWT进行身份验证
3. **CSRF保护**：防止跨站请求伪造攻击

### 支付安全措施

```mermaid
graph TB
subgraph "支付安全层"
A[SSL/TLS加密]
B[Token验证]
C[CSRF令牌]
D[输入验证]
end
subgraph "支付网关安全"
E[签名验证]
F[重复支付检查]
G[金额校验]
H[商户密钥保护]
end
subgraph "应用层安全"
I[SQL注入防护]
J[XSS防护]
K[权限控制]
L[审计日志]
end
A --> E
B --> F
C --> G
D --> H
E --> I
F --> J
G --> K
H --> L
```

### 敏感数据保护

- **支付敏感信息**：仅在内存中临时存储
- **日志脱敏**：支付相关信息进行脱敏处理
- **访问控制**：严格限制支付相关API的访问权限

## 错误处理策略

### 分层错误处理

```mermaid
flowchart TD
A[支付请求] --> B{网络连接}
B --> |失败| C[网络错误处理]
B --> |成功| D{支付网关响应}
D --> |超时| E[超时错误处理]
D --> |错误| F[支付网关错误]
D --> |成功| G{业务逻辑验证}
G --> |失败| H[业务逻辑错误]
G --> |成功| I[支付成功]
C --> J[重试机制]
E --> J
F --> K[错误上报]
H --> K
J --> A
K --> L[用户提示]
```

### 错误分类与处理

1. **网络错误**：自动重试机制
2. **支付网关错误**：详细错误码解析
3. **业务逻辑错误**：友好的用户提示
4. **系统错误**：记录日志并通知运维

### 降级策略

当支付网关不可用时的降级方案：

```typescript
// 支付方式降级示例
const processPaymentWithFallback = async (paymentData: PaymentData) => {
  const methods = ['stripe', 'alipay', 'wechat'];
  
  for (const method of methods) {
    try {
      return await PaymentService.processPayment(paymentData, method);
    } catch (error) {
      console.warn(`支付方式 ${method} 失败，尝试下一个`);
      continue;
    }
  }
  
  throw new Error('所有支付方式都不可用');
};
```

**章节来源**
- [paymentService.ts](file://src/services/paymentService.ts#L300-L387)

## 性能优化建议

### 缓存策略

1. **支付方式缓存**：缓存可用支付方式列表
2. **产品信息缓存**：减少数据库查询次数
3. **用户信息缓存**：提升用户体验

### 异步处理

```mermaid
graph LR
A[用户支付] --> B[快速响应]
B --> C[异步处理]
C --> D[支付验证]
C --> E[订单更新]
C --> F[通知发送]
D --> G[最终状态]
E --> G
F --> G
```

### 并发控制

- **支付并发限制**：防止重复支付
- **订单状态锁**：确保状态一致性
- **资源池管理**：优化支付网关连接

## 故障排除指南

### 常见问题诊断

1. **支付失败**
   - 检查支付网关配置
   - 验证网络连接
   - 查看错误日志

2. **订单状态异常**
   - 检查数据库事务
   - 验证支付回调
   - 确认状态机逻辑

3. **支付组件无响应**
   - 检查环境变量
   - 验证支付网关证书
   - 测试网络连通性

### 监控指标

- **支付成功率**：实时监控支付成功率
- **响应时间**：跟踪支付处理时间
- **错误率**：监控各类错误的发生频率
- **用户支付路径**：分析用户支付行为

### 日志记录

```typescript
// 支付日志记录示例
const logPaymentAttempt = (paymentData: PaymentData, method: string) => {
  console.log(`支付尝试 - 订单: ${paymentData.order_id}, 方式: ${method}, 金额: ${paymentData.amount}`);
};

const logPaymentResult = (result: PaymentResult) => {
  console.log(`支付结果 - 成功: ${result.success}, 订单: ${result.orderId}, 支付ID: ${result.paymentId}`);
};
```

**章节来源**
- [orderService.ts](file://src/services/orderService.ts#L700-L787)

## 总结

本文档详细介绍了基于Vue 3和TypeScript构建的订单管理系统与支付集成API。系统具有以下特点：

### 核心优势

1. **模块化设计**：清晰的服务分离，便于维护和扩展
2. **多支付支持**：集成Stripe、支付宝、微信支付等多种支付方式
3. **安全可靠**：完善的错误处理和安全措施
4. **用户体验**：流畅的支付流程和友好的界面设计

### 技术亮点

- **TypeScript强类型**：提供完整的类型安全保障
- **响应式设计**：适配各种设备和屏幕尺寸
- **异步处理**：高效的支付流程和状态管理
- **错误恢复**：智能的错误处理和降级策略

### 扩展建议

1. **支付方式扩展**：可根据需求添加新的支付网关
2. **功能增强**：支持更多支付场景和业务需求
3. **性能优化**：持续优化支付流程和系统性能
4. **监控完善**：建立更完善的监控和报警机制

该系统为企业级应用提供了可靠的订单管理和支付集成解决方案，能够满足现代电商应用的各种需求。