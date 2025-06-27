#!/usr/bin/env node

/**
 * GitHub Secrets 自动配置脚本
 * 
 * 此脚本帮助自动配置 GitHub Actions 所需的 Secrets
 * 
 * 使用方法:
 * 1. 确保已安装 GitHub CLI: gh auth login
 * 2. 运行: node scripts/deployment/setup-github-secrets.js
 */

import { readFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import dotenv from 'dotenv';

// 加载环境变量
if (existsSync('.env.local')) {
  dotenv.config({ path: '.env.local' });
}

const REPO = 'jiayuwee/advanced-tools-navigation';

// 需要配置的 secrets
const REQUIRED_SECRETS = {
  'VITE_SUPABASE_URL': {
    value: process.env.VITE_SUPABASE_URL,
    description: 'Supabase 项目 API URL'
  },
  'VITE_SUPABASE_ANON_KEY': {
    value: process.env.VITE_SUPABASE_ANON_KEY,
    description: 'Supabase 项目匿名密钥'
  },
  'SUPABASE_PROJECT_REF': {
    value: 'ndmxwdejswybvbwrxsai', // 从记忆中获取的项目 ID
    description: 'Supabase 项目引用 ID'
  }
};

console.log('🔐 GitHub Secrets 自动配置工具');
console.log('=====================================\n');

// 检查 GitHub CLI
function checkGitHubCLI() {
  try {
    execSync('gh --version', { stdio: 'pipe' });
    console.log('✅ GitHub CLI 已安装');
    
    // 检查认证状态
    const authStatus = execSync('gh auth status', { stdio: 'pipe', encoding: 'utf8' });
    if (authStatus.includes('Logged in')) {
      console.log('✅ GitHub CLI 已认证');
      return true;
    }
  } catch (error) {
    console.log('❌ GitHub CLI 未安装或未认证');
    console.log('\n请先安装并认证 GitHub CLI:');
    console.log('1. 安装: https://cli.github.com/');
    console.log('2. 认证: gh auth login');
    return false;
  }
}

// 设置 secret
function setSecret(name, value, description) {
  if (!value) {
    console.log(`⚠️  跳过 ${name}: 值为空`);
    return false;
  }

  try {
    execSync(`gh secret set ${name} --body "${value}" --repo ${REPO}`, { stdio: 'pipe' });
    console.log(`✅ 已设置 ${name}: ${description}`);
    return true;
  } catch (error) {
    console.log(`❌ 设置 ${name} 失败:`, error.message);
    return false;
  }
}

// 主函数
async function main() {
  // 检查 GitHub CLI
  if (!checkGitHubCLI()) {
    process.exit(1);
  }

  console.log('\n📋 开始配置 GitHub Secrets...\n');

  let successCount = 0;
  let totalCount = 0;

  // 配置每个 secret
  for (const [name, config] of Object.entries(REQUIRED_SECRETS)) {
    totalCount++;
    if (setSecret(name, config.value, config.description)) {
      successCount++;
    }
  }

  console.log('\n📊 配置结果:');
  console.log(`✅ 成功: ${successCount}/${totalCount}`);

  if (successCount < totalCount) {
    console.log('\n⚠️  部分 secrets 配置失败');
    console.log('请手动配置缺失的 secrets:');
    console.log(`🔗 https://github.com/${REPO}/settings/secrets/actions`);
  }

  // 特别提醒 SUPABASE_ACCESS_TOKEN
  console.log('\n🔑 重要提醒:');
  console.log('SUPABASE_ACCESS_TOKEN 需要手动配置:');
  console.log('1. 访问 Supabase Dashboard');
  console.log('2. 进入 Settings > API');
  console.log('3. 在 Personal access tokens 部分创建新令牌');
  console.log('4. 复制令牌并添加到 GitHub Secrets');

  console.log('\n🚀 配置完成后，可以触发工作流测试:');
  console.log(`gh workflow run "Deploy to Supabase (Fixed)" --repo ${REPO}`);
}

main().catch(console.error);
