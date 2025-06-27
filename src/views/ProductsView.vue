<template>
  <div class="products-view">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <h1 class="page-title">产品展示</h1>
          <p class="page-description">发现优质产品，提升工作效率</p>
        </div>
        <div class="header-right">
          <button class="add-product-btn" @click="showAddProductModal = true">
            <PlusIcon class="icon" />
            添加产品
          </button>
        </div>
      </div>
    </div>

    <!-- 筛选和搜索 -->
    <div class="filters-section">
      <div class="filters-content">
        <div class="search-box">
          <SearchIcon class="search-icon" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索产品..."
            class="search-input"
          />
        </div>

        <div class="filter-tabs">
          <button
            v-for="category in categories"
            :key="category.id"
            class="filter-tab"
            :class="{ active: selectedCategory === category.id }"
            @click="selectedCategory = category.id"
          >
            {{ category.name }}
            <span class="count">{{ category.count }}</span>
          </button>
        </div>

        <div class="view-controls">
          <button
            class="view-btn"
            :class="{ active: viewMode === 'grid' }"
            @click="viewMode = 'grid'"
          >
            <GridIcon class="icon" />
          </button>
          <button
            class="view-btn"
            :class="{ active: viewMode === 'list' }"
            @click="viewMode = 'list'"
          >
            <ListIcon class="icon" />
          </button>
        </div>
      </div>
    </div>

    <!-- 产品列表 -->
    <div class="products-section">
      <div v-if="filteredProducts.length > 0" class="products-container">
        <div
          class="products-grid"
          :class="{ 'list-view': viewMode === 'list' }"
        >
          <div
            v-for="product in filteredProducts"
            :key="product.id"
            class="product-card"
            @click="goToProduct(product.id)"
          >
            <div class="product-image">
              <img :src="product.image" :alt="product.name" />
              <div class="product-price">
                <span class="price">¥{{ product.price }}</span>
                <span v-if="product.originalPrice" class="original-price">
                  ¥{{ product.originalPrice }}
                </span>
              </div>
            </div>

            <div class="product-content">
              <h3 class="product-name">{{ product.name }}</h3>
              <p class="product-description">{{ product.description }}</p>

              <div class="product-tags">
                <span
                  v-for="tag in product.tags.slice(0, 3)"
                  :key="tag"
                  class="tag"
                >
                  {{ tag }}
                </span>
                <span v-if="product.tags.length > 3" class="tag more">
                  +{{ product.tags.length - 3 }}
                </span>
              </div>
            </div>

            <div class="product-footer">
              <button class="buy-btn" @click.stop="buyProduct(product)">
                <ShoppingCartIcon class="icon" />
                立即购买
              </button>
              <button class="demo-btn" @click.stop="viewDemo(product)">
                <EyeIcon class="icon" />
                预览
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="empty-state">
        <div class="empty-icon">📦</div>
        <h3>暂无产品</h3>
        <p>当前分类下没有找到相关产品</p>
        <button class="empty-action" @click="selectedCategory = 'all'">
          查看全部产品
        </button>
      </div>
    </div>

    <!-- 添加产品模态框 -->
    <div
      v-if="showAddProductModal"
      class="modal-overlay"
      @click="showAddProductModal = false"
    >
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>添加新产品</h3>
          <button class="close-btn" @click="showAddProductModal = false">
            <XIcon class="icon" />
          </button>
        </div>
        <div class="modal-body">
          <p>产品添加功能正在开发中...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import {
  PlusIcon,
  SearchIcon,
  GridIcon,
  ListIcon,
  ShoppingCartIcon,
  EyeIcon,
  XIcon,
} from "lucide-vue-next";

const router = useRouter();

// 响应式状态
const searchQuery = ref("");
const selectedCategory = ref("all");
const viewMode = ref<"grid" | "list">("grid");
const showAddProductModal = ref(false);

// 模拟产品数据
const products = ref([
  {
    id: 1,
    name: "高效办公套件",
    description: "提升办公效率的完整解决方案，包含文档处理、项目管理等功能",
    price: 299,
    originalPrice: 399,
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop",
    category: "office",
    tags: ["办公", "效率", "文档", "项目管理"],
  },
  {
    id: 2,
    name: "设计师工具包",
    description: "专业设计师必备工具集合，包含UI设计、图标制作等",
    price: 199,
    image:
      "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=400&h=300&fit=crop",
    category: "design",
    tags: ["设计", "UI", "图标", "创意"],
  },
  {
    id: 3,
    name: "开发者助手",
    description: "程序员开发必备工具，代码编辑、调试、部署一站式解决",
    price: 399,
    originalPrice: 499,
    image:
      "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=300&fit=crop",
    category: "development",
    tags: ["开发", "编程", "调试", "部署"],
  },
]);

// 分类数据
const categories = ref([
  { id: "all", name: "全部", count: 3 },
  { id: "office", name: "办公工具", count: 1 },
  { id: "design", name: "设计工具", count: 1 },
  { id: "development", name: "开发工具", count: 1 },
]);

