<template>
  <div class="order-management-view">
    <!-- 页面头部 -->
    <div class="page-header">
      <div>
        <h1>订单管理</h1>
        <p>管理系统订单，查看订单状态和支付信息</p>
      </div>
      <div class="header-actions">
        <button class="btn btn-secondary" @click="refreshOrders">
          <RefreshCwIcon class="icon" />
          刷新
        </button>
        <button class="btn btn-primary" @click="exportOrders">
          <DownloadIcon class="icon" />
          导出订单
        </button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">
          <FileTextIcon />
        </div>
        <div class="stat-content">
          <h3>{{ stats.totalOrders }}</h3>
          <p>总订单数</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon completed">
          <CheckCircleIcon />
        </div>
        <div class="stat-content">
          <h3>{{ stats.completedOrders }}</h3>
          <p>已完成</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon pending">
          <ClockIcon />
        </div>
        <div class="stat-content">
          <h3>{{ stats.pendingOrders }}</h3>
          <p>待处理</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon revenue">
          <DollarSignIcon />
        </div>
        <div class="stat-content">
          <h3>¥{{ stats.totalRevenue.toLocaleString() }}</h3>
          <p>总收入</p>
        </div>
      </div>
    </div>

    <!-- 筛选和搜索 -->
    <div class="filters-section">
      <div class="search-box">
        <SearchIcon class="search-icon" />
        <input
          v-model="filters.search"
          type="text"
          placeholder="搜索订单号、用户邮箱..."
          class="search-input"
        />
      </div>
      <div class="filter-controls">
        <select v-model="filters.status" class="filter-select">
          <option value="">所有状态</option>
          <option value="pending">待处理</option>
          <option value="processing">处理中</option>
          <option value="completed">已完成</option>
          <option value="cancelled">已取消</option>
        </select>
        <select v-model="filters.paymentMethod" class="filter-select">
          <option value="">所有支付方式</option>
          <option value="alipay">支付宝</option>
          <option value="wechat">微信支付</option>
          <option value="credit_card">信用卡</option>
        </select>
        <input
          v-model="filters.dateRange.start"
          type="date"
          class="filter-select"
          placeholder="开始日期"
        />
        <input
          v-model="filters.dateRange.end"
          type="date"
          class="filter-select"
          placeholder="结束日期"
        />
      </div>
    </div>

    <!-- 订单列表 -->
    <div class="orders-table-container">
      <div v-if="loading" class="loading-state">
        <Loader2Icon class="loading-icon" />
        <p>加载订单数据中...</p>
      </div>

      <table v-else class="orders-table">
        <thead>
          <tr>
            <th>订单信息</th>
            <th>用户</th>
            <th>金额</th>
            <th>支付方式</th>
            <th>状态</th>
            <th>创建时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="order in paginatedOrders"
            :key="order.id"
            class="order-row"
          >
            <td class="order-info">
              <div class="order-details">
                <h4>#{{ order.id.slice(0, 8) }}</h4>
                <p>{{ order.items?.length || 0 }} 个商品</p>
              </div>
            </td>
            <td class="user-info">
              <div class="user-details">
                <h4>{{ order.user?.full_name || "未知用户" }}</h4>
                <p>{{ order.user?.email || "N/A" }}</p>
              </div>
            </td>
            <td class="amount">
              <span class="price"
                >¥{{ order.total_amount.toLocaleString() }}</span
              >
              <span class="currency">{{ order.currency }}</span>
            </td>
            <td>
              <span class="payment-method" :class="order.payment_method">
                {{ getPaymentMethodText(order.payment_method) }}
              </span>
            </td>
            <td>
              <span class="status-badge" :class="order.status">
                {{ getStatusText(order.status) }}
              </span>
            </td>
            <td>{{ formatDate(order.created_at) }}</td>
            <td class="actions">
              <button class="action-btn view" @click="viewOrder(order)">
                <EyeIcon />
              </button>
              <button
                v-if="order.status === 'pending'"
                class="action-btn process"
                @click="processOrder(order)"
              >
                <PlayIcon />
              </button>
              <button
                v-if="order.status !== 'cancelled' && order.status !== 'paid'"
                class="action-btn cancel"
                @click="cancelOrder(order)"
              >
                <XIcon />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 分页 -->
    <div class="pagination">
      <button
        :disabled="currentPage === 1"
        class="pagination-btn"
        @click="currentPage--"
      >
        上一页
      </button>
      <span class="pagination-info">
        第 {{ currentPage }} 页，共 {{ totalPages }} 页
      </span>
      <button
        :disabled="currentPage === totalPages"
        class="pagination-btn"
        @click="currentPage++"
      >
        下一页
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from "vue";
import {
  FileTextIcon,
  CheckCircleIcon,
  ClockIcon,
  DollarSignIcon,
  SearchIcon,
  RefreshCwIcon,
  DownloadIcon,
  Loader2Icon,
  EyeIcon,
  PlayIcon,
  XIcon,
} from "lucide-vue-next";
import { OrderService } from "@/services/orderService";
import type { Order } from "@/types";

