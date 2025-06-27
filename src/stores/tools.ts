import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { ToolsService } from "../services/toolsService";
import { CategoriesService } from "../services/categoriesService";
import type { Tool, Category } from "../types";

export const useToolsStore = defineStore("tools", () => {
  // 状态
  const searchQuery = ref("");
  const selectedCategory = ref("all");
  const showFavoritesOnly = ref(false);
  const sidebarCollapsed = ref(false);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const initialized = ref(false);

  // 数据
  const tools = ref<Tool[]>([
    {
      id: "1",
      name: "Visual Studio Code",
      description: "微软开发的免费代码编辑器，支持多种编程语言和丰富的插件生态",
      url: "https://code.visualstudio.com/",
      icon: "📝",
      category_id: "1",
      tags: ["编辑器", "开发", "免费", "微软"],
      is_featured: true,
      click_count: 1250,
      isFavorite: false,
      status: "active",
      sort_order: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      meta_title: "Visual Studio Code - 强大的代码编辑器",
      meta_description:
        "微软出品的轻量级但功能强大的代码编辑器，支持多种编程语言和丰富的插件生态",
    },
    {
      id: "2",
      name: "GitHub",
      description: "全球最大的代码托管平台，支持Git版本控制和协作开发",
      url: "https://github.com/",
      icon: "🐙",
      category_id: "1",
      tags: ["代码托管", "Git", "协作", "开源"],
      is_featured: true,
      click_count: 2100,
      isFavorite: false,
      status: "active",
      sort_order: 2,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      meta_title: "GitHub - 代码托管平台",
      meta_description: "全球最大的代码托管平台，支持Git版本控制和开源协作",
    },
  ]);

  const categories = ref<Category[]>([
    {
      id: "1",
      name: "开发工具",
      description: "编程开发相关工具",
      icon: "💻",
      color: "#3498db",
      count: 5,
      sort_order: 1,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "2",
      name: "设计工具",
      description: "UI/UX设计工具",
      icon: "🎨",
      color: "#e74c3c",
      count: 3,
      sort_order: 2,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ]);

  // 计算属性
  const filteredTools = computed(() => {
    let result = tools.value;

    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase();
      result = result.filter(
        (tool) =>
          tool.name.toLowerCase().includes(query) ||
          tool.description.toLowerCase().includes(query) ||
          tool.tags.some((tag) => tag.toLowerCase().includes(query)),
      );
    }

    if (selectedCategory.value !== "all") {
      result = result.filter(
        (tool) => tool.category_id === selectedCategory.value,
      );
    }

    if (showFavoritesOnly.value) {
      result = result.filter((tool) => tool.isFavorite);
    }

    return result;
  });

  const favoriteTools = computed(() =>
    tools.value.filter((tool) => tool.isFavorite),
  );
  const popularTools = computed(() =>
    [...tools.value].sort((a, b) => b.click_count - a.click_count).slice(0, 5),
  );
  const featuredTools = computed(() =>
    tools.value.filter((tool) => tool.is_featured),
  );

  // 方法
  const initialize = async () => {
    if (initialized.value) return;

    try {
      loading.value = true;
      error.value = null;

      // 并行加载数据
      await Promise.all([loadTools(), loadCategories()]);

      initialized.value = true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "初始化失败";
      console.error("Error initializing state:", err);
    } finally {
      loading.value = false;
    }
  };

  const loadTools = async () => {
    try {
      const toolsData = await ToolsService.getTools();
      tools.value = (toolsData as any).items
        ? (toolsData as any).items
        : toolsData;
    } catch (err) {
      throw new Error("加载工具失败");
    }
  };

  const loadCategories = async () => {
    try {
      const categoriesData = await CategoriesService.getCategories();
      categories.value = categoriesData;
    } catch (err) {
      throw new Error("加载分类失败");
    }
  };

  const toggleFavorite = async (toolId: string) => {
    const tool = tools.value.find((t) => t.id === toolId);
    if (tool) {
      tool.isFavorite = !tool.isFavorite;
      // TODO: 同步到后端
    }
  };

  const incrementClickCount = async (toolId: string) => {
    const tool = tools.value.find((t) => t.id === toolId);
    if (tool) {
      tool.click_count++;
      // TODO: 同步到后端
    }
  };

  const clearError = () => {
    error.value = null;
  };

  return {
    // 状态
    searchQuery,
    selectedCategory,
    showFavoritesOnly,
    sidebarCollapsed,
    loading,
    error,
    initialized,

    // 数据
    tools,
    categories,
    filteredTools,
    favoriteTools,
    popularTools,
    featuredTools,

    // 方法
    initialize,
    toggleFavorite,
    incrementClickCount,
    clearError,

    // Setter
    setSearchQuery: (query: string) => (searchQuery.value = query),
    setSelectedCategory: (category: string) =>
      (selectedCategory.value = category),
    setSidebarCollapsed: (collapsed: boolean) =>
      (sidebarCollapsed.value = collapsed),
    toggleSidebar: () => (sidebarCollapsed.value = !sidebarCollapsed.value),
  };
});
