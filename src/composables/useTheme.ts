import { ref, computed, watch, onMounted } from 'vue'
import { usePreferredColorScheme, useStorage } from '@vueuse/core'

export type ThemeMode = 'light' | 'dark' | 'auto'
export type ColorScheme = 'light' | 'dark'

export interface ThemeConfig {
  mode: ThemeMode
  primaryColor: string
  accentColor: string
  borderRadius: 'none' | 'small' | 'medium' | 'large'
  fontSize: 'small' | 'medium' | 'large'
  fontFamily: 'system' | 'inter' | 'roboto' | 'poppins'
  compactMode: boolean
  highContrast: boolean
  reducedMotion: boolean
}

export interface ThemePreset {
  id: string
  name: string
  description: string
  config: Partial<ThemeConfig>
  preview: {
    primary: string
    secondary: string
    background: string
    surface: string
  }
}

const defaultThemeConfig: ThemeConfig = {
  mode: 'auto',
  primaryColor: '#3b82f6',
  accentColor: '#10b981',
  borderRadius: 'medium',
  fontSize: 'medium',
  fontFamily: 'system',
  compactMode: false,
  highContrast: false,
  reducedMotion: false
}

const themePresets: ThemePreset[] = [
  {
    id: 'default',
    name: '默认主题',
    description: '经典的蓝色主题，适合大多数用户',
    config: {
      primaryColor: '#3b82f6',
      accentColor: '#10b981'
    },
    preview: {
      primary: '#3b82f6',
      secondary: '#10b981',
      background: '#ffffff',
      surface: '#f8fafc'
    }
  },
  {
    id: 'purple',
    name: '紫色主题',
    description: '优雅的紫色配色方案',
    config: {
      primaryColor: '#8b5cf6',
      accentColor: '#f59e0b'
    },
    preview: {
      primary: '#8b5cf6',
      secondary: '#f59e0b',
      background: '#ffffff',
      surface: '#faf5ff'
    }
  },
  {
    id: 'green',
    name: '绿色主题',
    description: '清新的绿色主题，护眼舒适',
    config: {
      primaryColor: '#059669',
      accentColor: '#dc2626'
    },
    preview: {
      primary: '#059669',
      secondary: '#dc2626',
      background: '#ffffff',
      surface: '#f0fdf4'
    }
  },
  {
    id: 'orange',
    name: '橙色主题',
    description: '温暖的橙色主题，充满活力',
    config: {
      primaryColor: '#ea580c',
      accentColor: '#7c3aed'
    },
    preview: {
      primary: '#ea580c',
      secondary: '#7c3aed',
      background: '#ffffff',
      surface: '#fff7ed'
    }
  },
  {
    id: 'dark-blue',
    name: '深蓝主题',
    description: '专业的深蓝色主题',
    config: {
      mode: 'dark' as ThemeMode,
      primaryColor: '#60a5fa',
      accentColor: '#34d399'
    },
    preview: {
      primary: '#60a5fa',
      secondary: '#34d399',
      background: '#0f172a',
      surface: '#1e293b'
    }
  },
  {
    id: 'high-contrast',
    name: '高对比度',
    description: '高对比度主题，提升可访问性',
    config: {
      primaryColor: '#000000',
      accentColor: '#ffffff',
      highContrast: true,
      borderRadius: 'none'
    },
    preview: {
      primary: '#000000',
      secondary: '#ffffff',
      background: '#ffffff',
      surface: '#f5f5f5'
    }
  }
]

