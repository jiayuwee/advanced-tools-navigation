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
      // 检查环境变量是否已配置
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (
        !supabaseUrl ||
        !supabaseAnonKey ||
        supabaseUrl.includes("your-project-ref") ||
        supabaseAnonKey.includes("your-anon-key")
      ) {
        // 如果是生产环境，不要静默回退到模拟数据，尽早报错以便运维修复
        if (import.meta.env.PROD) {
          console.error(
            "Supabase 环境变量未配置（生产），请在 CI/部署环境中设置 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY",
          );
          error.value = new Error("Supabase 未配置（生产环境）");
          initialized.value = true;
          loading.value = false;
          return;
        }

        // 开发环境下仍然使用模拟数据以方便本地调试
        console.warn("Supabase 环境变量未配置，使用模拟分类数据");
        categories.value = [
          {
            id: "1",
            name: "开发工具",
            description: "编程开发相关工具",
            icon: "💻",
            color: "#3b82f6",
            parent_id: null,
            sort_order: 1,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: "2",
            name: "设计工具",
            description: "UI/UX设计工具",
            icon: "🎨",
            color: "#ef4444",
            parent_id: null,
            sort_order: 2,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: "550e8400-e29b-41d4-a716-446655440003",
            name: "办公工具",
            description: "办公和生产力工具",
            icon: "📊",
            color: "#388e3c",
            parent_id: null,
            sort_order: 3,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: "550e8400-e29b-41d4-a716-446655440004",
            name: "学习工具",
            description: "学习和教育相关的工具",
            icon: "📚",
            color: "#f57c00",
            parent_id: null,
            sort_order: 4,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: "550e8400-e29b-41d4-a716-446655440005",
            name: "网络工具",
            description: "网络服务和云平台",
            icon: "🌐",
            color: "#2196f3",
            parent_id: null,
            sort_order: 5,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: "550e8400-e29b-41d4-a716-446655440006",
            name: "娱乐工具",
            description: "娱乐和休闲工具",
            icon: "🎮",
            color: "#e91e63",
            parent_id: null,
            sort_order: 6,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: "550e8400-e29b-41d4-a716-446655440007",
            name: "实用工具",
            description: "日常实用工具",
            icon: "🔧",
            color: "#607d8b",
            parent_id: null,
            sort_order: 7,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ];
        initialized.value = true;
        return;
      }

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
    } catch (err: unknown) {
      const message = safeErrorMessage(err);
      console.error("获取分类失败:", message);
      error.value = new Error(message);

      // 如果Supabase调用失败，回退到模拟数据
      if (categories.value.length === 0) {
        console.warn("Supabase调用失败，使用模拟分类数据");
        categories.value = [
          {
            id: "1",
            name: "开发工具",
            description: "编程开发相关工具",
            icon: "💻",
            color: "#3b82f6",
            parent_id: null,
            sort_order: 1,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: "2",
            name: "设计工具",
            description: "UI/UX设计工具",
            icon: "🎨",
            color: "#ef4444",
            parent_id: null,
            sort_order: 2,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: "550e8400-e29b-41d4-a716-446655440003",
            name: "办公工具",
            description: "办公和生产力工具",
            icon: "📊",
            color: "#388e3c",
            parent_id: null,
            sort_order: 3,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: "550e8400-e29b-41d4-a716-446655440004",
            name: "学习工具",
            description: "学习和教育相关的工具",
            icon: "📚",
            color: "#f57c00",
            parent_id: null,
            sort_order: 4,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ];
        initialized.value = true;
        error.value = null; // 清除错误，因为我们有了后备数据
      }
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

// 从 unknown 错误对象安全提取字符串信息（与 tools.ts 中的实现一致）
function safeErrorMessage(err: unknown): string {
  if (!err) return "未知错误";
  if (typeof err === "string") return err;
  if (err instanceof Error) return err.message;
  try {
    return JSON.stringify(err as Record<string, unknown>);
  } catch {
    return String(err);
  }
}
