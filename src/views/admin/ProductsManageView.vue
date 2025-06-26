<template>
  <div class="products-manage-view">
    <!-- 页面头部 -->
    <div class="page-header">
      <h2 class="page-title">产品管理</h2>
      <button class="add-btn" @click="showAddModal = true">
        <PlusIcon class="icon" />
        添加产品
      </button>
    </div>

    <!-- 搜索和筛选 -->
    <div class="filters">
      <div class="search-box">
        <SearchIcon class="search-icon" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索产品..."
          class="search-input"
        />
      </div>
      <select v-model="statusFilter" class="status-filter">
        <option value="">全部状态</option>
        <option value="active">已发布</option>
        <option value="draft">草稿</option>
        <option value="inactive">已下架</option>
      </select>
    </div>

    <!-- 产品列表 -->
    <div class="products-table">
      <div class="table-header">
        <div class="col-image">图片</div>
        <div class="col-name">产品名称</div>
        <div class="col-category">分类</div>
        <div class="col-price">价格</div>
        <div class="col-status">状态</div>
        <div class="col-actions">操作</div>
      </div>

      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>加载中...</p>
      </div>

      <div v-else-if="filteredProducts.length === 0" class="empty-state">
        <ShoppingBagIcon class="empty-icon" />
        <h3>暂无产品</h3>
        <p>还没有添加任何产品</p>
      </div>

      <div v-else class="table-body">
        <div
          v-for="product in filteredProducts"
          :key="product.id"
          class="table-row"
        >
          <div class="col-image">
            <img :src="product.image" :alt="product.name" class="product-image" />
          </div>
          <div class="col-name">
            <div class="product-name">{{ product.name }}</div>
            <div class="product-description">{{ product.description }}</div>
          </div>
          <div class="col-category">
            <span class="category-tag">{{ product.category }}</span>
          </div>
          <div class="col-price">
            <div class="price">¥{{ product.price }}</div>
            <div v-if="product.originalPrice" class="original-price">
              ¥{{ product.originalPrice }}
            </div>
          </div>
          <div class="col-status">
            <span :class="['status-badge', product.status]">
              {{ getStatusText(product.status) }}
            </span>
          </div>
          <div class="col-actions">
            <button class="action-btn edit" @click="editProduct(product)">
              <EditIcon class="icon" />
            </button>
            <button class="action-btn delete" @click="deleteProduct(product.id)">
              <TrashIcon class="icon" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加/编辑产品模态框 -->
    <div v-if="showAddModal || showEditModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ showAddModal ? '添加产品' : '编辑产品' }}</h3>
          <button class="close-btn" @click="closeModal">
            <XIcon class="icon" />
          </button>
        </div>
        <div class="modal-body">
          <p>产品管理功能正在开发中...</p>
          <p>将包含完整的产品添加、编辑、删除功能</p>
        </div>
        <div class="modal-footer">
          <button class="btn secondary" @click="closeModal">取消</button>
          <button class="btn primary">{{ showAddModal ? '添加' : '保存' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  PlusIcon,
  SearchIcon,
  EditIcon,
  TrashIcon,
  XIcon,
  ShoppingBagIcon
} from 'lucide-vue-next'

// 响应式状态
const loading = ref(true)
const searchQuery = ref('')
const statusFilter = ref('')
const showAddModal = ref(false)
const showEditModal = ref(false)
const editingProduct = ref(null)

// 模拟产品数据
const products = ref([
  {
    id: 1,
    name: '高效办公套件',
    description: '提升办公效率的完整解决方案',
    price: 299,
    originalPrice: 399,
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100&h=100&fit=crop',
    category: '办公工具',
    status: 'active'
  },
  {
    id: 2,
    name: '设计师工具包',
    description: '专业设计师必备工具集合',
    price: 199,
    image: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=100&h=100&fit=crop',
    category: '设计工具',
    status: 'active'
  },
  {
    id: 3,
    name: '开发者助手',
    description: '程序员开发必备工具',
    price: 399,
    originalPrice: 499,
    image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=100&h=100&fit=crop',
    category: '开发工具',
    status: 'draft'
  }
])

// 计算属性
const filteredProducts = computed(() => {
  let filtered = products.value

  // 按搜索关键词筛选
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(product =>
      product.name.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query)
    )
  }

  // 按状态筛选
  if (statusFilter.value) {
    filtered = filtered.filter(product => product.status === statusFilter.value)
  }

  return filtered
})

