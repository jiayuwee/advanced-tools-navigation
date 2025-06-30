<template>
  <div class="test-page">
    <div class="header">
      <h1>🚀 状态栏测试页面</h1>
      <p>这是一个独立的测试页面，不依赖 Supabase</p>
    </div>
    
    <div class="content">
      <div class="test-section">
        <h2>测试信息</h2>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">当前时间:</span>
            <span class="value">{{ currentTime }}</span>
          </div>
          <div class="info-item">
            <span class="label">页面高度:</span>
            <span class="value">{{ pageHeight }}px</span>
          </div>
          <div class="info-item">
            <span class="label">视口高度:</span>
            <span class="value">{{ viewportHeight }}px</span>
          </div>
          <div class="info-item">
            <span class="label">滚动位置:</span>
            <span class="value">{{ scrollY }}px</span>
          </div>
        </div>
      </div>
      
      <div class="test-section">
        <h2>状态栏检查</h2>
        <div class="check-results">
          <div class="check-item" :class="{ success: statusBarExists, error: !statusBarExists }">
            <span class="check-label">状态栏元素存在:</span>
            <span class="check-value">{{ statusBarExists ? '✅ 是' : '❌ 否' }}</span>
          </div>
          <div v-if="statusBarExists" class="check-item success">
            <span class="check-label">状态栏位置:</span>
            <span class="check-value">{{ statusBarPosition }}</span>
          </div>
        </div>
        
        <button @click="checkStatusBar" class="check-btn">重新检查状态栏</button>
      </div>
      
      <div class="spacer"></div>
      
      <div class="bottom-section">
        <h2>底部区域</h2>
        <p>状态栏应该显示在这个区域下方</p>
        <p>如果您看到红色状态栏，说明功能正常！</p>
      </div>
    </div>
    
    <!-- 独立的状态栏组件 -->
    <div class="standalone-status-bar">
      <div class="status-content">
        <span>🚀 状态栏测试</span>
        <span>{{ currentTime }}</span>
        <span>如果您看到这个红色条，说明状态栏正常工作！</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const currentTime = ref('')
const pageHeight = ref(0)
const viewportHeight = ref(0)
const scrollY = ref(0)
const statusBarExists = ref(false)
const statusBarPosition = ref('')

const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('zh-CN', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const updateMetrics = () => {
  pageHeight.value = document.documentElement.scrollHeight
  viewportHeight.value = window.innerHeight
  scrollY.value = window.scrollY
}

const checkStatusBar = () => {
  const statusBar = document.querySelector('.standalone-status-bar')
  statusBarExists.value = !!statusBar
  
  if (statusBar) {
    const rect = statusBar.getBoundingClientRect()
    statusBarPosition.value = `top: ${rect.top}px, bottom: ${rect.bottom}px`
    console.log('状态栏检查结果:', {
      exists: true,
      rect,
      styles: window.getComputedStyle(statusBar)
    })
  } else {
    console.log('状态栏检查结果: 未找到状态栏元素')
  }
}

let timeInterval: NodeJS.Timeout | null = null

onMounted(() => {
  updateTime()
  updateMetrics()
  checkStatusBar()
  
  timeInterval = setInterval(updateTime, 1000)
  
  window.addEventListener('scroll', updateMetrics)
  window.addEventListener('resize', updateMetrics)
  
  console.log('🔍 StatusBarTestView 已挂载')
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
  
  window.removeEventListener('scroll', updateMetrics)
  window.removeEventListener('resize', updateMetrics)
})
</script>

<style scoped>
.test-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  padding-bottom: 80px; /* 为状态栏留出空间 */
}

.header {
  text-align: center;
  margin-bottom: 40px;
}

.header h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.header p {
  font-size: 1.1rem;
  opacity: 0.9;
}

.content {
  max-width: 800px;
  margin: 0 auto;
}

.test-section {
  background: rgba(255, 255, 255, 0.1);
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.test-section h2 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.label {
  font-weight: 500;
}

.value {
  font-family: 'Courier New', monospace;
  color: #ffd700;
}

.check-results {
  margin-bottom: 20px;
}

.check-item {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 4px;
}

.check-item.success {
  background: rgba(76, 175, 80, 0.2);
  border: 1px solid rgba(76, 175, 80, 0.5);
}

.check-item.error {
  background: rgba(244, 67, 54, 0.2);
  border: 1px solid rgba(244, 67, 54, 0.5);
}

.check-btn {
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  color: white;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.check-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.spacer {
  height: 100vh;
}

.bottom-section {
  background: rgba(255, 255, 255, 0.2);
  padding: 40px;
  border-radius: 8px;
  text-align: center;
}

/* 独立状态栏样式 */
.standalone-status-bar {
  position: fixed !important;
  bottom: 0 !important;
  left: 0 !important;
  right: 0 !important;
  width: 100% !important;
  height: 50px !important;
  background: #ff0000 !important;
  color: white !important;
  z-index: 999999 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  font-size: 14px !important;
  font-weight: bold !important;
  box-shadow: 0 -5px 20px rgba(0, 0, 0, 0.8) !important;
  border-top: 3px solid #ffffff !important;
}

.status-content {
  display: flex !important;
  align-items: center !important;
  gap: 20px !important;
  padding: 0 20px !important;
  flex-wrap: wrap !important;
  justify-content: center !important;
}

@media (max-width: 768px) {
  .status-content {
    gap: 10px !important;
    font-size: 12px !important;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
