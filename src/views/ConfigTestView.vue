<template>
  <div class="config-test-page">
    <div class="container">
      <h1>🔧 配置测试页面</h1>
      <p class="subtitle">检查环境变量和配置是否正确</p>
      
      <div class="test-sections">
        <!-- 环境变量检查 -->
        <div class="test-section">
          <h2>📋 环境变量检查</h2>
          <div class="config-grid">
            <div class="config-item" :class="{ success: supabaseUrl, error: !supabaseUrl }">
              <span class="label">VITE_SUPABASE_URL:</span>
              <span class="value">{{ supabaseUrl || '❌ 未设置' }}</span>
            </div>
            <div class="config-item" :class="{ success: supabaseAnonKey, error: !supabaseAnonKey }">
              <span class="label">VITE_SUPABASE_ANON_KEY:</span>
              <span class="value">{{ supabaseAnonKey ? '✅ 已设置' : '❌ 未设置' }}</span>
            </div>
            <div class="config-item">
              <span class="label">NODE_ENV:</span>
              <span class="value">{{ nodeEnv }}</span>
            </div>
            <div class="config-item">
              <span class="label">MODE:</span>
              <span class="value">{{ mode }}</span>
            </div>
          </div>
        </div>
        
        <!-- Supabase 连接测试 -->
        <div class="test-section">
          <h2>🔗 Supabase 连接测试</h2>
          <div class="connection-status">
            <div class="status-item" :class="connectionStatus.class">
              <span class="status-icon">{{ connectionStatus.icon }}</span>
              <span class="status-text">{{ connectionStatus.text }}</span>
            </div>
            <button @click="testConnection" class="test-btn" :disabled="testing">
              {{ testing ? '测试中...' : '重新测试连接' }}
            </button>
          </div>
          
          <div v-if="connectionError" class="error-details">
            <h3>错误详情:</h3>
            <pre>{{ connectionError }}</pre>
          </div>
        </div>
        
        <!-- 系统信息 -->
        <div class="test-section">
          <h2>ℹ️ 系统信息</h2>
          <div class="info-grid">
            <div class="info-item">
              <span class="label">当前时间:</span>
              <span class="value">{{ currentTime }}</span>
            </div>
            <div class="info-item">
              <span class="label">用户代理:</span>
              <span class="value">{{ userAgent }}</span>
            </div>
            <div class="info-item">
              <span class="label">页面URL:</span>
              <span class="value">{{ currentUrl }}</span>
            </div>
          </div>
        </div>
        
        <!-- 状态栏测试 -->
        <div class="test-section">
          <h2>📊 状态栏测试</h2>
          <div class="statusbar-test">
            <p>如果配置正确，您应该能在页面底部看到状态栏。</p>
            <button @click="scrollToBottom" class="scroll-btn">滚动到底部查看状态栏</button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 测试状态栏 -->
    <div class="test-status-bar">
      <span>🧪 配置测试状态栏</span>
      <span>{{ currentTime }}</span>
      <span>{{ connectionStatus.text }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

// 环境变量
const supabaseUrl = ref(import.meta.env.VITE_SUPABASE_URL)
const supabaseAnonKey = ref(import.meta.env.VITE_SUPABASE_ANON_KEY)
const nodeEnv = ref(import.meta.env.NODE_ENV)
const mode = ref(import.meta.env.MODE)

// 系统信息
const currentTime = ref('')
const userAgent = ref(navigator.userAgent)
const currentUrl = ref(window.location.href)

// 连接状态
const testing = ref(false)
const connectionStatus = ref({
  class: 'unknown',
  icon: '⏳',
  text: '未测试'
})
const connectionError = ref('')

const updateTime = () => {
  currentTime.value = new Date().toLocaleString('zh-CN')
}

const testConnection = async () => {
  testing.value = true
  connectionError.value = ''
  
  try {
    if (!supabaseUrl.value || !supabaseAnonKey.value) {
      throw new Error('环境变量未配置')
    }
    
    // 简单的连接测试
    const response = await fetch(`${supabaseUrl.value}/rest/v1/`, {
      headers: {
        'apikey': supabaseAnonKey.value,
        'Authorization': `Bearer ${supabaseAnonKey.value}`
      }
    })
    
    if (response.ok) {
      connectionStatus.value = {
        class: 'success',
        icon: '✅',
        text: 'Supabase 连接成功'
      }
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
  } catch (error) {
    connectionStatus.value = {
      class: 'error',
      icon: '❌',
      text: 'Supabase 连接失败'
    }
    connectionError.value = error instanceof Error ? error.message : String(error)
  } finally {
    testing.value = false
  }
}

const scrollToBottom = () => {
  window.scrollTo({
    top: document.documentElement.scrollHeight,
    behavior: 'smooth'
  })
}

let timeInterval: NodeJS.Timeout | null = null

onMounted(() => {
  updateTime()
  timeInterval = setInterval(updateTime, 1000)
  
  // 自动测试连接
  setTimeout(testConnection, 1000)
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})
</script>

<style scoped>
.config-test-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  padding-bottom: 80px;
}

.container {
  max-width: 1000px;
  margin: 0 auto;
}

h1 {
  font-size: 2.5rem;
  text-align: center;
  margin-bottom: 0.5rem;
}

.subtitle {
  text-align: center;
  font-size: 1.1rem;
  opacity: 0.9;
  margin-bottom: 2rem;
}

.test-sections {
  display: grid;
  gap: 2rem;
}

.test-section {
  background: rgba(255, 255, 255, 0.1);
  padding: 1.5rem;
  border-radius: 8px;
  backdrop-filter: blur(10px);
}

.test-section h2 {
  font-size: 1.3rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding-bottom: 0.5rem;
}

.config-grid, .info-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

.config-item, .info-item {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  border-left: 4px solid transparent;
}

.config-item.success {
  border-left-color: #4caf50;
}

.config-item.error {
  border-left-color: #f44336;
}

.label {
  font-weight: 500;
}

.value {
  font-family: 'Courier New', monospace;
  color: #ffd700;
  word-break: break-all;
}

.connection-status {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-weight: 500;
}

.status-item.success {
  background: rgba(76, 175, 80, 0.2);
}

.status-item.error {
  background: rgba(244, 67, 54, 0.2);
}

.status-item.unknown {
  background: rgba(255, 193, 7, 0.2);
}

.test-btn, .scroll-btn {
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.test-btn:hover, .scroll-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.test-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error-details {
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(244, 67, 54, 0.1);
  border-radius: 4px;
  border: 1px solid rgba(244, 67, 54, 0.3);
}

.error-details pre {
  white-space: pre-wrap;
  word-break: break-word;
  font-size: 0.9rem;
}

.statusbar-test {
  text-align: center;
}

.test-status-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50px;
  background: #ff4444;
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  font-weight: bold;
  z-index: 999999;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.3);
}

@media (max-width: 768px) {
  .config-grid, .info-grid {
    grid-template-columns: 1fr;
  }
  
  .connection-status {
    flex-direction: column;
    align-items: stretch;
  }
  
  .test-status-bar {
    font-size: 0.9rem;
    padding: 0 10px;
  }
}
</style>
