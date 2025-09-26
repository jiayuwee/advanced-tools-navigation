// 评价服务：移除临时 @ts-nocheck 并尽量使用显式类型约束
import { supabase } from "@/lib/supabaseClient";
import { databaseService } from "./databaseService";
import type { QueryOptions } from "./databaseService";

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title: string;
  content: string;
  pros: string[];
  cons: string[];
  is_verified_purchase: boolean;
  is_anonymous: boolean;
  status: "pending" | "approved" | "rejected";
  helpful_count: number;
  unhelpful_count: number;
  reply_count: number;
  created_at: string;
  updated_at: string;
  images?: string[]; // 添加评价图片

  // 关联数据
  user?: {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string;
  };
  product?: {
    id: string;
    name: string;
    images: string[];
  };
  replies?: ReviewReply[];
  user_vote?: "helpful" | "unhelpful" | null;
}

export interface ReviewReply {
  id: string;
  review_id: string;
  user_id: string;
  content: string;
  is_official: boolean;
  created_at: string;
  updated_at: string;

  // 关联数据
  user?: {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string;
  };
}

export interface ReviewStats {
  total_reviews: number;
  average_rating: number;
  rating_distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  verified_purchase_percentage: number;
  recent_reviews_count: number;
}

export interface CreateReviewData {
  product_id: string;
  rating: number;
  title: string;
  content: string;
  pros?: string[];
  cons?: string[];
  is_anonymous?: boolean;
}

export interface UpdateReviewData {
  rating?: number;
  title?: string;
  content?: string;
  pros?: string[];
  cons?: string[];
  is_anonymous?: boolean;
}

export interface ReviewFilters {
  rating?: number;
  verified_only?: boolean;
  with_content?: boolean;
  sort_by?:
    | "newest"
    | "oldest"
    | "highest_rating"
    | "lowest_rating"
    | "most_helpful";
}

// 数据库查询原始行类型与转换函数
interface ReviewRow {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title: string;
  content: string | null;
  pros: string[] | null;
  cons: string[] | null;
  is_verified_purchase: boolean;
  is_anonymous: boolean;
  status: string;
  helpful_count: number;
  unhelpful_count: number;
  reply_count: number;
  created_at: string;
  updated_at: string;
  images?: string[] | null;
  user_profiles?: {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string;
  } | null;
  products?: {
    id: string;
    name: string;
    images: string[];
  } | null;
  review_replies?: Array<{
    id: string;
    content: string;
    is_official: boolean;
    created_at: string;
    user_profiles?: {
      id: string;
      username: string;
      full_name: string;
      avatar_url: string;
    } | null;
  }> | null;
}

function transformReviewRow(row: ReviewRow): Review {
  return {
    id: row.id,
    product_id: row.product_id,
    user_id: row.user_id,
    rating: row.rating,
    title: row.title,
    content: row.content ?? "",
    pros: row.pros ?? [],
    cons: row.cons ?? [],
    is_verified_purchase: row.is_verified_purchase,
    is_anonymous: row.is_anonymous,
    status: (row.status as Review["status"]) || "pending",
    helpful_count: row.helpful_count,
    unhelpful_count: row.unhelpful_count,
    reply_count: row.reply_count,
    created_at: row.created_at,
    updated_at: row.updated_at,
    images: row.images ?? undefined,
    user: row.user_profiles
      ? {
          id: row.user_profiles.id,
          username: row.user_profiles.username,
          full_name: row.user_profiles.full_name,
          avatar_url: row.user_profiles.avatar_url,
        }
      : undefined,
    product: row.products
      ? {
          id: row.products.id,
          name: row.products.name,
          images: row.products.images,
        }
      : undefined,
    replies: row.review_replies
      ? row.review_replies.map((r) => ({
          id: r.id,
          review_id: row.id,
          user_id: r.user_profiles?.id || "",
          content: r.content,
          is_official: r.is_official,
          created_at: r.created_at,
          updated_at: r.created_at,
          user: r.user_profiles
            ? {
                id: r.user_profiles.id,
                username: r.user_profiles.username,
                full_name: r.user_profiles.full_name,
                avatar_url: r.user_profiles.avatar_url,
              }
            : undefined,
        }))
      : undefined,
    user_vote: null,
  };
}

