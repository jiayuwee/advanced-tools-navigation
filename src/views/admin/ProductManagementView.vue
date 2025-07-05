<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 页面头部 -->
    <div class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">产品管理</h1>
            <p class="mt-1 text-sm text-gray-600">
              管理用户提交的产品，进行审核、编辑和发布
            </p>
          </div>
          <div class="flex space-x-3">
            <button
              class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              @click="refreshData"
            >
              <RefreshCw class="w-4 h-4 mr-2" />
              刷新
            </button>
            <router-link
              to="/upload-product"
              class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm text-sm font-medium hover:bg-blue-700"
            >
              <Plus class="w-4 h-4 mr-2" />
              添加产品
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- 主要内容 -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- 统计卡片 -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <Package class="w-8 h-8 text-blue-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">总产品数</p>
              <p class="text-2xl font-semibold text-gray-900">
                {{ stats.total }}
              </p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <Clock class="w-8 h-8 text-yellow-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">待审核</p>
              <p class="text-2xl font-semibold text-gray-900">
                {{ stats.pending }}
              </p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <CheckCircle class="w-8 h-8 text-green-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">已发布</p>
              <p class="text-2xl font-semibold text-gray-900">
                {{ stats.published }}
              </p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <XCircle class="w-8 h-8 text-red-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">已拒绝</p>
              <p class="text-2xl font-semibold text-gray-900">
                {{ stats.rejected }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- 筛选和搜索 -->
      <div class="bg-white rounded-lg shadow mb-6">
        <div class="p-6 border-b border-gray-200">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <!-- 搜索 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >搜索产品</label
              >
              <div class="relative">
                <Search
                  class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                />
                <input
                  v-model="filters.search"
                  type="text"
                  placeholder="产品名称或描述"
                  class="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <!-- 状态筛选 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >状态</label
              >
              <select
                v-model="filters.status"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">全部状态</option>
                <option value="pending">待审核</option>
                <option value="approved">已通过</option>
                <option value="rejected">已拒绝</option>
                <option value="published">已发布</option>
              </select>
            </div>

            <!-- 分类筛选 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >分类</label
              >
              <select
                v-model="filters.category"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">全部分类</option>
                <option
                  v-for="category in categories"
                  :key="category.id"
                  :value="category.id"
                >
                  {{ category.name }}
                </option>
              </select>
            </div>

            <!-- 排序 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >排序</label
              >
              <select
                v-model="filters.sort"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="created_at_desc">最新提交</option>
                <option value="created_at_asc">最早提交</option>
                <option value="name_asc">名称 A-Z</option>
                <option value="name_desc">名称 Z-A</option>
                <option value="price_asc">价格低到高</option>
                <option value="price_desc">价格高到低</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- 产品列表 -->
      <div class="bg-white rounded-lg shadow">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">产品列表</h3>
        </div>

        <div v-if="loading" class="p-8 text-center">
          <Loader2 class="w-8 h-8 animate-spin mx-auto text-gray-400" />
          <p class="mt-2 text-gray-600">加载中...</p>
        </div>

        <div v-else-if="filteredProducts.length === 0" class="p-8 text-center">
          <Package class="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p class="text-gray-600">暂无产品数据</p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  产品信息
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  分类/价格
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  状态
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  提交时间
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  操作
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr
                v-for="product in paginatedProducts"
                :key="product.id"
                class="hover:bg-gray-50"
              >
                <!-- 产品信息 -->
                <td class="px-6 py-4">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 w-12 h-12">
                      <img
                        v-if="product.image_url"
                        :src="product.image_url"
                        :alt="product.name"
                        class="w-12 h-12 rounded-lg object-cover"
                      />
                      <div
                        v-else
                        class="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center"
                      >
                        <Package class="w-6 h-6 text-gray-400" />
                      </div>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">
                        {{ product.name }}
                      </div>
                      <div class="text-sm text-gray-500 max-w-xs truncate">
                        {{ product.description }}
                      </div>
                    </div>
                  </div>
                </td>

                <!-- 分类/价格 -->
                <td class="px-6 py-4">
                  <div class="text-sm text-gray-900">
                    {{ getCategoryName(product.category_id) }}
                  </div>
                  <div class="text-sm text-gray-500">
                    {{ product.price === 0 ? "免费" : `¥${product.price}` }}
                  </div>
                </td>

                <!-- 状态 -->
                <td class="px-6 py-4">
                  <span
                    :class="getStatusClass(product.status)"
                    class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                  >
                    {{ getStatusText(product.status) }}
                  </span>
                </td>

                <!-- 提交时间 -->
                <td class="px-6 py-4 text-sm text-gray-500">
                  {{ formatDate(product.created_at) }}
                </td>

                <!-- 操作 -->
                <td class="px-6 py-4">
                  <div class="flex space-x-2">
                    <button
                      class="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      @click="viewProduct(product)"
                    >
                      查看
                    </button>
                    <button
                      v-if="product.status === 'pending'"
                      class="text-green-600 hover:text-green-800 text-sm font-medium"
                      @click="approveProduct(product)"
                    >
                      通过
                    </button>
                    <button
                      v-if="product.status === 'pending'"
                      class="text-red-600 hover:text-red-800 text-sm font-medium"
                      @click="rejectProduct(product)"
                    >
                      拒绝
                    </button>
                    <button
                      class="text-gray-600 hover:text-gray-800 text-sm font-medium"
                      @click="editProduct(product)"
                    >
                      编辑
                    </button>
                    <button
                      class="text-red-600 hover:text-red-800 text-sm font-medium"
                      @click="deleteProduct(product)"
                    >
                      删除
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 分页 -->
        <div v-if="totalPages > 1" class="px-6 py-4 border-t border-gray-200">
          <div class="flex items-center justify-between">
            <div class="text-sm text-gray-700">
              显示 {{ (currentPage - 1) * pageSize + 1 }} 到
              {{ Math.min(currentPage * pageSize, filteredProducts.length) }}
              条， 共 {{ filteredProducts.length }} 条记录
            </div>
            <div class="flex space-x-2">
              <button
                :disabled="currentPage === 1"
                class="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                @click="currentPage--"
              >
                上一页
              </button>
              <span class="px-3 py-1 text-sm text-gray-700">
                {{ currentPage }} / {{ totalPages }}
              </span>
              <button
                :disabled="currentPage === totalPages"
                class="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                @click="currentPage++"
              >
                下一页
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 产品详情模态框 -->
    <ProductDetailModal
      v-if="selectedProduct"
      :product="selectedProduct"
      @close="selectedProduct = null"
      @approve="handleApprove"
      @reject="handleReject"
      @edit="handleEdit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Plus,
  Search,
  Loader2,
} from "lucide-vue-next";
import ProductDetailModal from "@/components/admin/ProductDetailModal.vue";

