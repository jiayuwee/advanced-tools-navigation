import { supabase, TABLES, handleSupabaseError } from "../lib/supabaseClient";
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

/**
 * 工具服务类
 * 提供工具数据的CRUD操作和搜索功能
 */
export class ToolsService {
  /**
   * 获取所有工具
   * @param {SearchFilters} [filters] - 搜索过滤器
   * @returns {Promise<SearchResult<Tool>>} 搜索结果
   */
  static async getTools(filters?: SearchFilters): Promise<SearchResult<Tool>> {
    try {
      let query = supabase
        .from(TABLES.TOOLS)
        .select(
          `
          *,
          category:categories(*)
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
      console.error("Error fetching tools:", error);
      throw error;
    }
  }

  // 获取单个工具
  static async getTool(id: string): Promise<Tool> {
    try {
      const { data, error } = await supabase
        .from(TABLES.TOOLS)
        .select(
          `
          *,
          category:categories(*)
        `,
        )
        .eq("id", id)
        .single();

      if (error) {
        throw new Error(handleSupabaseError(error));
      }

      return this.transformToolRow(data);
    } catch (error) {
      console.error("Error fetching tool:", error);
      throw error;
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
          category:categories(*)
        `,
        )
        .single();

      if (error) {
        throw new Error(handleSupabaseError(error));
      }

      return this.transformToolRow(data);
    } catch (error) {
      console.error("Error creating tool:", error);
      throw error;
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
          category:categories(*)
        `,
        )
        .single();

      if (error) {
        throw new Error(handleSupabaseError(error));
      }

      return this.transformToolRow(data);
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
    } catch (error) {
      console.error("Error updating favorite status:", error);
      throw error;
    }
  }

  // 获取热门工具
  static async getPopularTools(limit = 10): Promise<Tool[]> {
    try {
      const { data, error } = await supabase
        .from(TABLES.TOOLS)
        .select(
          `
          *,
          category:categories(*)
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

  // 获取推荐工具
  static async getFeaturedTools(limit = 6): Promise<Tool[]> {
    try {
      const { data, error } = await supabase
        .from(TABLES.TOOLS)
        .select(
          `
          *,
          category:categories(*)
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
          category:categories(*)
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

  // 转换数据库行为业务对象
  private static transformToolRow(row: any): Tool {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      url: row.url,
      icon: row.icon,
      category_id: row.category_id,
      tags: [], // TODO: 实现标签关联
      is_favorite: row.is_favorite,
      click_count: row.click_count,
      is_featured: row.is_featured,
      status: row.status,
      created_at: row.created_at,
      updated_at: row.updated_at,
      created_by: row.created_by,
      meta_title: row.meta_title,
      meta_description: row.meta_description,
      sort_order: row.sort_order,
    };
  }

  // 转换分类数据库行为业务对象 (被CategoriesService调用)
  // 已移除未使用的 transformCategoryRow
}
