# 🚀 工具导航站

[![CI](https://github.com/jiayuwee/advanced-tools-navigation/actions/workflows/ci.yml/badge.svg)](https://github.com/jiayuwee/advanced-tools-navigation/actions/workflows/ci.yml)
[![Vue](https://img.shields.io/badge/Vue-3.4+-green.svg)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0+-blue.svg)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue.svg)](https://www.typescriptlang.org/)

基于 **Vue 3 + Vite + Pinia + TypeScript** 的现代化工具导航站，采用 Fluent Design 设计语言，帮助您高效管理和访问常用资源。

🌐 **访问地址**: [https://wwwramusi.cn](https://www.ramusi.cn)

![网站截图](public/screenshot.png)

## ✨ 功能特性

- 🚀 **快速搜索** - 即时搜索资源，支持快捷键 (Ctrl+K)
- 🗂️ **分类管理** - 多级分类结构组织资源
- ⭐ **收藏功能** - 一键收藏常用工具
- 🎨 **Fluent Design** - 现代化微软设计语言
- 📱 **响应式布局** - 完美适配桌面和移动设备
- 🔧 **工程化配置** - ESLint + Prettier + CI/CD + Docker

## 🛠️ 技术栈

- **前端框架**: Vue 3.4+ (Composition API)
- **构建工具**: Vite 5.0+
- **状态管理**: Pinia 2.1+
- **开发语言**: TypeScript 5.3+
- **样式框架**: Tailwind CSS 3.4+
- **图标库**: Lucide Vue Next
- **代码规范**: ESLint + Prettier
- **CI/CD**: GitHub Actions
- **容器化**: Docker + Docker Compose

## 🚀 快速开始

### 环境要求

- Node.js >= 18.0.0
- npm >= 8.0.0
- Supabase CLI (可选，用于本地开发)

### 数据库设置

#### 选项 1: 使用现有 Supabase 项目

1. 复制环境变量文件：

```bash
cp .env.example .env.local
```

2. 在 `.env.local` 中配置您的 Supabase 项目信息：

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### 选项 2: 自动设置新项目

运行自动设置脚本：

```bash
# Linux/macOS
npm run supabase:setup

# Windows
npm run supabase:setup-win
```

详细设置指南请参考：[Supabase 部署指南](docs/SUPABASE_SETUP.md)

### 本地开发

```bash
# 克隆仓库
git clone https://github.com/jiayuwee/advanced-tools-navigation.git

# 进入项目目录
cd advanced-tools-navigation

# 安装依赖
npm install

# 配置环境变量（参考上面的数据库设置）
cp .env.example .env.local

# 启动开发服务器
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看效果。

### 本地 Supabase 开发（可选）

如果您想在本地运行完整的 Supabase 环境：

```bash
# 启动本地 Supabase 服务
npm run supabase:start

# 查看服务状态
npm run supabase:status

# 停止服务
npm run supabase:stop
```

### 生产构建

```bash
# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

## 📦 可用脚本

```bash
# 开发服务器
npm run dev

# 生产构建
npm run build

# 预览构建结果
npm run preview

# 代码检查
npm run lint

# 类型检查
npm run type-check

# 格式化代码
npx prettier --write .

# Supabase 相关脚本
npm run supabase:start      # 启动本地 Supabase
npm run supabase:stop       # 停止本地 Supabase
npm run supabase:push       # 推送数据库迁移
npm run supabase:setup      # 自动设置项目（Linux/macOS）
npm run supabase:setup-win  # 自动设置项目（Windows）
```

## 🚀 部署

### 自动化部署

#### Netlify 部署（推荐）

- **生产环境**: [https://ramusi.cn](https://ramusi.cn)
- **预览环境**: 每个 PR 都会自动生成预览链接
- **触发方式**: 推送到 `main` 分支自动部署

#### Supabase 数据库部署

- **工作流**: `.github/workflows/supabase-deploy.yml`
- **触发条件**: `supabase/` 目录文件变更
- **功能**: 自动运行数据库迁移和前端构建

#### 配置要求

在使用 Supabase 自动部署前，需要配置 GitHub Secrets。详细配置指南：[GitHub Secrets 配置](docs/GITHUB_SECRETS_SETUP.md)

**注意**: GitHub Actions 可能显示 secrets 访问警告，这是正常的，不会影响工作流运行。

## 🐳 Docker 部署

### 使用 Docker Compose（推荐）

```bash
# 构建并启动
docker-compose up --build

# 后台运行
docker-compose up -d --build
```

### 使用 Docker

```bash
# 构建镜像
docker build -t advanced-tools-navigation .

# 运行容器
docker run -p 80:80 advanced-tools-navigation
```

## 🏗️ 项目结构

```
advanced-tools-navigation/
├── src/                    # 源代码
│   ├── stores/            # Pinia 状态管理
│   │   └── tools.ts       # 工具数据管理
│   ├── App.vue            # 主应用组件
│   ├── main.ts            # 应用入口
│   └── style.css          # 全局样式
├── public/                # 静态资源
├── .github/               # GitHub 配置
│   └── workflows/         # CI/CD 工作流
├── .eslintrc.cjs          # ESLint 配置
├── .prettierrc            # Prettier 配置
├── tailwind.config.ts     # Tailwind 配置
├── tsconfig.json          # TypeScript 配置
├── vite.config.ts         # Vite 配置
├── Dockerfile             # Docker 配置
├── docker-compose.yml     # Docker Compose 配置
└── package.json           # 项目配置
```

## 🔧 开发规范

### 代码风格

项目使用 ESLint + Prettier 进行代码规范控制：

- **ESLint**: Vue 3 + TypeScript 最佳实践
- **Prettier**: 统一的代码格式化风格
- **自动修复**: 支持保存时自动格式化

### Git 提交规范

```bash
# 功能开发
git commit -m "feat: 添加新工具分类"

# 问题修复
git commit -m "fix: 修复搜索功能bug"

# 文档更新
git commit -m "docs: 更新README文档"

# 代码重构
git commit -m "refactor: 重构状态管理逻辑"
```

## 🚀 CI/CD 流程

项目配置了完整的 GitHub Actions CI/CD 流程：

1. **代码检查**: ESLint 语法检查
2. **类型检查**: TypeScript 类型验证
3. **构建测试**: 生产环境构建验证
4. **自动部署**: 构建成功后自动部署

## 📱 响应式设计

- **桌面端**: 完整功能，侧边栏展开
- **平板端**: 自适应布局，侧边栏可折叠
- **移动端**: 移动优先设计，侧边栏抽屉式

## 🎨 设计系统

采用 Fluent Design 设计语言：

- **颜色系统**: 基于 CSS 变量的主题色彩
- **组件库**: 自定义 Vue 组件
- **图标系统**: Lucide 图标库
- **动画效果**: 流畅的过渡动画

## 🤝 贡献指南

欢迎贡献！请遵循以下步骤：

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

### 开发环境设置

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 运行代码检查
npm run lint

# 运行类型检查
npm run type-check
```

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [Vue.js](https://vuejs.org/) - 渐进式 JavaScript 框架
- [Vite](https://vitejs.dev/) - 下一代前端构建工具
- [Pinia](https://pinia.vuejs.org/) - Vue 状态管理库
- [Tailwind CSS](https://tailwindcss.com/) - 实用优先的 CSS 框架
- [Lucide](https://lucide.dev/) - 精美的图标库

## 📞 联系我们

- **网站**: [https://ramusi.cn](https://ramusi.cn)
- **邮箱**: 992956795@qq.com
- **GitHub**: [@jiayuwee](https://github.com/jiayuwee)

---

⭐ 如果这个项目对你有帮助，请给它一个星标！
