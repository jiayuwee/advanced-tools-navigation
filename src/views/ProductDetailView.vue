<template>
  <div class="product-detail-view">
    <div class="container">
      <!-- 返回按钮 -->
      <div class="back-section">
        <button class="back-btn" @click="goBack">
          <ArrowLeftIcon class="icon" />
          返回产品列表
        </button>
      </div>

      <!-- 产品详情 -->
      <div v-if="product" class="product-detail">
        <div class="product-gallery">
          <div class="main-image">
            <img :src="product.image" :alt="product.name" />
          </div>
        </div>

        <div class="product-info">
          <div class="product-header">
            <h1 class="product-title">{{ product.name }}</h1>
            <div class="product-price">
              <span class="current-price">¥{{ product.price }}</span>
              <span v-if="product.originalPrice" class="original-price">
                ¥{{ product.originalPrice }}
              </span>
            </div>
          </div>

          <div class="product-description">
            <h3>产品描述</h3>
            <p>{{ product.description }}</p>
          </div>

          <div class="product-tags">
            <h3>标签</h3>
            <div class="tags-list">
              <span v-for="tag in product.tags" :key="tag" class="tag">
                {{ tag }}
              </span>
            </div>
          </div>

          <div class="product-actions">
            <button class="buy-btn" @click="buyProduct">
              <ShoppingCartIcon class="icon" />
              立即购买
            </button>
            <button class="demo-btn" @click="viewDemo">
              <EyeIcon class="icon" />
              在线预览
            </button>
            <button class="favorite-btn" @click="toggleFavorite">
              <HeartIcon class="icon" :class="{ filled: isFavorite }" />
              {{ isFavorite ? "已收藏" : "收藏" }}
            </button>
          </div>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-else-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>加载中...</p>
      </div>

      <!-- 错误状态 -->
      <div v-else class="error-state">
        <div class="error-icon">❌</div>
        <h3>产品未找到</h3>
        <p>抱歉，您访问的产品不存在或已下架</p>
        <button class="error-action" @click="goBack">返回产品列表</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  ArrowLeftIcon,
  ShoppingCartIcon,
  EyeIcon,
  HeartIcon,
} from "lucide-vue-next";

const route = useRoute();
const router = useRouter();

// 响应式状态
const product = ref<any>(null);
const loading = ref(true);
const isFavorite = ref(false);

// 模拟产品数据
const mockProducts = [
  {
    id: 1,
    name: "高效办公套件",
    description:
      "提升办公效率的完整解决方案，包含文档处理、项目管理、时间管理、团队协作等多个模块。支持多平台同步，让您随时随地高效办公。",
    price: 299,
    originalPrice: 399,
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop",
    category: "office",
    tags: ["办公", "效率", "文档", "项目管理", "团队协作"],
  },
  {
    id: 2,
    name: "设计师工具包",
    description:
      "专业设计师必备工具集合，包含UI设计、图标制作、原型设计、色彩搭配等功能。提供丰富的设计素材和模板，助力创意实现。",
    price: 199,
    image:
      "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=800&h=600&fit=crop",
    category: "design",
    tags: ["设计", "UI", "图标", "创意", "原型"],
  },
  {
    id: 3,
    name: "开发者助手",
    description:
      "程序员开发必备工具，代码编辑、调试、部署一站式解决。支持多种编程语言，集成版本控制，提供智能代码补全和错误检测。",
    price: 399,
    originalPrice: 499,
    image:
      "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=600&fit=crop",
    category: "development",
    tags: ["开发", "编程", "调试", "部署", "版本控制"],
  },
];

// 方法
const loadProduct = () => {
  const productId = parseInt(route.params.id as string);

  // 模拟API调用
  setTimeout(() => {
    const foundProduct = mockProducts.find((p) => p.id === productId);
    if (foundProduct) {
      product.value = foundProduct;
      // 模拟检查收藏状态
      isFavorite.value = Math.random() > 0.5;
    }
    loading.value = false;
  }, 300); // 优化：减少延迟提升用户体验
};

