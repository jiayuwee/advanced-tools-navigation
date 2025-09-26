import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 添加缺失的类型定义
interface CategoryRow {
  id: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
}

interface TagRow {
  id: string;
  name: string;
  color: string;
}

// 工具类型定义
interface ToolBase {
  id: string;
  name: string;
  description: string;
  url: string | null;
  icon: string | null;
  category_id: string | null;
  is_featured: boolean;
  is_favorite?: boolean; // 添加收藏状态
  click_count: number;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

interface ToolExtended extends ToolBase {
  created_by: string | null;
  meta_title: string | null;
  meta_description: string | null;
  sort_order: number | null;
  categories: CategoryRow | null;
  tool_tags: Array<{ tags: TagRow | null }> | null;
  tags: string[];
  category_name: string | null;
  category_slug: string | null;
  author_id: string | null;
  author_name: string | null;
}

export type Tool = ToolBase & Partial<ToolExtended>;

// 类型守卫
export function isExtendedTool(tool: Tool): tool is ToolExtended {
  return 'created_by' in tool;
}

// 严格的类型转换函数
export function normalizeTool(data: unknown): Tool {
  if (typeof data !== 'object' || data === null) {
    throw new Error('Invalid tool data: expected object');
  }

  const raw = data as Record<string, any>;

  // 验证必填字段
  if (typeof raw.id !== 'string') throw new Error('Invalid tool data: id must be string');
  if (typeof raw.name !== 'string') throw new Error('Invalid tool data: name must be string');

  // 创建基础工具对象
  const baseTool: ToolBase = {
    id: raw.id,
    name: raw.name,
    description: typeof raw.description === 'string' ? raw.description : '',
    url: typeof raw.url === 'string' ? raw.url : null,
    icon: typeof raw.icon === 'string' ? raw.icon : null,
    category_id: typeof raw.category_id === 'string' ? raw.category_id : null,
    is_featured: Boolean(raw.is_featured),
    is_favorite: Boolean(raw.is_favorite),
    click_count: Number(raw.click_count) || 0,
    status: raw.status === 'inactive' ? 'inactive' : 'active',
    created_at: typeof raw.created_at === 'string' ? raw.created_at : new Date().toISOString(),
    updated_at: typeof raw.updated_at === 'string' ? raw.updated_at : new Date().toISOString()
  };

  // 检查是否有扩展字段
  const hasExtendedFields = [
    'created_by', 'meta_title', 'meta_description', 'sort_order',
    'categories', 'tool_tags', 'tags', 'category_name', 'category_slug',
    'author_id', 'author_name'
  ].some(field => field in raw);

  if (!hasExtendedFields) {
    return baseTool;
  }

  // 创建扩展工具对象
  const extendedTool: ToolExtended = {
    ...baseTool,
    created_by: typeof raw.created_by === 'string' ? raw.created_by : null,
    meta_title: typeof raw.meta_title === 'string' ? raw.meta_title : null,
    meta_description: typeof raw.meta_description === 'string' ? raw.meta_description : null,
    sort_order: typeof raw.sort_order === 'number' ? raw.sort_order : null,
    categories: raw.categories || null,
    tool_tags: raw.tool_tags || null,
    tags: Array.isArray(raw.tags) ? raw.tags.map(String) : [],
    category_name: typeof raw.category_name === 'string' ? raw.category_name : null,
    category_slug: typeof raw.category_slug === 'string' ? raw.category_slug : null,
    author_id: typeof raw.author_id === 'string' ? raw.author_id : null,
    author_name: typeof raw.author_name === 'string' ? raw.author_name : null
  };

  return extendedTool;
}

// 安全访问工具属性
export function getToolCategories(tool: Tool): CategoryRow | null {
  return isExtendedTool(tool) ? tool.categories : null;
}

export function getToolTags(tool: Tool): Array<{ tags: TagRow | null }> | null {
  return isExtendedTool(tool) ? tool.tool_tags : null;
}

export const useToolsStore = defineStore('tools', () => {
  const tools = ref<Tool[]>([])
  const featuredTools = computed(() => tools.value.filter(t => t.is_featured))
  const activeTools = computed(() => tools.value.filter(t => t.status === 'active'))
  const isLoading = ref(false)
  const loading = computed(() => isLoading.value) // 兼容性别名
  const error = ref<string | null>(null)
  const initialized = ref(false)
  
  // UI 状态
  const sidebarCollapsed = ref(false)
  const searchQuery = ref('')
  const selectedCategory = ref<string | null>(null)
  
  // 计算属性：过滤后的工具
  const filteredTools = computed(() => {
    let result = activeTools.value
    
    // 按搜索查询过滤
    if (searchQuery.value.trim()) {
      const query = searchQuery.value.toLowerCase()
      result = result.filter(tool => 
        tool.name.toLowerCase().includes(query) ||
        tool.description.toLowerCase().includes(query)
      )
    }
    
    // 按分类过滤
    if (selectedCategory.value) {
      result = result.filter(tool => tool.category_id === selectedCategory.value)
    }
    
    return result
  })

  function setTools(newTools: Tool[]) {
    tools.value = newTools.map(normalizeTool)
  }

  function getToolById(id: string): Tool | undefined {
    return tools.value.find(t => t.id === id)
  }
  
  // UI 状态管理方法
  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }
  
  function setSearchQuery(query: string) {
    searchQuery.value = query
  }
  
  function setSelectedCategory(categoryId: string | null) {
    selectedCategory.value = categoryId
  }
  
  function clearError() {
    error.value = null
  }
  
  // 业务逻辑方法
  async function incrementClickCount(toolId: string) {
    const tool = getToolById(toolId)
    if (tool) {
      tool.click_count++
      // TODO: 调用 API 更新服务器端数据
    }
  }
  
  async function toggleFavorite(toolId: string) {
    const tool = getToolById(toolId)
    if (tool) {
      tool.is_favorite = !tool.is_favorite
    }
    // TODO: 调用 API 更新服务器端数据
  }

  async function initialize() {
    if (initialized.value) return true
    
    try {
      isLoading.value = true
      error.value = null
      
      // 模拟工具数据，在实际项目中应该从 API 加载
      const mockTools: Tool[] = [
        {
          id: '1',
          name: 'GitHub',
          description: '世界上最大的代码托管平台',
          url: 'https://github.com',
          icon: '🐙',
          category_id: 'dev-tools',
          is_featured: true,
          is_favorite: false,
          click_count: 1250,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          name: 'VS Code',
          description: '微软开发的免费代码编辑器',
          url: 'https://code.visualstudio.com',
          icon: '💻',
          category_id: 'dev-tools',
          is_featured: true,
          is_favorite: false,
          click_count: 980,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '3',
          name: 'Figma',
          description: '协作式界面设计工具',
          url: 'https://figma.com',
          icon: '🎨',
          category_id: 'design-tools',
          is_featured: false,
          is_favorite: false,
          click_count: 750,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '4',
          name: 'Notion',
          description: '多功能笔记和知识管理工具',
          url: 'https://notion.so',
          icon: '📝',
          category_id: 'productivity',
          is_featured: true,
          is_favorite: false,
          click_count: 892,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '5',
          name: 'ChatGPT',
          description: 'OpenAI 开发的 AI 对话助手',
          url: 'https://chat.openai.com',
          icon: '🤖',
          category_id: 'ai-tools',
          is_featured: true,
          is_favorite: false,
          click_count: 2100,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]
      
      await new Promise(resolve => setTimeout(resolve, 500))
      setTools(mockTools)
      initialized.value = true
      return true
    } catch (err) {
      error.value = '加载工具数据失败'
      console.error('ToolsStore initialization error:', err)
      return false
    } finally {
      isLoading.value = false
    }
  }

  return {
    // 状态
    tools,
    featuredTools,
    activeTools,
    isLoading,
    loading, // 兼容性别名
    error,
    initialized,
    sidebarCollapsed,
    searchQuery,
    selectedCategory,
    filteredTools,
    
    // 方法
    setTools,
    getToolById,
    toggleSidebar,
    setSearchQuery,
    setSelectedCategory,
    clearError,
    incrementClickCount,
    toggleFavorite,
    initialize
  }
})