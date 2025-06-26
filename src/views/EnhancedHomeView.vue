<template>
  <div class="enhanced-home-view">
    <!-- 英雄区域 -->
    <header class="hero-section">
      <div class="container">
        <div class="hero-content">
          <div class="logo-section">
            <div class="logo-icon">🚀</div>
            <h1 class="main-title">高效工具导航站</h1>
          </div>
          <p class="tagline">精心挑选的优质工具，让您的工作效率倍增</p>

          <!-- 增强搜索区域 -->
          <div class="search-section">
            <div class="search-box">
              <SearchIcon class="search-icon" />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="搜索工具、分类或功能..."
                class="search-input"
                @input="handleSearch"
                @keydown.enter="performSearch"
              />
              <button class="search-button" @click="performSearch">
                <SearchIcon class="icon" />
                搜索
              </button>
              <div class="search-shortcut">Ctrl+K</div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- 主要内容区域 -->
    <main class="main-content">
      <div class="container">
        <div class="content-layout">
          <!-- 侧边栏 -->
          <aside class="sidebar">
            <div class="sidebar-section">
              <h3>导航</h3>
              <nav class="nav-links">
                <router-link to="/tools" class="nav-link active">
                  <GridIcon class="icon" />
                  全部工具
                </router-link>
                <router-link to="/favorites" class="nav-link">
                  <StarIcon class="icon" />
                  我的收藏
                </router-link>
                <router-link to="/products" class="nav-link">
                  <PackageIcon class="icon" />
                  我的产品
                </router-link>
              </nav>
            </div>

            <div class="sidebar-section">
              <h3>分类</h3>
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
            </div>
          </aside>

          <!-- 工具卡片区域 -->
          <section class="tools-grid">
            <div
              v-for="(tool, index) in filteredTools"
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
                <HeartIcon class="icon" />
              </button>

              <div class="tool-header">
                <div class="tool-icon">{{ tool.icon || "🔧" }}</div>
                <h3 class="tool-title">{{ tool.name }}</h3>
                <p class="tool-subtitle">
                  {{
                    tool.short_description ||
                    tool.description.slice(0, 50) + "..."
                  }}
                </p>
              </div>

              <div class="tool-body">
                <p class="tool-description">{{ tool.description }}</p>
                <div class="tool-tags">
                  <span
                    v-for="tag in tool.tags.slice(0, 3)"
                    :key="tag.id"
                    class="tool-tag"
                  >
                    {{ tag.name }}
                  </span>
                  <span v-if="tool.tags.length > 3" class="tool-tag more">
                    +{{ tool.tags.length - 3 }}
                  </span>
                </div>
              </div>
            </div>

            <!-- 空状态 -->
            <div v-if="filteredTools.length === 0" class="empty-state">
              <div class="empty-icon">🔍</div>
              <h3>未找到相关工具</h3>
              <p>尝试使用其他关键词搜索，或浏览其他分类</p>
              <button class="empty-action" @click="clearFilters">
                清除搜索条件
              </button>
            </div>
          </section>
        </div>
      </div>
    </main>

    <!-- 页脚 -->
    <footer class="footer">
      <div class="container">
        <p>&copy; 2024 高效工具导航站 | 让您的工作更智能、更高效</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useToolsStore } from "@/stores/tools";
import { useCategoriesStore } from "@/stores/categories";
import { useAuthStore } from "@/stores/auth";
import {
  SearchIcon,
  GridIcon,
  StarIcon,
  PackageIcon,
  HeartIcon,
} from "lucide-vue-next";

// 状态管理
const toolsStore = useToolsStore();
const categoriesStore = useCategoriesStore();
const authStore = useAuthStore();
const router = useRouter();

// 响应式数据
const searchQuery = ref("");
const selectedCategory = ref<string | null>(null);

// 计算属性
const categories = computed(() => categoriesStore.categories);
const filteredTools = computed(() => {
  let tools = toolsStore.tools;

  // 分类过滤
  if (selectedCategory.value) {
    tools = tools.filter((tool) => tool.category_id === selectedCategory.value);
  }

  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    tools = tools.filter(
      (tool) =>
        tool.name.toLowerCase().includes(query) ||
        tool.description.toLowerCase().includes(query) ||
        tool.tags?.some((tag) => tag.name.toLowerCase().includes(query))
    );
  }

  return tools;
});

