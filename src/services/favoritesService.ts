import { supabase } from "../lib/supabase";
import type { Favorite, Tool, Product } from "../types";
import type { Database } from "../types/database";

type FavoriteInsert = Database["public"]["Tables"]["favorites"]["Insert"];

export class FavoritesService {
  // 获取用户收藏的工具
  static async getFavoriteTools(userId: string): Promise<Tool[]> {
    try {
      // 首先获取收藏记录
      const { data: favorites, error: favoritesError } = await supabase
        .from("favorites")
        .select("tool_id")
        .eq("user_id", userId)
        .not("tool_id", "is", null)
        .order("created_at", { ascending: false });

      if (favoritesError) throw favoritesError;
      if (!favorites || favorites.length === 0) return [];

      // 获取工具详情
      const toolIds = favorites
        .map((f) => f.tool_id)
        .filter(Boolean) as string[];
      const { data: tools, error: toolsError } = await supabase
        .from("tools")
        .select(
          `
          *,
          category:categories(*)
        `,
        )
        .in("id", toolIds)
        .eq("status", "active");

      if (toolsError) throw toolsError;

      return (tools || []).map((tool) => ({
        id: tool.id,
        name: tool.name,
        description: tool.description,
        url: tool.url,
        icon: tool.icon,
        category_id: tool.category_id,
        tags: [], // TODO: 实现标签关联
        is_favorite: true,
        click_count: tool.click_count,
        is_featured: tool.is_featured,
        status: tool.status,
        created_at: tool.created_at,
        updated_at: tool.updated_at,
        created_by: tool.created_by,
        meta_title: tool.meta_title,
        meta_description: tool.meta_description,
        sort_order: tool.sort_order,
        category: tool.category
          ? {
              id: tool.category.id,
              name: tool.category.name,
              description: tool.category.description,
              icon: tool.category.icon,
              color: tool.category.color,
              parent_id: tool.category.parent_id,
              count: 0,
              sort_order: tool.category.sort_order,
              is_active: tool.category.is_active,
              created_at: tool.category.created_at,
              updated_at: tool.category.updated_at,
            }
          : undefined,
      })) as Tool[];
    } catch (error) {
      console.error("获取收藏工具失败:", error);
      throw new Error("获取收藏工具失败");
    }
  }

