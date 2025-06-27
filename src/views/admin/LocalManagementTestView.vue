<template>
  <div class="local-management-test">
    <div class="test-header">
      <h2>本地管理功能测试</h2>
      <button class="btn primary" @click="runAllTests">运行所有测试</button>
    </div>

    <div class="test-results">
      <div class="test-summary">
        <div class="summary-item">
          <span class="label">总测试数:</span>
          <span class="value">{{ totalTests }}</span>
        </div>
        <div class="summary-item">
          <span class="label">通过:</span>
          <span class="value success">{{ passedTests }}</span>
        </div>
        <div class="summary-item">
          <span class="label">失败:</span>
          <span class="value error">{{ failedTests }}</span>
        </div>
      </div>

      <div class="test-list">
        <div 
          v-for="test in testResults" 
          :key="test.name"
          class="test-item"
          :class="{ 
            success: test.status === 'passed', 
            error: test.status === 'failed',
            running: test.status === 'running'
          }"
        >
          <div class="test-info">
            <div class="test-name">{{ test.name }}</div>
            <div class="test-description">{{ test.description }}</div>
          </div>
          <div class="test-status">
            <CheckCircleIcon v-if="test.status === 'passed'" class="icon success" />
            <XCircleIcon v-else-if="test.status === 'failed'" class="icon error" />
            <LoaderIcon v-else-if="test.status === 'running'" class="icon spinning" />
            <CircleIcon v-else class="icon pending" />
          </div>
          <div v-if="test.error" class="test-error">
            {{ test.error }}
          </div>
        </div>
      </div>
    </div>

    <div class="test-actions">
      <button class="btn secondary" @click="clearTestData">清空测试数据</button>
      <button class="btn secondary" @click="generateTestData">生成测试数据</button>
      <button class="btn secondary" @click="exportTestResults">导出测试结果</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useLocalManagementStore } from '../../stores/localManagement'
import { LocalStorageService } from '../../services/localStorageService'
import {
  CheckCircleIcon,
  XCircleIcon,
  LoaderIcon,
  CircleIcon
} from 'lucide-vue-next'

interface TestResult {
  name: string
  description: string
  status: 'pending' | 'running' | 'passed' | 'failed'
  error?: string
  duration?: number
}

const localStore = useLocalManagementStore()
const testResults = ref<TestResult[]>([])
const isRunning = ref(false)

// 计算属性
const totalTests = computed(() => testResults.value.length)
const passedTests = computed(() => testResults.value.filter(t => t.status === 'passed').length)
const failedTests = computed(() => testResults.value.filter(t => t.status === 'failed').length)

// 测试用例定义
const testCases = [
  {
    name: '本地存储服务初始化',
    description: '测试本地存储服务是否正确初始化',
    test: async () => {
      const preferences = LocalStorageService.getUserPreferences()
      if (!preferences || typeof preferences !== 'object') {
        throw new Error('用户偏好设置初始化失败')
      }
      return true
    }
  },
  {
    name: '添加本地工具',
    description: '测试添加本地工具功能',
    test: async () => {
      const testTool = {
        name: '测试工具',
        description: '这是一个测试工具',
        url: 'https://test.com',
        icon: '🧪',
        categoryId: 'test-category',
        tags: ['test'],
        isFeatured: false,
        clickCount: 0
      }
      
      const result = localStore.addLocalTool(testTool)
      if (!result || !result.localId) {
        throw new Error('添加本地工具失败')
      }
      return true
    }
  },
  {
    name: '更新本地工具',
    description: '测试更新本地工具功能',
    test: async () => {
      const tools = LocalStorageService.getLocalTools()
      if (tools.length === 0) {
        throw new Error('没有可更新的工具')
      }
      
      const tool = tools[0]
      const success = localStore.updateLocalTool(tool.id || tool.localId!, {
        name: '更新后的工具名称'
      })
      
      if (!success) {
        throw new Error('更新本地工具失败')
      }
      return true
    }
  },
  {
    name: '删除本地工具',
    description: '测试删除本地工具功能',
    test: async () => {
      const tools = LocalStorageService.getLocalTools()
      if (tools.length === 0) {
        throw new Error('没有可删除的工具')
      }
      
      const tool = tools[0]
      const success = localStore.deleteLocalTool(tool.id || tool.localId!)
      
      if (!success) {
        throw new Error('删除本地工具失败')
      }
      return true
    }
  },
  {
    name: '用户偏好设置',
    description: '测试用户偏好设置的保存和读取',
    test: async () => {
      const originalPrefs = LocalStorageService.getUserPreferences()
      
      localStore.updateUserPreferences({
        theme: 'dark',
        autoSync: false
      })
      
      const updatedPrefs = LocalStorageService.getUserPreferences()
      
      if (updatedPrefs.theme !== 'dark' || updatedPrefs.autoSync !== false) {
        throw new Error('用户偏好设置更新失败')
      }
      
      // 恢复原始设置
      localStore.updateUserPreferences(originalPrefs)
      return true
    }
  },
  {
    name: '离线队列管理',
    description: '测试离线操作队列的管理',
    test: async () => {
      const initialQueue = LocalStorageService.getOfflineQueue()
      const initialCount = initialQueue.length
      
      // 添加一个测试工具（会自动添加到离线队列）
      localStore.addLocalTool({
        name: '队列测试工具',
        description: '测试离线队列',
        url: 'https://queue-test.com',
        icon: '📋',
        categoryId: 'test',
        tags: [],
        isFeatured: false,
        clickCount: 0
      })
      
      const newQueue = LocalStorageService.getOfflineQueue()
      
      if (newQueue.length <= initialCount) {
        throw new Error('离线队列未正确更新')
      }
      return true
    }
  },
  {
    name: '存储使用情况',
    description: '测试存储使用情况的计算',
    test: async () => {
      const storageInfo = LocalStorageService.getStorageInfo()
      
      if (!storageInfo || typeof storageInfo.used !== 'number' || typeof storageInfo.total !== 'number') {
        throw new Error('存储使用情况计算失败')
      }
      
      if (storageInfo.percentage < 0 || storageInfo.percentage > 100) {
        throw new Error('存储使用百分比计算错误')
      }
      return true
    }
  },
  {
    name: '数据导出功能',
    description: '测试本地数据导出功能',
    test: async () => {
      try {
        // 模拟导出（不实际下载文件）
        const data = {
          tools: LocalStorageService.getLocalTools(),
          categories: LocalStorageService.getLocalCategories(),
          preferences: LocalStorageService.getUserPreferences(),
          exportTime: new Date().toISOString()
        }
        
        const jsonString = JSON.stringify(data, null, 2)
        
        if (!jsonString || jsonString.length < 10) {
          throw new Error('导出数据为空或格式错误')
        }
        return true
      } catch (error) {
        throw new Error(`数据导出失败: ${error}`)
      }
    }
  }
]

