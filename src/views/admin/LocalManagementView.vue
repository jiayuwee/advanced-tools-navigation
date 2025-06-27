<template>
  <div class="local-management-view">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h2 class="page-title">本地管理</h2>
        <div class="status-indicators">
          <div
            class="status-item"
            :class="{ online: isOnline, offline: !isOnline }"
          >
            <div class="status-dot"></div>
            <span>{{ isOnline ? "在线" : "离线" }}</span>
          </div>
          <div v-if="pendingSyncCount > 0" class="status-item pending">
            <ClockIcon class="icon" />
            <span>{{ pendingSyncCount }} 项待同步</span>
          </div>
        </div>
      </div>
      <div class="header-actions">
        <button
          class="btn secondary"
          :disabled="isSyncing"
          @click="toggleOfflineMode"
        >
          <WifiOffIcon v-if="!isOfflineMode" class="icon" />
          <WifiIcon v-else class="icon" />
          {{ isOfflineMode ? "启用在线模式" : "启用离线模式" }}
        </button>
        <button
          class="btn primary"
          :disabled="!isOnline || isSyncing || pendingSyncCount === 0"
          @click="handleSync"
        >
          <RefreshCwIcon class="icon" :class="{ spinning: isSyncing }" />
          {{ isSyncing ? "同步中..." : "立即同步" }}
        </button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">
          <WrenchIcon class="icon" />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ localTools.length }}</div>
          <div class="stat-label">本地工具</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">
          <FolderIcon class="icon" />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ localCategories.length }}</div>
          <div class="stat-label">本地分类</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">
          <HardDriveIcon class="icon" />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ formatBytes(storageInfo.used) }}</div>
          <div class="stat-label">存储使用</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">
          <ClockIcon class="icon" />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ formatLastSync }}</div>
          <div class="stat-label">最后同步</div>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="content-grid">
      <!-- 本地工具管理 -->
      <div class="content-section">
        <div class="section-header">
          <h3>本地工具</h3>
          <button class="btn small primary" @click="showAddToolModal = true">
            <PlusIcon class="icon" />
            添加工具
          </button>
        </div>
        <div class="tools-list">
          <div
            v-for="tool in localTools"
            :key="tool.localId || tool.id"
            class="tool-item"
            :class="{ pending: tool.syncStatus === 'pending' }"
          >
            <div class="tool-info">
              <div class="tool-icon">{{ tool.icon || "🔧" }}</div>
              <div class="tool-details">
                <h4>{{ tool.name }}</h4>
                <p>{{ tool.description }}</p>
                <div class="tool-meta">
                  <span class="sync-status" :class="tool.syncStatus">
                    {{ getSyncStatusText(tool.syncStatus) }}
                  </span>
                  <span class="modified-time">
                    {{ formatTime(tool.lastModified) }}
                  </span>
                </div>
              </div>
            </div>
            <div class="tool-actions">
              <button class="btn small secondary" @click="editTool(tool)">
                <EditIcon class="icon" />
              </button>
              <button class="btn small danger" @click="deleteTool(tool)">
                <TrashIcon class="icon" />
              </button>
            </div>
          </div>
          <div v-if="localTools.length === 0" class="empty-state">
            <WrenchIcon class="empty-icon" />
            <p>暂无本地工具</p>
          </div>
        </div>
      </div>

      <!-- 用户偏好设置 -->
      <div class="content-section">
        <div class="section-header">
          <h3>偏好设置</h3>
        </div>
        <div class="preferences-form">
          <div class="form-group">
            <label>主题</label>
            <select v-model="preferences.theme" @change="updatePreferences">
              <option value="auto">自动</option>
              <option value="light">浅色</option>
              <option value="dark">深色</option>
            </select>
          </div>
          <div class="form-group">
            <label>默认视图</label>
            <select
              v-model="preferences.defaultView"
              @change="updatePreferences"
            >
              <option value="grid">网格</option>
              <option value="list">列表</option>
            </select>
          </div>
          <div class="form-group">
            <label class="checkbox-label">
              <input
                v-model="preferences.autoSync"
                type="checkbox"
                @change="updatePreferences"
              />
              <span>自动同步</span>
            </label>
          </div>
          <div class="form-group">
            <label class="checkbox-label">
              <input
                v-model="preferences.sidebarCollapsed"
                type="checkbox"
                @change="updatePreferences"
              />
              <span>折叠侧边栏</span>
            </label>
          </div>
        </div>
      </div>

      <!-- 数据管理 -->
      <div class="content-section">
        <div class="section-header">
          <h3>数据管理</h3>
        </div>
        <div class="data-actions">
          <button class="btn secondary full-width" @click="exportData">
            <DownloadIcon class="icon" />
            导出本地数据
          </button>
          <button class="btn secondary full-width" @click="triggerImport">
            <UploadIcon class="icon" />
            导入本地数据
          </button>
          <input
            ref="fileInput"
            type="file"
            accept=".json"
            style="display: none"
            @change="handleImport"
          />
          <button class="btn danger full-width" @click="confirmClearData">
            <TrashIcon class="icon" />
            清空本地数据
          </button>
        </div>

        <!-- 存储使用情况 -->
        <div class="storage-usage">
          <div class="usage-header">
            <span>存储使用情况</span>
            <span>{{ storageInfo.percentage.toFixed(1) }}%</span>
          </div>
          <div class="usage-bar">
            <div
              class="usage-fill"
              :style="{ width: `${Math.min(storageInfo.percentage, 100)}%` }"
            ></div>
          </div>
          <div class="usage-details">
            <span
              >{{ formatBytes(storageInfo.used) }} /
              {{ formatBytes(storageInfo.total) }}</span
            >
          </div>
        </div>
      </div>
    </div>

    <!-- 添加工具模态框 -->
    <div
      v-if="showAddToolModal"
      class="modal-overlay"
      @click="closeAddToolModal"
    >
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>添加本地工具</h3>
          <button class="close-btn" @click="closeAddToolModal">
            <XIcon class="icon" />
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>工具名称</label>
            <input
              v-model="newTool.name"
              type="text"
              placeholder="输入工具名称"
            />
          </div>
          <div class="form-group">
            <label>工具描述</label>
            <textarea
              v-model="newTool.description"
              placeholder="输入工具描述"
            ></textarea>
          </div>
          <div class="form-group">
            <label>工具链接</label>
            <input
              v-model="newTool.url"
              type="url"
              placeholder="https://example.com"
            />
          </div>
          <div class="form-group">
            <label>工具图标</label>
            <input v-model="newTool.icon" type="text" placeholder="🔧" />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn secondary" @click="closeAddToolModal">取消</button>
          <button
            class="btn primary"
            :disabled="!newTool.name"
            @click="addTool"
          >
            添加
          </button>
        </div>
      </div>
    </div>

    <!-- 错误提示 -->
    <div v-if="syncError" class="error-toast">
      <AlertCircleIcon class="icon" />
      <span>{{ syncError }}</span>
      <button @click="syncError = null">
        <XIcon class="icon" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useLocalManagementStore } from "../../stores/localManagement";
