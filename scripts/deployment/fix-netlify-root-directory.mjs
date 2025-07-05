#!/usr/bin/env node

/**
 * 修复 Netlify Root Directory 配置问题
 * 基于 Context7 最佳实践
 */

import fs from "fs";
import path from "path";

console.log("🔧 Netlify Root Directory 配置修复工具");
console.log("基于 Context7 最佳实践\n");

// 1. 分析问题
console.log("📋 问题分析:");
console.log(
  "❌ 错误: \"The specified Root Directory 'jiayuwee' does not exist\"",
);
console.log("🔍 原因: Netlify 站点设置中配置了错误的根目录");
console.log("💡 解决方案: 需要在 Netlify 控制台中修正 Root Directory 设置\n");

// 2. 检查当前项目结构
console.log("📁 当前项目结构检查:");

const projectRoot = process.cwd();
console.log(`✅ 项目根目录: ${projectRoot}`);

// 检查关键文件
const criticalFiles = [
  "package.json",
  "netlify.toml",
  "vite.config.ts",
  "src/main.ts",
  "index.html",
];

criticalFiles.forEach((file) => {
  if (fs.existsSync(path.join(projectRoot, file))) {
    console.log(`✅ ${file} 存在`);
  } else {
    console.log(`❌ ${file} 不存在`);
  }
});

// 3. 检查 netlify.toml 配置
console.log("\n⚙️ 检查 netlify.toml 配置:");
const netlifyTomlPath = path.join(projectRoot, "netlify.toml");
if (fs.existsSync(netlifyTomlPath)) {
  const content = fs.readFileSync(netlifyTomlPath, "utf8");
  console.log("✅ netlify.toml 存在");

  // 检查构建配置
  if (content.includes('publish = "dist"')) {
    console.log("✅ 发布目录配置正确: dist");
  }

  if (content.includes("npm install") || content.includes("npm ci")) {
    console.log("✅ 构建命令配置正确");
  }

  // 检查是否有 base 配置
  if (content.includes("base =")) {
    console.log("⚠️ netlify.toml 中包含 base 配置，这可能导致问题");
  } else {
    console.log("✅ netlify.toml 中没有 base 配置");
  }
} else {
  console.log("❌ netlify.toml 不存在");
}

// 4. 提供修复步骤
console.log("\n🛠️ 修复步骤:");
console.log("1. 登录 Netlify 控制台: https://app.netlify.com/");
console.log(
  "2. 进入站点设置: https://app.netlify.com/sites/spiffy-torrone-5454e1/settings/deploys",
);
console.log('3. 在 "Build & deploy" 部分找到 "Build settings"');
console.log("4. 修改以下设置:");
console.log("   - Base directory: 留空 (不要填写任何值)");
console.log(
  "   - Build command: npm cache clean --force && npm install --no-optional && npm run build",
);
console.log("   - Publish directory: dist");
console.log('5. 点击 "Save" 保存设置');
console.log('6. 触发新的部署: "Trigger deploy" > "Deploy site"');

// 5. 验证当前配置
console.log("\n✅ 正确的 Netlify 配置应该是:");
console.log("```");
console.log("Base directory: (留空)");
console.log(
  "Build command: npm cache clean --force && npm install --no-optional && npm run build",
);
console.log("Publish directory: dist");
console.log("```");

// 6. 环境变量检查
console.log("\n🔐 环境变量检查:");
console.log("确保在 Netlify 环境变量中设置了:");
console.log("- VITE_SUPABASE_URL");
console.log("- VITE_SUPABASE_ANON_KEY");
console.log(
  "环境变量设置地址: https://app.netlify.com/sites/spiffy-torrone-5454e1/settings/env",
);

// 7. 快速链接
console.log("\n🔗 快速链接:");
console.log(
  "- Netlify 站点设置: https://app.netlify.com/sites/spiffy-torrone-5454e1/settings/deploys",
);
console.log(
  "- Netlify 环境变量: https://app.netlify.com/sites/spiffy-torrone-5454e1/settings/env",
);
console.log(
  "- GitHub 仓库: https://github.com/jiayuwee/advanced-tools-navigation",
);
console.log(
  "- 部署日志: https://app.netlify.com/sites/spiffy-torrone-5454e1/deploys",
);

console.log("\n🎯 修复完成后，重新部署应该成功！");
