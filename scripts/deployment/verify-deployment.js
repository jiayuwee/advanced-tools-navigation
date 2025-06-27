// Supabase 部署验证脚本
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// 加载环境变量
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log("🔍 验证 Supabase 部署...");

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ 环境变量未配置");
  console.log(
    "请检查 .env.local 文件中的 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY",
  );
  process.exit(1);
}

if (
  supabaseUrl.includes("your-project-ref") ||
  supabaseKey.includes("your-anon-key")
) {
  console.error("❌ 请更新 .env.local 文件中的实际 Supabase 配置");
  console.log("当前配置仍为模板值，请替换为您的实际项目信息");
  process.exit(1);
}

// 创建 Supabase 客户端
const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyDeployment() {
  try {
    console.log("📊 检查数据库连接...");

    // 测试基本连接
    const { data: healthCheck, error: healthError } = await supabase
      .from("categories")
      .select("count")
      .limit(1);

    if (healthError) {
      console.error("❌ 数据库连接失败:", healthError.message);
      return false;
    }

    console.log("✅ 数据库连接正常");

    // 检查主要表是否存在
    const tables = [
      "user_profiles",
      "categories",
      "product_categories",
      "tools",
      "products",
      "tags",
      "tool_tags",
      "favorites",
      "orders",
      "order_items",
      "payments",
      "product_reviews",
      "analytics",
    ];

    console.log("📋 检查数据库表...");

    for (const table of tables) {
      try {
        const { error } = await supabase.from(table).select("count").limit(1);

        if (error) {
          console.error(`❌ 表 ${table} 不存在或无法访问:`, error.message);
          return false;
        } else {
          console.log(`✅ 表 ${table} 存在`);
        }
      } catch (err) {
        console.error(`❌ 检查表 ${table} 时出错:`, err.message);
        return false;
      }
    }

    // 检查存储桶
    console.log("🗄️ 检查存储桶...");
    const { data: buckets, error: bucketsError } =
      await supabase.storage.listBuckets();

    if (bucketsError) {
      console.warn("⚠️ 无法检查存储桶:", bucketsError.message);
    } else {
      const expectedBuckets = [
        "avatars",
        "product-images",
        "tool-icons",
        "uploads",
      ];
      const existingBuckets = buckets.map((b) => b.name);

      for (const bucket of expectedBuckets) {
        if (existingBuckets.includes(bucket)) {
          console.log(`✅ 存储桶 ${bucket} 存在`);
        } else {
          console.warn(`⚠️ 存储桶 ${bucket} 不存在，需要手动创建`);
        }
      }
    }

    console.log("");
    console.log("🎉 Supabase 部署验证完成！");
    console.log("");
    console.log("📋 部署状态总结:");
    console.log("✅ 数据库连接正常");
    console.log("✅ 所有必要的表都已创建");
    console.log("⚠️ 请手动创建存储桶（如果尚未创建）");
    console.log("");
    console.log("🔗 有用的链接:");
    console.log(
      `📊 Supabase Dashboard: ${supabaseUrl.replace("/rest/v1", "")}/dashboard`,
    );
    console.log(
      `🗄️ 数据库管理: ${supabaseUrl.replace("/rest/v1", "")}/dashboard/database/tables`,
    );
    console.log(
      `🔐 认证设置: ${supabaseUrl.replace("/rest/v1", "")}/dashboard/auth/users`,
    );
    console.log(
      `📁 存储管理: ${supabaseUrl.replace("/rest/v1", "")}/dashboard/storage/buckets`,
    );

    return true;
  } catch (error) {
    console.error("❌ 验证过程中出现错误:", error.message);
    return false;
  }
}

// 运行验证
verifyDeployment()
  .then((success) => {
    if (!success) {
      console.log("");
      console.log("🔧 故障排除建议:");
      console.log("1. 检查 .env.local 文件中的配置是否正确");
      console.log('2. 确认 Supabase 项目状态为 "Active"');
      console.log("3. 运行数据库迁移: npx supabase db push");
      console.log("4. 查看 Supabase Dashboard 中的错误日志");
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error("❌ 验证脚本执行失败:", error.message);
    process.exit(1);
  });
