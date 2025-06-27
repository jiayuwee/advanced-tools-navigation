/**
 * 本地存储服务
 * 提供统一的本地数据管理接口
 */

import type { Tool, Category } from "../types";

// 本地存储键名常量
export const LOCAL_STORAGE_KEYS = {
  TOOLS: "local_tools",
  CATEGORIES: "local_categories",
  USER_PREFERENCES: "user_preferences",
  THEME_CONFIG: "theme_config",
  OFFLINE_QUEUE: "offline_queue",
  LAST_SYNC: "last_sync_time",
  APP_CONFIG: "app_config",
} as const;

// 本地存储数据类型
export interface LocalTool extends Tool {
  localId?: string;
  isLocal?: boolean;
  lastModified?: string;
  syncStatus?: "pending" | "synced" | "conflict";
}

export interface LocalCategory extends Category {
  localId?: string;
  isLocal?: boolean;
  lastModified?: string;
  syncStatus?: "pending" | "synced" | "conflict";
}

export interface UserPreferences {
  theme: "light" | "dark" | "auto";
  language: "zh-CN" | "en-US";
  sidebarCollapsed: boolean;
  defaultView: "grid" | "list";
  autoSync: boolean;
  offlineMode: boolean;
}

export interface OfflineAction {
  id: string;
  type: "create" | "update" | "delete";
  entity: "tool" | "category";
  data: any;
  timestamp: string;
}

