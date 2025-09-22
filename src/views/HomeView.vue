<template>
  <div class="home-view">
    <!-- 导航栏 -->
    <nav class="navbar">
      <div class="nav-container">
        <router-link to="/" class="logo">Ramusi</router-link>
        <ul class="nav-links">
          <li><router-link to="/tools">工具</router-link></li>
          <li><router-link to="/products">产品</router-link></li>
          <li><router-link to="/help">帮助</router-link></li>
        </ul>
      </div>
    </nav>

    <!-- 动态背景 -->
    <div class="bg-animation"></div>

    <!-- 浮动元素 -->
    <div class="floating-elements">
      <div class="floating-element"></div>
      <div class="floating-element"></div>
      <div class="floating-element"></div>
    </div>

    <!-- 主要内容 -->
    <main class="main-content">
      <!-- 英雄区域 -->
      <section class="hero-section">
        <div class="hero-content">
          <h1>高效工具导航站</h1>
          <p>精心挑选的优质工具，让您的工作效率倍增</p>

          <!-- 搜索框 -->
          <EnhancedSearchBox
            placeholder="搜索工具、分类或功能..."
            :auto-focus="false"
            @search="handleSearchResult"
            @clear="clearSearch"
          />
        </div>
      </section>

      <!-- 工具分类区域 -->
      <section class="categories-section">
        <h2>热门分类</h2>
        <div class="category-filters">
          <button
            v-for="category in categories"
            :key="category.id"
            :class="[
              'category-tag',
              { active: selectedCategory === category.id },
            ]"
            @click="selectCategory(category.id)"
          >
            {{ category.name }}
          </button>
        </div>
      </section>

      <!-- 工具卡片区域 -->
      <section class="tools-grid">
        <div
          v-for="(tool, index) in displayTools"
          :key="tool.id"
          class="tool-card"
          :style="{ '--index': index }"
          @click="openTool(tool)"
        >
          <button
            class="favorite-btn"
            :class="{ favorited: tool.isFavorite }"
            @click.stop="toggleFavorite(tool)"
          >
            <Heart class="icon" />
          </button>

          <div class="tool-header">
            <div class="tool-icon">{{ tool.icon || "🔧" }}</div>
            <h3 class="tool-title">{{ tool.name }}</h3>
            <p class="tool-subtitle">
              {{
                tool.short_description || tool.description.slice(0, 50) + "..."
              }}
            </p>
          </div>

          <div class="tool-body">
            <p class="tool-description">{{ tool.description }}</p>
            <div class="tool-tags">
              <span
                v-for="tag in (tool.tags || []).slice(0, 3)"
                :key="tag"
                class="tool-tag"
              >
                {{ tag }}
              </span>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useToolsStore } from "@/stores/tools";
import { useCategoriesStore } from "@/stores/categories";
import { useAuthStore } from "@/stores/auth";
import EnhancedSearchBox from "@/components/search/EnhancedSearchBox.vue";
import { Heart } from "lucide-vue-next";
// 提升 mousemoveHandler 到外部作用域，便于 onMounted/onUnmounted 都能访问
const mousemoveHandler = (e: MouseEvent) => {
  let cursor = document.querySelector(".cursor") as HTMLElement;
  if (!cursor) {
    cursor = document.createElement("div");
    cursor.className = "cursor";
    cursor.style.cssText = `
      position: fixed;
      width: 20px;
      height: 20px;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      pointer-events: none;
      z-index: 9999;
      transition: all 0.3s ease;
    `;
    document.body.appendChild(cursor);
  }
  cursor.style.left = e.clientX - 10 + "px";
  cursor.style.top = e.clientY - 10 + "px";
};

// 状态管理
const toolsStore = useToolsStore();
const categoriesStore = useCategoriesStore();
const authStore = useAuthStore();
const router = useRouter();

// 响应式数据
const selectedCategory = ref<string | null>(null);
const searchResults = ref<any>(null);

// 计算属性
const categories = computed(() => categoriesStore.categories);
const displayTools = computed(() => {
  if (searchResults.value) {
    return searchResults.value.items || [];
  }

  let tools = toolsStore.tools;
  if (selectedCategory.value) {
    tools = tools.filter((tool) => tool.category_id === selectedCategory.value);
  }
  return tools;
});

// 方法
const handleSearchResult = (result: any) => {
  searchResults.value = result;
};

const clearSearch = () => {
  searchResults.value = null;
};

const selectCategory = (categoryId: string) => {
  selectedCategory.value =
    selectedCategory.value === categoryId ? null : categoryId;
};

const openTool = async (tool: any) => {
  if (!tool.url || tool.url.trim() === "") {
    alert("该工具暂无可用链接");
    return;
  }

  try {
    let url = tool.url.trim();
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }
    await toolsStore.incrementClickCount(tool.id);
    window.open(url, "_blank", "noopener,noreferrer");
  } catch (error) {
    console.error("打开链接失败:", error);
    alert("无法打开该链接，请检查URL是否正确");
  }
};

const toggleFavorite = async (tool: any) => {
  if (!authStore.isAuthenticated) {
    router.push("/auth/login");
    return;
  }
  await toolsStore.toggleFavorite(tool.id);
};

