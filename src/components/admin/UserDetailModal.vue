<template>
  <div v-if="isVisible" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <!-- 模态框头部 -->
      <div class="modal-header">
        <h2 class="modal-title">用户详情</h2>
        <button @click="closeModal" class="close-button">
          <XIcon />
        </button>
      </div>

      <!-- 模态框内容 -->
      <div class="modal-body">
        <div v-if="user" class="user-details">
          <!-- 用户基本信息 -->
          <div class="info-section">
            <h3 class="section-title">基本信息</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">用户ID:</span>
                <span class="info-value">{{ user.id }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">用户名:</span>
                <span class="info-value">{{ user.username || "未设置" }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">邮箱:</span>
                <span class="info-value">{{ user.email }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">角色:</span>
                <span class="info-value" :class="getRoleClass(user.role)">
                  {{ getRoleText(user.role) }}
                </span>
              </div>
              <div class="info-item">
                <span class="info-label">状态:</span>
                <span class="info-value" :class="getStatusClass(user.status)">
                  {{ getStatusText(user.status) }}
                </span>
              </div>
              <div class="info-item">
                <span class="info-label">注册时间:</span>
                <span class="info-value">{{
                  formatDate(user.created_at)
                }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">最后登录:</span>
                <span class="info-value">{{
                  formatDate(user.last_sign_in_at)
                }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">邮箱验证:</span>
                <span
                  class="info-value"
                  :class="
                    user.email_confirmed_at ? 'text-green-600' : 'text-red-600'
                  "
                >
                  {{ user.email_confirmed_at ? "已验证" : "未验证" }}
                </span>
              </div>
            </div>
          </div>

          <!-- 用户资料信息 -->
          <div class="info-section" v-if="user.user_profiles">
            <h3 class="section-title">个人资料</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">显示名称:</span>
                <span class="info-value">{{
                  user.user_profiles.display_name || "未设置"
                }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">头像:</span>
                <div class="avatar-container">
                  <img
                    v-if="user.user_profiles.avatar_url"
                    :src="user.user_profiles.avatar_url"
                    :alt="user.user_profiles.display_name || user.username"
                    class="user-avatar"
                  />
                  <div v-else class="avatar-placeholder">
                    <UserIcon />
                  </div>
                </div>
              </div>
              <div class="info-item">
                <span class="info-label">个人简介:</span>
                <span class="info-value">{{
                  user.user_profiles.bio || "未设置"
                }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">网站:</span>
                <span class="info-value">
                  <a
                    v-if="user.user_profiles.website"
                    :href="user.user_profiles.website"
                    target="_blank"
                    class="link"
                  >
                    {{ user.user_profiles.website }}
                  </a>
                  <span v-else>未设置</span>
                </span>
              </div>
              <div class="info-item">
                <span class="info-label">位置:</span>
                <span class="info-value">{{
                  user.user_profiles.location || "未设置"
                }}</span>
              </div>
            </div>
          </div>

          <!-- 统计信息 -->
          <div class="info-section">
            <h3 class="section-title">活动统计</h3>
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-icon">
                  <HeartIcon />
                </div>
                <div class="stat-content">
                  <div class="stat-value">{{ userStats.favorites || 0 }}</div>
                  <div class="stat-label">收藏工具</div>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon">
                  <ShoppingCartIcon />
                </div>
                <div class="stat-content">
                  <div class="stat-value">{{ userStats.orders || 0 }}</div>
                  <div class="stat-label">订单数量</div>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon">
                  <DollarSignIcon />
                </div>
                <div class="stat-content">
                  <div class="stat-value">¥{{ userStats.totalSpent || 0 }}</div>
                  <div class="stat-label">总消费</div>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon">
                  <ActivityIcon />
                </div>
                <div class="stat-content">
                  <div class="stat-value">{{ userStats.loginCount || 0 }}</div>
                  <div class="stat-label">登录次数</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 操作历史 -->
          <div class="info-section">
            <h3 class="section-title">最近活动</h3>
            <div class="activity-list">
              <div v-if="userActivities.length === 0" class="no-activity">
                暂无活动记录
              </div>
              <div
                v-else
                v-for="activity in userActivities"
                :key="activity.id"
                class="activity-item"
              >
                <div class="activity-icon">
                  <component :is="getActivityIcon(activity.type)" />
                </div>
                <div class="activity-content">
                  <div class="activity-description">
                    {{ activity.description }}
                  </div>
                  <div class="activity-time">
                    {{ formatDate(activity.created_at) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="loading-state">
          <Loader2Icon class="animate-spin" />
          <span>加载用户信息中...</span>
        </div>
      </div>

      <!-- 模态框底部 -->
      <div class="modal-footer">
        <button @click="closeModal" class="btn btn-secondary">关闭</button>
        <button @click="editUser" class="btn btn-primary">
          <EditIcon />
          编辑用户
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from "vue";
import {
  XIcon,
  UserIcon,
  HeartIcon,
  ShoppingCartIcon,
  DollarSignIcon,
  ActivityIcon,
  EditIcon,
  Loader2Icon,
  LogInIcon,
  ShoppingBagIcon,
  StarIcon,
} from "lucide-vue-next";
import type { User } from "@/types";

// Props
interface Props {
  isVisible: boolean;
  user: User | null;
}

const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
  close: [];
  edit: [user: User];
}>();

// 响应式数据
const userStats = reactive({
  favorites: 0,
  orders: 0,
  totalSpent: 0,
  loginCount: 0,
});

const userActivities = ref<
  Array<{
    id: string;
    type: string;
    description: string;
    created_at: string;
  }>
>([]);

// 计算属性
const isLoading = computed(() => props.isVisible && !props.user);

// 监听用户变化
watch(
  () => props.user,
  (newUser) => {
    if (newUser) {
      loadUserStats(newUser.id);
      loadUserActivities(newUser.id);
    }
  },
  { immediate: true }
);

// 方法
const closeModal = () => {
  emit("close");
};

const editUser = () => {
  if (props.user) {
    emit("edit", props.user);
  }
};

const loadUserStats = async (userId: string) => {
  try {
    // 这里应该调用实际的API来获取用户统计信息
    // 暂时使用模拟数据
    userStats.favorites = Math.floor(Math.random() * 50);
    userStats.orders = Math.floor(Math.random() * 20);
    userStats.totalSpent = Math.floor(Math.random() * 10000);
    userStats.loginCount = Math.floor(Math.random() * 100);
  } catch (error) {
    console.error("加载用户统计失败:", error);
  }
};

const loadUserActivities = async (userId: string) => {
  try {
    // 这里应该调用实际的API来获取用户活动记录
    // 暂时使用模拟数据
    userActivities.value = [
      {
        id: "1",
        type: "login",
        description: "用户登录系统",
        created_at: new Date().toISOString(),
      },
      {
        id: "2",
        type: "order",
        description: "创建了新订单",
        created_at: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: "3",
        type: "favorite",
        description: "收藏了工具",
        created_at: new Date(Date.now() - 172800000).toISOString(),
      },
    ];
  } catch (error) {
    console.error("加载用户活动失败:", error);
  }
};

const formatDate = (dateString: string | null) => {
  if (!dateString) return "未知";
  return new Date(dateString).toLocaleString("zh-CN");
};

const getRoleText = (role: string) => {
  const roleMap: Record<string, string> = {
    admin: "管理员",
    user: "普通用户",
    vip: "VIP用户",
  };
  return roleMap[role] || role;
};

const getRoleClass = (role: string) => {
  const classMap: Record<string, string> = {
    admin: "text-red-600 font-semibold",
    vip: "text-purple-600 font-semibold",
    user: "text-blue-600",
  };
  return classMap[role] || "text-gray-600";
};

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    active: "活跃",
    inactive: "非活跃",
    banned: "已封禁",
    pending: "待激活",
  };
  return statusMap[status] || status;
};

const getStatusClass = (status: string) => {
  const classMap: Record<string, string> = {
    active: "text-green-600",
    inactive: "text-gray-600",
    banned: "text-red-600",
    pending: "text-yellow-600",
  };
  return classMap[status] || "text-gray-600";
};

const getActivityIcon = (type: string) => {
  const iconMap: Record<string, any> = {
    login: LogInIcon,
    order: ShoppingBagIcon,
    favorite: StarIcon,
    default: ActivityIcon,
  };
  return iconMap[type] || iconMap.default;
};
</script>

<style scoped>
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
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 1rem;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.close-button {
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  border-radius: 0.5rem;
  color: #6b7280;
  transition: all 0.2s;
}

.close-button:hover {
  background: #f3f4f6;
  color: #374151;
}

.modal-body {
  padding: 2rem;
  max-height: 60vh;
  overflow-y: auto;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.info-section {
  background: #f9fafb;
  border-radius: 0.75rem;
  padding: 1.5rem;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 1rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e5e7eb;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
}

.info-value {
  font-size: 1rem;
  font-weight: 500;
  color: #1f2937;
}

.avatar-container {
  display: flex;
  align-items: center;
}

.user-avatar {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e5e7eb;
}

.avatar-placeholder {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  border: 2px solid #e5e7eb;
}

.link {
  color: #3b82f6;
  text-decoration: none;
}

.link:hover {
  text-decoration: underline;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.stat-card {
  background: white;
  border-radius: 0.75rem;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border: 1px solid #e5e7eb;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.5rem;
  background: #eff6ff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3b82f6;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
}

.stat-label {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.no-activity {
  text-align: center;
  color: #6b7280;
  padding: 2rem;
  font-style: italic;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: white;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
}

.activity-icon {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: #f0f9ff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0ea5e9;
  flex-shrink: 0;
}

.activity-content {
  flex: 1;
}

.activity-description {
  font-size: 0.875rem;
  color: #1f2937;
  font-weight: 500;
}

.activity-time {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  gap: 1rem;
  color: #6b7280;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem 2rem;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
}

.text-red-600 {
  color: #dc2626;
}

.text-green-600 {
  color: #16a34a;
}

.text-blue-600 {
  color: #2563eb;
}

.text-purple-600 {
  color: #9333ea;
}

.text-gray-600 {
  color: #4b5563;
}

.text-yellow-600 {
  color: #ca8a04;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .modal-content {
    margin: 1rem;
    max-height: 95vh;
  }

  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 1rem;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .modal-footer {
    flex-direction: column;
  }

  .btn {
    justify-content: center;
  }
}
</style>
