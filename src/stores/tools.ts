import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { ToolsService } from "../services/toolsService";
import { CategoriesService } from "../services/categoriesService";
import type { Tool, Category, SearchFilters, SearchResult } from "../types";

// 导出类型以保持向后兼容
export type { Tool, Category };

export const useToolsStore = defineStore("tools", () => {
  // 状态
  const searchQuery = ref("");
  const selectedCategory = ref("all");
  const showFavoritesOnly = ref(false);
  const sidebarCollapsed = ref(false);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // 数据
  const tools = ref<Tool[]>([]);
  const categories = ref<Category[]>([]);
  const searchResult = ref<SearchResult<Tool> | null>(null);
  const popularTools = ref<Tool[]>([]);
  const featuredTools = ref<Tool[]>([]);

  // 初始化状态
  const initialized = ref(false);

  // 临时示例数据
  const initializeSampleData = () => {
    // 示例分类
    categories.value = [
      {
        id: "1",
        name: "开发工具",
        icon: "💻",
        description: "编程开发相关工具",
        color: "#0078d4",
        count: 3,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "2",
        name: "设计工具",
        icon: "🎨",
        description: "设计和创意工具",
        color: "#e74c3c",
        count: 2,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "3",
        name: "效率工具",
        icon: "⚡",
        description: "提升工作效率的工具",
        color: "#f39c12",
        count: 2,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "4",
        name: "AI工具",
        icon: "🤖",
        description: "人工智能相关工具",
        color: "#9b59b6",
        count: 2,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "5",
        name: "学习资源",
        icon: "📚",
        description: "学习和教育资源",
        color: "#27ae60",
        count: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    // 示例工具
    tools.value = [
      {
        id: "1",
        name: "Visual Studio Code",
        description:
          "微软开发的免费代码编辑器，支持多种编程语言和丰富的插件生态",
        url: "https://code.visualstudio.com/",
        icon: "📝",
        category_id: "1",
        tags: ["编辑器", "开发", "免费", "微软"],
        is_featured: true,
        click_count: 1250,
        isFavorite: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
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
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "3",
        name: "Figma",
        description: "基于浏览器的协作设计工具，支持实时协作和原型设计",
        url: "https://www.figma.com/",
        icon: "🎨",
        category_id: "2",
        tags: ["设计", "协作", "原型", "UI/UX"],
        is_featured: true,
        click_count: 890,
        isFavorite: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "4",
        name: "Notion",
        description: "集笔记、数据库、任务管理于一体的全能工作空间",
        url: "https://www.notion.so/",
        icon: "📝",
        category_id: "3",
        tags: ["笔记", "数据库", "任务管理", "协作"],
        is_featured: true,
        click_count: 1560,
        isFavorite: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "5",
        name: "ChatGPT",
        description: "OpenAI开发的AI聊天机器人，能够进行自然语言对话和内容生成",
        url: "https://chat.openai.com/",
        icon: "🤖",
        category_id: "4",
        tags: ["AI", "聊天", "内容生成", "OpenAI"],
        is_featured: true,
        click_count: 3200,
        isFavorite: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "6",
        name: "MDN Web Docs",
        description: "Mozilla维护的Web开发文档，是学习Web技术的权威资源",
        url: "https://developer.mozilla.org/",
        icon: "📚",
        category_id: "5",
        tags: ["文档", "Web开发", "学习", "Mozilla"],
        is_featured: false,
        click_count: 750,
        isFavorite: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "7",
        name: "Stack Overflow",
        description: "程序员问答社区，解决编程问题的首选平台",
        url: "https://stackoverflow.com/",
        icon: "❓",
        category_id: "5",
        tags: ["问答", "编程", "社区", "解决方案"],
        is_featured: false,
        click_count: 1800,
        isFavorite: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "8",
        name: "Canva",
        description: "在线图形设计平台，提供丰富的模板和设计元素",
        url: "https://www.canva.com/",
        icon: "🖼️",
        category_id: "2",
        tags: ["设计", "模板", "在线", "简单"],
        is_featured: false,
        click_count: 920,
        isFavorite: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "9",
        name: "Trello",
        description: "基于看板的项目管理工具，简单直观的任务管理",
        url: "https://trello.com/",
        icon: "📋",
        category_id: "3",
        tags: ["项目管理", "看板", "任务", "团队"],
        is_featured: false,
        click_count: 680,
        isFavorite: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "10",
        name: "Midjourney",
        description: "AI图像生成工具，通过文本描述生成高质量艺术作品",
        url: "https://www.midjourney.com/",
        icon: "🎭",
        category_id: "4",
        tags: ["AI", "图像生成", "艺术", "创意"],
        is_featured: false,
        click_count: 1100,
        isFavorite: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "11",
        name: "Docker",
        description: "容器化平台，简化应用程序的部署和管理",
        url: "https://www.docker.com/",
        icon: "🐳",
        category_id: "1",
        tags: ["容器", "部署", "DevOps", "云原生"],
        is_featured: false,
        click_count: 850,
        isFavorite: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "12",
        name: "Slack",
        description: "团队协作和沟通平台，提高团队工作效率",
        url: "https://slack.com/",
        icon: "💬",
        category_id: "3",
        tags: ["团队协作", "沟通", "工作流", "集成"],
        is_featured: false,
        click_count: 1320,
        isFavorite: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    // 设置特色工具
    featuredTools.value = tools.value.filter((tool) => tool.is_featured);

    // 设置热门工具（按点击量排序）
    popularTools.value = [...tools.value]
      .sort((a, b) => b.click_count - a.click_count)
      .slice(0, 5);
  };

  // 异步操作方法
  const loadCategories = async () => {
    try {
      loading.value = true;
      error.value = null;
      const categoriesData = await CategoriesService.getCategoriesWithStats();
      categories.value = categoriesData;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "加载分类失败";
      console.error("Error loading categories:", err);
    } finally {
      loading.value = false;
    }
  };

  const loadTools = async (filters?: SearchFilters) => {
    try {
      loading.value = true;
      error.value = null;
      const result = await ToolsService.getTools(filters);

      if (filters) {
        searchResult.value = result;
      } else {
        tools.value = result.items;
        searchResult.value = null;
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : "加载工具失败";
      console.error("Error loading tools:", err);
    } finally {
      loading.value = false;
    }
  };

  const loadPopularTools = async () => {
    try {
      const popular = await ToolsService.getPopularTools(6);
      popularTools.value = popular;
    } catch (err) {
      console.error("Error loading popular tools:", err);
    }
  };

  const loadFeaturedTools = async () => {
    try {
      const featured = await ToolsService.getFeaturedTools(6);
      featuredTools.value = featured;
    } catch (err) {
      console.error("Error loading featured tools:", err);
    }
  };

  const searchTools = async (query: string) => {
    if (!query.trim()) {
      searchResult.value = null;
      return;
    }

    try {
      loading.value = true;
      error.value = null;
      const filters: SearchFilters = {
        query: query.trim(),
        category:
          selectedCategory.value !== "all" ? selectedCategory.value : undefined,
        limit: 20,
      };
      await loadTools(filters);
    } catch (err) {
      error.value = err instanceof Error ? err.message : "搜索失败";
      console.error("Error searching tools:", err);
    } finally {
      loading.value = false;
    }
  };

  const createTool = async (toolData: Partial<Tool>) => {
    try {
      loading.value = true;
      error.value = null;
      const newTool = await ToolsService.createTool(toolData);
      tools.value.unshift(newTool);
      return newTool;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "创建工具失败";
      console.error("Error creating tool:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateTool = async (id: string, toolData: Partial<Tool>) => {
    try {
      loading.value = true;
      error.value = null;
      const updatedTool = await ToolsService.updateTool(id, toolData);
      const index = tools.value.findIndex((t) => t.id === id);
      if (index !== -1) {
        tools.value[index] = updatedTool;
      }
      return updatedTool;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "更新工具失败";
      console.error("Error updating tool:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteTool = async (id: string) => {
    try {
      loading.value = true;
      error.value = null;
      await ToolsService.deleteTool(id);
      tools.value = tools.value.filter((t) => t.id !== id);
    } catch (err) {
      error.value = err instanceof Error ? err.message : "删除工具失败";
      console.error("Error deleting tool:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const incrementClickCount = async (id: string) => {
    try {
      // 暂时只更新本地状态，不调用服务
      // await ToolsService.incrementClickCount(id);
      // 更新本地状态
      const tool = tools.value.find((t) => t.id === id);
      if (tool) {
        // 兼容两种属性名
        if ("click_count" in tool) {
          (tool as any).click_count++;
        } else if ("clickCount" in tool) {
          (tool as any).clickCount++;
        }
      }
    } catch (err) {
      console.error("Error incrementing click count:", err);
    }
  };

  // 计算属性
  const filteredTools = computed(() => {
    // 如果有搜索结果，优先显示搜索结果
    if (searchResult.value) {
      return searchResult.value.items;
    }

    let filtered = tools.value;

    // 分类过滤
    if (selectedCategory.value === "favorites") {
      filtered = filtered.filter((tool) => tool.isFavorite);
    } else if (selectedCategory.value !== "all") {
      filtered = filtered.filter(
        (tool) => tool.category_id === selectedCategory.value
      );
    }

    // 搜索过滤
    if (searchQuery.value.trim()) {
      const query = searchQuery.value.toLowerCase();
      filtered = filtered.filter(
        (tool) =>
          tool.name.toLowerCase().includes(query) ||
          tool.description.toLowerCase().includes(query) ||
          tool.tags.some((tag) =>
            typeof tag === "string"
              ? tag.toLowerCase().includes(query)
              : tag.name?.toLowerCase().includes(query)
          )
      );
    }

    // 收藏过滤
    if (showFavoritesOnly.value && selectedCategory.value !== "favorites") {
      filtered = filtered.filter((tool) => tool.isFavorite);
    }

    return filtered;
  });

  const favoriteTools = computed(() =>
    tools.value.filter((tool) => tool.isFavorite)
  );

  const recentTools = computed(() =>
    [...tools.value]
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      .slice(0, 6)
  );

  const toolsByCategory = computed(() => {
    const grouped = new Map<string, Tool[]>();
    tools.value.forEach((tool) => {
      const categoryId = tool.category_id;
      if (!grouped.has(categoryId)) {
        grouped.set(categoryId, []);
      }
      grouped.get(categoryId)!.push(tool);
    });
    return grouped;
  });

  const totalTools = computed(() => {
    return searchResult.value ? searchResult.value.total : tools.value.length;
  });

  // 同步方法
  const setSearchQuery = (query: string) => {
    searchQuery.value = query;
    // 搜索功能暂时使用本地过滤，不调用API
    // if (query.trim()) {
    //   searchTools(query);
    // } else {
    //   searchResult.value = null;
    // }
  };

  const setSelectedCategory = (categoryId: string) => {
    selectedCategory.value = categoryId;
    // 如果有搜索查询，重新搜索以应用新的分类过滤
    if (searchQuery.value.trim()) {
      searchTools(searchQuery.value);
    }
  };

  const toggleFavorite = async (toolId: string) => {
    const tool = tools.value.find((t) => t.id === toolId);
    if (tool) {
      const newFavoriteStatus = !tool.isFavorite;
      tool.isFavorite = newFavoriteStatus;

      // 显示用户反馈
      console.log(
        `${tool.name} ${newFavoriteStatus ? "已添加到" : "已从"}收藏`
      );

      // TODO: 实现收藏功能的数据库操作
      // await FavoritesService.toggleFavorite(toolId, newFavoriteStatus)
    }
  };

  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value;
  };

  const toggleFavoritesOnly = () => {
    showFavoritesOnly.value = !showFavoritesOnly.value;
  };

  const clearError = () => {
    error.value = null;
  };

  // 初始化方法
  const initialize = async () => {
    if (initialized.value) return;

    try {
      // 暂时使用示例数据，避免数据库连接问题
      initializeSampleData();
      initialized.value = true;

      // 注释掉数据库加载，等数据库配置好后再启用
      // await Promise.all([
      //   loadCategories(),
      //   loadTools(),
      //   loadPopularTools(),
      //   loadFeaturedTools(),
      // ]);
    } catch (err) {
      console.error("Error initializing tools store:", err);
      // 如果出错，仍然使用示例数据
      initializeSampleData();
      initialized.value = true;
    }
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
    searchResult,
    popularTools,
    featuredTools,

    // 计算属性
    filteredTools,
    favoriteTools,
    recentTools,
    toolsByCategory,
    totalTools,

    // 异步方法
    initialize,
    loadCategories,
    loadTools,
    loadPopularTools,
    loadFeaturedTools,
    searchTools,
    createTool,
    updateTool,
    deleteTool,
    incrementClickCount,

    // 同步方法
    setSearchQuery,
    setSelectedCategory,
    toggleFavorite,
    toggleSidebar,
    toggleFavoritesOnly,
    clearError,
  };
});
