<template>
  <div class="simple-status-bar">
    <div class="simple-status-content">
      <span>🚀 工具导航站</span>
      <span>{{ currentTime }}</span>
      <span>状态栏测试</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

const currentTime = ref("");

const updateTime = () => {
  const now = new Date();
  currentTime.value = now.toLocaleTimeString("zh-CN", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

let timeInterval: NodeJS.Timeout | null = null;

onMounted(() => {
  updateTime();
  timeInterval = setInterval(updateTime, 1000);
});

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval);
  }
});
</script>

<style scoped>
.simple-status-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  height: 40px;
  background: #ff0000; /* 明显的红色背景便于调试 */
  color: white;
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.5);
  border-top: 2px solid #ffffff;
}

.simple-status-content {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 0 20px;
}
</style>
