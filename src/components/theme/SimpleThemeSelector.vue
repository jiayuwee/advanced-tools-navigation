<template>
  <div class="simple-theme-selector">
    <!-- 主题切换按钮 -->
    <button 
      @click="showPanel = !showPanel"
      class="theme-toggle-button"
      :title="getThemeTitle()"
    >
      <SunIcon v-if="themeConfig.mode === 'light'" class="icon" />
      <MoonIcon v-else-if="themeConfig.mode === 'dark'" class="icon" />
      <MonitorIcon v-else class="icon" />
    </button>

    <!-- 简化的主题面板 -->
    <div v-if="showPanel" class="theme-panel" @click.stop>
      <div class="panel-header">
        <h3 class="panel-title">选择主题</h3>
        <button @click="showPanel = false" class="close-button">
          <XIcon class="icon" />
        </button>
      </div>

      <div class="panel-content">
        <!-- 简化的主题模式选择 -->
        <div class="theme-options">
          <button
            v-for="mode in themeModes"
            :key="mode.value"
            @click="selectMode(mode.value)"
            class="theme-option"
            :class="{ active: themeConfig.mode === mode.value }"
          >
            <component :is="mode.icon" class="option-icon" />
            <div class="option-content">
              <span class="option-label">{{ mode.label }}</span>
              <span class="option-desc">{{ mode.description }}</span>
            </div>
            <div v-if="themeConfig.mode === mode.value" class="check-icon">✓</div>
          </button>
        </div>
      </div>
    </div>

    <!-- 点击外部关闭面板 -->
    <div v-if="showPanel" class="panel-overlay" @click="showPanel = false"></div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useSimpleTheme } from '@/composables/useSimpleTheme'
import { SunIcon, MoonIcon, XIcon, MonitorIcon } from 'lucide-vue-next'
import type { SimpleThemeMode } from '@/composables/useSimpleTheme'

const {
  themeConfig,
  setThemeMode,
  getThemeTitle
} = useSimpleTheme()

// 状态
const showPanel = ref(false)

// 简化的主题模式选项
const themeModes = [
  { 
    value: 'light' as SimpleThemeMode, 
    label: '浅色', 
    icon: SunIcon,
    description: '始终使用浅色主题'
  },
  { 
    value: 'dark' as SimpleThemeMode, 
    label: '深色', 
    icon: MoonIcon,
    description: '始终使用深色主题'
  },
  { 
    value: 'auto' as SimpleThemeMode, 
    label: '跟随系统', 
    icon: MonitorIcon,
    description: '根据系统设置自动切换'
  }
]

// 选择主题模式
const selectMode = (mode: SimpleThemeMode) => {
  setThemeMode(mode)
  showPanel.value = false
}
</script>

<style scoped>
.simple-theme-selector {
  position: relative;
}

.theme-toggle-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: currentColor;
  cursor: pointer;
  transition: all 0.2s ease;
}

.theme-toggle-button:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

.icon {
  width: 20px;
  height: 20px;
}

.theme-panel {
  position: absolute;
  top: 50px;
  right: 0;
  width: 280px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  overflow: hidden;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #f3f4f6;
  background: #f9fafb;
}

.panel-title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.close-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  background: none;
  color: #6b7280;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.close-button:hover {
  background: #e5e7eb;
  color: #374151;
}

.panel-content {
  padding: 16px;
}

.theme-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.theme-option {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

.theme-option:hover {
  border-color: #3b82f6;
  background: #f8faff;
}

.theme-option.active {
  border-color: #3b82f6;
  background: #eff6ff;
}

.option-icon {
  width: 20px;
  height: 20px;
  color: #6b7280;
  margin-right: 12px;
  flex-shrink: 0;
}

.theme-option.active .option-icon {
  color: #3b82f6;
}

.option-content {
  flex: 1;
}

.option-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #111827;
  margin-bottom: 2px;
}

.option-desc {
  display: block;
  font-size: 12px;
  color: #6b7280;
}

.check-icon {
  color: #3b82f6;
  font-weight: bold;
  font-size: 16px;
}

.panel-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
}

/* 深色主题样式 */
:global(.theme-dark) .theme-panel {
  background: #1f2937;
  border-color: #374151;
}

:global(.theme-dark) .panel-header {
  background: #111827;
  border-color: #374151;
}

:global(.theme-dark) .panel-title {
  color: #f9fafb;
}

:global(.theme-dark) .close-button {
  color: #9ca3af;
}

:global(.theme-dark) .close-button:hover {
  background: #374151;
  color: #d1d5db;
}

:global(.theme-dark) .theme-option {
  background: #1f2937;
  border-color: #374151;
}

:global(.theme-dark) .theme-option:hover {
  border-color: #3b82f6;
  background: #1e3a8a;
}

:global(.theme-dark) .theme-option.active {
  background: #1e3a8a;
}

:global(.theme-dark) .option-label {
  color: #f9fafb;
}

:global(.theme-dark) .option-desc {
  color: #9ca3af;
}

:global(.theme-dark) .option-icon {
  color: #9ca3af;
}

:global(.theme-dark) .theme-option.active .option-icon {
  color: #3b82f6;
}
</style>
