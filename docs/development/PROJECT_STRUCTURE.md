# 📁 项目文件结构说明

## 🎯 重组目标

本项目已经进行了文件结构重组，目标是：
- 清理根目录，只保留最核心的配置文件
- 按功能分组，将相关文件组织到对应目录
- 统一命名规范，使用一致的文件命名方式
- 提升可维护性，让项目结构更清晰易懂

## 📂 新的文件结构

```
advanced-tools-navigation/
├── 📁 src/                          # 源代码
│   ├── components/                  # Vue组件
│   ├── stores/                      # Pinia状态管理
│   ├── services/                    # 业务逻辑服务
│   ├── types/                       # TypeScript类型定义
│   ├── utils/                       # 工具函数
│   ├── views/                       # 页面组件
│   ├── lib/                         # 库文件和配置
│   ├── router/                      # 路由配置
│   ├── App.vue                      # 主应用组件
│   ├── main.ts                      # 应用入口
│   └── style.css                    # 全局样式
├── 📁 public/                       # 静态资源
│   ├── CNAME                        # 域名配置
│   ├── manifest.json                # PWA配置
│   └── *.png, *.svg, *.jpg          # 图片资源
├── 📁 docs/                         # 📝 文档目录
│   ├── deployment/                  # 部署相关文档
│   │   ├── DEPLOYMENT_CHECKLIST.md
│   │   ├── DEPLOYMENT_STATUS.md
│   │   ├── GITHUB_AUTOMATION_GUIDE.md
│   │   └── ...
│   ├── development/                 # 开发相关文档
│   │   ├── PROJECT_STRUCTURE.md    # 本文件
│   │   └── 现状.md
│   └── guides/                      # 使用指南
│       └── SUPABASE_SETUP.md
├── 📁 scripts/                      # 🔧 脚本目录
│   ├── deployment/                  # 部署脚本
│   │   ├── deploy.sh
│   │   ├── deploy.ps1
│   │   ├── setup-supabase-auto.ps1
│   │   ├── verify-deployment.js
│   │   └── ...
│   ├── database/                    # 数据库脚本
│   │   ├── update-database.js
│   │   ├── test-supabase-connection.js
│   │   ├── *.sql                    # SQL脚本
│   │   └── ...
│   └── development/                 # 开发脚本
│       ├── debug-app.js
│       ├── test.html
│       └── ...
├── 📁 config/                       # ⚙️ 配置文件目录
│   ├── build/                       # 构建配置
│   │   ├── tailwind.config.ts
│   │   └── postcss.config.mjs
│   ├── deployment/                  # 部署配置
│   │   ├── Dockerfile
│   │   ├── docker-compose.yml
│   │   └── nginx.conf
│   └── development/                 # 开发配置
│       ├── .eslintrc.cjs
│       ├── .prettierrc
│       ├── .prettierignore
│       ├── components.json
│       └── claude_desktop_config.json
├── 📁 supabase/                     # Supabase配置
│   ├── config.toml
│   └── migrations/
├── 📁 .github/                      # GitHub配置
│   └── workflows/
├── 📁 dist/                         # 构建输出
├── 📁 node_modules/                 # 依赖
├── 📄 package.json                  # 项目配置
├── 📄 package-lock.json             # 锁定文件
├── 📄 README.md                     # 主要说明
├── 📄 .gitignore                    # Git忽略
├── 📄 tsconfig.json                 # TypeScript配置
├── 📄 vite.config.ts                # Vite配置
├── 📄 netlify.toml                  # Netlify配置
├── 📄 env.d.ts                      # 环境类型定义
└── 📄 index.html                    # HTML模板
```

## 🔄 路径别名配置

项目已配置以下路径别名：

```typescript
// tsconfig.json 和 vite.config.ts
{
  "@/*": ["./src/*"],
  "@config/*": ["./config/*"],
  "@scripts/*": ["./scripts/*"],
  "@docs/*": ["./docs/*"]
}
```

## 📝 使用说明

### 开发时
- 源代码在 `src/` 目录
- 配置文件在 `config/` 目录
- 开发脚本在 `scripts/development/`

### 部署时
- 部署脚本在 `scripts/deployment/`
- 部署配置在 `config/deployment/`
- 部署文档在 `docs/deployment/`

### 数据库操作
- 数据库脚本在 `scripts/database/`
- Supabase配置在 `supabase/`

## 🚀 npm脚本更新

package.json中的脚本已更新为新路径：

```json
{
  "supabase:setup": "bash scripts/deployment/setup-supabase.sh",
  "supabase:setup-win": "powershell -ExecutionPolicy Bypass -File scripts/deployment/setup-supabase.ps1",
  "supabase:verify": "node scripts/deployment/verify-deployment.js",
  "supabase:deploy": "powershell -ExecutionPolicy Bypass -File scripts/deployment/setup-supabase-auto.ps1",
  "deployment:status": "node scripts/deployment/check-deployment-status.js",
  "deployment:trigger": "node scripts/deployment/trigger-deployment.js"
}
```

## 📋 维护建议

1. **新文件放置**：
   - 文档 → `docs/` 对应子目录
   - 脚本 → `scripts/` 对应子目录
   - 配置 → `config/` 对应子目录

2. **命名规范**：
   - 使用小写字母和连字符
   - 功能相关的文件放在同一目录

3. **定期清理**：
   - 删除不再使用的文件
   - 更新过时的文档
   - 检查脚本路径引用

## 🔧 故障排除

如果遇到路径相关问题：

1. 检查 `package.json` 中的脚本路径
2. 确认 `tsconfig.json` 和 `vite.config.ts` 中的别名配置
3. 验证文件是否在正确的目录中
4. 更新任何硬编码的文件路径

## 📞 支持

如有问题，请查看：
- `docs/guides/` - 使用指南
- `docs/deployment/` - 部署文档
- `README.md` - 项目主要说明
