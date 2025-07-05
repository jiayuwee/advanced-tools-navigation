import { supabase } from "@/lib/supabaseClient";

export interface Notification {
  id: string;
  user_id: string;
  type:
    | "info"
    | "success"
    | "warning"
    | "error"
    | "system"
    | "product"
    | "order";
  title: string;
  message: string;
  action_url?: string;
  action_text?: string;
  is_read: boolean;
  is_important: boolean;
  expires_at?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface NotificationPreferences {
  id: string;
  user_id: string;
  email_notifications: boolean;
  push_notifications: boolean;
  system_notifications: boolean;
  product_notifications: boolean;
  order_notifications: boolean;
  marketing_notifications: boolean;
  notification_frequency: "immediate" | "daily" | "weekly" | "never";
  quiet_hours_start?: string;
  quiet_hours_end?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateNotificationData {
  user_id: string;
  type: Notification["type"];
  title: string;
  message: string;
  action_url?: string;
  action_text?: string;
  is_important?: boolean;
  expires_at?: string;
  metadata?: Record<string, any>;
}

export interface NotificationStats {
  total: number;
  unread: number;
  important: number;
  by_type: Record<string, number>;
}

class NotificationService {
  private eventSource?: EventSource;

  // 获取用户通知
  async getUserNotifications(
    userId: string,
    options: {
      page?: number;
      limit?: number;
      type?: string;
      unread_only?: boolean;
      important_only?: boolean;
    } = {},
  ): Promise<{
    notifications: Notification[];
    total: number;
    stats: NotificationStats;
  }> {
    try {
      const {
        page = 1,
        limit = 20,
        type,
        unread_only,
        important_only,
      } = options;

      let query = supabase
        .from("notifications")
        .select("*", { count: "exact" })
        .eq("user_id", userId);

      // 应用筛选器
      if (type) {
        query = query.eq("type", type);
      }

      if (unread_only) {
        query = query.eq("is_read", false);
      }

      if (important_only) {
        query = query.eq("is_important", true);
      }

      // 过滤过期通知
      query = query.or(
        "expires_at.is.null,expires_at.gt." + new Date().toISOString(),
      );

      // 排序和分页
      query = query
        .order("is_important", { ascending: false })
        .order("created_at", { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      // 获取统计信息
      const stats = await this.getNotificationStats(userId);

      return {
        notifications: data || [],
        total: count || 0,
        stats,
      };
    } catch (error) {
      console.error("获取通知失败:", error);
      throw error;
    }
  }

  // 获取通知统计
  async getNotificationStats(userId: string): Promise<NotificationStats> {
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("type, is_read, is_important")
        .eq("user_id", userId)
        .or("expires_at.is.null,expires_at.gt." + new Date().toISOString());

      if (error) throw error;

      const stats: NotificationStats = {
        total: data?.length || 0,
        unread: 0,
        important: 0,
        by_type: {},
      };

      data?.forEach((notification) => {
        if (!notification.is_read) {
          stats.unread++;
        }
        if (notification.is_important) {
          stats.important++;
        }

        const type = notification.type;
        stats.by_type[type] = (stats.by_type[type] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error("获取通知统计失败:", error);
      throw error;
    }
  }

  // 创建通知
  async createNotification(
    notificationData: CreateNotificationData,
  ): Promise<Notification | null> {
    try {
      const { data, error } = await supabase
        .from("notifications")
        .insert({
          ...notificationData,
          is_read: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      if (!data) return null;

      // 发送实时通知
      this.sendRealTimeNotification(data);

      return data;
    } catch (error) {
      console.error("创建通知失败:", error);
      return null;
    }
  }

  // 批量创建通知
  async createBulkNotifications(
    notifications: CreateNotificationData[],
  ): Promise<Notification[]> {
    try {
      const notificationsToCreate = notifications.map((notification) => ({
        ...notification,
        is_read: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      const { data, error } = await supabase
        .from("notifications")
        .insert(notificationsToCreate)
        .select();

      if (error) throw error;

      // 发送实时通知
      data?.forEach((notification) => {
        this.sendRealTimeNotification(notification);
      });

      return data || [];
    } catch (error) {
      console.error("批量创建通知失败:", error);
      throw error;
    }
  }

  // 标记通知为已读
  async markAsRead(notificationId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({
          is_read: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", notificationId)
        .eq("user_id", userId);

      if (error) throw error;
    } catch (error) {
      console.error("标记通知已读失败:", error);
      throw error;
    }
  }

  // 批量标记为已读
  async markAllAsRead(userId: string, type?: string): Promise<void> {
    try {
      let query = supabase
        .from("notifications")
        .update({
          is_read: true,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId)
        .eq("is_read", false);

      if (type) {
        query = query.eq("type", type);
      }

      const { error } = await query;

      if (error) throw error;
    } catch (error) {
      console.error("批量标记已读失败:", error);
      throw error;
    }
  }

  // 删除通知
  async deleteNotification(
    notificationId: string,
    userId: string,
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", notificationId)
        .eq("user_id", userId);

      if (error) throw error;
    } catch (error) {
      console.error("删除通知失败:", error);
      throw error;
    }
  }

  // 清理过期通知
  async cleanupExpiredNotifications(): Promise<void> {
    try {
      const { error } = await supabase
        .from("notifications")
        .delete()
        .lt("expires_at", new Date().toISOString());

      if (error) throw error;
    } catch (error) {
      console.error("清理过期通知失败:", error);
      throw error;
    }
  }

  // 获取用户通知偏好
  async getUserPreferences(
    userId: string,
  ): Promise<NotificationPreferences | null> {
    try {
      const { data, error } = await supabase
        .from("notification_preferences")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) {
        console.error("获取通知偏好失败:", error);
        return null;
      }

      if (!data) {
        // 没有找到偏好设置，创建默认设置
        return await this.createDefaultPreferences(userId);
      }

      return data;
    } catch (error) {
      console.error("获取通知偏好失败:", error);
      return null;
    }
  }

  // 创建默认通知偏好
  async createDefaultPreferences(
    userId: string,
  ): Promise<NotificationPreferences | null> {
    try {
      const defaultPreferences = {
        user_id: userId,
        email_notifications: true,
        push_notifications: true,
        system_notifications: true,
        product_notifications: true,
        order_notifications: true,
        marketing_notifications: false,
        notification_frequency: "immediate" as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("notification_preferences")
        .insert(defaultPreferences)
        .select()
        .single();

      if (error) {
        console.error("创建默认通知偏好失败:", error);
        return null;
      }

      return data || null;
    } catch (error) {
      console.error("创建默认通知偏好失败:", error);
      return null;
    }
  }

  // 更新通知偏好
  async updatePreferences(
    userId: string,
    preferences: Partial<NotificationPreferences>,
  ): Promise<NotificationPreferences> {
    try {
      const { data, error } = await supabase
        .from("notification_preferences")
        .update({
          ...preferences,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error("更新通知偏好失败:", error);
      throw error;
    }
  }

  // 发送实时通知
  private sendRealTimeNotification(notification: Notification): void {
    // 通过 Supabase 实时功能发送通知
    supabase.channel("notifications").send({
      type: "broadcast",
      event: "new_notification",
      payload: notification,
    });
  }

  // 订阅实时通知
  subscribeToNotifications(
    userId: string,
    callback: (notification: Notification) => void,
  ): () => void {
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          callback(payload.new as Notification);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  // 请求浏览器通知权限
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!("Notification" in window)) {
      throw new Error("此浏览器不支持桌面通知");
    }

    if (Notification.permission === "granted") {
      return "granted";
    }

    if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      return permission;
    }

    return Notification.permission;
  }

  // 显示浏览器通知
  async showBrowserNotification(
    title: string,
    options: NotificationOptions = {},
  ): Promise<void> {
    try {
      const permission = await this.requestNotificationPermission();

      if (permission === "granted") {
        const notification = new Notification(title, {
          icon: "/favicon.ico",
          badge: "/favicon.ico",
          ...options,
        });

        // 自动关闭通知
        setTimeout(() => {
          notification.close();
        }, 5000);
      }
    } catch (error) {
      console.error("显示浏览器通知失败:", error);
    }
  }

  // 发送系统通知
  async sendSystemNotification(
    userIds: string[],
    title: string,
    message: string,
    options: {
      type?: Notification["type"];
      action_url?: string;
      action_text?: string;
      is_important?: boolean;
      expires_at?: string;
    } = {},
  ): Promise<void> {
    try {
      const notifications = userIds.map((userId) => ({
        user_id: userId,
        type: options.type || ("system" as const),
        title,
        message,
        action_url: options.action_url,
        action_text: options.action_text,
        is_important: options.is_important || false,
        expires_at: options.expires_at,
      }));

      await this.createBulkNotifications(notifications);
    } catch (error) {
      console.error("发送系统通知失败:", error);
      throw error;
    }
  }
}

// 导出单例实例
export const notificationService = new NotificationService();
export default notificationService;
