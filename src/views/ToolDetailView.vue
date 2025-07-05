<template>
  <div class="tool-detail-view">
    <div class="container">
      <!-- 返回按钮 -->
      <button class="back-button" @click="goBack">
        <ArrowLeftIcon class="icon" />
        返回工具列表
      </button>

      <!-- 工具详情卡片 -->
      <div v-if="tool" class="tool-detail-card">
        <!-- 工具头部信息 -->
        <div class="tool-header">
          <div class="tool-icon">{{ tool.icon || "🔧" }}</div>
          <div class="tool-info">
            <h1 class="tool-name">{{ tool.name }}</h1>
            <p class="tool-description">{{ tool.description }}</p>
            <div class="tool-meta">
              <span class="category">{{ tool.categories?.name }}</span>
              <span class="clicks">{{ tool.click_count }} 次使用</span>
            </div>
          </div>
          <div class="tool-actions">
            <button class="primary-button" @click="openTool">
              <ExternalLinkIcon class="icon" />
              访问工具
            </button>
            <button
              class="favorite-button"
              :class="{ favorited: isFavorited }"
              @click="toggleFavorite"
            >
              <StarIcon class="icon" />
              {{ isFavorited ? "已收藏" : "收藏" }}
            </button>
          </div>
        </div>

        <!-- 功能特性 -->
        <div v-if="tool.features" class="features-section">
          <h2>主要功能</h2>
          <div class="features-grid">
            <div
              v-for="feature in tool.features"
              :key="feature"
              class="feature-item"
            >
              <CheckIcon class="icon" />
              {{ feature }}
            </div>
          </div>
        </div>

        <!-- 使用教程 -->
        <div v-if="tool.tutorial_content" class="tutorial-section">
          <h2>使用教程</h2>
          <div
            class="tutorial-content"
            v-html="formatMarkdown(tool.tutorial_content)"
          ></div>
        </div>

        <!-- 视频教程 -->
        <div v-if="tool.tutorial_video_url" class="video-section">
          <h2>视频教程</h2>
          <div class="video-container">
            <iframe
              :src="tool.tutorial_video_url"
              frameborder="0"
              allowfullscreen
            ></iframe>
          </div>
        </div>

        <!-- 优缺点分析 -->
        <div v-if="tool.pros_cons" class="pros-cons-section">
          <h2>优缺点分析</h2>
          <div class="pros-cons-grid">
            <div class="pros">
              <h3><ThumbsUpIcon class="icon" /> 优点</h3>
              <ul>
                <li v-for="pro in tool.pros_cons.pros" :key="pro">{{ pro }}</li>
              </ul>
            </div>
            <div class="cons">
              <h3><ThumbsDownIcon class="icon" /> 缺点</h3>
              <ul>
                <li v-for="con in tool.pros_cons.cons" :key="con">{{ con }}</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- 价格信息 -->
        <div v-if="tool.pricing_info" class="pricing-section">
          <h2>价格信息</h2>
          <div class="pricing-content">{{ tool.pricing_info }}</div>
        </div>

        <!-- 工具评分 -->
        <ToolRating :tool-id="tool.id" />

        <!-- 相关工具推荐 -->
        <div class="related-tools-section">
          <h2>相关工具推荐</h2>
          <div class="related-tools-grid">
            <div
              v-for="relatedTool in relatedTools"
              :key="relatedTool.id"
              class="related-tool-card"
              @click="goToTool(relatedTool.id)"
            >
              <div class="tool-icon">{{ relatedTool.icon || "🔧" }}</div>
              <div class="tool-name">{{ relatedTool.name }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-else-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>正在加载工具详情...</p>
      </div>

      <!-- 错误状态 -->
      <div v-else class="error-state">
        <p>工具不存在或加载失败</p>
        <button class="secondary-button" @click="goBack">返回</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useToolsStore } from "@/stores/tools";
import { useAuthStore } from "@/stores/auth";
import ToolRating from "@/components/ToolRating.vue";
import {
  ArrowLeftIcon,
  ExternalLinkIcon,
  StarIcon,
  CheckIcon,
  ThumbsUpIcon,
  ThumbsDownIcon,
} from "lucide-vue-next";

const route = useRoute();
const router = useRouter();
const toolsStore = useToolsStore();
const authStore = useAuthStore();

const tool = ref(null);
const loading = ref(true);
const relatedTools = ref([]);