class ReviewService {
  // 获取产品评价列表
  async getProductReviews(
    productId: string,
    options: QueryOptions & ReviewFilters = {},
  ): Promise<{
    reviews: Review[];
    total: number;
    stats: ReviewStats;
  }> {
    try {
      const {
        page = 1,
        limit = 10,
        rating,
        verified_only,
        with_content,
        sort_by = "newest",
      } = options;

      let query = supabase.from("product_reviews").select(
        `
          *,
          user_profiles!inner(id, username, full_name, avatar_url),
          products!inner(id, name, images),
          review_replies(
            id, content, is_official, created_at,
            user_profiles(id, username, full_name, avatar_url)
          )
        `,
        { count: "exact" },
      );

      // 应用基本筛选器
      query = query.eq("product_id", productId);
      query = query.eq("status", "approved");

      // 应用筛选器
      if (rating) {
        query = query.eq("rating", rating);
      }

      if (verified_only) {
        query = query.eq("is_verified_purchase", true);
      }

      if (with_content) {
        query = query.not("content", "is", null);
        query = query.neq("content", "");
      }

      // 应用排序
      switch (sort_by) {
        case "newest":
          query = query.order("created_at", { ascending: false });
          break;
        case "oldest":
          query = query.order("created_at", { ascending: true });
          break;
        case "highest_rating":
          query = query.order("rating", { ascending: false });
          break;
        case "lowest_rating":
          query = query.order("rating", { ascending: true });
          break;
        case "most_helpful":
          query = query.order("helpful_count", { ascending: false });
          break;
      }

      // 应用分页
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      // 获取统计信息
      const stats = await this.getProductReviewStats(productId);

      const reviews =
        (data as ReviewRow[] | null)?.map(transformReviewRow) || [];
      return { reviews, total: count || 0, stats };
    } catch (error) {
      console.error("获取产品评价失败:", error);
      throw error;
    }
  }

  // 获取产品评价统计
  async getProductReviewStats(productId: string): Promise<ReviewStats> {
    try {
      // 获取基本统计
      let statsQuery = supabase
        .from("product_reviews")
        .select("rating, is_verified_purchase, created_at");

      statsQuery = statsQuery.eq("product_id", productId);
      statsQuery = statsQuery.eq("status", "approved");

      const { data: basicStats } = await statsQuery;

      if (!basicStats || basicStats.length === 0) {
        return {
          total_reviews: 0,
          average_rating: 0,
          rating_distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
          verified_purchase_percentage: 0,
          recent_reviews_count: 0,
        };
      }

      const totalReviews = basicStats.length;
      const averageRating =
        basicStats.reduce((sum, review) => sum + review.rating, 0) /
        totalReviews;

      // 评分分布
      const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      basicStats.forEach((review) => {
        ratingDistribution[review.rating as keyof typeof ratingDistribution]++;
      });

      // 验证购买百分比
      const verifiedCount = basicStats.filter(
        (review) => review.is_verified_purchase,
      ).length;
      const verifiedPercentage = (verifiedCount / totalReviews) * 100;

      // 最近30天的评价数量
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentCount = basicStats.filter(
        (review) => new Date(review.created_at) > thirtyDaysAgo,
      ).length;

      return {
        total_reviews: totalReviews,
        average_rating: Math.round(averageRating * 10) / 10,
        rating_distribution: ratingDistribution,
        verified_purchase_percentage: Math.round(verifiedPercentage),
        recent_reviews_count: recentCount,
      };
    } catch (error) {
      console.error("获取评价统计失败:", error);
      throw error;
    }
  }