import {
  WifiIcon,
  WifiOffIcon,
  RefreshCwIcon,
  ClockIcon,
  WrenchIcon,
  FolderIcon,
  HardDriveIcon,
  PlusIcon,
  EditIcon,
  TrashIcon,
  DownloadIcon,
  UploadIcon,
  XIcon,
  AlertCircleIcon,
} from "lucide-vue-next";

const localStore = useLocalManagementStore();

// 响应式引用
const showAddToolModal = ref(false);
const fileInput = ref<HTMLInputElement>();
const newTool = ref({
  name: "",
  description: "",
  url: "",
  icon: "🔧",
});

// 计算属性
const {
  isOfflineMode,
  isSyncing,
  syncError,
  lastSyncTime,
  userPreferences,
  localTools,
  localCategories,
  pendingSyncCount,
  storageInfo,
  isOnline,
} = localStore;

const preferences = computed({
  get: () => userPreferences.value,
  set: (value) => localStore.updateUserPreferences(value),
});

const formatLastSync = computed(() => {
  if (!lastSyncTime.value) return "从未同步";
  const date = new Date(lastSyncTime.value);
  return date.toLocaleString("zh-CN");
});

// 方法
const handleSync = async () => {
  try {
    await localStore.forceSyncData();
  } catch (error) {
    console.error("同步失败:", error);
  }
};

const toggleOfflineMode = () => {
  localStore.toggleOfflineMode();
};

const updatePreferences = () => {
  localStore.updateUserPreferences(preferences.value);
};

const addTool = () => {
  try {
    localStore.addLocalTool({
      name: newTool.value.name,
      description: newTool.value.description,
      url: newTool.value.url,
      icon: newTool.value.icon,
      categoryId: "", // 默认分类
      tags: [],
      isFeatured: false,
      clickCount: 0,
    });
    closeAddToolModal();
  } catch (error) {
    console.error("添加工具失败:", error);
  }
};

