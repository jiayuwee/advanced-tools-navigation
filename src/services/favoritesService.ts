import { supabase } from '../lib/supabase'
import type { Favorite, Tool, Product } from '../types'
import type { Database } from '../types/database'

type FavoriteRow = Database['public']['Tables']['favorites']['Row']
type FavoriteInsert = Database['public']['Tables']['favorites']['Insert']

export class FavoritesService {
  // 获取用户收藏的工具
  static async getFavoriteTools(userId: string): Promise<Tool[]> {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          *,
          tool:tools(
            *,
            category:categories(*)
          )
        `)
        .eq('user_id', userId)
        .not('tool_id', 'is', null)
        .order('created_at', { ascending: false })

      if (error) throw error

      return data?.map(item => ({
        ...item.tool,
        isFavorite: true,
        category: {
          id: item.tool.category.id,
          name: item.tool.category.name,
          description: item.tool.category.description,
          icon: item.tool.category.icon,
          color: item.tool.category.color,
          parentId: item.tool.category.parent_id,
          count: 0,
          sortOrder: item.tool.category.sort_order,
          isActive: item.tool.category.is_active,
          createdAt: item.tool.category.created_at,
          updatedAt: item.tool.category.updated_at
        },
        tags: [], // TODO: 实现标签关联
        clickCount: item.tool.click_count,
        isFeature: item.tool.is_featured,
        status: item.tool.status,
        createdAt: item.tool.created_at,
        updatedAt: item.tool.updated_at,
        createdBy: item.tool.created_by,
        metaTitle: item.tool.meta_title,
        metaDescription: item.tool.meta_description,
        sortOrder: item.tool.sort_order
      })) || []
    } catch (error) {
      console.error('获取收藏工具失败:', error)
      throw new Error('获取收藏工具失败')
    }
  }

  // 获取用户收藏的产品
  static async getFavoriteProducts(userId: string): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          *,
          product:products(
            *,
            category:product_categories(*)
          )
        `)
        .eq('user_id', userId)
        .not('product_id', 'is', null)
        .order('created_at', { ascending: false })

      if (error) throw error

