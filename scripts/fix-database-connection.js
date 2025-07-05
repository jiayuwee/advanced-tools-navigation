#!/usr/bin/env node

/**
 * 数据库连接修复脚本
 * 用于诊断和修复Supabase连接问题
 */

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 加载环境变量
dotenv.config({ path: join(__dirname, "../.env.local") });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log("🔧 数据库连接修复工具");
console.log("=".repeat(50));

// 检查环境变量
console.log("📋 检查环境配置...");
console.log(`Supabase URL: ${supabaseUrl}`);
console.log(
  `API Key: ${supabaseKey ? supabaseKey.substring(0, 20) + "..." : "未设置"}`,
);

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ 环境变量未正确设置");
  console.log("请检查 .env.local 文件中的以下变量：");
  console.log("- VITE_SUPABASE_URL");
  console.log("- VITE_SUPABASE_ANON_KEY");
  process.exit(1);
}

// 创建Supabase客户端
const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log("\n🔌 测试数据库连接...");

    // 测试基本连接
    const { data, error } = await supabase
      .from("categories")
      .select("count")
      .limit(1);

    if (error) {
      console.error("❌ 连接失败:", error.message);

      if (error.message.includes("Legacy API keys are disabled")) {
        console.log("\n🔑 检测到API密钥问题");
        console.log("解决方案：");
        console.log("1. 访问 Supabase 控制台");
        console.log("2. 进入项目设置 > API");
        console.log("3. 重新启用 legacy keys 或获取新的 publishable key");
        console.log("4. 更新 .env.local 文件中的 VITE_SUPABASE_ANON_KEY");
      }

      return false;
    }

    console.log("✅ 数据库连接成功");
    return true;
  } catch (err) {
    console.error("❌ 连接测试失败:", err.message);
    return false;
  }
}

async function checkTables() {
  try {
    console.log("\n📊 检查数据表状态...");

    // 检查分类表
    const { data: categories, error: catError } = await supabase
      .from("categories")
      .select("*")
      .limit(10);

    if (catError) {
      console.error("❌ 分类表查询失败:", catError.message);
    } else {
      console.log(`✅ 分类表: ${categories.length} 条记录`);
      console.log("📂 分类详情:");
      categories.forEach((cat) => {
        console.log(`  - ${cat.name}: ${cat.description}`);
      });
    }

    // 检查工具表
    const { data: tools, error: toolError } = await supabase
      .from("tools")
      .select("name, description, url, category_id")
      .limit(10);

    if (toolError) {
      console.error("❌ 工具表查询失败:", toolError.message);
    } else {
      console.log(`\n✅ 工具表: ${tools.length} 条记录`);
      console.log("🔧 工具详情:");
      tools.forEach((tool) => {
        console.log(`  - ${tool.name}: ${tool.description}`);
        console.log(`    URL: ${tool.url}`);
      });
    }
  } catch (err) {
    console.error("❌ 表检查失败:", err.message);
  }
}

async function reinitializeData() {
  try {
    console.log("\n🔄 重新初始化数据...");

    // 示例分类数据
    const categories = [
      {
        name: "开发工具",
        description: "编程开发相关工具",
        icon: "💻",
        sort_order: 1,
      },
      {
        name: "设计工具",
        description: "UI/UX设计工具",
        icon: "🎨",
        sort_order: 2,
      },
      {
        name: "AI工具",
        description: "人工智能相关工具",
        icon: "🤖",
        sort_order: 3,
      },
      {
        name: "效率工具",
        description: "提升工作效率的工具",
        icon: "⚡",
        sort_order: 4,
      },
      {
        name: "学习资源",
        description: "学习和教育资源",
        icon: "📚",
        sort_order: 5,
      },
    ];

    // 清空现有数据（可选）
    console.log("🗑️ 清理现有数据...");
    await supabase
      .from("tools")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase
      .from("categories")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");

    // 插入分类
    console.log("📂 插入分类数据...");
    const { data: insertedCategories, error: catError } = await supabase
      .from("categories")
      .insert(categories)
      .select();

    if (catError) {
      console.error("❌ 分类插入失败:", catError.message);
      return false;
    }

    console.log(`✅ 成功插入 ${insertedCategories.length} 个分类`);

    // 示例工具数据
    const tools = [
      {
        name: "Visual Studio Code",
        description: "微软开发的免费代码编辑器",
        url: "https://code.visualstudio.com/",
        icon: "📝",
        category_id: insertedCategories.find((c) => c.name === "开发工具").id,
        is_featured: true,
        click_count: 1250,
      },
      {
        name: "Figma",
        description: "基于浏览器的协作设计工具",
        url: "https://www.figma.com/",
        icon: "🎨",
        category_id: insertedCategories.find((c) => c.name === "设计工具").id,
        is_featured: true,
        click_count: 890,
      },
      {
        name: "ChatGPT",
        description: "OpenAI开发的AI对话助手",
        url: "https://chat.openai.com/",
        icon: "🤖",
        category_id: insertedCategories.find((c) => c.name === "AI工具").id,
        is_featured: true,
        click_count: 2100,
      },
    ];

    // 插入工具
    console.log("🔧 插入工具数据...");
    const { data: insertedTools, error: toolError } = await supabase
      .from("tools")
      .insert(tools)
      .select();

    if (toolError) {
      console.error("❌ 工具插入失败:", toolError.message);
      return false;
    }

    console.log(`✅ 成功插入 ${insertedTools.length} 个工具`);
    return true;
  } catch (err) {
    console.error("❌ 数据初始化失败:", err.message);
    return false;
  }
}

async function main() {
  console.log("开始诊断...\n");

  // 测试连接
  const connected = await testConnection();

  if (!connected) {
    console.log("\n❌ 无法连接到数据库，请先解决连接问题");
    return;
  }

  // 检查表状态
  await checkTables();

  // 询问是否重新初始化数据
  console.log("\n❓ 是否需要重新初始化数据？(y/N)");

  // 在实际使用中，这里可以添加用户输入处理
  // 现在直接执行重新初始化
  const shouldReinit = process.argv.includes("--reinit");

  if (shouldReinit) {
    const success = await reinitializeData();
    if (success) {
      console.log("\n🎉 数据初始化完成！");
    }
  }

  console.log("\n✅ 诊断完成");
}

main().catch(console.error);
