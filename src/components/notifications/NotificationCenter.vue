<template>
  <div class="notification-center">
    <!-- 通知按钮 -->
    <div class="notification-trigger" @click="togglePanel">
      <button
        class="notification-button"
        :class="{ 'has-unread': stats.unread > 0 }"
      >
        <BellIcon class="icon" />
        <span v-if="stats.unread > 0" class="notification-badge">
          {{ stats.unread > 99 ? "99+" : stats.unread }}
        </span>
      </button>
    </div>

    <!-- 通知面板 -->
    <div v-if="showPanel" class="notification-panel" @click.stop>
      <div class="panel-header">
        <h3 class="panel-title">通知中心</h3>
        <div class="panel-actions">
          <button
            v-if="stats.unread > 0"
            class="mark-all-read-button"
            :disabled="markingAllRead"
            @click="markAllAsRead"
          >
            {{ markingAllRead ? "标记中..." : "全部已读" }}
          </button>
          <button class="settings-button" @click="showSettings = true">
            <SettingsIcon class="icon" />
          </button>
          <button class="close-button" @click="closePanel">
            <XIcon class="icon" />
          </button>
        </div>
      </div>

      <!-- 通知筛选 -->
      <div class="notification-filters">
        <button
          v-for="filter in filters"
          :key="filter.key"
          class="filter-button"
          :class="{ active: activeFilter === filter.key }"
          @click="activeFilter = filter.key"
        >
          {{ filter.label }}
          <span v-if="filter.count > 0" class="filter-count">{{
            filter.count
          }}</span>
        </button>
      </div>

      <!-- 通知列表 -->
      <div class="notification-list">
        <div v-if="loading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>加载通知中...</p>
        </div>

        <div v-else-if="filteredNotifications.length === 0" class="empty-state">
          <div class="empty-icon">🔔</div>
          <h4>暂无通知</h4>
          <p>{{ getEmptyMessage() }}</p>
        </div>

        <div v-else class="notifications">
          <NotificationItem
            v-for="notification in filteredNotifications"
            :key="notification.id"
            :notification="notification"
            @read="handleNotificationRead"
            @delete="handleNotificationDelete"
            @action="handleNotificationAction"
          />

          <!-- 加载更多 -->
          <div v-if="hasMore" class="load-more">
            <button
              :disabled="loadingMore"
              class="load-more-button"
              @click="loadMore"
            >
              {{ loadingMore ? "加载中..." : "加载更多" }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 设置模态框 -->
    <NotificationSettings
      v-if="showSettings"
      @close="showSettings = false"
      @updated="handleSettingsUpdated"
    />

    <!-- 点击外部关闭面板 -->
    <div v-if="showPanel" class="panel-overlay" @click="closePanel"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useAuthStore } from "@/stores/auth";
import { notificationService } from "@/services/notificationService";
import { BellIcon, SettingsIcon, XIcon } from "lucide-vue-next";
import NotificationItem from "./NotificationItem.vue";
import NotificationSettings from "./NotificationSettings.vue";
import type {
  Notification,
  NotificationStats,
} from "@/services/notificationService";

const authStore = useAuthStore();

// 状态
const showPanel = ref(false);
const showSettings = ref(false);
const loading = ref(false);
const loadingMore = ref(false);
const markingAllRead = ref(false);

const notifications = ref<Notification[]>([]);
const stats = ref<NotificationStats>({
  total: 0,
  unread: 0,
  important: 0,
  by_type: {},
});

const currentPage = ref(1);
const hasMore = ref(false);
const activeFilter = ref("all");

// 实时订阅
let unsubscribe: (() => void) | null = null;

// 筛选器配置
const filters = computed(() => [
  { key: "all", label: "全部", count: stats.value.total },
  { key: "unread", label: "未读", count: stats.value.unread },
  { key: "important", label: "重要", count: stats.value.important },
  { key: "system", label: "系统", count: stats.value.by_type.system || 0 },
  { key: "product", label: "产品", count: stats.value.by_type.product || 0 },
  { key: "order", label: "订单", count: stats.value.by_type.order || 0 },
]);

// 过滤后的通知
const filteredNotifications = computed(() => {
  switch (activeFilter.value) {
    case "unread":
      return notifications.value.filter((n) => !n.is_read);
    case "important":
      return notifications.value.filter((n) => n.is_important);
    case "system":
    case "product":
    case "order":
      return notifications.value.filter((n) => n.type === activeFilter.value);
    default:
      return notifications.value;
  }
});