  // 创建评价
  async createReview(
    reviewData: CreateReviewData,
    userId: string,
  ): Promise<Review> {
    try {
      // 检查用户是否已经评价过该产品
      let existingQuery = supabase.from("product_reviews").select("id");

      existingQuery = existingQuery.eq("product_id", reviewData.product_id);
      existingQuery = existingQuery.eq("user_id", userId);

      const { data: existingReview } = await existingQuery.maybeSingle();

      if (existingReview) {
        throw new Error("您已经评价过该产品");
      }

      // 检查是否为验证购买
      const { data: purchase } = await supabase
        .from("order_items")
        .select(
          `
          id,
          orders!inner(user_id, status)
        `,
        )
        .eq("product_id", reviewData.product_id)
        .eq("orders.user_id", userId)
        .eq("orders.status", "paid")
        .limit(1);

      const reviewToCreate = {
        ...reviewData,
        user_id: userId,
        is_verified_purchase: !!purchase,
        status: "pending" as const,
        helpful_count: 0,
        unhelpful_count: 0,
        reply_count: 0,
      };

      const { data, error } = await supabase
        .from("product_reviews")
        .insert(reviewToCreate)
        .select(
          `
          *,
          user_profiles!inner(id, username, full_name, avatar_url),
          products!inner(id, name, images)
        `,
        )
        .single();

      if (error) throw error;

      return transformReviewRow(data as ReviewRow);
    } catch (error) {
      console.error("创建评价失败:", error);
      throw error;
    }
  }

  // 更新评价
  async updateReview(
    reviewId: string,
    updateData: UpdateReviewData,
    userId: string,
  ): Promise<Review> {
    try {
      // 验证用户权限
      const { data: existingReview } = await supabase
        .from("product_reviews")
        .select("user_id")
        .eq("id", reviewId)
        .single();

      if (!existingReview || existingReview.user_id !== userId) {
        throw new Error("无权限修改此评价");
      }

      const { data, error } = await supabase
        .from("product_reviews")
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", reviewId)
        .select(
          `
          *,
          user_profiles!inner(id, username, full_name, avatar_url),
          products!inner(id, name, images)
        `,
        )
        .single();

      if (error) throw error;

      return transformReviewRow(data as ReviewRow);
    } catch (error) {
      console.error("更新评价失败:", error);
      throw error;
    }
  }

  // 删除评价
  async deleteReview(reviewId: string, userId: string): Promise<void> {
    try {
      // 验证用户权限
      const { data: existingReview } = await supabase
        .from("product_reviews")
        .select("user_id")
        .eq("id", reviewId)
        .single();

      if (!existingReview || existingReview.user_id !== userId) {
        throw new Error("无权限删除此评价");
      }

      const { error } = await supabase
        .from("product_reviews")
        .delete()
        .eq("id", reviewId);

      if (error) throw error;
    } catch (error) {
      console.error("删除评价失败:", error);
      throw error;
    }
  }

  // 评价投票（有用/无用）
  async voteReview(
    reviewId: string,
    voteType: "helpful" | "unhelpful",
    userId: string,
  ): Promise<void> {
    try {
      // 检查是否已经投票
      const { data: existingVote } = await supabase
        .from("review_votes")
        .select("vote_type")
        .eq("review_id", reviewId)
        .eq("user_id", userId)
        .single();

      if (existingVote) {
        if (existingVote.vote_type === voteType) {
          // 取消投票
          await supabase
            .from("review_votes")
            .delete()
            .eq("review_id", reviewId)
            .eq("user_id", userId);

          // 更新计数
          const field =
            voteType === "helpful" ? "helpful_count" : "unhelpful_count";
          await supabase.rpc("decrement_review_vote", {
            review_id: reviewId,
            vote_field: field,
          });
        } else {
          // 更改投票
          await supabase
            .from("review_votes")
            .update({ vote_type: voteType })
            .eq("review_id", reviewId)
            .eq("user_id", userId);

          // 更新计数
          const oldField =
            existingVote.vote_type === "helpful"
              ? "helpful_count"
              : "unhelpful_count";
          const newField =
            voteType === "helpful" ? "helpful_count" : "unhelpful_count";

          await supabase.rpc("change_review_vote", {
            review_id: reviewId,
            old_field: oldField,
            new_field: newField,
          });
        }
      } else {
        // 新投票
        await supabase.from("review_votes").insert({
          review_id: reviewId,
          user_id: userId,
          vote_type: voteType,
        });

        // 更新计数
        const field =
          voteType === "helpful" ? "helpful_count" : "unhelpful_count";
        await supabase.rpc("increment_review_vote", {
          review_id: reviewId,
          vote_field: field,
        });
      }
    } catch (error) {
      console.error("评价投票失败:", error);
      throw error;
    }
  }

