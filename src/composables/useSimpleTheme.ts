import { ref, computed, watch, onMounted } from 'vue'
import { usePreferredColorScheme, useStorage } from '@vueuse/core'

export type SimpleThemeMode = 'light' | 'dark' | 'auto'

// 简化的主题配置
export interface SimpleThemeConfig {
  mode: SimpleThemeMode
}

const defaultConfig: SimpleThemeConfig = {
  mode: 'auto'
}

export function useSimpleTheme() {
  // 系统偏好的颜色方案
  const preferredColorScheme = usePreferredColorScheme()
  
  // 持久化的主题配置
  const themeConfig = useStorage<SimpleThemeConfig>('simple-theme-config', defaultConfig)
  
  // 当前激活的颜色方案
  const activeColorScheme = computed(() => {
    if (themeConfig.value.mode === 'auto') {
      return preferredColorScheme.value === 'dark' ? 'dark' : 'light'
    }
    return themeConfig.value.mode === 'dark' ? 'dark' : 'light'
  })
  
  // 是否为暗色主题
  const isDark = computed(() => activeColorScheme.value === 'dark')
  
  // 应用主题到 DOM
  const applyTheme = () => {
    const root = document.documentElement
    const body = document.body
    
    // 移除所有主题类
    root.classList.remove('theme-light', 'theme-dark')
    body.classList.remove('light', 'dark')
    
    // 设置新的主题类
    const scheme = activeColorScheme.value
    root.classList.add(`theme-${scheme}`)
    body.classList.add(scheme)
    
    // 设置 data 属性
    root.setAttribute('data-theme', scheme)
    root.style.colorScheme = scheme
    
    console.log(`🎨 主题已切换到: ${scheme}`)
  }
  
  // 设置主题模式
  const setThemeMode = (mode: SimpleThemeMode) => {
    themeConfig.value.mode = mode
    console.log(`🎨 主题模式设置为: ${mode}`)
  }
  
  // 切换暗色模式
  const toggleDark = () => {
    if (themeConfig.value.mode === 'auto') {
      setThemeMode(preferredColorScheme.value === 'dark' ? 'light' : 'dark')
    } else {
      setThemeMode(themeConfig.value.mode === 'dark' ? 'light' : 'dark')
    }
  }
  
  // 获取主题标题
  const getThemeTitle = () => {
    const mode = themeConfig.value.mode
    switch (mode) {
      case 'light': return '当前：浅色主题'
      case 'dark': return '当前：深色主题'
      case 'auto': return `当前：跟随系统 (${activeColorScheme.value === 'dark' ? '深色' : '浅色'})`
      default: return '主题设置'
    }
  }
  
  // 监听配置变化并应用主题
  watch([themeConfig, preferredColorScheme], applyTheme, { deep: true, immediate: false })
  
  // 初始化
  onMounted(() => {
    applyTheme()
  })
  
  return {
    // 状态
    themeConfig,
    activeColorScheme,
    isDark,
    
    // 方法
    setThemeMode,
    toggleDark,
    getThemeTitle,
    applyTheme
  }
}