// 方法
const handleSearch = () => {
  // 实时搜索逻辑已在计算属性中处理
};

const performSearch = () => {
  // 执行搜索并跳转到工具页面
  router.push({
    name: "Tools",
    query: { search: searchQuery.value },
  });
};

const selectCategory = (categoryId: string) => {
  selectedCategory.value =
    selectedCategory.value === categoryId ? null : categoryId;
};

const openTool = async (tool: any) => {
  // 记录点击统计
  await toolsStore.incrementClickCount(tool.id);
  // 打开工具链接
  window.open(tool.url, "_blank", "noopener,noreferrer");
};

const toggleFavorite = async (tool: any) => {
  if (!authStore.isAuthenticated) {
    router.push("/auth/login");
    return;
  }

  await toolsStore.toggleFavorite(tool.id);
};

const clearFilters = () => {
  searchQuery.value = "";
  selectedCategory.value = null;
};

// 生命周期
onMounted(async () => {
  // 初始化数据
  if (!toolsStore.initialized) {
    await toolsStore.initialize();
  }
  if (!categoriesStore.initialized) {
    await categoriesStore.initialize();
  }
});
</script>

<style scoped>
/* CSS变量定义 */
:root {
  --primary: #4361ee;
  --secondary: #3f37c9;
  --accent: #4895ef;
  --light: #f8f9fa;
  --dark: #212529;
  --gray: #6c757d;
  --light-gray: #e9ecef;
  --success: #4cc9f0;
  --card-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  --transition: all 0.3s ease;
}

/* 全局样式 */
.enhanced-home-view {
  background: linear-gradient(135deg, #f5f7fa 0%, #e4edf5 100%);
  min-height: 100vh;
}

/* 英雄区域 */
.hero-section {
  text-align: center;
  padding: 60px 20px 40px;
  background: linear-gradient(135deg, var(--primary), var(--accent));
  color: white;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
}

.logo-section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  margin-bottom: 20px;
}

.logo-icon {
  font-size: 3rem;
}

.main-title {
  font-size: 2.8rem;
  font-weight: 800;
  margin: 0;
}

.tagline {
  font-size: 1.3rem;
  margin-bottom: 40px;
  opacity: 0.9;
}

/* 搜索区域 */
.search-section {
  max-width: 600px;
  margin: 0 auto;
}

.search-box {
  display: flex;
  background: white;
  border-radius: 50px;
  box-shadow: var(--card-shadow);
  overflow: hidden;
  position: relative;
  border: 2px solid transparent;
  transition: var(--transition);
}

.search-box:focus-within {
  border-color: var(--accent);
  box-shadow: 0 6px 24px rgba(67, 97, 238, 0.3);
}

.search-icon {
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--gray);
  width: 20px;
  height: 20px;
}

.search-input {
  flex: 1;
  padding: 18px 25px 18px 55px;
  border: none;
  font-size: 1.1rem;
  outline: none;
  color: var(--dark);
}

.search-button {
  background: var(--primary);
  color: white;
  border: none;
  padding: 0 30px;
  cursor: pointer;
  transition: var(--transition);
  font-weight: 600;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-button:hover {
  background: var(--secondary);
}

.search-shortcut {
  position: absolute;
  right: 120px;
  top: 50%;
  transform: translateY(-50%);
  background: var(--light-gray);
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  color: var(--gray);
  pointer-events: none;
}

/* 主要内容区域 */
.main-content {
  padding: 40px 20px;
}

.content-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 30px;
}

/* 侧边栏 */
.sidebar {
  background: white;
  border-radius: 20px;
  padding: 25px;
  box-shadow: var(--card-shadow);
  height: fit-content;
  position: sticky;
  top: 20px;
}

.sidebar-section {
  margin-bottom: 30px;
}

.sidebar-section:last-child {
  margin-bottom: 0;
}

.sidebar-section h3 {
  font-size: 1.1rem;
  color: var(--primary);
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 2px solid var(--light-gray);
}

