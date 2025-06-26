<template>
  <div class="comparison-view">
    <div class="container">
      <header class="comparison-header">
        <h1>代码优化对比演示</h1>
        <p>展示原HTML代码与Vue组件化改造后的效果对比</p>
      </header>

      <div class="comparison-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          :class="['tab-button', { active: activeTab === tab.key }]"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>

      <div class="comparison-content">
        <!-- 原始HTML版本 -->
        <div v-if="activeTab === 'original'" class="comparison-section">
          <div class="section-header">
            <h2>🔧 原始HTML版本</h2>
            <div class="feature-tags">
              <span class="tag static">静态页面</span>
              <span class="tag limited">功能有限</span>
              <span class="tag isolated">数据孤立</span>
            </div>
          </div>

          <div class="demo-frame">
            <iframe
              src="/original-demo.html"
              title="原始HTML演示"
              class="demo-iframe"
            ></iframe>
          </div>

          <div class="feature-list">
            <h3>特性分析</h3>
            <ul>
              <li class="feature-item">
                <span class="icon">❌</span>
                <span>静态数据，无法与数据库交互</span>
              </li>
              <li class="feature-item">
                <span class="icon">❌</span>
                <span>假收藏功能，无用户系统</span>
              </li>
              <li class="feature-item">
                <span class="icon">❌</span>
                <span>简单搜索，无高级过滤</span>
              </li>
              <li class="feature-item">
                <span class="icon">❌</span>
                <span>硬编码内容，难以维护</span>
              </li>
              <li class="feature-item">
                <span class="icon">✅</span>
                <span>视觉设计优秀，用户体验良好</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- Vue增强版本 -->
        <div v-if="activeTab === 'enhanced'" class="comparison-section">
          <div class="section-header">
            <h2>🚀 Vue增强版本</h2>
            <div class="feature-tags">
              <span class="tag dynamic">动态数据</span>
              <span class="tag integrated">数据库集成</span>
              <span class="tag modern">现代架构</span>
            </div>
          </div>

          <div class="demo-frame">
            <router-link to="/enhanced" class="demo-link">
              <div class="demo-preview">
                <div class="preview-header">
                  <div class="preview-logo">🚀</div>
                  <h3>高效工具导航站</h3>
                </div>
                <div class="preview-content">
                  <div class="preview-search">
                    <input placeholder="搜索工具、分类或功能..." readonly />
                    <button>搜索</button>
                  </div>
                  <div class="preview-grid">
                    <div class="preview-card" v-for="i in 6" :key="i">
                      <div class="card-header"></div>
                      <div class="card-content"></div>
                    </div>
                  </div>
                </div>
                <div class="preview-overlay">
                  <span>点击查看完整版本</span>
                </div>
              </div>
            </router-link>
          </div>

          <div class="feature-list">
            <h3>增强特性</h3>
            <ul>
              <li class="feature-item">
                <span class="icon">✅</span>
                <span>Supabase数据库集成，实时数据同步</span>
              </li>
              <li class="feature-item">
                <span class="icon">✅</span>
                <span>用户认证系统，真实收藏功能</span>
              </li>
              <li class="feature-item">
                <span class="icon">✅</span>
                <span>高级搜索和过滤，智能分类</span>
              </li>
              <li class="feature-item">
                <span class="icon">✅</span>
                <span>点击统计，数据分析支持</span>
              </li>
              <li class="feature-item">
                <span class="icon">✅</span>
                <span>组件化架构，易于维护扩展</span>
              </li>
              <li class="feature-item">
                <span class="icon">✅</span>
                <span>TypeScript类型安全</span>
              </li>
              <li class="feature-item">
                <span class="icon">✅</span>
                <span>响应式设计，移动端优化</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- 技术对比 -->
        <div v-if="activeTab === 'technical'" class="comparison-section">
          <div class="section-header">
            <h2>⚙️ 技术架构对比</h2>
          </div>

          <div class="tech-comparison">
            <div class="tech-column">
              <h3>原始HTML</h3>
              <div class="tech-stack">
                <div class="tech-item">
                  <span class="tech-name">HTML5</span>
                  <span class="tech-desc">静态标记</span>
                </div>
                <div class="tech-item">
                  <span class="tech-name">CSS3</span>
                  <span class="tech-desc">样式定义</span>
                </div>
                <div class="tech-item">
                  <span class="tech-name">Vanilla JS</span>
                  <span class="tech-desc">基础交互</span>
                </div>
                <div class="tech-item">
                  <span class="tech-name">Font Awesome</span>
                  <span class="tech-desc">图标库</span>
                </div>
              </div>
            </div>

            <div class="tech-arrow">→</div>

            <div class="tech-column">
              <h3>Vue增强版</h3>
              <div class="tech-stack">
                <div class="tech-item">
                  <span class="tech-name">Vue 3</span>
                  <span class="tech-desc">组合式API</span>
                </div>
                <div class="tech-item">
                  <span class="tech-name">TypeScript</span>
                  <span class="tech-desc">类型安全</span>
                </div>
                <div class="tech-item">
                  <span class="tech-name">Pinia</span>
                  <span class="tech-desc">状态管理</span>
                </div>
                <div class="tech-item">
                  <span class="tech-name">Supabase</span>
                  <span class="tech-desc">数据库+认证</span>
                </div>
                <div class="tech-item">
                  <span class="tech-name">Tailwind CSS</span>
                  <span class="tech-desc">原子化CSS</span>
                </div>
                <div class="tech-item">
                  <span class="tech-name">Lucide Icons</span>
                  <span class="tech-desc">现代图标</span>
                </div>
                <div class="tech-item">
                  <span class="tech-name">Vite</span>
                  <span class="tech-desc">构建工具</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 性能对比 -->
        <div v-if="activeTab === 'performance'" class="comparison-section">
          <div class="section-header">
            <h2>📊 性能与维护性对比</h2>
          </div>

          <div class="performance-metrics">
            <div class="metric-group">
              <h3>开发效率</h3>
              <div class="metric-bars">
                <div class="metric-bar">
                  <span class="metric-label">代码复用性</span>
                  <div class="bar-container">
                    <div class="bar original" style="width: 20%"></div>
                    <span class="bar-value">20%</span>
                  </div>
                </div>
                <div class="metric-bar">
                  <span class="metric-label">Vue组件化</span>
                  <div class="bar-container">
                    <div class="bar enhanced" style="width: 90%"></div>
                    <span class="bar-value">90%</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="metric-group">
              <h3>可维护性</h3>
              <div class="metric-bars">
                <div class="metric-bar">
                  <span class="metric-label">代码组织</span>
                  <div class="bar-container">
                    <div class="bar original" style="width: 30%"></div>
                    <span class="bar-value">30%</span>
                  </div>
                </div>
                <div class="metric-bar">
                  <span class="metric-label">模块化架构</span>
                  <div class="bar-container">
                    <div class="bar enhanced" style="width: 95%"></div>
                    <span class="bar-value">95%</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="metric-group">
              <h3>功能完整性</h3>
              <div class="metric-bars">
                <div class="metric-bar">
                  <span class="metric-label">静态展示</span>
                  <div class="bar-container">
                    <div class="bar original" style="width: 60%"></div>
                    <span class="bar-value">60%</span>
                  </div>
                </div>
                <div class="metric-bar">
                  <span class="metric-label">完整应用</span>
                  <div class="bar-container">
                    <div class="bar enhanced" style="width: 100%"></div>
                    <span class="bar-value">100%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const activeTab = ref("original");