const editTool = (tool: any) => {
  // TODO: 实现编辑功能
  console.log("编辑工具:", tool);
};

const deleteTool = (tool: any) => {
  if (confirm("确定要删除这个工具吗？")) {
    localStore.deleteLocalTool(tool.id || tool.localId);
  }
};

const closeAddToolModal = () => {
  showAddToolModal.value = false;
  newTool.value = {
    name: "",
    description: "",
    url: "",
    icon: "🔧",
  };
};

const exportData = () => {
  localStore.exportLocalData();
};

const triggerImport = () => {
  fileInput.value?.click();
};

const handleImport = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) {
    try {
      await localStore.importLocalData(file);
    } catch (error) {
      console.error("导入失败:", error);
    }
  }
};

const confirmClearData = () => {
  if (confirm("确定要清空所有本地数据吗？此操作不可恢复。")) {
    localStore.clearLocalData();
  }
};

const getSyncStatusText = (status?: string) => {
  const statusMap = {
    pending: "待同步",
    synced: "已同步",
    conflict: "冲突",
  };
  return statusMap[status || "synced"] || "未知";
};

const formatTime = (time?: string) => {
  if (!time) return "";
  return new Date(time).toLocaleString("zh-CN");
};

const formatBytes = (bytes: number) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// 生命周期
onMounted(() => {
  localStore.initialize();
});

onUnmounted(() => {
  window.removeEventListener("online", () => {});
  window.removeEventListener("offline", () => {});
});
</script>

<style scoped>
.local-management-view {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 24px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.status-indicators {
  display: flex;
  gap: 16px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
}

.status-item.online {
  background: #dcfce7;
  color: #166534;
}

.status-item.offline {
  background: #fee2e2;
  color: #991b1b;
}

.status-item.pending {
  background: #fef3c7;
  color: #92400e;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.stat-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon .icon {
  width: 24px;
  height: 24px;
  color: #6b7280;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #111827;
}

.stat-label {
  font-size: 14px;
  color: #6b7280;
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.content-section {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.tools-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tool-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  transition: all 0.2s;
}

.tool-item:hover {
  border-color: #d1d5db;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.tool-item.pending {
  border-color: #fbbf24;
  background: #fffbeb;
}

.tool-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.tool-icon {
  font-size: 20px;
  width: 32px;
  text-align: center;
}

.tool-details h4 {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 4px 0;
}

.tool-details p {
  font-size: 12px;
  color: #6b7280;
  margin: 0 0 8px 0;
}

.tool-meta {
  display: flex;
  gap: 12px;
  font-size: 11px;
}

.sync-status {
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
}

.sync-status.pending {
  background: #fef3c7;
  color: #92400e;
}

.sync-status.synced {
  background: #dcfce7;
  color: #166534;
}

.modified-time {
  color: #9ca3af;
}

.tool-actions {
  display: flex;
  gap: 8px;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #9ca3af;
}

.empty-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 16px;
  opacity: 0.5;
}

.preferences-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.form-group select,
.form-group input[type="text"],
.form-group input[type="url"],
.form-group textarea {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
}

.checkbox-label {
  flex-direction: row !important;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.data-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.storage-usage {
  margin-top: 24px;
}

.usage-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
}

.usage-bar {
  height: 8px;
  background: #f3f4f6;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.usage-fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981, #fbbf24, #ef4444);
  transition: width 0.3s;
}

.usage-details {
  font-size: 12px;
  color: #6b7280;
  text-align: center;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn.primary {
  background: #3b82f6;
  color: white;
}

.btn.primary:hover:not(:disabled) {
  background: #2563eb;
}

.btn.secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn.secondary:hover:not(:disabled) {
  background: #e5e7eb;
}

.btn.danger {
  background: #ef4444;
  color: white;
}

.btn.danger:hover:not(:disabled) {
  background: #dc2626;
}

.btn.small {
  padding: 6px 12px;
  font-size: 12px;
}

.btn.full-width {
  width: 100%;
  justify-content: center;
}

.btn .icon {
  width: 16px;
  height: 16px;
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
}

.close-btn:hover {
  background: #f3f4f6;
}

.modal-body {
  padding: 24px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #e5e7eb;
}

.error-toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: #fee2e2;
  color: #991b1b;
  padding: 12px 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
}

.error-toast button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px;
  border-radius: 2px;
}

@media (max-width: 768px) {
  .content-grid {
    grid-template-columns: 1fr;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .header-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
