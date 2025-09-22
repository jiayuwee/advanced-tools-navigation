#!/usr/bin/env node

/**
 * 仅创建 Supabase 存储桶脚本（不设置策略）
 * 运行命令: node scripts/database/create-storage-buckets-only.js
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
    supabaseServiceKey ? "✅" : "❌",
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// 存储桶配置
const buckets = [
  {
    id: "avatars",
    name: "avatars",
    public: true,
    fileSizeLimit: 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  },
  {
    id: "product-images",
    name: "product-images",
    public: true,
    fileSizeLimit: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
  },
  {
    id: "tool-icons",
    name: "tool-icons",
    public: true,
    fileSizeLimit: 2 * 1024 * 1024, // 2MB
    allowedMimeTypes: [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/svg+xml",
    ],
  },
  {
    id: "uploads",
    name: "uploads",
    public: false,
    fileSizeLimit: 50 * 1024 * 1024, // 50MB
    allowedMimeTypes: ["application/pdf", "application/zip", "text/plain"],
  },
];

async function createStorageBuckets() {
  console.log("🚀 开始创建 Supabase 存储桶...");
  console.log("");

  for (const bucket of buckets) {
    try {
      console.log(`📁 创建存储桶: ${bucket.name}`);

      // 检查存储桶是否已存在
      const { data: existingBuckets, error: listError } =
        await supabase.storage.listBuckets();

      if (listError) {
        console.error(`❌ 获取存储桶列表失败:`, listError.message);
        continue;
      }

      const bucketExists = existingBuckets.some((b) => b.id === bucket.id);

      if (bucketExists) {
        console.log(`   ✅ 存储桶 ${bucket.name} 已存在`);
        continue;
      }

      // 创建存储桶
      const { error } = await supabase.storage.createBucket(bucket.id, {
        public: bucket.public,
        fileSizeLimit: bucket.fileSizeLimit,
        allowedMimeTypes: bucket.allowedMimeTypes,
      });

      if (error) {
        console.error(`   ❌ 创建失败:`, error.message);
      } else {
        console.log(`   ✅ 创建成功`);
        console.log(`      - 公开访问: ${bucket.public ? "是" : "否"}`);
        console.log(
          `      - 文件大小限制: ${(bucket.fileSizeLimit / 1024 / 1024).toFixed(1)}MB`,
        );
        console.log(
          `      - 允许的文件类型: ${bucket.allowedMimeTypes.join(", ")}`,
        );
      }
    } catch (error) {
      console.error(
        `   ❌ 创建存储桶 ${bucket.name} 时发生错误:`,
        error.message,
      );
    }

    console.log("");
  }
}

async function verifyBuckets() {
  console.log("🧪 验证存储桶创建结果...");
  console.log("");

  try {
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
    console.log("🎉 存储桶创建完成！");
    console.log("");
    console.log("📝 下一步操作:");
    console.log("   1. 运行策略修正脚本: npm run supabase:fix-policies");
    console.log("   2. 或者手动在 Supabase Dashboard 中设置策略");
    console.log("");
    console.log("🔗 有用的链接:");
    console.log(
      `📁 存储管理: ${supabaseUrl.replace("/rest/v1", "")}/dashboard/storage/buckets`,
    );
    console.log(
      `🔐 策略管理: ${supabaseUrl.replace("/rest/v1", "")}/dashboard/auth/policies`,
    );
  } catch (error) {
    console.error("❌ 验证过程中发生错误:", error.message);
  }
}

async function main() {
  try {
    await createStorageBuckets();
    await verifyBuckets();
  } catch (error) {
    console.error("❌ 脚本执行失败:", error.message);
    process.exit(1);
  }
}

// 运行脚本
main();
