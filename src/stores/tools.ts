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
      
      // 检查环境配置
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      // 如果环境变量未配置或使用默认值，使用模拟数据
      if (!supabaseUrl || !supabaseAnonKey || 
          supabaseUrl.includes('your-project') || 
          supabaseAnonKey.includes('your-anon-key')) {
        console.warn('Supabase环境变量未配置，使用模拟工具数据');
        await loadMockTools();
        initialized.value = true
        return true
      }
      
      // 尝试从Supabase加载数据
      try {
        const { supabase, TABLES } = await import('@/lib/supabaseClient');
        const { data, error: queryError } = await supabase
          .from(TABLES.TOOLS)
          .select('*')
          .eq('status', 'active')
          .order('click_count', { ascending: false });
        
        if (queryError) throw queryError;
        
        if (data && data.length > 0) {
          setTools(data);
          console.log(`成功加载 ${data.length} 个工具`);
        } else {
          console.warn('Supabase返回空数据，使用模拟数据');
          await loadMockTools();
        }
      } catch (supabaseError) {
        console.warn('Supabase连接失败，使用模拟数据:', supabaseError);
        await loadMockTools();
      }
      
      initialized.value = true
      return true
    } catch (err) {
      error.value = '加载工具数据失败'
      console.error('ToolsStore initialization error:', err)
      // 即使出错也尝试加载模拟数据
      await loadMockTools();
      initialized.value = true
      return false
    } finally {
      isLoading.value = false
    }
  }
  
  // 加载模拟工具数据
  async function loadMockTools() {
    const mockTools: Tool[] = [
      {
        id: '1',
        name: 'GitHub',
        description: '世界上最大的代码托管平台，程序员的必备工具',
        url: 'https://github.com',
        icon: '🐙',
        category_id: '1', // 对应开发工具
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
        description: '微软开发的免费代码编辑器，支持丰富的扩展插件',
        url: 'https://code.visualstudio.com',
        icon: '💻',
        category_id: '1', // 对应开发工具
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
        description: '协作式界面设计工具，支持团队实时协作',
        url: 'https://figma.com',
        icon: '🎨',
        category_id: '2', // 对应设计工具
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
        description: '多功能笔记和知识管理工具，集文档、数据库、看板于一体',
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
        description: 'OpenAI 开发的 AI 对话助手，支持多种语言和任务',
        url: 'https://chat.openai.com',
        icon: '🤖',
        category_id: 'ai-tools',
        is_featured: true,
        is_favorite: false,
        click_count: 2100,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '6',
        name: 'Claude',
        description: 'Anthropic 开发的AI助手，擅长分析和推理',
        url: 'https://claude.ai',
        icon: '🧠',
        category_id: 'ai-tools',
        is_featured: true,
        is_favorite: false,
        click_count: 845,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '7',
        name: 'Canva',
        description: '在线设计平台，提供丰富的模板和设计元素',
        url: 'https://canva.com',
        icon: '🎨',
        category_id: 'design-tools',
        is_featured: false,
        is_favorite: false,
        click_count: 567,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '8',
        name: 'Slack',
        description: '团队协作和沟通工具，支持频道、私信和文件共享',
        url: 'https://slack.com',
        icon: '💬',
        category_id: 'productivity',
        is_featured: false,
        is_favorite: false,
        click_count: 432,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '9',
        name: 'Trello',
        description: '看板式项目管理工具，适合敏捷开发和任务管理',
        url: 'https://trello.com',
        icon: '📋',
        category_id: 'productivity',
        is_featured: false,
        is_favorite: false,
        click_count: 398,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '10',
        name: 'Stack Overflow',
        description: '程序员问答社区，解决编程问题的首选平台',
        url: 'https://stackoverflow.com',
        icon: '❓',
        category_id: 'dev-tools',
        is_featured: false,
        is_favorite: false,
        click_count: 1123,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '11',
        name: 'Dribbble',
        description: '设计师作品展示和灵感分享平台',
        url: 'https://dribbble.com',
        icon: '🏀',
        category_id: 'design-tools',
        is_featured: false,
        is_favorite: false,
        click_count: 234,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '12',
        name: 'Behance',
        description: 'Adobe 旗下的创意作品展示平台',
        url: 'https://behance.net',
        icon: '🎭',
        category_id: 'design-tools',
        is_featured: false,
        is_favorite: false,
        click_count: 189,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '13',
        name: 'Linear',
        description: '现代化的项目管理和问题跟踪工具',
        url: 'https://linear.app',
        icon: '📐',
        category_id: 'productivity',
        is_featured: false,
        is_favorite: false,
        click_count: 312,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '14',
        name: 'Vercel',
        description: '前端部署和托管平台，支持静态站点和Serverless',
        url: 'https://vercel.com',
        icon: '⚡',
        category_id: 'dev-tools',
        is_featured: false,
        is_favorite: false,
        click_count: 445,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '15',
        name: 'Netlify',
        description: '现代化的Web应用部署和托管服务',
        url: 'https://netlify.com',
        icon: '🌐',
        category_id: 'dev-tools',
        is_featured: false,
        is_favorite: false,
        click_count: 378,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '16',
        name: 'Midjourney',
        description: 'AI 图像生成工具，创造艺术级别的图像',
        url: 'https://midjourney.com',
        icon: '🖼️',
        category_id: 'ai-tools',
        is_featured: true,
        is_favorite: false,
        click_count: 789,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '17',
        name: 'Stable Diffusion',
        description: '开源AI图像生成模型，支持本地部署',
        url: 'https://stability.ai',
        icon: '🎨',
        category_id: 'ai-tools',
        is_featured: false,
        is_favorite: false,
        click_count: 623,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '18',
        name: 'Postman',
        description: 'API开发和测试工具，支持REST、GraphQL等',
        url: 'https://postman.com',
        icon: '📮',
        category_id: 'dev-tools',
        is_featured: false,
        is_favorite: false,
        click_count: 567,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '19',
        name: 'Docker',
        description: '容器化平台，简化应用部署和环境管理',
        url: 'https://docker.com',
        icon: '🐳',
        category_id: 'dev-tools',
        is_featured: false,
        is_favorite: false,
        click_count: 834,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '20',
        name: 'MongoDB Atlas',
        description: '云端NoSQL数据库服务，易于扩展',
        url: 'https://mongodb.com/atlas',
        icon: '🍃',
        category_id: 'dev-tools',
        is_featured: false,
        is_favorite: false,
        click_count: 445,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '21',
        name: 'Zoom',
        description: '视频会议和远程协作平台',
        url: 'https://zoom.us',
        icon: '📹',
        category_id: 'productivity',
        is_featured: false,
        is_favorite: false,
        click_count: 678,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '22',
        name: 'Airtable',
        description: '现代化的数据库工具，结合电子表格和数据库功能',
        url: 'https://airtable.com',
        icon: '📊',
        category_id: 'productivity',
        is_featured: false,
        is_favorite: false,
        click_count: 234,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '23',
        name: 'Grammarly',
        description: 'AI驱动的语法和写作助手',
        url: 'https://grammarly.com',
        icon: '✍️',
        category_id: 'productivity',
        is_featured: false,
        is_favorite: false,
        click_count: 456,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '24',
        name: 'Loom',
        description: '屏幕录制和视频分享工具，支持异步沟通',
        url: 'https://loom.com',
        icon: '🎥',
        category_id: 'productivity',
        is_featured: false,
        is_favorite: false,
        click_count: 321,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '25',
        name: 'Supabase',
        description: '开源的Firebase替代方案，提供数据库、认证等服务',
        url: 'https://supabase.com',
        icon: '⚡',
        category_id: 'dev-tools',
        is_featured: true,
        is_favorite: false,
        click_count: 567,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]
    
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 800))
    setTools(mockTools)
    console.log(`已加载 ${mockTools.length} 个模拟工具`)
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
    initialize,
    loadMockTools
  }
})