  // 添加评价回复
  async addReviewReply(
    reviewId: string,
    content: string,
    userId: string,
    isOfficial: boolean = false,
  ): Promise<ReviewReply> {
    try {
      const { data, error } = await supabase
        .from("review_replies")
        .insert({
          review_id: reviewId,
          user_id: userId,
          content,
          is_official: isOfficial,
        })
        .select(
          `
          *,
          user_profiles!inner(id, username, full_name, avatar_url)
        `,
        )
        .single();

      if (error) throw error;

      // 更新评价的回复计数
      // 使用 RPC：Supabase JS v2 对自定义函数暂未生成类型，保持最小 any 包裹
      await supabase.rpc("increment_review_reply_count", {
        review_id: reviewId,
      } as { review_id: string });

      return data as ReviewReply;
    } catch (error) {
      console.error("添加评价回复失败:", error);
      throw error;
    }
  }

  // 获取用户的评价
  async getUserReviews(
    userId: string,
    options: QueryOptions = {},
  ): Promise<{
    reviews: Review[];
    total: number;
  }> {
    try {
      const result = await databaseService.query<Review>("product_reviews", {
        ...options,
        filters: { user_id: userId },
        sortBy: "created_at",
        sortOrder: "desc",
      });

      return {
        reviews: result.data,
        total: result.count,
      };
    } catch (error) {
      console.error("获取用户评价失败:", error);
      throw error;
    }
  }

  // 管理员审核评价
  async moderateReview(
    reviewId: string,
    status: "approved" | "rejected",
    moderatorId: string,
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from("product_reviews")
        .update({
          status,
          moderated_by: moderatorId,
          moderated_at: new Date().toISOString(),
        })
        .eq("id", reviewId);

      if (error) throw error;
    } catch (error) {
      console.error("审核评价失败:", error);
      throw error;
    }
  }

  // 获取待审核的评价
  async getPendingReviews(options: QueryOptions = {}): Promise<{
    reviews: Review[];
    total: number;
  }> {
    try {
      const result = await databaseService.query<Review>("product_reviews", {
        ...options,
        filters: { status: "pending" },
        sortBy: "created_at",
        sortOrder: "asc",
      });

      return {
        reviews: result.data,
        total: result.count,
      };
    } catch (error) {
      console.error("获取待审核评价失败:", error);
      throw error;
    }
  }

  // 获取评价详情
  async getReviewById(reviewId: string): Promise<Review | null> {
    try {
      const { data, error } = await supabase
        .from("product_reviews")
        .select(
          `
          *,
          user_profiles!inner(id, username, full_name, avatar_url),
          products!inner(id, name, images),
          review_replies(
            id, content, is_official, created_at,
            user_profiles(id, username, full_name, avatar_url)
          )
        `,
        )
        .eq("id", reviewId)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return null;
        }
        throw error;
      }

      return data ? (transformReviewRow(data as ReviewRow) as Review) : null;
    } catch (error) {
      console.error("获取评价详情失败:", error);
      throw error;
    }
  }
}

// 导出单例实例
export const reviewService = new ReviewService();
export default reviewService;
