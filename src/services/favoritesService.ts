import { supabase } from "../lib/supabase";
import type { Favorite, Tool, Product } from "../types";

// 可替换为自动生成的 Supabase Database 类型（运行 supabase gen 后）
// import type { Database } from '../types/database';
// type FavoritesTable = Database['public']['Tables']['favorites']['Row'];
// TODO: 后续将内部行类型替换为 Database 提供的类型，消除重复定义

/**
 * 数据表行类型（内部使用，避免 any 扩散）
 */
interface FavoriteRow {
  id: string;
  user_id: string;
  tool_id: string | null;
  product_id: string | null;
  created_at: string;
}

interface CategoryRow {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  parent_id: string | null;
  sort_order: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
}

interface ToolRow {
  id: string;
  name: string;
  description: string | null;
  url: string;
  icon: string | null;
  category_id: string;
  click_count: number;
  is_featured: boolean;
  status: string;
  created_at: string;
  updated_at: string | null;
  created_by: string | null;
  meta_title: string | null;
  meta_description: string | null;
  sort_order: number | null;
  category?: CategoryRow | null;
}

interface ProductRow {
  id: string;
  name: string;
  description: string | null;
  short_description: string | null;
  price: number | null;
  original_price: number | null;
  currency: string | null;
  category_id: string;
  is_featured: boolean;
  is_digital: boolean;
  stock_quantity: number | null;
  status: string;
  created_at: string;
  updated_at: string | null;
  created_by: string | null;
  meta_title: string | null;
  meta_description: string | null;
  sort_order: number | null;
  images?: string[] | null;
  features?: string[] | null;
  demo_url?: string | null;
  download_url?: string | null;
  category?: CategoryRow | null;
}

type FavoriteInsert = {
  user_id: string;
  tool_id?: string | null;
  product_id?: string | null;
};

export class FavoritesService {
  /**
   * 获取用户收藏的工具（保持收藏顺序）
   */
  static async getFavoriteTools(userId: string): Promise<Tool[]> {
    try {
      const { data: favorites, error: favErr } = await supabase
        .from("favorites")
        .select("tool_id, created_at")
        .eq("user_id", userId)
        .not("tool_id", "is", null)
        .order("created_at", { ascending: false });

      if (favErr) throw favErr;
      if (!favorites?.length) return [];

      const toolIds = favorites
        .map(f => f.tool_id)
        .filter((v): v is string => !!v);

      const { data: tools, error: toolsErr } = await supabase
        .from("tools")
        .select(
          `
          *,
          category:categories (*)
        `
        )
        .in("id", toolIds)
        .eq("status", "active");

      if (toolsErr) throw toolsErr;
      if (!tools?.length) return [];

      // 保持收藏顺序
      const orderMap = new Map(toolIds.map((id, idx) => [id, idx]));
      const normalized = (tools as ToolRow[])
        .map(t => this.transformToolRow(t))
        .sort(
          (a, b) =>
            (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0)
        );

      return normalized;
    } catch (e) {
      console.error("获取收藏工具失败:", e);
      throw new Error("获取收藏工具失败");
    }
  }

  /**
   * 获取用户收藏的产品（保持收藏顺序）
   */
  static async getFavoriteProducts(userId: string): Promise<Product[]> {
    try {
      const { data: favorites, error: favErr } = await supabase
        .from("favorites")
        .select("product_id, created_at")
        .eq("user_id", userId)
        .not("product_id", "is", null)
        .order("created_at", { ascending: false });

      if (favErr) throw favErr;
      if (!favorites?.length) return [];

      const productIds = favorites
        .map(f => f.product_id)
        .filter((v): v is string => !!v);

      const { data: products, error: prodErr } = await supabase
        .from("products")
        .select(
          `
          *,
          category:product_categories (*)
        `
        )
        .in("id", productIds)
        .eq("status", "active");

      if (prodErr) throw prodErr;
      if (!products?.length) return [];

      const orderMap = new Map(productIds.map((id, idx) => [id, idx]));
      const normalized = (products as ProductRow[])
        .map(p => this.transformProductRow(p))
        .sort(
          (a, b) =>
            (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0)
        );

      return normalized;
    } catch (e) {
      console.error("获取收藏产品失败:", e);
      throw new Error("获取收藏产品失败");
    }
  }