const isFavorited = computed(() => {
  // TODO: 实现收藏状态检查
  return false;
});

onMounted(async () => {
  await loadToolDetail();
});

const loadToolDetail = async () => {
  try {
    loading.value = true;
    const toolId = route.params.id as string;

    // 从store中查找工具
    await toolsStore.initialize();
    tool.value = toolsStore.tools.find((t) => t.id === toolId);

    if (tool.value) {
      // 加载相关工具
      relatedTools.value = toolsStore.tools
        .filter(
          (t) =>
            t.category_id === tool.value.category_id && t.id !== tool.value.id,
        )
        .slice(0, 4);
    }
  } catch (error) {
    console.error("加载工具详情失败:", error);
  } finally {
    loading.value = false;
  }
};

const goBack = () => {
  router.back();
};

const openTool = async () => {
  if (!tool.value?.url) {
    alert("该工具暂无可用链接");
    return;
  }

  try {
    let url = tool.value.url.trim();
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }

    await toolsStore.incrementClickCount(tool.value.id);
    window.open(url, "_blank", "noopener,noreferrer");
  } catch (error) {
    console.error("打开链接失败:", error);
    alert("无法打开该链接");
  }
};

const toggleFavorite = () => {
  if (!authStore.isAuthenticated) {
    router.push("/auth/login");
    return;
  }
  // TODO: 实现收藏功能
};

const goToTool = (toolId: string) => {
  router.push(`/tools/${toolId}`);
};

const formatMarkdown = (content: string) => {
  // 简单的Markdown格式化
  return content
    .replace(/### (.*)/g, "<h3>$1</h3>")
    .replace(/## (.*)/g, "<h2>$1</h2>")
    .replace(/# (.*)/g, "<h1>$1</h1>")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/\n/g, "<br>");
};
</script>

<style scoped>
.tool-detail-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 8px;
  padding: 12px 16px;
  cursor: pointer;
  margin-bottom: 20px;
  transition: all 0.2s ease;
}

.back-button:hover {
  background: rgba(255, 255, 255, 1);
  transform: translateY(-1px);
}

.tool-detail-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.tool-header {
  display: flex;
  align-items: flex-start;
  gap: 24px;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.tool-icon {
  font-size: 48px;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  color: white;
}

.tool-info {
  flex: 1;
}

.tool-name {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: #333;
}

.tool-description {
  font-size: 16px;
  color: #666;
  margin: 0 0 12px 0;
  line-height: 1.6;
}

.tool-meta {
  display: flex;
  gap: 16px;
}

.category,
.clicks {
  padding: 4px 12px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 20px;
  font-size: 14px;
  color: #667eea;
}

.tool-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.primary-button,
.favorite-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
}

.primary-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.favorite-button {
  background: rgba(255, 193, 7, 0.1);
  color: #ff9800;
  border: 1px solid rgba(255, 193, 7, 0.3);
}

.favorite-button.favorited {
  background: #ff9800;
  color: white;
}

.features-section,
.tutorial-section,
.video-section,
.pros-cons-section,
.pricing-section,
.related-tools-section {
  margin-bottom: 32px;
}

.features-section h2,
.tutorial-section h2,
.video-section h2,
.pros-cons-section h2,
.pricing-section h2,
.related-tools-section h2 {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #333;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 12px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: rgba(76, 175, 80, 0.1);
  border-radius: 8px;
  color: #4caf50;
}

.tutorial-content {
  background: #f8f9fa;
  padding: 24px;
  border-radius: 8px;
  line-height: 1.6;
}

.pros-cons-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.pros,
.cons {
  padding: 20px;
  border-radius: 8px;
}

.pros {
  background: rgba(76, 175, 80, 0.1);
}

.cons {
  background: rgba(244, 67, 54, 0.1);
}

.pros h3 {
  color: #4caf50;
  margin-bottom: 12px;
}

.cons h3 {
  color: #f44336;
  margin-bottom: 12px;
}

.related-tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.related-tool-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.related-tool-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.loading-state,
.error-state {
  text-align: center;
  padding: 60px 20px;
  color: white;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.icon {
  width: 16px;
  height: 16px;
}

@media (max-width: 768px) {
  .tool-header {
    flex-direction: column;
    text-align: center;
  }

  .pros-cons-grid {
    grid-template-columns: 1fr;
  }

  .tool-actions {
    flex-direction: row;
    justify-content: center;
  }
}
</style>
