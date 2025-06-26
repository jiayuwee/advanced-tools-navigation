# Supabase 数据库自动部署指南

## 🚀 快速部署步骤

### 1. 创建 Supabase 项目

1. 访问 [Supabase Dashboard](https://supabase.com/dashboard)
2. 点击 "New Project"
3. 选择组织（jiayuwee）
4. 填写项目信息：
   - **Name**: `advanced-tools-navigation`
   - **Database Password**: 设置一个强密码（请记住此密码）
   - **Region**: 选择 Singapore（推荐）
5. 点击 "Create new project"

### 2. 获取项目配置信息

项目创建完成后，在 **Settings > API** 页面获取：
- **Project URL**: `https://your-project-ref.supabase.co`
- **Project Reference ID**: `your-project-ref`
- **anon public key**: `eyJ...`

### 3. 自动化部署

使用提供的自动化脚本进行部署：

```powershell
# 在 PowerShell 中运行（替换为您的实际值）
.\setup-supabase-auto.ps1 -ProjectRef "your-project-ref" -AnonKey "your-anon-key"
```

### 4. 手动配置（如果自动化失败）

#### 4.1 创建环境变量文件
复制 `.env.local.template` 为 `.env.local` 并填入实际值：

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_APP_NAME=工具导航站
VITE_APP_DESCRIPTION=高效的工具导航和产品展示平台
VITE_APP_URL=https://ramusi.cn
VITE_DEV_MODE=true
VITE_API_BASE_URL=https://your-project-ref.supabase.co
```

#### 4.2 运行数据库迁移
```powershell
# 链接项目
npx supabase link --project-ref your-project-ref

# 运行迁移
npx supabase db push

# 生成类型定义
npx supabase gen types typescript --linked > src/types/database.ts
```

## 📊 数据库架构

部署将创建以下表：

### 核心表
- `user_profiles` - 用户资料
- `categories` - 工具分类
- `product_categories` - 产品分类
- `tools` - 工具信息
- `products` - 产品信息
- `tags` - 标签
- `tool_tags` - 工具标签关联

### 业务表
- `favorites` - 收藏
- `orders` - 订单
- `order_items` - 订单项
- `payments` - 支付记录
- `product_reviews` - 产品评论
- `analytics` - 分析数据

### 功能特性
- ✅ 行级安全策略 (RLS)
- ✅ 自动更新时间戳
- ✅ 完整的索引优化
- ✅ 数据类型验证
- ✅ 外键约束

## 🔐 安全配置

### 认证设置
在 Supabase Dashboard > Authentication > Settings 中：
1. 启用邮箱注册
2. 配置重定向 URL：
   - `https://ramusi.cn`
   - `https://spiffy-torrone-5454e1.netlify.app`
   - `http://localhost:3000`

### 存储设置
在 Storage 中创建以下存储桶：
- `avatars` (公开) - 用户头像
- `product-images` (公开) - 产品图片
- `tool-icons` (公开) - 工具图标
- `uploads` (私有) - 用户上传文件

## 🧪 验证部署

### 1. 测试数据库连接
```powershell
npm run dev
```

### 2. 检查 Supabase Studio
访问：`https://supabase.com/dashboard/project/your-project-ref`

### 3. 验证表结构
在 Table Editor 中确认所有表都已创建

## 🚨 故障排除

### 常见问题

**连接失败**
- 检查 URL 和密钥是否正确
- 确认网络连接正常
- 验证项目状态是否为 "Active"

**迁移失败**
- 检查项目引用 ID 是否正确
- 确认有足够的权限
- 查看 Supabase Dashboard 中的日志

**类型定义生成失败**
- 确保项目已正确链接
- 检查网络连接
- 手动复制现有的类型定义文件

## 📞 获取帮助

如果遇到问题，请：
1. 检查 [Supabase 文档](https://supabase.com/docs)
2. 查看项目的 GitHub Issues
3. 联系技术支持

---

**重要提醒**：
- 请妥善保管数据库密码和 API 密钥
- 不要将 `.env.local` 文件提交到版本控制
- 定期备份重要数据
