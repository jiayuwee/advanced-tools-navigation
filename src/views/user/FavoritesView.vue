<template>
  <div class="favorites-view">
    <div class="favorites-header">
      <h1>我的收藏</h1>
      <p>管理您收藏的工具和产品</p>
    </div>

    <div class="favorites-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="tab"
        :class="{ active: activeTab === tab.key }"
        @click="activeTab = tab.key"
      >
        <component :is="tab.icon" class="tab-icon" />
        {{ tab.label }}
        <span class="tab-count">{{ getTabCount(tab.key) }}</span>
      </button>
    </div>

    <div class="favorites-content">
      <!-- 工具收藏 -->
      <div v-if="activeTab === 'tools'" class="tab-panel">
        <div v-if="favoriteTools.length > 0" class="favorites-grid">
          <div
            v-for="tool in favoriteTools"
            :key="tool.id"
            class="favorite-item tool-item"
          >
            <div class="item-header">
              <div class="item-icon">{{ tool.icon || "🔧" }}</div>
              <button
                class="remove-btn"
                @click="removeFavorite('tool', tool.id)"
              >
                <XIcon class="icon" />
              </button>
            </div>

            <div class="item-content">
              <h3 class="item-name">{{ tool.name }}</h3>
              <p class="item-description">{{ tool.description }}</p>
              <div class="item-meta">
                <span class="category">{{ tool.category.name }}</span>
                <span class="clicks">{{ tool.click_count }} 次访问</span>
              </div>
            </div>

            <div class="item-actions">
              <button class="action-btn primary" @click="openTool(tool)">
                <ExternalLinkIcon class="icon" />
                打开工具
              </button>
            </div>
          </div>
        </div>

        <div v-else class="empty-state">
          <div class="empty-icon">🔧</div>
          <h3>暂无收藏的工具</h3>
          <p>去发现一些有用的工具并收藏它们吧！</p>
          <router-link to="/tools" class="empty-action">浏览工具</router-link>
        </div>
      </div>

      <!-- 产品收藏 -->
      <div v-if="activeTab === 'products'" class="tab-panel">
        <div v-if="favoriteProducts.length > 0" class="favorites-grid">
          <div
            v-for="product in favoriteProducts"
            :key="product.id"
            class="favorite-item product-item"
          >
            <div class="item-header">
              <div class="item-image">
                <img
                  :src="product.images[0] || '/placeholder.jpg'"
                  :alt="product.name"
                />
              </div>
              <button
                class="remove-btn"
                @click="removeFavorite('product', product.id)"
              >
                <XIcon class="icon" />
              </button>
            </div>

            <div class="item-content">
              <h3 class="item-name">{{ product.name }}</h3>
              <p class="item-description">
                {{ product.short_description || product.description }}
              </p>
              <div class="item-price">
                <span class="current-price">¥{{ product.price }}</span>
                <span
                  v-if="
                    product.original_price &&
                    product.original_price > product.price
                  "
                  class="original-price"
                >
                  ¥{{ product.original_price }}
                </span>
              </div>
            </div>

            <div class="item-actions">
              <button
                class="action-btn secondary"
                @click="viewProduct(product)"
              >
                <EyeIcon class="icon" />
                查看详情
              </button>
              <button class="action-btn primary" @click="buyProduct(product)">
                <ShoppingCartIcon class="icon" />
                立即购买
              </button>
            </div>
          </div>
        </div>

        <div v-else class="empty-state">
          <div class="empty-icon">🛍️</div>
          <h3>暂无收藏的产品</h3>
          <p>去发现一些优质产品并收藏它们吧！</p>
          <router-link to="/products" class="empty-action"
            >浏览产品</router-link
          >
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>正在加载收藏...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import {
  WrenchIcon,
  ShoppingBagIcon,
  XIcon,
  ExternalLinkIcon,
  EyeIcon,
  ShoppingCartIcon,
} from "lucide-vue-next";
import type { Tool, Product } from "../../types";

const router = useRouter();

// 响应式状态
const loading = ref(true);
const activeTab = ref("tools");
const favoriteTools = ref<Tool[]>([]);
const favoriteProducts = ref<Product[]>([]);

const tabs = [
  { key: "tools", label: "工具", icon: WrenchIcon },
  { key: "products", label: "产品", icon: ShoppingBagIcon },
];

// 计算属性
const getTabCount = (tabKey: string) => {
  if (tabKey === "tools") return favoriteTools.value.length;
  if (tabKey === "products") return favoriteProducts.value.length;
  return 0;
};