.nav-links {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nav-link {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  color: var(--dark);
  text-decoration: none;
  border-radius: 12px;
  transition: var(--transition);
  font-weight: 500;
}

.nav-link .icon {
  margin-right: 10px;
  width: 20px;
  height: 20px;
  color: var(--gray);
}

.nav-link:hover,
.nav-link.active {
  background: rgba(67, 97, 238, 0.08);
  color: var(--primary);
}

.nav-link:hover .icon,
.nav-link.active .icon {
  color: var(--primary);
}

.category-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.category-tag {
  background: var(--light);
  padding: 8px 15px;
  border-radius: 50px;
  font-size: 0.9rem;
  color: var(--dark);
  transition: var(--transition);
  cursor: pointer;
  border: 1px solid var(--light-gray);
}

.category-tag:hover,
.category-tag.active {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

/* 工具网格 */
.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 25px;
}

/* 工具卡片 */
.tool-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: var(--card-shadow);
  transition: var(--transition);
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
  cursor: pointer;
  animation: fadeIn 0.5s ease-out forwards;
  animation-delay: calc(var(--index) * 0.1s);
  opacity: 0;
}

.tool-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
}

/* 收藏按钮 */
.favorite-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.favorite-btn:hover {
  background: white;
  transform: scale(1.1);
}

.favorite-btn.favorited {
  background: #ff4757;
  color: white;
}

.favorite-btn .icon {
  width: 18px;
  height: 18px;
  color: var(--gray);
}

.favorite-btn.favorited .icon {
  color: white;
}

/* 工具头部 */
.tool-header {
  padding: 25px;
  background: linear-gradient(135deg, var(--primary), var(--accent));
  color: white;
  text-align: center;
}

.tool-icon {
  font-size: 2.5rem;
  margin-bottom: 15px;
}

.tool-title {
  font-size: 1.4rem;
  margin-bottom: 8px;
  font-weight: 600;
}

.tool-subtitle {
  font-size: 0.9rem;
  opacity: 0.9;
  margin: 0;
}

/* 工具主体 */
.tool-body {
  padding: 25px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.tool-description {
  color: var(--gray);
  line-height: 1.6;
  margin-bottom: 20px;
  flex: 1;
}

.tool-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: auto;
}

.tool-tag {
  background: rgba(67, 97, 238, 0.1);
  color: var(--primary);
  padding: 5px 12px;
  border-radius: 50px;
  font-size: 0.85rem;
  font-weight: 500;
}

.tool-tag.more {
  background: var(--light-gray);
  color: var(--gray);
}

/* 空状态 */
.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px 20px;
  color: var(--gray);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.empty-state h3 {
  font-size: 1.5rem;
  margin-bottom: 10px;
  color: var(--dark);
}

.empty-state p {
  margin-bottom: 25px;
  font-size: 1.1rem;
}

.empty-action {
  background: var(--primary);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 25px;
  cursor: pointer;
  transition: var(--transition);
  font-weight: 500;
}

.empty-action:hover {
  background: var(--secondary);
  transform: translateY(-2px);
}

/* 页脚 */
.footer {
  text-align: center;
  padding: 40px 20px;
  color: var(--gray);
  font-size: 0.9rem;
  background: white;
  margin-top: 40px;
}

/* 动画 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .content-layout {
    grid-template-columns: 1fr;
  }

  .sidebar {
    position: static;
    margin-bottom: 30px;
  }

  .tools-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
}

@media (max-width: 768px) {
  .hero-section {
    padding: 40px 15px 30px;
  }

  .main-title {
    font-size: 2.2rem;
  }

  .tagline {
    font-size: 1.1rem;
  }

  .search-input {
    padding: 15px 20px 15px 50px;
  }

  .search-button {
    padding: 0 20px;
  }

  .search-shortcut {
    display: none;
  }

  .main-content {
    padding: 30px 15px;
  }

  .tools-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .tool-card {
    max-width: 100%;
  }
}

@media (max-width: 480px) {
  .logo-section {
    flex-direction: column;
    gap: 10px;
  }

  .main-title {
    font-size: 1.8rem;
  }

  .category-filters {
    justify-content: center;
  }

  .sidebar {
    padding: 20px;
  }
}
</style>
