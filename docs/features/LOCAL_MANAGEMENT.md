# 📱 本地管理功能文档

## 🎯 功能概述

本地管理功能为工具导航站提供了强大的离线数据管理能力，支持在无网络环境下进行工具管理、数据同步和个性化配置。

## ✨ 核心特性

### 1. 本地数据存储

- **本地工具管理**: 支持在本地添加、编辑、删除工具
- **离线操作**: 无网络环境下正常使用
- **数据持久化**: 使用 localStorage 确保数据不丢失
- **同步状态跟踪**: 实时显示数据同步状态

### 2. 智能数据同步

- **自动同步**: 网络恢复时自动同步本地数据
- **冲突处理**: 智能处理数据冲突
- **离线队列**: 离线操作自动排队等待同步
- **增量同步**: 只同步变更的数据

### 3. 用户偏好管理

- **主题设置**: 支持浅色/深色/自动主题
- **界面配置**: 自定义侧边栏、视图模式等
- **同步设置**: 配置自动同步策略
- **本地保存**: 偏好设置本地持久化

### 4. 数据管理工具

- **数据导出**: 导出本地数据为 JSON 格式
- **数据导入**: 从文件导入数据
- **存储监控**: 实时监控本地存储使用情况
- **数据清理**: 一键清空本地数据

## 🏗️ 技术架构

### 数据层

```typescript
// 本地存储服务
LocalStorageService
├── 工具数据管理 (getLocalTools, saveLocalTools)
├── 分类数据管理 (getLocalCategories, saveLocalCategories)
├── 用户偏好管理 (getUserPreferences, saveUserPreferences)
├── 离线队列管理 (getOfflineQueue, addOfflineAction)
└── 存储信息监控 (getStorageInfo)
```

### 状态管理

```typescript
// Pinia Store
useLocalManagementStore
├── 状态管理 (isOfflineMode, isSyncing, localTools)
├── 数据操作 (addLocalTool, updateLocalTool, deleteLocalTool)
├── 同步控制 (syncData, forceSyncData)
└── 偏好设置 (updateUserPreferences)
```

### 界面组件

```vue
// Vue 组件 LocalManagementView ├── 状态指示器 (在线/离线状态) ├── 统计卡片
(本地工具数、存储使用) ├── 工具管理 (添加、编辑、删除) ├── 偏好设置
(主题、同步配置) └── 数据管理 (导入、导出、清理)
```

## 🚀 使用指南

### 访问本地管理

1. 登录管理员账户
2. 进入管理后台 (`/admin`)
3. 点击侧边栏的"本地管理"

### 基本操作

#### 添加本地工具

1. 点击"添加工具"按钮
2. 填写工具信息（名称、描述、链接、图标）
3. 点击"添加"保存到本地

#### 管理离线数据

1. 查看"待同步"状态的工具
2. 网络恢复时点击"立即同步"
3. 监控同步进度和结果

#### 配置用户偏好

1. 在"偏好设置"区域调整配置
2. 选择主题模式
3. 配置自动同步选项

#### 数据备份与恢复

1. 点击"导出本地数据"下载备份文件
2. 使用"导入本地数据"恢复数据
3. 必要时使用"清空本地数据"重置

## 🔧 开发接口

### LocalStorageService API

```typescript
// 工具管理
LocalStorageService.getLocalTools(): LocalTool[]
LocalStorageService.addLocalTool(tool): LocalTool
LocalStorageService.updateLocalTool(id, updates): boolean
LocalStorageService.deleteLocalTool(id): boolean

// 分类管理
LocalStorageService.getLocalCategories(): LocalCategory[]
LocalStorageService.saveLocalCategories(categories): void

// 用户偏好
LocalStorageService.getUserPreferences(): UserPreferences
LocalStorageService.saveUserPreferences(preferences): void

// 离线队列
LocalStorageService.getOfflineQueue(): OfflineAction[]
LocalStorageService.addOfflineAction(action): void
LocalStorageService.clearOfflineQueue(): void

// 存储信息
LocalStorageService.getStorageInfo(): StorageInfo
LocalStorageService.getLastSyncTime(): string | null
LocalStorageService.setLastSyncTime(time): void
LocalStorageService.clearAllLocalData(): void
```

### Store API

