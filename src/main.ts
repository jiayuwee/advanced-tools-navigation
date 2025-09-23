import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import { router } from "./router"; // 假设路由文件在 src/router/index.ts
import "./style.css"; // 假设这是你的全局样式文件

// 导入所有需要初始化的 stores
import { useAuthStore } from "@/stores/auth";
import { useCategoriesStore } from "@/stores/categories";
import { useToolsStore } from "@/stores/tools";

// 导入简化的主题系统
import { useSimpleTheme } from "@/composables/useSimpleTheme";

/**
 * 异步初始化所有 Pinia stores 和主题系统。
 * 这个函数会在 Vue 应用挂载前执行。
 */
async function initializeCoreStores() {
  console.log("🚀 Initializing core stores and theme system...");

  try {
    // 必须在 Pinia 实例被 app 使用后，才能获取 store 实例
    const authStore = useAuthStore();
    const categoriesStore = useCategoriesStore();
    const toolsStore = useToolsStore();

    // 使用 Promise.all 并发执行所有 stores 的初始化，提升启动性能。
    // 任何一个 store 初始化失败都会进入 catch 块。
    await Promise.all([
      authStore.initialize(),
      categoriesStore.initialize(),
      toolsStore.initialize(),
    ]);

    // 初始化主题系统
    const { applyTheme } = useSimpleTheme();
    applyTheme();

    console.log("✅ Core stores and theme system initialized successfully.");
    return true;
  } catch (error) {
    console.error("❌ Failed to initialize one or more stores:", error);

    // 显示用户友好的错误信息
    const app = document.getElementById("app");
    if (app) {
      app.innerHTML = `
        <div style="
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          padding: 20px;
          font-family: system-ui, -apple-system, sans-serif;
          text-align: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        ">
          <h2 style="margin-bottom: 16px;">🚨 应用初始化失败</h2>
          <p style="margin-bottom: 24px; opacity: 0.9;">抱歉，应用加载时遇到问题。请尝试以下解决方案：</p>
          <div style="margin-bottom: 24px;">
            <button onclick="location.reload()" style="
              padding: 12px 24px;
              margin: 8px;
              border: none;
              border-radius: 8px;
              background: rgba(255,255,255,0.2);
              color: white;
              cursor: pointer;
              font-size: 16px;
              transition: background 0.3s;
            " onmouseover="this.style.background='rgba(255,255,255,0.3)'" onmouseout="this.style.background='rgba(255,255,255,0.2)'">
              🔄 刷新页面
            </button>
            <button onclick="localStorage.clear(); location.reload()" style="
              padding: 12px 24px;
              margin: 8px;
              border: none;
              border-radius: 8px;
              background: rgba(255,255,255,0.2);
              color: white;
              cursor: pointer;
              font-size: 16px;
              transition: background 0.3s;
            " onmouseover="this.style.background='rgba(255,255,255,0.3)'" onmouseout="this.style.background='rgba(255,255,255,0.2)'">
              🗑️ 清除缓存并刷新
            </button>
          </div>
          <details style="margin-top: 16px; text-align: left; max-width: 600px;">
            <summary style="cursor: pointer; opacity: 0.8;">🔍 技术详情</summary>
            <pre style="
              margin-top: 8px;
              padding: 16px;
              background: rgba(0,0,0,0.3);
              border-radius: 8px;
              overflow: auto;
              font-size: 12px;
              text-align: left;
            ">${error}</pre>
          </details>
        </div>
      `;
    }

    return false;
  }
}

// --- Vue 应用启动流程 ---
const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

// 先执行异步初始化，成功后才挂载 Vue 应用
initializeCoreStores()
  .then((success) => {
    if (success) {
      app.mount("#app");
      console.log("✅ Vue 应用挂载成功");
    } else {
      console.error("❌ Vue 应用挂载失败 - Store 初始化错误");
    }
  })
  .catch((error) => {
    console.error("❌ Vue 应用启动失败:", error);
  });