// 响应式数据
const loading = ref(false);
const orders = ref<Order[]>([]);
const totalOrders = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);

// 筛选条件
const filters = reactive({
  search: "",
  status: "",
  paymentMethod: "",
  dateRange: {
    start: "",
    end: "",
  },
});

// 统计数据
const stats = computed(() => {
  const total = orders.value.length;
  const completed = orders.value.filter((o) => o.status === "paid").length;
  const pending = orders.value.filter((o) => o.status === "pending").length;
  const revenue = orders.value
    .filter((o) => o.status === "paid")
    .reduce((sum, o) => sum + o.total_amount, 0);

  return {
    totalOrders: total,
    completedOrders: completed,
    pendingOrders: pending,
    totalRevenue: revenue,
  };
});

// 分页数据 - 使用服务端分页
const totalPages = computed(() =>
  Math.ceil(totalOrders.value / pageSize.value),
);
const paginatedOrders = computed(() => orders.value);

// 方法
const loadOrders = async () => {
  try {
    loading.value = true;

    // 构建筛选条件
    const filterParams = {
      search: filters.search || undefined,
      status: filters.status || undefined,
      paymentMethod: filters.paymentMethod || undefined,
      startDate: filters.dateRange.start || undefined,
      endDate: filters.dateRange.end || undefined,
      page: currentPage.value,
      limit: pageSize.value,
    };

    // 获取真实订单数据
    const result = await OrderService.getAllOrders(filterParams);
    orders.value = result.orders;

    // 更新分页信息
    totalOrders.value = result.total;
  } catch (error) {
    console.error("加载订单数据失败:", error);
    // 显示错误提示
    alert("加载订单数据失败，请稍后重试");
  } finally {
    loading.value = false;
  }
};

const refreshOrders = () => {
  loadOrders();
};

