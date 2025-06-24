import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ToolsService } from '../services/toolsService'
import { CategoriesService } from '../services/categoriesService'
import type { Tool, Category, SearchFilters, SearchResult } from '../types'

// 导出类型以保持向后兼容
export type { Tool, Category }

export const useToolsStore = defineStore('tools', () => {
  // 状态
  const searchQuery = ref('')
  const selectedCategory = ref('all')
  const showFavoritesOnly = ref(false)
  const sidebarCollapsed = ref(false)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 数据
  const tools = ref<Tool[]>([])
  const categories = ref<Category[]>([])
  const searchResult = ref<SearchResult<Tool> | null>(null)
  const popularTools = ref<Tool[]>([])
  const featuredTools = ref<Tool[]>([])

  // 初始化状态
  const initialized = ref(false)
  // 异步操作方法
  const loadCategories = async () => {
    try {
      loading.value = true
      error.value = null
      const categoriesData = await CategoriesService.getCategoriesWithStats()
      categories.value = categoriesData
    } catch (err) {
      error.value = err instanceof Error ? err.message : '加载分类失败'
      console.error('Error loading categories:', err)
    } finally {
      loading.value = false
    }
  }

  const loadTools = async (filters?: SearchFilters) => {
    try {
      loading.value = true
      error.value = null
      const result = await ToolsService.getTools(filters)

      if (filters) {
        searchResult.value = result
      } else {
        tools.value = result.items
        searchResult.value = null
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '加载工具失败'
      console.error('Error loading tools:', err)
    } finally {
      loading.value = false
    }
  }

  const loadPopularTools = async () => {
    try {
      const popular = await ToolsService.getPopularTools(6)
      popularTools.value = popular
    } catch (err) {
      console.error('Error loading popular tools:', err)
    }
  }

  const loadFeaturedTools = async () => {
    try {
      const featured = await ToolsService.getFeaturedTools(6)
      featuredTools.value = featured
    } catch (err) {
      console.error('Error loading featured tools:', err)
    }
  }

  const searchTools = async (query: string) => {
    if (!query.trim()) {
      searchResult.value = null
      return
    }

    try {
      loading.value = true
      error.value = null
      const filters: SearchFilters = {
        query: query.trim(),
        category: selectedCategory.value !== 'all' ? selectedCategory.value : undefined,
        limit: 20,
      }
      await loadTools(filters)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '搜索失败'
      console.error('Error searching tools:', err)
    } finally {
      loading.value = false
    }
  }

  const createTool = async (toolData: Partial<Tool>) => {
    try {
      loading.value = true
      error.value = null
      const newTool = await ToolsService.createTool(toolData)
      tools.value.unshift(newTool)
      return newTool
    } catch (err) {
      error.value = err instanceof Error ? err.message : '创建工具失败'
      console.error('Error creating tool:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateTool = async (id: string, toolData: Partial<Tool>) => {
    try {
      loading.value = true
      error.value = null
      const updatedTool = await ToolsService.updateTool(id, toolData)
      const index = tools.value.findIndex(t => t.id === id)
      if (index !== -1) {
        tools.value[index] = updatedTool
      }
      return updatedTool
    } catch (err) {
      error.value = err instanceof Error ? err.message : '更新工具失败'
      console.error('Error updating tool:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteTool = async (id: string) => {
    try {
      loading.value = true
      error.value = null
      await ToolsService.deleteTool(id)
      tools.value = tools.value.filter(t => t.id !== id)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '删除工具失败'
      console.error('Error deleting tool:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const incrementClickCount = async (id: string) => {
    try {
      await ToolsService.incrementClickCount(id)
      // 更新本地状态
      const tool = tools.value.find(t => t.id === id)
      if (tool) {
        tool.clickCount++
      }
    } catch (err) {
      console.error('Error incrementing click count:', err)
    }
  }

  // 计算属性
  const filteredTools = computed(() => {
    // 如果有搜索结果，优先显示搜索结果
    if (searchResult.value) {
      return searchResult.value.items
    }

    let filtered = tools.value

    // 分类过滤
    if (selectedCategory.value === 'favorites') {
      filtered = filtered.filter(tool => tool.isFavorite)
    } else if (selectedCategory.value !== 'all') {
      filtered = filtered.filter(tool => tool.category.id === selectedCategory.value)
    }

    // 搜索过滤
    if (searchQuery.value.trim()) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(
        tool =>
          tool.name.toLowerCase().includes(query) ||
          tool.description.toLowerCase().includes(query) ||
          tool.tags.some(tag => tag.name.toLowerCase().includes(query))
      )
    }

    // 收藏过滤
    if (showFavoritesOnly.value && selectedCategory.value !== 'favorites') {
      filtered = filtered.filter(tool => tool.isFavorite)
    }

    return filtered
  })

  const favoriteTools = computed(() => tools.value.filter(tool => tool.isFavorite))

  const recentTools = computed(() =>
    [...tools.value]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 6)
  )

  const toolsByCategory = computed(() => {
    const grouped = new Map<string, Tool[]>()
    tools.value.forEach(tool => {
      const categoryId = tool.category.id
      if (!grouped.has(categoryId)) {
        grouped.set(categoryId, [])
      }
      grouped.get(categoryId)!.push(tool)
    })
    return grouped
  })

  const totalTools = computed(() => {
    return searchResult.value ? searchResult.value.total : tools.value.length
  })

  // 同步方法
  const setSearchQuery = (query: string) => {
    searchQuery.value = query
    if (query.trim()) {
      searchTools(query)
    } else {
      searchResult.value = null
    }
  }

  const setSelectedCategory = (categoryId: string) => {
    selectedCategory.value = categoryId
    // 如果有搜索查询，重新搜索以应用新的分类过滤
    if (searchQuery.value.trim()) {
      searchTools(searchQuery.value)
    }
  }

  const toggleFavorite = async (toolId: string) => {
    const tool = tools.value.find(t => t.id === toolId)
    if (tool) {
      const newFavoriteStatus = !tool.isFavorite
      tool.isFavorite = newFavoriteStatus

      // TODO: 实现收藏功能的数据库操作
      // await FavoritesService.toggleFavorite(toolId, newFavoriteStatus)
    }
  }

  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  const toggleFavoritesOnly = () => {
    showFavoritesOnly.value = !showFavoritesOnly.value
  }

  const clearError = () => {
    error.value = null
  }

  // 初始化方法
  const initialize = async () => {
    if (initialized.value) return

    try {
      await Promise.all([loadCategories(), loadTools(), loadPopularTools(), loadFeaturedTools()])
      initialized.value = true
    } catch (err) {
      console.error('Error initializing tools store:', err)
    }
  }

  return {
    // 状态
    searchQuery,
    selectedCategory,
    showFavoritesOnly,
    sidebarCollapsed,
    loading,
    error,
    initialized,

    // 数据
    tools,
    categories,
    searchResult,
    popularTools,
    featuredTools,

    // 计算属性
    filteredTools,
    favoriteTools,
    recentTools,
    toolsByCategory,
    totalTools,

    // 异步方法
    initialize,
    loadCategories,
    loadTools,
    loadPopularTools,
    loadFeaturedTools,
    searchTools,
    createTool,
    updateTool,
    deleteTool,
    incrementClickCount,

    // 同步方法
    setSearchQuery,
    setSelectedCategory,
    toggleFavorite,
    toggleSidebar,
    toggleFavoritesOnly,
    clearError,
  }
})
