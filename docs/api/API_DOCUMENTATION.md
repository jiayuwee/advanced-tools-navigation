# API 文档

## 📋 概览

本文档描述了 Ramusi 工具导航站的 API 接口，基于 Supabase 提供的 RESTful API 和实时订阅功能。

## 🔐 认证

所有需要认证的 API 请求都需要在请求头中包含有效的访问令牌：

```http
Authorization: Bearer <access_token>
```

## 📊 数据模型

### 用户 (Users)

```typescript
interface User {
  id: string
  email: string
  full_name?: string
  username?: string
  avatar_url?: string
  role: 'user' | 'admin'
  is_active: boolean
  email_verified: boolean
  created_at: string
  updated_at: string
}
```

### 工具 (Tools)

```typescript
interface Tool {
  id: string
  name: string
  description: string
  url: string
  icon?: string
  category_id: string
  tags: string[]
  is_featured: boolean
  sort_order: number
  click_count: number
  status: 'active' | 'inactive' | 'pending'
  created_at: string
  updated_at: string
}
```

### 产品 (Products)

```typescript
interface Product {
  id: string
  name: string
  description: string
  price: number
  original_price?: number
  category_id: string
  images: string[]
  features: string[]
  is_featured: boolean
  is_digital: boolean
  status: 'active' | 'inactive' | 'draft'
  created_at: string
  updated_at: string
}
```

### 评价 (Reviews)

```typescript
interface Review {
  id: string
  product_id: string
  user_id: string
  rating: number
  title: string
  content: string
  pros: string[]
  cons: string[]
  is_verified_purchase: boolean
  helpful_count: number
  status: 'active' | 'hidden' | 'pending'
  created_at: string
  updated_at: string
}
```

## 🛠️ 工具 API

### 获取工具列表

```http
GET /rest/v1/tools
```

**查询参数:**
- `category_id` (可选): 分类ID筛选
- `status` (可选): 状态筛选 (active, inactive, pending)
- `is_featured` (可选): 是否特色工具
- `limit` (可选): 返回数量限制 (默认: 20)
- `offset` (可选): 偏移量 (默认: 0)
- `order` (可选): 排序字段 (默认: sort_order.asc)

**响应示例:**
```json
[
  {
    "id": "tool-123",
    "name": "VS Code",
    "description": "强大的代码编辑器",
    "url": "https://code.visualstudio.com",
    "icon": "vscode-icon.png",
    "category_id": "development",
    "tags": ["editor", "development", "microsoft"],
    "is_featured": true,
    "sort_order": 1,
    "click_count": 1250,
    "status": "active",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-12-27T00:00:00Z"
  }
]
```

### 获取工具详情

```http
GET /rest/v1/tools?id=eq.{tool_id}
```

### 创建工具 (需要管理员权限)

```http
POST /rest/v1/tools
Content-Type: application/json
Authorization: Bearer <access_token>

{
  "name": "新工具",
  "description": "工具描述",
  "url": "https://example.com",
  "category_id": "category-123",
  "tags": ["tag1", "tag2"],
  "is_featured": false
}
```

### 更新工具点击量

```http
POST /rest/v1/rpc/increment_tool_clicks

{
  "tool_id": "tool-123"
}
```

## 🛒 产品 API

### 获取产品列表

```http
GET /rest/v1/products
```

**查询参数:**
- `category_id` (可选): 分类ID筛选
- `status` (可选): 状态筛选
- `is_featured` (可选): 是否特色产品
- `price_min` (可选): 最低价格
- `price_max` (可选): 最高价格

### 获取产品详情

```http
GET /rest/v1/products?id=eq.{product_id}
```

### 创建产品 (需要管理员权限)

```http
POST /rest/v1/products
Content-Type: application/json
Authorization: Bearer <access_token>

{
  "name": "新产品",
  "description": "产品描述",
  "price": 99.99,
  "category_id": "category-123",
  "images": ["image1.jpg", "image2.jpg"],
  "features": ["功能1", "功能2"],
  "is_digital": true
}
```

## ⭐ 评价 API

### 获取产品评价

```http
GET /rest/v1/product_reviews?product_id=eq.{product_id}
```

**查询参数:**
- `rating` (可选): 评分筛选
- `is_verified_purchase` (可选): 是否验证购买
- `order` (可选): 排序 (created_at.desc, helpful_count.desc, rating.desc)

### 创建评价

```http
POST /rest/v1/product_reviews
Content-Type: application/json
Authorization: Bearer <access_token>

{
  "product_id": "product-123",
  "rating": 5,
  "title": "很棒的产品",
  "content": "详细的评价内容",
  "pros": ["优点1", "优点2"],
  "cons": ["缺点1"]
}
```

### 评价投票

```http
POST /rest/v1/rpc/vote_review

{
  "review_id": "review-123",
  "is_helpful": true
}
```

