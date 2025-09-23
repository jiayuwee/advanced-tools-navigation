import { supabase, TABLES } from "@/lib/supabaseClient";
import type { Tool, Product, Category } from "@/types";

export interface SearchOptions {
  query: string;
  type?: "all" | "tools" | "products" | "categories";
  category?: string;
  tags?: string[];
  priceRange?: [number, number];
  sortBy?: "relevance" | "name" | "created_at" | "click_count" | "price";
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
  includeInactive?: boolean;
}

export interface SearchResult<T> {
  items: T[];
  total: number;
  query: string;
  suggestions: string[];
  facets: SearchFacets;
  searchTime: number;
}

export interface SearchFacets {
  categories: { name: string; count: number }[];
  tags: { name: string; count: number }[];
  priceRanges: { range: string; count: number }[];
}

export interface SearchSuggestion {
  text: string;
  type: "query" | "category" | "tag" | "tool" | "product";
  count?: number;
}

export type SearchAllItem =
  | (Tool & { _type: "tool" })
  | (Product & { _type: "product" })
  | (Category & { _type: "category" });

export interface SearchHistory {
  id: string;
  query: string;
  type: string;
  timestamp: Date;
  results_count: number;
}

class SearchService {
  private searchHistory: SearchHistory[] = [];
  private popularQueries: Map<string, number> = new Map();

  // 主搜索方法
  async search<T>(options: SearchOptions): Promise<SearchResult<T>> {
    const startTime = Date.now();
    const { query, type = "all" } = options;

    try {
      let results: T[] = [];
      let total = 0;
      let facets: SearchFacets = {
        categories: [],
        tags: [],
        priceRanges: [],
      };

      // 记录搜索历史
      this.addToHistory(query, type);

      // 根据搜索类型执行不同的搜索策略
      switch (type) {
        case "tools":
          const toolResults = await this.searchTools(options);
          results = toolResults.items as T[];
          total = toolResults.total;
          facets = toolResults.facets;
          break;

        case "products":
          const productResults = await this.searchProducts(options);
          results = productResults.items as T[];
          total = productResults.total;
          facets = productResults.facets;
          break;

        case "categories":
          const categoryResults = await this.searchCategories(options);
          results = categoryResults.items as T[];
          total = categoryResults.total;
          break;

        case "all":
        default:
          const allResults = await this.searchAll(options);
          results = allResults.items as T[];
          total = allResults.total;
          facets = allResults.facets;
          break;
      }

      // 生成搜索建议
      const suggestions = await this.generateSuggestions(query);

      const searchTime = Date.now() - startTime;

      return {
        items: results,
        total,
        query,
        suggestions,
        facets,
        searchTime,
      };
    } catch (error) {
      console.error("搜索失败:", error);
      throw error;
    }
  }

  // 搜索工具
  private async searchTools(options: SearchOptions): Promise<{
    items: Tool[];
    total: number;
    facets: SearchFacets;
  }> {
    const {
      query,
      category,
      tags,
      sortBy = "relevance",
      sortOrder = "desc",
      limit = 20,
      offset = 0,
    } = options;

    let queryBuilder = supabase.from(TABLES.TOOLS).select(
      `
        *,
        categories!inner(name, icon, color),
        tool_tags!inner(tags!inner(name, color))
      `,
      { count: "exact" },
    );

    // 全文搜索
    if (query) {
      queryBuilder = queryBuilder.or(`
        name.ilike.%${query}%,
        description.ilike.%${query}%,
        meta_title.ilike.%${query}%,
        meta_description.ilike.%${query}%
      `);
    }

    // 分类筛选
    if (category) {
      queryBuilder = queryBuilder.eq("category_id", category);
    }

    // 标签筛选
    if (tags && tags.length > 0) {
      queryBuilder = queryBuilder.in("tool_tags.tag_id", tags);
    }

    // 只显示活跃的工具
    queryBuilder = queryBuilder.eq("status", "active");

    // 排序
    if (sortBy === "relevance" && query) {
      // 相关性排序：优先显示名称匹配的结果
      queryBuilder = queryBuilder.order("is_featured", { ascending: false });
      queryBuilder = queryBuilder.order("click_count", { ascending: false });
    } else {
      queryBuilder = queryBuilder.order(sortBy, {
        ascending: sortOrder === "asc",
      });
    }

    // 分页
    queryBuilder = queryBuilder.range(offset, offset + limit - 1);

    const { data, error, count } = await queryBuilder;

    if (error) throw error;

    // 生成分面数据
    const facets = await this.generateToolsFacets(query, category, tags);

    return {
      items: data || [],
      total: count || 0,
      facets,
    };
  }

