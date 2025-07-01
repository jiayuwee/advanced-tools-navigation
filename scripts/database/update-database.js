import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import dotenv from "dotenv";

// 加载环境变量
dotenv.config();

// Supabase 配置 - 从环境变量读取
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// 验证必要的环境变量
if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ 缺少必要的环境变量:");
  if (!supabaseUrl) console.error("  - VITE_SUPABASE_URL");
  if (!supabaseServiceKey) console.error("  - SUPABASE_SERVICE_ROLE_KEY");
  console.error("\n请确保 .env 文件包含正确的 Supabase 配置");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateDatabase() {
  try {
    console.log("开始更新数据库...");

    // 清空现有数据
    console.log("清空工具标签关联...");
    await supabase.from("tool_tags").delete().neq("tool_id", "");

    console.log("清空工具数据...");
    await supabase.from("tools").delete().neq("id", "");

    console.log("清空标签数据...");
    await supabase.from("tags").delete().neq("id", "");

    // 插入新标签
    console.log("插入新标签...");
    const tags = [
      {
        id: "750e8400-e29b-41d4-a716-446655440001",
        name: "代码托管",
        color: "#0078d4",
      },
      {
        id: "750e8400-e29b-41d4-a716-446655440002",
        name: "版本控制",
        color: "#0078d4",
      },
      {
        id: "750e8400-e29b-41d4-a716-446655440003",
        name: "开源",
        color: "#107c10",
      },
      {
        id: "750e8400-e29b-41d4-a716-446655440004",
        name: "协作",
        color: "#8764b8",
      },
      {
        id: "750e8400-e29b-41d4-a716-446655440005",
        name: "代码编辑器",
        color: "#0078d4",
      },
      {
        id: "750e8400-e29b-41d4-a716-446655440006",
        name: "IDE",
        color: "#0078d4",
      },
      {
        id: "750e8400-e29b-41d4-a716-446655440007",
        name: "UI设计",
        color: "#8764b8",
      },
      {
        id: "750e8400-e29b-41d4-a716-446655440008",
        name: "原型设计",
        color: "#8764b8",
      },
      {
        id: "750e8400-e29b-41d4-a716-446655440009",
        name: "图像编辑",
        color: "#8764b8",
      },
      {
        id: "750e8400-e29b-41d4-a716-446655440010",
        name: "AI助手",
        color: "#ff8c00",
      },
      {
        id: "750e8400-e29b-41d4-a716-446655440011",
        name: "对话",
        color: "#ff8c00",
      },
      {
        id: "750e8400-e29b-41d4-a716-446655440012",
        name: "写作",
        color: "#ff8c00",
      },
      {
        id: "750e8400-e29b-41d4-a716-446655440013",
        name: "编程",
        color: "#0078d4",
      },
      {
        id: "750e8400-e29b-41d4-a716-446655440014",
        name: "AI绘画",
        color: "#ff8c00",
      },
      {
        id: "750e8400-e29b-41d4-a716-446655440015",
        name: "图像生成",
        color: "#ff8c00",
      },
      {
        id: "750e8400-e29b-41d4-a716-446655440016",
        name: "笔记工具",
        color: "#107c10",
      },
      {
        id: "750e8400-e29b-41d4-a716-446655440017",
        name: "数据库",
        color: "#107c10",
      },
      {
        id: "750e8400-e29b-41d4-a716-446655440018",
        name: "项目管理",
        color: "#107c10",
      },
      {
        id: "750e8400-e29b-41d4-a716-446655440019",
        name: "看板",
        color: "#107c10",
      },
      {
        id: "750e8400-e29b-41d4-a716-446655440020",
        name: "网络测试",
        color: "#00bcf2",
      },
      {
        id: "750e8400-e29b-41d4-a716-446655440021",
        name: "网速测试",
        color: "#00bcf2",
      },
      {
        id: "750e8400-e29b-41d4-a716-446655440022",
        name: "在线设计",
        color: "#8764b8",
      },
      {
        id: "750e8400-e29b-41d4-a716-446655440023",
        name: "模板",
        color: "#8764b8",
      },
      {
        id: "750e8400-e29b-41d4-a716-446655440024",
        name: "免费图片",
        color: "#e74856",
      },
      {
        id: "750e8400-e29b-41d4-a716-446655440025",
        name: "高质量素材",
        color: "#e74856",
      },
      {
        id: "750e8400-e29b-41d4-a716-446655440026",
        name: "团队沟通",
        color: "#8764b8",
      },
      {
        id: "750e8400-e29b-41d4-a716-446655440027",
        name: "即时通讯",
        color: "#8764b8",
      },
      {
        id: "750e8400-e29b-41d4-a716-446655440028",
        name: "视频会议",
        color: "#8764b8",
      },
      {
        id: "750e8400-e29b-41d4-a716-446655440029",
        name: "云存储",
        color: "#107c10",
      },
      {
        id: "750e8400-e29b-41d4-a716-446655440030",
        name: "文档协作",
        color: "#107c10",
      },
      {
        id: "750e8400-e29b-41d4-a716-446655440031",
        name: "在线办公",
        color: "#107c10",
      },
      {
        id: "750e8400-e29b-41d4-a716-446655440032",
        name: "代码部署",
        color: "#0078d4",
      },
      {
        id: "750e8400-e29b-41d4-a716-446655440033",
        name: "静态网站",
        color: "#0078d4",
      },
      {
        id: "750e8400-e29b-41d4-a716-446655440034",
        name: "CDN",
        color: "#00bcf2",
      },
      {
        id: "750e8400-e29b-41d4-a716-446655440035",
        name: "容器化",
        color: "#0078d4",
      },
      {
        id: "750e8400-e29b-41d4-a716-446655440036",
        name: "DevOps",
        color: "#0078d4",
      },
      {
        id: "750e8400-e29b-41d4-a716-446655440037",
        name: "监控",
        color: "#00bcf2",
      },
      {
        id: "750e8400-e29b-41d4-a716-446655440038",
        name: "日志分析",
        color: "#00bcf2",
      },
      {
        id: "750e8400-e29b-41d4-a716-446655440039",
        name: "密码管理",
        color: "#e74856",
      },
      {
        id: "750e8400-e29b-41d4-a716-446655440040",
        name: "安全",
        color: "#e74856",
      },
      {
        id: "750e8400-e29b-41d4-a716-446655440041",
        name: "翻译",
        color: "#ff8c00",
      },
      {
        id: "750e8400-e29b-41d4-a716-446655440042",
        name: "语言学习",
        color: "#ff8c00",
      },
      {
        id: "750e8400-e29b-41d4-a716-446655440043",
        name: "音乐",
        color: "#e74856",
      },
      {
        id: "750e8400-e29b-41d4-a716-446655440044",
        name: "流媒体",
        color: "#e74856",
      },
      {
        id: "750e8400-e29b-41d4-a716-446655440045",
        name: "视频编辑",
        color: "#e74856",
      },
      {
        id: "750e8400-e29b-41d4-a716-446655440046",
        name: "短视频",
        color: "#e74856",
      },
      {
        id: "750e8400-e29b-41d4-a716-446655440047",
        name: "社交媒体",
        color: "#8764b8",
      },
      {
        id: "750e8400-e29b-41d4-a716-446655440048",
        name: "内容创作",
        color: "#8764b8",
      },
      {
        id: "750e8400-e29b-41d4-a716-446655440049",
        name: "电子商务",
        color: "#107c10",
      },
      {
        id: "750e8400-e29b-41d4-a716-446655440050",
        name: "在线支付",
        color: "#107c10",
      },
    ];

    const { error: tagsError } = await supabase.from("tags").insert(tags);
    if (tagsError) {
      console.error("插入标签失败:", tagsError);
      return;
    }

    console.log("标签插入成功！");
    console.log("数据库更新完成！");
  } catch (error) {
    console.error("更新数据库时出错:", error);
  }
}

updateDatabase();
