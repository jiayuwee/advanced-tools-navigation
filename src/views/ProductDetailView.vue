<template>
  <div class="product-detail-view">
    <div class="container">
      <!-- 面包屑导航 -->
      <nav class="breadcrumb">
        <router-link to="/products">产品</router-link>
        <span class="separator">/</span>
        <span class="current">{{ product?.name || '产品详情' }}</span>
      </nav>

      <!-- 产品详情内容 -->
      <div v-if="product" class="product-content">
        <!-- 产品图片和基本信息 -->
        <div class="product-header">
          <div class="product-gallery">
            <img 
              :src="product.images[0] || '/placeholder-product.jpg'" 
              :alt="product.name"
              class="main-image"
            />
            <div v-if="product.images.length > 1" class="thumbnail-list">
              <img 
                v-for="(image, index) in product.images.slice(0, 4)" 
                :key="index"
                :src="image" 
                :alt="`${product.name} ${index + 1}`"
                class="thumbnail"
                @click="currentImageIndex = index"
              />
            </div>
          </div>

          <div class="product-info">
            <h1 class="product-title">{{ product.name }}</h1>
            <p class="product-description">{{ product.description }}</p>
            
            <div class="price-section">
              <div class="current-price">¥{{ product.price }}</div>
              <div v-if="product.original_price" class="original-price">
                ¥{{ product.original_price }}
              </div>
              <div class="discount" v-if="product.original_price">
                {{ calculateDiscount(product.price, product.original_price) }}% OFF
              </div>
            </div>

            <div class="rating-section">
              <div class="stars">
                <span 
                  v-for="star in 5" 
                  :key="star"
                  :class="['star', star <= Math.floor(product.average_rating || 0) ? 'filled' : '']"
                >
                  ★
                </span>
              </div>
              <span class="rating-text">
                {{ product.average_rating?.toFixed(1) || '0.0' }} 
                ({{ product.total_reviews || 0 }} 条评价)
              </span>
            </div>

            <div class="actions">
              <button class="buy-btn" @click="handleBuy">
                {{ product.is_digital ? '立即购买' : '加入购物车' }}
              </button>
              <button class="favorite-btn" @click="toggleFavorite">
                {{ isFavorite ? '❤️ 已收藏' : '🤍 收藏' }}
              </button>
            </div>

            <div class="features">
              <h3>产品特点</h3>
              <ul>
                <li v-for="feature in product.features" :key="feature">
                  {{ feature }}
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- 产品详情标签页 -->
        <div class="product-tabs">
          <div class="tab-header">
            <button 
              v-for="tab in tabs" 
              :key="tab.id"
              :class="['tab-btn', { active: activeTab === tab.id }]"
              @click="activeTab = tab.id"
            >
              {{ tab.label }}
            </button>
          </div>

          <div class="tab-content">
            <!-- 详情描述 -->
            <div v-if="activeTab === 'description'" class="tab-panel">
              <div class="description-content" v-html="product.description"></div>
            </div>

            <!-- 用户评价 -->
            <div v-if="activeTab === 'reviews'" class="tab-panel">
              <div class="reviews-section">
                <div class="reviews-header">
                  <h3>用户评价</h3>
                  <button class="write-review-btn" @click="showReviewModal = true">
                    写评价
                  </button>
                </div>
                <div v-if="product.reviews && product.reviews.length" class="reviews-list">
                  <div 
                    v-for="review in product.reviews" 
                    :key="review.id"
                    class="review-item"
                  >
                    <div class="review-header">
                      <div class="reviewer-info">
                        <img 
                          :src="review.user?.avatar_url || '/default-avatar.png'" 
                          :alt="review.user?.full_name"
                          class="reviewer-avatar"
                        />
                        <div>
                          <div class="reviewer-name">{{ review.user?.full_name || '匿名用户' }}</div>
                          <div class="review-date">{{ formatDate(review.created_at) }}</div>
                        </div>
                      </div>
                      <div class="review-rating">
                        <span class="stars">
                          <span 
                            v-for="star in 5" 
                            :key="star"
                            :class="['star', star <= review.rating ? 'filled' : '']"
                          >
                            ★
                          </span>
                        </span>
                      </div>
                    </div>
                    <div class="review-content">
                      {{ review.content }}
                    </div>
                  </div>
                </div>
                <div v-else class="no-reviews">
                  <p>暂无评价</p>
                </div>
              </div>
            </div>

            <!-- 相关产品 -->
            <div v-if="activeTab === 'related'" class="tab-panel">
              <div class="related-products">
                <h3>相关产品</h3>
                <div class="products-grid">
                  <!-- 这里可以显示相关产品 -->
                  <div class="placeholder">相关产品功能待实现</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="loading">
        <p>加载中...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import type { Product } from '@/types'

const route = useRoute()
const product = ref<Product | null>(null)
const isFavorite = ref(false)
const activeTab = ref('description')
const showReviewModal = ref(false)
const currentImageIndex = ref(0)

const tabs = [
  { id: 'description', label: '产品详情' },
  { id: 'reviews', label: '用户评价' },
  { id: 'related', label: '相关产品' }
]

onMounted(async () => {
  // 模拟加载产品数据
  await loadProductData()
})