export function useTheme() {
  // 系统偏好的颜色方案
  const preferredColorScheme = usePreferredColorScheme()
  
  // 持久化的主题配置
  const themeConfig = useStorage<ThemeConfig>('theme-config', defaultThemeConfig)
  
  // 当前激活的颜色方案
  const activeColorScheme = computed<ColorScheme>(() => {
    if (themeConfig.value.mode === 'auto') {
      return preferredColorScheme.value === 'dark' ? 'dark' : 'light'
    }
    return themeConfig.value.mode === 'dark' ? 'dark' : 'light'
  })

  // 是否为暗色主题
  const isDark = computed(() => activeColorScheme.value === 'dark')

  // CSS 变量映射
  const cssVariables = computed(() => {
    const config = themeConfig.value
    const scheme = activeColorScheme.value
    
    // 基础颜色
    const primary = config.primaryColor
    const accent = config.accentColor
    
    // 根据主色调生成色彩变体
    const primaryRgb = hexToRgb(primary)
    const accentRgb = hexToRgb(accent)
    
    const variables: Record<string, string> = {
      // 主色调
      '--color-primary': primary,
      '--color-primary-rgb': primaryRgb,
      '--color-accent': accent,
      '--color-accent-rgb': accentRgb,
      
      // 边框圆角
      '--border-radius-sm': getBorderRadius(config.borderRadius, 'sm'),
      '--border-radius-md': getBorderRadius(config.borderRadius, 'md'),
      '--border-radius-lg': getBorderRadius(config.borderRadius, 'lg'),
      '--border-radius-xl': getBorderRadius(config.borderRadius, 'xl'),
      
      // 字体大小
      '--font-size-xs': getFontSize(config.fontSize, 'xs'),
      '--font-size-sm': getFontSize(config.fontSize, 'sm'),
      '--font-size-base': getFontSize(config.fontSize, 'base'),
      '--font-size-lg': getFontSize(config.fontSize, 'lg'),
      '--font-size-xl': getFontSize(config.fontSize, 'xl'),
      '--font-size-2xl': getFontSize(config.fontSize, '2xl'),
      '--font-size-3xl': getFontSize(config.fontSize, '3xl'),
      
      // 字体家族
      '--font-family': getFontFamily(config.fontFamily),
      
      // 间距（紧凑模式）
      '--spacing-scale': config.compactMode ? '0.875' : '1',
      
      // 动画
      '--transition-duration': config.reducedMotion ? '0ms' : '150ms',
      '--animation-duration': config.reducedMotion ? '0ms' : '300ms'
    }

    // 根据颜色方案添加主题色彩
    if (scheme === 'dark') {
      Object.assign(variables, {
        '--color-background': config.highContrast ? '#000000' : '#0f172a',
        '--color-surface': config.highContrast ? '#1a1a1a' : '#1e293b',
        '--color-surface-hover': config.highContrast ? '#333333' : '#334155',
        '--color-border': config.highContrast ? '#666666' : '#475569',
        '--color-text': config.highContrast ? '#ffffff' : '#f1f5f9',
        '--color-text-secondary': config.highContrast ? '#cccccc' : '#cbd5e1',
        '--color-text-muted': config.highContrast ? '#999999' : '#94a3b8'
      })
    } else {
      Object.assign(variables, {
        '--color-background': config.highContrast ? '#ffffff' : '#ffffff',
        '--color-surface': config.highContrast ? '#f5f5f5' : '#f8fafc',
        '--color-surface-hover': config.highContrast ? '#e5e5e5' : '#f1f5f9',
        '--color-border': config.highContrast ? '#333333' : '#e2e8f0',
        '--color-text': config.highContrast ? '#000000' : '#1e293b',
        '--color-text-secondary': config.highContrast ? '#333333' : '#475569',
        '--color-text-muted': config.highContrast ? '#666666' : '#64748b'
      })
    }

    return variables
  })

  // 应用主题到 DOM
  const applyTheme = () => {
    const root = document.documentElement
    
    // 设置颜色方案
    root.setAttribute('data-theme', activeColorScheme.value)
    root.style.colorScheme = activeColorScheme.value
    
    // 应用 CSS 变量
    Object.entries(cssVariables.value).forEach(([property, value]) => {
      root.style.setProperty(property, value)
    })
    
    // 设置主题类名
    root.classList.toggle('theme-dark', isDark.value)
    root.classList.toggle('theme-light', !isDark.value)
    root.classList.toggle('theme-compact', themeConfig.value.compactMode)
    root.classList.toggle('theme-high-contrast', themeConfig.value.highContrast)
    root.classList.toggle('theme-reduced-motion', themeConfig.value.reducedMotion)
  }

  // 切换主题模式
  const setThemeMode = (mode: ThemeMode) => {
    themeConfig.value.mode = mode
  }

  // 切换暗色模式
  const toggleDark = () => {
    if (themeConfig.value.mode === 'auto') {
      setThemeMode(preferredColorScheme.value === 'dark' ? 'light' : 'dark')
    } else {
      setThemeMode(themeConfig.value.mode === 'dark' ? 'light' : 'dark')
    }
  }

  // 设置主色调
  const setPrimaryColor = (color: string) => {
    themeConfig.value.primaryColor = color
  }

  // 设置强调色
  const setAccentColor = (color: string) => {
    themeConfig.value.accentColor = color
  }

  // 应用预设主题
  const applyPreset = (presetId: string) => {
    const preset = themePresets.find(p => p.id === presetId)
    if (preset) {
      Object.assign(themeConfig.value, preset.config)
    }
  }

  // 重置主题
  const resetTheme = () => {
    themeConfig.value = { ...defaultThemeConfig }
  }

  // 导出主题配置
  const exportTheme = (): string => {
    return JSON.stringify(themeConfig.value, null, 2)
  }

  // 导入主题配置
  const importTheme = (configJson: string): boolean => {
    try {
      const config = JSON.parse(configJson)
      if (isValidThemeConfig(config)) {
        themeConfig.value = { ...defaultThemeConfig, ...config }
        return true
      }
      return false
    } catch {
      return false
    }
  }

  // 获取当前主题信息
  const getThemeInfo = () => ({
    mode: themeConfig.value.mode,
    colorScheme: activeColorScheme.value,
    isDark: isDark.value,
    config: { ...themeConfig.value }
  })

  // 工具函数
  const hexToRgb = (hex: string): string => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    if (result) {
      const r = parseInt(result[1], 16)
      const g = parseInt(result[2], 16)
      const b = parseInt(result[3], 16)
      return `${r}, ${g}, ${b}`
    }
    return '0, 0, 0'
  }

  const getBorderRadius = (setting: ThemeConfig['borderRadius'], size: string): string => {
    const radiusMap = {
      none: { sm: '0', md: '0', lg: '0', xl: '0' },
      small: { sm: '2px', md: '4px', lg: '6px', xl: '8px' },
      medium: { sm: '4px', md: '6px', lg: '8px', xl: '12px' },
      large: { sm: '6px', md: '8px', lg: '12px', xl: '16px' }
    }
    return radiusMap[setting][size as keyof typeof radiusMap.none] || '4px'
  }

  const getFontSize = (setting: ThemeConfig['fontSize'], size: string): string => {
    const sizeMap = {
      small: { xs: '0.6875rem', sm: '0.75rem', base: '0.8125rem', lg: '0.9375rem', xl: '1.0625rem', '2xl': '1.3125rem', '3xl': '1.6875rem' },
      medium: { xs: '0.75rem', sm: '0.875rem', base: '1rem', lg: '1.125rem', xl: '1.25rem', '2xl': '1.5rem', '3xl': '1.875rem' },
      large: { xs: '0.8125rem', sm: '0.9375rem', base: '1.0625rem', lg: '1.1875rem', xl: '1.3125rem', '2xl': '1.5625rem', '3xl': '1.9375rem' }
    }
    return sizeMap[setting][size as keyof typeof sizeMap.small] || '1rem'
  }

  const getFontFamily = (setting: ThemeConfig['fontFamily']): string => {
    const fontMap = {
      system: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      inter: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
      roboto: '"Roboto", -apple-system, BlinkMacSystemFont, sans-serif',
      poppins: '"Poppins", -apple-system, BlinkMacSystemFont, sans-serif'
    }
    return fontMap[setting] || fontMap.system
  }

  const isValidThemeConfig = (config: any): config is ThemeConfig => {
    return (
      typeof config === 'object' &&
      config !== null &&
      ['light', 'dark', 'auto'].includes(config.mode) &&
      typeof config.primaryColor === 'string' &&
      typeof config.accentColor === 'string'
    )
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
    cssVariables,
    
    // 预设
    themePresets,
    
    // 方法
    setThemeMode,
    toggleDark,
    setPrimaryColor,
    setAccentColor,
    applyPreset,
    resetTheme,
    exportTheme,
    importTheme,
    getThemeInfo,
    applyTheme
  }
}
