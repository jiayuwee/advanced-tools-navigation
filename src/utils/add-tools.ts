import { supabase } from "../lib/supabase";
import { additionalTools } from "../data/additional-tools";

export async function addAdditionalTools() {
  try {
    console.log("开始添加新工具...");

    // 批量插入工具
    const { data, error } = await supabase
      .from("tools")
      .insert(additionalTools)
      .select();

    if (error) {
      console.error("添加工具失败:", error);
      throw error;
    }

    console.log(`成功添加 ${data?.length || 0} 个工具`);
    return data;
  } catch (error) {
    console.error("添加工具时出错:", error);
    throw error;
  }
}

// 如果直接运行此文件，则执行添加操作
if (import.meta.env.DEV) {
  // 在开发环境中可以手动调用
  window.addAdditionalTools = addAdditionalTools;
}