async function loadProductData() {
  // 这里应该调用API获取产品详情
  // 暂时使用模拟数据
  product.value = {
    id: route.params.id as string,
    name: '示例产品',
    description: '这是一个示例产品的详细描述，包含产品的各种特性和优势。',
    price: 299,
    original_price: 399,
    currency: 'CNY',
    category_id: 'category-1',
    images: ['/placeholder-product.jpg'],
    features: ['高质量材料', '易于使用', '长期支持', '免费更新'],
    is_featured: true,
    is_digital: true,
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: 'user-1',
    sort_order: 1,
    average_rating: 4.5,
    total_reviews: 10,
    reviews: []
  }
}

function calculateDiscount(current: number, original: number): number {
  return Math.round((1 - current / original) * 100)
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('zh-CN')
}

function handleBuy() {
  // 处理购买逻辑
  console.log('购买产品:', product.value?.id)
}

function toggleFavorite() {
  isFavorite.value = !isFavorite.value
  // 这里应该调用API更新收藏状态
}
</script>

<style scoped>
.product-detail-view {
  min-height: 100vh;
  padding: 2rem;
  background: hsl(var(--background));
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.breadcrumb {
  margin-bottom: 2rem;
  font-size: 0.9rem;
  color: hsl(var(--muted-foreground));
}

.breadcrumb a {
  color: hsl(var(--primary));
  text-decoration: none;
}

.breadcrumb a:hover {
  text-decoration: underline;
}

.separator {
  margin: 0 0.5rem;
}

.product-content {
  background: hsl(var(--card));
  border-radius: 1rem;
  padding: 2rem;
  border: 1px solid hsl(var(--border));
}

.product-header {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  margin-bottom: 3rem;
}

.product-gallery .main-image {
  width: 100%;
  height: 400px;
  object-fit: cover;
  border-radius: 0.5rem;
}

.thumbnail-list {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.thumbnail {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 0.25rem;
  cursor: pointer;
  border: 2px solid transparent;
}

.thumbnail:hover {
  border-color: hsl(var(--primary));
}

.product-title {
  font-size: 2rem;
  color: hsl(var(--foreground));
  margin-bottom: 1rem;
}

.product-description {
  color: hsl(var(--muted-foreground));
  margin-bottom: 2rem;
  line-height: 1.6;
}

.price-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.current-price {
  font-size: 2rem;
  font-weight: bold;
  color: hsl(var(--primary));
}

.original-price {
  font-size: 1.2rem;
  color: hsl(var(--muted-foreground));
  text-decoration: line-through;
}

.discount {
  background: hsl(var(--destructive));
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.8rem;
}

.rating-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.stars {
  display: flex;
}

.star {
  color: hsl(var(--muted-foreground));
  font-size: 1.2rem;
}

.star.filled {
  color: #ffd700;
}

.rating-text {
  color: hsl(var(--muted-foreground));
}

.actions {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.buy-btn {
  flex: 2;
  padding: 1rem 2rem;
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  border: none;
  border-radius: 0.5rem;
  font-size: 1.1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.buy-btn:hover {
  background: hsl(var(--primary) / 0.9);
}

.favorite-btn {
  flex: 1;
  padding: 1rem;
  background: hsl(var(--secondary));
  color: hsl(var(--secondary-foreground));
  border: 1px solid hsl(var(--border));
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.favorite-btn:hover {
  background: hsl(var(--secondary) / 0.8);
}

.features h3 {
  margin-bottom: 1rem;
  color: hsl(var(--foreground));
}

.features ul {
  list-style: none;
  padding: 0;
}

.features li {
  padding: 0.5rem 0;
  color: hsl(var(--muted-foreground));
  position: relative;
  padding-left: 1.5rem;
}

.features li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: hsl(var(--primary));
}

.product-tabs {
  border-top: 1px solid hsl(var(--border));
  padding-top: 2rem;
}

.tab-header {
  display: flex;
  border-bottom: 1px solid hsl(var(--border));
  margin-bottom: 2rem;
}

.tab-btn {
  padding: 1rem 2rem;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  color: hsl(var(--muted-foreground));
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn.active {
  color: hsl(var(--primary));
  border-bottom-color: hsl(var(--primary));
}

.tab-btn:hover {
  color: hsl(var(--foreground));
}

.tab-panel {
  min-height: 200px;
}

.description-content {
  line-height: 1.8;
  color: hsl(var(--foreground));
}

.reviews-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.write-review-btn {
  padding: 0.5rem 1rem;
  background: hsl(var(--primary));
  color: white;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
}

.review-item {
  border-bottom: 1px solid hsl(var(--border));
  padding: 1.5rem 0;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.reviewer-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.reviewer-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.reviewer-name {
  font-weight: 600;
  color: hsl(var(--foreground));
}

.review-date {
  font-size: 0.8rem;
  color: hsl(var(--muted-foreground));
}

.review-content {
  color: hsl(var(--foreground));
  line-height: 1.6;
}

.no-reviews {
  text-align: center;
  padding: 3rem;
  color: hsl(var(--muted-foreground));
}

.loading {
  text-align: center;
  padding: 3rem;
  color: hsl(var(--muted-foreground));
}

@media (max-width: 768px) {
  .product-header {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .product-detail-view {
    padding: 1rem;
  }
  
  .tab-header {
    flex-direction: column;
  }
  
  .tab-btn {
    text-align: left;
  }
}
</style>
