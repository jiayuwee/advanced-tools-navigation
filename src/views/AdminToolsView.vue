<template>
  <div class="admin-tools-view">
    <div class="admin-header">
      <h1>工具管理</h1>
      <p>添加、编辑和管理工具数据</p>
    </div>

    <div class="admin-actions">
      <button class="action-button primary" @click="showAddModal = true">
        <PlusIcon class="icon" />
        添加新工具
      </button>

      <button class="action-button secondary" @click="refreshTools">
        <RefreshCwIcon class="icon" />
        刷新列表
      </button>

      <div class="search-tools">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索工具..."
          class="search-input"
        />
      </div>
    </div>

    <div v-if="message" class="message" :class="messageType">
      {{ message }}
    </div>

    <!-- 工具统计 -->
    <div class="tools-summary">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-number">{{ filteredTools.length }}</div>
          <div class="stat-label">总工具数</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ featuredCount }}</div>
          <div class="stat-label">推荐工具</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ categoriesStore.categories.length }}</div>
          <div class="stat-label">分类数</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ activeToolsCount }}</div>
          <div class="stat-label">活跃工具</div>
        </div>
      </div>
    </div>

    <!-- 工具列表 -->
    <div class="tools-management">
      <div class="tools-header">
        <h2>工具列表</h2>
        <div class="filter-controls">
          <select v-model="selectedCategory" class="category-filter">
            <option value="">全部分类</option>
            <option
              v-for="category in categoriesStore.categories"
              :key="category.id"
              :value="category.id"
            >
              {{ category.name }}
            </option>
          </select>
          <select v-model="statusFilter" class="status-filter">
            <option value="">全部状态</option>
            <option value="active">活跃</option>
            <option value="inactive">停用</option>
          </select>
        </div>
      </div>

      <div class="tools-table">
        <div class="table-header">
          <div class="col-icon">图标</div>
          <div class="col-name">名称</div>
          <div class="col-category">分类</div>
          <div class="col-status">状态</div>
          <div class="col-clicks">点击数</div>
          <div class="col-actions">操作</div>
        </div>

        <div v-for="tool in paginatedTools" :key="tool.id" class="table-row">
          <div class="col-icon">
            <span class="tool-icon">{{ tool.icon }}</span>
          </div>
          <div class="col-name">
            <div class="tool-name">{{ tool.name }}</div>
            <div class="tool-description">{{ tool.description }}</div>
          </div>
          <div class="col-category">
            <span class="category-badge">{{
              getCategoryName(tool.category_id) || "未分类"
            }}</span>
          </div>
          <div class="col-status">
            <span
              class="status-badge"
              :class="tool.status === 'active' ? 'active' : 'inactive'"
            >
              {{ tool.status === "active" ? "活跃" : "停用" }}
            </span>
          </div>
          <div class="col-clicks">{{ tool.click_count || 0 }}</div>
          <div class="col-actions">
            <button
              class="action-btn edit"
              @click="editTool(tool)"
              title="编辑"
            >
              <Edit class="icon" />
            </button>
            <button
              class="action-btn delete"
              @click="deleteTool(tool)"
              title="删除"
            >
              <TrashIcon class="icon" />
            </button>
            <button
              class="action-btn toggle"
              @click="toggleToolStatus(tool)"
              :title="tool.status === 'active' ? '停用' : '启用'"
            >
              <EyeIcon v-if="tool.status === 'active'" class="icon" />
              <EyeOffIcon v-else class="icon" />
            </button>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div v-if="totalPages > 1" class="pagination">
        <button
          :disabled="currentPage === 1"
          @click="currentPage--"
          class="page-btn"
        >
          上一页
        </button>
        <span class="page-info">
          第 {{ currentPage }} 页，共 {{ totalPages }} 页
        </span>
        <button
          :disabled="currentPage === totalPages"
          @click="currentPage++"
          class="page-btn"
        >
          下一页
        </button>
      </div>
    </div>

    <!-- 添加/编辑工具模态框 -->
    <div
      v-if="showAddModal || showEditModal"
      class="modal-overlay"
      @click="closeModals"
    >
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ showAddModal ? "添加新工具" : "编辑工具" }}</h3>
          <button class="close-btn" @click="closeModals">
            <XIcon class="icon" />
          </button>
        </div>

        <form @submit.prevent="saveTool" class="tool-form">
          <div class="form-grid">
            <div class="form-group">
              <label>工具名称 *</label>
              <input
                v-model="toolForm.name"
                type="text"
                required
                placeholder="输入工具名称"
              />
            </div>

            <div class="form-group">
              <label>工具图标</label>
              <input v-model="toolForm.icon" type="text" placeholder="🔧" />
            </div>

            <div class="form-group full-width">
              <label>工具描述 *</label>
              <textarea
                v-model="toolForm.description"
                required
                placeholder="描述工具的功能和用途"
                rows="3"
              ></textarea>
            </div>

            <div class="form-group">
              <label>工具链接 *</label>
              <input
                v-model="toolForm.url"
                type="url"
                required
                placeholder="https://example.com"
              />
            </div>

            <div class="form-group">
              <label>分类 *</label>
              <select v-model="toolForm.category_id" required>
                <option value="">选择分类</option>
                <option
                  v-for="category in categoriesStore.categories"
                  :key="category.id"
                  :value="category.id"
                >
                  {{ category.name }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label>状态</label>
              <select v-model="toolForm.status">
                <option value="active">活跃</option>
                <option value="inactive">停用</option>
              </select>
            </div>

            <div class="form-group">
              <label>
                <input v-model="toolForm.is_featured" type="checkbox" />
                推荐工具
              </label>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" @click="closeModals" class="cancel-btn">
              取消
            </button>
            <button type="submit" :disabled="saving" class="save-btn">
              {{ saving ? "保存中..." : "保存" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useToolsStore } from "../stores/tools";
import { useCategoriesStore } from "../stores/categories";
import { ToolsService } from "../services/toolsService";
import {
  PlusIcon,
  RefreshCwIcon,
  Edit,
  TrashIcon,
  EyeIcon,
  EyeOffIcon,
  XIcon,
} from "lucide-vue-next";
import type { Tool } from "../types";

const toolsStore = useToolsStore();
const categoriesStore = useCategoriesStore();

// 响应式数据
const loading = ref(false);
const saving = ref(false);
const message = ref("");
const messageType = ref<"success" | "error">("success");
const searchQuery = ref("");
const selectedCategory = ref("");
const statusFilter = ref("");
const currentPage = ref(1);
const pageSize = ref(10);

// 模态框状态
const showAddModal = ref(false);
const showEditModal = ref(false);
const editingTool = ref<Tool | null>(null);

// 工具表单
const toolForm = ref({
  name: "",
  description: "",
  url: "",
  icon: "🔧",
  category_id: "",
  status: "active" as "active" | "inactive" | "pending",
  is_featured: false,
});

// 计算属性
const filteredTools = computed(() => {
  let tools = toolsStore.tools;

  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    tools = tools.filter(
      (tool) =>
        tool.name.toLowerCase().includes(query) ||
        tool.description.toLowerCase().includes(query)
    );
  }

  // 分类过滤
  if (selectedCategory.value) {
    tools = tools.filter((tool) => tool.category_id === selectedCategory.value);
  }

  // 状态过滤
  if (statusFilter.value) {
    tools = tools.filter((tool) => tool.status === statusFilter.value);
  }

  return tools;
});

const featuredCount = computed(
  () => toolsStore.tools.filter((tool) => tool.is_featured).length
);

const activeToolsCount = computed(
  () => toolsStore.tools.filter((tool) => tool.status === "active").length
);

const totalPages = computed(() =>
  Math.ceil(filteredTools.value.length / pageSize.value)
);

const paginatedTools = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredTools.value.slice(start, end);
});

