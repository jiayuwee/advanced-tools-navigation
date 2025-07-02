<template>
  <div class="simple-theme-selector">
    <!-- 主题切换按钮 -->
    <button
      @click="showPanel = !showPanel"
      class="theme-toggle-button"
      :title="getThemeTitle()"
    >
      <SunIcon v-if="currentMode === 'light'" class="icon" />
      <MoonIcon v-else-if="currentMode === 'dark'" class="icon" />
      <MonitorIcon v-else class="icon" />
    </button>

    <!-- 简化的主题面板 -->
    <div v-if="showPanel" class="theme-panel" @click.stop>
      <div class="panel-header">
        <h3 class="panel-title">选择主题</h3>
        <button @click="showPanel = false" class="close-button">
          <XIcon class="icon" />
        </button>
      </div>

      <div class="panel-content">
        <!-- 简化的主题模式选择 -->
        <div class="theme-options">
          <button
            v-for="mode in simpleModes"
            :key="mode.value"
            @click="selectMode(mode.value)"
            class="theme-option"
            :class="{ active: currentMode === mode.value }"
          >
            <component :is="mode.icon" class="option-icon" />
            <div class="option-content">
              <span class="option-label">{{ mode.label }}</span>
              <span class="option-desc">{{ mode.description }}</span>
            </div>
            <div v-if="currentMode === mode.value" class="check-icon">✓</div>
          </button>
        </div>
      </div>
    </div>

    <!-- 点击外部关闭面板 -->
    <div
      v-if="showPanel"
      class="panel-overlay"
      @click="showPanel = false"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useTheme } from "@/composables/useTheme";
import {
  SunIcon,
  MoonIcon,
  XIcon,
  MonitorIcon,
  PaletteIcon,
} from "lucide-vue-next";
import type { ThemeMode } from "@/composables/useTheme";

const {
  themeConfig,
  isDark,
  themePresets,
  setThemeMode,
  setPrimaryColor,
  setAccentColor,
  applyPreset,
  resetTheme,
  exportTheme,
  importTheme,
} = useTheme();

// 状态
const showPanel = ref(false);
const showExportImport = ref(false);
const importConfig = ref("");
const importError = ref("");
const copied = ref(false);

// 主题模式选项
const themeModes = [
  { value: "light" as ThemeMode, label: "浅色", icon: SunIcon },
  { value: "dark" as ThemeMode, label: "深色", icon: MoonIcon },
  { value: "auto" as ThemeMode, label: "自动", icon: MonitorIcon },
];

// 判断预设是否激活
const isPresetActive = (preset: any) => {
  return (
    preset.config.primaryColor === themeConfig.value.primaryColor &&
    preset.config.accentColor === themeConfig.value.accentColor
  );
};

// 复制主题配置
const copyThemeConfig = async () => {
  try {
    await navigator.clipboard.writeText(exportTheme());
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch (error) {
    console.error("复制失败:", error);
  }
};

// 处理主题导入
const handleImportTheme = () => {
  importError.value = "";

  if (!importConfig.value.trim()) {
    importError.value = "请输入主题配置";
    return;
  }

  const success = importTheme(importConfig.value);

  if (success) {
    importConfig.value = "";
    showExportImport.value = false;
    showPanel.value = false;
  } else {
    importError.value = "主题配置格式错误";
  }
};
</script>

<style scoped>
.theme-selector {
  position: relative;
}

.theme-toggle-button {
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
  color: var(--color-text-secondary);
}

.theme-toggle-button:hover {
  background: var(--color-surface-hover);
  color: var(--color-text);
}

.theme-toggle-button .icon {
  width: 1.25rem;
  height: 1.25rem;
}

.theme-panel {
  position: absolute;
  top: 100%;
  right: 0;
  width: 400px;
  max-height: 600px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-lg);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  margin-top: 0.5rem;
  overflow: hidden;
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
  border-bottom: 1px solid var(--color-border);
  background: var(--color-background);
}

.panel-title {
  font-size: 1.125rem;
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
  border-radius: var(--border-radius-md);
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

.panel-content {
  max-height: 500px;
  overflow-y: auto;
  padding: 1rem 1.5rem;
}

.setting-group {
  margin-bottom: 2rem;
}

.setting-group:last-child {
  margin-bottom: 0;
}

.setting-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 0.75rem;
}

.theme-mode-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}

.mode-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--color-text-secondary);
}

.mode-button:hover {
  border-color: var(--color-primary);
  color: var(--color-text);
}

.mode-button.active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

.mode-icon {
  width: 1.25rem;
  height: 1.25rem;
}

.theme-presets {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 0.75rem;
}

.preset-card {
  padding: 0.75rem;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
}

.preset-card:hover {
  border-color: var(--color-primary);
  transform: translateY(-1px);
}

.preset-card.active {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(var(--color-primary-rgb), 0.2);
}

.preset-preview {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2px;
  height: 2rem;
  border-radius: var(--border-radius-sm);
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.preview-color {
  width: 100%;
  height: 100%;
}

.preset-name {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 0.25rem 0;
}

.preset-description {
  font-size: 0.625rem;
  color: var(--color-text-muted);
  margin: 0;
  line-height: 1.3;
}

.color-settings {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.color-setting {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.color-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--color-text-secondary);
}

.color-input-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.color-input {
  width: 2.5rem;
  height: 2.5rem;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-md);
  cursor: pointer;
  background: none;
}

.color-value {
  font-size: 0.75rem;
  font-family: monospace;
  color: var(--color-text-muted);
}

.advanced-settings {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.setting-item-label {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.setting-select {
  padding: 0.375rem 0.75rem;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  color: var(--color-text);
  font-size: 0.875rem;
  cursor: pointer;
}

.setting-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.checkbox-label {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.panel-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--color-border);
}

.action-button {
  flex: 1;
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius-md);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-button.secondary {
  background: var(--color-background);
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
}

.action-button.secondary:hover {
  background: var(--color-surface-hover);
  color: var(--color-text);
}

.export-import-section {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--color-border);
}

.export-section,
.import-section {
  margin-bottom: 1.5rem;
}

.export-textarea,
.import-textarea {
  width: 100%;
  height: 6rem;
  padding: 0.75rem;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-md);
  color: var(--color-text);
  font-size: 0.75rem;
  font-family: monospace;
  resize: vertical;
  margin-bottom: 0.5rem;
}

.copy-button,
.import-button {
  padding: 0.5rem 1rem;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--border-radius-md);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.copy-button:hover,
.import-button:hover:not(:disabled) {
  background: color-mix(in srgb, var(--color-primary) 90%, black);
}

.import-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.import-error {
  color: #ef4444;
  font-size: 0.75rem;
  margin: 0.5rem 0 0 0;
}

@media (max-width: 480px) {
  .theme-panel {
    width: 320px;
    max-width: calc(100vw - 2rem);
  }

  .theme-presets {
    grid-template-columns: 1fr;
  }

  .color-settings {
    grid-template-columns: 1fr;
  }

  .panel-actions {
    flex-direction: column;
  }
}
</style>