const tabs = [
  { key: "original", label: "原始版本" },
  { key: "enhanced", label: "增强版本" },
  { key: "technical", label: "技术对比" },
  { key: "performance", label: "性能对比" },
];
</script>

<style scoped>
.comparison-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4edf5 100%);
  padding: 2rem 1rem;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.comparison-header {
  text-align: center;
  margin-bottom: 3rem;
}

.comparison-header h1 {
  font-size: 2.5rem;
  font-weight: 800;
  color: #2d3748;
  margin-bottom: 1rem;
}

.comparison-header p {
  font-size: 1.2rem;
  color: #718096;
}

.comparison-tabs {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 3rem;
  flex-wrap: wrap;
}

.tab-button {
  padding: 0.75rem 1.5rem;
  border: 2px solid #e2e8f0;
  background: white;
  color: #4a5568;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.tab-button:hover {
  border-color: #4299e1;
  color: #4299e1;
}

.tab-button.active {
  background: #4299e1;
  border-color: #4299e1;
  color: white;
}

.comparison-content {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.section-header h2 {
  font-size: 1.8rem;
  font-weight: 700;
  color: #2d3748;
}

.feature-tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.tag {
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.tag.static {
  background: #fed7d7;
  color: #c53030;
}
.tag.limited {
  background: #feebc8;
  color: #dd6b20;
}
.tag.isolated {
  background: #e2e8f0;
  color: #4a5568;
}
.tag.dynamic {
  background: #c6f6d5;
  color: #38a169;
}
.tag.integrated {
  background: #bee3f8;
  color: #3182ce;
}
.tag.modern {
  background: #e9d8fd;
  color: #805ad5;
}

.demo-frame {
  margin-bottom: 2rem;
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.demo-iframe {
  width: 100%;
  height: 500px;
  border: none;
}

.demo-link {
  display: block;
  text-decoration: none;
}

.demo-preview {
  position: relative;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  min-height: 400px;
  overflow: hidden;
}

.preview-header {
  text-align: center;
  margin-bottom: 2rem;
}

.preview-logo {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.preview-header h3 {
  font-size: 2rem;
  font-weight: 700;
}

.preview-search {
  display: flex;
  max-width: 500px;
  margin: 0 auto 2rem;
  background: white;
  border-radius: 2rem;
  overflow: hidden;
}

.preview-search input {
  flex: 1;
  padding: 1rem 1.5rem;
  border: none;
  outline: none;
  color: #2d3748;
}

.preview-search button {
  padding: 1rem 1.5rem;
  background: #4299e1;
  color: white;
  border: none;
  cursor: pointer;
}

.preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  opacity: 0.8;
}

.preview-card {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  height: 120px;
  backdrop-filter: blur(10px);
}

.preview-overlay {
  position: absolute;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.7);
  padding: 0.5rem 1rem;
  border-radius: 1rem;
  font-size: 0.875rem;
}

.feature-list h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 1rem;
}

.feature-list ul {
  list-style: none;
  padding: 0;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e2e8f0;
}

.feature-item:last-child {
  border-bottom: none;
}

.feature-item .icon {
  font-size: 1.25rem;
}

.tech-comparison {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 2rem;
  align-items: start;
}

.tech-column h3 {
  text-align: center;
  font-size: 1.5rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 1.5rem;
}

.tech-stack {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.tech-item {
  background: #f7fafc;
  padding: 1rem;
  border-radius: 0.5rem;
  border-left: 4px solid #4299e1;
}

.tech-name {
  display: block;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.25rem;
}

.tech-desc {
  font-size: 0.875rem;
  color: #718096;
}

.tech-arrow {
  font-size: 2rem;
  color: #4299e1;
  align-self: center;
}

.performance-metrics {
  display: grid;
  gap: 2rem;
}

.metric-group h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 1rem;
}

.metric-bars {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.metric-bar {
  display: grid;
  grid-template-columns: 150px 1fr auto;
  align-items: center;
  gap: 1rem;
}

.metric-label {
  font-weight: 500;
  color: #4a5568;
}

.bar-container {
  position: relative;
  height: 1.5rem;
  background: #e2e8f0;
  border-radius: 0.75rem;
  overflow: hidden;
}

.bar {
  height: 100%;
  border-radius: 0.75rem;
  transition: width 0.8s ease;
}

.bar.original {
  background: linear-gradient(90deg, #fc8181, #f56565);
}

.bar.enhanced {
  background: linear-gradient(90deg, #68d391, #48bb78);
}

.bar-value {
  font-weight: 600;
  color: #2d3748;
  min-width: 40px;
}

@media (max-width: 768px) {
  .comparison-view {
    padding: 1rem 0.5rem;
  }

  .comparison-header h1 {
    font-size: 2rem;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .tech-comparison {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .tech-arrow {
    display: none;
  }

  .metric-bar {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .preview-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
