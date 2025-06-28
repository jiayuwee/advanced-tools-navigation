<template>
  <div v-if="showErrors" class="error-display">
    <div class="error-header">
      <h3>🐛 调试信息</h3>
      <button @click="toggleDisplay" class="toggle-btn">
        {{ expanded ? '收起' : '展开' }}
      </button>
    </div>
    
    <div v-if="expanded" class="error-content">
      <!-- Stores 状态 -->
      <div class="section">
        <h4>📦 Stores 状态</h4>
        <div class="status-item">
          <span class="label">Tools Store:</span>
          <span :class="toolsStatus.class">{{ toolsStatus.text }}</span>
        </div>
        <div class="status-item">
          <span class="label">Categories Store:</span>
          <span :class="categoriesStatus.class">{{ categoriesStatus.text }}</span>
        </div>
        <div class="status-item">
          <span class="label">Auth Store:</span>
          <span :class="authStatus.class">{{ authStatus.text }}</span>
        </div>
      </div>

      <!-- 数据统计 -->
      <div class="section">
        <h4>📊 数据统计</h4>
        <div class="status-item">
          <span class="label">工具数量:</span>
          <span>{{ toolsStore.tools.length }}</span>
        </div>
        <div class="status-item">
          <span class="label">分类数量:</span>
          <span>{{ categoriesStore.categories.length }}</span>
        </div>
      </div>

      <!-- 错误信息 -->
      <div v-if="hasErrors" class="section">
        <h4>❌ 错误信息</h4>
        <div v-if="toolsStore.error" class="error-item">
          <strong>Tools:</strong> {{ toolsStore.error }}
        </div>
        <div v-if="categoriesStore.error" class="error-item">
          <strong>Categories:</strong> {{ categoriesStore.error }}
        </div>
        <div v-if="authStore.error" class="error-item">
          <strong>Auth:</strong> {{ authStore.error }}
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="section">
        <h4>🔧 操作</h4>
        <button @click="refreshStores" class="action-btn">
          刷新所有数据
        </button>
        <button @click="clearErrors" class="action-btn">
          清除错误
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useToolsStore } from '@/stores/tools'
import { useCategoriesStore } from '@/stores/categories'
import { useAuthStore } from '@/stores/auth'

const toolsStore = useToolsStore()
const categoriesStore = useCategoriesStore()
const authStore = useAuthStore()

const expanded = ref(false)
const showErrors = ref(import.meta.env.DEV) // 只在开发模式显示

const toolsStatus = computed(() => {
  if (toolsStore.loading) return { text: '加载中...', class: 'status-loading' }
  if (toolsStore.error) return { text: '错误', class: 'status-error' }
  if (toolsStore.initialized) return { text: '正常', class: 'status-success' }
  return { text: '未初始化', class: 'status-warning' }
})

const categoriesStatus = computed(() => {
  if (categoriesStore.loading) return { text: '加载中...', class: 'status-loading' }
  if (categoriesStore.error) return { text: '错误', class: 'status-error' }
  if (categoriesStore.initialized) return { text: '正常', class: 'status-success' }
  return { text: '未初始化', class: 'status-warning' }
})

const authStatus = computed(() => {
  if (authStore.loading) return { text: '加载中...', class: 'status-loading' }
  if (authStore.error) return { text: '错误', class: 'status-error' }
  if (authStore.initialized) return { text: '正常', class: 'status-success' }
  return { text: '未初始化', class: 'status-warning' }
})

const hasErrors = computed(() => {
  return !!(toolsStore.error || categoriesStore.error || authStore.error)
})

const toggleDisplay = () => {
  expanded.value = !expanded.value
}

const refreshStores = async () => {
  try {
    await Promise.all([
      toolsStore.initialize(),
      categoriesStore.initialize(),
      authStore.initialize()
    ])
  } catch (error) {
    console.error('刷新失败:', error)
  }
}

const clearErrors = () => {
  toolsStore.clearError?.()
  categoriesStore.clearError?.()
  authStore.clearError?.()
}

onMounted(() => {
  // 如果有错误，自动展开
  if (hasErrors.value) {
    expanded.value = true
  }
})
</script>

<style scoped>
.error-display {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  z-index: 9999;
}

.error-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.error-header h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
}

.toggle-btn {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
}

.error-content {
  padding: 16px;
  max-height: 400px;
  overflow-y: auto;
}

.section {
  margin-bottom: 16px;
}

.section h4 {
  margin: 0 0 8px 0;
  font-size: 12px;
  font-weight: 600;
  color: #374151;
}

.status-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
  font-size: 12px;
}

.label {
  color: #6b7280;
}

.status-success { color: #059669; }
.status-error { color: #dc2626; }
.status-warning { color: #d97706; }
.status-loading { color: #3b82f6; }

.error-item {
  background: #fef2f2;
  border: 1px solid #fecaca;
  padding: 8px;
  border-radius: 4px;
  margin-bottom: 8px;
  font-size: 12px;
  color: #dc2626;
}

.action-btn {
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  margin-right: 8px;
  margin-bottom: 8px;
}

.action-btn:hover {
  background: #e5e7eb;
}
</style>