// 生命周期
onMounted(async () => {
  try {
    // 等待 store 初始化完成
    if (!toolsStore.initialized) {
      await toolsStore.initialize();
    }
    if (!categoriesStore.initialized) {
      await categoriesStore.initialize();
    }

    // 添加鼠标跟踪光标效果
    document.addEventListener("mousemove", mousemoveHandler);
  } catch (error) {
    console.error("初始化页面失败:", error);
  }
});

onUnmounted(() => {
  document.removeEventListener("mousemove", mousemoveHandler);
});
</script>

<style scoped>
.home-view {
  position: relative;
  min-height: 100vh;
}

/* 导航栏 */
.navbar {
  position: fixed;
  top: 0;
  width: 100%;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(15px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  z-index: 1000;
  padding: 1rem 0;
  transition: all 0.3s ease;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 2rem;
}

.logo {
  font-size: 1.8rem;
  font-weight: bold;
  color: white;
  text-decoration: none;
  transition: transform 0.3s ease;
}

.logo:hover {
  transform: scale(1.05);
}

.nav-links {
  display: flex;
  list-style: none;
  gap: 2rem;
}

.nav-links a {
  color: white;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
  position: relative;
}

.nav-links a:hover {
  color: #f093fb;
  transform: translateY(-2px);
}

.nav-links a::after {
  content: "";
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 0;
  height: 2px;
  background: #f093fb;
  transition: width 0.3s ease;
}

.nav-links a:hover::after {
  width: 100%;
}

/* 动态背景效果 */
.bg-animation {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  animation: gradientShift 15s ease infinite;
}

@keyframes gradientShift {
  0% {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  }
  25% {
    background: linear-gradient(135deg, #764ba2 0%, #f093fb 50%, #667eea 100%);
  }
  50% {
    background: linear-gradient(135deg, #f093fb 0%, #667eea 50%, #764ba2 100%);
  }
  75% {
    background: linear-gradient(135deg, #667eea 0%, #f093fb 50%, #764ba2 100%);
  }
  100% {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  }
}

/* 浮动元素 */
.floating-elements {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  overflow: hidden;
}

.floating-element {
  position: absolute;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  animation: float 6s ease-in-out infinite;
}

.floating-element:nth-child(1) {
  width: 80px;
  height: 80px;
  top: 20%;
  left: 10%;
  animation-delay: 0s;
}

.floating-element:nth-child(2) {
  width: 120px;
  height: 120px;
  top: 60%;
  right: 10%;
  animation-delay: 2s;
}

.floating-element:nth-child(3) {
  width: 60px;
  height: 60px;
  top: 80%;
  left: 70%;
  animation-delay: 4s;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
  }
}

/* 主要内容 */
.main-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 100px 2rem 4rem;
  position: relative;
  z-index: 2;
}

/* 英雄区域 */
.hero-section {
  text-align: center;
  padding: 4rem 0;
  color: white;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
}

.hero-section h1 {
  font-size: 3.5rem;
  font-weight: 800;
  margin-bottom: 1.5rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  animation: fadeInUp 1s ease-out;
}

.hero-section p {
  font-size: 1.3rem;
  margin-bottom: 3rem;
  opacity: 0.9;
  animation: fadeInUp 1s ease-out 0.3s both;
}

/* 分类区域 */
.categories-section {
  margin: 4rem 0;
  text-align: center;
}

.categories-section h2 {
  color: white;
  font-size: 2rem;
  margin-bottom: 2rem;
}

.category-filters {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
}

.category-tag {
  background: rgba(255, 255, 255, 0.15);
  color: white;
  padding: 0.8rem 1.5rem;
  border-radius: 50px;
  font-size: 1rem;
  transition: all 0.3s ease;
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.category-tag:hover,
.category-tag.active {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

/* 工具网格 */
.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 3rem;
}

/* 工具卡片 */
.tool-card {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
  animation: fadeInUp 0.5s ease-out forwards;
  animation-delay: calc(var(--index) * 0.1s);
  opacity: 0;
}

.tool-card:hover {
  transform: translateY(-8px);
  background: rgba(255, 255, 255, 0.25);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
}

/* 收藏按钮 */
.favorite-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.favorite-btn:hover {
  transform: scale(1.1);
}

.favorite-btn.favorited {
  background: #ff4757;
}

.favorite-btn .icon {
  width: 18px;
  height: 18px;
  color: #333;
}

.favorite-btn.favorited .icon {
  color: white;
}

/* 工具头部 */
.tool-header {
  padding: 2rem;
  text-align: center;
  color: white;
}

.tool-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.tool-title {
  font-size: 1.4rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.tool-subtitle {
  font-size: 0.9rem;
  opacity: 0.9;
}

/* 工具主体 */
.tool-body {
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.9);
  color: #333;
}

.tool-description {
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.tool-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tool-tag {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  padding: 0.4rem 0.8rem;
  border-radius: 50px;
  font-size: 0.85rem;
  font-weight: 500;
}

/* 动画 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .hero-section h1 {
    font-size: 2.5rem;
  }

  .hero-section p {
    font-size: 1.1rem;
  }

  .nav-links {
    display: none;
  }

  .tools-grid {
    grid-template-columns: 1fr;
  }
}
</style>
