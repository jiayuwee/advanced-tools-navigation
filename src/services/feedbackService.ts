import { supabase } from "@/lib/supabase";

export interface FeedbackData {
  type: "bug" | "feature" | "improvement" | "question" | "other";
  title: string;
  content: string;
  priority: "low" | "medium" | "high" | "urgent";
  user_id: string;
  system_info?: {
    userAgent: string;
    platform: string;
    language: string;
    screenResolution: string;
    timestamp: string;
  };
}

export interface Feedback {
  id: string;
  type: string;
  title: string;
  content: string;
  priority: string;
  status: "pending" | "in_progress" | "resolved" | "closed";
  user_id: string;
  system_info?: any;
  response?: string;
  response_at?: string;
  response_by?: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export interface FeedbackStats {
  total: number;
  pending: number;
  in_progress: number;
  resolved: number;
  closed: number;
  response_rate: number;
  avg_response_time: number;
  by_type: Record<string, number>;
  by_priority: Record<string, number>;
  recent_count: number;
}

export interface FeedbackFilters {
  type?: string;
  priority?: string;
  status?: string;
  user_id?: string;
  date_from?: string;
  date_to?: string;
}

export interface FeedbackListResult {
  feedbacks: Feedback[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

class FeedbackService {
  // 提交反馈
  async submitFeedback(data: FeedbackData): Promise<Feedback> {
    try {
      const { data: feedback, error } = await supabase
        .from("user_feedback")
        .insert({
          type: data.type,
          title: data.title,
          content: data.content,
          priority: data.priority,
          user_id: data.user_id,
          system_info: data.system_info,
          status: "pending",
          is_read: false,
        })
        .select()
        .single();

      if (error) throw error;

      // 发送通知给管理员
      await this.notifyAdmins(feedback);

      return feedback;
    } catch (error) {
      console.error("提交反馈失败:", error);
      throw new Error("提交反馈失败，请稍后重试");
    }
  }

  // 获取用户反馈列表
  async getUserFeedbacks(
    userId: string,
    page = 1,
    limit = 10,
    filters: FeedbackFilters = {},
  ): Promise<FeedbackListResult> {
    try {
      let query = supabase
        .from("user_feedback")
        .select("*", { count: "exact" })
        .eq("user_id", userId);

      // 应用筛选条件
      if (filters.type) {
        query = query.eq("type", filters.type);
      }
      if (filters.priority) {
        query = query.eq("priority", filters.priority);
      }
      if (filters.status) {
        query = query.eq("status", filters.status);
      }
      if (filters.date_from) {
        query = query.gte("created_at", filters.date_from);
      }
      if (filters.date_to) {
        query = query.lte("created_at", filters.date_to);
      }

      const {
        data: feedbacks,
        error,
        count,
      } = await query
        .order("created_at", { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (error) throw error;

      const total = count || 0;
      const totalPages = Math.ceil(total / limit);

      return {
        feedbacks: feedbacks || [],
        total,
        page,
        limit,
        totalPages,
        hasMore: page < totalPages,
      };
    } catch (error) {
      console.error("获取反馈列表失败:", error);
      throw new Error("获取反馈列表失败");
    }
  }

  // 获取所有反馈（管理员）
  async getAllFeedbacks(
    page = 1,
    limit = 20,
    filters: FeedbackFilters = {},
  ): Promise<FeedbackListResult> {
    try {
      let query = supabase.from("user_feedback").select(
        `
          *,
          user:user_profiles(full_name, email)
        `,
        { count: "exact" },
      );

      // 应用筛选条件
      if (filters.type) {
        query = query.eq("type", filters.type);
      }
      if (filters.priority) {
        query = query.eq("priority", filters.priority);
      }
      if (filters.status) {
        query = query.eq("status", filters.status);
      }
      if (filters.user_id) {
        query = query.eq("user_id", filters.user_id);
      }
      if (filters.date_from) {
        query = query.gte("created_at", filters.date_from);
      }
      if (filters.date_to) {
        query = query.lte("created_at", filters.date_to);
      }

      const {
        data: feedbacks,
        error,
        count,
      } = await query
        .order("created_at", { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (error) throw error;

      const total = count || 0;
      const totalPages = Math.ceil(total / limit);

      return {
        feedbacks: feedbacks || [],
        total,
        page,
        limit,
        totalPages,
        hasMore: page < totalPages,
      };
    } catch (error) {
      console.error("获取反馈列表失败:", error);
      throw new Error("获取反馈列表失败");
    }
  }

  // 回复反馈
  async respondToFeedback(
    feedbackId: string,
    response: string,
    responseBy: string,
    status?: string,
  ): Promise<Feedback> {
    try {
      const updateData: any = {
        response,
        response_at: new Date().toISOString(),
        response_by: responseBy,
        updated_at: new Date().toISOString(),
      };

      if (status) {
        updateData.status = status;
      }

      const { data: feedback, error } = await supabase
        .from("user_feedback")
        .update(updateData)
        .eq("id", feedbackId)
        .select()
        .single();

      if (error) throw error;

      // 发送通知给用户
      await this.notifyUser(feedback);

      return feedback;
    } catch (error) {
      console.error("回复反馈失败:", error);
      throw new Error("回复反馈失败");
    }
  }

  // 更新反馈状态
  async updateFeedbackStatus(
    feedbackId: string,
    status: string,
    updatedBy?: string,
  ): Promise<Feedback> {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (updatedBy) {
        updateData.updated_by = updatedBy;
      }

      const { data: feedback, error } = await supabase
        .from("user_feedback")
        .update(updateData)
        .eq("id", feedbackId)
        .select()
        .single();

      if (error) throw error;

      return feedback;
    } catch (error) {
      console.error("更新反馈状态失败:", error);
      throw new Error("更新反馈状态失败");
    }
  }

  // 标记反馈为已读
  async markAsRead(feedbackId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("user_feedback")
        .update({ is_read: true })
        .eq("id", feedbackId);

      if (error) throw error;
    } catch (error) {
      console.error("标记已读失败:", error);
      throw new Error("标记已读失败");
    }
  }

  // 批量标记为已读
  async markAllAsRead(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("user_feedback")
        .update({ is_read: true })
        .eq("user_id", userId)
        .eq("is_read", false);

      if (error) throw error;
    } catch (error) {
      console.error("批量标记已读失败:", error);
      throw new Error("批量标记已读失败");
    }
  }

  // 删除反馈
  async deleteFeedback(feedbackId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("user_feedback")
        .delete()
        .eq("id", feedbackId);

      if (error) throw error;
    } catch (error) {
      console.error("删除反馈失败:", error);
      throw new Error("删除反馈失败");
    }
  }

  // 获取反馈统计
  async getFeedbackStats(userId?: string): Promise<FeedbackStats> {
    try {
      let query = supabase.from("user_feedback").select("*");

      if (userId) {
        query = query.eq("user_id", userId);
      }

      const { data: feedbacks, error } = await query;

      if (error) throw error;

      const stats: FeedbackStats = {
        total: feedbacks?.length || 0,
        pending: 0,
        in_progress: 0,
        resolved: 0,
        closed: 0,
        response_rate: 0,
        avg_response_time: 0,
        by_type: {},
        by_priority: {},
        recent_count: 0,
      };

      if (!feedbacks || feedbacks.length === 0) {
        return stats;
      }

      // 统计状态分布
      feedbacks.forEach((feedback) => {
        stats[feedback.status as keyof FeedbackStats]++;

        // 统计类型分布
        stats.by_type[feedback.type] = (stats.by_type[feedback.type] || 0) + 1;

        // 统计优先级分布
        stats.by_priority[feedback.priority] =
          (stats.by_priority[feedback.priority] || 0) + 1;
      });

      // 计算回复率
      const respondedCount = feedbacks.filter((f) => f.response).length;
      stats.response_rate =
        stats.total > 0 ? Math.round((respondedCount / stats.total) * 100) : 0;

      // 计算平均回复时间（小时）
      const responseTimes = feedbacks
        .filter((f) => f.response_at && f.created_at)
        .map((f) => {
          const created = new Date(f.created_at).getTime();
          const responded = new Date(f.response_at!).getTime();
          return (responded - created) / (1000 * 60 * 60); // 转换为小时
        });

      if (responseTimes.length > 0) {
        stats.avg_response_time = Math.round(
          responseTimes.reduce((sum, time) => sum + time, 0) /
            responseTimes.length,
        );
      }

      // 统计最近7天的反馈数量
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      stats.recent_count = feedbacks.filter(
        (f) => new Date(f.created_at) > sevenDaysAgo,
      ).length;

      return stats;
    } catch (error) {
      console.error("获取反馈统计失败:", error);
      throw new Error("获取反馈统计失败");
    }
  }

  // 发送通知给管理员
  private async notifyAdmins(feedback: Feedback): Promise<void> {
    try {
      // 这里应该实现发送通知给管理员的逻辑
      console.log("通知管理员新反馈:", feedback.title);
    } catch (error) {
      console.error("通知管理员失败:", error);
    }
  }

  // 发送通知给用户
  private async notifyUser(feedback: Feedback): Promise<void> {
    try {
      // 这里应该实现发送通知给用户的逻辑
      console.log("通知用户反馈回复:", feedback.title);
    } catch (error) {
      console.error("通知用户失败:", error);
    }
  }

  // 获取反馈详情
  async getFeedbackById(feedbackId: string): Promise<Feedback | null> {
    try {
      const { data: feedback, error } = await supabase
        .from("user_feedback")
        .select(
          `
          *,
          user:user_profiles(full_name, email)
        `,
        )
        .eq("id", feedbackId)
        .single();

      if (error) throw error;

      return feedback;
    } catch (error) {
      console.error("获取反馈详情失败:", error);
      return null;
    }
  }

  // 搜索反馈
  async searchFeedbacks(
    query: string,
    filters: FeedbackFilters = {},
    page = 1,
    limit = 10,
  ): Promise<FeedbackListResult> {
    try {
      let supabaseQuery = supabase
        .from("user_feedback")
        .select("*", { count: "exact" })
        .or(`title.ilike.%${query}%,content.ilike.%${query}%`);

      // 应用筛选条件
      if (filters.type) {
        supabaseQuery = supabaseQuery.eq("type", filters.type);
      }
      if (filters.priority) {
        supabaseQuery = supabaseQuery.eq("priority", filters.priority);
      }
      if (filters.status) {
        supabaseQuery = supabaseQuery.eq("status", filters.status);
      }
      if (filters.user_id) {
        supabaseQuery = supabaseQuery.eq("user_id", filters.user_id);
      }

      const {
        data: feedbacks,
        error,
        count,
      } = await supabaseQuery
        .order("created_at", { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (error) throw error;

      const total = count || 0;
      const totalPages = Math.ceil(total / limit);

      return {
        feedbacks: feedbacks || [],
        total,
        page,
        limit,
        totalPages,
        hasMore: page < totalPages,
      };
    } catch (error) {
      console.error("搜索反馈失败:", error);
      throw new Error("搜索反馈失败");
    }
  }
}

export const feedbackService = new FeedbackService();
