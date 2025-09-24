import { ref, computed } from "vue";
import { defineStore } from "pinia";
import { supabase } from "@/lib/supabaseClient";
import type { Database } from "@/types/database";
import { additionalTools } from "@/data/additional-tools";
type Tables = Database["public"]["Tables"];

// 定义 Tool 类型，并扩展以包含关联的 category 和 tags 数据
// 这使得在组件中直接访问 tool.category.name 和 tool.tags 成为可能
export type Tool = Tables["tools"]["Row"] & {
  categories: Tables["categories"]["Row"] | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- mapping generated relation which may not match types exactly
  tool_tags: Array<{
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- passthrough from generated relation
    tags: any;
  }> | null;
  tags?: string[]; // 计算属性，从 tool_tags 中提取标签名称
};

export const useToolsStore = defineStore("tools", () => {
  // --- State (状态) ---
  const tools = ref<Tool[]>([]);
  const loading = ref(false);
  const error = ref<Error | null>(null);
  const initialized = ref(false);

  // 状态：搜索查询，由 AppHeader.vue 使用
  const searchQuery = ref("");
  // 状态：选中的分类
  const selectedCategory = ref("all");
  // 状态：侧边栏折叠状态，由 AppHeader.vue 使用
  const sidebarCollapsed = ref(false);

  // --- Getters (计算属性) ---

  /**
   * 根据搜索查询动态过滤工具列表。
   * 这是响应式的，当 searchQuery 或 tools 变化时会自动重新计算。
   */
  const filteredTools = computed(() => {
    if (!searchQuery.value) {
      return tools.value;
    }
    const lowerCaseQuery = searchQuery.value.toLowerCase();
    return tools.value.filter(
      (tool) =>
        tool.name.toLowerCase().includes(lowerCaseQuery) ||
        tool.description.toLowerCase().includes(lowerCaseQuery) ||
        (tool.categories &&
          tool.categories.name.toLowerCase().includes(lowerCaseQuery)),
    );
  });

  // --- Actions (操作) ---

  /**
   * 从 Supabase 数据库获取所有工具数据。
   * 它会同时获取关联的分类信息。
   */
  async function fetchTools() {
    if (loading.value) return;

    loading.value = true;
    error.value = null;
    try {
      // 检查环境变量是否已配置
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (
        !supabaseUrl ||
        !supabaseAnonKey ||
        supabaseUrl.includes("your-project-ref") ||
        supabaseAnonKey.includes("your-anon-key")
      ) {
        // 生产环境中不应悄悄回退到模拟数据——应当显式报错以便快速定位配置问题
        if (import.meta.env.PROD) {
          console.error(
            "Supabase 环境变量未配置（生产），请在 CI/部署环境中设置 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY",
          );
          error.value = new Error("Supabase 未配置（生产环境）");
          initialized.value = true;
          loading.value = false;
          return;
        }

        // 开发环境仍然允许使用模拟数据，便于本地调试
        console.warn("Supabase 环境变量未配置，使用模拟工具数据");
        const mockTools = [
          {
            id: "1",
            name: "Visual Studio Code",
            description: "免费的代码编辑器，支持多种编程语言",
            url: "https://code.visualstudio.com",
            icon: "💻",
            category_id: "1",
            is_featured: true,
            click_count: 150,
            status: "active" as const,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            created_by: null,
            meta_title: null,
            meta_description: null,
            sort_order: 1,
            categories: {
              id: "1",
              name: "开发工具",
              description: "编程开发相关工具",
              icon: "💻",
              color: "#3b82f6",
              parent_id: null,
              sort_order: 1,
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            tool_tags: null,
            tags: ["编程", "开发", "编辑器"],
          },
          {
            id: "2",
            name: "Figma",
            description: "协作式界面设计工具",
            url: "https://figma.com",
            icon: "🎨",
            category_id: "2",
            is_featured: true,
            click_count: 120,
            status: "active" as const,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            created_by: null,
            meta_title: null,
            meta_description: null,
            sort_order: 2,
            categories: {
              id: "2",
              name: "设计工具",
              description: "UI/UX设计工具",
              icon: "🎨",
              color: "#ef4444",
              parent_id: null,
              sort_order: 2,
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            tool_tags: null,
            tags: ["设计", "UI", "UX"],
          },
          {
            id: "3",
            name: "ChatGPT",
            description: "AI助手，帮助编程、写作和解答问题",
            url: "https://chat.openai.com",
            icon: "🤖",
            category_id: "3",
            is_featured: true,
            click_count: 200,
            status: "active" as const,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            created_by: null,
            meta_title: null,
            meta_description: null,
            sort_order: 3,
            categories: {
              id: "3",
              name: "AI工具",
              description: "人工智能相关工具",
              icon: "🤖",
              color: "#10b981",
              parent_id: null,
              sort_order: 3,
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            tool_tags: null,
            tags: ["AI", "聊天", "助手"],
          },
        ];

        // 添加额外的工具数据，并为它们分配正确的分类
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- read-only static data from optional file
        const extendedTools = (additionalTools || []) as any[];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- static additional tools data
        const mappedExtendedTools = extendedTools.map((tool: any) => ({
          ...tool,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          created_by: null,
          meta_title: null,
          meta_description: null,
          categories: getCategoryById(tool.category_id),
          tool_tags: null,
          tags: getTagsForTool(tool.id),
        }));

  tools.value = [...mockTools, ...mappedExtendedTools];
        initialized.value = true;
        return;
      }

      const { data, error: queryError } = await supabase
        .from("tools")
        .select(
          `
          *,
          categories ( * ),
          tool_tags ( tags ( * ) )
        `,
        )
        .eq("status", "active")
        .order("sort_order", { ascending: true });

      if (queryError) {
        throw queryError;
      }

      // Supabase 的类型生成器可能将单关系定义为对象而非数组
      // 处理标签数据，将 tool_tags 转换为简单的 tags 数组
      const processedTools = (data as unknown as Tool[])
        ?.map((tool) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any -- mapping generated rpc result
          const tags = tool.tool_tags?.map((tt: any) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any -- generated relation shape
            return (tt?.tags && (tt.tags as any).name) || "";
          }) || [];

          return {
            ...tool,
            tags,
          };
        }) || [];

      tools.value = processedTools;
      initialized.value = true;
    } catch (err: unknown) {
      const message = safeErrorMessage(err);
      console.error("获取工具列表失败:", message);
      error.value = new Error(message);

      // 如果Supabase调用失败，回退到模拟数据
      if (tools.value.length === 0) {
        console.warn("Supabase调用失败，使用模拟工具数据");
        const fallbackTools = [
          {
            id: "1",
            name: "Visual Studio Code",
            description: "免费的代码编辑器，支持多种编程语言",
            url: "https://code.visualstudio.com",
            icon: "💻",
            category_id: "1",
            is_featured: true,
            click_count: 150,
            status: "active" as const,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            created_by: null,
            meta_title: null,
            meta_description: null,
            sort_order: 1,
            categories: {
              id: "1",
              name: "开发工具",
              description: "编程开发相关工具",
              icon: "💻",
              color: "#3b82f6",
              parent_id: null,
              sort_order: 1,
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            tool_tags: null,
            tags: ["编程", "开发", "编辑器"],
          },
        ];

        // 添加额外的工具数据
        const extendedFallbackTools = additionalTools.map((tool) => ({
          ...tool,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          created_by: null,
          meta_title: null,
          meta_description: null,
          categories: getCategoryById(tool.category_id),
          tool_tags: null,
          tags: getTagsForTool(tool.id),
        }));

        tools.value = [...fallbackTools, ...extendedFallbackTools];
        initialized.value = true;
        error.value = null; // 清除错误，因为我们有了后备数据
      }
    } finally {
      loading.value = false;
    }
  }

  /**
   * 初始化 Store，仅在未初始化时获取数据。
   * 由 ErrorDisplay.vue 和应用主入口调用。
   */
  async function initialize() {
    if (!initialized.value) {
      await fetchTools();
    }
  }

  /**
   * 切换侧边栏的折叠状态。
   * 由 AppHeader.vue 调用。
   */
  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value;
  }

  /**
   * 清除错误状态。
   */
  function clearError() {
    error.value = null;
  }

  /**
   * 设置搜索查询
   */
  function setSearchQuery(query: string) {
    searchQuery.value = query;
  }

  /**
   * 设置选中的分类
   */
  function setSelectedCategory(categoryId: string) {
    selectedCategory.value = categoryId;
  }

  /**
   * 增加工具点击次数
   */
  async function incrementClickCount(toolId: string) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- minimal, narrow escape for generated supabase client typings
      const { error } = await (supabase as any).rpc(
        "increment_click_count",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- the RPC param typing is incompatible with generated types
        { tool_id: toolId } as any,
      );

      if (error) {
        console.error("增加点击次数失败:", error);
        return;
      }

      // 更新本地状态
      const tool = tools.value.find((t) => t.id === toolId);
      if (tool) {
        tool.click_count = (tool.click_count || 0) + 1;
      }
    } catch (error) {
      console.error("增加点击次数失败:", safeErrorMessage(error));
    }
  }

  /**
   * 切换收藏状态
   */
  async function toggleFavorite(toolId: string) {
    try {
      // TODO: 实现收藏功能
      console.log("切换收藏:", toolId);
    } catch (error) {
      console.error("切换收藏失败:", safeErrorMessage(error));
    }
  }

  // --- Return (导出) ---
  // 确保所有外部需要访问的状态、计算属性和方法都在此导出。
  return {
    // State
    tools,
    loading,
    error,
    initialized,
    searchQuery,
    selectedCategory,
    sidebarCollapsed,
    // Getters
    filteredTools,
    // Actions
    fetchTools,
    initialize,
    toggleSidebar,
    clearError,
    setSearchQuery,
    setSelectedCategory,
    incrementClickCount,
    toggleFavorite,
  };
});

