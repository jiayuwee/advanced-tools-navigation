# 部署指南

本项目支持多种部署方式，推荐使用 Netlify 进行自动部署。

## 🚀 Netlify 部署（推荐）

### 自动部署
项目已配置为通过 Netlify 自动部署到 `https://ramusi.cn`。

**部署流程：**
1. 推送代码到 `main` 分支
2. GitHub Actions 自动运行构建和测试
3. Netlify 检测到更改并自动部署
4. 部署完成后网站自动更新

**监控部署：**
- 部署状态：https://app.netlify.com/sites/spiffy-torrone-5454e1/deploys
- 网站地址：https://ramusi.cn

### 手动部署
如果需要手动触发部署：
1. 访问 Netlify 控制台
2. 选择 "Trigger deploy" > "Deploy site"

## 🔧 GitHub Actions 配置

### CI/CD 流程
项目包含两个 GitHub Actions 工作流：

1. **CI Pipeline** (`.github/workflows/ci.yml`)
   - 代码检查和构建验证
   - 在每次 push 和 PR 时运行

2. **Deploy Pipeline** (`.github/workflows/deploy.yml`)
   - 生产环境部署
   - 部署后测试验证

### 环境变量
如果需要启用自定义服务器部署，在 GitHub 仓库设置中添加以下 Secrets：

```
DEPLOY_HOST=your-server-ip
DEPLOY_USERNAME=your-ssh-username  
DEPLOY_SSH_KEY=your-ssh-private-key
DEPLOY_PORT=22  # 可选，默认 22
```

## 🏗️ 本地构建

### 开发环境
```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 代码检查
npm run lint

# 类型检查
npm run type-check
```

### 生产构建
```bash
# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

## 🌐 其他部署选项

### GitHub Pages
要启用 GitHub Pages 部署：
1. 在 `.github/workflows/deploy.yml` 中将 GitHub Pages 部分的条件改为 `true`
2. 在仓库设置中启用 GitHub Pages
3. 设置自定义域名（如果需要）

### 自定义服务器
要启用自定义服务器部署：
1. 配置服务器环境（Node.js, Nginx 等）
2. 添加必要的 GitHub Secrets
3. 在 `.github/workflows/deploy.yml` 中启用自定义服务器部署

### Docker 部署
```dockerfile
# Dockerfile 示例
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 🔍 部署验证

### 自动测试
部署后会自动运行以下测试：
- 网站可访问性检查
- 关键页面响应测试
- 基本性能检查

### 手动验证
部署完成后，请验证：
- [ ] 主页正常加载
- [ ] 工具导航功能正常
- [ ] 产品展示页面正常
- [ ] 用户认证功能正常
- [ ] 响应式设计在移动设备上正常

## 🚨 故障排除

### 常见问题

**构建失败**
- 检查 Node.js 版本是否为 18+
- 确保所有依赖都已正确安装
- 检查 TypeScript 类型错误

**部署失败**
- 检查 Netlify 构建日志
- 验证环境变量配置
- 确保构建输出目录正确

**网站无法访问**
- 检查 DNS 配置
- 验证 SSL 证书状态
- 检查 CDN 缓存

### 获取帮助
如果遇到部署问题：
1. 查看 GitHub Actions 日志
2. 检查 Netlify 部署日志
3. 联系技术支持

## 📊 性能优化

### 构建优化
- 启用代码分割
- 压缩静态资源
- 优化图片格式

### 部署优化
- 配置 CDN 缓存
- 启用 Gzip 压缩
- 设置适当的缓存头

## 🔒 安全考虑

### 环境变量
- 不要在代码中硬编码敏感信息
- 使用 GitHub Secrets 管理密钥
- 定期轮换访问密钥

### HTTPS
- 确保所有生产环境都使用 HTTPS
- 配置安全头部
- 启用 HSTS

---

更多详细信息请参考：
- [Netlify 文档](https://docs.netlify.com/)
- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [Vue.js 部署指南](https://vitejs.dev/guide/static-deploy.html)
