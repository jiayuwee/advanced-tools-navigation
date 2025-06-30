#!/usr/bin/env node

/**
 * 更新发布问题诊断工具
 * 专门诊断为什么初次发布成功但更新发布失败的问题
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

class UpdateDeploymentDiagnostic {
  constructor() {
    this.issues = [];
    this.warnings = [];
    this.suggestions = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = {
      info: '📋',
      success: '✅',
      warning: '⚠️',
      error: '❌',
      fix: '🔧'
    }[type] || '📋';
    
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  addIssue(message) {
    this.issues.push(message);
    this.log(message, 'error');
  }

  addWarning(message) {
    this.warnings.push(message);
    this.log(message, 'warning');
  }

  addSuggestion(message) {
    this.suggestions.push(message);
    this.log(message, 'fix');
  }

  // 检查包管理器一致性
  checkPackageManagerConsistency() {
    this.log('检查包管理器一致性...');

    // 检查锁文件
    const hasPackageLock = fs.existsSync('package-lock.json');
    const hasYarnLock = fs.existsSync('yarn.lock');
    const hasPnpmLock = fs.existsSync('pnpm-lock.yaml');

    if (hasPackageLock && hasYarnLock) {
      this.addIssue('同时存在 package-lock.json 和 yarn.lock，可能导致依赖冲突');
      this.addSuggestion('删除其中一个锁文件，统一使用一种包管理器');
    }

    if (hasPackageLock && hasPnpmLock) {
      this.addIssue('同时存在 package-lock.json 和 pnpm-lock.yaml，可能导致依赖冲突');
    }

    // 检查工作流配置
    const workflowFiles = [
      '.github/workflows/deploy.yml',
      '.github/workflows/ci.yml',
      '.github/workflows/health-check.yml'
    ];

    workflowFiles.forEach(file => {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        
        // 检查缓存配置
        if (content.includes("cache: 'npm'") && hasYarnLock) {
          this.addWarning(`${file} 使用 npm 缓存但项目有 yarn.lock`);
        }
        if (content.includes("cache: 'yarn'") && hasPackageLock) {
          this.addWarning(`${file} 使用 yarn 缓存但项目有 package-lock.json`);
        }

        // 检查安装命令
        if (content.includes('npm ci') && hasYarnLock) {
          this.addWarning(`${file} 使用 npm ci 但项目有 yarn.lock`);
        }
        if (content.includes('yarn install') && hasPackageLock) {
          this.addWarning(`${file} 使用 yarn install 但项目有 package-lock.json`);
        }
      }
    });
  }

  // 检查 Netlify 配置
  checkNetlifyConfig() {
    this.log('检查 Netlify 配置...');

    if (fs.existsSync('netlify.toml')) {
      const content = fs.readFileSync('netlify.toml', 'utf8');
      
      // 检查构建命令
      if (content.includes('npm ci') && fs.existsSync('yarn.lock')) {
        this.addWarning('netlify.toml 使用 npm ci 但项目有 yarn.lock');
        this.addSuggestion('更新 netlify.toml 构建命令为 yarn install');
      }

      // 检查环境变量配置
      if (!content.includes('NPM_CONFIG_OPTIONAL')) {
        this.addWarning('netlify.toml 缺少 NPM_CONFIG_OPTIONAL 配置');
        this.addSuggestion('添加 NPM_CONFIG_OPTIONAL = "false" 到 [build.environment]');
      }
    } else {
      this.addWarning('缺少 netlify.toml 配置文件');
    }
  }

  // 检查依赖问题
  checkDependencyIssues() {
    this.log('检查依赖问题...');

    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      
      // 检查平台特定依赖
      const allDeps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
        ...packageJson.optionalDependencies
      };

      Object.keys(allDeps).forEach(dep => {
        if (dep.includes('win32') || dep.includes('darwin') || dep.includes('linux')) {
          this.addWarning(`发现平台特定依赖: ${dep}`);
          this.addSuggestion('考虑将平台特定依赖移到 optionalDependencies');
        }
      });

      // 检查 Rollup 相关依赖
      Object.keys(allDeps).forEach(dep => {
        if (dep.startsWith('@rollup/rollup-')) {
          this.addWarning(`发现 Rollup 平台特定依赖: ${dep}`);
          this.addSuggestion('移除直接的 Rollup 平台依赖，让 Rollup 自动处理');
        }
      });

    } catch (error) {
      this.addIssue('无法读取 package.json');
    }
  }

  // 检查环境变量
  checkEnvironmentVariables() {
    this.log('检查环境变量配置...');

    const requiredEnvVars = [
      'VITE_SUPABASE_URL',
      'VITE_SUPABASE_ANON_KEY'
    ];

    // 检查本地环境文件
    const envFiles = ['.env', '.env.local', '.env.production'];
    let hasEnvConfig = false;

    envFiles.forEach(file => {
      if (fs.existsSync(file)) {
        hasEnvConfig = true;
        const content = fs.readFileSync(file, 'utf8');
        
        requiredEnvVars.forEach(envVar => {
          if (!content.includes(envVar)) {
            this.addWarning(`${file} 缺少 ${envVar}`);
          }
        });
      }
    });

    if (!hasEnvConfig) {
      this.addWarning('没有找到环境变量配置文件');
      this.addSuggestion('创建 .env.local 文件并配置必要的环境变量');
    }
  }

  // 检查构建配置
  checkBuildConfiguration() {
    this.log('检查构建配置...');

    // 检查 Vite 配置
    if (fs.existsSync('vite.config.ts')) {
      const content = fs.readFileSync('vite.config.ts', 'utf8');
      
      if (!content.includes('base: "./"')) {
        this.addWarning('vite.config.ts 可能缺少正确的 base 配置');
      }
    }

    // 检查 TypeScript 配置
    if (fs.existsSync('tsconfig.json')) {
      try {
        const tsConfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
        
        if (tsConfig.compilerOptions?.strict === false) {
          this.addWarning('TypeScript strict 模式已禁用，可能导致类型错误');
        }
      } catch (error) {
        this.addWarning('无法解析 tsconfig.json');
      }
    }
  }

  // 检查缓存问题
  checkCacheIssues() {
    this.log('检查缓存问题...');

    // 检查 node_modules 状态
    if (fs.existsSync('node_modules')) {
      try {
        const stats = fs.statSync('node_modules');
        const ageInHours = (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60);
        
        if (ageInHours > 24) {
          this.addWarning(`node_modules 已超过 ${Math.floor(ageInHours)} 小时未更新`);
          this.addSuggestion('考虑清理并重新安装依赖');
        }
      } catch (error) {
        this.addWarning('无法检查 node_modules 状态');
      }
    }

    // 检查 dist 目录
    if (fs.existsSync('dist')) {
      this.addSuggestion('建议在部署前清理 dist 目录');
    }
  }

  // 生成修复脚本
  generateFixScript() {
    this.log('生成修复脚本...');

    const fixScript = `#!/bin/bash

# 更新发布问题修复脚本
# 自动生成于 ${new Date().toISOString()}

echo "🔧 开始修复更新发布问题..."

# 1. 清理缓存和依赖
echo "📦 清理依赖和缓存..."
rm -rf node_modules
rm -rf dist
rm -rf .vite

# 2. 统一包管理器（使用 npm）
echo "🔄 统一包管理器..."
if [ -f "yarn.lock" ]; then
    echo "删除 yarn.lock..."
    rm yarn.lock
fi

# 3. 重新安装依赖
echo "📥 重新安装依赖..."
npm install

# 4. 验证构建
echo "🔨 验证构建..."
npm run build

# 5. 运行测试
echo "🧪 运行测试..."
npm run test:run || echo "⚠️ 测试失败，但继续执行..."

# 6. 检查健康状态
echo "🏥 检查健康状态..."
npm run monitor:health || echo "⚠️ 健康检查失败，但继续执行..."

echo "✅ 修复脚本执行完成！"
echo "📝 请检查上述输出，确认没有错误后再进行部署。"
`;

    fs.writeFileSync('fix-update-deployment.sh', fixScript);
    fs.chmodSync('fix-update-deployment.sh', '755');
    
    this.addSuggestion('已生成修复脚本: fix-update-deployment.sh');
  }

  // 生成报告
  generateReport() {
    this.log('\n' + '='.repeat(60));
    this.log('📊 更新发布问题诊断报告', 'info');
    this.log('='.repeat(60));

    if (this.issues.length > 0) {
      this.log('\n❌ 发现的问题:');
      this.issues.forEach((issue, index) => {
        console.log(`   ${index + 1}. ${issue}`);
      });
    }

    if (this.warnings.length > 0) {
      this.log('\n⚠️ 警告:');
      this.warnings.forEach((warning, index) => {
        console.log(`   ${index + 1}. ${warning}`);
      });
    }

    if (this.suggestions.length > 0) {
      this.log('\n🔧 建议的修复措施:');
      this.suggestions.forEach((suggestion, index) => {
        console.log(`   ${index + 1}. ${suggestion}`);
      });
    }

    this.log('\n📋 快速修复步骤:');
    console.log('   1. 运行生成的修复脚本: ./fix-update-deployment.sh');
    console.log('   2. 检查 GitHub Secrets 配置');
    console.log('   3. 清理并重新提交代码');
    console.log('   4. 监控部署状态');

    const hasIssues = this.issues.length > 0;
    const hasWarnings = this.warnings.length > 0;

    if (hasIssues) {
      this.log('\n🚨 状态: 发现严重问题，需要修复后再部署', 'error');
      return false;
    } else if (hasWarnings) {
      this.log('\n⚠️ 状态: 发现潜在问题，建议修复', 'warning');
      return true;
    } else {
      this.log('\n✅ 状态: 配置看起来正常', 'success');
      return true;
    }
  }

  // 运行所有检查
  async runDiagnostic() {
    this.log('🔍 开始更新发布问题诊断...\n');

    this.checkPackageManagerConsistency();
    this.checkNetlifyConfig();
    this.checkDependencyIssues();
    this.checkEnvironmentVariables();
    this.checkBuildConfiguration();
    this.checkCacheIssues();
    this.generateFixScript();

    return this.generateReport();
  }
}

// 运行诊断
if (import.meta.url === `file://${process.argv[1]}`) {
  const diagnostic = new UpdateDeploymentDiagnostic();
  diagnostic.runDiagnostic()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('诊断过程中发生错误:', error);
      process.exit(1);
    });
}

export default UpdateDeploymentDiagnostic;