// 方法
const togglePanel = () => {
  showPanel.value = !showPanel.value;
  if (showPanel.value && notifications.value.length === 0) {
    loadNotifications();
  }
};

const closePanel = () => {
  showPanel.value = false;
};

const loadNotifications = async (reset = true) => {
  if (!authStore.user) return;

  try {
    if (reset) {
      loading.value = true;
      currentPage.value = 1;
      notifications.value = [];
    } else {
      loadingMore.value = true;
    }

    const options: Record<string, unknown> = {
      page: currentPage.value,
      limit: 20,
    };

    // 应用筛选器
    if (activeFilter.value === "unread") {
      options.unread_only = true;
    } else if (activeFilter.value === "important") {
      options.important_only = true;
    } else if (["system", "product", "order"].includes(activeFilter.value)) {
      options.type = activeFilter.value;
    }

    const result = await notificationService.getUserNotifications(
      authStore.user.id,
      options,
    );

    if (reset) {
      notifications.value = result.notifications;
    } else {
      notifications.value.push(...result.notifications);
    }

    stats.value = result.stats;
    hasMore.value = notifications.value.length < result.total;
  } catch (error) {
    console.error("加载通知失败:", error);
  } finally {
    loading.value = false;
    loadingMore.value = false;
  }
};

const loadMore = async () => {
  if (hasMore.value && !loadingMore.value) {
    currentPage.value++;
    await loadNotifications(false);
  }
};

const markAllAsRead = async () => {
  if (!authStore.user || markingAllRead.value) return;

  try {
    markingAllRead.value = true;

    const type = ["system", "product", "order"].includes(activeFilter.value)
      ? activeFilter.value
      : undefined;

    await notificationService.markAllAsRead(authStore.user.id, type);

    // 更新本地状态
    notifications.value.forEach((notification) => {
      if (!type || notification.type === type) {
        notification.is_read = true;
      }
    });

    // 重新加载统计
    await loadNotifications();
  } catch (error) {
    console.error("标记全部已读失败:", error);
  } finally {
    markingAllRead.value = false;
  }
};

const handleNotificationRead = async (notificationId: string) => {
  if (!authStore.user) return;

  try {
    await notificationService.markAsRead(notificationId, authStore.user.id);

    // 更新本地状态
    const notification = notifications.value.find(
      (n) => n.id === notificationId,
    );
    if (notification) {
      notification.is_read = true;
      stats.value.unread = Math.max(0, stats.value.unread - 1);
    }
  } catch (error) {
    console.error("标记已读失败:", error);
  }
};

const handleNotificationDelete = async (notificationId: string) => {
  if (!authStore.user) return;

  try {
    await notificationService.deleteNotification(
      notificationId,
      authStore.user.id,
    );

    // 更新本地状态
    const index = notifications.value.findIndex((n) => n.id === notificationId);
    if (index !== -1) {
      const notification = notifications.value[index];
      notifications.value.splice(index, 1);

      stats.value.total--;
      if (!notification.is_read) {
        stats.value.unread--;
      }
      if (notification.is_important) {
        stats.value.important--;
      }

      const typeCount = stats.value.by_type[notification.type] || 0;
      stats.value.by_type[notification.type] = Math.max(0, typeCount - 1);
    }
  } catch (error) {
    console.error("删除通知失败:", error);
  }
};

const handleNotificationAction = (notification: Notification) => {
  if (notification.action_url) {
    // 导航到指定页面
    window.open(notification.action_url, "_blank");
  }

  // 标记为已读
  if (!notification.is_read) {
    handleNotificationRead(notification.id);
  }
};

const handleSettingsUpdated = () => {
  showSettings.value = false;
  // 可以在这里重新加载通知或更新相关状态
};

const getEmptyMessage = (): string => {
  switch (activeFilter.value) {
    case "unread":
      return "所有通知都已阅读";
    case "important":
      return "暂无重要通知";
    case "system":
      return "暂无系统通知";
    case "product":
      return "暂无产品通知";
    case "order":
      return "暂无订单通知";
    default:
      return "您还没有收到任何通知";
  }
};

