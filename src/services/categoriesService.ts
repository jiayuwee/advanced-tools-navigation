import { supabase, TABLES, handleSupabaseError } from "../lib/supabaseClient";
import type { Category } from "../types";
import type { Database } from "../types/database";

type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];

// 分类服务类
export class CategoriesService {
  // 获取所有分类
  static async getCategories(): Promise<Category[]> {
    try {
      const { data, error } = await supabase
        .from(TABLES.CATEGORIES)
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (error) {
        throw new Error(handleSupabaseError(error));
      }

      // 构建分类树结构
      const categories = (data || []).map(this.transformCategoryRow);
      return this.buildCategoryTree(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }
  }

  // 获取单个分类
  static async getCategory(id: string): Promise<Category> {
    try {
      const { data, error } = await supabase
        .from(TABLES.CATEGORIES)
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        throw new Error(handleSupabaseError(error));
      }

      return this.transformCategoryRow(data);
    } catch (error) {
      console.error("Error fetching category:", error);
      throw error;
    }
  }

  // 创建分类
  static async createCategory(
    categoryData: Partial<Category>,
  ): Promise<Category> {
    try {
      const { data, error } = await supabase
        .from(TABLES.CATEGORIES)
        .insert({
          name: categoryData.name!,
          description: categoryData.description,
          icon: categoryData.icon!,
          color: categoryData.color!,
          parent_id: categoryData.parent_id,
          sort_order: categoryData.sort_order || 0,
          is_active: true,
        })
        .select()
        .single();

      if (error) {
        throw new Error(handleSupabaseError(error));
      }

      return this.transformCategoryRow(data);
    } catch (error) {
      console.error("Error creating category:", error);
      throw error;
    }
  }

  // 更新分类
  static async updateCategory(
    id: string,
    categoryData: Partial<Category>,
  ): Promise<Category> {
    try {
      const updateData: any = {};

      if (categoryData.name) updateData.name = categoryData.name;
      if (categoryData.description !== undefined)
        updateData.description = categoryData.description;
      if (categoryData.icon) updateData.icon = categoryData.icon;
      if (categoryData.color) updateData.color = categoryData.color;
      if (categoryData.parent_id !== undefined)
        updateData.parent_id = categoryData.parent_id;
      if (categoryData.sort_order !== undefined)
        updateData.sort_order = categoryData.sort_order;
      if (categoryData.is_active !== undefined)
        updateData.is_active = categoryData.is_active;

      updateData.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from(TABLES.CATEGORIES)
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw new Error(handleSupabaseError(error));
      }

      return this.transformCategoryRow(data);
    } catch (error) {
      console.error("Error updating category:", error);
      throw error;
    }
  }

  // 删除分类
  static async deleteCategory(id: string): Promise<void> {
    try {
      // 检查是否有子分类
      const { data: children, error: childrenError } = await supabase
        .from(TABLES.CATEGORIES)
        .select("id")
        .eq("parent_id", id);

      if (childrenError) {
        throw new Error(handleSupabaseError(childrenError));
      }

      if (children && children.length > 0) {
        throw new Error("无法删除包含子分类的分类，请先删除或移动子分类");
      }

      // 检查是否有关联的工具
      const { data: tools, error: toolsError } = await supabase
        .from(TABLES.TOOLS)
        .select("id")
        .eq("category_id", id);

      if (toolsError) {
        throw new Error(handleSupabaseError(toolsError));
      }

      if (tools && tools.length > 0) {
        throw new Error("无法删除包含工具的分类，请先删除或移动工具");
      }

      const { error } = await supabase
        .from(TABLES.CATEGORIES)
        .delete()
        .eq("id", id);

      if (error) {
        throw new Error(handleSupabaseError(error));
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      throw error;
    }
  }

  // 获取分类统计信息
  static async getCategoryStats(): Promise<
    Array<{ categoryId: string; count: number }>
  > {
    try {
      const { data, error } = await supabase
        .from(TABLES.TOOLS)
        .select("category_id")
        .eq("status", "active");

      if (error) {
        throw new Error(handleSupabaseError(error));
      }

      // 统计每个分类的工具数量
      const stats = new Map<string, number>();
      data?.forEach((tool) => {
        const count = stats.get(tool.category_id) || 0;
        stats.set(tool.category_id, count + 1);
      });

      return Array.from(stats.entries()).map(([categoryId, count]) => ({
        categoryId,
        count,
      }));
    } catch (error) {
      console.error("Error fetching category stats:", error);
      throw error;
    }
  }

  // 获取带统计信息的分类列表
  static async getCategoriesWithStats(): Promise<Category[]> {
    try {
      const [categories, stats] = await Promise.all([
        this.getCategories(),
        this.getCategoryStats(),
      ]);

      const statsMap = new Map(stats.map((s) => [s.categoryId, s.count]));

      // 更新分类的工具数量
      const updateCategoryCount = (category: Category): Category => {
        const count = statsMap.get(category.id) || 0;
        const children = category.children?.map(updateCategoryCount) || [];
        const childrenCount = children.reduce(
          (sum, child) => sum + child.count,
          0,
        );

        return {
          ...category,
          count: count + childrenCount,
          children,
        };
      };

      return categories.map(updateCategoryCount);
    } catch (error) {
      console.error("Error fetching categories with stats:", error);
      throw error;
    }
  }

  // 构建分类树结构
  private static buildCategoryTree(categories: Category[]): Category[] {
    const categoryMap = new Map<string, Category>();
    const rootCategories: Category[] = [];

    // 创建分类映射
    categories.forEach((category) => {
      categoryMap.set(category.id, { ...category, children: [] });
    });

    // 构建树结构
    categories.forEach((category) => {
      const categoryNode = categoryMap.get(category.id)!;

      if (category.parent_id) {
        const parent = categoryMap.get(category.parent_id);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(categoryNode);
        } else {
          // 父分类不存在，作为根分类处理
          rootCategories.push(categoryNode);
        }
      } else {
        rootCategories.push(categoryNode);
      }
    });

    return rootCategories;
  }

  // 转换数据库行为业务对象
  public static transformCategoryRow(row: CategoryRow): Category {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      icon: row.icon,
      color: row.color,
      parentId: row.parent_id,
      count: 0, // 将在获取统计信息时更新
      sortOrder: row.sort_order,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
