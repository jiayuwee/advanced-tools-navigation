<template>
  <div class="user-management-view">
    <!-- 页面头部 -->
    <div class="page-header">
      <div>
        <h1>用户管理</h1>
        <p>管理系统用户，查看用户信息和活动状态</p>
      </div>
      <div class="header-actions">
        <button @click="refreshUsers" class="btn btn-secondary">
          <RefreshCwIcon class="icon" />
          刷新
        </button>
        <button @click="exportUsers" class="btn btn-primary">
          <DownloadIcon class="icon" />
          导出用户
        </button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">
          <UsersIcon />
        </div>
        <div class="stat-content">
          <h3>{{ stats.totalUsers }}</h3>
          <p>总用户数</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon active">
          <UserCheckIcon />
        </div>
        <div class="stat-content">
          <h3>{{ stats.activeUsers }}</h3>
          <p>活跃用户</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon admin">
          <ShieldIcon />
        </div>
        <div class="stat-content">
          <h3>{{ stats.adminUsers }}</h3>
          <p>管理员</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon new">
          <UserPlusIcon />
        </div>
        <div class="stat-content">
          <h3>{{ stats.newUsersThisMonth }}</h3>
          <p>本月新增</p>
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
          placeholder="搜索用户名、邮箱..."
          class="search-input"
        />
      </div>
      <div class="filter-controls">
        <select v-model="filters.role" class="filter-select">
          <option value="">所有角色</option>
          <option value="user">普通用户</option>
          <option value="admin">管理员</option>
          <option value="super_admin">超级管理员</option>
        </select>
        <select v-model="filters.status" class="filter-select">
          <option value="">所有状态</option>
          <option value="active">活跃</option>
          <option value="inactive">非活跃</option>
        </select>
        <select v-model="filters.sort" class="filter-select">
          <option value="created_at_desc">最新注册</option>
          <option value="created_at_asc">最早注册</option>
          <option value="last_login_desc">最近登录</option>
          <option value="name_asc">姓名 A-Z</option>
        </select>
      </div>
    </div>

    <!-- 用户列表 -->
    <div class="users-table-container">
      <div v-if="loading" class="loading-state">
        <Loader2Icon class="loading-icon" />
        <p>加载用户数据中...</p>
      </div>

      <table v-else class="users-table">
        <thead>
          <tr>
            <th>用户信息</th>
            <th>角色</th>
            <th>状态</th>
            <th>注册时间</th>
            <th>最后登录</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in paginatedUsers" :key="user.id" class="user-row">
            <td class="user-info">
              <div class="user-avatar">
                <img
                  v-if="user.avatar_url"
                  :src="user.avatar_url"
                  :alt="user.full_name || user.email"
                />
                <UserIcon v-else />
              </div>
              <div class="user-details">
                <h4>{{ user.full_name || "未设置姓名" }}</h4>
                <p>{{ user.email }}</p>
                <span v-if="user.username" class="username"
                  >@{{ user.username }}</span
                >
              </div>
            </td>
            <td>
              <span class="role-badge" :class="user.role">
                {{ getRoleText(user.role) }}
              </span>
            </td>
            <td>
              <span
                class="status-badge"
                :class="user.is_active ? 'active' : 'inactive'"
              >
                {{ user.is_active ? "活跃" : "非活跃" }}
              </span>
            </td>
            <td>{{ formatDate(user.created_at) }}</td>
            <td>
              {{
                user.last_login_at ? formatDate(user.last_login_at) : "从未登录"
              }}
            </td>
            <td class="actions">
              <button @click="viewUser(user)" class="action-btn view">
                <EyeIcon />
              </button>
              <button @click="editUser(user)" class="action-btn edit">
                <Edit />
              </button>
              <button
                v-if="user.role !== 'super_admin'"
                @click="toggleUserStatus(user)"
                class="action-btn"
                :class="user.is_active ? 'disable' : 'enable'"
              >
                <BanIcon v-if="user.is_active" />
                <CheckIcon v-else />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 分页 -->
    <div class="pagination">
      <button
        @click="currentPage--"
        :disabled="currentPage === 1"
        class="pagination-btn"
      >
        上一页
      </button>
      <span class="pagination-info">
        第 {{ currentPage }} 页，共 {{ totalPages }} 页
      </span>
      <button
        @click="currentPage++"
        :disabled="currentPage === totalPages"
        class="pagination-btn"
      >
        下一页
      </button>
    </div>

    <!-- 用户详情模态框 -->
    <UserDetailModal
      v-if="selectedUser"
      :user="selectedUser"
      @close="selectedUser = null"
      @updated="handleUserUpdated"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import {
  UsersIcon,
  UserCheckIcon,
  ShieldIcon,
  UserPlusIcon,
  SearchIcon,
  RefreshCwIcon,
  DownloadIcon,
  Loader2Icon,
  UserIcon,
  EyeIcon,
  Edit,
  BanIcon,
  CheckIcon,
} from "lucide-vue-next";
import UserDetailModal from "@/components/admin/UserDetailModal.vue";
import { UserService } from "@/services/userService";
import type { User } from "@/types";

// 响应式数据
const loading = ref(false);
const users = ref<User[]>([]);
const selectedUser = ref<User | null>(null);
const currentPage = ref(1);
const pageSize = ref(10);

// 筛选条件
const filters = reactive({
  search: "",
  role: "",
  status: "",
  sort: "created_at_desc",
});

