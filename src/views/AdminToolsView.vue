<template>
  <div class="admin-tools-view">
    <div class="admin-header">
      <h1>管理工具</h1>
      <p>添加和管理工具数据</p>
    </div>

    <div class="admin-actions">
      <button
        class="action-button primary"
        :disabled="loading"
        @click="addNewTools"
      >
        {{ loading ? "添加中..." : "添加新工具" }}
      </button>

      <button class="action-button secondary" @click="refreshTools">
        刷新工具列表
      </button>
    </div>

    <div v-if="message" class="message" :class="messageType">
      {{ message }}
    </div>

    <div class="tools-summary">
      <h2>当前工具统计</h2>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-number">{{ toolsStore.tools.length }}</div>
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
      </div>
    </div>

    <div class="tools-preview">
      <h2>最新添加的工具</h2>
      <div class="tools-grid">
        <div v-for="tool in recentTools" :key="tool.id" class="tool-card">
          <div class="tool-icon">{{ tool.icon }}</div>
          <div class="tool-info">
            <h3>{{ tool.name }}</h3>
            <p>{{ tool.description }}</p>
            <div class="tool-meta">
              <span class="category">{{ tool.category?.name }}</span>
              <span class="clicks">{{ tool.clickCount }} 次点击</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useToolsStore } from "../stores/tools";
import { useCategoriesStore } from "../stores/categories";
import { addAdditionalTools } from "../utils/add-tools";

const toolsStore = useToolsStore();
const categoriesStore = useCategoriesStore();

const loading = ref(false);
const message = ref("");
const messageType = ref<"success" | "error">("success");

const featuredCount = computed(
  () => toolsStore.tools.filter((tool) => tool.isFeatured).length,
);

const recentTools = computed(() =>
  toolsStore.tools
    .slice()
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 6),
);

const addNewTools = async () => {
  try {
    loading.value = true;
    message.value = "";

    await addAdditionalTools();

    // 刷新工具列表
    await toolsStore.initialize();

    message.value = "成功添加新工具！";
    messageType.value = "success";
  } catch (error) {
    console.error("添加工具失败:", error);
    message.value =
      "添加工具失败: " + (error instanceof Error ? error.message : "未知错误");
    messageType.value = "error";
  } finally {
    loading.value = false;
  }
};

const refreshTools = async () => {
  try {
    await toolsStore.initialize();
    await categoriesStore.initialize();
    message.value = "工具列表已刷新";
    messageType.value = "success";
  } catch (error) {
    message.value = "刷新失败";
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
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.admin-header {
  text-align: center;
  margin-bottom: 2rem;
}

.admin-header h1 {
  font-size: 2.5rem;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
}

.admin-header p {
  color: #666;
  font-size: 1.1rem;
}

.admin-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 2rem;
}

.action-button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.action-button.primary {
  background: #007bff;
  color: white;
}

.action-button.primary:hover:not(:disabled) {
  background: #0056b3;
}

.action-button.secondary {
  background: #6c757d;
  color: white;
}

.action-button.secondary:hover {
  background: #545b62;
}

.action-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.message {
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  text-align: center;
}

.message.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.message.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.tools-summary {
  margin-bottom: 3rem;
}

.tools-summary h2 {
  margin-bottom: 1rem;
  color: #1a1a1a;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: bold;
  color: #007bff;
  margin-bottom: 0.5rem;
}

.stat-label {
  color: #666;
  font-size: 0.9rem;
}

.tools-preview h2 {
  margin-bottom: 1rem;
  color: #1a1a1a;
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.tool-card {
  background: white;
  padding: 1rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.tool-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.tool-info {
  flex: 1;
}

.tool-info h3 {
  margin: 0 0 0.5rem 0;
  color: #1a1a1a;
  font-size: 1.1rem;
}

.tool-info p {
  margin: 0 0 0.5rem 0;
  color: #666;
  font-size: 0.9rem;
  line-height: 1.4;
}

.tool-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.8rem;
  color: #888;
}

.category {
  background: #e9ecef;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
}
</style>
