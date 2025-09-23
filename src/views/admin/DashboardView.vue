<template>
  <div class="dashboard-view">
    <div class="dashboard-header">
      <h1>仪表盘</h1>
      <p>系统概览和关键指标</p>
    </div>

    <div class="dashboard-content">
      <!-- 统计卡片 -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon tools">
            <WrenchIcon class="icon" />
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ stats.totalTools }}</div>
            <div class="stat-label">工具总数</div>
            <div class="stat-change positive">
              +{{ stats.newToolsThisMonth }} 本月新增
            </div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon products">
            <ShoppingBagIcon class="icon" />
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ stats.totalProducts }}</div>
            <div class="stat-label">产品总数</div>
            <div class="stat-change positive">
              +{{ stats.newProductsThisMonth }} 本月新增
            </div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon users">
            <UsersIcon class="icon" />
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ stats.totalUsers }}</div>
            <div class="stat-label">用户总数</div>
            <div class="stat-change positive">
              +{{ stats.newUsersThisMonth }} 本月新增
            </div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon revenue">
            <DollarSignIcon class="icon" />
          </div>
          <div class="stat-info">
            <div class="stat-number">
              ¥{{ formatNumber(stats.totalRevenue) }}
            </div>
            <div class="stat-label">总收入</div>
            <div class="stat-change positive">
              +{{ stats.revenueGrowth }}% 本月增长
            </div>
          </div>
        </div>
      </div>

      <!-- 图表和数据 -->
      <div class="dashboard-grid">
        <!-- 访问趋势 -->
        <div class="dashboard-card">
          <div class="card-header">
            <h3>访问趋势</h3>
            <select v-model="visitsPeriod" class="period-select">
              <option value="7d">最近7天</option>
              <option value="30d">最近30天</option>
              <option value="90d">最近90天</option>
            </select>
          </div>
          <div class="card-content">
            <div class="chart-placeholder">
              <TrendingUpIcon class="chart-icon" />
              <p>访问量图表</p>
              <small
                >{{
                  visitsPeriod === "7d"
                    ? "7天"
                    : visitsPeriod === "30d"
                      ? "30天"
                      : "90天"
                }}内的访问趋势</small
              >
            </div>
          </div>
        </div>

        <!-- 热门工具 -->
        <div class="dashboard-card">
          <div class="card-header">
            <h3>热门工具</h3>
            <router-link to="/admin/tools" class="view-all"
              >查看全部</router-link
            >
          </div>
          <div class="card-content">
            <div class="popular-items">
              <div
                v-for="tool in popularTools"
                :key="tool.id"
                class="popular-item"
              >
                <div class="item-icon">{{ tool.icon || "🔧" }}</div>
                <div class="item-info">
                  <div class="item-name">{{ tool.name }}</div>
                  <div class="item-stats">{{ tool.clickCount }} 次访问</div>
                </div>
                <div class="item-trend">
                  <TrendingUpIcon class="trend-icon" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 最新订单 -->
        <div class="dashboard-card">
          <div class="card-header">
            <h3>最新订单</h3>
            <router-link to="/admin/orders" class="view-all"
              >查看全部</router-link
            >
          </div>
          <div class="card-content">
            <div class="recent-orders">
              <div
                v-for="order in recentOrders"
                :key="order.id"
                class="order-item"
              >
                <div class="order-info">
                  <div class="order-id">
                    #{{ order.id.slice(-8).toUpperCase() }}
                  </div>
                  <div class="order-user">
                    {{ order.user?.fullName || "匿名用户" }}
                  </div>
                </div>
                <div class="order-amount">¥{{ order.totalAmount }}</div>
                <div class="order-status" :class="order.status">
                  {{ getStatusText(order.status) }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 系统状态 -->
        <div class="dashboard-card">
          <div class="card-header">
            <h3>系统状态</h3>
          </div>
          <div class="card-content">
            <div class="system-status">
              <div class="status-item">
                <div class="status-indicator online"></div>
                <div class="status-info">
                  <div class="status-label">数据库</div>
                  <div class="status-value">正常</div>
                </div>
              </div>
              <div class="status-item">
                <div class="status-indicator online"></div>
                <div class="status-info">
                  <div class="status-label">存储服务</div>
                  <div class="status-value">正常</div>
                </div>
              </div>
              <div class="status-item">
                <div class="status-indicator online"></div>
                <div class="status-info">
                  <div class="status-label">支付服务</div>
                  <div class="status-value">正常</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { supabase } from "@/lib/supabaseClient";
import {
  WrenchIcon,
  ShoppingBagIcon,
  UsersIcon,
  DollarSignIcon,
  TrendingUpIcon,
} from "lucide-vue-next";

// 响应式状态
const visitsPeriod = ref("30d");
const stats = ref({
  totalTools: 0,
  totalProducts: 0,
  totalUsers: 0,
  totalRevenue: 0,
  newToolsThisMonth: 0,
  newProductsThisMonth: 0,
  newUsersThisMonth: 0,
  revenueGrowth: 0,
});

const popularTools = ref([
  { id: "1", name: "VS Code", icon: "💻", clickCount: 1250 },
  { id: "2", name: "Figma", icon: "🎨", clickCount: 980 },
  { id: "3", name: "Notion", icon: "📝", clickCount: 756 },
]);

const recentOrders = ref([
  {
    id: "order-1",
    user: { fullName: "张三" },
    totalAmount: 299,
    status: "paid" as const,
  },
  {
    id: "order-2",
    user: { fullName: "李四" },
    totalAmount: 199,
    status: "pending" as const,
  },
]);

// 方法
const loadDashboardData = async () => {
  try {
    // 获取工具统计
    const toolsResult = await supabase
      .from("tools")
      .select("id, status, is_featured, created_at", { count: "exact" });

    // 获取用户统计
    const usersResult = await supabase
      .from("user_profiles")
      .select("id, role, created_at", { count: "exact" });

    // 计算统计数据
    stats.value = {
      totalTools: toolsResult.count || 0,
      totalProducts: 0, // 需要实现产品统计
      totalUsers: usersResult.count || 0,
      totalRevenue: 0, // 需要实现收入统计
      newToolsThisMonth: 0, // 暂时设为0，后续可以计算
      newProductsThisMonth: 0,
      newUsersThisMonth: 0,
      revenueGrowth: 0,
    };
  } catch (error) {
    console.error("加载仪表盘数据失败:", error);
    // 如果API调用失败，使用模拟数据作为fallback
    stats.value = {
      totalTools: 156,
      totalProducts: 42,
      totalUsers: 1284,
      totalRevenue: 125680,
      newToolsThisMonth: 12,
      newProductsThisMonth: 5,
      newUsersThisMonth: 89,
      revenueGrowth: 15.6,
    };
  }
};

const formatNumber = (num: number): string => {
  return new Intl.NumberFormat("zh-CN").format(num);
};

const getStatusText = (status: string): string => {
  const statusMap = {
    pending: "待支付",
    paid: "已支付",
    cancelled: "已取消",
    refunded: "已退款",
  };
  return statusMap[status as keyof typeof statusMap] || status;
};

// 生命周期
onMounted(() => {
  loadDashboardData();
});
</script>

<style scoped>
.dashboard-view {
  padding: 0;
}

.dashboard-header {
  margin-bottom: 2rem;
}

.dashboard-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #323130;
  margin: 0 0 0.5rem 0;
}

