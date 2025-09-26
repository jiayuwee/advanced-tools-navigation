import { supabase, TABLES, handleSupabaseError } from "../lib/supabaseClient";
import { ErrorHandler } from "../utils/errorHandler";
import { apiCache, withCache } from "../utils/cacheManager";
import type { Tool, SearchFilters, SearchResult } from "../types";
import {
  requireCategoryId,
  extractCategoryId,
  validateRequiredFields,
} from "../utils/dataTransform";

// 状态常量
const TOOL_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
};

// 工具输入类型（用于创建和更新），使用蛇形命名以匹配数据库字段
interface ToolInput {
  name: string;
  description: string;
  url: string;
  category_id: string;
  icon?: string;
  is_featured?: boolean;
  status?: string;
  meta_title?: string;
  meta_description?: string;
  sort_order?: number;
  updated_at?: string; // 添加更新字段
}

// 数据库工具原始行类型（匹配 select *, categories(*)）
interface ToolRow {
  id: string;
  name: string;
  description: string;
  url: string;
  icon: string | null;
  category_id: string;
  categories?: {
    id: string;
    name: string;
    description?: string | null;
    icon?: string | null;
    color?: string | null;
    parent_id?: string | null;
    sort_order?: number | null;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
  };
  is_favorite?: boolean;
  click_count?: number;
  is_featured?: boolean;
  status: string;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  sort_order?: number | null;
}

/**
 * 工具服务类
 * 提供工具数据的CRUD操作和搜索功能
 */
export class ToolsService {
  /**
   * 获取所有工具（优化版本，带缓存）
   * @param {SearchFilters} [filters] - 搜索过滤器
   * @returns {Promise<SearchResult<Tool>>} 搜索结果
   */
  static async getTools(filters?: SearchFilters): Promise<SearchResult<Tool>> {
    // 生成缓存键
    const cacheKey = `tools_${JSON.stringify(filters || {})}`;

    // 使用缓存装饰器
    return withCache(
      this._getToolsFromAPI.bind(this),
      () => cacheKey,
      apiCache,
      2 * 60 * 1000, // 2分钟缓存
    )(filters);
  }

