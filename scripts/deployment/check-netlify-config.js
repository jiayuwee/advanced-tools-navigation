#!/usr/bin/env node

/**
 * 检查 Netlify 配置和环境变量
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🔍 检查 Netlify 配置...\n');

// 检查 netlify.toml 配置
const netlifyTomlPath = path.join(process.cwd(), 'netlify.toml');
if (fs.existsSync(netlifyTomlPath)) {
  console.log('✅ netlify.toml 存在');
  const content = fs.readFileSync(netlifyTomlPath, 'utf8');
  
  // 检查构建命令
  if (content.includes('npm ci && npm run build')) {
    console.log('✅ 构建命令正确');
  } else {
    console.log('⚠️  构建命令可能有问题');
  }
  
  // 检查发布目录
  if (content.includes('publish = "dist"')) {
    console.log('✅ 发布目录设置正确');
  } else {
    console.log('⚠️  发布目录设置可能有问题');
  }
  
  // 检查是否有硬编码的环境变量
  if (content.includes('VITE_SUPABASE_URL =') || content.includes('VITE_SUPABASE_ANON_KEY =')) {
    console.log('⚠️  netlify.toml 中包含硬编码的环境变量，建议移除');
  } else {
    console.log('✅ netlify.toml 中没有硬编码环境变量');
  }
} else {
  console.log('❌ netlify.toml 不存在');
}

// 检查本地环境变量文件
console.log('\n📋 检查本地环境变量文件:');
const envFiles = ['.env', '.env.local', '.env.production'];
envFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} 存在`);
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('VITE_SUPABASE_URL') && content.includes('VITE_SUPABASE_ANON_KEY')) {
      console.log(`   - 包含必要的 Supabase 环境变量`);
    } else {
      console.log(`   - ⚠️  缺少 Supabase 环境变量`);
    }
  } else {
    console.log(`❌ ${file} 不存在`);
  }
});

// 检查 package.json 构建脚本
console.log('\n🔧 检查构建脚本:');
const packageJsonPath = path.join(process.cwd(), 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  if (packageJson.scripts && packageJson.scripts.build) {
    console.log(`✅ 构建脚本: ${packageJson.scripts.build}`);
  } else {
    console.log('❌ 缺少构建脚本');
  }
} else {
  console.log('❌ package.json 不存在');
}

// 检查 Vite 配置
console.log('\n⚙️  检查 Vite 配置:');
const viteConfigFiles = ['vite.config.js', 'vite.config.ts'];
let viteConfigExists = false;
viteConfigFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} 存在`);
    viteConfigExists = true;
  }
});
if (!viteConfigExists) {
  console.log('❌ 未找到 Vite 配置文件');
}

// 提供修复建议
console.log('\n💡 修复建议:');
console.log('1. 确保 Netlify 站点设置中配置了以下环境变量:');
console.log('   - VITE_SUPABASE_URL');
console.log('   - VITE_SUPABASE_ANON_KEY');
console.log('2. 从 netlify.toml 中移除硬编码的环境变量');
console.log('3. 确保 .env.local 文件包含开发环境的环境变量');
console.log('4. 检查 GitHub Secrets 是否与 Netlify 环境变量一致');

console.log('\n🔗 相关链接:');
console.log('- Netlify 环境变量设置: https://app.netlify.com/sites/[your-site]/settings/env');
console.log('- GitHub Secrets 设置: https://github.com/jiayuwee/advanced-tools-navigation/settings/secrets/actions');
