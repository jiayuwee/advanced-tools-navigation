<template>
  <div class="orders-view">
    <div class="orders-header">
      <h1>我的订单</h1>
      <p>查看和管理您的订单历史</p>
    </div>

    <div class="orders-filters">
      <button
        v-for="filter in statusFilters"
        :key="filter.key"
        class="filter-btn"
        :class="{ active: activeFilter === filter.key }"
        @click="activeFilter = filter.key"
      >
        {{ filter.label }}
        <span class="filter-count">{{ getFilterCount(filter.key) }}</span>
      </button>
    </div>

    <div class="orders-content">
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>正在加载订单...</p>
      </div>

      <div v-else-if="filteredOrders.length > 0" class="orders-list">
        <div v-for="order in filteredOrders" :key="order.id" class="order-item">
          <div class="order-header">
            <div class="order-info">
              <h3 class="order-number">
                订单号: {{ order.id.slice(-8).toUpperCase() }}
              </h3>
              <p class="order-date">
                下单时间: {{ formatDate(order.created_at) }}
              </p>
            </div>
            <div class="order-status">
              <span class="status-badge" :class="order.status">
                {{ getStatusText(order.status) }}
              </span>
            </div>
          </div>

          <div class="order-items">
            <div
              v-for="item in order.items"
              :key="item.id"
              class="order-item-detail"
            >
              <div class="item-image">
                <img
                  :src="item.product?.images?.[0] || '/placeholder.jpg'"
                  :alt="item.product?.name"
                />
              </div>
              <div class="item-info">
                <h4 class="item-name">{{ item.product?.name }}</h4>
                <p class="item-description">
                  {{ item.product?.short_description }}
                </p>
                <div class="item-meta">
                  <span class="item-quantity">数量: {{ item.quantity }}</span>
                  <span class="item-price">单价: ¥{{ item.unit_price }}</span>
                </div>
              </div>
              <div class="item-total">¥{{ item.total_price }}</div>
            </div>
          </div>

          <div class="order-footer">
            <div class="order-total">
              <span class="total-label">订单总额:</span>
              <span class="total-amount">¥{{ order.total_amount }}</span>
            </div>
            <div class="order-actions">
              <button
                v-if="order.status === 'pending'"
                class="action-btn primary"
                @click="payOrder(order)"
              >
                立即支付
              </button>
              <button
                v-if="order.status === 'pending'"
                class="action-btn secondary"
                @click="cancelOrder(order)"
              >
                取消订单
              </button>
              <button
                v-if="order.status === 'paid'"
                class="action-btn secondary"
                @click="downloadOrder(order)"
              >
                <DownloadIcon class="icon" />
                下载产品
              </button>
              <button
                class="action-btn secondary"
                @click="viewOrderDetail(order)"
              >
                查看详情
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <div class="empty-icon">📦</div>
        <h3>{{ getEmptyStateTitle() }}</h3>
        <p>{{ getEmptyStateDescription() }}</p>
        <router-link to="/products" class="empty-action"
          >去购买产品</router-link
        >
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { DownloadIcon } from "lucide-vue-next";
import type { Order } from "../../types";

const router = useRouter();

// 响应式状态
const loading = ref(true);
const activeFilter = ref("all");
const orders = ref<Order[]>([]);
const error = ref<Error | null>(null);

const statusFilters = [
  { key: "all", label: "全部订单" },
  { key: "pending", label: "待支付" },
  { key: "paid", label: "已支付" },
  { key: "cancelled", label: "已取消" },
  { key: "refunded", label: "已退款" },
];

// 计算属性
const filteredOrders = computed(() => {
  if (activeFilter.value === "all") {
    return orders.value;
  }
  return orders.value.filter((order) => order.status === activeFilter.value);
});

const getFilterCount = (filterKey: string) => {
  if (filterKey === "all") return orders.value.length;
  return orders.value.filter((order) => order.status === filterKey).length;
};

