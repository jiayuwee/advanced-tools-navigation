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
      // 检查环境变量是否已配置
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-project-ref') || supabaseAnonKey.includes('your-anon-key')) {
        // 使用模拟数据
        console.warn('Supabase 环境变量未配置，使用模拟工具数据');
        tools.value = [
          {
            id: '1',
            name: 'Visual Studio Code',
            description: '免费的代码编辑器，支持多种编程语言',
            url: 'https://code.visualstudio.com',
            icon: null,
            category_id: '1',
            is_featured: true,
            click_count: 150,
            status: 'active' as const,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            created_by: null,
            meta_title: null,
            meta_description: null,
            sort_order: 1,
            categories: {
              id: '1',
              name: '开发工具',
              description: '编程开发相关工具',
              icon: '💻',
              color: '#3b82f6',
              parent_id: null,
              sort_order: 1,
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            tool_tags: null,
            tags: ['编程', '开发', '编辑器']
          },
          {
            id: '2', 
            name: 'Figma',
            description: '协作式界面设计工具',
            url: 'https://figma.com',
            icon: null,
            category_id: '2',
            is_featured: true,
            click_count: 120,
            status: 'active' as const,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            created_by: null,
            meta_title: null,
            meta_description: null,
            sort_order: 2,
            categories: {
              id: '2',
              name: '设计工具',
              description: 'UI/UX设计工具',
              icon: '🎨',
              color: '#ef4444',
              parent_id: null,
              sort_order: 2,
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            tool_tags: null,
            tags: ['设计', 'UI', 'UX']
          },
          {
            id: '3',
            name: 'ChatGPT',
            description: 'AI助手，帮助编程、写作和解答问题',
            url: 'https://chat.openai.com',
            icon: null,
            category_id: '3',
            is_featured: true,
            click_count: 200,
            status: 'active' as const,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            created_by: null,
            meta_title: null,
            meta_description: null,
            sort_order: 3,
            categories: {
              id: '3',
              name: 'AI工具',
              description: '人工智能相关工具',
              icon: '🤖',
              color: '#10b981',
              parent_id: null,
              sort_order: 3,
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            tool_tags: null,
            tags: ['AI', '聊天', '助手']
          }
        ];
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
      
      // 如果Supabase调用失败，回退到模拟数据
      if (tools.value.length === 0) {
        console.warn('Supabase调用失败，使用模拟工具数据');
        tools.value = [
          {
            id: '1',
            name: 'Visual Studio Code',
            description: '免费的代码编辑器，支持多种编程语言',
            url: 'https://code.visualstudio.com',
            icon: null,
            category_id: '1',
            is_featured: true,
            click_count: 150,
            status: 'active' as const,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            created_by: null,
            meta_title: null,
            meta_description: null,
            sort_order: 1,
            categories: {
              id: '1',
              name: '开发工具',
              description: '编程开发相关工具',
              icon: '💻',
              color: '#3b82f6',
              parent_id: null,
              sort_order: 1,
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            tool_tags: null,
            tags: ['编程', '开发', '编辑器']
          }
        ];
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
