import { ref, computed } from "vue";
import { useToolsStore } from "@/stores/tools";
import type { Tool } from "@/stores/tools";

export interface SearchFilters {
  category: string;
  tags: string[];
  rating: number;
  isFeatured: boolean;
  hasUrl: boolean;
  sortBy: "name" | "rating" | "clicks" | "created_at";
  sortOrder: "asc" | "desc";
}

export interface SearchResult {
  item: Tool;
  score: number;
  matches: string[];
}

export function useAdvancedSearch() {
  const toolsStore = useToolsStore();

  const searchQuery = ref("");
  const filters = ref<SearchFilters>({
    category: "",
    tags: [],
    rating: 0,
    isFeatured: false,
    hasUrl: false,
    sortBy: "name",
    sortOrder: "asc",
  });

  const searchHistory = ref<string[]>([]);
  const isSearching = ref(false);

  // 智能搜索算法
  const performSearch = (query: string, items: any[]): SearchResult[] => {
    if (!query.trim())
      return items.map((item) => ({ item, score: 1, matches: [] }));

    const searchTerms = query
      .toLowerCase()
      .split(/\s+/)
      .filter((term) => term.length > 0);
    const results: SearchResult[] = [];

    items.forEach((item) => {
      let score = 0;
      const matches: string[] = [];

      // 搜索字段权重
      const searchFields = [
        { field: "name", weight: 10 },
        { field: "description", weight: 5 },
        { field: "tags", weight: 3 },
        { field: "categories.name", weight: 2 },
      ];

      searchTerms.forEach((term) => {
        searchFields.forEach(({ field, weight }) => {
          const value = getNestedValue(item, field);
          if (value && searchInField(value, term)) {
            score += weight;
            if (!matches.includes(field)) {
              matches.push(field);
            }
          }
        });

        // 模糊匹配
        if (fuzzyMatch(item.name?.toLowerCase() || "", term)) {
          score += 2;
        }
      });

      // 特色工具加分
      if (item.is_featured) {
        score += 1;
      }

      // 工具暂无评分系统，跳过评分加分

      if (score > 0) {
        results.push({ item, score, matches });
      }
    });

    return results.sort((a, b) => b.score - a.score);
  };

  // 应用筛选器
  const applyFilters = (results: SearchResult[]): SearchResult[] => {
    return results.filter(({ item }) => {
      // 分类筛选
      if (
        filters.value.category &&
        item.category_id !== filters.value.category
      ) {
        return false;
      }

      // 标签筛选
      if (filters.value.tags.length > 0) {
        const itemTags = item.tags || [];
        const hasMatchingTag = filters.value.tags.some((tag) =>
          itemTags.some((itemTag: string) =>
            itemTag.toLowerCase().includes(tag.toLowerCase()),
          ),
        );
        if (!hasMatchingTag) return false;
      }

      // 工具暂无评分系统，跳过评分筛选

      // 特色工具筛选
      if (filters.value.isFeatured && !item.is_featured) {
        return false;
      }

      // URL可用性筛选
      if (filters.value.hasUrl && (!item.url || !item.url.trim())) {
        return false;
      }

      return true;
    });
  };

  // 排序结果
  const sortResults = (results: SearchResult[]): SearchResult[] => {
    return results.sort((a, b) => {
      const { sortBy, sortOrder } = filters.value;
      let comparison = 0;

      switch (sortBy) {
        case "name":
          comparison = (a.item.name || "").localeCompare(b.item.name || "");
          break;
        case "rating":
          // 工具暂无评分系统，使用点击数作为替代排序
          comparison = (a.item.click_count || 0) - (b.item.click_count || 0);
          break;
        case "clicks":
          comparison = (a.item.click_count || 0) - (b.item.click_count || 0);
          break;
        case "created_at":
          comparison =
            new Date(a.item.created_at || 0).getTime() -
            new Date(b.item.created_at || 0).getTime();
          break;
        default:
          comparison = b.score - a.score; // 默认按相关性排序
      }

      return sortOrder === "desc" ? -comparison : comparison;
    });
  };

  // 搜索结果
  const searchResults = computed(() => {
    if (!toolsStore.tools.length) return [];

    isSearching.value = true;

    try {
      let results = performSearch(searchQuery.value, toolsStore.tools);
      results = applyFilters(results);
      results = sortResults(results);

      return results;
    } finally {
      isSearching.value = false;
    }
  });

  // 搜索建议
  const searchSuggestions = computed(() => {
    if (!searchQuery.value.trim()) return [];

    const query = searchQuery.value.toLowerCase();
    const suggestions = new Set<string>();

    // 从工具名称中提取建议
    toolsStore.tools.forEach((tool) => {
      if (tool.name?.toLowerCase().includes(query)) {
        suggestions.add(tool.name);
      }

      // 从标签中提取建议
      if (tool.tags) {
        tool.tags.forEach((tag: string) => {
          if (tag.toLowerCase().includes(query)) {
            suggestions.add(tag);
          }
        });
      }
    });

    return Array.from(suggestions).slice(0, 5);
  });

  // 热门搜索词
  const popularSearches = computed(() => {
    const searches = searchHistory.value.reduce(
      (acc, search) => {
        acc[search] = (acc[search] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return Object.entries(searches)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([search]) => search);
  });

  // 执行搜索
  const search = (query: string) => {
    searchQuery.value = query;
    if (query.trim() && !searchHistory.value.includes(query)) {
      searchHistory.value.unshift(query);
      if (searchHistory.value.length > 50) {
        searchHistory.value = searchHistory.value.slice(0, 50);
      }
    }
  };

  // 清除搜索
  const clearSearch = () => {
    searchQuery.value = "";
  };

  // 重置筛选器
  const resetFilters = () => {
    filters.value = {
      category: "",
      tags: [],
      rating: 0,
      isFeatured: false,
      hasUrl: false,
      sortBy: "name",
      sortOrder: "asc",
    };
  };

  // 辅助函数
  const getNestedValue = (obj: any, path: string): any => {
    return path.split(".").reduce((current, key) => current?.[key], obj);
  };

  const searchInField = (value: any, term: string): boolean => {
    if (Array.isArray(value)) {
      return value.some(
        (item) => typeof item === "string" && item.toLowerCase().includes(term),
      );
    }
    return typeof value === "string" && value.toLowerCase().includes(term);
  };

  const fuzzyMatch = (text: string, pattern: string): boolean => {
    const patternLength = pattern.length;
    const textLength = text.length;

    if (patternLength > textLength) return false;
    if (patternLength === textLength) return pattern === text;

    let patternIndex = 0;
    for (
      let textIndex = 0;
      textIndex < textLength && patternIndex < patternLength;
      textIndex++
    ) {
      if (text[textIndex] === pattern[patternIndex]) {
        patternIndex++;
      }
    }

    return patternIndex === patternLength;
  };

  // 监听搜索查询变化已移除（未使用）

  return {
    searchQuery,
    filters,
    searchResults,
    searchSuggestions,
    popularSearches,
    searchHistory,
    isSearching,
    search,
    clearSearch,
    resetFilters,
  };
}
