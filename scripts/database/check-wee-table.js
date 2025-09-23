#!/usr/bin/env node

/**
 * 检查 wee 表的脚本
 * 运行命令: node scripts/database/check-wee-table.js
 */

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// 加载环境变量
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ 缺少必要的环境变量");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkWeeTable() {
  console.log("🔍 检查 wee 表...");

  try {
    // 尝试直接查询 wee 表
    const { error: weeError } = await supabase.from("wee").select("*").limit(1);

    if (weeError) {
      if (
        weeError.message.includes("does not exist") ||
        weeError.code === "42P01"
      ) {
        console.log("✅ wee 表不存在，无需删除");
        return false;
      } else {
        console.error("❌ 查询 wee 表失败:", weeError.message);
        return false;
      }
    }

    console.log("⚠️ 发现 wee 表存在");

    // 查看表中的数据数量
    const { count, error: countError } = await supabase
      .from("wee")
      .select("*", { count: "exact", head: true });

    if (countError) {
      console.error("❌ 查询数据数量失败:", countError.message);
    } else {
      console.log(`📊 数据行数: ${count || 0}`);
    }

    // 如果有数据，显示前几行
    if (count && count > 0) {
      const { data: sampleData, error: sampleError } = await supabase
        .from("wee")
        .select("*")
        .limit(5);

      if (!sampleError && sampleData && sampleData.length > 0) {
        console.log("📄 示例数据:");
        console.log(JSON.stringify(sampleData, null, 2));
      }
    }

    return true;

    // 查看表结构
    const { data: columns, error: columnsError } = await supabase.rpc(
      "exec_sql",
      {
        sql: `
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'wee' AND table_schema = 'public'
        ORDER BY ordinal_position;
      `,
      },
    );

    if (columnsError) {
      console.error("❌ 查询表结构失败:", columnsError.message);
    } else {
      console.log("📋 表结构:");
      if (columns && columns.length > 0) {
        columns.forEach((col) => {
          console.log(
            `   - ${col.column_name}: ${col.data_type} ${col.is_nullable === "NO" ? "NOT NULL" : "NULL"} ${col.column_default ? `DEFAULT ${col.column_default}` : ""}`,
          );
        });
      }
    }

    // 查看表数据
    const { data: rowCount, error: countError } = await supabase.rpc(
      "exec_sql",
      {
        sql: "SELECT COUNT(*) as count FROM public.wee;",
      },
    );

    if (countError) {
      console.error("❌ 查询数据数量失败:", countError.message);
    } else {
      console.log(`📊 数据行数: ${rowCount?.[0]?.count || 0}`);
    }

    // 如果有数据，显示前几行
    if (rowCount?.[0]?.count > 0) {
      const { data: sampleData, error: sampleError } = await supabase.rpc(
        "exec_sql",
        {
          sql: "SELECT * FROM public.wee LIMIT 5;",
        },
      );

      if (!sampleError && sampleData && sampleData.length > 0) {
        console.log("📄 示例数据:");
        console.log(JSON.stringify(sampleData, null, 2));
      }
    }

    // 检查是否有外键依赖
    const { data: dependencies, error: depError } = await supabase.rpc(
      "exec_sql",
      {
        sql: `
        SELECT 
          tc.constraint_name,
          tc.table_name,
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
          AND (tc.table_name = 'wee' OR ccu.table_name = 'wee');
      `,
      },
    );

    if (!depError && dependencies && dependencies.length > 0) {
      console.log("🔗 外键依赖:");
      dependencies.forEach((dep) => {
        console.log(
          `   - ${dep.table_name}.${dep.column_name} -> ${dep.foreign_table_name}.${dep.foreign_column_name}`,
        );
      });
    } else {
      console.log("✅ 无外键依赖");
    }
  } catch (error) {
    console.error("❌ 检查过程中发生错误:", error.message);
  }
}

async function deleteWeeTable() {
  console.log("\n🗑️ 删除 wee 表...");

  try {
    const { error } = await supabase.rpc("exec_sql", {
      sql: "DROP TABLE IF EXISTS public.wee CASCADE;",
    });

    if (error) {
      console.error("❌ 删除表失败:", error.message);
    } else {
      console.log("✅ wee 表已成功删除");
    }
  } catch (error) {
    console.error("❌ 删除过程中发生错误:", error.message);
  }
}

async function main() {
  console.log("🔍 检查和清理 wee 表");
  console.log("=" * 30);

  await checkWeeTable();

  console.log("\n❓ 是否要删除 wee 表？");
  console.log("   如果这个表不是项目必需的，建议删除以解决安全警告");
  console.log("   运行: npm run db:delete-wee-table");
}

// 如果直接运行脚本且带有 --delete 参数，则直接删除
if (process.argv.includes("--delete")) {
  deleteWeeTable();
} else {
  main();
}

export { checkWeeTable, deleteWeeTable };
