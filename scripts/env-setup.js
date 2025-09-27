#!/usr/bin/env node

/**
 * 环境变量配置助手脚本
 * 帮助用户快速配置开发和生产环境的环境变量
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// 环境变量配置模板
const ENV_TEMPLATE = {
  // Supabase 配置
  VITE_SUPABASE_URL: 'https://your-project.supabase.co',
  VITE_SUPABASE_ANON_KEY: 'your-anon-key',
  
  // 应用配置
  VITE_APP_ENV: 'development',
  VITE_APP_VERSION: '1.0.0',
  VITE_DEBUG_MODE: 'true',
  VITE_ENABLE_ANALYTICS: 'false',
  
  // 支付配置（可选）
  VITE_STRIPE_PUBLIC_KEY: '',
  VITE_ALIPAY_APP_ID: '',
  VITE_WECHAT_APP_ID: '',
};

// 生产环境配置
const PRODUCTION_ENV = {
  VITE_APP_ENV: 'production',
  VITE_DEBUG_MODE: 'false',
  VITE_ENABLE_ANALYTICS: 'true',
};

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

function writeEnvFile(filename, config) {
  const content = Object.entries(config)
    .filter(([key, value]) => value !== undefined && value !== '')
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  
  fs.writeFileSync(filename, content + '\n');
  console.log(`✅ 已创建 ${filename}`);
}

function validateSupabaseUrl(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.includes('supabase.co');
  } catch {
    return false;
  }
}

async function setupEnvironment() {
  console.log('🚀 环境变量配置助手');
  console.log('====================================');
  
  const config = { ...ENV_TEMPLATE };
  
  // 选择配置类型
  const setupType = await question(
    '请选择配置类型:\n' +
    '1. 开发环境配置 (.env.local)\n' +
    '2. Netlify 生产环境配置\n' +
    '3. 创建环境变量模板 (.env.example)\n' +
    '请输入数字 (1-3): '
  );
  
  if (setupType === '3') {
    // 创建模板文件
    writeEnvFile('.env.example', ENV_TEMPLATE);
    console.log('\n📝 模板文件已创建！');
    console.log('请复制 .env.example 为 .env.local 并填入实际值');
    rl.close();
    return;
  }
  
  if (setupType === '2') {
    // 生产环境配置
    Object.assign(config, PRODUCTION_ENV);
  }
  
  console.log('\n🔧 配置 Supabase 连接信息:');
  console.log('请访问 https://supabase.com，进入项目设置 → API 获取以下信息\n');
  
  // Supabase URL
  let supabaseUrl;
  do {
    supabaseUrl = await question('Supabase Project URL: ');
    if (!validateSupabaseUrl(supabaseUrl)) {
      console.log('❌ 无效的 Supabase URL，请确保格式正确（如：https://xxx.supabase.co）');
    }
  } while (!validateSupabaseUrl(supabaseUrl));
  config.VITE_SUPABASE_URL = supabaseUrl;
  
  // Supabase Anon Key
  const anonKey = await question('Supabase Anon Key: ');
  if (anonKey && anonKey.length > 50) {
    config.VITE_SUPABASE_ANON_KEY = anonKey;
  } else {
    console.log('⚠️ 密钥长度似乎不正确，请确认输入');
    config.VITE_SUPABASE_ANON_KEY = anonKey;
  }
  
  // 应用版本
  if (setupType === '1') {
    const version = await question(`应用版本 (默认: ${config.VITE_APP_VERSION}): `);
    if (version) config.VITE_APP_VERSION = version;
  }
  
  // 可选的支付配置
  const needPayment = await question('\n是否配置支付功能？(y/N): ');
  if (needPayment.toLowerCase() === 'y') {
    console.log('\n💳 配置支付信息:');
    
    const stripeKey = await question('Stripe Public Key (可选): ');
    if (stripeKey) config.VITE_STRIPE_PUBLIC_KEY = stripeKey;
    
    const alipayId = await question('支付宝 App ID (可选): ');
    if (alipayId) config.VITE_ALIPAY_APP_ID = alipayId;
    
    const wechatId = await question('微信支付 App ID (可选): ');
    if (wechatId) config.VITE_WECHAT_APP_ID = wechatId;
  }
  
  // 写入配置文件
  if (setupType === '1') {
    writeEnvFile('.env.local', config);
    console.log('\n✅ 开发环境配置完成！');
    console.log('现在可以运行 npm run dev 启动开发服务器');
  } else if (setupType === '2') {
    console.log('\n🌐 Netlify 生产环境配置:');
    console.log('请在 Netlify 控制台设置以下环境变量:');
    console.log('====================================');
    
    Object.entries(config)
      .filter(([key, value]) => value !== undefined && value !== '')
      .forEach(([key, value]) => {
        console.log(`${key} = ${value}`);
      });
    
    console.log('\n📋 配置步骤:');
    console.log('1. 登录 Netlify (https://netlify.com)');
    console.log('2. 进入站点设置 → Environment variables');
    console.log('3. 添加上述环境变量');
    console.log('4. 触发新的部署');
  }
  
  rl.close();
}

async function checkEnvironment() {
  console.log('🔍 检查当前环境变量配置...\n');
  
  const envFiles = ['.env.local', '.env'];
  let foundConfig = false;
  
  for (const file of envFiles) {
    if (fs.existsSync(file)) {
      console.log(`✅ 找到配置文件: ${file}`);
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n').filter(line => line.trim() && !line.startsWith('#'));
      
      console.log(`   包含 ${lines.length} 个环境变量:`);
      lines.forEach(line => {
        const [key] = line.split('=');
        console.log(`   - ${key}`);
      });
      console.log('');
      foundConfig = true;
    }
  }
  
  if (!foundConfig) {
    console.log('❌ 未找到环境变量配置文件');
    console.log('请运行: node scripts/env-setup.js 进行配置\n');
  }
  
  // 检查必需的环境变量
  console.log('🎯 检查必需的环境变量:');
  const required = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];
  
  required.forEach(key => {
    const value = process.env[key];
    if (value && !value.includes('your-')) {
      console.log(`✅ ${key}: 已配置`);
    } else {
      console.log(`❌ ${key}: 未配置或使用默认值`);
    }
  });
}

async function main() {
  const command = process.argv[2];
  
  switch (command) {
    case 'check':
      await checkEnvironment();
      break;
    case 'setup':
    default:
      await setupEnvironment();
      break;
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  setupEnvironment,
  checkEnvironment,
  writeEnvFile,
  ENV_TEMPLATE,
  PRODUCTION_ENV,
};