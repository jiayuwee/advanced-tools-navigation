import { router } from "./router";
import { useAuthStore } from "./stores/auth";
import { useToolsStore } from "./stores/tools";
import type { NavigationGuardNext, RouteLocationNormalized } from "vue-router";

/**
 * 设置路由守卫
 */
export function setupRouterGuard() {
  // 全局前置守卫 - 优化性能
  router.beforeEach(
    async (
      to: RouteLocationNormalized,
      _from: RouteLocationNormalized,
      next: NavigationGuardNext,
    ) => {
      const authStore = useAuthStore();
      const toolsStore = useToolsStore();

      // 跳过不需要认证的公开页面，提升性能
      const publicPages = [
        "Home",
        "EnhancedHome",
        "Products",
        "ProductDetail",
        "NotFound",
      ];
      const isPublicPage = publicPages.includes(to.name as string);

      try {
        // 设置页面标题（同步操作，不影响性能）
        const title = to.meta.title as string;
        if (title) {
          document.title = `${title} - 工具导航站`;
        }

        // 如果是公开页面且不需要认证，直接通过
        if (isPublicPage && !to.meta.requiresAuth && !to.meta.requiresAdmin) {
          return next();
        }

        // 只有需要认证时才初始化认证状态
        if (to.meta.requiresAuth || to.meta.requiresAdmin) {
          await authStore.initialize();

          // 检查认证要求
          if (to.meta.requiresAuth && !authStore.isAuthenticated) {
            return next({
              name: "Login",
              query: { redirect: to.fullPath },
              replace: true,
            });
          }

          // 检查管理员权限
          if (to.meta.requiresAdmin && !authStore.isAdmin) {
            return next({ name: "Home", replace: true });
          }
        }

        // 初始化工具数据
        if (!toolsStore.initialized) {
          try {
            await toolsStore.initialize();
          } catch (error) {
            console.error("初始化工具数据失败:", error);
          }
        }

        next();
      } catch (error) {
        console.error("路由守卫错误:", error);
        // 错误时跳转到首页而不是阻塞
        next({ name: "Home", replace: true });
      }
    },
  );

  // 全局后置钩子
  router.afterEach(() => {
    // 可以在这里添加页面访问统计等逻辑
  });
}
