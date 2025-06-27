#!/usr/bin/env node

/**
 * 修正存储策略脚本
 * 解决 user_id 字段不存在的问题
 * 运行命令: node scripts/database/fix-storage-policies.js
 */

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// 加载环境变量
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ 缺少必要的环境变量:");
  console.error("   VITE_SUPABASE_URL:", supabaseUrl ? "✅" : "❌");
  console.error(
    "   SUPABASE_SERVICE_ROLE_KEY:",
    supabaseServiceKey ? "✅" : "❌"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function dropExistingPolicies() {
  console.log("🗑️ 删除可能存在的错误策略...");

  const policiesToDrop = [
    'DROP POLICY IF EXISTS "管理员可以管理产品图片" ON storage.objects;',
    'DROP POLICY IF EXISTS "管理员可以管理工具图标" ON storage.objects;',
    'DROP POLICY IF EXISTS "管理员可以上传产品图片" ON storage.objects;',
    'DROP POLICY IF EXISTS "管理员可以更新产品图片" ON storage.objects;',
    'DROP POLICY IF EXISTS "管理员可以删除产品图片" ON storage.objects;',
    'DROP POLICY IF EXISTS "管理员可以上传工具图标" ON storage.objects;',
    'DROP POLICY IF EXISTS "管理员可以更新工具图标" ON storage.objects;',
    'DROP POLICY IF EXISTS "管理员可以删除工具图标" ON storage.objects;',
    'DROP POLICY IF EXISTS "管理员可以查看所有上传文件" ON storage.objects;',
  ];

  for (const sql of policiesToDrop) {
    try {
      const { error } = await supabase.rpc("exec_sql", { sql });
      if (error && !error.message.includes("does not exist")) {
        console.error(`   ⚠️ 删除策略时出错: ${error.message}`);
      }
    } catch (error) {
      // 忽略删除不存在策略的错误
    }
  }

  console.log("   ✅ 清理完成");
}

async function createCorrectPolicies() {
  console.log("🔒 创建正确的存储策略...");

  const policies = [
    // 头像策略
    {
      name: "用户可以查看所有头像",
      sql: `
        CREATE POLICY "用户可以查看所有头像" ON storage.objects
        FOR SELECT USING (bucket_id = 'avatars');
      `,
    },
    {
      name: "用户可以上传自己的头像",
      sql: `
        CREATE POLICY "用户可以上传自己的头像" ON storage.objects
        FOR INSERT WITH CHECK (
          bucket_id = 'avatars' 
          AND auth.uid()::text = (storage.foldername(name))[1]
        );
      `,
    },
    {
      name: "用户可以更新自己的头像",
      sql: `
        CREATE POLICY "用户可以更新自己的头像" ON storage.objects
        FOR UPDATE USING (
          bucket_id = 'avatars' 
          AND auth.uid()::text = (storage.foldername(name))[1]
        );
      `,
    },
    {
      name: "用户可以删除自己的头像",
      sql: `
        CREATE POLICY "用户可以删除自己的头像" ON storage.objects
        FOR DELETE USING (
          bucket_id = 'avatars' 
          AND auth.uid()::text = (storage.foldername(name))[1]
        );
      `,
    },
    // 产品图片策略
    {
      name: "所有人可以查看产品图片",
      sql: `
        CREATE POLICY "所有人可以查看产品图片" ON storage.objects
        FOR SELECT USING (bucket_id = 'product-images');
      `,
    },
    {
      name: "管理员可以上传产品图片",
      sql: `
        CREATE POLICY "管理员可以上传产品图片" ON storage.objects
        FOR INSERT WITH CHECK (
          bucket_id = 'product-images'
          AND EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
          )
        );
      `,
    },
    {
      name: "管理员可以更新产品图片",
      sql: `
        CREATE POLICY "管理员可以更新产品图片" ON storage.objects
        FOR UPDATE USING (
          bucket_id = 'product-images'
          AND EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
          )
        );
      `,
    },
    {
      name: "管理员可以删除产品图片",
      sql: `
        CREATE POLICY "管理员可以删除产品图片" ON storage.objects
        FOR DELETE USING (
          bucket_id = 'product-images'
          AND EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
          )
        );
      `,
    },
    // 工具图标策略
    {
      name: "所有人可以查看工具图标",
      sql: `
        CREATE POLICY "所有人可以查看工具图标" ON storage.objects
        FOR SELECT USING (bucket_id = 'tool-icons');
      `,
    },
    {
      name: "管理员可以上传工具图标",
      sql: `
        CREATE POLICY "管理员可以上传工具图标" ON storage.objects
        FOR INSERT WITH CHECK (
          bucket_id = 'tool-icons'
          AND EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
          )
        );
      `,
    },
    {
      name: "管理员可以更新工具图标",
      sql: `
        CREATE POLICY "管理员可以更新工具图标" ON storage.objects
        FOR UPDATE USING (
          bucket_id = 'tool-icons'
          AND EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
          )
        );
      `,
    },
    {
      name: "管理员可以删除工具图标",
      sql: `
        CREATE POLICY "管理员可以删除工具图标" ON storage.objects
        FOR DELETE USING (
          bucket_id = 'tool-icons'
          AND EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
          )
        );
      `,
    },
    // 用户上传文件策略
    {
      name: "用户可以查看自己的上传文件",
      sql: `
        CREATE POLICY "用户可以查看自己的上传文件" ON storage.objects
        FOR SELECT USING (
          bucket_id = 'uploads' 
          AND auth.uid()::text = (storage.foldername(name))[1]
        );
      `,
    },
    {
      name: "用户可以上传文件",
      sql: `
        CREATE POLICY "用户可以上传文件" ON storage.objects
        FOR INSERT WITH CHECK (
          bucket_id = 'uploads' 
          AND auth.uid()::text = (storage.foldername(name))[1]
        );
      `,
    },
    {
      name: "用户可以删除自己的上传文件",
      sql: `
        CREATE POLICY "用户可以删除自己的上传文件" ON storage.objects
        FOR DELETE USING (
          bucket_id = 'uploads' 
          AND auth.uid()::text = (storage.foldername(name))[1]
        );
      `,
    },
    {
      name: "管理员可以查看所有上传文件",
      sql: `
        CREATE POLICY "管理员可以查看所有上传文件" ON storage.objects
        FOR SELECT USING (
          bucket_id = 'uploads'
          AND EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
          )
        );
      `,
    },
  ];

  for (const policy of policies) {
    try {
      console.log(`   🔐 创建策略: ${policy.name}`);

      // 清理 SQL 中的注释和多余空白
      const cleanSql = policy.sql
        .split("\n")
        .map((line) => line.trim())
        .filter(
          (line) => line && !line.startsWith("--") && !line.startsWith("#")
        )
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();

      const { error } = await supabase.rpc("exec_sql", {
        sql: cleanSql,
      });

      if (error) {
        if (error.message.includes("already exists")) {
          console.log(`      ✅ 策略已存在`);
        } else {
          console.error(`      ❌ 创建失败: ${error.message}`);
        }
      } else {
        console.log(`      ✅ 创建成功`);
      }
    } catch (error) {
      console.error(`   ❌ 创建策略时发生错误: ${error.message}`);
    }
  }
}

async function verifyPolicies() {
  console.log("");
  console.log("🧪 验证策略设置...");

  try {
    // 检查存储桶
    const { data: buckets, error } = await supabase.storage.listBuckets();

    if (error) {
      console.error("❌ 获取存储桶列表失败:", error.message);
      return;
    }

    const expectedBuckets = [
      "avatars",
      "product-images",
      "tool-icons",
      "uploads",
    ];

    console.log("📋 存储桶状态:");
    for (const bucketId of expectedBuckets) {
      const bucket = buckets.find((b) => b.id === bucketId);
      if (bucket) {
        console.log(`   ✅ ${bucketId} - ${bucket.public ? "公开" : "私有"}`);
      } else {
        console.log(`   ❌ ${bucketId} - 未找到`);
      }
    }

    console.log("");
    console.log("🎉 存储策略修正完成！");
  } catch (error) {
    console.error("❌ 验证过程中发生错误:", error.message);
  }
}

async function main() {
  try {
    console.log("🔧 修正 Supabase 存储策略...");
    console.log("");

    await dropExistingPolicies();
    await createCorrectPolicies();
    await verifyPolicies();
  } catch (error) {
    console.error("❌ 脚本执行失败:", error.message);
    process.exit(1);
  }
}

// 运行脚本
main();
