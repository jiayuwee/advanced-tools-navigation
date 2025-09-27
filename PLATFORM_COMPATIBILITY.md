# 平台兼容性说明

## 问题描述

本项目使用Vite + Rollup构建，Rollup需要平台特定的二进制依赖。在跨平台开发和部署时会遇到依赖冲突问题。

## 平台差异

- **Windows开发环境**: 需要 `@rollup/rollup-win32-x64-msvc`
- **Netlify (Linux)**: 需要 `@rollup/rollup-linux-x64-gnu`  
- **macOS**: 需要 `@rollup/rollup-darwin-x64` 或 `@rollup/rollup-darwin-arm64`

## 解决方案

### 1. 配置文件优化

- **`.npmrc`**: 配置npm正确处理可选依赖
- **`netlify.toml`**: 设置环境变量确保Linux平台依赖正确安装

### 2. 依赖管理策略

- **不在package.json中手动指定平台依赖**: 让Rollup自动选择
- **使用--no-save安装本地开发依赖**: Windows开发时使用 `npm install --no-save @rollup/rollup-win32-x64-msvc`
- **不提交package-lock.json**: 避免平台特定依赖被锁定

### 3. 开发环境设置

#### Windows开发者
```bash
# 首次setup
npm install
npm install --no-save @rollup/rollup-win32-x64-msvc
npm run build
```

#### macOS开发者  
```bash
# 通常自动处理，如果遇到问题：
npm install --no-save @rollup/rollup-darwin-x64
# 或对于Apple Silicon：
npm install --no-save @rollup/rollup-darwin-arm64
```

#### Linux开发者
```bash
# 通常自动处理，如果遇到问题：
npm install --no-save @rollup/rollup-linux-x64-gnu
```

## Netlify部署

Netlify会在Linux环境中：
1. 使用干净的npm install
2. 根据`.npmrc`和`netlify.toml`配置自动安装正确的平台依赖
3. 成功构建项目

## 注意事项

- 不要将平台特定的Rollup包添加到package.json的dependencies中
- 本地开发时使用--no-save安装平台依赖
- 确保.npmrc配置正确支持可选依赖