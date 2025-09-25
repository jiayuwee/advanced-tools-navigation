import { supabase } from "../lib/supabase";
import type { Product, SearchFilters, SearchResult, Review } from "../types";

type ProductInsert = Record<string, unknown>;
type ProductUpdate = Record<string, unknown>;

export class ProductsService {
  // 获取所有产品
  static async getProducts(
    filters?: SearchFilters,
  ): Promise<SearchResult<Product>> {
    try {
      let query = supabase
        .from("products")
        .select(
          `
          *,
          category:product_categories(*)
        `,
        )
        .eq("status", "active");

      // 应用搜索过滤器
      if (filters?.query) {
        query = query.or(
          `name.ilike.%${filters.query}%,description.ilike.%${filters.query}%`,
        );
      }

      if (filters?.category) {
        query = query.eq("category_id", filters.category);
      }

      if (filters?.priceRange) {
        query = query
          .gte("price", filters.priceRange[0])
          .lte("price", filters.priceRange[1]);
      }

      // 排序
      const sortBy = filters?.sortBy || "created_at";
      const sortOrder = filters?.sortOrder || "desc";

      if (sortBy === "name") {
        query = query.order("name", { ascending: sortOrder === "asc" });
      } else if (sortBy === "price") {
        query = query.order("price", { ascending: sortOrder === "asc" });
      } else if (sortBy === "created_at") {
        query = query.order("created_at", { ascending: sortOrder === "asc" });
      } else {
        query = query.order("sort_order", { ascending: true });
      }

      // 分页
      const page = filters?.page || 1;
      const limit = filters?.limit || 12;
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      const products = data?.map(this.transformProduct) || [];

      return {
        items: products,
        total: count || 0,
        page,
        limit,
        hasMore: (count || 0) > page * limit,
      };
    } catch (error) {
      console.error("获取产品列表失败:", error);
      throw new Error("获取产品列表失败");
    }
  }

  // 获取单个产品
  static async getProduct(id: string): Promise<Product> {
    try {
      const { data, error } = await supabase
        .from("products")
        .select(
          `
          *,
          category:product_categories(*),
          reviews:product_reviews(
            *,
            user:user_profiles(*)
          )
        `,
        )
        .eq("id", id)
        .eq("status", "active")
        .single();

      if (error) throw error;
      if (!data) throw new Error("产品不存在");

      return this.transformProduct(data);
    } catch (error) {
      console.error("获取产品详情失败:", error);
      throw new Error("获取产品详情失败");
    }
  }

  // 获取特色产品
  static async getFeaturedProducts(limit = 6): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from("products")
        .select(
          `
          *,
          category:product_categories(*)
        `,
        )
        .eq("status", "active")
        .eq("is_featured", true)
        .order("sort_order", { ascending: true })
        .limit(limit);

      if (error) throw error;

      return data?.map(this.transformProduct) || [];
    } catch (error) {
      console.error("获取特色产品失败:", error);
      throw new Error("获取特色产品失败");
    }
  }

  // 获取相关产品
  static async getRelatedProducts(
    productId: string,
    categoryId: string,
    limit = 4,
  ): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from("products")
        .select(
          `
          *,
          category:product_categories(*)
        `,
        )
        .eq("status", "active")
        .eq("category_id", categoryId)
        .neq("id", productId)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data?.map(this.transformProduct) || [];
    } catch (error) {
      console.error("获取相关产品失败:", error);
      return [];
    }
  }

  // 创建产品
  static async createProduct(productData: ProductInsert): Promise<Product> {
    try {
      const { data, error } = await (supabase as any)
        .from("products")
        .insert(productData)
        .select(
          `
          *,
          category:product_categories(*)
        `,
        )
        .single();

      if (error) throw error;
      if (!data) throw new Error("创建产品失败");

      return this.transformProduct(data);
    } catch (error) {
      console.error("创建产品失败:", error);
      throw new Error("创建产品失败");
    }
  }

  // 更新产品
  static async updateProduct(
    id: string,
    updates: ProductUpdate,
  ): Promise<Product> {
    try {
      const { data, error } = await supabase
        .from("products")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select(
          `
          *,
          category:product_categories(*)
        `,
        )
        .single();

      if (error) throw error;
      if (!data) throw new Error("更新产品失败");

      return this.transformProduct(data);
    } catch (error) {
      console.error("更新产品失败:", error);
      throw new Error("更新产品失败");
    }
  }

  // 删除产品
  static async deleteProduct(id: string): Promise<void> {
    try {
      const { error } = await supabase.from("products").delete().eq("id", id);

      if (error) throw error;
    } catch (error) {
      console.error("删除产品失败:", error);
      throw new Error("删除产品失败");
    }
  }

  // 搜索产品
  static async searchProducts(
    query: string,
    filters?: Partial<SearchFilters>,
  ): Promise<SearchResult<Product>> {
    return this.getProducts({
      ...filters,
      query,
    });
  }

  // 上传产品图片
  static async uploadProductImage(
    file: File,
    productId: string,
  ): Promise<string> {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${productId}-${Date.now()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("product-images")
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error("上传产品图片失败:", error);
      throw new Error("上传产品图片失败");
    }
  }

  // 转换数据库行为业务对象
  private static transformProduct(row: Record<string, any>): Product {
    const category = row.category
      ? {
          id: row.category.id,
          name: row.category.name,
          description: row.category.description ?? undefined,
          icon: row.category.icon,
          color: row.category.color,
          parent_id: row.category.parent_id ?? undefined,
          children: undefined,
          count: 0,
          sort_order: row.category.sort_order,
          is_active: row.category.is_active,
          created_at: row.category.created_at,
          updated_at: row.category.updated_at,
        }
      : undefined;

    const reviews: Review[] =
      (row.reviews || []).map((review: any) => ({
        id: review.id,
        user_id: review.user_id,
        user: review.user
          ? {
              id: review.user.id,
              email: review.user.email,
              username: review.user.username,
              full_name: review.user.full_name,
              avatar_url: review.user.avatar_url,
              bio: review.user.bio,
              website: review.user.website,
              location: review.user.location,
              role: review.user.role,
              is_active: review.user.is_active,
              email_verified: review.user.email_verified,
              created_at: review.user.created_at,
              updated_at: review.user.updated_at,
              last_login_at: review.user.last_login_at,
            }
          : undefined,
        product_id: review.product_id,
        rating: review.rating,
        title: review.title,
        content: review.content,
        is_verified_purchase: review.is_verified_purchase ?? false,
        created_at: review.created_at,
        updated_at: review.updated_at,
      })) || [];

    return {
      id: row.id,
      name: row.name,
      description: row.description,
      short_description: row.short_description,
      price: row.price,
      original_price: row.original_price,
      currency: row.currency,
      category_id: row.category_id,
      category,
      images: row.images || [],
      features: row.features || [],
      demo_url: row.demo_url,
      download_url: row.download_url,
      is_featured: row.is_featured,
      is_digital: row.is_digital,
      stock_quantity: row.stock_quantity,
      status: row.status,
      created_at: row.created_at,
      updated_at: row.updated_at,
      created_by: row.created_by,
      meta_title: row.meta_title,
      meta_description: row.meta_description,
      sort_order: row.sort_order,
      reviews,
      average_rating: row.average_rating,
      total_reviews: row.total_reviews,
    };
  }
}
