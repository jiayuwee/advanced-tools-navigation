# 🔄 Supabase 与本地管理集成文档

## 📋 概述

本文档详细说明了本地管理功能与 Supabase 数据库的集成方式，包括数据同步、冲突处理、权限控制等核心机制。

## 🗄️ 数据库架构匹配

### 核心表结构

本地管理功能完全兼容现有的 Supabase 数据库架构：

#### 工具表 (tools)
```sql
CREATE TABLE tools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  url TEXT NOT NULL,
  icon TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE RESTRICT,
  is_featured BOOLEAN DEFAULT false,
  click_count INTEGER DEFAULT 0,
  status tool_status DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE RESTRICT,
  meta_title TEXT,
  meta_description TEXT,
  sort_order INTEGER DEFAULT 0
);
```

#### 分类表 (categories)
```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 本地数据类型映射

```typescript
// 本地工具类型与数据库字段映射
interface LocalTool {
  // 数据库字段
  id?: string;                    // tools.id
  name: string;                   // tools.name
  description: string;            // tools.description
  url: string;                    // tools.url
  icon?: string;                  // tools.icon
  categoryId: string;             // tools.category_id
  isFeatured: boolean;            // tools.is_featured
  clickCount: number;             // tools.click_count
  
  // 本地管理字段
  localId?: string;               // 本地唯一标识
  isLocal?: boolean;              // 是否为本地数据
  lastModified?: string;          // 最后修改时间
  syncStatus?: 'pending' | 'synced' | 'conflict'; // 同步状态
}

// 数据转换函数
const transformLocalToolToDatabase = (localTool: LocalTool) => ({
  name: localTool.name,
  description: localTool.description,
  url: localTool.url,
  icon: localTool.icon,
  category_id: localTool.categoryId,
  is_featured: localTool.isFeatured,
  click_count: localTool.clickCount,
  status: 'active' as const
});

const transformDatabaseToLocalTool = (dbTool: any): LocalTool => ({
  id: dbTool.id,
  name: dbTool.name,
  description: dbTool.description,
  url: dbTool.url,
  icon: dbTool.icon,
  categoryId: dbTool.category_id,
  isFeatured: dbTool.is_featured,
  clickCount: dbTool.click_count,
  isLocal: false,
  syncStatus: 'synced'
});
```

## 🔄 数据同步机制

### 同步策略

1. **增量同步**: 只同步有变更的数据
2. **冲突检测**: 基于时间戳的冲突检测
3. **批量处理**: 批量处理离线操作减少网络请求
4. **重试机制**: 网络异常时的智能重试

### 同步实现

```typescript
// 同步服务实现
class SupabaseSyncService {
  // 同步本地工具到 Supabase
  static async syncLocalTool(localTool: LocalTool): Promise<void> {
    try {
      if (localTool.id) {
        // 更新现有工具
        const { error } = await supabase
          .from('tools')
          .update(transformLocalToolToDatabase(localTool))
          .eq('id', localTool.id);
          
        if (error) throw error;
      } else {
        // 创建新工具
        const { data, error } = await supabase
          .from('tools')
          .insert(transformLocalToolToDatabase(localTool))
          .select()
          .single();
          
        if (error) throw error;
        
        // 更新本地工具的 ID
        localTool.id = data.id;
      }
      
      localTool.syncStatus = 'synced';
    } catch (error) {
      localTool.syncStatus = 'conflict';
      throw error;
    }
  }

  // 从 Supabase 拉取工具数据
  static async pullTools(): Promise<LocalTool[]> {
    const { data, error } = await supabase
      .from('tools')
      .select(`
        *,
        category:categories(*)
      `)
      .eq('status', 'active')
      .order('sort_order');
      
    if (error) throw error;
    
    return data.map(transformDatabaseToLocalTool);
  }

  // 检测冲突
  static async detectConflicts(localTool: LocalTool): Promise<boolean> {
    if (!localTool.id) return false;
    
    const { data, error } = await supabase
      .from('tools')
      .select('updated_at')
      .eq('id', localTool.id)
      .single();
      
    if (error) return false;
    
    const remoteUpdated = new Date(data.updated_at);
    const localUpdated = new Date(localTool.lastModified || 0);
    
    return remoteUpdated > localUpdated;
  }
}
```

### 离线队列处理

```typescript
// 处理离线操作队列
const processOfflineQueue = async () => {
  const queue = LocalStorageService.getOfflineQueue();
  const results = [];
  
  for (const action of queue) {
    try {
      switch (action.type) {
        case 'create':
          await SupabaseSyncService.syncLocalTool(action.data);
          break;
        case 'update':
          await SupabaseSyncService.syncLocalTool(action.data);
          break;
        case 'delete':
          await supabase.from('tools').delete().eq('id', action.data.id);
          break;
      }
      results.push({ action, status: 'success' });
    } catch (error) {
      results.push({ action, status: 'failed', error });
    }
  }
  
  return results;
};
```

## 🔒 权限和安全

### 行级安全策略 (RLS)

```sql
-- 启用 RLS
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- 工具表权限策略
CREATE POLICY "Users can view active tools" ON tools
  FOR SELECT USING (status = 'active');

