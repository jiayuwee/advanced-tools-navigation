# 🔄 GitHub Actions 工作流文档

## 📋 工作流概览

本项目使用 GitHub Actions 实现完整的 CI/CD 流程，包括代码质量检查、自动化测试、安全扫描、性能监控和部署管理。

## 🛠️ 工作流列表

### 1. 🔨 Build & Quality Verification (`build-verification.yml`)
**触发条件**: 推送到 main/develop 分支，Pull Request
**运行频率**: 每次代码提交
**功能**:
- ✅ 代码质量检查 (ESLint + TypeScript)
- 🧪 单元测试执行
- 🔧 多版本 Node.js 构建验证
- 🔒 安全审计
- 📦 构建产物上传

**环境变量要求**:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### 2. 🏥 Website Health Monitor (`health-check.yml`)
**触发条件**: 推送到 main 分支，每6小时定时执行，手动触发
**运行频率**: 持续监控
**功能**:
- 🌐 网站可访问性检查
- 📄 页面内容验证
- ⚡ 性能响应时间监控
- 🔒 安全头检查 (全面检查模式)
- 📱 移动端响应性测试

### 3. 📦 Dependency & Security Management (`dependency-security.yml`)
**触发条件**: 每周一定时执行，每月安全扫描，手动触发
**运行频率**: 定期维护
**功能**:
- 🔍 安全漏洞扫描
- 📈 依赖更新检查
- 📜 许可证合规检查
- 🔄 自动安全修复 PR
- 📊 详细报告生成

### 4. 🚀 Performance Monitoring (`performance-monitoring.yml`)
**触发条件**: 推送到 main 分支，每日定时执行，手动触发
**运行频率**: 持续优化
**功能**:
- 💡 Lighthouse 性能审计
- 🔧 构建性能分析
- 📊 Bundle 大小分析
- 🔥 负载测试
- 📈 Core Web Vitals 监控

## 🔧 工作流配置

### 环境变量设置
在 GitHub 仓库的 Settings > Secrets and variables > Actions 中设置：

```bash
# Supabase 配置
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# GitHub Token (自动生成)
GITHUB_TOKEN=automatically_provided
```

### Node.js 版本标准化
所有工作流统一使用 Node.js 18.19.0+ 以确保环境一致性。

## 📊 监控和报告

### 自动生成的报告
- 🔒 **安全报告**: 漏洞扫描、依赖分析
- 📈 **性能报告**: Lighthouse 分数、构建时间
- 📋 **质量报告**: 代码覆盖率、类型检查
- 🏥 **健康报告**: 网站状态、响应时间

### 工件保留策略
- 构建产物: 7天
- 测试报告: 30天
- 性能报告: 30天
- 安全报告: 30天

## 🚨 告警和通知

### 失败通知
- ❌ 构建失败 -> 立即通知
- 🔒 安全漏洞 -> 自动创建修复 PR
- 🏥 健康检查失败 -> 详细状态报告
- 📉 性能下降 -> 性能分析报告

### 自动化修复
- 🔄 安全漏洞自动修复
- 📦 依赖更新建议
- 🔧 代码质量自动修复

## 🎯 性能指标

### 质量目标
- ✅ 代码覆盖率: >80%
- 🚀 构建时间: <2分钟
- 💡 Lighthouse 性能: >70分
- 🔒 安全漏洞: 0个高危
- 📱 响应时间: <3秒

### 监控频率
- 代码质量: 每次提交
- 安全扫描: 每周 + 紧急情况
- 性能监控: 每日
- 健康检查: 每6小时

## 🔄 工作流最佳实践

### 1. 并行执行优化
- 代码质量检查与测试并行
- 多版本 Node.js 矩阵构建
- 独立的安全和依赖检查

### 2. 缓存策略
- NPM 依赖缓存
- 构建产物缓存
- Docker 层缓存

### 3. 失败处理
- 优雅的错误处理
- 详细的日志记录
- 自动重试机制

### 4. 资源优化
- 按需运行工作流
- 智能触发条件
- 合理的超时设置

## 📝 维护指南

### 定期维护任务
1. **每月**: 检查工作流性能，更新 Action 版本
2. **每季度**: 评估监控指标，优化工作流
3. **每年**: 全面审查 CI/CD 策略

### 故障排除
1. **构建失败**: 检查依赖和环境变量
2. **测试失败**: 查看测试日志和覆盖率报告
3. **部署失败**: 验证环境配置和权限
4. **性能下降**: 分析 Lighthouse 报告和构建时间

### 工作流更新
- 遵循版本控制最佳实践
- 在测试分支验证更改
- 逐步部署新配置
- 备份重要工作流配置

## 🔗 相关资源
- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [工作流语法参考](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [Lighthouse CI 文档](https://github.com/GoogleChrome/lighthouse-ci)
- [项目部署指南](../deployment/UPDATE_DEPLOYMENT_GUIDE.md)