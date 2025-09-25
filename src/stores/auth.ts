import { ref, computed } from "vue";
import { defineStore } from "pinia";
import { supabase } from "@/lib/supabaseClient";
import type { User as SupabaseUser, AuthError } from "@supabase/supabase-js";

/**
 * 扩展的用户信息类型，
 * 结合了 Supabase Auth User 和我们自定义的 user_profiles 表数据。
 */
export type UserProfile = SupabaseUser & {
  username: string;
  avatar_url: string;
  role: "user" | "admin" | "super_admin";
};

export const useAuthStore = defineStore("auth", () => {
  // --- State (状态) ---
  const user = ref<UserProfile | null>(null);
  const loading = ref(false);
  const initialized = ref(false); // 标记是否已完成首次认证状态检查
  const error = ref<AuthError | null>(null);

  // --- Getters (计算属性) ---

  /**
   * 用户是否已登录。
   */
  const isAuthenticated = computed(() => !!user.value);

  /**
   * 用户是否为管理员。
   * 这在 AppHeader.vue 中用于显示“管理后台”链接。
   */
  const isAdmin = computed(() => {
    return user.value?.role === "admin" || user.value?.role === "super_admin";
  });

  // --- Actions (操作) ---

  /**
   * 从 user_profiles 表中获取用户的详细信息。
   * @param userId - Supabase 用户的 ID。
   */
  async function fetchUserProfile(userId: string): Promise<{ id: string; username?: string | null; avatar_url?: string | null; role?: string | null } | null> {
    const { data, error: profileError } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (profileError) {
      console.error(
        `获取用户资料失败 (用户ID: ${userId}):`,
        profileError.message,
      );
      // 将错误信息暴露出来，以便其他地方可以捕获
      error.value = {
        name: "ProfileFetchError",
        message: `无法加载用户资料: ${profileError.message}`,
      } as AuthError;
      return null;
    }
    return data;
  }

  /**
   * 初始化认证 Store。
   * 这是 Store 最核心的方法，它会监听 Supabase 的认证状态变化。
   * 应该在应用启动时调用一次。
   */
  function initialize() {
    if (initialized.value) return;

    loading.value = true;

    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const profile = await fetchUserProfile(session.user.id);
        if (profile) {
          // 组合 Supabase Auth User 和 user_profiles 数据
          user.value = {
            ...session.user,
            username: profile.username || "未设置用户名",
            avatar_url: profile.avatar_url || "",
            role: profile.role || "user",
          };
        } else {
          // 如果没有 profile，也设置基础 user 信息，避免应用卡死
          user.value = {
            ...session.user,
            username: session.user.email || "新用户",
            avatar_url: "",
            role: "user",
          };
        }
      } else {
        user.value = null;
      }
      // 标记为已初始化，无论成功与否
      initialized.value = true;
      loading.value = false;
    });
  }

  /**
   * 用户登出。
   * 由 AppHeader.vue 调用。
   */
  async function logout() {
    loading.value = true;
    error.value = null;
    try {
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) throw signOutError;
      // onAuthStateChange 会自动将 user.value 设置为 null
    } catch (e) {
      const err = e as AuthError;
      error.value = err;
      console.error("退出登录失败:", err);
    } finally {
      loading.value = false;
    }
  }

  /**
   * 清除错误状态。
   * 由 ErrorDisplay.vue 调用。
   */
  function clearError() {
    error.value = null;
  }

  // --- Return (导出) ---
  return {
    // State
    user,
    loading,
    initialized,
    error,
    // Getters
    isAuthenticated,
    isAdmin,
    // Actions
    initialize,
    logout,
    clearError,
    // 可以根据需要添加 login, register, etc.
  };
});
