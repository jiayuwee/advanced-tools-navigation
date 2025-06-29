# GitHub Secrets 配置指南

## 必需的 Secrets

在仓库设置中添加以下 Secrets：

| Secret 名称                | 说明                                |
|---------------------------|-----------------------------------|
| `SUPABASE_ACCESS_TOKEN`   | Supabase 访问令牌                   |
| `SUPABASE_PROJECT_REF`    | Supabase 项目引用 ID                |
| `VITE_SUPABASE_URL`       | Supabase 项目 URL                  |
| `VITE_SUPABASE_ANON_KEY`  | Supabase 匿名密钥                   |

## 配置步骤

1. 转到仓库的 **Settings > Secrets and variables > Actions**
2. 点击 **New repository secret**
3. 输入 Secret 名称和值
4. 重复添加所有四个 Secrets

## 验证配置

部署工作流包含自动检查步骤，会验证所有必需的 Secrets 是否已配置。如果缺少任何 Secret，工作流将失败并显示具体缺少的 Secret。

## 故障排除

如果部署仍然失败：
1. 确认 Secret 名称拼写完全匹配
2. 确保 Secret 值正确（从 Supabase 控制台复制）
3. 重新运行工作流

如需帮助，请联系项目维护者。