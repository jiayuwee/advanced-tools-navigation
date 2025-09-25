// 工具类型定义
interface ToolBase {
  id: string;
  name: string;
  description: string;
  url: string | null;
  icon: string | null;
  category_id: string | null;
  is_featured: boolean;
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