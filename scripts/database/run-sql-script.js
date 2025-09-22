import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import dotenv from "dotenv";

// 加载环境变量
dotenv.config();

// Supabase 配置 - 从环境变量读取
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// 验证必要的环境变量
if (!supabaseUrl || !supabaseKey) {
  console.error("❌ 缺少必要的环境变量:");
  if (!supabaseUrl) console.error("  - VITE_SUPABASE_URL");
  if (!supabaseKey) console.error("  - SUPABASE_SERVICE_ROLE_KEY");
  console.error("\n请确保 .env 文件包含正确的 Supabase 配置");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runSqlScript(scriptPath) {
  try {
    console.log(`📄 读取SQL脚本: ${scriptPath}`);

    if (!fs.existsSync(scriptPath)) {
      console.error(`❌ 文件不存在: ${scriptPath}`);
      process.exit(1);
    }

    const sqlContent = fs.readFileSync(scriptPath, "utf8");
    console.log(`📊 脚本大小: ${sqlContent.length} 字符`);

    console.log("🚀 开始执行SQL脚本...");

    // 分割SQL语句（简单分割，按分号分割）
    const statements = sqlContent
      .split(";")
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0 && !stmt.startsWith("--"));

    console.log(`📝 发现 ${statements.length} 条SQL语句`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim().length === 0) continue;

      try {
        console.log(`\n⏳ 执行语句 ${i + 1}/${statements.length}...`);
        console.log(
          `📝 SQL: ${statement.substring(0, 100)}${statement.length > 100 ? "..." : ""}`,
        );

        const { error } = await supabase.rpc("exec_sql", {
          sql: statement,
        });

        if (error) {
          console.error(`❌ 语句 ${i + 1} 执行失败:`, error.message);
          errorCount++;
        } else {
          console.log(`✅ 语句 ${i + 1} 执行成功`);
          successCount++;
        }
      } catch (err) {
        console.error(`❌ 语句 ${i + 1} 执行异常:`, err.message);
        errorCount++;
      }
    }

    console.log(`\n📊 执行完成:`);
    console.log(`✅ 成功: ${successCount} 条`);
    console.log(`❌ 失败: ${errorCount} 条`);

    if (errorCount === 0) {
      console.log("🎉 所有SQL语句执行成功！");
    } else {
      console.log("⚠️ 部分SQL语句执行失败，请检查错误信息");
    }
  } catch (error) {
    console.error("❌ 脚本执行失败:", error.message);
    process.exit(1);
  }
}

// 获取命令行参数
const scriptPath = process.argv[2];

if (!scriptPath) {
  console.error("❌ 请提供SQL脚本路径");
  console.log("用法: node run-sql-script.js <script-path>");
  process.exit(1);
}

// 运行脚本
runSqlScript(scriptPath);
