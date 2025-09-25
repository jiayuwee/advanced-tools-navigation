/**
 * 本地管理 Store
 * 管理本地数据、离线功能和数据同步
 */

import { defineStore } from "pinia";
import { ref, computed } from "vue";
import {
  LocalStorageService,
  type LocalTool,
  type LocalCategory,
  type UserPreferences,
  type OfflineAction,
} from "../services/localStorageService";
import { ToolsService } from "../services/toolsService";
import { CategoriesService } from "../services/categoriesService";
import type { Tool } from "../types";

export const useLocalManagementStore = defineStore("localManagement", () => {
  // 状态
  const isOfflineMode = ref(false);
  const isSyncing = ref(false);
  const syncError = ref<string | null>(null);
  const lastSyncTime = ref<string | null>(null);
  const userPreferences = ref<UserPreferences>(
    LocalStorageService.getUserPreferences(),
  );
  const localTools = ref<LocalTool[]>([]);
  const localCategories = ref<LocalCategory[]>([]);
  const offlineQueue = ref<OfflineAction[]>([]);

  // 计算属性
  const pendingSyncCount = computed(() => offlineQueue.value.length);

  const hasLocalChanges = computed(
    () =>
      localTools.value.some((tool) => tool.syncStatus === "pending") ||
      localCategories.value.some(
        (category) => category.syncStatus === "pending",
      ),
  );

  const storageInfo = computed(() => LocalStorageService.getStorageInfo());

  const isOnline = computed(() => navigator.onLine && !isOfflineMode.value);

  // 方法
  const initialize = async () => {
    try {
      // 加载本地数据
      localTools.value = LocalStorageService.getLocalTools();
      localCategories.value = LocalStorageService.getLocalCategories();
      offlineQueue.value = LocalStorageService.getOfflineQueue();
      lastSyncTime.value = LocalStorageService.getLastSyncTime();

      // 监听网络状态
      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);

      // 如果在线且有待同步数据，自动同步
      if (
        isOnline.value &&
        userPreferences.value.autoSync &&
        pendingSyncCount.value > 0
      ) {
        await syncData();
      }
    } catch (error) {
      console.error("初始化本地管理失败:", error);
    }
  };

  const handleOnline = async () => {
    isOfflineMode.value = false;
    if (userPreferences.value.autoSync && pendingSyncCount.value > 0) {
      await syncData();
    }
  };

  const handleOffline = () => {
    isOfflineMode.value = true;
  };

  // 本地工具管理
  const addLocalTool = (
    toolData: Omit<Tool, "id" | "created_at" | "updated_at">,
  ) => {
    try {
      // 转换为 LocalTool 格式后传给 LocalStorageService
      const localToolData = {
        ...toolData,
        // 添加缺失的必需字段
        id: `temp_${Date.now()}`, // 临时 ID
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as Omit<LocalTool, "localId" | "lastModified" | "syncStatus" | "isLocal">;
      
      const localTool = LocalStorageService.addLocalTool(localToolData);
      localTools.value.push(localTool);
      offlineQueue.value = LocalStorageService.getOfflineQueue();
      return localTool;
    } catch (error) {
      console.error("添加本地工具失败:", error);
      throw error;
    }
  };

  const updateLocalTool = (id: string, updates: Partial<Tool>) => {
    try {
      const success = LocalStorageService.updateLocalTool(id, updates);
      if (success) {
        localTools.value = LocalStorageService.getLocalTools();
        offlineQueue.value = LocalStorageService.getOfflineQueue();
      }
      return success;
    } catch (error) {
      console.error("更新本地工具失败:", error);
      throw error;
    }
  };

  const deleteLocalTool = (id: string) => {
    try {
      const success = LocalStorageService.deleteLocalTool(id);
      if (success) {
        localTools.value = LocalStorageService.getLocalTools();
        offlineQueue.value = LocalStorageService.getOfflineQueue();
      }
      return success;
    } catch (error) {
      console.error("删除本地工具失败:", error);
      throw error;
    }
  };

  // 用户偏好设置
  const updateUserPreferences = (preferences: Partial<UserPreferences>) => {
    try {
      LocalStorageService.saveUserPreferences(preferences);
      userPreferences.value = LocalStorageService.getUserPreferences();
    } catch (error) {
      console.error("更新用户偏好失败:", error);
      throw error;
    }
  };

  // 数据同步
  const syncData = async () => {
    if (isSyncing.value || !isOnline.value) return;

    try {
      isSyncing.value = true;
      syncError.value = null;

      const queue = LocalStorageService.getOfflineQueue();

      for (const action of queue) {
        await processOfflineAction(action);
      }

      // 清空离线队列
      LocalStorageService.clearOfflineQueue();
      offlineQueue.value = [];

      // 更新同步时间
      const now = new Date().toISOString();
      LocalStorageService.setLastSyncTime(now);
      lastSyncTime.value = now;

      // 标记所有本地数据为已同步
      markAllAsSynced();
    } catch (error) {
      console.error("数据同步失败:", error);
      syncError.value = error instanceof Error ? error.message : "同步失败";
      throw error;
    } finally {
      isSyncing.value = false;
    }
  };

  const processOfflineAction = async (action: OfflineAction) => {
    try {
      switch (action.entity) {
        case "tool":
          await processToolAction(action);
          break;
        case "category":
          await processCategoryAction(action);
          break;
        default:
          console.warn("未知的离线操作类型:", action);
      }
    } catch (error) {
      console.error("处理离线操作失败:", action, error);
      throw error;
    }
  };

  const processToolAction = async (action: OfflineAction) => {
    switch (action.type) {
      case "create":
        await ToolsService.createTool(action.data);
        break;
      case "update":
        await ToolsService.updateTool(action.data.id, action.data.updates);
        break;
      case "delete":
        await ToolsService.deleteTool(action.data.id);
        break;
    }
  };

  const processCategoryAction = async (action: OfflineAction) => {
    switch (action.type) {
      case "create":
        await CategoriesService.createCategory(action.data);
        break;
      case "update":
        await CategoriesService.updateCategory(
          action.data.id,
          action.data.updates,
        );
        break;
      case "delete":
        await CategoriesService.deleteCategory(action.data.id);
        break;
    }
  };

  const markAllAsSynced = () => {
    // 更新本地工具状态
    localTools.value = localTools.value.map((tool) => ({
      ...tool,
      syncStatus: "synced" as const,
    }));
    LocalStorageService.saveLocalTools(localTools.value);

    // 更新本地分类状态
    localCategories.value = localCategories.value.map((category) => ({
      ...category,
      syncStatus: "synced" as const,
    }));
    LocalStorageService.saveLocalCategories(localCategories.value);
  };

  // 强制同步
  const forceSyncData = async () => {
    if (!isOnline.value) {
      throw new Error("网络不可用，无法同步数据");
    }
    await syncData();
  };

  // 切换离线模式
  const toggleOfflineMode = () => {
    isOfflineMode.value = !isOfflineMode.value;
    updateUserPreferences({ offlineMode: isOfflineMode.value });
  };

  // 清空本地数据
  const clearLocalData = () => {
    try {
      LocalStorageService.clearAllLocalData();
      localTools.value = [];
      localCategories.value = [];
      offlineQueue.value = [];
      lastSyncTime.value = null;
      userPreferences.value = LocalStorageService.getUserPreferences();
    } catch (error) {
      console.error("清空本地数据失败:", error);
      throw error;
    }
  };

  // 导出本地数据
  const exportLocalData = () => {
    try {
      const data = {
        tools: localTools.value,
        categories: localCategories.value,
        preferences: userPreferences.value,
        exportTime: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `local-data-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("导出本地数据失败:", error);
      throw error;
    }
  };

  // 导入本地数据
  const importLocalData = async (file: File) => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (data.tools) {
        localTools.value = data.tools;
        LocalStorageService.saveLocalTools(data.tools);
      }

      if (data.categories) {
        localCategories.value = data.categories;
        LocalStorageService.saveLocalCategories(data.categories);
      }

      if (data.preferences) {
        updateUserPreferences(data.preferences);
      }
    } catch (error) {
      console.error("导入本地数据失败:", error);
      throw error;
    }
  };

  return {
    // 状态
    isOfflineMode,
    isSyncing,
    syncError,
    lastSyncTime,
    userPreferences,
    localTools,
    localCategories,
    offlineQueue,

    // 计算属性
    pendingSyncCount,
    hasLocalChanges,
    storageInfo,
    isOnline,

    // 方法
    initialize,
    addLocalTool,
    updateLocalTool,
    deleteLocalTool,
    updateUserPreferences,
    syncData,
    forceSyncData,
    toggleOfflineMode,
    clearLocalData,
    exportLocalData,
    importLocalData,
  };
});
