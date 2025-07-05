<template>
  <div class="local-management-view">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">本地管理</h1>
      <div class="header-actions">
        <button
          class="btn btn-primary"
          :disabled="loading"
          @click="refreshData"
        >
          <RefreshCwIcon :class="{ 'animate-spin': loading }" />
          刷新数据
        </button>
      </div>
    </div>

    <!-- 功能卡片网格 -->
    <div class="management-grid">
      <!-- 缓存管理 -->
      <div class="management-card">
        <div class="card-header">
          <DatabaseIcon class="card-icon" />
          <h3>缓存管理</h3>
        </div>
        <div class="card-content">
          <p class="card-description">管理应用程序缓存和临时数据</p>
          <div class="card-stats">
            <div class="stat-item">
              <span class="stat-label">缓存大小:</span>
              <span class="stat-value">{{ cacheStats.size }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">缓存项数:</span>
              <span class="stat-value">{{ cacheStats.count }}</span>
            </div>
          </div>
          <div class="card-actions">
            <button
              class="btn btn-outline"
              :disabled="loading"
              @click="clearCache"
            >
              <TrashIcon />
              清理缓存
            </button>
            <button
              class="btn btn-outline"
              :disabled="loading"
              @click="refreshCache"
            >
              <RefreshCwIcon />
              刷新缓存
            </button>
          </div>
        </div>
      </div>

      <!-- 本地存储管理 -->
      <div class="management-card">
        <div class="card-header">
          <HardDriveIcon class="card-icon" />
          <h3>本地存储</h3>
        </div>
        <div class="card-content">
          <p class="card-description">管理浏览器本地存储数据</p>
          <div class="card-stats">
            <div class="stat-item">
              <span class="stat-label">存储使用:</span>
              <span class="stat-value">{{ storageStats.used }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">可用空间:</span>
              <span class="stat-value">{{ storageStats.available }}</span>
            </div>
          </div>
          <div class="card-actions">
            <button class="btn btn-outline" @click="viewStorageData">
              <EyeIcon />
              查看数据
            </button>
            <button
              class="btn btn-outline"
              :disabled="loading"
              @click="clearStorage"
            >
              <TrashIcon />
              清理存储
            </button>
          </div>
        </div>
      </div>

      <!-- 日志管理 -->
      <div class="management-card">
        <div class="card-header">
          <FileTextIcon class="card-icon" />
          <h3>日志管理</h3>
        </div>
        <div class="card-content">
          <p class="card-description">查看和管理应用程序日志</p>
          <div class="card-stats">
            <div class="stat-item">
              <span class="stat-label">日志条数:</span>
              <span class="stat-value">{{ logStats.count }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">错误数:</span>
              <span class="stat-value text-red-600">{{ logStats.errors }}</span>
            </div>
          </div>
          <div class="card-actions">
            <button class="btn btn-outline" @click="viewLogs">
              <EyeIcon />
              查看日志
            </button>
            <button
              class="btn btn-outline"
              :disabled="loading"
              @click="exportLogs"
            >
              <DownloadIcon />
              导出日志
            </button>
          </div>
        </div>
      </div>

      <!-- 性能监控 -->
      <div class="management-card">
        <div class="card-header">
          <ActivityIcon class="card-icon" />
          <h3>性能监控</h3>
        </div>
        <div class="card-content">
          <p class="card-description">监控应用程序性能指标</p>
          <div class="card-stats">
            <div class="stat-item">
              <span class="stat-label">内存使用:</span>
              <span class="stat-value">{{ performanceStats.memory }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">页面加载:</span>
              <span class="stat-value">{{ performanceStats.loadTime }}</span>
            </div>
          </div>
          <div class="card-actions">
            <button
              class="btn btn-outline"
              :disabled="loading"
              @click="runPerformanceTest"
            >
              <PlayIcon />
              性能测试
            </button>
            <button class="btn btn-outline" @click="viewPerformanceReport">
              <BarChartIcon />
              性能报告
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 系统信息 -->
    <div class="system-info-section">
      <h2 class="section-title">系统信息</h2>
      <div class="info-grid">
        <div class="info-item">
          <span class="info-label">浏览器:</span>
          <span class="info-value">{{ systemInfo.browser }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">操作系统:</span>
          <span class="info-value">{{ systemInfo.os }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">屏幕分辨率:</span>
          <span class="info-value">{{ systemInfo.screen }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">时区:</span>
          <span class="info-value">{{ systemInfo.timezone }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">语言:</span>
          <span class="info-value">{{ systemInfo.language }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">在线状态:</span>
          <span
            class="info-value"
            :class="systemInfo.online ? 'text-green-600' : 'text-red-600'"
          >
            {{ systemInfo.online ? "在线" : "离线" }}
          </span>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner">
        <Loader2Icon class="animate-spin" />
        <span>处理中...</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import {
  RefreshCwIcon,
  DatabaseIcon,
  HardDriveIcon,
  FileTextIcon,
  ActivityIcon,
  TrashIcon,
  EyeIcon,
  DownloadIcon,
  PlayIcon,
  BarChartIcon,
  Loader2Icon,
} from "lucide-vue-next";

// 响应式数据
const loading = ref(false);

// 缓存统计
const cacheStats = reactive({
  size: "0 MB",
  count: 0,
});

// 存储统计
const storageStats = reactive({
  used: "0 MB",
  available: "0 MB",
});

// 日志统计
const logStats = reactive({
  count: 0,
  errors: 0,
});

// 性能统计
const performanceStats = reactive({
  memory: "0 MB",
  loadTime: "0 ms",
});

// 系统信息
const systemInfo = reactive({
  browser: "",
  os: "",
  screen: "",
  timezone: "",
  language: "",
  online: true,
});

// 方法
const refreshData = async () => {
  loading.value = true;
  try {
    await Promise.all([
      loadCacheStats(),
      loadStorageStats(),
      loadLogStats(),
      loadPerformanceStats(),
      loadSystemInfo(),
    ]);
  } catch (error) {
    console.error("刷新数据失败:", error);
  } finally {
    loading.value = false;
  }
};

const loadCacheStats = async () => {
  // 模拟缓存统计数据
  cacheStats.size = "2.5 MB";
  cacheStats.count = 156;
};

const loadStorageStats = async () => {
  try {
    if ("storage" in navigator && "estimate" in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      const used = estimate.usage || 0;
      const quota = estimate.quota || 0;

      storageStats.used = formatBytes(used);
      storageStats.available = formatBytes(quota - used);
    } else {
      storageStats.used = "未知";
      storageStats.available = "未知";
    }
  } catch (error) {
    console.error("获取存储统计失败:", error);
    storageStats.used = "获取失败";
    storageStats.available = "获取失败";
  }
};

const loadLogStats = async () => {
  // 模拟日志统计
  logStats.count = 1234;
  logStats.errors = 5;
};

const loadPerformanceStats = async () => {
  try {
    if ("memory" in performance) {
      const memory = (performance as any).memory;
      performanceStats.memory = formatBytes(memory.usedJSHeapSize);
    } else {
      performanceStats.memory = "未知";
    }

    const navigation = performance.getEntriesByType(
      "navigation",
    )[0] as PerformanceNavigationTiming;
    if (navigation) {
      const loadTime = navigation.loadEventEnd - navigation.navigationStart;
      performanceStats.loadTime = `${Math.round(loadTime)} ms`;
    }
  } catch (error) {
    console.error("获取性能统计失败:", error);
  }
};

const loadSystemInfo = () => {
  systemInfo.browser = getBrowserInfo();
  systemInfo.os = getOSInfo();
  systemInfo.screen = `${screen.width}x${screen.height}`;
  systemInfo.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  systemInfo.language = navigator.language;
  systemInfo.online = navigator.onLine;
};

// 工具函数
const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const getBrowserInfo = (): string => {
  const ua = navigator.userAgent;
  if (ua.includes("Chrome")) return "Chrome";
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Safari")) return "Safari";
  if (ua.includes("Edge")) return "Edge";
  return "未知";
};

const getOSInfo = (): string => {
  const ua = navigator.userAgent;
  if (ua.includes("Windows")) return "Windows";
  if (ua.includes("Mac")) return "macOS";
  if (ua.includes("Linux")) return "Linux";
  if (ua.includes("Android")) return "Android";
  if (ua.includes("iOS")) return "iOS";
  return "未知";
};

// 操作方法
const clearCache = async () => {
  if (!confirm("确定要清理所有缓存吗？")) return;

  loading.value = true;
  try {
    // 清理各种缓存
    if ("caches" in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((name) => caches.delete(name)));
    }

    // 重新加载统计
    await loadCacheStats();
    alert("缓存清理完成");
  } catch (error) {
    console.error("清理缓存失败:", error);
    alert("清理缓存失败");
  } finally {
    loading.value = false;
  }
};

const refreshCache = async () => {
  loading.value = true;
  try {
    // 刷新页面缓存
    window.location.reload();
  } catch (error) {
    console.error("刷新缓存失败:", error);
  } finally {
    loading.value = false;
  }
};

const clearStorage = async () => {
  if (!confirm("确定要清理本地存储吗？这将清除所有保存的数据！")) return;

  loading.value = true;
  try {
    localStorage.clear();
    sessionStorage.clear();

    await loadStorageStats();
    alert("本地存储清理完成");
  } catch (error) {
    console.error("清理存储失败:", error);
    alert("清理存储失败");
  } finally {
    loading.value = false;
  }
};

const viewStorageData = () => {
  const data = {
    localStorage: { ...localStorage },
    sessionStorage: { ...sessionStorage },
  };
  console.log("本地存储数据:", data);
  alert("存储数据已输出到控制台");
};

const viewLogs = () => {
  console.log("查看应用程序日志");
  alert("日志数据已输出到控制台");
};

const exportLogs = () => {
  const logs = JSON.stringify(
    {
      timestamp: new Date().toISOString(),
      logs: "模拟日志数据",
    },
    null,
    2,
  );

  const blob = new Blob([logs], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `logs_${new Date().toISOString().split("T")[0]}.json`;
  link.click();
  URL.revokeObjectURL(url);
};

const runPerformanceTest = async () => {
  loading.value = true;
  try {
    // 模拟性能测试
    await new Promise((resolve) => setTimeout(resolve, 2000));
    await loadPerformanceStats();
    alert("性能测试完成");
  } catch (error) {
    console.error("性能测试失败:", error);
  } finally {
    loading.value = false;
  }
};

const viewPerformanceReport = () => {
  console.log("性能报告:", performanceStats);
  alert("性能报告已输出到控制台");
};

// 生命周期
onMounted(() => {
  refreshData();

  // 监听在线状态变化
  window.addEventListener("online", () => {
    systemInfo.online = true;
  });

  window.addEventListener("offline", () => {
    systemInfo.online = false;
  });
});
</script>

<style scoped>
.local-management-view {
  padding: 2rem;
  background: #f8f9fa;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e9ecef;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 1rem;
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

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: #3498db;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2980b9;
}

.btn-outline {
  background: white;
  color: #3498db;
  border: 1px solid #3498db;
}

.btn-outline:hover:not(:disabled) {
  background: #3498db;
  color: white;
}

.management-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.management-card {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.management-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.card-icon {
  width: 2rem;
  height: 2rem;
  color: #3498db;
}

.card-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.card-description {
  color: #6c757d;
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.card-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: #6c757d;
  font-weight: 500;
}

.stat-value {
  font-size: 1.125rem;
  font-weight: 600;
  color: #2c3e50;
}

.card-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.card-actions .btn {
  flex: 1;
  min-width: 120px;
  justify-content: center;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.system-info-section {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 1.5rem 0;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 0.5rem;
}

.info-label {
  font-weight: 500;
  color: #6c757d;
}

.info-value {
  font-weight: 600;
  color: #2c3e50;
}

.loading-overlay {
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

.loading-spinner {
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
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

.text-red-600 {
  color: #dc3545;
}

.text-green-600 {
  color: #28a745;
}

@media (max-width: 768px) {
  .local-management-view {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .management-grid {
    grid-template-columns: 1fr;
  }

  .card-stats {
    grid-template-columns: 1fr;
  }

  .card-actions {
    flex-direction: column;
  }

  .card-actions .btn {
    flex: none;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .info-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
}
</style>