// 方法
const loadOrders = async () => {
  try {
    loading.value = true;

    // 导入必要的服务
    const { OrderService } = await import("@/services/orderService");
    const { useAuthStore } = await import("@/stores/auth");

    const authStore = useAuthStore();
    if (!authStore.user) {
      console.error("用户未登录");
      return;
    }

    try {
      // 从API加载真实订单数据
      const userOrders = await OrderService.getUserOrders(authStore.user.id);
      orders.value = userOrders;
      return; // 成功加载真实数据，直接返回
    } catch (apiError: unknown) {
      const msg = safeErrorMessage(apiError);
      if (import.meta.env.PROD) {
        console.error("加载真实订单数据失败（生产），请检查后端连接:", msg);
        error.value = new Error(msg);
        loading.value = false;
        return;
      }

      console.warn("加载真实订单数据失败，使用模拟数据:", msg);
    }

    // 如果API失败，使用模拟数据作为后备
    await new Promise((resolve) => setTimeout(resolve, 1000));

    orders.value = [
      {
        id: "order-1",
        userId: "user-1",
        items: [
          {
            id: "item-1",
            orderId: "order-1",
            productId: "product-1",
            quantity: 1,
            unitPrice: 299,
            totalPrice: 299,
            createdAt: new Date().toISOString(),
            product: {
              id: "product-1",
              name: "高效办公套件",
              description: "一套提升办公效率的完整工具组合",
              short_description: "提升办公效率的完整解决方案",
              price: 299,
              currency: "CNY",
              category_id: "550e8400-e29b-41d4-a716-446655440001",
              images: ["/placeholder.jpg"],
            },
          },
        ],
        totalAmount: 299,
        currency: "CNY",
        status: "paid" as const,
        paymentMethod: "alipay",
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
      },
      {
        id: "order-2",
        userId: "user-1",
        items: [
          {
            id: "item-2",
            orderId: "order-2",
            productId: "product-2",
            quantity: 1,
            unitPrice: 199,
            totalPrice: 199,
            createdAt: new Date().toISOString(),
            product: {
              id: "product-2",
              name: "设计师工具包",
              description: "专业设计师的工具集合，包含设计和原型所需资源",
              short_description: "专业设计师必备工具集合",
              price: 199,
              currency: "CNY",
              category_id: "550e8400-e29b-41d4-a716-446655440002",
              images: ["/placeholder.jpg"],
            },
          },
        ],
        totalAmount: 199,
        currency: "CNY",
        status: "pending" as const,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ] as unknown as Order[];
  } catch (err: unknown) {
    const msg = safeErrorMessage(err);
    console.error("加载订单失败:", msg);
    error.value = new Error(msg);
  } finally {
    loading.value = false;
  }
};

const getStatusText = (status: string) => {
  const statusMap = {
    pending: "待支付",
    paid: "已支付",
    cancelled: "已取消",
    refunded: "已退款",
  };
  return statusMap[status as keyof typeof statusMap] || status;
};

const getEmptyStateTitle = () => {
  const titleMap = {
    all: "暂无订单",
    pending: "暂无待支付订单",
    paid: "暂无已支付订单",
    cancelled: "暂无已取消订单",
    refunded: "暂无已退款订单",
  };
  return titleMap[activeFilter.value as keyof typeof titleMap] || "暂无订单";
};

const getEmptyStateDescription = () => {
  const descMap = {
    all: "您还没有任何订单，去购买一些产品吧！",
    pending: "您没有待支付的订单",
    paid: "您没有已支付的订单",
    cancelled: "您没有已取消的订单",
    refunded: "您没有已退款的订单",
  };
  return descMap[activeFilter.value as keyof typeof descMap] || "暂无相关订单";
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString("zh-CN");
};

const payOrder = (order: Order) => {
  router.push(`/payment?order=${order.id}`);
};

const cancelOrder = async (order: Order) => {
  if (!confirm("确定要取消这个订单吗？")) return;

  try {
    // TODO: 实现取消订单逻辑
    // await OrdersService.cancelOrder(order.id)

    const orderIndex = orders.value.findIndex((o) => o.id === order.id);
    if (orderIndex !== -1) {
      orders.value[orderIndex].status = "cancelled";
    }
  } catch (err: unknown) {
    console.error("取消订单失败:", safeErrorMessage(err));
  }
};

const downloadOrder = async (order: Order) => {
  try {
    console.log("下载订单产品:", order.id);

    // 检查订单状态
    if (order.status !== "paid") {
      alert("订单未支付，无法下载");
      return;
    }

    // 导入订单服务
    const { OrderService } = await import("@/services/orderService");
    const { useAuthStore } = await import("@/stores/auth");

    const authStore = useAuthStore();
    if (!authStore.user) {
      alert("请先登录");
      return;
    }

    // 验证下载权限并获取最新订单信息
    const latestOrder = await OrderService.getOrderById(
      order.id,
      authStore.user.id,
    );
    if (!latestOrder || latestOrder.status !== "paid") {
      alert("订单状态异常，无法下载");
      return;
    }

    // 下载所有产品
    let downloadCount = 0;
    for (const item of latestOrder.items) {
      if (item.product?.download_url) {
        const link = document.createElement("a");
        link.href = item.product.download_url;
        link.download = `${item.product.name}.zip`;
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        downloadCount++;

        // 延迟一下避免浏览器阻止多个下载
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    if (downloadCount === 0) {
      alert("该订单中没有可下载的产品");
    } else {
      console.log(`成功启动 ${downloadCount} 个产品的下载`);
    }
  } catch (err: unknown) {
    console.error("下载失败:", safeErrorMessage(err));
    alert("下载失败，请稍后重试");
  }
};

const viewOrderDetail = (order: Order) => {
  // TODO: 实现查看订单详情
  console.log("查看订单详情:", order.id);
};

// 生命周期
onMounted(() => {
  loadOrders();
});

// 从 unknown 错误对象安全提取字符串信息
function safeErrorMessage(err: unknown): string {
  if (!err) return "未知错误";
  if (typeof err === "string") return err;
  if (err instanceof Error) return err.message;
  try {
    return JSON.stringify(err as Record<string, unknown>);
  } catch {
    return String(err);
  }
}
</script>

<style scoped>
.orders-view {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
}

.orders-header {
  text-align: center;
  margin-bottom: 3rem;
}

.orders-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: #323130;
  margin: 0 0 0.5rem 0;
}

.orders-header p {
  color: #605e5c;
  font-size: 1.125rem;
  margin: 0;
}

.orders-filters {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  background: white;
  border-radius: 8px;
  padding: 0.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow-x: auto;
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #605e5c;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.filter-btn:hover {
  background: #f3f2f1;
}

.filter-btn.active {
  background: #0078d4;
  color: white;
}

.filter-count {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.25rem 0.5rem;
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: 600;
}

.filter-btn.active .filter-count {
  background: rgba(255, 255, 255, 0.3);
}

.orders-content {
  min-height: 400px;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.order-item {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.order-item:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e1dfdd;
}

.order-number {
  font-size: 1.125rem;
  font-weight: 600;
  color: #323130;
  margin: 0 0 0.25rem 0;
}

.order-date {
  color: #605e5c;
  font-size: 0.875rem;
  margin: 0;
}

.status-badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
}

.status-badge.pending {
  background: #fff4e6;
  color: #d97706;
}

.status-badge.paid {
  background: #f0fdf4;
  color: #16a34a;
}

.status-badge.cancelled {
  background: #fef2f2;
  color: #dc2626;
}

.status-badge.refunded {
  background: #f3f4f6;
  color: #6b7280;
}

.order-items {
  margin-bottom: 1.5rem;
}

.order-item-detail {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid #f3f2f1;
}

.order-item-detail:last-child {
  border-bottom: none;
}

.item-image {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-info {
  flex: 1;
}

.item-name {
  font-size: 1rem;
  font-weight: 600;
  color: #323130;
  margin: 0 0 0.25rem 0;
}

.item-description {
  color: #605e5c;
  font-size: 0.875rem;
  margin: 0 0 0.5rem 0;
}

.item-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.75rem;
  color: #8a8886;
}

.item-total {
  font-size: 1.125rem;
  font-weight: 700;
  color: #323130;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid #e1dfdd;
}

.order-total {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.total-label {
  color: #605e5c;
  font-weight: 500;
}

.total-amount {
  font-size: 1.25rem;
  font-weight: 700;
  color: #d13438;
}

.order-actions {
  display: flex;
  gap: 0.75rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
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
  .orders-view {
    padding: 1rem;
  }

  .orders-filters {
    flex-wrap: wrap;
  }

  .order-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .order-footer {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .order-actions {
    width: 100%;
    justify-content: flex-end;
  }

  .order-item-detail {
    flex-direction: column;
    text-align: center;
  }

  .item-info {
    text-align: center;
  }
}
</style>
