import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Tool {
  id: string
  name: string
  description: string
  url: string
  icon: string
  category: string
  tags: string[]
  isFavorite: boolean
  clickCount: number
  addedDate: string
}

export interface Category {
  id: string
  name: string
  icon: string
  color: string
  count: number
}

export const useToolsStore = defineStore('tools', () => {
  // 状态
  const searchQuery = ref('')
  const selectedCategory = ref('all')
  const showFavoritesOnly = ref(false)
  const sidebarCollapsed = ref(false)

  // 分类数据
  const categories = ref<Category[]>([
    { id: 'development', name: '开发工具', icon: '💻', color: '#0078d4', count: 0 },
    { id: 'design', name: '设计工具', icon: '🎨', color: '#8764b8', count: 0 },
    { id: 'productivity', name: '效率工具', icon: '⚡', color: '#107c10', count: 0 },
    { id: 'ai', name: 'AI工具', icon: '🤖', color: '#ff8c00', count: 0 },
    { id: 'network', name: '网络工具', icon: '🌐', color: '#00bcf2', count: 0 },
    { id: 'media', name: '媒体工具', icon: '📸', color: '#e74856', count: 0 },
    { id: 'utility', name: '实用工具', icon: '🔧', color: '#00b7c3', count: 0 },
  ])

  // 工具数据
  const tools = ref<Tool[]>([
    {
      id: '1',
      name: 'GitHub',
      description: '全球最大的代码托管平台，支持Git版本控制和团队协作开发',
      url: 'https://github.com',
      icon: '💻',
      category: 'development',
      tags: ['代码托管', 'Git', '开源', '协作', '版本控制'],
      isFavorite: true,
      clickCount: 156,
      addedDate: '2024-01-15',
    },
    {
      id: '2',
      name: 'Visual Studio Code',
      description: '微软开发的免费代码编辑器，支持多种编程语言和丰富的扩展',
      url: 'https://code.visualstudio.com',
      icon: '💻',
      category: 'development',
      tags: ['代码编辑器', '开发工具', '微软', 'IDE', '扩展'],
      isFavorite: true,
      clickCount: 234,
      addedDate: '2024-01-10',
    },
    {
      id: '3',
      name: 'Figma',
      description: '协作式界面设计工具，支持实时协作和原型制作，设计师必备',
      url: 'https://figma.com',
      icon: '🎨',
      category: 'design',
      tags: ['UI设计', '原型制作', '协作', '矢量设计', '界面设计'],
      isFavorite: true,
      clickCount: 189,
      addedDate: '2024-01-20',
    },
    {
      id: '4',
      name: 'Adobe Photoshop',
      description: '专业的图像编辑和设计软件，创意设计的行业标准',
      url: 'https://www.adobe.com/products/photoshop.html',
      icon: '🎨',
      category: 'design',
      tags: ['图像编辑', '设计软件', 'Adobe', '创意设计', '专业工具'],
      isFavorite: false,
      clickCount: 145,
      addedDate: '2024-01-25',
    },
    {
      id: '5',
      name: 'ChatGPT',
      description: 'OpenAI开发的AI对话助手，支持多种任务包括写作、编程和问答',
      url: 'https://chat.openai.com',
      icon: '🤖',
      category: 'ai',
      tags: ['AI助手', '对话', '写作', '编程', 'OpenAI'],
      isFavorite: true,
      clickCount: 312,
      addedDate: '2024-02-01',
    },
    {
      id: '6',
      name: 'Midjourney',
      description: 'AI图像生成工具，通过文本描述创建高质量的艺术作品',
      url: 'https://midjourney.com',
      icon: '🤖',
      category: 'ai',
      tags: ['AI绘画', '图像生成', '艺术创作', '文本转图像', '创意工具'],
      isFavorite: false,
      clickCount: 98,
      addedDate: '2024-02-05',
    },
    {
      id: '7',
      name: 'Notion',
      description: '全能的笔记和协作工具，支持数据库、模板和团队协作',
      url: 'https://notion.so',
      icon: '📝',
      category: 'productivity',
      tags: ['笔记工具', '数据库', '协作', '模板', '知识管理'],
      isFavorite: true,
      clickCount: 167,
      addedDate: '2024-01-12',
    },
    {
      id: '8',
      name: 'Trello',
      description: '基于看板的项目管理工具，简单直观的任务管理方式',
      url: 'https://trello.com',
      icon: '📋',
      category: 'productivity',
      tags: ['项目管理', '看板', '任务管理', '团队协作', '工作流'],
      isFavorite: false,
      clickCount: 87,
      addedDate: '2024-01-30',
    },
    {
      id: '9',
      name: 'Ping.pe',
      description: '网络连通性测试工具，支持全球多地点ping测试和网络诊断',
      url: 'https://ping.pe',
      icon: '🌐',
      category: 'network',
      tags: ['网络测试', 'ping测试', '网络诊断', '连通性', '监控'],
      isFavorite: false,
      clickCount: 43,
      addedDate: '2024-02-10',
    },
    {
      id: '10',
      name: 'Speedtest',
      description: '网络速度测试工具，准确测量上传下载速度和延迟',
      url: 'https://speedtest.net',
      icon: '🌐',
      category: 'network',
      tags: ['网速测试', '带宽测试', '网络性能', '延迟测试', '网络质量'],
      isFavorite: true,
      clickCount: 76,
      addedDate: '2024-02-08',
    },
    {
      id: '11',
      name: 'Canva',
      description: '在线图形设计平台，提供丰富的模板和设计素材',
      url: 'https://canva.com',
      icon: '🎨',
      category: 'design',
      tags: ['在线设计', '模板', '图形设计', '海报制作', '社交媒体'],
      isFavorite: false,
      clickCount: 65,
      addedDate: '2024-02-12',
    },
    {
      id: '12',
      name: 'Unsplash',
      description: '免费高质量图片素材库，摄影师和设计师的灵感来源',
      url: 'https://unsplash.com',
      icon: '📸',
      category: 'media',
      tags: ['免费图片', '高质量素材', '摄影', '设计素材', '版权友好'],
      isFavorite: true,
      clickCount: 92,
      addedDate: '2024-01-28',
    },
  ])

  // 更新分类计数
  const updateCategoryCounts = () => {
    categories.value.forEach(category => {
      category.count = tools.value.filter(tool => tool.category === category.id).length
    })
  }

  // 计算属性
  const filteredTools = computed(() => {
    let filtered = tools.value

    // 特殊处理收藏分类
    if (selectedCategory.value === 'favorites') {
      filtered = filtered.filter(tool => tool.isFavorite)
    } else if (selectedCategory.value !== 'all') {
      filtered = filtered.filter(tool => tool.category === selectedCategory.value)
    }

    // 搜索过滤
    if (searchQuery.value.trim()) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(
        tool =>
          tool.name.toLowerCase().includes(query) ||
          tool.description.toLowerCase().includes(query) ||
          tool.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }

    // 收藏过滤
    if (showFavoritesOnly.value && selectedCategory.value !== 'favorites') {
      filtered = filtered.filter(tool => tool.isFavorite)
    }

    return filtered
  })

  const favoriteTools = computed(() => tools.value.filter(tool => tool.isFavorite))
  const popularTools = computed(() =>
    [...tools.value].sort((a, b) => b.clickCount - a.clickCount).slice(0, 6)
  )
  const recentTools = computed(() =>
    [...tools.value]
      .sort((a, b) => new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime())
      .slice(0, 6)
  )

  // 方法
  const setSearchQuery = (query: string) => {
    searchQuery.value = query
  }

  const setSelectedCategory = (categoryId: string) => {
    selectedCategory.value = categoryId
  }

  const toggleFavorite = (toolId: string) => {
    const tool = tools.value.find(t => t.id === toolId)
    if (tool) {
      tool.isFavorite = !tool.isFavorite
    }
  }

  const incrementClickCount = (toolId: string) => {
    const tool = tools.value.find(t => t.id === toolId)
    if (tool) {
      tool.clickCount++
    }
  }

  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  const toggleFavoritesOnly = () => {
    showFavoritesOnly.value = !showFavoritesOnly.value
  }

  // 初始化
  updateCategoryCounts()

  return {
    // 状态
    searchQuery,
    selectedCategory,
    showFavoritesOnly,
    sidebarCollapsed,
    categories,
    tools,

    // 计算属性
    filteredTools,
    favoriteTools,
    popularTools,
    recentTools,

    // 方法
    setSearchQuery,
    setSelectedCategory,
    toggleFavorite,
    incrementClickCount,
    toggleSidebar,
    toggleFavoritesOnly,
    updateCategoryCounts,
  }
})
