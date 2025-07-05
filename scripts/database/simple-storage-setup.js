#!/usr/bin/env node

/**
 * 简化的存储桶和策略设置脚本
 * 运行命令: node scripts/database/simple-storage-setup.js
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

async function createBuckets() {
  console.log("📁 创建存储桶...");

  const buckets = [
    { id: "avatars", public: true, fileSizeLimit: 5242880 },
    { id: "product-images", public: true, fileSizeLimit: 10485760 },
    { id: "tool-icons", public: true, fileSizeLimit: 2097152 },
    { id: "uploads", public: false, fileSizeLimit: 52428800 },
  ];

  for (const bucket of buckets) {
    try {
      const { data: existing } = await supabase.storage.listBuckets();
      const bucketExists = existing?.some((b) => b.id === bucket.id);

      if (bucketExists) {
        console.log(`   ✅ ${bucket.id} 已存在`);
        continue;
      }

      const { error } = await supabase.storage.createBucket(bucket.id, {
        public: bucket.public,
        fileSizeLimit: bucket.fileSizeLimit,
      });

      if (error) {
        console.error(`   ❌ ${bucket.id} 创建失败: ${error.message}`);
      } else {
        console.log(`   ✅ ${bucket.id} 创建成功`);
      }
    } catch (error) {
      console.error(`   ❌ ${bucket.id} 创建错误: ${error.message}`);
    }
  }
}

async function createPolicies() {
  console.log("\n🔒 创建存储策略...");

  const policies = [
    "CREATE POLICY \"用户可以查看所有头像\" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');",

    "CREATE POLICY \"用户可以上传自己的头像\" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);",

    "CREATE POLICY \"所有人可以查看产品图片\" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');",

    "CREATE POLICY \"管理员可以上传产品图片\" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images' AND EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));",

    "CREATE POLICY \"所有人可以查看工具图标\" ON storage.objects FOR SELECT USING (bucket_id = 'tool-icons');",

    "CREATE POLICY \"管理员可以上传工具图标\" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'tool-icons' AND EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));",

    "CREATE POLICY \"用户可以查看自己的上传文件\" ON storage.objects FOR SELECT USING (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]);",

    "CREATE POLICY \"用户可以上传文件\" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]);",
  ];

  for (const [index, sql] of policies.entries()) {
    try {
      console.log(`   🔐 创建策略 ${index + 1}/${policies.length}`);

      const { error } = await supabase.rpc("exec_sql", { sql });

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
      console.error(`   ❌ 策略创建错误: ${error.message}`);
    }
  }
}

async function verifySetup() {
  console.log("\n🧪 验证设置...");

  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();

    if (error) {
      console.error("❌ 获取存储桶失败:", error.message);
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

    console.log("\n🎉 存储设置完成！");
  } catch (error) {
    console.error("❌ 验证失败:", error.message);
  }
}

async function main() {
  try {
    console.log("🚀 开始设置 Supabase 存储...\n");

    await createBuckets();
    await createPolicies();
    await verifySetup();
  } catch (error) {
    console.error("❌ 设置失败:", error.message);
    process.exit(1);
  }
}

main();