CREATE POLICY "Authenticated users can create tools" ON tools
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own tools" ON tools
  FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Admins can manage all tools" ON tools
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- 分类表权限策略
CREATE POLICY "Everyone can view active categories" ON categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage categories" ON categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );
```

### 数据验证

```typescript
// 数据验证函数
const validateToolData = (tool: Partial<LocalTool>): string[] => {
  const errors: string[] = [];
  
  if (!tool.name || tool.name.trim().length === 0) {
    errors.push('工具名称不能为空');
  }
  
  if (!tool.description || tool.description.trim().length === 0) {
    errors.push('工具描述不能为空');
  }
  
  if (!tool.url || !isValidUrl(tool.url)) {
    errors.push('请提供有效的工具链接');
  }
  
  if (!tool.categoryId) {
    errors.push('请选择工具分类');
  }
  
  return errors;
};

const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};
```

## 📡 实时数据订阅

### 实时更新监听

```typescript
// 设置实时数据订阅
const setupRealtimeSubscription = () => {
  const toolsChannel = supabase
    .channel('tools-changes')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'tools' },
      handleToolChange
    )
    .subscribe();
    
  const categoriesChannel = supabase
    .channel('categories-changes')
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'categories' },
      handleCategoryChange
    )
    .subscribe();
    
  return { toolsChannel, categoriesChannel };
};

// 处理远程数据变更
const handleToolChange = (payload: any) => {
  const { eventType, new: newRecord, old: oldRecord } = payload;
  
  switch (eventType) {
    case 'INSERT':
      // 新工具添加
      addRemoteToolToLocal(newRecord);
      break;
    case 'UPDATE':
      // 工具更新
      updateLocalToolFromRemote(newRecord);
      break;
    case 'DELETE':
      // 工具删除
      removeLocalTool(oldRecord.id);
      break;
  }
};
```

## 🔧 配置和环境

### 环境变量配置

```bash
# .env.local
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# 可选：本地开发环境
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=your-local-anon-key
```

### Supabase 客户端配置

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});
```

## 🧪 测试和验证

### 集成测试

```typescript
// 测试 Supabase 集成
describe('Supabase 本地管理集成', () => {
  test('同步本地工具到 Supabase', async () => {
    const localTool = createTestTool();
    await SupabaseSyncService.syncLocalTool(localTool);
    
    expect(localTool.id).toBeDefined();
    expect(localTool.syncStatus).toBe('synced');
  });
  
  test('从 Supabase 拉取工具数据', async () => {
    const tools = await SupabaseSyncService.pullTools();
    expect(Array.isArray(tools)).toBe(true);
  });
  
  test('冲突检测', async () => {
    const localTool = createTestTool();
    const hasConflict = await SupabaseSyncService.detectConflicts(localTool);
    expect(typeof hasConflict).toBe('boolean');
  });
});
```

### 手动验证步骤

1. **数据同步验证**
   - 在本地添加工具
   - 检查 Supabase 数据库是否同步
   - 验证数据完整性

2. **冲突处理验证**
   - 在多个客户端同时修改同一工具
   - 验证冲突检测机制
   - 确认冲突解决策略

3. **权限验证**
   - 测试不同用户角色的权限
   - 验证 RLS 策略生效
   - 确认数据安全性

## 📈 性能优化

### 数据库优化

```sql
-- 创建索引优化查询性能
CREATE INDEX IF NOT EXISTS idx_tools_category_id ON tools(category_id);
CREATE INDEX IF NOT EXISTS idx_tools_status ON tools(status);
CREATE INDEX IF NOT EXISTS idx_tools_created_by ON tools(created_by);
CREATE INDEX IF NOT EXISTS idx_tools_updated_at ON tools(updated_at);

-- 分类表索引
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON categories(is_active);
```

### 客户端优化

```typescript
// 批量操作优化
const batchSyncTools = async (tools: LocalTool[]) => {
  const batchSize = 10;
  const batches = [];
  
  for (let i = 0; i < tools.length; i += batchSize) {
    batches.push(tools.slice(i, i + batchSize));
  }
  
  for (const batch of batches) {
    await Promise.all(batch.map(tool => SupabaseSyncService.syncLocalTool(tool)));
  }
};

// 缓存优化
const toolsCache = new Map<string, LocalTool>();

const getCachedTool = (id: string): LocalTool | undefined => {
  return toolsCache.get(id);
};

const setCachedTool = (tool: LocalTool): void => {
  if (tool.id) {
    toolsCache.set(tool.id, tool);
  }
};
```

## 🚨 故障排除

### 常见问题

1. **同步失败**
   - 检查网络连接
   - 验证 Supabase 配置
   - 查看错误日志

2. **权限错误**
   - 确认用户认证状态
   - 检查 RLS 策略
   - 验证用户角色

3. **数据冲突**
   - 检查时间戳
   - 手动解决冲突
   - 重新同步数据

### 调试工具

```typescript
// 调试日志
const debugSync = (message: string, data?: any) => {
  if (import.meta.env.DEV) {
    console.log(`[Sync Debug] ${message}`, data);
  }
};

// 健康检查
const healthCheck = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.from('categories').select('count').single();
    return !error;
  } catch {
    return false;
  }
};
```

---

**本文档最后更新时间: 2024-12-19**