// 辅助函数：根据分类ID获取分类信息
function getCategoryById(categoryId: string) {
  const categories: Record<string, unknown> = {
    "550e8400-e29b-41d4-a716-446655440001": {
      id: "550e8400-e29b-41d4-a716-446655440001",
      name: "开发工具",
      description: "编程和开发相关的工具",
      icon: "💻",
      color: "#0078d4",
      parent_id: null,
      sort_order: 1,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    "550e8400-e29b-41d4-a716-446655440002": {
      id: "550e8400-e29b-41d4-a716-446655440002",
      name: "设计工具",
      description: "设计和创意相关的工具",
      icon: "🎨",
      color: "#7b1fa2",
      parent_id: null,
      sort_order: 2,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    "550e8400-e29b-41d4-a716-446655440003": {
      id: "550e8400-e29b-41d4-a716-446655440003",
      name: "办公工具",
      description: "办公和生产力工具",
      icon: "📊",
      color: "#388e3c",
      parent_id: null,
      sort_order: 3,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    "550e8400-e29b-41d4-a716-446655440004": {
      id: "550e8400-e29b-41d4-a716-446655440004",
      name: "学习工具",
      description: "学习和教育相关的工具",
      icon: "📚",
      color: "#f57c00",
      parent_id: null,
      sort_order: 4,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    "550e8400-e29b-41d4-a716-446655440005": {
      id: "550e8400-e29b-41d4-a716-446655440005",
      name: "网络工具",
      description: "网络服务和云平台",
      icon: "🌐",
      color: "#2196f3",
      parent_id: null,
      sort_order: 5,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    "550e8400-e29b-41d4-a716-446655440006": {
      id: "550e8400-e29b-41d4-a716-446655440006",
      name: "娱乐工具",
      description: "娱乐和休闲工具",
      icon: "🎮",
      color: "#e91e63",
      parent_id: null,
      sort_order: 6,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    "550e8400-e29b-41d4-a716-446655440007": {
      id: "550e8400-e29b-41d4-a716-446655440007",
      name: "实用工具",
      description: "日常实用工具",
      icon: "🔧",
      color: "#607d8b",
      parent_id: null,
      sort_order: 7,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  };

  return (
    categories[categoryId] || categories["550e8400-e29b-41d4-a716-446655440007"]
  );
}

// 辅助函数：根据工具ID获取标签
function getTagsForTool(toolId: string): string[] {
  const toolTags: Record<string, string[]> = {
    "850e8400-e29b-41d4-a716-446655440013": ["部署", "静态网站", "前端"],
    "850e8400-e29b-41d4-a716-446655440014": ["部署", "静态网站", "CDN"],
    "850e8400-e29b-41d4-a716-446655440015": ["容器", "DevOps", "部署"],
    "850e8400-e29b-41d4-a716-446655440016": ["问答", "学习", "编程"],
    "850e8400-e29b-41d4-a716-446655440017": ["设计", "UI", "Mac"],
    "850e8400-e29b-41d4-a716-446655440018": ["设计", "UI", "Adobe"],
    "850e8400-e29b-41d4-a716-446655440019": ["团队", "沟通", "协作"],
    "850e8400-e29b-41d4-a716-446655440020": ["视频", "会议", "远程"],
    "850e8400-e29b-41d4-a716-446655440021": ["云存储", "Google", "协作"],
    "850e8400-e29b-41d4-a716-446655440022": ["云存储", "同步", "备份"],
    "850e8400-e29b-41d4-a716-446655440023": ["AI", "助手", "写作"],
    "850e8400-e29b-41d4-a716-446655440024": ["AI", "图像", "生成"],
    "850e8400-e29b-41d4-a716-446655440025": ["AI", "编程", "代码"],
    "850e8400-e29b-41d4-a716-446655440026": ["CDN", "安全", "网络"],
    "850e8400-e29b-41d4-a716-446655440027": ["视频", "娱乐", "分享"],
    "850e8400-e29b-41d4-a716-446655440028": ["短视频", "社交", "娱乐"],
    "850e8400-e29b-41d4-a716-446655440029": ["音乐", "流媒体", "娱乐"],
    "850e8400-e29b-41d4-a716-446655440030": ["翻译", "语言", "工具"],
    "850e8400-e29b-41d4-a716-446655440031": ["密码", "安全", "管理"],
    "850e8400-e29b-41d4-a716-446655440032": ["支付", "金融", "在线"],
  };

  return toolTags[toolId] || ["工具"];
}

// 从 unknown 错误对象安全提取字符串信息
function safeErrorMessage(err: unknown): string {
  if (!err) return "未知错误";
  if (typeof err === "string") return err;
  if (err instanceof Error) return err.message;
  try {
    return JSON.stringify(err as Record<string, unknown>);
  } catch {
    return String(err);
  }
}