const setupRealtimeSubscription = () => {
  if (!authStore.user) return;

  unsubscribe = notificationService.subscribeToNotifications(
    authStore.user.id,
    (notification) => {
      // 添加新通知到列表顶部
      notifications.value.unshift(notification);

      // 更新统计
      stats.value.total++;
      stats.value.unread++;
      if (notification.is_important) {
        stats.value.important++;
      }

      const typeCount = stats.value.by_type[notification.type] || 0;
      stats.value.by_type[notification.type] = typeCount + 1;

      // 显示浏览器通知
      notificationService.showBrowserNotification(notification.title, {
        body: notification.message,
        tag: notification.id,
        requireInteraction: notification.is_important,
      });
    },
  );
};

// 生命周期
onMounted(() => {
  setupRealtimeSubscription();

  // 初始加载统计信息
  if (authStore.user) {
    notificationService
      .getNotificationStats(authStore.user.id)
      .then((initialStats) => {
        stats.value = initialStats;
      })
      .catch((error) => {
        console.error("加载通知统计失败:", error);
      });
  }
});

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe();
  }
});

// 监听筛选器变化
watch(activeFilter, () => {
  loadNotifications();
});

// 监听用户变化
watch(
  () => authStore.user,
  (newUser) => {
    if (newUser) {
      setupRealtimeSubscription();
      if (showPanel.value) {
        loadNotifications();
      }
    } else {
      if (unsubscribe) {
        unsubscribe();
        unsubscribe = null;
      }
      notifications.value = [];
      stats.value = {
        total: 0,
        unread: 0,
        important: 0,
        by_type: {},
      };
    }
  },
);
</script>

<style scoped>
.notification-center {
  position: relative;
}

.notification-trigger {
  position: relative;
}

.notification-button {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  background: transparent;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
}

.notification-button:hover {
  background: rgba(0, 0, 0, 0.05);
}

.notification-button.has-unread {
  color: #3b82f6;
}

.notification-button .icon {
  width: 1.25rem;
  height: 1.25rem;
}

.notification-badge {
  position: absolute;
  top: -0.25rem;
  right: -0.25rem;
  min-width: 1.25rem;
  height: 1.25rem;
  background: #ef4444;
  color: white;
  border-radius: 0.625rem;
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 0.25rem;
  border: 2px solid white;
}

.notification-panel {
  position: absolute;
  top: 100%;
  right: 0;
  width: 400px;
  max-height: 600px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  border: 1px solid #e5e7eb;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  margin-top: 0.5rem;
}

.panel-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #f3f4f6;
}

.panel-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.panel-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.mark-all-read-button {
  padding: 0.25rem 0.75rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.mark-all-read-button:hover:not(:disabled) {
  background: #2563eb;
}

.mark-all-read-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.settings-button,
.close-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
}

.settings-button:hover,
.close-button:hover {
  background: #f3f4f6;
  color: #374151;
}

.settings-button .icon,
.close-button .icon {
  width: 1rem;
  height: 1rem;
}

.notification-filters {
  display: flex;
  gap: 0.25rem;
  padding: 0.75rem 1.5rem;
  border-bottom: 1px solid #f3f4f6;
  overflow-x: auto;
}

.filter-button {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.75rem;
  background: transparent;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  font-size: 0.75rem;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.filter-button:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

.filter-button.active {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
}

.filter-count {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 0.125rem 0.375rem;
  font-size: 0.625rem;
  font-weight: 600;
}

.filter-button.active .filter-count {
  background: rgba(255, 255, 255, 0.3);
}

.notification-list {
  flex: 1;
  overflow-y: auto;
  max-height: 400px;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1.5rem;
  text-align: center;
}

.loading-spinner {
  width: 1.5rem;
  height: 1.5rem;
  border: 2px solid #f3f4f6;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.empty-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.5rem 0;
}

.empty-state p {
  color: #6b7280;
  font-size: 0.875rem;
  margin: 0;
}

.notifications {
  padding: 0.5rem 0;
}

.load-more {
  padding: 1rem 1.5rem;
  text-align: center;
  border-top: 1px solid #f3f4f6;
}

.load-more-button {
  padding: 0.5rem 1rem;
  background: transparent;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
}

.load-more-button:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #d1d5db;
}

.load-more-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 480px) {
  .notification-panel {
    width: 320px;
    max-width: calc(100vw - 2rem);
  }

  .panel-header {
    padding: 0.75rem 1rem;
  }

  .notification-filters {
    padding: 0.5rem 1rem;
  }
}
</style>
