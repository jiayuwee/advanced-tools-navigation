#!/usr/bin/env node

/**
 * Vercel 部署修复脚本
 * 用于修复 Vercel 项目配置问题
 */

import fs from 'fs';
import path from 'path';

console.log('🔧 Vercel 部署修复脚本');
console.log('=====================================\n');

// 检查项目结构
console.log('📋 检查项目结构...');
const projectRoot = process.cwd();
const requiredFiles = [
  'package.json',
  'vite.config.ts',
  'index.html',
  'src/main.ts'
];

let allFilesExist = true;
for (const file of requiredFiles) {
  const filePath = path.join(projectRoot, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} 存在`);
  } else {
    console.log(`❌ ${file} 不存在`);
    allFilesExist = false;
  }
}

if (!allFilesExist) {
  console.log('\n❌ 项目结构不完整，无法继续');
  process.exit(1);
}

// 检查 vercel.json
console.log('\n⚙️ 检查 Vercel 配置...');
const vercelConfigPath = path.join(projectRoot, 'vercel.json');
if (fs.existsSync(vercelConfigPath)) {
  console.log('✅ vercel.json 已存在');
  
  try {
    const config = JSON.parse(fs.readFileSync(vercelConfigPath, 'utf8'));
    console.log('✅ vercel.json 格式正确');
    
    // 检查关键配置
    if (config.buildCommand) {
      console.log(`✅ 构建命令: ${config.buildCommand}`);
    }
    if (config.outputDirectory) {
      console.log(`✅ 输出目录: ${config.outputDirectory}`);
    }
    if (config.framework) {
      console.log(`✅ 框架: ${config.framework}`);
    }
  } catch (error) {
    console.log('❌ vercel.json 格式错误:', error.message);
  }
} else {
  console.log('❌ vercel.json 不存在');
}

// 检查构建输出
console.log('\n🔨 检查构建配置...');
const packageJsonPath = path.join(projectRoot, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

if (packageJson.scripts && packageJson.scripts.build) {
  console.log(`✅ 构建脚本: ${packageJson.scripts.build}`);
} else {
  console.log('❌ 缺少构建脚本');
}

// 检查环境变量
console.log('\n🔐 环境变量检查...');
const envFiles = ['.env.example', '.env.local'];
envFiles.forEach(file => {
  const filePath = path.join(projectRoot, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} 存在`);
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('VITE_SUPABASE_URL') && content.includes('VITE_SUPABASE_ANON_KEY')) {
      console.log('   - 包含必要的环境变量');
    } else {
      console.log('   - ⚠️ 缺少必要的环境变量');
    }
  } else {
    console.log(`⚠️ ${file} 不存在`);
  }
});

// 生成修复指南
console.log('\n📋 Vercel 部署修复指南');
console.log('=====================================');
console.log('1. 登录 Vercel Dashboard: https://vercel.com/dashboard');
console.log('2. 找到项目: v0-new-project-76nkzowqolw');
console.log('3. 进入项目设置 (Settings)');
console.log('4. 在 "General" 选项卡中:');
console.log('   - Root Directory: 设置为 "." (点) 或留空');
console.log('   - Build Command: npm run build');
console.log('   - Output Directory: dist');
console.log('   - Install Command: npm install --no-optional');
console.log('5. 在 "Environment Variables" 选项卡中添加:');
console.log('   - VITE_SUPABASE_URL: 您的 Supabase URL');
console.log('   - VITE_SUPABASE_ANON_KEY: 您的 Supabase Anon Key');
console.log('6. 保存设置并重新部署');

console.log('\n🔗 有用的链接:');
console.log('- Vercel 项目: https://vercel.com/wee-jiayus-projects-ef134c31/v0-new-project-76nkzowqolw');
console.log('- Vercel 文档: https://vercel.com/docs');
console.log('- 主要网站 (Netlify): https://ramusi.cn');

console.log('\n💡 建议:');
console.log('- 如果不需要 Vercel 部署，可以删除该项目');
console.log('- 主要部署平台建议保持 Netlify (ramusi.cn)');
console.log('- Vercel 可以作为备用部署或测试环境');

console.log('\n✅ 修复脚本执行完成');