  // 内部方法，不使用缓存
  private static async _getToolsFromAPI(
    filters?: SearchFilters,
  ): Promise<SearchResult<Tool>> {
    try {
      let query = supabase
        .from(TABLES.TOOLS)
        .select(
          `
          *,
          categories(*)
        `,
        )
        .eq("status", TOOL_STATUS.ACTIVE);

      // 应用搜索过滤器
      if (filters?.query) {
        query = query.or(
          `name.ilike.%${filters.query}%,description.ilike.%${filters.query}%`,
        );
      }

      if (filters?.category && filters.category !== "all") {
        query = query.eq("category_id", filters.category);
      }

      // 排序
      const sortBy = filters?.sortBy || "sort_order";
      const sortOrder = filters?.sortOrder || "asc";
      query = query.order(sortBy, { ascending: sortOrder === "asc" });

      // 分页
      const page = filters?.page || 1;
      const limit = filters?.limit || 20;
      const offset = (page - 1) * limit;
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        throw new Error(handleSupabaseError(error));
      }

      // 转换数据格式
      const tools: Tool[] = (data || []).map(this.transformToolRow);

      return {
        items: tools,
        total: count || 0,
        page,
        limit,
        hasMore: (count || 0) > offset + limit,
      };
    } catch (error) {
      console.error("获取工具列表失败:", error);
      console.log("Supabase调用失败，使用模拟工具数据");

      // 返回模拟数据作为回退
      return this.getMockTools(filters);
    }
  }

  // 获取单个工具（优化版本，带缓存）
  static async getTool(id: string): Promise<Tool> {
    const cacheKey = `tool_${id}`;

    return withCache(
      this._getToolFromAPI.bind(this),
      () => cacheKey,
      apiCache,
      5 * 60 * 1000, // 5分钟缓存
    )(id);
  }

  // 内部方法
  private static async _getToolFromAPI(id: string): Promise<Tool> {
    try {
      const { data, error } = await supabase
        .from(TABLES.TOOLS)
        .select(
          `
          *,
          categories(*)
        `,
        )
        .eq("id", id)
        .single();

      if (error) {
        throw new Error(handleSupabaseError(error));
      }

      return this.transformToolRow(data);
    } catch (error) {
      const appError = ErrorHandler.handleApiError(error);
      ErrorHandler.logError(appError, "ToolsService.getTool");
      throw appError;
    }
  }

  /**
   * 创建新工具
   * @param {ToolInput} toolData - 工具数据
   * @returns {Promise<Tool>} 新创建的工具
   */
  static async createTool(toolData: ToolInput): Promise<Tool> {
    try {
      // 验证必需字段
      validateRequiredFields(toolData, ["name", "description", "url"], "Tool");

      // 验证并提取分类 ID
      const categoryId = requireCategoryId(toolData);

      const { data, error } = await supabase
        .from(TABLES.TOOLS)
        .insert({
          name: toolData.name,
          description: toolData.description,
          url: toolData.url,
          category_id: categoryId,
          icon: toolData.icon,
          is_featured: toolData.is_featured || false,
          status: TOOL_STATUS.ACTIVE,
          meta_title: toolData.meta_title,
          meta_description: toolData.meta_description,
          sort_order: toolData.sort_order || 0,
        })
        .select(
          `
          *,
          categories(*)
        `,
        )
        .single();

      if (error) {
        throw new Error(handleSupabaseError(error));
      }

      const tool = this.transformToolRow(data);

      // 清理相关缓存
      this.clearRelatedCache();

      return tool;
    } catch (error) {
      const appError = ErrorHandler.handleApiError(error);
      ErrorHandler.logError(appError, "ToolsService.createTool");
      throw appError;
    }
  }

  /**
   * 更新工具
   * @param {string} id - 工具ID
   * @param {Partial<ToolInput>} toolData - 要更新的工具数据
   * @returns {Promise<Tool>} 更新后的工具
   */
  static async updateTool(
    id: string,
    toolData: Partial<ToolInput>,
  ): Promise<Tool> {
    try {
      const updateData: Partial<ToolInput> = {};

      if (toolData.name) updateData.name = toolData.name;
      if (toolData.description) updateData.description = toolData.description;
      if (toolData.url) updateData.url = toolData.url;

      // 处理分类 ID - 支持多种格式
      const categoryId = extractCategoryId(toolData);
      if (categoryId) {
        updateData.category_id = categoryId;
      }

      if (toolData.icon !== undefined) updateData.icon = toolData.icon;
      if (toolData.is_featured !== undefined)
        updateData.is_featured = toolData.is_featured;
      if (toolData.status) updateData.status = toolData.status;
      if (toolData.meta_title !== undefined)
        updateData.meta_title = toolData.meta_title;
      if (toolData.meta_description !== undefined)
        updateData.meta_description = toolData.meta_description;
      if (toolData.sort_order !== undefined)
        updateData.sort_order = toolData.sort_order;

      updateData.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from(TABLES.TOOLS)
        .update(updateData)
        .eq("id", id)
        .select(
          `
          *,
          categories(*)
        `,
        )
        .single();

      if (error) {
        throw new Error(handleSupabaseError(error));
      }

      const tool = this.transformToolRow(data);

      // 清理相关缓存
      this.clearRelatedCache(id);

      return tool;
    } catch (error) {
      console.error("Error updating tool:", error);
      throw error;
    }
  }

  // 删除工具
  static async deleteTool(id: string): Promise<void> {
    try {
      const { error } = await supabase.from(TABLES.TOOLS).delete().eq("id", id);

      if (error) {
        throw new Error(handleSupabaseError(error));
      }

      // 清理相关缓存
      this.clearRelatedCache(id);
    } catch (error) {
      console.error("Error deleting tool:", error);
      throw error;
    }
  }

  // 增加点击次数（原子操作）
  static async incrementClickCount(id: string): Promise<void> {
    try {
      const { error } = await supabase.rpc("increment_click_count", {
        tool_id: id,
      });

      if (error) {
        throw new Error(handleSupabaseError(error));
      }

      // 清理相关缓存
      this.clearRelatedCache(id);
    } catch (error) {
      console.error("Error incrementing click count:", error);
      throw error;
    }
  }

  // 更新收藏状态
  static async updateFavoriteStatus(
    id: string,
    isFavorite: boolean,
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from(TABLES.TOOLS)
        .update({
          is_favorite: isFavorite,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) {
        throw new Error(handleSupabaseError(error));
      }

      // 清理相关缓存
      this.clearRelatedCache(id);
    } catch (error) {
      console.error("Error updating favorite status:", error);
      throw error;
    }
  }

  // 获取热门工具（优化版本，带缓存）
  static async getPopularTools(limit = 10): Promise<Tool[]> {
    const cacheKey = `popular_tools_${limit}`;

    return withCache(
      this._getPopularToolsFromAPI.bind(this),
      () => cacheKey,
      apiCache,
      5 * 60 * 1000, // 5分钟缓存
    )(limit);
  }

  // 内部方法
  private static async _getPopularToolsFromAPI(limit = 10): Promise<Tool[]> {
    try {
      const { data, error } = await supabase
        .from(TABLES.TOOLS)
        .select(
          `
          *,
          categories(*)
        `,
        )
        .eq("status", TOOL_STATUS.ACTIVE)
        .order("click_count", { ascending: false })
        .limit(limit);

      if (error) {
        throw new Error(handleSupabaseError(error));
      }

      return (data || []).map(this.transformToolRow);
    } catch (error) {
      console.error("Error fetching popular tools:", error);
      throw error;
    }
  }

  // 获取推荐工具（优化版本，带缓存）
  static async getFeaturedTools(limit = 6): Promise<Tool[]> {
    const cacheKey = `featured_tools_${limit}`;

    return withCache(
      this._getFeaturedToolsFromAPI.bind(this),
      () => cacheKey,
      apiCache,
      10 * 60 * 1000, // 10分钟缓存（推荐工具变化较少）
    )(limit);
  }

  // 内部方法
  private static async _getFeaturedToolsFromAPI(limit = 6): Promise<Tool[]> {
    try {
      const { data, error } = await supabase
        .from(TABLES.TOOLS)
        .select(
          `
          *,
          categories(*)
        `,
        )
        .eq("status", TOOL_STATUS.ACTIVE)
        .eq("is_featured", true)
        .order("sort_order", { ascending: true })
        .limit(limit);

      if (error) {
        throw new Error(handleSupabaseError(error));
      }

      return (data || []).map(this.transformToolRow);
    } catch (error) {
      console.error("Error fetching featured tools:", error);
      throw error;
    }
  }

  // 搜索工具
  static async searchTools(query: string, limit = 20): Promise<Tool[]> {
    try {
      const { data, error } = await supabase
        .from(TABLES.TOOLS)
        .select(
          `
          *,
          categories(*)
        `,
        )
        .eq("status", TOOL_STATUS.ACTIVE)
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .order("click_count", { ascending: false })
        .limit(limit);

      if (error) {
        throw new Error(handleSupabaseError(error));
      }

      return (data || []).map(this.transformToolRow);
    } catch (error) {
      console.error("Error searching tools:", error);
      throw error;
    }
  }

  // 在更新、创建、删除操作后清理相关缓存
  private static clearRelatedCache(toolId?: string): void {
    // 清理列表缓存
    apiCache.clear(); // 简单粗暴的方式，实际中可以更精细化

    // 如果有具体的 toolId，清理该工具的缓存
    if (toolId) {
      apiCache.delete(`tool_${toolId}`);
    }
  }

  // 转换数据库行为业务对象
  private static transformToolRow(row: ToolRow): Tool {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      url: row.url,
      icon: row.icon,
      category_id: row.category_id,
      category: row.categories
        ? {
            id: row.categories.id,
            name: row.categories.name,
            description: row.categories.description || "",
            icon: row.categories.icon || undefined,
            color: row.categories.color || undefined,
            parent_id: row.categories.parent_id || undefined,
            count: 0, // 未在此查询中返回，默认0
            sort_order: row.categories.sort_order || 0,
            is_active: row.categories.is_active ?? true,
            created_at: row.categories.created_at || new Date().toISOString(),
            updated_at: row.categories.updated_at || new Date().toISOString(),
          }
        : undefined, // 添加分类信息
      tags: [], // TODO: 实现标签关联
      is_favorite: row.is_favorite,
      click_count: row.click_count,
      is_featured: row.is_featured,
  status: (row.status as Tool["status"]) || "active",
      created_at: row.created_at,
      updated_at: row.updated_at,
      created_by: row.created_by,
      meta_title: row.meta_title,
      meta_description: row.meta_description,
      sort_order: row.sort_order,
    };
  }

  // 获取模拟工具数据（回退方案）
  private static getMockTools(filters?: SearchFilters): SearchResult<Tool> {
    const mockTools: Tool[] = [
      {
        id: "mock-1",
        name: "Vue.js",
        description: "渐进式JavaScript框架，用于构建用户界面",
        url: "https://vuejs.org",
        icon: "https://vuejs.org/logo.svg",
        category_id: "mock-cat-1",
        category: {
          id: "mock-cat-1",
          name: "开发工具",
          description: "编程开发相关工具",
          icon: "code",
          color: "#0078d4",
          parent_id: undefined,
          count: 5,
          sort_order: 1,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        tags: ["前端", "框架", "JavaScript"],
        is_favorite: false,
        click_count: 0,
        is_featured: true,
        status: "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: "system",
        meta_title: "Vue.js - 渐进式JavaScript框架",
        meta_description: "Vue.js是一个用于构建用户界面的渐进式框架",
        sort_order: 1,
      },
      {
        id: "mock-2",
        name: "Figma",
        description: "协作界面设计工具，让团队更好地协作",
        url: "https://figma.com",
        icon: "https://figma.com/favicon.ico",
        category_id: "mock-cat-2",
        category: {
          id: "mock-cat-2",
          name: "设计工具",
          description: "UI/UX设计相关工具",
          icon: "palette",
          color: "#ff6b6b",
          parent_id: undefined,
          count: 3,
          sort_order: 2,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        tags: ["设计", "UI", "协作"],
        is_favorite: false,
        click_count: 0,
        is_featured: true,
        status: "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: "system",
        meta_title: "Figma - 协作界面设计工具",
        meta_description: "Figma是一个基于浏览器的协作界面设计工具",
        sort_order: 1,
      },
      {
        id: "mock-3",
        name: "ChatGPT",
        description: "AI对话助手，帮助解答问题和提供创意",
        url: "https://chat.openai.com",
        icon: "https://openai.com/favicon.ico",
        category_id: "mock-cat-3",
        category: {
          id: "mock-cat-3",
          name: "AI工具",
          description: "人工智能相关工具",
          icon: "brain",
          color: "#4ecdc4",
          parent_id: undefined,
          count: 8,
          sort_order: 3,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        tags: ["AI", "对话", "助手"],
        is_favorite: false,
        click_count: 0,
        is_featured: true,
        status: "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: "system",
        meta_title: "ChatGPT - AI对话助手",
        meta_description: "ChatGPT是OpenAI开发的AI对话助手",
        sort_order: 1,
      },
      {
        id: "mock-4",
        name: "Notion",
        description: "全能工作空间，整合笔记、任务和数据库",
        url: "https://notion.so",
        icon: "https://notion.so/favicon.ico",
        category_id: "mock-cat-4",
        category: {
          id: "mock-cat-4",
          name: "效率工具",
          description: "提升工作效率的工具",
          icon: "zap",
          color: "#45b7d1",
          parent_id: undefined,
          count: 6,
          sort_order: 4,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        tags: ["效率", "笔记", "协作"],
        is_favorite: false,
        click_count: 0,
        is_featured: true,
        status: "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: "system",
        meta_title: "Notion - 全能工作空间",
        meta_description:
          "Notion是一个集成了笔记、任务管理和数据库的全能工作空间",
        sort_order: 1,
      },
      {
        id: "mock-5",
        name: "VS Code",
        description: "轻量但强大的源代码编辑器，支持丰富插件生态",
        url: "https://code.visualstudio.com",
        icon: "https://code.visualstudio.com/favicon.ico",
        category_id: "mock-cat-1",
        category: {
          id: "mock-cat-1",
          name: "开发工具",
          description: "编程开发相关工具",
          icon: "code",
          color: "#0078d4",
          parent_id: undefined,
          count: 5,
          sort_order: 1,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        tags: ["IDE", "编辑器", "开发"],
        is_favorite: false,
        click_count: 0,
        is_featured: false,
        status: "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: "system",
        meta_title: "VS Code - 源代码编辑器",
        meta_description: "VS Code 是一个跨平台的现代源码编辑器",
        sort_order: 2,
      },
      {
        id: "mock-6",
        name: "GitHub Copilot",
        description: "AI 编程助手，自动补全代码与函数",
        url: "https://github.com/features/copilot",
        icon: "https://github.githubassets.com/favicons/favicon.svg",
        category_id: "mock-cat-3",
        category: {
          id: "mock-cat-3",
          name: "AI工具",
          description: "人工智能相关工具",
          icon: "brain",
          color: "#4ecdc4",
          parent_id: undefined,
          count: 8,
          sort_order: 3,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        tags: ["AI", "代码生成", "助手"],
        is_favorite: false,
        click_count: 0,
        is_featured: true,
        status: "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: "system",
        meta_title: "GitHub Copilot - AI 编程助手",
        meta_description: "GitHub Copilot 使用 AI 帮助编写代码",
        sort_order: 2,
      },
      {
        id: "mock-7",
        name: "Postman",
        description: "API 开发与调试协作平台",
        url: "https://www.postman.com",
        icon: "https://www.postman.com/favicon.ico",
        category_id: "mock-cat-1",
        category: {
          id: "mock-cat-1",
          name: "开发工具",
          description: "编程开发相关工具",
          icon: "code",
          color: "#0078d4",
          parent_id: undefined,
          count: 5,
          sort_order: 1,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        tags: ["API", "调试", "测试"],
        is_favorite: false,
        click_count: 0,
        is_featured: false,
        status: "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: "system",
        meta_title: "Postman - API 开发平台",
        meta_description: "Postman 提供 API 设计、调试、测试工具",
        sort_order: 3,
      },
      {
        id: "mock-8",
        name: "Canva",
        description: "在线平面设计工具，快速创建视觉内容",
        url: "https://www.canva.com",
        icon: "https://www.canva.com/favicon.ico",
        category_id: "mock-cat-2",
        category: {
          id: "mock-cat-2",
          name: "设计工具",
          description: "UI/UX设计相关工具",
          icon: "palette",
          color: "#ff6b6b",
          parent_id: undefined,
          count: 3,
          sort_order: 2,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        tags: ["设计", "图形", "创意"],
        is_favorite: false,
        click_count: 0,
        is_featured: false,
        status: "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: "system",
        meta_title: "Canva - 在线平面设计工具",
        meta_description: "Canva 让每个人都能创建设计",
        sort_order: 2,
      },
      {
        id: "mock-9",
        name: "Slack",
        description: "团队沟通与协作平台，支持频道与集成",
        url: "https://slack.com",
        icon: "https://slack.com/favicon.ico",
        category_id: "mock-cat-4",
        category: {
          id: "mock-cat-4",
          name: "效率工具",
          description: "提升工作效率的工具",
          icon: "zap",
          color: "#45b7d1",
          parent_id: undefined,
          count: 6,
          sort_order: 4,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        tags: ["沟通", "协作", "团队"],
        is_favorite: false,
        click_count: 0,
        is_featured: false,
        status: "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: "system",
        meta_title: "Slack - 团队协作平台",
        meta_description: "Slack 提供高效的团队沟通方式",
        sort_order: 2,
      },
      {
        id: "mock-10",
        name: "Linear",
        description: "现代化项目与任务管理平台，适合产品与工程团队",
        url: "https://linear.app",
        icon: "https://linear.app/favicon.ico",
        category_id: "mock-cat-4",
        category: {
          id: "mock-cat-4",
          name: "效率工具",
          description: "提升工作效率的工具",
          icon: "zap",
          color: "#45b7d1",
          parent_id: undefined,
          count: 6,
          sort_order: 4,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        tags: ["项目管理", "任务", "协作"],
        is_favorite: false,
        click_count: 0,
        is_featured: true,
        status: "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: "system",
        meta_title: "Linear - 现代项目管理",
        meta_description: "Linear 提供快速流畅的项目管理体验",
        sort_order: 3,
      },
    ];

    // 应用搜索过滤器
    let filteredTools = mockTools;

    if (filters?.query) {
      const query = filters.query.toLowerCase();
      filteredTools = mockTools.filter(
        (tool) =>
          tool.name.toLowerCase().includes(query) ||
          tool.description.toLowerCase().includes(query),
      );
    }

    if (filters?.category && filters.category !== "all") {
      filteredTools = filteredTools.filter(
        (tool) => tool.category_id === filters.category,
      );
    }

    // 应用分页
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const offset = (page - 1) * limit;
    const paginatedTools = filteredTools.slice(offset, offset + limit);

    return {
      items: paginatedTools,
      total: filteredTools.length,
      page,
      limit,
      hasMore: offset + limit < filteredTools.length,
    };
  }

  // 转换分类数据库行为业务对象 (被CategoriesService调用)
  // 已移除未使用的 transformCategoryRow
}
