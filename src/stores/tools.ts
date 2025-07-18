import { ref, computed } from "vue";
import { defineStore } from "pinia";
import { supabase } from "@/lib/supabaseClient";
import type { Database } from "@/types/database";
type Tables = Database["public"]["Tables"];

// 定义 Tool 类型，并扩展以包含关联的 category 和 tags 数据
// 这使得在组件中直接访问 tool.category.name 和 tool.tags 成为可能
export type Tool = Tables["tools"]["Row"] & {
  categories: Tables["categories"]["Row"] | null;
  tool_tags: Array<{
    tags: Tables["tags"]["Row"];
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
      const processedTools =
        (data as unknown as Tool[])?.map((tool) => ({
          ...tool,
          tags: tool.tool_tags?.map((tt) => tt.tags.name) || [],
        })) || [];

      tools.value = processedTools;
      initialized.value = true;
    } catch (e: any) {
      console.error("获取工具列表失败:", e);
      error.value = e;
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
      const { error } = await supabase.rpc("increment_click_count", {
        tool_id: toolId,
      });

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
      console.error("增加点击次数失败:", error);
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
      console.error("切换收藏失败:", error);
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