const exportOrders = async () => {
  try {
    // 构建导出筛选条件
    const exportFilters = {
      status: filters.status || undefined,
      startDate: filters.dateRange.start || undefined,
      endDate: filters.dateRange.end || undefined,
    };

    // 获取CSV数据
    const csvContent = await OrderService.exportOrders(exportFilters);

    // 创建下载链接
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `orders_${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.log("订单数据导出成功");
  } catch (error) {
    console.error("导出订单数据失败:", error);
    alert("导出订单数据失败，请稍后重试");
  }
};

const viewOrder = (order: Order) => {
  console.log("查看订单:", order.id);
};

const processOrder = async (order: Order) => {
  try {
    // 获取当前用户ID（管理员）
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    if (!currentUser.id) {
      throw new Error("未找到管理员用户信息");
    }

    // 更新订单状态为已支付
    await OrderService.updateOrderStatus(order.id, "paid", currentUser.id);

    // 重新加载订单数据
    await loadOrders();

    console.log(`订单 ${order.id} 已标记为已支付`);
  } catch (error) {
    console.error("处理订单失败:", error);
    alert("处理订单失败，请稍后重试");
  }
};

const cancelOrder = async (order: Order) => {
  try {
    // 获取当前用户ID（管理员）
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    if (!currentUser.id) {
      throw new Error("未找到管理员用户信息");
    }

    // 确认取消操作
    if (!confirm(`确定要取消订单 ${order.id} 吗？`)) {
      return;
    }

    // 更新订单状态为已取消
    await OrderService.updateOrderStatus(order.id, "cancelled", currentUser.id);

    // 重新加载订单数据
    await loadOrders();

    console.log(`订单 ${order.id} 已取消`);
  } catch (error) {
    console.error("取消订单失败:", error);
    alert("取消订单失败，请稍后重试");
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case "pending":
      return "待支付";
    case "paid":
      return "已支付";
    case "cancelled":
      return "已取消";
    case "refunded":
      return "已退款";
    default:
      return "未知";
  }
};

const getPaymentMethodText = (method: string) => {
  switch (method) {
    case "alipay":
      return "支付宝";
    case "wechat":
      return "微信支付";
    case "credit_card":
      return "信用卡";
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

// 监听筛选条件变化
watch(
  () => [
    filters.search,
    filters.status,
    filters.paymentMethod,
    filters.dateRange.start,
    filters.dateRange.end,
  ],
  () => {
    currentPage.value = 1; // 重置到第一页
    loadOrders();
  },
  { deep: true },
);

// 监听分页变化
watch([currentPage, pageSize], () => {
  loadOrders();
});

// 生命周期
onMounted(() => {
  loadOrders();
});
</script>

<style scoped>
.order-management-view {
  padding: 2rem;
  background: #f8f9fa;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
}

.page-header p {
  color: #6b7280;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-secondary {
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
}

.icon {
  width: 1rem;
  height: 1rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e5e7eb;
  color: #6b7280;
}

.stat-icon.completed {
  background: #dcfce7;
  color: #16a34a;
}

.stat-icon.pending {
  background: #fef3c7;
  color: #d97706;
}

.stat-icon.revenue {
  background: #dbeafe;
  color: #2563eb;
}

.stat-content h3 {
  font-size: 1.875rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.stat-content p {
  color: #6b7280;
  margin: 0;
  font-size: 0.875rem;
}

.filters-section {
  background: white;
  padding: 1.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.search-box {
  position: relative;
  flex: 1;
  min-width: 300px;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1rem;
  height: 1rem;
  color: #9ca3af;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
}

.filter-controls {
  display: flex;
  gap: 1rem;
}

.filter-select {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  background: white;
}

.orders-table-container {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 1.5rem;
}

.loading-state {
  padding: 3rem;
  text-align: center;
  color: #6b7280;
}

.loading-icon {
  width: 2rem;
  height: 2rem;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.orders-table {
  width: 100%;
  border-collapse: collapse;
}

.orders-table th {
  background: #f9fafb;
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
}

.order-row {
  border-bottom: 1px solid #f3f4f6;
}

.order-row:hover {
  background: #f9fafb;
}

.order-row td {
  padding: 1rem;
  vertical-align: middle;
}

.order-details h4 {
  margin: 0 0 0.25rem 0;
  font-weight: 600;
  color: #1f2937;
}

.order-details p {
  margin: 0;
  color: #6b7280;
  font-size: 0.875rem;
}

.user-details h4 {
  margin: 0 0 0.25rem 0;
  font-weight: 600;
  color: #1f2937;
}

.user-details p {
  margin: 0;
  color: #6b7280;
  font-size: 0.875rem;
}

.amount {
  text-align: right;
}

.price {
  font-weight: 600;
  color: #1f2937;
  font-size: 1.125rem;
}

.currency {
  color: #6b7280;
  font-size: 0.875rem;
  margin-left: 0.25rem;
}

.payment-method {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  background: #f3f4f6;
  color: #374151;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-badge.pending {
  background: #fef3c7;
  color: #d97706;
}

.status-badge.processing {
  background: #dbeafe;
  color: #2563eb;
}

.status-badge.completed {
  background: #dcfce7;
  color: #16a34a;
}

.status-badge.cancelled {
  background: #fee2e2;
  color: #dc2626;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  width: 2rem;
  height: 2rem;
  border: none;
  border-radius: 0.375rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn.view {
  background: #e0e7ff;
  color: #3730a3;
}

.action-btn.process {
  background: #dcfce7;
  color: #16a34a;
}

.action-btn.cancel {
  background: #fee2e2;
  color: #dc2626;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
}

.pagination-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  background: white;
  border-radius: 0.375rem;
  cursor: pointer;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  color: #6b7280;
  font-size: 0.875rem;
}
</style>