## 🔔 通知 API

### 获取用户通知

```http
GET /rest/v1/user_notifications?user_id=eq.{user_id}
Authorization: Bearer <access_token>
```

**查询参数:**
- `is_read` (可选): 是否已读
- `type` (可选): 通知类型
- `is_important` (可选): 是否重要

### 标记通知已读

```http
PATCH /rest/v1/user_notifications?id=eq.{notification_id}
Content-Type: application/json
Authorization: Bearer <access_token>

{
  "is_read": true
}
```

### 创建通知 (系统内部)

```http
POST /rest/v1/user_notifications
Content-Type: application/json
Authorization: Bearer <access_token>

{
  "user_id": "user-123",
  "type": "system",
  "title": "通知标题",
  "message": "通知内容",
  "is_important": false
}
```

## 💬 反馈 API

### 提交反馈

```http
POST /rest/v1/user_feedback
Content-Type: application/json
Authorization: Bearer <access_token>

{
  "type": "bug",
  "title": "反馈标题",
  "content": "详细描述",
  "priority": "medium",
  "system_info": {
    "userAgent": "Mozilla/5.0...",
    "platform": "Win32",
    "language": "zh-CN"
  }
}
```

### 获取用户反馈

```http
GET /rest/v1/user_feedback?user_id=eq.{user_id}
Authorization: Bearer <access_token>
```

### 回复反馈 (需要管理员权限)

```http
PATCH /rest/v1/user_feedback?id=eq.{feedback_id}
Content-Type: application/json
Authorization: Bearer <access_token>

{
  "response": "感谢您的反馈，问题已修复",
  "status": "resolved"
}
```

## 📊 统计 API

### 获取工具统计

```http
GET /rest/v1/rpc/get_tool_stats
```

**响应示例:**
```json
{
  "total_tools": 150,
  "active_tools": 145,
  "featured_tools": 20,
  "total_clicks": 50000,
  "categories_count": 8
}
```

### 获取用户统计

```http
GET /rest/v1/rpc/get_user_stats?user_id={user_id}
Authorization: Bearer <access_token>
```

### 获取评价统计

```http
GET /rest/v1/rpc/get_product_review_stats?product_id={product_id}
```

## 🔍 搜索 API

### 搜索工具

```http
GET /rest/v1/rpc/search_tools

{
  "query": "搜索关键词",
  "category_id": "category-123",
  "limit": 20
}
```

### 搜索产品

```http
GET /rest/v1/rpc/search_products

{
  "query": "搜索关键词",
  "price_min": 0,
  "price_max": 100,
  "limit": 20
}
```

## 🔄 实时订阅

### 订阅工具更新

```javascript
const subscription = supabase
  .channel('tools-changes')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'tools'
  }, (payload) => {
    console.log('工具更新:', payload)
  })
  .subscribe()
```

### 订阅通知

```javascript
const subscription = supabase
  .channel(`user-notifications-${userId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'user_notifications',
    filter: `user_id=eq.${userId}`
  }, (payload) => {
    console.log('新通知:', payload.new)
  })
  .subscribe()
```

## 📝 错误处理

### 错误响应格式

```json
{
  "error": {
    "code": "PGRST116",
    "message": "The result contains 0 rows",
    "details": null,
    "hint": null
  }
}
```

### 常见错误码

- `401`: 未授权 - 需要有效的访问令牌
- `403`: 禁止访问 - 权限不足
- `404`: 资源不存在
- `422`: 请求参数错误
- `500`: 服务器内部错误

## 🔒 权限控制

### 行级安全策略

所有表都启用了行级安全策略 (RLS)：

- **用户数据**: 用户只能访问自己的数据
- **工具和产品**: 所有用户可读，管理员可写
- **评价**: 用户可创建和查看，只能编辑自己的评价
- **通知**: 用户只能访问发送给自己的通知

### 角色权限

- **普通用户**: 查看工具/产品、创建评价、管理个人数据
- **管理员**: 所有普通用户权限 + 管理工具/产品/用户

## 📈 速率限制

- **匿名用户**: 100 请求/分钟
- **认证用户**: 1000 请求/分钟
- **管理员**: 5000 请求/分钟

## 🔧 SDK 使用示例

### JavaScript/TypeScript

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://your-project.supabase.co',
  'your-anon-key'
)

// 获取工具列表
const { data: tools, error } = await supabase
  .from('tools')
  .select('*')
  .eq('status', 'active')
  .order('sort_order')

// 创建评价
const { data: review, error } = await supabase
  .from('product_reviews')
  .insert({
    product_id: 'product-123',
    rating: 5,
    title: '很棒的产品',
    content: '详细评价内容'
  })
```

---

*最后更新: 2024年12月27日*
*API 版本: v1.0*
