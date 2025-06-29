import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import { router } from './router' // 假设路由文件在 src/router/index.ts
import './style.css' // 假设这是你的全局样式文件

// 导入所有需要初始化的 stores
import { useAuthStore } from '@/stores/auth'
import { useCategoriesStore } from '@/stores/categories'
import { useToolsStore } from '@/stores/tools'

/**
 * 异步初始化所有 Pinia stores。
 * 这个函数会在 Vue 应用挂载前执行。
 */
async function initializeCoreStores() {
  console.log('🚀 Initializing core stores...')

  // 必须在 Pinia 实例被 app 使用后，才能获取 store 实例
  const authStore = useAuthStore()
  const categoriesStore = useCategoriesStore()
  const toolsStore = useToolsStore()

  try {
    // 使用 Promise.all 并发执行所有 stores 的初始化，提升启动性能。
    // 任何一个 store 初始化失败都会进入 catch 块。
    await Promise.all([
      authStore.initialize(),
      categoriesStore.initialize(),
      toolsStore.initialize(),
    ])
    console.log('✅ Core stores initialized successfully.')
  } catch (error) {
    console.error('❌ Failed to initialize one or more stores:', error)
    // 在这里可以添加全局错误处理逻辑，例如向用户显示一个无法加载应用的提示。
  }
}

// --- Vue 应用启动流程 ---
const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// 先执行异步初始化，完成后再挂载 Vue 应用
initializeCoreStores().then(() => {
  app.mount('#app')
})