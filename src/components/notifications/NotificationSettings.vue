<template>
  <div class="notification-settings-modal">
    <div class="modal-overlay" @click="$emit('close')"></div>
    <div class="modal-content">
      <div class="modal-header">
        <h2 class="modal-title">通知设置</h2>
        <button class="close-button" @click="$emit('close')">
          <XIcon class="icon" />
        </button>
      </div>

      <div class="modal-body">
        <div v-if="loading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>加载设置中...</p>
        </div>

        <div v-else class="settings-form">
          <!-- 通知类型设置 -->
          <div class="setting-section">
            <h3 class="section-title">通知类型</h3>
            <div class="setting-grid">
              <div class="setting-item">
                <label class="setting-label">
                  <input
                    v-model="preferences.email_notifications"
                    type="checkbox"
                    class="setting-checkbox"
                  />
                  <span class="checkbox-text">邮件通知</span>
                </label>
                <p class="setting-description">通过邮件接收重要通知</p>
              </div>

              <div class="setting-item">
                <label class="setting-label">
                  <input
                    v-model="preferences.push_notifications"
                    type="checkbox"
                    class="setting-checkbox"
                  />
                  <span class="checkbox-text">浏览器通知</span>
                </label>
                <p class="setting-description">在浏览器中显示桌面通知</p>
              </div>

              <div class="setting-item">
                <label class="setting-label">
                  <input
                    v-model="preferences.system_notifications"
                    type="checkbox"
                    class="setting-checkbox"
                  />
                  <span class="checkbox-text">系统通知</span>
                </label>
                <p class="setting-description">接收系统更新和维护通知</p>
              </div>

              <div class="setting-item">
                <label class="setting-label">
                  <input
                    v-model="preferences.product_notifications"
                    type="checkbox"
                    class="setting-checkbox"
                  />
                  <span class="checkbox-text">产品通知</span>
                </label>
                <p class="setting-description">接收新产品和更新通知</p>
              </div>

              <div class="setting-item">
                <label class="setting-label">
                  <input
                    v-model="preferences.order_notifications"
                    type="checkbox"
                    class="setting-checkbox"
                  />
                  <span class="checkbox-text">订单通知</span>
                </label>
                <p class="setting-description">接收订单状态更新通知</p>
              </div>

              <div class="setting-item">
                <label class="setting-label">
                  <input
                    v-model="preferences.marketing_notifications"
                    type="checkbox"
                    class="setting-checkbox"
                  />
                  <span class="checkbox-text">营销通知</span>
                </label>
                <p class="setting-description">接收促销和营销活动通知</p>
              </div>
            </div>
          </div>

          <!-- 通知频率 -->
          <div class="setting-section">
            <h3 class="section-title">通知频率</h3>
            <div class="frequency-options">
              <label
                v-for="option in frequencyOptions"
                :key="option.value"
                class="frequency-option"
                :class="{
                  active: preferences.notification_frequency === option.value,
                }"
              >
                <input
                  v-model="preferences.notification_frequency"
                  :value="option.value"
                  type="radio"
                  class="frequency-radio"
                />
                <div class="option-content">
                  <span class="option-title">{{ option.label }}</span>
                  <span class="option-description">{{
                    option.description
                  }}</span>
                </div>
              </label>
            </div>
          </div>

          <!-- 免打扰时间 -->
          <div class="setting-section">
            <h3 class="section-title">免打扰时间</h3>
            <div class="quiet-hours">
              <div class="time-input-group">
                <label class="time-label">开始时间</label>
                <input
                  v-model="preferences.quiet_hours_start"
                  type="time"
                  class="time-input"
                />
              </div>
              <div class="time-separator">-</div>
              <div class="time-input-group">
                <label class="time-label">结束时间</label>
                <input
                  v-model="preferences.quiet_hours_end"
                  type="time"
                  class="time-input"
                />
              </div>
            </div>
            <p class="setting-description">在此时间段内不会收到通知</p>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="button button-secondary" @click="$emit('close')">
          取消
        </button>
        <button
          :disabled="saving"
          class="button button-primary"
          @click="saveSettings"
        >
          {{ saving ? "保存中..." : "保存设置" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useAuthStore } from "@/stores/auth";
import { notificationService } from "@/services/notificationService";
import { XIcon } from "lucide-vue-next";
import type { NotificationPreferences } from "@/services/notificationService";

interface Emits {
  (e: "close"): void;
  (e: "updated"): void;
}

const emit = defineEmits<Emits>();
const authStore = useAuthStore();

// 状态
const loading = ref(true);
const saving = ref(false);
const preferences = ref<NotificationPreferences>({
  id: "",
  user_id: "",
  email_notifications: true,
  push_notifications: true,
  system_notifications: true,
  product_notifications: true,
  order_notifications: true,
  marketing_notifications: false,
  notification_frequency: "immediate",
  quiet_hours_start: "22:00",
  quiet_hours_end: "08:00",
  created_at: "",
  updated_at: "",
});

// 频率选项
const frequencyOptions = [
  {
    value: "immediate",
    label: "立即通知",
    description: "收到通知后立即推送",
  },
  {
    value: "daily",
    label: "每日汇总",
    description: "每天汇总一次发送",
  },
  {
    value: "weekly",
    label: "每周汇总",
    description: "每周汇总一次发送",
  },
  {
    value: "never",
    label: "从不",
    description: "不接收任何通知",
  },
];

// 方法
const loadPreferences = async () => {
  if (!authStore.user) return;

  try {
    loading.value = true;
    const userPreferences = await notificationService.getUserPreferences(
      authStore.user.id,
    );

    if (userPreferences) {
      preferences.value = userPreferences;
    }
  } catch (error) {
    console.error("加载通知偏好失败:", error);
  } finally {
    loading.value = false;
  }
};

const saveSettings = async () => {
  if (!authStore.user || saving.value) return;

  try {
    saving.value = true;

    await notificationService.updatePreferences(
      authStore.user.id,
      preferences.value,
    );

    emit("updated");
    emit("close");
  } catch (error) {
    console.error("保存通知设置失败:", error);
  } finally {
    saving.value = false;
  }
};

// 生命周期
onMounted(() => {
  loadPreferences();
});
</script>

<style scoped>
.notification-settings-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.modal-content {
  position: relative;
  width: 100%;
  max-width: 600px;
  max-height: 80vh;
  background: var(--color-background);
  border-radius: 12px;
  box-shadow: 0 20px 25px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid var(--color-border);
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
}

.close-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-button:hover {
  background: var(--color-surface-hover);
  color: var(--color-text);
}

.close-button .icon {
  width: 1rem;
  height: 1rem;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
}

.loading-spinner {
  width: 2rem;
  height: 2rem;
  border: 2px solid var(--color-border);
  border-top: 2px solid var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.setting-section {
  margin-bottom: 2rem;
}

.setting-section:last-child {
  margin-bottom: 0;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 1rem 0;
}

.setting-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.setting-item {
  padding: 1rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
}

.setting-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  margin-bottom: 0.5rem;
}

.setting-checkbox {
  width: 1rem;
  height: 1rem;
  cursor: pointer;
}

.checkbox-text {
  font-weight: 500;
  color: var(--color-text);
}

.setting-description {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin: 0;
  line-height: 1.4;
}

.frequency-options {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.frequency-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.frequency-option:hover {
  border-color: var(--color-primary);
}

.frequency-option.active {
  border-color: var(--color-primary);
  background: rgba(var(--color-primary-rgb), 0.05);
}

.frequency-radio {
  width: 1rem;
  height: 1rem;
  cursor: pointer;
}

.option-content {
  flex: 1;
}

.option-title {
  display: block;
  font-weight: 500;
  color: var(--color-text);
  margin-bottom: 0.25rem;
}

.option-description {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.quiet-hours {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.time-input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.time-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-secondary);
}

.time-input {
  padding: 0.5rem 0.75rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  color: var(--color-text);
  font-size: 0.875rem;
}

.time-separator {
  margin-top: 1.5rem;
  font-weight: 500;
  color: var(--color-text-secondary);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.5rem 2rem;
  border-top: 1px solid var(--color-border);
}

.button {
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.button-secondary {
  background: var(--color-surface);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
}

.button-secondary:hover {
  background: var(--color-surface-hover);
  color: var(--color-text);
}

.button-primary {
  background: var(--color-primary);
  color: white;
}

.button-primary:hover:not(:disabled) {
  background: color-mix(in srgb, var(--color-primary) 90%, black);
}

.button-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 640px) {
  .modal-content {
    max-width: none;
    margin: 0;
    border-radius: 0;
    height: 100vh;
  }

  .setting-grid {
    grid-template-columns: 1fr;
  }

  .quiet-hours {
    flex-direction: column;
    align-items: stretch;
  }

  .time-separator {
    margin: 0;
    text-align: center;
  }
}
</style>
