#!/usr/bin/env node

/**
 * 部署前检查脚本
 * 确保所有必要的配置和依赖都已正确设置
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, existsSync } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '../..');

class PreDeployChecker {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.checks = [];
  }

  log(message, type = 'info') {
    const icons = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌'
    };
    console.log(`${icons[type]} ${message}`);
  }

  addError(message) {
    this.errors.push(message);
    this.log(message, 'error');
  }

  addWarning(message) {
    this.warnings.push(message);
    this.log(message, 'warning');
  }

  addSuccess(message) {
    this.log(message, 'success');
  }

  /**
   * 检查必要的文件是否存在
   */
  checkRequiredFiles() {
    this.log('🔍 检查必要文件...');
    
    const requiredFiles = [
      'package.json',
      'vite.config.ts',
      'tsconfig.json',
      'src/main.ts',
      'src/App.vue',
      'netlify.toml',
      '.github/workflows/build-verification.yml'
    ];

    let allFilesExist = true;
    for (const file of requiredFiles) {
      const filePath = join(projectRoot, file);
      if (existsSync(filePath)) {
        this.log(`  ✓ ${file}`);
      } else {
        this.addError(`必要文件缺失: ${file}`);
        allFilesExist = false;
      }
    }

    if (allFilesExist) {
      this.addSuccess('所有必要文件存在');
    }
  }

  /**
   * 检查 package.json 配置
   */
  checkPackageJson() {
    this.log('🔍 检查 package.json 配置...');
    
    try {
      const packageJsonPath = join(projectRoot, 'package.json');
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

      // 检查必要的脚本
      const requiredScripts = ['build', 'dev', 'preview'];
      for (const script of requiredScripts) {
        if (packageJson.scripts && packageJson.scripts[script]) {
          this.log(`  ✓ scripts.${script}`);
        } else {
          this.addError(`package.json 缺少必要脚本: ${script}`);
        }
      }

      // 检查依赖
      const criticalDeps = ['vue', 'vite', '@vitejs/plugin-vue'];
      for (const dep of criticalDeps) {
        if (packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep]) {
          this.log(`  ✓ ${dep}`);
        } else {
          this.addError(`缺少关键依赖: ${dep}`);
        }
      }

      this.addSuccess('package.json 配置检查完成');
    } catch (error) {
      this.addError(`无法读取 package.json: ${error.message}`);
    }
  }

  /**
   * 检查环境变量配置
   */
  checkEnvironmentVariables() {
    this.log('🔍 检查环境变量配置...');
    
    const requiredEnvVars = [
      'VITE_SUPABASE_URL',
      'VITE_SUPABASE_ANON_KEY'
    ];

    let envVarsConfigured = true;
    for (const envVar of requiredEnvVars) {
      if (process.env[envVar]) {
        this.log(`  ✓ ${envVar} (已设置)`);
      } else {
        this.addWarning(`环境变量未设置: ${envVar}`);
        envVarsConfigured = false;
      }
    }

    if (envVarsConfigured) {
      this.addSuccess('环境变量配置完整');
    } else {
      this.addWarning('部分环境变量未配置，可能影响功能');
    }
  }

  /**
   * 检查 TypeScript 配置
   */
  async checkTypeScript() {
    this.log('🔍 检查 TypeScript 配置...');
    
    try {
      // 检查类型检查
      await execAsync('npm run type-check', { 
        cwd: projectRoot,
        timeout: 30000 
      });
      this.addSuccess('TypeScript 类型检查通过');
    } catch (error) {
      this.addError(`TypeScript 类型检查失败: ${error.message}`);
    }
  }

  /**
   * 检查构建配置
   */
  async checkBuildConfiguration() {
    this.log('🔍 检查构建配置...');
    
    try {
      const viteConfigPath = join(projectRoot, 'vite.config.ts');
      if (existsSync(viteConfigPath)) {
        const viteConfig = readFileSync(viteConfigPath, 'utf8');
        
        // 检查基本配置
        if (viteConfig.includes('base:')) {
          this.log('  ✓ base 配置存在');
        } else {
          this.addWarning('vite.config.ts 中未设置 base 配置');
        }

        if (viteConfig.includes('build:')) {
          this.log('  ✓ build 配置存在');
        } else {
          this.addWarning('vite.config.ts 中未设置 build 配置');
        }

        this.addSuccess('Vite 配置检查完成');
      } else {
        this.addError('vite.config.ts 文件不存在');
      }
    } catch (error) {
      this.addError(`检查构建配置失败: ${error.message}`);
    }
  }

  /**
   * 检查依赖安装
   */
  async checkDependencies() {
    this.log('🔍 检查依赖安装...');
    
    try {
      const nodeModulesPath = join(projectRoot, 'node_modules');
      if (existsSync(nodeModulesPath)) {
        this.log('  ✓ node_modules 目录存在');
        
        // 检查关键依赖是否安装
        const criticalDeps = ['vue', 'vite', 'typescript'];
        for (const dep of criticalDeps) {
          const depPath = join(nodeModulesPath, dep);
          if (existsSync(depPath)) {
            this.log(`  ✓ ${dep} 已安装`);
          } else {
            this.addError(`关键依赖未安装: ${dep}`);
          }
        }
        
        this.addSuccess('依赖安装检查完成');
      } else {
        this.addError('node_modules 目录不存在，请运行 npm install');
      }
    } catch (error) {
      this.addError(`检查依赖安装失败: ${error.message}`);
    }
  }

  /**
   * 检查 Git 状态
   */
  async checkGitStatus() {
    this.log('🔍 检查 Git 状态...');
    
    try {
      // 检查是否有未提交的更改
      const { stdout: status } = await execAsync('git status --porcelain', { 
        cwd: projectRoot 
      });
      
      if (status.trim()) {
        this.addWarning('存在未提交的更改');
        const lines = status.trim().split('\n');
        lines.slice(0, 5).forEach(line => {
          this.log(`  ${line}`, 'warning');
        });
        if (lines.length > 5) {
          this.log(`  ... 还有 ${lines.length - 5} 个文件`, 'warning');
        }
      } else {
        this.addSuccess('工作目录清洁');
      }

      // 检查当前分支
      const { stdout: branch } = await execAsync('git branch --show-current', { 
        cwd: projectRoot 
      });
      this.log(`当前分支: ${branch.trim()}`);
      
    } catch (error) {
      this.addWarning(`Git 状态检查失败: ${error.message}`);
    }
  }

  /**
   * 模拟构建测试
   */
  async checkBuildTest() {
    this.log('🔍 模拟构建测试...');
    
    try {
      const startTime = Date.now();
      await execAsync('npm run build', { 
        cwd: projectRoot,
        timeout: 120000 // 2 分钟超时
      });
      const duration = Date.now() - startTime;
      
      this.addSuccess(`构建测试通过 (耗时: ${Math.round(duration / 1000)}秒)`);
      
      // 检查构建产物
      const distPath = join(projectRoot, 'dist');
      if (existsSync(distPath)) {
        const indexPath = join(distPath, 'index.html');
        if (existsSync(indexPath)) {
          this.addSuccess('构建产物验证通过');
        } else {
          this.addError('构建产物中缺少 index.html');
        }
      } else {
        this.addError('构建未生成 dist 目录');
      }
      
    } catch (error) {
      this.addError(`构建测试失败: ${error.message}`);
    }
  }

  /**
   * 生成检查报告
   */
  generateReport() {
    this.log('\n📊 部署前检查报告', 'info');
    this.log('='.repeat(50), 'info');
    
    this.log(`检查时间: ${new Date().toLocaleString()}`, 'info');
    this.log(`错误数量: ${this.errors.length}`, 'info');
    this.log(`警告数量: ${this.warnings.length}`, 'info');
    
    if (this.errors.length > 0) {
      this.log('\n❌ 发现的错误:', 'error');
      this.errors.forEach((error, index) => {
        this.log(`${index + 1}. ${error}`, 'error');
      });
    }
    
    if (this.warnings.length > 0) {
      this.log('\n⚠️ 发现的警告:', 'warning');
      this.warnings.forEach((warning, index) => {
        this.log(`${index + 1}. ${warning}`, 'warning');
      });
    }
    
    if (this.errors.length === 0 && this.warnings.length === 0) {
      this.log('\n🎉 所有检查通过！项目已准备好部署。', 'success');
      return true;
    } else if (this.errors.length === 0) {
      this.log('\n✅ 检查完成，存在一些警告但可以部署。', 'success');
      return true;
    } else {
      this.log('\n🚨 检查失败，请修复错误后再尝试部署。', 'error');
      return false;
    }
  }

  /**
   * 运行所有检查
   */
  async runAllChecks() {
    this.log('🚀 开始部署前检查...', 'info');
    this.log('='.repeat(50), 'info');
    
    // 运行所有检查
    this.checkRequiredFiles();
    this.checkPackageJson();
    this.checkEnvironmentVariables();
    await this.checkDependencies();
    await this.checkTypeScript();
    await this.checkBuildConfiguration();
    await this.checkGitStatus();
    await this.checkBuildTest();
    
    // 生成报告
    const passed = this.generateReport();
    
    // 退出代码
    process.exit(passed ? 0 : 1);
  }
}

// 运行检查
const checker = new PreDeployChecker();
checker.runAllChecks().catch(error => {
  console.error('❌ 部署前检查失败:', error);
  process.exit(1);
});