// 模拟数据接口
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category_id: string;
  status: "pending" | "approved" | "rejected" | "published";
  image_url?: string;
  created_at: string;
  updated_at: string;
  submitted_by: string;
}

interface Category {
  id: string;
  name: string;
}

// 响应式数据
const loading = ref(false);
const products = ref<Product[]>([]);
const categories = ref<Category[]>([]);
const selectedProduct = ref<Product | null>(null);
const currentPage = ref(1);
const pageSize = ref(10);

// 筛选条件
const filters = reactive({
  search: "",
  status: "",
  category: "",
  sort: "created_at_desc",
});

// 统计数据
const stats = computed(() => {
  const total = products.value.length;
  const pending = products.value.filter((p) => p.status === "pending").length;
  const published = products.value.filter(
    (p) => p.status === "published",
  ).length;
  const rejected = products.value.filter((p) => p.status === "rejected").length;

  return { total, pending, published, rejected };
});

// 排序函数 - 提取出来避免重复代码
const sortProducts = (products: Product[], sortType: string) => {
  return [...products].sort((a, b) => {
    switch (sortType) {
      case "created_at_desc":
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      case "created_at_asc":
        return (
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      case "name_asc":
        return a.name.localeCompare(b.name);
      case "name_desc":
        return b.name.localeCompare(a.name);
      case "price_asc":
        return a.price - b.price;
      case "price_desc":
        return b.price - a.price;
      default:
        return 0;
    }
  });
};

// 过滤后的产品 - 优化性能
const filteredProducts = computed(() => {
  const { search, status, category, sort } = filters;

  // 如果没有任何过滤条件，直接返回排序后的原数组
  if (!search && !status && !category) {
    return sortProducts(products.value, sort);
  }

  // 使用单次遍历进行所有过滤
  const filtered = products.value.filter((product) => {
    // 搜索过滤
    if (search) {
      const searchLower = search.toLowerCase();
      const matchesSearch =
        product.name.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    // 状态过滤
    if (status && product.status !== status) return false;

    // 分类过滤
    if (category && product.category_id !== category) return false;

    return true;
  });

  return sortProducts(filtered, sort);
});

// 分页后的产品
const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredProducts.value.slice(start, end);
});

