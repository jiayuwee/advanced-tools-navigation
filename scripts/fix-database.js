import { createClient } from "@supabase/supabase-js";

// 从环境变量或使用默认值
const supabaseUrl =
  process.env.VITE_SUPABASE_URL || "https://fytiwsutzgmygfxnqoft.supabase.co";
const supabaseKey =
  process.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5dGl3c3V0emhteWdmcG5xb2Z0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NzQ4MDAsImV4cCI6MjA1MDU1MDgwMH0.placeholder";

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixDatabase() {
  console.log("🔧 开始修复数据库结构...");

  try {
    // 1. 创建 categories 表
    console.log("📋 创建 categories 表...");
    const { error: categoriesError } = await supabase.rpc("exec_sql", {
      sql: `
        CREATE TABLE IF NOT EXISTS categories (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          icon TEXT,
          color TEXT DEFAULT '#0078d4',
          parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
          sort_order INTEGER DEFAULT 0,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `,
    });

    if (categoriesError) {
      console.log("⚠️ categories 表可能已存在:", categoriesError.message);
    } else {
      console.log("✅ categories 表创建成功");
    }

    // 2. 创建 tools 表
    console.log("🛠️ 创建 tools 表...");
    const { error: toolsError } = await supabase.rpc("exec_sql", {
      sql: `
        CREATE TABLE IF NOT EXISTS tools (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          url TEXT NOT NULL,
          icon TEXT,
          category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
          is_featured BOOLEAN DEFAULT false,
          status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
          click_count INTEGER DEFAULT 0,
          is_favorite BOOLEAN DEFAULT false,
          meta_title TEXT,
          meta_description TEXT,
          sort_order INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
        );
      `,
    });

    if (toolsError) {
      console.log("⚠️ tools 表可能已存在:", toolsError.message);
    } else {
      console.log("✅ tools 表创建成功");
    }

    // 3. 创建标签表
    console.log("🏷️ 创建 tags 表...");
    const { error: tagsError } = await supabase.rpc("exec_sql", {
      sql: `
        CREATE TABLE IF NOT EXISTS tags (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name TEXT NOT NULL UNIQUE,
          description TEXT,
          color TEXT DEFAULT '#0078d4',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `,
    });

    if (tagsError) {
      console.log("⚠️ tags 表可能已存在:", tagsError.message);
    } else {
      console.log("✅ tags 表创建成功");
    }

    // 4. 创建工具标签关联表
    console.log("🔗 创建 tool_tags 表...");
    const { error: toolTagsError } = await supabase.rpc("exec_sql", {
      sql: `
        CREATE TABLE IF NOT EXISTS tool_tags (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          tool_id UUID REFERENCES tools(id) ON DELETE CASCADE,
          tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(tool_id, tag_id)
        );
      `,
    });

    if (toolTagsError) {
      console.log("⚠️ tool_tags 表可能已存在:", toolTagsError.message);
    } else {
      console.log("✅ tool_tags 表创建成功");
    }

    // 5. 插入示例数据
    console.log("📝 插入示例数据...");

    // 插入分类数据
    const { error: insertCategoriesError } = await supabase
      .from("categories")
      .upsert(
        [
          {
            id: "550e8400-e29b-41d4-a716-446655440001",
            name: "开发工具",
            description: "编程开发相关工具",
            icon: "code",
            color: "#0078d4",
            sort_order: 1,
            is_active: true,
          },
          {
            id: "550e8400-e29b-41d4-a716-446655440002",
            name: "设计工具",
            description: "UI/UX设计相关工具",
            icon: "palette",
            color: "#ff6b6b",
            sort_order: 2,
            is_active: true,
          },
          {
            id: "550e8400-e29b-41d4-a716-446655440003",
            name: "AI工具",
            description: "人工智能相关工具",
            icon: "brain",
            color: "#4ecdc4",
            sort_order: 3,
            is_active: true,
          },
          {
            id: "550e8400-e29b-41d4-a716-446655440004",
            name: "效率工具",
            description: "提升工作效率的工具",
            icon: "zap",
            color: "#45b7d1",
            sort_order: 4,
            is_active: true,
          },
        ],
        { onConflict: "id" },
      );

    if (insertCategoriesError) {
      console.log("⚠️ 插入分类数据失败:", insertCategoriesError.message);
    } else {
      console.log("✅ 分类数据插入成功");
    }

    // 插入工具数据
    const { error: insertToolsError } = await supabase.from("tools").upsert(
      [
        {
          id: "660e8400-e29b-41d4-a716-446655440001",
          name: "Vue.js",
          description: "渐进式JavaScript框架",
          url: "https://vuejs.org",
          category_id: "550e8400-e29b-41d4-a716-446655440001",
          is_featured: true,
          status: "active",
          sort_order: 1,
        },
        {
          id: "660e8400-e29b-41d4-a716-446655440002",
          name: "Figma",
          description: "协作界面设计工具",
          url: "https://figma.com",
          category_id: "550e8400-e29b-41d4-a716-446655440002",
          is_featured: true,
          status: "active",
          sort_order: 1,
        },
        {
          id: "660e8400-e29b-41d4-a716-446655440003",
          name: "ChatGPT",
          description: "AI对话助手",
          url: "https://chat.openai.com",
          category_id: "550e8400-e29b-41d4-a716-446655440003",
          is_featured: true,
          status: "active",
          sort_order: 1,
        },
        {
          id: "660e8400-e29b-41d4-a716-446655440004",
          name: "Notion",
          description: "全能工作空间",
          url: "https://notion.so",
          category_id: "550e8400-e29b-41d4-a716-446655440004",
          is_featured: true,
          status: "active",
          sort_order: 1,
        },
      ],
      { onConflict: "id" },
    );

    if (insertToolsError) {
      console.log("⚠️ 插入工具数据失败:", insertToolsError.message);
    } else {
      console.log("✅ 工具数据插入成功");
    }

    console.log("🎉 数据库修复完成！");
  } catch (error) {
    console.error("❌ 数据库修复失败:", error);
  }
}

// 运行修复
fixDatabase();