  // 搜索产品
  private async searchProducts(options: SearchOptions): Promise<{
    items: Product[];
    total: number;
    facets: SearchFacets;
  }> {
    const {
      query,
      category,
      priceRange,
      sortBy = "relevance",
      sortOrder = "desc",
      limit = 20,
      offset = 0,
    } = options;

    let queryBuilder = supabase.from(TABLES.PRODUCTS).select(
      `
        *,
        product_categories!inner(name, icon, color)
      `,
      { count: "exact" },
    );

    // 全文搜索
    if (query) {
      queryBuilder = queryBuilder.or(`
        name.ilike.%${query}%,
        description.ilike.%${query}%,
        short_description.ilike.%${query}%,
        meta_title.ilike.%${query}%,
        meta_description.ilike.%${query}%
      `);
    }

    // 分类筛选
    if (category) {
      queryBuilder = queryBuilder.eq("category_id", category);
    }

    // 价格范围筛选
    if (priceRange) {
      queryBuilder = queryBuilder
        .gte("price", priceRange[0])
        .lte("price", priceRange[1]);
    }

    // 只显示活跃的产品
    queryBuilder = queryBuilder.eq("status", "active");

    // 排序
    if (sortBy === "relevance" && query) {
      queryBuilder = queryBuilder.order("is_featured", { ascending: false });
    } else {
      queryBuilder = queryBuilder.order(sortBy, {
        ascending: sortOrder === "asc",
      });
    }

    // 分页
    queryBuilder = queryBuilder.range(offset, offset + limit - 1);

    const { data, error, count } = await queryBuilder;

    if (error) throw error;

    // 生成分面数据
    const facets = await this.generateProductsFacets(
      query,
      category,
      priceRange,
    );

    return {
      items: data || [],
      total: count || 0,
      facets,
    };
  }

  // 搜索分类
  private async searchCategories(options: SearchOptions): Promise<{
    items: Category[];
    total: number;
  }> {
    const { query, limit = 20, offset = 0 } = options;

    let queryBuilder = supabase
      .from(TABLES.CATEGORIES)
      .select("*", { count: "exact" });

    if (query) {
      queryBuilder = queryBuilder.or(`
        name.ilike.%${query}%,
        description.ilike.%${query}%
      `);
    }

    queryBuilder = queryBuilder
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await queryBuilder;

    if (error) throw error;

    return {
      items: data || [],
      total: count || 0,
    };
  }

  // 综合搜索
  private async searchAll(options: SearchOptions): Promise<{
    items: SearchAllItem[];
    total: number;
    facets: SearchFacets;
  }> {
    const { limit = 20 } = options;

    // 并行搜索各个类型
    const [toolResults, productResults, categoryResults] = await Promise.all([
      this.searchTools({ ...options, limit: Math.ceil(limit / 3) }),
      this.searchProducts({ ...options, limit: Math.ceil(limit / 3) }),
      this.searchCategories({ ...options, limit: Math.ceil(limit / 3) }),
    ]);

    // 合并结果
    const items = [
      ...toolResults.items.map((item) => ({ ...item, _type: "tool" })),
      ...productResults.items.map((item) => ({ ...item, _type: "product" })),
      ...categoryResults.items.map((item) => ({ ...item, _type: "category" })),
    ];

    const total =
      toolResults.total + productResults.total + categoryResults.total;

    // 合并分面数据
    const facets: SearchFacets = {
      categories: [
        ...toolResults.facets.categories,
        ...productResults.facets.categories,
      ],
      tags: toolResults.facets.tags,
      priceRanges: productResults.facets.priceRanges,
    };

    return { items, total, facets };
  }

  // 生成工具分面数据
  private async generateToolsFacets(query?: string): Promise<SearchFacets> {
    // 获取分类分面
    const categoriesQuery = supabase
      .from(TABLES.CATEGORIES)
      .select(
        `
        id, name,
        tools!inner(id)
      `,
        { count: "exact" },
      )
      .eq("is_active", true);

    if (query) {
      categoriesQuery.or(`
        tools.name.ilike.%${query}%,
        tools.description.ilike.%${query}%
      `);
    }

    const { data: categoriesData } = await categoriesQuery;

    const categories = (categoriesData || []).map((cat) => ({
      name: cat.name,
      count: cat.tools?.length || 0,
    }));

    // 获取标签分面
    const tagsQuery = supabase.from(TABLES.TAGS).select(
      `
        id, name,
        tool_tags!inner(tools!inner(id))
      `,
      { count: "exact" },
    );

    if (query) {
      tagsQuery.or(`
        tool_tags.tools.name.ilike.%${query}%,
        tool_tags.tools.description.ilike.%${query}%
      `);
    }

    const { data: tagsData } = await tagsQuery;

    const tags = (tagsData || []).map((tag) => ({
      name: tag.name,
      count: tag.tool_tags?.length || 0,
    }));

    return {
      categories,
      tags,
      priceRanges: [],
    };
  }

  // 生成产品分面数据
  private async generateProductsFacets(query?: string): Promise<SearchFacets> {
    // 获取分类分面
    const categoriesQuery = supabase.from(TABLES.PRODUCT_CATEGORIES).select(
      `
        id, name,
        products!inner(id)
      `,
      { count: "exact" },
    );

    if (query) {
      categoriesQuery.or(`
        products.name.ilike.%${query}%,
        products.description.ilike.%${query}%
      `);
    }

    const { data: categoriesData } = await categoriesQuery;

    const categories = (categoriesData || []).map((cat) => ({
      name: cat.name,
      count: cat.products?.length || 0,
    }));

    // 获取价格范围分面
    const priceRanges = [
      { range: "0-50", count: 0 },
      { range: "50-100", count: 0 },
      { range: "100-500", count: 0 },
      { range: "500+", count: 0 },
    ];

    // 这里可以添加实际的价格范围统计查询

    return {
      categories,
      tags: [],
      priceRanges,
    };
  }