```typescript
// 状态
const localStore = useLocalManagementStore();
localStore.isOfflineMode; // 离线模式状态
localStore.isSyncing; // 同步状态
localStore.localTools; // 本地工具列表
localStore.pendingSyncCount; // 待同步数量

// 方法
localStore.addLocalTool(toolData); // 添加本地工具
localStore.updateLocalTool(id, updates); // 更新本地工具
localStore.deleteLocalTool(id); // 删除本地工具
localStore.syncData(); // 同步数据
localStore.toggleOfflineMode(); // 切换离线模式
```

## 🗄️ Supabase 集成

### 数据库表映射

本地管理功能与 Supabase 数据库的表结构完全兼容：

```sql
-- 工具表 (tools)
CREATE TABLE tools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  url TEXT NOT NULL,
  icon TEXT,
  category_id UUID REFERENCES categories(id),
  is_featured BOOLEAN DEFAULT false,
  click_count INTEGER DEFAULT 0,
  status tool_status DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  meta_title TEXT,
  meta_description TEXT,
  sort_order INTEGER DEFAULT 0
);

-- 分类表 (categories)
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  parent_id UUID REFERENCES categories(id),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 数据同步机制

```typescript
// 同步本地工具到 Supabase
const syncLocalToolToSupabase = async (localTool: LocalTool) => {
  const { data, error } = await supabase.from("tools").insert({
    name: localTool.name,
    description: localTool.description,
    url: localTool.url,
    icon: localTool.icon,
    category_id: localTool.categoryId,
    is_featured: localTool.isFeatured,
    click_count: localTool.clickCount,
    status: "active",
  });

  if (error) throw error;
  return data;
};

// 从 Supabase 拉取最新数据
const pullFromSupabase = async () => {
  const { data: tools, error } = await supabase
    .from("tools")
    .select(
      `
      *,
      category:categories(*)
    `
    )
    .eq("status", "active")
    .order("sort_order");

  if (error) throw error;
  return tools;
};
```

### 实时数据订阅

```typescript
// 监听 Supabase 实时更新
const subscribeToChanges = () => {
  const channel = supabase
    .channel("tools-changes")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "tools" },
      (payload) => {
        console.log("工具数据变更:", payload);
        // 更新本地数据
        handleRemoteChange(payload);
      }
    )
    .subscribe();

  return channel;
};
```

### 权限和安全

```sql
-- 行级安全策略 (RLS)
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;

-- 用户只能查看激活的工具
CREATE POLICY "Users can view active tools" ON tools
  FOR SELECT USING (status = 'active');

-- 管理员可以管理所有工具
CREATE POLICY "Admins can manage tools" ON tools
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );
```

## 🧪 测试功能

### 自动化测试

访问 `/admin/local-test` 运行完整的功能测试套件：

1. **本地存储服务初始化测试**
2. **添加本地工具测试**
3. **更新本地工具测试**
4. **删除本地工具测试**
5. **用户偏好设置测试**
6. **离线队列管理测试**
7. **存储使用情况测试**
8. **数据导出功能测试**

### 手动测试场景

1. **离线模式测试**: 断网后添加工具，联网后同步
2. **数据持久化测试**: 刷新页面后数据是否保持
3. **存储限制测试**: 添加大量数据测试存储限制
4. **导入导出测试**: 导出数据后清空再导入验证

## 📊 性能优化

### 存储优化

- 使用 JSON 压缩减少存储空间
- 定期清理过期的离线操作
- 监控存储使用情况防止溢出

### 同步优化

- 批量处理离线操作减少网络请求
- 增量同步只传输变更数据
- 智能重试机制处理网络异常

### 界面优化

- 虚拟滚动处理大量数据
- 懒加载减少初始化时间
- 防抖处理用户输入

## 🔒 安全考虑

### 数据安全

- 敏感数据不存储在 localStorage
- 定期清理临时数据
- 验证导入数据的完整性

### 权限控制

- 只有管理员可以访问本地管理功能
- 操作日志记录审计追踪
- 数据导出需要确认操作

## 🚀 未来规划

### 功能扩展

- [ ] 支持 IndexedDB 存储更大数据量
- [ ] 实现数据加密存储
- [ ] 添加数据版本控制
- [ ] 支持多设备数据同步

### 性能提升

- [ ] 实现 Service Worker 离线缓存
- [ ] 优化大数据量的处理性能
- [ ] 添加数据压缩算法
- [ ] 实现智能预加载

### 用户体验

- [ ] 添加数据同步进度条
- [ ] 实现拖拽排序功能
- [ ] 支持批量操作
- [ ] 添加快捷键支持

## 📞 技术支持

如有问题或建议，请联系开发团队或在项目仓库提交 Issue。

---

_本文档最后更新时间: 2024-12-19_