      return data?.map(item => ({
        id: item.product.id,
        name: item.product.name,
        description: item.product.description,
        shortDescription: item.product.short_description,
        price: item.product.price,
        originalPrice: item.product.original_price,
        currency: item.product.currency,
        category: {
          id: item.product.category.id,
          name: item.product.category.name,
          description: item.product.category.description,
          icon: item.product.category.icon,
          color: item.product.category.color,
          parentId: item.product.category.parent_id,
          count: 0,
          sortOrder: item.product.category.sort_order,
          isActive: item.product.category.is_active,
          createdAt: item.product.category.created_at,
          updatedAt: item.product.category.updated_at
        },
        images: item.product.images || [],
        features: item.product.features || [],
        demoUrl: item.product.demo_url,
        downloadUrl: item.product.download_url,
        isFeatured: item.product.is_featured,
        isDigital: item.product.is_digital,
        stockQuantity: item.product.stock_quantity,
        status: item.product.status,
        createdAt: item.product.created_at,
        updatedAt: item.product.updated_at,
        createdBy: item.product.created_by,
        metaTitle: item.product.meta_title,
        metaDescription: item.product.meta_description,
        sortOrder: item.product.sort_order
      })) || []
    } catch (error) {
      console.error('获取收藏产品失败:', error)
      throw new Error('获取收藏产品失败')
    }
  }

  // 添加工具到收藏
  static async addToolToFavorites(userId: string, toolId: string): Promise<Favorite> {
    try {
      // 检查是否已收藏
      const existing = await this.checkFavoriteExists(userId, toolId, 'tool')
      if (existing) {
        throw new Error('已经收藏过此工具')
      }

      const favoriteData: FavoriteInsert = {
        user_id: userId,
        tool_id: toolId
      }

      const { data, error } = await supabase
        .from('favorites')
        .insert(favoriteData)
        .select('*')
        .single()

      if (error) throw error
      if (!data) throw new Error('添加收藏失败')

      return this.transformFavorite(data)
    } catch (error) {
      console.error('添加工具收藏失败:', error)
      throw new Error('添加工具收藏失败')
    }
  }

  // 添加产品到收藏
  static async addProductToFavorites(userId: string, productId: string): Promise<Favorite> {
    try {
      // 检查是否已收藏
      const existing = await this.checkFavoriteExists(userId, productId, 'product')
      if (existing) {
        throw new Error('已经收藏过此产品')
      }

      const favoriteData: FavoriteInsert = {
        user_id: userId,
        product_id: productId
      }

      const { data, error } = await supabase
        .from('favorites')
        .insert(favoriteData)
        .select('*')
        .single()

      if (error) throw error
      if (!data) throw new Error('添加收藏失败')

      return this.transformFavorite(data)
    } catch (error) {
      console.error('添加产品收藏失败:', error)
      throw new Error('添加产品收藏失败')
    }
  }

  // 从收藏中移除工具
  static async removeToolFromFavorites(userId: string, toolId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('tool_id', toolId)

      if (error) throw error
    } catch (error) {
      console.error('移除工具收藏失败:', error)
      throw new Error('移除工具收藏失败')
    }
  }

  // 从收藏中移除产品
  static async removeProductFromFavorites(userId: string, productId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', productId)

      if (error) throw error
    } catch (error) {
      console.error('移除产品收藏失败:', error)
      throw new Error('移除产品收藏失败')
    }
  }

  // 检查是否已收藏
  static async checkFavoriteExists(userId: string, itemId: string, type: 'tool' | 'product'): Promise<boolean> {
    try {
      let query = supabase
        .from('favorites')
        .select('id')
        .eq('user_id', userId)

      if (type === 'tool') {
        query = query.eq('tool_id', itemId)
      } else {
        query = query.eq('product_id', itemId)
      }

      const { data, error } = await query

      if (error) throw error

      return !!(data && data.length > 0)
    } catch (error) {
      console.error('检查收藏状态失败:', error)
      return false
    }
  }

  // 获取用户收藏统计
  static async getFavoriteStats(userId: string): Promise<{
    totalFavorites: number
    toolsCount: number
    productsCount: number
  }> {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('tool_id, product_id')
        .eq('user_id', userId)

      if (error) throw error

      const favorites = data || []
      const toolsCount = favorites.filter(f => f.tool_id).length
      const productsCount = favorites.filter(f => f.product_id).length

      return {
        totalFavorites: favorites.length,
        toolsCount,
        productsCount
      }
    } catch (error) {
      console.error('获取收藏统计失败:', error)
      return {
        totalFavorites: 0,
        toolsCount: 0,
        productsCount: 0
      }
    }
  }

  // 清空用户所有收藏
  static async clearAllFavorites(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)

      if (error) throw error
    } catch (error) {
      console.error('清空收藏失败:', error)
      throw new Error('清空收藏失败')
    }
  }

  // 批量添加收藏
  static async addBatchFavorites(userId: string, items: Array<{ id: string; type: 'tool' | 'product' }>): Promise<void> {
    try {
      const favoriteData: FavoriteInsert[] = items.map(item => ({
        user_id: userId,
        tool_id: item.type === 'tool' ? item.id : null,
        product_id: item.type === 'product' ? item.id : null
      }))

      const { error } = await supabase
        .from('favorites')
        .insert(favoriteData)

      if (error) throw error
    } catch (error) {
      console.error('批量添加收藏失败:', error)
      throw new Error('批量添加收藏失败')
    }
  }

  // 转换数据库行为业务对象
  private static transformFavorite(row: FavoriteRow): Favorite {
    return {
      id: row.id,
      userId: row.user_id,
      toolId: row.tool_id,
      productId: row.product_id,
      createdAt: row.created_at
    }
  }
}