// 计算属性
const filteredProducts = computed(() => {
  let filtered = products.value;

  // 按分类筛选
  if (selectedCategory.value !== "all") {
    filtered = filtered.filter(
      (product) => product.category === selectedCategory.value,
    );
  }

  // 按搜索关键词筛选
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (product) =>
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.tags.some((tag) => tag.toLowerCase().includes(query)),
    );
  }

  return filtered;
});

// 方法
const goToProduct = (productId: number) => {
  router.push(`/product/${productId}`);
};

const buyProduct = (product: any) => {
  console.log("购买产品:", product.name);
  // TODO: 实现购买逻辑
};

const viewDemo = (product: any) => {
  console.log("预览产品:", product.name);
  // TODO: 实现预览逻辑
};

// 生命周期
onMounted(() => {
  // 初始化数据
  console.log("产品页面已加载");
});
</script>

<style scoped>
.products-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

/* 页面头部 */
.page-header {
  margin-bottom: 2rem;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1400px;
  margin: 0 auto;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
  margin: 0 0 0.5rem 0;
}

.page-description {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
}

.add-product-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 0.5rem;
  color: white;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-product-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.4);
}

/* 筛选区域 */
.filters-section {
  margin-bottom: 2rem;
}

.filters-content {
  display: flex;
  align-items: center;
  gap: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 1rem;
  padding: 1.5rem;
}

.search-box {
  position: relative;
  flex: 1;
  max-width: 400px;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1.25rem;
  height: 1.25rem;
  color: rgba(255, 255, 255, 0.6);
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 3rem;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 0.5rem;
  color: white;
  font-size: 0.9rem;
  outline: none;
  transition: all 0.2s ease;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.search-input:focus {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
}

.filter-tabs {
  display: flex;
  gap: 0.5rem;
}

.filter-tab {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 0.5rem;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-tab:hover {
  background: rgba(255, 255, 255, 0.1);
}

.filter-tab.active {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border-color: rgba(255, 255, 255, 0.5);
}

.count {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.125rem 0.5rem;
  border-radius: 0.75rem;
  font-size: 0.75rem;
}

.view-controls {
  display: flex;
  gap: 0.5rem;
}

.view-btn {
  width: 2.5rem;
  height: 2.5rem;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 0.5rem;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.view-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.view-btn.active {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border-color: rgba(255, 255, 255, 0.5);
}

/* 产品区域 */
.products-section {
  max-width: 1400px;
  margin: 0 auto;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
}

.products-grid.list-view {
  grid-template-columns: 1fr;
}

.product-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 1rem;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.product-card:hover {
  transform: translateY(-0.5rem);
  box-shadow: 0 1rem 3rem rgba(0, 0, 0, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
}

.product-image {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.product-card:hover .product-image img {
  transform: scale(1.05);
}

.product-price {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  padding: 0.5rem 1rem;
  border-radius: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.price {
  color: #ffb900;
  font-weight: 600;
  font-size: 1rem;
}

.original-price {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.875rem;
  text-decoration: line-through;
}

.product-content {
  padding: 1.5rem;
}

.product-name {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: #323130;
}

.product-description {
  font-size: 0.9rem;
  color: #605e5c;
  line-height: 1.5;
  margin: 0 0 1rem 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  padding: 0.25rem 0.75rem;
  background: rgba(0, 120, 212, 0.1);
  color: #0078d4;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.tag.more {
  background: rgba(0, 0, 0, 0.05);
  color: #8a8886;
}

.product-footer {
  padding: 0 1.5rem 1.5rem;
  display: flex;
  gap: 1rem;
}

.buy-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: linear-gradient(135deg, #0078d4, #106ebe);
  border: none;
  border-radius: 0.5rem;
  color: white;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.buy-btn:hover {
  background: linear-gradient(135deg, #106ebe, #005a9e);
  transform: translateY(-1px);
}

.demo-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: rgba(0, 120, 212, 0.1);
  border: 1px solid rgba(0, 120, 212, 0.2);
  border-radius: 0.5rem;
  color: #0078d4;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.demo-btn:hover {
  background: rgba(0, 120, 212, 0.2);
  border-color: rgba(0, 120, 212, 0.3);
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: rgba(255, 255, 255, 0.8);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
}

.empty-state h3 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 0.75rem 0;
  color: white;
}

.empty-state p {
  font-size: 1rem;
  margin: 0 0 1.5rem 0;
  color: rgba(255, 255, 255, 0.7);
}

.empty-action {
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 0.5rem;
  color: white;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.empty-action:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* 模态框 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.modal-content {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 1rem 3rem rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 500px;
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid #e1dfdd;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #323130;
}

.close-btn {
  width: 2rem;
  height: 2rem;
  background: transparent;
  border: none;
  border-radius: 0.25rem;
  color: #605e5c;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: #f3f2f1;
}

.modal-body {
  padding: 1.5rem;
}

.icon {
  width: 1rem;
  height: 1rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .products-view {
    padding: 1rem;
  }

  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .filters-content {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .filter-tabs {
    flex-wrap: wrap;
  }

  .products-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}
</style>