// 方法
const loadFavorites = async () => {
  try {
    loading.value = true;

    // TODO: 实现加载收藏逻辑
    // const [tools, products] = await Promise.all([
    //   FavoritesService.getFavoriteTools(),
    //   FavoritesService.getFavoriteProducts()
    // ])

    // 模拟数据
    await new Promise((resolve) => setTimeout(resolve, 1000));

    favoriteTools.value = [
      {
        id: "1",
        name: "VS Code",
        description: "强大的代码编辑器",
        url: "https://code.visualstudio.com",
        icon: "💻",
        category_id: "1",
        category: {
          id: "1",
          name: "开发工具",
          icon: "💻",
          color: "#0078d4",
          count: 0,
          sort_order: 0,
          is_active: true,
          created_at: "",
          updated_at: "",
        },
        tags: [],
        is_favorite: true,
        click_count: 150,
        is_featured: true,
        status: "active" as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        sort_order: 0,
      },
    ];

    favoriteProducts.value = [
      {
        id: "1",
        name: "高效办公套件",
        description: "提升办公效率的完整解决方案",
        short_description: "办公效率工具",
        price: 299,
        original_price: 399,
        currency: "CNY",
        category_id: "1",
        category: {
          id: "1",
          name: "办公软件",
          icon: "📊",
          color: "#0078d4",
          count: 0,
          sort_order: 0,
          is_active: true,
          created_at: "",
          updated_at: "",
        },
        images: ["/placeholder.jpg"],
        features: ["文档处理", "项目管理"],
        is_featured: true,
        is_digital: true,
        status: "active" as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: "user1",
        sort_order: 0,
      },
    ];
  } catch (error) {
    console.error("加载收藏失败:", error);
  } finally {
    loading.value = false;
  }
};

const removeFavorite = async (type: "tool" | "product", id: string) => {
  try {
    // TODO: 实现取消收藏逻辑
    // await FavoritesService.removeFavorite(type, id)

    if (type === "tool") {
      favoriteTools.value = favoriteTools.value.filter(
        (item) => item.id !== id,
      );
    } else {
      favoriteProducts.value = favoriteProducts.value.filter(
        (item) => item.id !== id,
      );
    }
  } catch (error) {
    console.error("取消收藏失败:", error);
  }
};

const openTool = (tool: Tool) => {
  // TODO: 增加点击次数
  window.open(tool.url, "_blank", "noopener,noreferrer");
};

const viewProduct = (product: Product) => {
  router.push(`/product/${product.id}`);
};

const buyProduct = (product: Product) => {
  // TODO: 实现购买逻辑
  router.push(`/payment?product=${product.id}`);
};

// 生命周期
onMounted(() => {
  loadFavorites();
});
</script>

<style scoped>
.favorites-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.favorites-header {
  text-align: center;
  margin-bottom: 3rem;
}

.favorites-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: #323130;
  margin: 0 0 0.5rem 0;
}

.favorites-header p {
  color: #605e5c;
  font-size: 1.125rem;
  margin: 0;
}

.favorites-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  background: white;
  border-radius: 8px;
  padding: 0.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
  background: none;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  color: #605e5c;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab:hover {
  background: #f3f2f1;
}

.tab.active {
  background: #0078d4;
  color: white;
}

.tab-icon {
  width: 20px;
  height: 20px;
}

.tab-count {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.tab.active .tab-count {
  background: rgba(255, 255, 255, 0.3);
}

.favorites-content {
  min-height: 400px;
}

.favorites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.favorite-item {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.favorite-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.item-icon {
  font-size: 2rem;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f2f1;
  border-radius: 8px;
}

.item-image {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  overflow: hidden;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  color: #8a8886;
  transition: all 0.2s ease;
}

.remove-btn:hover {
  background: #fef2f2;
  color: #dc2626;
}

.item-content {
  margin-bottom: 1.5rem;
}

.item-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: #323130;
  margin: 0 0 0.5rem 0;
}

.item-description {
  color: #605e5c;
  margin: 0 0 1rem 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  color: #8a8886;
}

.item-price {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.current-price {
  font-size: 1.25rem;
  font-weight: 700;
  color: #d13438;
}

.original-price {
  color: #8a8886;
  text-decoration: line-through;
}

.item-actions {
  display: flex;
  gap: 0.75rem;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn.primary {
  background: #0078d4;
  color: white;
}

.action-btn.primary:hover {
  background: #106ebe;
}

.action-btn.secondary {
  background: transparent;
  color: #0078d4;
  border: 1px solid #0078d4;
}

.action-btn.secondary:hover {
  background: rgba(0, 120, 212, 0.1);
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #605e5c;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
}

.empty-state h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #323130;
  margin: 0 0 0.75rem 0;
}

.empty-state p {
  margin: 0 0 1.5rem 0;
  line-height: 1.5;
}

.empty-action {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background: #0078d4;
  color: white;
  text-decoration: none;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.empty-action:hover {
  background: #106ebe;
}

.loading-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #605e5c;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f2f1;
  border-top: 4px solid #0078d4;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
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

/* 响应式设计 */
@media (max-width: 768px) {
  .favorites-view {
    padding: 1rem;
  }

  .favorites-grid {
    grid-template-columns: 1fr;
  }

  .favorites-tabs {
    flex-direction: column;
  }

  .item-actions {
    flex-direction: column;
  }
}
</style>