// 总页数
const totalPages = computed(() => {
  return Math.ceil(filteredProducts.value.length / pageSize.value);
});

// 方法
const getCategoryName = (categoryId: string) => {
  const category = categories.value.find((c) => c.id === categoryId);
  return category?.name || "未知分类";
};

const getStatusClass = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "approved":
    case "published":
      return "bg-green-100 text-green-800";
    case "rejected":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case "pending":
      return "待审核";
    case "approved":
      return "已通过";
    case "published":
      return "已发布";
    case "rejected":
      return "已拒绝";
    default:
      return "未知";
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const viewProduct = (product: Product) => {
  selectedProduct.value = product;
};

const approveProduct = async (product: Product) => {
  if (confirm(`确定要通过产品"${product.name}"吗？`)) {
    // 这里应该调用API
    product.status = "approved";
    console.log("产品已通过:", product.name);
  }
};

const rejectProduct = async (product: Product) => {
  const reason = prompt(`请输入拒绝产品"${product.name}"的原因：`);
  if (reason) {
    // 这里应该调用API
    product.status = "rejected";
    console.log("产品已拒绝:", product.name, "原因:", reason);
  }
};

const editProduct = (product: Product) => {
  // 跳转到编辑页面或打开编辑模态框
  console.log("编辑产品:", product.name);
};

const deleteProduct = async (product: Product) => {
  if (confirm(`确定要删除产品"${product.name}"吗？此操作不可恢复。`)) {
    // 这里应该调用API
    const index = products.value.findIndex((p) => p.id === product.id);
    if (index > -1) {
      products.value.splice(index, 1);
    }
    console.log("产品已删除:", product.name);
  }
};

const handleApprove = (product: Product) => {
  approveProduct(product);
  selectedProduct.value = null;
};

const handleReject = (product: Product) => {
  rejectProduct(product);
  selectedProduct.value = null;
};

const handleEdit = (product: Product) => {
  editProduct(product);
  selectedProduct.value = null;
};

const refreshData = async () => {
  loading.value = true;
  try {
    // 这里应该调用API获取最新数据
    // 移除人为延迟，提升性能
    console.log("数据已刷新");
  } finally {
    loading.value = false;
  }
};

// 初始化数据
const initData = () => {
  // 模拟分类数据
  categories.value = [
    { id: "1", name: "开发工具" },
    { id: "2", name: "设计工具" },
    { id: "3", name: "办公软件" },
    { id: "4", name: "学习资源" },
    { id: "5", name: "其他工具" },
  ];

  // 模拟产品数据
  products.value = [
    {
      id: "1",
      name: "VS Code 插件包",
      description: "前端开发必备插件集合",
      price: 0,
      category_id: "1",
      status: "pending",
      image_url: "",
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z",
      submitted_by: "user1",
    },
    {
      id: "2",
      name: "UI 设计模板",
      description: "现代化的移动端UI设计模板",
      price: 99.99,
      category_id: "2",
      status: "published",
      image_url: "",
      created_at: "2024-01-14T15:20:00Z",
      updated_at: "2024-01-14T15:20:00Z",
      submitted_by: "user2",
    },
    {
      id: "3",
      name: "Excel 自动化工具",
      description: "提高办公效率的Excel插件",
      price: 49.99,
      category_id: "3",
      status: "rejected",
      image_url: "",
      created_at: "2024-01-13T09:15:00Z",
      updated_at: "2024-01-13T09:15:00Z",
      submitted_by: "user3",
    },
  ];
};

// 生命周期
onMounted(() => {
  // 使用 nextTick 确保DOM渲染完成后再初始化数据
  initData();
  document.title = "产品管理 - 管理后台";
});
</script>