// 统计数据
const stats = computed(() => {
  const total = users.value.length;
  const active = users.value.filter((u) => u.is_active).length;
  const admin = users.value.filter(
    (u) => u.role === "admin" || u.role === "super_admin"
  ).length;
  const thisMonth = users.value.filter((u) => {
    const created = new Date(u.created_at);
    const now = new Date();
    return (
      created.getMonth() === now.getMonth() &&
      created.getFullYear() === now.getFullYear()
    );
  }).length;

  return {
    totalUsers: total,
    activeUsers: active,
    adminUsers: admin,
    newUsersThisMonth: thisMonth,
  };
});

// 过滤后的用户
const filteredUsers = computed(() => {
  let result = [...users.value];

  // 搜索过滤
  if (filters.search) {
    const search = filters.search.toLowerCase();
    result = result.filter(
      (user) =>
        user.email.toLowerCase().includes(search) ||
        user.full_name?.toLowerCase().includes(search) ||
        user.username?.toLowerCase().includes(search)
    );
  }

  // 角色过滤
  if (filters.role) {
    result = result.filter((user) => user.role === filters.role);
  }

  // 状态过滤
  if (filters.status) {
    const isActive = filters.status === "active";
    result = result.filter((user) => user.is_active === isActive);
  }

  // 排序
  result.sort((a, b) => {
    switch (filters.sort) {
      case "created_at_desc":
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      case "created_at_asc":
        return (
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      case "last_login_desc":
        if (!a.last_login_at) return 1;
        if (!b.last_login_at) return -1;
        return (
          new Date(b.last_login_at).getTime() -
          new Date(a.last_login_at).getTime()
        );
      case "name_asc":
        return (a.full_name || a.email).localeCompare(b.full_name || b.email);
      default:
        return 0;
    }
  });

  return result;
});

// 分页数据
const totalPages = computed(() =>
  Math.ceil(filteredUsers.value.length / pageSize.value)
);
const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredUsers.value.slice(start, end);
});

// 方法
const loadUsers = async () => {
  try {
    loading.value = true;
    // TODO: 实现真实的用户数据加载
    // const result = await UserService.getAllUsers()
    // users.value = result

    // 模拟数据
    users.value = [
      {
        id: "1",
        email: "admin@example.com",
        full_name: "系统管理员",
        username: "admin",
        role: "super_admin",
        is_active: true,
        created_at: "2024-01-01T00:00:00Z",
        last_login_at: "2024-06-30T12:00:00Z",
      },
      {
        id: "2",
        email: "user@example.com",
        full_name: "普通用户",
        username: "user1",
        role: "user",
        is_active: true,
        created_at: "2024-06-01T00:00:00Z",
        last_login_at: "2024-06-29T10:00:00Z",
      },
    ];
  } catch (error) {
    console.error("加载用户数据失败:", error);
  } finally {
    loading.value = false;
  }
};

const refreshUsers = () => {
  loadUsers();
};

const exportUsers = () => {
  // TODO: 实现用户数据导出
  console.log("导出用户数据");
};

const viewUser = (user: User) => {
  selectedUser.value = user;
};

const editUser = (user: User) => {
  selectedUser.value = user;
};

const toggleUserStatus = async (user: User) => {
  try {
    // TODO: 实现用户状态切换
    user.is_active = !user.is_active;
    console.log(`用户 ${user.email} 状态已${user.is_active ? "激活" : "禁用"}`);
  } catch (error) {
    console.error("切换用户状态失败:", error);
  }
};

const handleUserUpdated = (updatedUser: User) => {
  const index = users.value.findIndex((u) => u.id === updatedUser.id);
  if (index !== -1) {
    users.value[index] = updatedUser;
  }
};

const getRoleText = (role: string) => {
  switch (role) {
    case "super_admin":
      return "超级管理员";
    case "admin":
      return "管理员";
    case "user":
      return "普通用户";
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

// 生命周期
onMounted(() => {
  loadUsers();
});
</script>

<style scoped>
.user-management-view {
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

.btn-primary:hover {
  background: #2563eb;
}

.btn-secondary {
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover {
  background: #f9fafb;
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

.stat-icon.active {
  background: #dcfce7;
  color: #16a34a;
}

.stat-icon.admin {
  background: #fef3c7;
  color: #d97706;
}

.stat-icon.new {
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

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
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

.users-table-container {
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

.users-table {
  width: 100%;
  border-collapse: collapse;
}

.users-table th {
  background: #f9fafb;
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
}

.user-row {
  border-bottom: 1px solid #f3f4f6;
}

.user-row:hover {
  background: #f9fafb;
}

.user-row td {
  padding: 1rem;
  vertical-align: middle;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  overflow: hidden;
  background: #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
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

.username {
  font-size: 0.75rem;
  color: #9ca3af;
}

.role-badge,
.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.role-badge.super_admin {
  background: #fef3c7;
  color: #d97706;
}

.role-badge.admin {
  background: #e0e7ff;
  color: #3730a3;
}

.role-badge.user {
  background: #f3f4f6;
  color: #374151;
}

.status-badge.active {
  background: #dcfce7;
  color: #16a34a;
}

.status-badge.inactive {
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

.action-btn.edit {
  background: #fef3c7;
  color: #d97706;
}

.action-btn.disable {
  background: #fee2e2;
  color: #dc2626;
}

.action-btn.enable {
  background: #dcfce7;
  color: #16a34a;
}

.action-btn:hover {
  transform: scale(1.05);
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
  transition: all 0.2s;
}

.pagination-btn:hover:not(:disabled) {
  background: #f9fafb;
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
