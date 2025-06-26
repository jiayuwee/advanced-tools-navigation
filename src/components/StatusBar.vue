<template>
  <div class="status-bar">
    <div class="status-content">
      <!-- 左侧状态信息 -->
      <div class="status-left">
        <div class="status-item">
          <DatabaseIcon class="status-icon" />
          <span class="status-text">{{ connectionStatus }}</span>
          <div :class="['status-indicator', connectionClass]"></div>
        </div>
        <div class="status-item">
          <UsersIcon class="status-icon" />
          <span class="status-text">{{ onlineUsers }} 在线</span>
        </div>
        <div class="status-item">
          <ToolIcon class="status-icon" />
          <span class="status-text">{{ totalTools }} 工具</span>
        </div>
      </div>

      <!-- 中间信息 -->
      <div class="status-center">
        <div class="status-item">
          <ClockIcon class="status-icon" />
          <span class="status-text">{{ currentTime }}</span>
        </div>
      </div>

      <!-- 右侧操作 -->
      <div class="status-right">
        <div class="status-item">
          <WifiIcon class="status-icon" />
          <span class="status-text">{{ networkStatus }}</span>
        </div>
        <div class="status-item version">
          <span class="status-text">v{{ version }}</span>
        </div>
        <button class="status-btn" @click="toggleFullscreen" title="全屏切换">
          <MaximizeIcon v-if="!isFullscreen" class="status-icon" />
          <MinimizeIcon v-else class="status-icon" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import {
  DatabaseIcon,
  UsersIcon,
  ToolIcon,
  ClockIcon,
  WifiIcon,
  MaximizeIcon,
  MinimizeIcon,
} from "lucide-vue-next";

// 响应式状态
const currentTime = ref("");
const connectionStatus = ref("已连接");
const connectionClass = ref("connected");
const onlineUsers = ref(128);
const totalTools = ref(1000);
const networkStatus = ref("在线");
const isFullscreen = ref(false);
const version = ref("1.0.0");

let timeInterval: NodeJS.Timeout | null = null;

// 更新时间
const updateTime = () => {
  const now = new Date();
  currentTime.value = now.toLocaleTimeString("zh-CN", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

// 检查连接状态
const checkConnection = () => {
  if (navigator.onLine) {
    connectionStatus.value = "已连接";
    connectionClass.value = "connected";
    networkStatus.value = "在线";
  } else {
    connectionStatus.value = "离线";
    connectionClass.value = "disconnected";
    networkStatus.value = "离线";
  }
};

// 全屏切换
const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
    isFullscreen.value = true;
  } else {
    document.exitFullscreen();
    isFullscreen.value = false;
  }
};

// 监听全屏状态变化
const handleFullscreenChange = () => {
  isFullscreen.value = !!document.fullscreenElement;
};

// 监听网络状态变化
const handleOnline = () => {
  checkConnection();
};

const handleOffline = () => {
  checkConnection();
};

// 生命周期
onMounted(() => {
  updateTime();
  checkConnection();

  // 设置定时器更新时间
  timeInterval = setInterval(updateTime, 1000);

  // 监听事件
  window.addEventListener("online", handleOnline);
  window.addEventListener("offline", handleOffline);
  document.addEventListener("fullscreenchange", handleFullscreenChange);

  // 模拟动态数据更新
  setInterval(() => {
    onlineUsers.value = Math.floor(Math.random() * 50) + 100;
  }, 30000); // 每30秒更新一次在线用户数
});

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval);
  }

  window.removeEventListener("online", handleOnline);
  window.removeEventListener("offline", handleOffline);
  document.removeEventListener("fullscreenchange", handleFullscreenChange);
});
</script>

<style scoped>
.status-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  height: 32px;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  z-index: 9999; /* 提高 z-index 确保在最顶层 */
  font-size: 12px;
  color: rgba(255, 255, 255, 0.9);
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.3);
}

.status-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 0 16px;
  max-width: 1400px;
  margin: 0 auto;
}

.status-left,
.status-center,
.status-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 4px;
  position: relative;
}

.status-icon {
  width: 14px;
  height: 14px;
  opacity: 0.8;
}

.status-text {
  font-size: 11px;
  font-weight: 400;
  white-space: nowrap;
}

.status-indicator {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  margin-left: 4px;
}

.status-indicator.connected {
  background: #4caf50;
  box-shadow: 0 0 4px rgba(76, 175, 80, 0.5);
}

.status-indicator.disconnected {
  background: #f44336;
  box-shadow: 0 0 4px rgba(244, 67, 54, 0.5);
}

.status-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: transparent;
  border: none;
  border-radius: 4px;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all 0.2s ease;
}

.status-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.version {
  padding: 2px 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  font-family: "Courier New", monospace;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .status-content {
    padding: 0 12px;
    gap: 12px;
  }

  .status-left,
  .status-center,
  .status-right {
    gap: 8px;
  }

  .status-center {
    display: none; /* 在小屏幕上隐藏中间部分 */
  }

  .status-text {
    font-size: 10px;
  }
}

@media (max-width: 480px) {
  .status-left .status-item:nth-child(n + 3) {
    display: none; /* 在很小的屏幕上只显示前两个状态项 */
  }

  .status-right .status-item:first-child {
    display: none; /* 隐藏网络状态 */
  }
}
</style>