  /**
   * 添加工具收藏
   */
  static async addToolToFavorites(userId: string, toolId: string): Promise<Favorite> {
    return this.insertFavoriteGuard(userId, { toolId });
  }

  /**
   * 添加产品收藏
   */
  static async addProductToFavorites(userId: string, productId: string): Promise<Favorite> {
    return this.insertFavoriteGuard(userId, { productId });
  }

  /**
   * toggle 收藏（存在则删除，不存在则添加；返回当前是否已收藏）
   */
  static async toggleFavorite(userId: string, id: string, type: "tool" | "product"): Promise<{ favorite?: Favorite; isFavorite: boolean; }> {
    const exists = await this.checkFavoriteExists(userId, id, type);
    if (exists) {
      if (type === "tool") await this.removeToolFromFavorites(userId, id);
      else await this.removeProductFromFavorites(userId, id);
      return { isFavorite: false };
    }
    const favorite = type === "tool"
      ? await this.addToolToFavorites(userId, id)
      : await this.addProductToFavorites(userId, id);
    return { favorite, isFavorite: true };
  }

  /**
   * 移除工具收藏
   */
  static async removeToolFromFavorites(userId: string, toolId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", userId)
        .eq("tool_id", toolId);
      if (error) throw error;
    } catch (e) {
      console.error("移除工具收藏失败:", e);
      throw new Error("移除工具收藏失败");
    }
  }

  /**
   * 移除产品收藏
   */
  static async removeProductFromFavorites(userId: string, productId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", userId)
        .eq("product_id", productId);
      if (error) throw error;
    } catch (e) {
      console.error("移除产品收藏失败:", e);
      throw new Error("移除产品收藏失败");
    }
  }

  /**
   * 检查是否已收藏
   */
  static async checkFavoriteExists(userId: string, itemId: string, type: "tool" | "product"): Promise<boolean> {
    try {
      const column = type === "tool" ? "tool_id" : "product_id";
      const { data, error } = await supabase
        .from("favorites")
        .select("id")
        .eq("user_id", userId)
        .eq(column, itemId)
        .limit(1);
      if (error) throw error;
      return !!data?.length;
    } catch (e) {
      console.error("检查收藏状态失败:", e);
      return false;
    }
  }

  /**
   * 收藏统计
   */
  static async getFavoriteStats(userId: string): Promise<{ totalFavorites: number; toolsCount: number; productsCount: number; }> {
    try {
      const { data, error } = await supabase
        .from("favorites")
        .select("tool_id, product_id")
        .eq("user_id", userId);
      if (error) throw error;
      const list = data ?? [];
      const toolsCount = list.filter(f => f.tool_id).length;
      const productsCount = list.filter(f => f.product_id).length;
      return { totalFavorites: list.length, toolsCount, productsCount };
    } catch (e) {
      console.error("获取收藏统计失败:", e);
      return { totalFavorites: 0, toolsCount: 0, productsCount: 0 };
    }
  }

  /**
   * 清空收藏
   */
  static async clearAllFavorites(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", userId);
      if (error) throw error;
    } catch (e) {
      console.error("清空收藏失败:", e);
      throw new Error("清空收藏失败");
    }
  }

  /**
   * 批量添加收藏（忽略已存在项，依赖数据库唯一约束：user_id + tool_id / product_id）
   */
  static async addBatchFavorites(
    userId: string,
    items: Array<{ id: string; type: "tool" | "product" }>
  ): Promise<void> {
    try {
      if (!items.length) return;
      const favoriteData: FavoriteInsert[] = items.map(i => ({
        user_id: userId,
        tool_id: i.type === "tool" ? i.id : null,
        product_id: i.type === "product" ? i.id : null
      }));
      const { error } = await supabase
        .from("favorites")
        .insert(favoriteData, { ignoreDuplicates: true } as any);
      if (error) throw error;
    } catch (e) {
      console.error("批量添加收藏失败:", e);
      throw new Error("批量添加收藏失败");
    }
  }

  /**
   * 通用插入并校验防重复（仍可能遭遇并发写：需 DB 层唯一索引保障）
   */
  private static async insertFavoriteGuard(
    userId: string,
    params: { toolId?: string; productId?: string }
  ): Promise<Favorite> {
    const { toolId, productId } = params;
    const type: "tool" | "product" = toolId ? "tool" : "product";
    const id = toolId ?? productId!;
    const exists = await this.checkFavoriteExists(userId, id, type);
    if (exists) throw new Error(`已经收藏过此${type === "tool" ? "工具" : "产品"}`);

    const payload: FavoriteInsert = {
      user_id: userId,
      tool_id: toolId ?? null,
      product_id: productId ?? null
    };

    try {
      const { data, error } = await supabase
        .from("favorites")
        .insert(payload)
        .select("*")
        .single();
      if (error) throw error;
      if (!data) throw new Error("添加收藏失败");
      return this.transformFavorite(data as FavoriteRow);
    } catch (e: any) {
      // 唯一索引冲突兜底（例如并发双击）
      if (e?.code === "23505") {
        const again = await this.fetchExistingFavorite(userId, id, type);
        if (again) return again;
      }
      console.error("添加收藏失败:", e);
      throw new Error(`添加${type === "tool" ? "工具" : "产品"}收藏失败`);
    }
  }

  private static async fetchExistingFavorite(userId: string, id: string, type: "tool" | "product"): Promise<Favorite | null> {
    const column = type === "tool" ? "tool_id" : "product_id";
    const { data, error } = await supabase
      .from("favorites")
      .select("*")
      .eq("user_id", userId)
      .eq(column, id)
      .maybeSingle();
    if (error || !data) return null;
    return this.transformFavorite(data as FavoriteRow);
  }

  private static transformFavorite(row: FavoriteRow): Favorite {
    return {
      id: row.id,
      user_id: row.user_id,
      tool_id: row.tool_id ?? undefined,
      product_id: row.product_id ?? undefined,
      created_at: row.created_at
    };
  }

  private static transformToolRow(row: ToolRow): Tool {
    return {
      id: row.id,
      name: row.name,
      description: row.description ?? "",
      url: row.url,
      icon: row.icon ?? "",
      category_id: row.category_id,
      tags: [], // TODO 后续实现标签
      is_favorite: true,
      click_count: row.click_count,
      is_featured: row.is_featured,
      status: row.status,
      created_at: row.created_at,
      updated_at: row.updated_at ?? undefined,
      created_by: row.created_by ?? undefined,
      meta_title: row.meta_title ?? undefined,
      meta_description: row.meta_description ?? undefined,
      sort_order: row.sort_order ?? undefined,
      category: row.category
        ? {
            id: row.category.id,
            name: row.category.name,
            description: row.category.description ?? "",
            icon: row.category.icon ?? "",
            color: row.category.color ?? "",
            parent_id: row.category.parent_id ?? undefined,
            count: 0,
            sort_order: row.category.sort_order ?? 0,
            is_active: row.category.is_active,
            created_at: row.category.created_at,
            updated_at: row.category.updated_at ?? undefined
          }
        : undefined
    };
  }

  private static transformProductRow(row: ProductRow): Product {
    return {
      id: row.id,
      name: row.name,
      description: row.description ?? "",
      short_description: row.short_description ?? "",
      price: row.price ?? 0,
      original_price: row.original_price ?? undefined,
      currency: row.currency ?? "USD",
      category_id: row.category_id,
      category: row.category
        ? {
            id: row.category.id,
            name: row.category.name,
            description: row.category.description ?? "",
            icon: row.category.icon ?? "",
            color: row.category.color ?? "",
            parent_id: row.category.parent_id ?? undefined,
            count: 0,
            sort_order: row.category.sort_order ?? 0,
            is_active: row.category.is_active,
            created_at: row.category.created_at,
            updated_at: row.category.updated_at ?? undefined
          }
        : undefined,
      images: row.images ?? [],
      features: row.features ?? [],
      demo_url: row.demo_url ?? undefined,
      download_url: row.download_url ?? undefined,
      is_featured: row.is_featured,
      is_digital: row.is_digital,
      stock_quantity: row.stock_quantity ?? undefined,
      status: row.status,
      created_at: row.created_at,
      updated_at: row.updated_at ?? undefined,
      created_by: row.created_by ?? undefined,
      meta_title: row.meta_title ?? undefined,
      meta_description: row.meta_description ?? undefined,
      sort_order: row.sort_order ?? undefined
    };
  }
}