// 方法
const getStatusText = (status: string) => {
  const statusMap = {
    active: '已发布',
    draft: '草稿',
    inactive: '已下架'
  }
  return statusMap[status] || status
}

const editProduct = (product: any) => {
  editingProduct.value = product
  showEditModal.value = true
}

const deleteProduct = (productId: number) => {
  if (confirm('确定要删除这个产品吗？')) {
    products.value = products.value.filter(p => p.id !== productId)
    console.log('删除产品:', productId)
  }
}

const closeModal = () => {
  showAddModal.value = false
  showEditModal.value = false
  editingProduct.value = null
}

// 生命周期
onMounted(() => {
  // 模拟加载数据
  setTimeout(() => {
    loading.value = false
  }, 1000)
})
</script>

<style scoped>
.products-manage-view {
  padding: 1.5rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.add-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: #0078d4;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.add-btn:hover {
  background: #106ebe;
}

.filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.search-box {
  position: relative;
  flex: 1;
  max-width: 300px;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1rem;
  height: 1rem;
  color: #666;
}

.search-input {
  width: 100%;
  padding: 0.75rem 0.75rem 0.75rem 2.5rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.875rem;
}

.status-filter {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.875rem;
}

.products-table {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.table-header {
  display: grid;
  grid-template-columns: 80px 1fr 120px 100px 100px 100px;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  font-weight: 600;
  color: #666;
  font-size: 0.875rem;
}

.table-row {
  display: grid;
  grid-template-columns: 80px 1fr 120px 100px 100px 100px;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid #eee;
  align-items: center;
}

.product-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 6px;
}

.product-name {
  font-weight: 500;
  color: #1a1a1a;
  margin-bottom: 0.25rem;
}

.product-description {
  font-size: 0.875rem;
  color: #666;
}

.category-tag {
  padding: 0.25rem 0.5rem;
  background: #e3f2fd;
  color: #1976d2;
  border-radius: 4px;
  font-size: 0.75rem;
}

.price {
  font-weight: 600;
  color: #1a1a1a;
}

.original-price {
  font-size: 0.75rem;
  color: #999;
  text-decoration: line-through;
}

.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-badge.active {
  background: #e8f5e8;
  color: #2e7d32;
}

.status-badge.draft {
  background: #fff3e0;
  color: #f57c00;
}

.status-badge.inactive {
  background: #ffebee;
  color: #d32f2f;
}

.col-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  padding: 0.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.action-btn.edit {
  background: #e3f2fd;
  color: #1976d2;
}

.action-btn.edit:hover {
  background: #bbdefb;
}

.action-btn.delete {
  background: #ffebee;
  color: #d32f2f;
}

.action-btn.delete:hover {
  background: #ffcdd2;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: #666;
}

.loading-spinner {
  width: 2rem;
  height: 2rem;
  border: 2px solid #eee;
  border-top: 2px solid #0078d4;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-icon {
  width: 3rem;
  height: 3rem;
  color: #ccc;
  margin-bottom: 1rem;
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
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.close-btn {
  padding: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.5rem;
  border-top: 1px solid #eee;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.btn.secondary {
  background: #f5f5f5;
  color: #666;
}

.btn.secondary:hover {
  background: #e0e0e0;
}

.btn.primary {
  background: #0078d4;
  color: white;
}

.btn.primary:hover {
  background: #106ebe;
}
</style>
