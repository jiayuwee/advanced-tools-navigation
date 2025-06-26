import { supabase, TABLES, handleSupabaseError } from '../lib/supabase'
import type { Tool, Category, SearchFilters, SearchResult } from '../types'
import type { Database } from '../types/database'
import {
  requireCategoryId,
  extractCategoryId,
  validateRequiredFields,
} from '../utils/dataTransform'
import { CategoriesService } from './categoriesService'

type ToolRow = Database['public']['Tables']['tools']['Row']
type CategoryRow = Database['public']['Tables']['categories']['Row']

// 工具服务类
export class ToolsService {
  // 获取所有工具
  static async getTools(filters?: SearchFilters): Promise<SearchResult<Tool>> {
    try {
      let query = supabase
        .from(TABLES.TOOLS)
        .select(
          `
          *,
          category:categories(*)
        `
        )
        .eq('status', 'active')

      // 应用搜索过滤器
      if (filters?.query) {
        query = query.or(`name.ilike.%${filters.query}%,description.ilike.%${filters.query}%`)
      }

      if (filters?.category && filters.category !== 'all') {
        query = query.eq('category_id', filters.category)
      }

      // 排序
      const sortBy = filters?.sortBy || 'sort_order'
      const sortOrder = filters?.sortOrder || 'asc'
      query = query.order(sortBy, { ascending: sortOrder === 'asc' })

      // 分页
      const page = filters?.page || 1
      const limit = filters?.limit || 20
      const offset = (page - 1) * limit
      query = query.range(offset, offset + limit - 1)

      const { data, error, count } = await query

      if (error) {
        throw new Error(handleSupabaseError(error))
      }

      // 转换数据格式
      const tools: Tool[] = (data || []).map(this.transformToolRow)

      return {
        items: tools,
        total: count || 0,
        page,
        limit,
        hasMore: (count || 0) > offset + limit,
      }
    } catch (error) {
      console.error('Error fetching tools:', error)
      throw error
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
        `
        )
        .eq('id', id)
        .single()

      if (error) {
        throw new Error(handleSupabaseError(error))
      }

      return this.transformToolRow(data)
    } catch (error) {
      console.error('Error fetching tool:', error)
      throw error
    }
  }

  // 创建工具
  static async createTool(toolData: Partial<Tool> | any): Promise<Tool> {
    try {
      // 验证必需字段
      validateRequiredFields(toolData, ['name', 'description', 'url'], 'Tool')

      // 验证并提取分类 ID
      const categoryId = requireCategoryId(toolData)

      const { data, error } = await supabase
        .from(TABLES.TOOLS)
        .insert({
          name: toolData.name,
          description: toolData.description,
          url: toolData.url,
          category_id: categoryId,
          icon: toolData.icon,
          is_featured: toolData.isFeatured || false,
          status: 'active',
          meta_title: toolData.metaTitle,
          meta_description: toolData.metaDescription,
          sort_order: toolData.sortOrder || 0,
        })
        .select(
          `
          *,
          category:categories(*)
        `
        )
        .single()

      if (error) {
        throw new Error(handleSupabaseError(error))
      }

      return this.transformToolRow(data)
    } catch (error) {
      console.error('Error creating tool:', error)
      throw error
    }
  }

  // 更新工具
  static async updateTool(id: string, toolData: Partial<Tool> | any): Promise<Tool> {
    try {
      const updateData: any = {}

      if (toolData.name) updateData.name = toolData.name
      if (toolData.description) updateData.description = toolData.description
      if (toolData.url) updateData.url = toolData.url

      // 处理分类 ID - 支持多种格式
      const categoryId = extractCategoryId(toolData)
      if (categoryId) {
        updateData.category_id = categoryId
      }

      if (toolData.icon !== undefined) updateData.icon = toolData.icon
      if (toolData.isFeatured !== undefined) updateData.is_featured = toolData.isFeatured
      if (toolData.status) updateData.status = toolData.status
      if (toolData.metaTitle !== undefined) updateData.meta_title = toolData.metaTitle
      if (toolData.metaDescription !== undefined)
        updateData.meta_description = toolData.metaDescription
      if (toolData.sortOrder !== undefined) updateData.sort_order = toolData.sortOrder

      updateData.updated_at = new Date().toISOString()

      const { data, error } = await supabase
        .from(TABLES.TOOLS)
        .update(updateData)
        .eq('id', id)
        .select(
          `
          *,
          category:categories(*)
        `
        )
        .single()

      if (error) {
        throw new Error(handleSupabaseError(error))
      }

      return this.transformToolRow(data)
    } catch (error) {
      console.error('Error updating tool:', error)
      throw error
    }
  }

  // 删除工具
  static async deleteTool(id: string): Promise<void> {
    try {
      const { error } = await supabase.from(TABLES.TOOLS).delete().eq('id', id)

      if (error) {
        throw new Error(handleSupabaseError(error))
      }
    } catch (error) {
      console.error('Error deleting tool:', error)
      throw error
    }
  }

  // 增加点击次数
  static async incrementClickCount(id: string): Promise<void> {
    try {
      // 先获取当前点击次数，然后更新
      const { data: currentTool, error: fetchError } = await supabase
        .from(TABLES.TOOLS)
        .select('click_count')
        .eq('id', id)
        .single()

      if (fetchError) {
        throw new Error(handleSupabaseError(fetchError))
      }

      const { error } = await supabase
        .from(TABLES.TOOLS)
        .update({
          click_count: (currentTool?.click_count || 0) + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)

      if (error) {
        throw new Error(handleSupabaseError(error))
      }
    } catch (error) {
      console.error('Error incrementing click count:', error)
      throw error
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
        `
        )
        .eq('status', 'active')
        .order('click_count', { ascending: false })
        .limit(limit)

      if (error) {
        throw new Error(handleSupabaseError(error))
      }

      return (data || []).map(this.transformToolRow)
    } catch (error) {
      console.error('Error fetching popular tools:', error)
      throw error
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
        `
        )
        .eq('status', 'active')
        .eq('is_featured', true)
        .order('sort_order', { ascending: true })
        .limit(limit)

      if (error) {
        throw new Error(handleSupabaseError(error))
      }

      return (data || []).map(this.transformToolRow)
    } catch (error) {
      console.error('Error fetching featured tools:', error)
      throw error
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
        `
        )
        .eq('status', 'active')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .order('click_count', { ascending: false })
        .limit(limit)

      if (error) {
        throw new Error(handleSupabaseError(error))
      }

      return (data || []).map(this.transformToolRow)
    } catch (error) {
      console.error('Error searching tools:', error)
      throw error
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
      category: row.category
        ? CategoriesService.transformCategoryRow(row.category)
        : {
            id: row.category_id,
            name: '未分类',
            icon: '📁',
            color: '#666666',
            count: 0,
            sortOrder: 0,
            isActive: true,
            createdAt: '',
            updatedAt: '',
          },
      tags: [], // TODO: 实现标签关联
      isFavorite: false, // TODO: 根据用户状态设置
      clickCount: row.click_count,
      isFeature: row.is_featured,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      createdBy: row.created_by,
      metaTitle: row.meta_title,
      metaDescription: row.meta_description,
      sortOrder: row.sort_order,
    }
  }

  // 转换分类数据库行为业务对象
  private static transformCategoryRow(row: CategoryRow): Category {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      icon: row.icon,
      color: row.color,
      parentId: row.parent_id,
      count: 0, // TODO: 计算工具数量
      sortOrder: row.sort_order,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }
  }
}
