import { ref } from "vue";
import { defineStore } from "pinia";
import { supabase } from "@/lib/supabaseClient"; // Supabase 客户端的路径
import type { Database } from "@/types/database"; // Supabase 自动生成的类型路径

// 从生成的类型中定义 Category 类型
type Category = Database["public"]["Tables"]["categories"]["Row"];

export const useCategoriesStore = defineStore("categories", () => {
  // --- State (状态) ---
  const categories = ref<Category[]>([]);
  const loading = ref(false);
  const error = ref<Error | null>(null);
  // 用于跟踪数据是否已至少成功获取过一次，避免不必要的重复请求
  const initialized = ref(false);

  // --- Actions (操作) ---

  /**
   * 从 Supabase 数据库获取分类数据。
   * 这是核心的数据获取逻辑。
   */
  async function fetchCategories() {
    // 如果正在加载中，则不执行任何操作，防止重复调用
    if (loading.value) return;

    loading.value = true;
    error.value = null;
    try {
      const { data, error: queryError } = await supabase
        .from("categories")
        .select("*")
        .eq("is_active", true) // 通常只获取激活的分类
        .order("sort_order", { ascending: true }); // 按 sort_order 字段排序

      if (queryError) {
        throw queryError;
      }

      categories.value = data || [];
      initialized.value = true; // 成功获取后，标记为已初始化
    } catch (e: any) {
      console.error("获取分类失败:", e);
      error.value = e;
      // 在后续调用失败时，保留已有的数据，而不是清空
    } finally {
      loading.value = false;
    }
  }

  /**
   * 初始化 Store。
   * 这是一个安全的调用方法，它会检查数据是否已初始化，只有在未初始化时才执行获取操作。
   * 你的调试组件 `ErrorDisplay.vue` 正是使用了这个方法。
   */
  async function initialize() {
    if (!initialized.value) {
      await fetchCategories();
    }
  }

  /**
   * 清除错误状态。
   * 这允许用户在出错后可以重试操作。
   */
  function clearError() {
    error.value = null;
  }

  /**
   * 加载分类数据（fetchCategories 的别名，为了向后兼容）。
   */
  async function loadCategories() {
    await fetchCategories();
  }

  // --- Return (导出) ---
  // 所有需要被外部组件访问的状态、Getter 和操作都必须在这里返回。
  // 这是最容易出现 "is not a function" 错误的地方。
  return {
    // State
    categories,
    loading,
    error,
    initialized,

    // Actions
    fetchCategories, // 确保这个函数被导出，解决你遇到的问题
    loadCategories, // 向后兼容的别名
    initialize, // 确保调试组件能正常工作
    clearError,
  };
});