  // 获取用户收藏的产品
  static async getFavoriteProducts(userId: string): Promise<Product[]> {
    try {
      // 首先获取收藏记录
      const { data: favorites, error: favoritesError } = await (supabase as any)
        .from("favorites")
        .select("product_id")
        .eq("user_id", userId)
        .not("product_id", "is", null)
        .order("created_at", { ascending: false });

      if (favoritesError) throw favoritesError;
      if (!favorites || favorites.length === 0) return [];

      // 获取产品详情
      const productIds = favorites
        .map((f: any) => f.product_id)
        .filter(Boolean) as string[];
      const { data: products, error: productsError } = await (supabase as any)
        .from("products")
        .select(
          `
          *,
          category:product_categories(*)
        `,
        )
        .in("id", productIds)
        .eq("status", "active");

      if (productsError) throw productsError;

      return (products || []).map((product: any) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        short_description: product.short_description,
        price: product.price,
        original_price: product.original_price,
        currency: product.currency,
        category_id: product.category_id,
        category: product.category
          ? {
              id: product.category.id,
              name: product.category.name,
              description: product.category.description,
              icon: product.category.icon,
              color: product.category.color,
              parent_id: product.category.parent_id,
              count: 0,
              sort_order: product.category.sort_order,
              is_active: product.category.is_active,
              created_at: product.category.created_at,
              updated_at: product.category.updated_at,
            }
          : undefined,
        images: product.images || [],
        features: product.features || [],
        demo_url: product.demo_url,
        download_url: product.download_url,
        is_featured: product.is_featured,
        is_digital: product.is_digital,
        stock_quantity: product.stock_quantity,
        status: product.status,
        created_at: product.created_at,
        updated_at: product.updated_at,
        created_by: product.created_by,
        meta_title: product.meta_title,
        meta_description: product.meta_description,
        sort_order: product.sort_order,
      })) as Product[];
    } catch (error) {
      console.error("获取收藏产品失败:", error);
      throw new Error("获取收藏产品失败");
    }
  }

  // 添加工具到收藏
  static async addToolToFavorites(
    userId: string,
    toolId: string,
  ): Promise<Favorite> {
    try {
      // 检查是否已收藏
      const existing = await this.checkFavoriteExists(userId, toolId, "tool");
      if (existing) {
        throw new Error("已经收藏过此工具");
      }

      const favoriteData: FavoriteInsert = {
        user_id: userId,
        tool_id: toolId,
      };

      const { data, error } = await (supabase as any)
        .from("favorites")
        .insert(favoriteData)
        .select("*")
        .single();

      if (error) throw error;
      if (!data) throw new Error("添加收藏失败");

      return this.transformFavorite(data);
    } catch (error) {
      console.error("添加工具收藏失败:", error);
      throw new Error("添加工具收藏失败");
    }
  }

  // 添加产品到收藏
  static async addProductToFavorites(
    userId: string,
    productId: string,
  ): Promise<Favorite> {
    try {
      // 检查是否已收藏
      const existing = await this.checkFavoriteExists(
        userId,
        productId,
        "product",
      );
      if (existing) {
        throw new Error("已经收藏过此产品");
      }

      const favoriteData: FavoriteInsert = {
        user_id: userId,
        product_id: productId,
      };

      const { data, error } = await (supabase as any)
        .from("favorites")
        .insert(favoriteData)
        .select("*")
        .single();

      if (error) throw error;
      if (!data) throw new Error("添加收藏失败");

      return this.transformFavorite(data);
    } catch (error) {
      console.error("添加产品收藏失败:", error);
      throw new Error("添加产品收藏失败");
    }
  }

  // 从收藏中移除工具
  static async removeToolFromFavorites(
    userId: string,
    toolId: string,
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", userId)
        .eq("tool_id", toolId);

      if (error) throw error;
    } catch (error) {
      console.error("移除工具收藏失败:", error);
      throw new Error("移除工具收藏失败");
    }
  }

  // 从收藏中移除产品
  static async removeProductFromFavorites(
    userId: string,
    productId: string,
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", userId)
        .eq("product_id", productId);

      if (error) throw error;
    } catch (error) {
      console.error("移除产品收藏失败:", error);
      throw new Error("移除产品收藏失败");
    }
  }

  // 检查是否已收藏
  static async checkFavoriteExists(
    userId: string,
    itemId: string,
    type: "tool" | "product",
  ): Promise<boolean> {
    try {
      let query = supabase.from("favorites").select("id").eq("user_id", userId);

      if (type === "tool") {
        query = query.eq("tool_id", itemId);
      } else {
        query = query.eq("product_id", itemId);
      }

      const { data, error } = await query;

      if (error) throw error;

      return !!(data && data.length > 0);
    } catch (error) {
      console.error("检查收藏状态失败:", error);
      return false;
    }
  }

  // 获取用户收藏统计
  static async getFavoriteStats(userId: string): Promise<{
    totalFavorites: number;
    toolsCount: number;
    productsCount: number;
  }> {
    try {
      const { data, error } = await supabase
        .from("favorites")
        .select("tool_id, product_id")
        .eq("user_id", userId);

      if (error) throw error;

      const favorites = data || [];
      const toolsCount = favorites.filter((f) => f.tool_id).length;
      const productsCount = favorites.filter((f) => f.product_id).length;

      return {
        totalFavorites: favorites.length,
        toolsCount,
        productsCount,
      };
    } catch (error) {
      console.error("获取收藏统计失败:", error);
      return {
        totalFavorites: 0,
        toolsCount: 0,
        productsCount: 0,
      };
    }
  }

  // 清空用户所有收藏
  static async clearAllFavorites(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", userId);

      if (error) throw error;
    } catch (error) {
      console.error("清空收藏失败:", error);
      throw new Error("清空收藏失败");
    }
  }

  // 批量添加收藏
  static async addBatchFavorites(
    userId: string,
    items: Array<{ id: string; type: "tool" | "product" }>,
  ): Promise<void> {
    try {
      const favoriteData: FavoriteInsert[] = items.map((item) => ({
        user_id: userId,
        tool_id: item.type === "tool" ? item.id : null,
        product_id: item.type === "product" ? item.id : null,
      }));

      const { error } = await (supabase as any)
        .from("favorites")
        .insert(favoriteData);

      if (error) throw error;
    } catch (error) {
      console.error("批量添加收藏失败:", error);
      throw new Error("批量添加收藏失败");
    }
  }

  // 转换数据库行为业务对象
  private static transformFavorite(row: any): Favorite {
    return {
      id: row.id,
      user_id: row.user_id,
      tool_id: row.tool_id,
      product_id: row.product_id,
      created_at: row.created_at,
    };
  }
}