const goBack = () => {
  // 优先使用浏览器历史记录返回
  if (window.history.length > 1) {
    router.go(-1);
  } else {
    // 如果没有历史记录，跳转到产品列表
    router.push("/products");
  }
};

const buyProduct = () => {
  if (product.value) {
    console.log("购买产品:", product.value.name);
    // TODO: 实现购买逻辑
    router.push("/payment");
  }
};

const viewDemo = () => {
  if (product.value) {
    console.log("预览产品:", product.value.name);
    // TODO: 实现预览逻辑
  }
};

const toggleFavorite = () => {
  isFavorite.value = !isFavorite.value;
  console.log(isFavorite.value ? "已添加到收藏" : "已取消收藏");
  // TODO: 实现收藏逻辑
};

// 生命周期
onMounted(() => {
  loadProduct();
});
</script>

<style scoped>
.product-detail-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

/* 返回按钮 */
.back-section {
  margin-bottom: 2rem;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 0.5rem;
  color: white;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.4);
}

/* 产品详情 */
.product-detail {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 1rem 3rem rgba(0, 0, 0, 0.1);
}

.product-gallery {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.main-image {
  width: 100%;
  height: 400px;
  border-radius: 0.75rem;
  overflow: hidden;
}

.main-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-info {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.product-header {
  border-bottom: 1px solid #e1dfdd;
  padding-bottom: 1.5rem;
}

.product-title {
  font-size: 2rem;
  font-weight: 700;
  color: #323130;
  margin: 0 0 1rem 0;
}

.product-price {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.current-price {
  font-size: 2rem;
  font-weight: 700;
  color: #0078d4;
}

.original-price {
  font-size: 1.25rem;
  color: #8a8886;
  text-decoration: line-through;
}

.product-description h3,
.product-tags h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #323130;
  margin: 0 0 1rem 0;
}

.product-description p {
  font-size: 1rem;
  line-height: 1.6;
  color: #605e5c;
  margin: 0;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  padding: 0.5rem 1rem;
  background: rgba(0, 120, 212, 0.1);
  color: #0078d4;
  border-radius: 1.5rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.product-actions {
  display: flex;
  gap: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e1dfdd;
}

.buy-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, #0078d4, #106ebe);
  border: none;
  border-radius: 0.5rem;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.buy-btn:hover {
  background: linear-gradient(135deg, #106ebe, #005a9e);
  transform: translateY(-1px);
}

.demo-btn,
.favorite-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  background: rgba(0, 120, 212, 0.1);
  border: 1px solid rgba(0, 120, 212, 0.2);
  border-radius: 0.5rem;
  color: #0078d4;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.demo-btn:hover,
.favorite-btn:hover {
  background: rgba(0, 120, 212, 0.2);
  border-color: rgba(0, 120, 212, 0.3);
}

.favorite-btn .icon.filled {
  color: #e74c3c;
}

/* 加载和错误状态 */
.loading-state,
.error-state {
  text-align: center;
  padding: 4rem 2rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 1rem;
  color: #323130;
}

.loading-spinner {
  width: 3rem;
  height: 3rem;
  border: 3px solid #e1dfdd;
  border-top: 3px solid #0078d4;
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

.error-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
}

.error-state h3 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 0.75rem 0;
}

.error-state p {
  font-size: 1rem;
  color: #605e5c;
  margin: 0 0 1.5rem 0;
}

.error-action {
  padding: 0.75rem 1.5rem;
  background: #0078d4;
  border: none;
  border-radius: 0.5rem;
  color: white;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.error-action:hover {
  background: #106ebe;
}

.icon {
  width: 1.25rem;
  height: 1.25rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .product-detail-view {
    padding: 1rem;
  }

  .product-detail {
    grid-template-columns: 1fr;
    gap: 2rem;
    padding: 1.5rem;
  }

  .product-title {
    font-size: 1.5rem;
  }

  .current-price {
    font-size: 1.5rem;
  }

  .product-actions {
    flex-direction: column;
  }

  .buy-btn,
  .demo-btn,
  .favorite-btn {
    width: 100%;
  }
}
</style>
