import { createClient } from "@supabase/supabase-js";

// Supabase 配置
const supabaseUrl = "https://fytiwsutzgmygfxnqoft.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5dGl3c3V0emdteWdmeG5xb2Z0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4MDM1ODcsImV4cCI6MjA2NjM3OTU4N30.LM9vazR9QCZ4vLC_Q1lJmtCj3pEVqM6vpW4TKzntAQA";

const supabase = createClient(supabaseUrl, supabaseKey);

// 示例分类数据
const categories = [
  {
    name: "开发工具",
    icon: "💻",
    description: "编程开发相关工具",
    color: "#0078d4",
  },
  {
    name: "设计工具",
    icon: "🎨",
    description: "设计和创意工具",
    color: "#e74c3c",
  },
  {
    name: "效率工具",
    icon: "⚡",
    description: "提升工作效率的工具",
    color: "#f39c12",
  },
  {
    name: "AI工具",
    icon: "🤖",
    description: "人工智能相关工具",
    color: "#9b59b6",
  },
  {
    name: "学习资源",
    icon: "📚",
    description: "学习和教育资源",
    color: "#27ae60",
  },
];

// 示例工具数据
const tools = [
  {
    name: "Visual Studio Code",
    description: "微软开发的免费代码编辑器，支持多种编程语言和丰富的插件生态",
    url: "https://code.visualstudio.com/",
    icon: "📝",
    category_name: "开发工具",
    tags: ["编辑器", "开发", "免费", "微软"],
    is_featured: true,
    click_count: 1250,
  },
  {
    name: "GitHub",
    description: "全球最大的代码托管平台，支持Git版本控制和协作开发",
    url: "https://github.com/",
    icon: "🐙",
    category_name: "开发工具",
    tags: ["代码托管", "Git", "协作", "开源"],
    is_featured: true,
    click_count: 2100,
  },
  {
    name: "Figma",
    description: "基于浏览器的协作设计工具，支持实时协作和原型设计",
    url: "https://www.figma.com/",
    icon: "🎨",
    category_name: "设计工具",
    tags: ["设计", "协作", "原型", "UI/UX"],
    is_featured: true,
    click_count: 890,
  },
  {
    name: "Notion",
    description: "集笔记、数据库、任务管理于一体的全能工作空间",
    url: "https://www.notion.so/",
    icon: "📝",
    category_name: "效率工具",
    tags: ["笔记", "数据库", "任务管理", "协作"],
    is_featured: true,
    click_count: 1560,
  },
  {
    name: "ChatGPT",
    description: "OpenAI开发的AI聊天机器人，能够进行自然语言对话和内容生成",
    url: "https://chat.openai.com/",
    icon: "🤖",
    category_name: "AI工具",
    tags: ["AI", "聊天", "内容生成", "OpenAI"],
    is_featured: true,
    click_count: 3200,
  },
  {
    name: "MDN Web Docs",
    description: "Mozilla维护的Web开发文档，是学习Web技术的权威资源",
    url: "https://developer.mozilla.org/",
    icon: "📚",
    category_name: "学习资源",
    tags: ["文档", "Web开发", "学习", "Mozilla"],
    is_featured: false,
    click_count: 750,
  },
  {
    name: "Stack Overflow",
    description: "程序员问答社区，解决编程问题的首选平台",
    url: "https://stackoverflow.com/",
    icon: "❓",
    category_name: "学习资源",
    tags: ["问答", "编程", "社区", "解决方案"],
    is_featured: false,
    click_count: 1800,
  },
  {
    name: "Canva",
    description: "在线图形设计平台，提供丰富的模板和设计元素",
    url: "https://www.canva.com/",
    icon: "🖼️",
    category_name: "设计工具",
    tags: ["设计", "模板", "在线", "简单"],
    is_featured: false,
    click_count: 920,
  },
  {
    name: "Trello",
    description: "基于看板的项目管理工具，简单直观的任务管理",
    url: "https://trello.com/",
    icon: "📋",
    category_name: "效率工具",
    tags: ["项目管理", "看板", "任务", "团队"],
    is_featured: false,
    click_count: 680,
  },
  {
    name: "Midjourney",
    description: "AI图像生成工具，通过文本描述生成高质量艺术作品",
    url: "https://www.midjourney.com/",
    icon: "🎭",
    category_name: "AI工具",
    tags: ["AI", "图像生成", "艺术", "创意"],
    is_featured: false,
    click_count: 1100,
  },
];

async function initializeData() {
  try {
    console.log("开始初始化数据...");

    // 1. 插入分类数据
    console.log("插入分类数据...");
    const { data: categoriesData, error: categoriesError } = await supabase
      .from("categories")
      .insert(categories)
      .select();

    if (categoriesError) {
      console.error("插入分类数据失败:", categoriesError);
      return;
    }

    console.log("分类数据插入成功:", categoriesData.length, "个分类");

    // 2. 为每个工具找到对应的分类ID并插入
    console.log("插入工具数据...");

    for (const tool of tools) {
      const category = categoriesData.find(
        (cat) => cat.name === tool.category_name,
      );
      if (!category) {
        console.error(`找不到分类: ${tool.category_name}`);
        continue;
      }

      const toolData = {
        name: tool.name,
        description: tool.description,
        url: tool.url,
        icon: tool.icon,
        category_id: category.id,
        tags: tool.tags,
        is_featured: tool.is_featured,
        click_count: tool.click_count,
      };

      const { error: toolError } = await supabase
        .from("tools")
        .insert(toolData);

      if (toolError) {
        console.error(`插入工具 ${tool.name} 失败:`, toolError);
      } else {
        console.log(`工具 ${tool.name} 插入成功`);
      }
    }

    console.log("数据初始化完成！");
  } catch (error) {
    console.error("初始化数据时发生错误:", error);
  }
}

// 运行初始化
initializeData();