// 方法
const initializeTests = () => {
  testResults.value = testCases.map(testCase => ({
    name: testCase.name,
    description: testCase.description,
    status: 'pending' as const
  }))
}

const runAllTests = async () => {
  if (isRunning.value) return
  
  isRunning.value = true
  
  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i]
    const testResult = testResults.value[i]
    
    testResult.status = 'running'
    testResult.error = undefined
    
    const startTime = Date.now()
    
    try {
      await testCase.test()
      testResult.status = 'passed'
      testResult.duration = Date.now() - startTime
    } catch (error) {
      testResult.status = 'failed'
      testResult.error = error instanceof Error ? error.message : String(error)
      testResult.duration = Date.now() - startTime
    }
    
    // 添加小延迟以便观察测试进度
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  
  isRunning.value = false
}

const clearTestData = () => {
  if (confirm('确定要清空所有测试数据吗？')) {
    LocalStorageService.clearAllLocalData()
    localStore.initialize()
    alert('测试数据已清空')
  }
}

const generateTestData = () => {
  // 生成一些测试数据
  for (let i = 1; i <= 3; i++) {
    localStore.addLocalTool({
      name: `测试工具 ${i}`,
      description: `这是第 ${i} 个测试工具`,
      url: `https://test-tool-${i}.com`,
      icon: '🔧',
      categoryId: 'test-category',
      tags: ['test', `tool${i}`],
      isFeatured: i === 1,
      clickCount: Math.floor(Math.random() * 100)
    })
  }
  
  alert('测试数据已生成')
}

const exportTestResults = () => {
  const results = {
    summary: {
      total: totalTests.value,
      passed: passedTests.value,
      failed: failedTests.value,
      timestamp: new Date().toISOString()
    },
    tests: testResults.value
  }
  
  const blob = new Blob([JSON.stringify(results, null, 2)], { 
    type: 'application/json' 
  })
  
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `test-results-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// 生命周期
onMounted(() => {
  initializeTests()
})
</script>

<style scoped>
.local-management-test {
  padding: 24px;
  max-width: 800px;
  margin: 0 auto;
}

.test-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.test-header h2 {
  font-size: 24px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.test-summary {
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.summary-item .label {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
}

.summary-item .value {
  font-size: 18px;
  font-weight: 600;
}

.value.success {
  color: #059669;
}

.value.error {
  color: #dc2626;
}

.test-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.test-item {
  display: flex;
  align-items: center;
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  transition: all 0.2s;
}

.test-item.success {
  border-color: #10b981;
  background: #ecfdf5;
}

.test-item.error {
  border-color: #ef4444;
  background: #fef2f2;
}

.test-item.running {
  border-color: #3b82f6;
  background: #eff6ff;
}

.test-info {
  flex: 1;
}

.test-name {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 4px;
}

.test-description {
  font-size: 12px;
  color: #6b7280;
}

.test-status {
  margin-left: 16px;
}

.test-status .icon {
  width: 20px;
  height: 20px;
}

.icon.success {
  color: #10b981;
}

.icon.error {
  color: #ef4444;
}

.icon.pending {
  color: #9ca3af;
}

.icon.spinning {
  color: #3b82f6;
  animation: spin 1s linear infinite;
}

.test-error {
  width: 100%;
  margin-top: 8px;
  padding: 8px;
  background: #fee2e2;
  color: #991b1b;
  border-radius: 4px;
  font-size: 12px;
}

.test-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn.primary {
  background: #3b82f6;
  color: white;
}

.btn.primary:hover {
  background: #2563eb;
}

.btn.secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn.secondary:hover {
  background: #e5e7eb;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