.dashboard-header p {
  color: #605e5c;
  margin: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon.tools {
  background: #e3f2fd;
}
.stat-icon.products {
  background: #f3e5f5;
}
.stat-icon.users {
  background: #e8f5e8;
}
.stat-icon.revenue {
  background: #fff3e0;
}

.stat-icon .icon {
  width: 24px;
  height: 24px;
}

.stat-icon.tools .icon {
  color: #1976d2;
}
.stat-icon.products .icon {
  color: #7b1fa2;
}
.stat-icon.users .icon {
  color: #388e3c;
}
.stat-icon.revenue .icon {
  color: #f57c00;
}

.stat-info {
  flex: 1;
}

.stat-number {
  font-size: 1.75rem;
  font-weight: 700;
  color: #323130;
  margin-bottom: 0.25rem;
}

.stat-label {
  color: #605e5c;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.stat-change {
  font-size: 0.75rem;
  font-weight: 500;
}

.stat-change.positive {
  color: #16a34a;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.dashboard-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 1.5rem 0 1.5rem;
}

.card-header h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #323130;
  margin: 0;
}

.period-select {
  padding: 0.5rem;
  border: 1px solid #e1dfdd;
  border-radius: 6px;
  font-size: 0.875rem;
}

.view-all {
  color: #0078d4;
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
}

.view-all:hover {
  text-decoration: underline;
}

.card-content {
  padding: 1.5rem;
}

.chart-placeholder {
  text-align: center;
  padding: 3rem 1rem;
  color: #8a8886;
}

.chart-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 1rem;
  opacity: 0.5;
}

.popular-items,
.recent-orders {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.popular-item,
.order-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  border-radius: 8px;
  background: #f8f9fa;
}

.item-icon {
  font-size: 1.5rem;
  width: 32px;
  text-align: center;
}

.item-info {
  flex: 1;
}

.item-name,
.order-id {
  font-weight: 500;
  color: #323130;
  margin-bottom: 0.25rem;
}

.item-stats,
.order-user {
  font-size: 0.875rem;
  color: #605e5c;
}

.trend-icon {
  width: 16px;
  height: 16px;
  color: #16a34a;
}

.order-amount {
  font-weight: 600;
  color: #323130;
}

.order-status {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.order-status.paid {
  background: #f0fdf4;
  color: #16a34a;
}

.order-status.pending {
  background: #fff7ed;
  color: #ea580c;
}

.system-status {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-indicator.online {
  background: #16a34a;
}

.status-info {
  flex: 1;
}

.status-label {
  font-weight: 500;
  color: #323130;
  margin-bottom: 0.25rem;
}

.status-value {
  font-size: 0.875rem;
  color: #605e5c;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .dashboard-grid {
    grid-template-columns: 1fr;
  }

  .stat-card {
    flex-direction: column;
    text-align: center;
  }
}
</style>