// 方法
const refreshTools = async () => {
  try {
    loading.value = true;
    await toolsStore.initialize();
    await categoriesStore.initialize();
    message.value = "工具列表已刷新";
    messageType.value = "success";
  } catch (error) {
    message.value = "刷新失败";
    messageType.value = "error";
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  toolForm.value = {
    name: "",
    description: "",
    url: "",
    icon: "🔧",
    category_id: "",
    status: "active",
    isFeatured: false,
  };
};

const closeModals = () => {
  showAddModal.value = false;
  showEditModal.value = false;
  editingTool.value = null;
  resetForm();
};

const editTool = (tool: Tool) => {
  editingTool.value = tool;
  toolForm.value = {
    name: tool.name,
    description: tool.description,
    url: tool.url,
    icon: tool.icon,
    category_id: tool.category_id,
    status: tool.status,
    is_featured: tool.is_featured,
  };
  showEditModal.value = true;
};

const saveTool = async () => {
  try {
    saving.value = true;
    message.value = "";

    if (showEditModal.value && editingTool.value) {
      // 更新工具
      await ToolsService.updateTool(editingTool.value.id, {
        name: toolForm.value.name,
        description: toolForm.value.description,
        url: toolForm.value.url,
        icon: toolForm.value.icon,
        category_id: toolForm.value.category_id,
        status: toolForm.value.status,
        is_featured: toolForm.value.is_featured,
      });
      message.value = "工具更新成功！";
    } else {
      // 创建新工具
      await ToolsService.createTool({
        name: toolForm.value.name,
        description: toolForm.value.description,
        url: toolForm.value.url,
        icon: toolForm.value.icon,
        category_id: toolForm.value.category_id,
        status: toolForm.value.status,
        is_featured: toolForm.value.is_featured,

        sort_order: 0,
      });
      message.value = "工具创建成功！";
    }

    messageType.value = "success";
    closeModals();
    await refreshTools();
  } catch (error) {
    console.error("保存工具失败:", error);
    message.value =
      "保存工具失败: " + (error instanceof Error ? error.message : "未知错误");
    messageType.value = "error";
  } finally {
    saving.value = false;
  }
};

const deleteTool = async (tool: Tool) => {
  if (!confirm(`确定要删除工具 "${tool.name}" 吗？此操作不可恢复。`)) {
    return;
  }

  try {
    await ToolsService.deleteTool(tool.id);
    message.value = "工具删除成功！";
    messageType.value = "success";
    await refreshTools();
  } catch (error) {
    console.error("删除工具失败:", error);
    message.value =
      "删除工具失败: " + (error instanceof Error ? error.message : "未知错误");
    messageType.value = "error";
  }
};

const toggleToolStatus = async (tool: Tool) => {
  try {
    const newStatus = tool.status === "active" ? "inactive" : "active";
    await ToolsService.updateTool(tool.id, { status: newStatus });
    message.value = `工具已${newStatus === "active" ? "启用" : "停用"}！`;
    messageType.value = "success";
    await refreshTools();
  } catch (error) {
    console.error("切换工具状态失败:", error);
    message.value = "操作失败";
    messageType.value = "error";
  }
};

onMounted(async () => {
  await toolsStore.initialize();
  await categoriesStore.initialize();
});
</script>

<style scoped>
.admin-tools-view {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  background: #f8fafc;
  min-height: 100vh;
}

.admin-header {
  text-align: center;
  margin-bottom: 30px;
}

.admin-header h1 {
  font-size: 32px;
  font-weight: 700;
  color: #1a202c;
  margin: 0 0 10px 0;
}

.admin-header p {
  color: #64748b;
  font-size: 16px;
  margin: 0;
}

.admin-actions {
  display: flex;
  gap: 15px;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.action-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.action-button .icon {
  width: 16px;
  height: 16px;
}

.action-button.primary {
  background: #3b82f6;
  color: white;
}

.action-button.primary:hover:not(:disabled) {
  background: #2563eb;
}

.action-button.secondary {
  background: #64748b;
  color: white;
}

.action-button.secondary:hover {
  background: #475569;
}

.action-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.search-tools {
  margin-left: auto;
}

.search-input {
  padding: 10px 15px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  width: 250px;
  transition: border-color 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.message {
  padding: 15px 20px;
  border-radius: 8px;
  margin-bottom: 25px;
  text-align: center;
  font-size: 14px;
}

.message.success {
  background: #dcfce7;
  color: #166534;
  border: 1px solid #bbf7d0;
}

.message.error {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.tools-summary {
  margin-bottom: 30px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-card {
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-number {
  font-size: 36px;
  font-weight: 700;
  color: #3b82f6;
  margin-bottom: 8px;
}

.stat-label {
  color: #64748b;
  font-size: 14px;
  font-weight: 500;
}

/* 工具管理 */
.tools-management {
  background: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.tools-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.tools-header h2 {
  font-size: 20px;
  font-weight: 600;
  color: #1a202c;
  margin: 0;
}

.filter-controls {
  display: flex;
  gap: 15px;
}

.category-filter,
.status-filter {
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  cursor: pointer;
}

.category-filter:focus,
.status-filter:focus {
  outline: none;
  border-color: #3b82f6;
}

/* 工具表格 */
.tools-table {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}

.table-header {
  display: grid;
  grid-template-columns: 60px 1fr 120px 80px 80px 120px;
  background: #f8fafc;
  padding: 15px;
  font-weight: 600;
  color: #374151;
  font-size: 14px;
  border-bottom: 1px solid #e2e8f0;
}

.table-row {
  display: grid;
  grid-template-columns: 60px 1fr 120px 80px 80px 120px;
  padding: 15px;
  border-bottom: 1px solid #f1f5f9;
  align-items: center;
  transition: background-color 0.2s;
}

.table-row:hover {
  background: #f8fafc;
}

.table-row:last-child {
  border-bottom: none;
}

.col-icon .tool-icon {
  font-size: 24px;
  display: block;
  text-align: center;
}

.col-name .tool-name {
  font-weight: 500;
  color: #1a202c;
  margin-bottom: 4px;
}

.col-name .tool-description {
  font-size: 12px;
  color: #64748b;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.category-badge {
  background: #e0f2fe;
  color: #0277bd;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.active {
  background: #dcfce7;
  color: #166534;
}

.status-badge.inactive {
  background: #fef2f2;
  color: #dc2626;
}

.col-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 6px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn .icon {
  width: 14px;
  height: 14px;
}

.action-btn.edit {
  background: #dbeafe;
  color: #1d4ed8;
}

.action-btn.edit:hover {
  background: #bfdbfe;
}

.action-btn.delete {
  background: #fef2f2;
  color: #dc2626;
}

.action-btn.delete:hover {
  background: #fecaca;
}

.action-btn.toggle {
  background: #f3f4f6;
  color: #6b7280;
}

.action-btn.toggle:hover {
  background: #e5e7eb;
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 25px;
}

.page-btn {
  padding: 8px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: white;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  color: #64748b;
  font-size: 14px;
}

/* 模态框 */
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
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 25px 25px 0 25px;
  margin-bottom: 25px;
}

.modal-header h3 {
  font-size: 20px;
  font-weight: 600;
  color: #1a202c;
  margin: 0;
}

.close-btn {
  padding: 8px;
  border: none;
  background: #f3f4f6;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background: #e5e7eb;
}

.close-btn .icon {
  width: 16px;
  height: 16px;
  color: #6b7280;
}

.tool-form {
  padding: 0 25px 25px 25px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
  font-size: 14px;
}

.form-group input,
.form-group textarea,
.form-group select {
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-group input[type="checkbox"] {
  width: auto;
  margin-right: 8px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
}

.cancel-btn,
.save-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn {
  background: #f8fafc;
  color: #64748b;
  border: 1px solid #e2e8f0;
}

.cancel-btn:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.save-btn {
  background: #3b82f6;
  color: white;
}

.save-btn:hover:not(:disabled) {
  background: #2563eb;
}

.save-btn:disabled {
  background: #94a3b8;
  cursor: not-allowed;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .admin-tools-view {
    padding: 15px;
  }

  .admin-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .search-tools {
    margin-left: 0;
  }

  .search-input {
    width: 100%;
  }

  .filter-controls {
    flex-direction: column;
    gap: 10px;
  }

  .table-header,
  .table-row {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .table-header {
    display: none;
  }

  .table-row {
    display: block;
    padding: 20px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    margin-bottom: 15px;
  }

  .col-name .tool-name {
    font-size: 16px;
    margin-bottom: 8px;
  }

  .col-actions {
    margin-top: 15px;
    justify-content: flex-end;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .modal-content {
    margin: 20px;
    max-height: calc(100vh - 40px);
  }
}
</style>
