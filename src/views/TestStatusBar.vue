<template>
  <div class="test-page">
    <div class="test-content">
      <h1>状态栏测试页面</h1>
      <p>这个页面用于测试底部状态栏是否正常显示</p>
      
      <div class="test-info">
        <h2>测试信息</h2>
        <ul>
          <li>页面高度: {{ pageHeight }}px</li>
          <li>视口高度: {{ viewportHeight }}px</li>
          <li>滚动位置: {{ scrollY }}px</li>
          <li>状态栏应该显示在底部</li>
        </ul>
      </div>
      
      <div class="spacer"></div>
      
      <div class="bottom-content">
        <p>这是页面底部内容，状态栏应该在这下面显示</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const pageHeight = ref(0)
const viewportHeight = ref(0)
const scrollY = ref(0)

const updateMetrics = () => {
  pageHeight.value = document.documentElement.scrollHeight
  viewportHeight.value = window.innerHeight
  scrollY.value = window.scrollY
}

onMounted(() => {
  updateMetrics()
  window.addEventListener('scroll', updateMetrics)
  window.addEventListener('resize', updateMetrics)
})

onUnmounted(() => {
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
}

.test-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  text-align: center;
}

h2 {
  font-size: 1.5rem;
  margin: 2rem 0 1rem 0;
}

p {
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.test-info {
  background: rgba(255, 255, 255, 0.1);
  padding: 20px;
  border-radius: 8px;
  margin: 2rem 0;
}

.test-info ul {
  list-style: none;
  padding: 0;
}

.test-info li {
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  font-family: 'Courier New', monospace;
}

.spacer {
  height: 200vh; /* 创建足够的滚动空间 */
}

.bottom-content {
  background: rgba(255, 255, 255, 0.2);
  padding: 40px;
  border-radius: 8px;
  text-align: center;
  margin-bottom: 100px; /* 为状态栏留出空间 */
}
</style>
