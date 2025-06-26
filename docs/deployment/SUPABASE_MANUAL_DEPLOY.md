# 🚀 Supabase 手动部署指南

由于CLI配置问题，我们将使用手动方式在Supabase控制台中部署数据库。

## 📋 部署步骤

### 1. 登录Supabase控制台
访问：https://supabase.com/dashboard
使用您的账户登录

### 2. 选择项目
选择项目：`ndmxwdejswybvbwrxsai`
或访问：https://supabase.com/dashboard/project/ndmxwdejswybvbwrxsai

### 3. 运行数据库脚本

#### 步骤 3.1：创建主要数据库结构
1. 在左侧菜单中点击 "SQL Editor"
2. 点击 "New query"
3. 复制 `supabase_complete_deploy.sql` 文件的全部内容
4. 粘贴到SQL编辑器中
5. 点击 "Run" 按钮执行

#### 步骤 3.2：插入种子数据
1. 创建新的SQL查询
2. 复制 `supabase_seed_data.sql` 文件的全部内容
3. 粘贴到SQL编辑器中
4. 点击 "Run" 按钮执行

#### 步骤 3.3：设置存储桶
1. 创建新的SQL查询
2. 复制 `supabase_storage_setup.sql` 文件的全部内容
3. 粘贴到SQL编辑器中
4. 点击 "Run" 按钮执行

### 4. 验证部署

#### 检查表结构
在SQL编辑器中运行：
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

应该看到以下表：
- analytics
- categories
- favorites
- order_items
- orders
- payments
- product_categories
- product_reviews
- products
- tags
- tool_tags
- tools
- user_profiles

#### 检查数据
```sql
-- 检查分类数据
SELECT * FROM categories;

-- 检查工具数据
SELECT * FROM tools;

-- 检查产品数据
SELECT * FROM products;
```

#### 检查存储桶
1. 在左侧菜单中点击 "Storage"
2. 应该看到以下存储桶：
   - avatars (公开)
   - product-images (公开)
   - tool-icons (公开)
   - uploads (私有)

### 5. 配置认证

#### 设置重定向URL
1. 在左侧菜单中点击 "Authentication"
2. 点击 "URL Configuration"
3. 在 "Site URL" 中输入：`https://ramusi.cn`
4. 在 "Redirect URLs" 中添加：
   ```
   https://ramusi.cn
   https://spiffy-torrone-5454e1.netlify.app
   http://localhost:3000
   ```

#### 启用第三方登录（可选）
如果需要GitHub或Google登录：
1. 在 "Authentication" > "Providers" 中
2. 启用相应的提供商
3. 配置客户端ID和密钥

### 6. 测试连接

在项目中运行以下测试：
```bash
npm run dev
```

检查浏览器控制台是否有连接错误。

## 🔧 环境变量配置

确保 `.env.local` 文件包含正确的配置：
```env
VITE_SUPABASE_URL=https://fytiwsutzgmygfxnqoft.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5dGl3c3V0emdteWdmeG5xb2Z0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4MDM1ODcsImV4cCI6MjA2NjM3OTU4N30.LM9vazR9QCZ4vLC_Q1lJmtCj3pEVqM6vpW4TKzntAQA
```

## 📊 数据库架构概览

### 核心表
- **user_profiles**: 用户资料扩展
- **categories**: 工具分类
- **product_categories**: 产品分类
- **tools**: 工具信息
- **products**: 产品信息

### 业务表
- **orders**: 订单管理
- **order_items**: 订单项目
- **payments**: 支付记录
- **favorites**: 用户收藏
- **product_reviews**: 产品评论
- **analytics**: 分析数据

### 关联表
- **tags**: 标签系统
- **tool_tags**: 工具标签关联

## 🔐 安全特性

- ✅ 行级安全策略 (RLS)
- ✅ 用户权限控制
- ✅ 存储桶访问策略
- ✅ 数据验证约束

## 🚨 常见问题

### 1. SQL执行失败
- 检查是否有语法错误
- 确保按顺序执行脚本
- 检查权限设置

### 2. 存储桶创建失败
- 确保存储功能已启用
- 检查存储桶名称是否唯一
- 验证MIME类型配置

### 3. 连接测试失败
- 验证环境变量配置
- 检查API密钥是否正确
- 确认项目URL无误

## ✅ 部署完成

部署完成后，您的Supabase数据库将包含：
- 完整的表结构和关系
- 示例数据用于测试
- 安全策略和权限控制
- 存储桶和文件管理
- 用户认证配置

现在您可以开始使用数据库功能了！