export class LocalStorageService {
  /**
   * 获取本地工具数据
   */
  static getLocalTools(): LocalTool[] {
    try {
      const data = localStorage.getItem(LOCAL_STORAGE_KEYS.TOOLS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("获取本地工具数据失败:", error);
      return [];
    }
  }

  /**
   * 保存本地工具数据
   */
  static saveLocalTools(tools: LocalTool[]): void {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.TOOLS, JSON.stringify(tools));
    } catch (error) {
      console.error("保存本地工具数据失败:", error);
    }
  }

  /**
   * 添加本地工具
   */
  static addLocalTool(
    tool: Omit<LocalTool, "localId" | "lastModified">,
  ): LocalTool {
    const localTool: LocalTool = {
      ...tool,
      localId: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      isLocal: true,
      lastModified: new Date().toISOString(),
      syncStatus: "pending",
    };

    const tools = this.getLocalTools();
    tools.push(localTool);
    this.saveLocalTools(tools);

    // 添加到离线队列
    this.addOfflineAction({
      type: "create",
      entity: "tool",
      data: localTool,
    });

    return localTool;
  }

  /**
   * 更新本地工具
   */
  static updateLocalTool(id: string, updates: Partial<LocalTool>): boolean {
    try {
      const tools = this.getLocalTools();
      const index = tools.findIndex(
        (tool) => tool.id === id || tool.localId === id,
      );

      if (index === -1) return false;

      tools[index] = {
        ...tools[index],
        ...updates,
        lastModified: new Date().toISOString(),
        syncStatus: "pending",
      };

      this.saveLocalTools(tools);

      // 添加到离线队列
      this.addOfflineAction({
        type: "update",
        entity: "tool",
        data: { id, updates },
      });

      return true;
    } catch (error) {
      console.error("更新本地工具失败:", error);
      return false;
    }
  }

  /**
   * 删除本地工具
   */
  static deleteLocalTool(id: string): boolean {
    try {
      const tools = this.getLocalTools();
      const index = tools.findIndex(
        (tool) => tool.id === id || tool.localId === id,
      );

      if (index === -1) return false;

      const deletedTool = tools[index];
      tools.splice(index, 1);
      this.saveLocalTools(tools);

      // 添加到离线队列
      this.addOfflineAction({
        type: "delete",
        entity: "tool",
        data: { id: deletedTool.id || deletedTool.localId },
      });

      return true;
    } catch (error) {
      console.error("删除本地工具失败:", error);
      return false;
    }
  }

  /**
   * 获取本地分类数据
   */
  static getLocalCategories(): LocalCategory[] {
    try {
      const data = localStorage.getItem(LOCAL_STORAGE_KEYS.CATEGORIES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("获取本地分类数据失败:", error);
      return [];
    }
  }

  /**
   * 保存本地分类数据
   */
  static saveLocalCategories(categories: LocalCategory[]): void {
    try {
      localStorage.setItem(
        LOCAL_STORAGE_KEYS.CATEGORIES,
        JSON.stringify(categories),
      );
    } catch (error) {
      console.error("保存本地分类数据失败:", error);
    }
  }

  /**
   * 获取用户偏好设置
   */
  static getUserPreferences(): UserPreferences {
    try {
      const data = localStorage.getItem(LOCAL_STORAGE_KEYS.USER_PREFERENCES);
      const defaultPreferences: UserPreferences = {
        theme: "auto",
        language: "zh-CN",
        sidebarCollapsed: false,
        defaultView: "grid",
        autoSync: true,
        offlineMode: false,
      };
      return data
        ? { ...defaultPreferences, ...JSON.parse(data) }
        : defaultPreferences;
    } catch (error) {
      console.error("获取用户偏好设置失败:", error);
      return {
        theme: "auto",
        language: "zh-CN",
        sidebarCollapsed: false,
        defaultView: "grid",
        autoSync: true,
        offlineMode: false,
      };
    }
  }

  /**
   * 保存用户偏好设置
   */
  static saveUserPreferences(preferences: Partial<UserPreferences>): void {
    try {
      const current = this.getUserPreferences();
      const updated = { ...current, ...preferences };
      localStorage.setItem(
        LOCAL_STORAGE_KEYS.USER_PREFERENCES,
        JSON.stringify(updated),
      );
    } catch (error) {
      console.error("保存用户偏好设置失败:", error);
    }
  }

  /**
   * 获取离线操作队列
   */
  static getOfflineQueue(): OfflineAction[] {
    try {
      const data = localStorage.getItem(LOCAL_STORAGE_KEYS.OFFLINE_QUEUE);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("获取离线队列失败:", error);
      return [];
    }
  }

  /**
   * 添加离线操作
   */
  static addOfflineAction(
    action: Omit<OfflineAction, "id" | "timestamp">,
  ): void {
    try {
      const queue = this.getOfflineQueue();
      const newAction: OfflineAction = {
        ...action,
        id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
      };
      queue.push(newAction);
      localStorage.setItem(
        LOCAL_STORAGE_KEYS.OFFLINE_QUEUE,
        JSON.stringify(queue),
      );
    } catch (error) {
      console.error("添加离线操作失败:", error);
    }
  }

  /**
   * 清空离线队列
   */
  static clearOfflineQueue(): void {
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEYS.OFFLINE_QUEUE);
    } catch (error) {
      console.error("清空离线队列失败:", error);
    }
  }

  /**
   * 获取最后同步时间
   */
  static getLastSyncTime(): string | null {
    return localStorage.getItem(LOCAL_STORAGE_KEYS.LAST_SYNC);
  }

  /**
   * 设置最后同步时间
   */
  static setLastSyncTime(time: string = new Date().toISOString()): void {
    localStorage.setItem(LOCAL_STORAGE_KEYS.LAST_SYNC, time);
  }

  /**
   * 清空所有本地数据
   */
  static clearAllLocalData(): void {
    try {
      Object.values(LOCAL_STORAGE_KEYS).forEach((key) => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error("清空本地数据失败:", error);
    }
  }

  /**
   * 获取本地存储使用情况
   */
  static getStorageInfo(): { used: number; total: number; percentage: number } {
    try {
      let used = 0;
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          used += localStorage[key].length;
        }
      }

      // 估算总容量 (通常为 5-10MB)
      const total = 5 * 1024 * 1024; // 5MB
      const percentage = (used / total) * 100;

      return { used, total, percentage };
    } catch (error) {
      console.error("获取存储信息失败:", error);
      return { used: 0, total: 0, percentage: 0 };
    }
  }
}
