#!/usr/bin/env node

/**
 * 自动创建 Supabase 存储桶脚本
 * 运行命令: node scripts/database/setup-storage-buckets.js
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

async function setupStoragePolicies() {
  console.log("🔒 设置存储访问策略...");
  console.log("");

  const policies = [
    // 头像存储策略
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
    // 产品图片策略
    {
      name: "所有人可以查看产品图片",
      sql: `
        CREATE POLICY "所有人可以查看产品图片" ON storage.objects
        FOR SELECT USING (bucket_id = 'product-images');
      `,
    },
    {
      name: "管理员可以管理产品图片",
      sql: `
        CREATE POLICY "管理员可以管理产品图片" ON storage.objects
        FOR ALL USING (
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
      name: "管理员可以管理工具图标",
      sql: `
        CREATE POLICY "管理员可以管理工具图标" ON storage.objects
        FOR ALL USING (
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
  ];

  for (const policy of policies) {
    try {
      console.log(`🔐 创建策略: ${policy.name}`);

      const { error } = await supabase.rpc("exec_sql", {
        sql: policy.sql.trim(),
      });

      if (error) {
        // 如果策略已存在，忽略错误
        if (error.message.includes("already exists")) {
          console.log(`   ✅ 策略已存在`);
        } else {
          console.error(`   ❌ 创建失败:`, error.message);
        }
      } else {
        console.log(`   ✅ 创建成功`);
      }
    } catch (error) {
      console.error(`   ❌ 创建策略时发生错误:`, error.message);
    }
  }
}

async function verifySetup() {
  console.log("");
  console.log("🧪 验证存储桶设置...");
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
    console.log("🎉 存储桶设置完成！");
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
    await setupStoragePolicies();
    await verifySetup();
  } catch (error) {
    console.error("❌ 脚本执行失败:", error.message);
    process.exit(1);
  }
}

// 运行脚本
main();