  // 生成搜索建议
  private async generateSuggestions(query: string): Promise<string[]> {
    if (!query || query.length < 2) return [];

    const suggestions: string[] = [];

    try {
      // 从工具名称生成建议
      const { data: toolSuggestions } = await supabase
        .from(TABLES.TOOLS)
        .select("name")
        .ilike("name", `%${query}%`)
        .eq("status", "active")
        .limit(5);

      toolSuggestions?.forEach((tool) => {
        if (!suggestions.includes(tool.name)) {
          suggestions.push(tool.name);
        }
      });

      // 从产品名称生成建议
      const { data: productSuggestions } = await supabase
        .from(TABLES.PRODUCTS)
        .select("name")
        .ilike("name", `%${query}%`)
        .eq("status", "active")
        .limit(5);

      productSuggestions?.forEach((product) => {
        if (!suggestions.includes(product.name)) {
          suggestions.push(product.name);
        }
      });

      // 从分类名称生成建议
      const { data: categorySuggestions } = await supabase
        .from(TABLES.CATEGORIES)
        .select("name")
        .ilike("name", `%${query}%`)
        .eq("is_active", true)
        .limit(3);

      categorySuggestions?.forEach((category) => {
        if (!suggestions.includes(category.name)) {
          suggestions.push(category.name);
        }
      });
    } catch (error) {
      console.error("生成搜索建议失败:", error);
    }

    return suggestions.slice(0, 8);
  }

  // 获取热门搜索
  async getPopularSearches(limit: number = 10): Promise<string[]> {
    const popular = Array.from(this.popularQueries.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([query]) => query);

    return popular;
  }

  // 获取搜索历史
  getSearchHistory(limit: number = 10): SearchHistory[] {
    return this.searchHistory
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  // 清除搜索历史
  clearSearchHistory(): void {
    this.searchHistory = [];
    localStorage.removeItem("search_history");
  }

  // 保存搜索历史到本地存储
  private saveHistoryToStorage(): void {
    try {
      localStorage.setItem(
        "search_history",
        JSON.stringify(this.searchHistory),
      );
    } catch (error) {
      console.error("保存搜索历史失败:", error);
    }
  }

  // 从本地存储加载搜索历史
  private loadHistoryFromStorage(): void {
    try {
      const stored = localStorage.getItem("search_history");
      if (stored) {
        const parsed = JSON.parse(stored);
        this.searchHistory = parsed.map((item: unknown) => ({
          ...item,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          timestamp: new Date((item as any).timestamp),
        }));
      }
    } catch (error) {
      console.error("加载搜索历史失败:", error);
      this.searchHistory = [];
    }
  }

  // 添加到搜索历史
  private addToHistory(query: string, type: string): void {
    const historyItem: SearchHistory = {
      id: Date.now().toString(),
      query,
      type,
      timestamp: new Date(),
      results_count: 0,
    };

    // 避免重复
    this.searchHistory = this.searchHistory.filter(
      (item) => item.query !== query || item.type !== type,
    );

    this.searchHistory.unshift(historyItem);

    // 限制历史记录数量
    if (this.searchHistory.length > 50) {
      this.searchHistory = this.searchHistory.slice(0, 50);
    }

    // 更新热门搜索
    const currentCount = this.popularQueries.get(query) || 0;
    this.popularQueries.set(query, currentCount + 1);
  }

  // 智能搜索建议
  async getSmartSuggestions(query: string): Promise<SearchSuggestion[]> {
    const suggestions: SearchSuggestion[] = [];

    if (!query || query.length < 2) {
      // 返回热门搜索
      const popular = await this.getPopularSearches(5);
      return popular.map((q) => ({
        text: q,
        type: "query" as const,
      }));
    }

    try {
      // 查询建议
      const querySuggestions = await this.generateSuggestions(query, "all");
      querySuggestions.forEach((suggestion) => {
        suggestions.push({
          text: suggestion,
          type: "query",
        });
      });

      // 分类建议
      const { data: categories } = await supabase
        .from(TABLES.CATEGORIES)
        .select("name")
        .ilike("name", `%${query}%`)
        .eq("is_active", true)
        .limit(3);

      categories?.forEach((category) => {
        suggestions.push({
          text: category.name,
          type: "category",
        });
      });

      // 标签建议
      const { data: tags } = await supabase
        .from(TABLES.TAGS)
        .select("name")
        .ilike("name", `%${query}%`)
        .limit(3);

      tags?.forEach((tag) => {
        suggestions.push({
          text: tag.name,
          type: "tag",
        });
      });
    } catch (error) {
      console.error("获取智能建议失败:", error);
    }

    return suggestions.slice(0, 10);
  }
}

// 导出单例实例
export const searchService = new SearchService();
export default searchService;
