import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { searchService } from "@/services/searchService";
import { reviewService } from "@/services/reviewService";
import { notificationService } from "@/services/notificationService";
import { performanceService } from "@/services/performanceService";
import { databaseService } from "@/services/databaseService";

// Mock Supabase with proper chaining support
const createChainableMock = () => {
  const chainable = {
    eq: vi.fn(() => chainable),
    or: vi.fn(() => chainable),
    order: vi.fn(() => chainable),
    limit: vi.fn(() => chainable),
    range: vi.fn(() => Promise.resolve({ data: [], error: null, count: 0 })),
    single: vi.fn(() => Promise.resolve({ data: null, error: null })),
    maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })),
    then: vi.fn((resolve) => resolve({ data: [], error: null, count: 0 })),
  };
  return chainable;
};

vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => createChainableMock()),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() =>
            Promise.resolve({ data: { id: "test-id" }, error: null }),
          ),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: {}, error: null })),
          })),
        })),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null })),
        lt: vi.fn(() => Promise.resolve({ error: null })),
      })),
    })),
    rpc: vi.fn(() => Promise.resolve({ data: null, error: null })),
    channel: vi.fn(() => ({
      on: vi.fn(() => ({
        subscribe: vi.fn(),
      })),
      send: vi.fn(),
    })),
    removeChannel: vi.fn(),
  },
  TABLES: {
    TOOLS: "tools",
    PRODUCTS: "products",
    CATEGORIES: "categories",
    PRODUCT_REVIEWS: "product_reviews",
  },
}));

describe("服务集成测试", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("搜索服务 (SearchService)", () => {
    it("应该能够执行基本搜索", async () => {
      const searchOptions = {
        query: "test",
        type: "all" as const,
        limit: 10,
      };

      const result = await searchService.search(searchOptions);

      expect(result).toHaveProperty("items");
      expect(result).toHaveProperty("total");
      expect(result).toHaveProperty("query", "test");
      expect(result).toHaveProperty("suggestions");
      expect(result).toHaveProperty("facets");
      expect(result).toHaveProperty("searchTime");
      expect(Array.isArray(result.items)).toBe(true);
      expect(typeof result.total).toBe("number");
      expect(typeof result.searchTime).toBe("number");
    });

    it("应该能够生成搜索建议", async () => {
      const suggestions = await searchService.getSmartSuggestions("test");

      expect(Array.isArray(suggestions)).toBe(true);
      expect(suggestions.length).toBeLessThanOrEqual(10);
    });

    it("应该能够获取热门搜索", async () => {
      const popular = await searchService.getPopularSearches(5);

      expect(Array.isArray(popular)).toBe(true);
      expect(popular.length).toBeLessThanOrEqual(5);
    });

    it("应该能够管理搜索历史", () => {
      const history = searchService.getSearchHistory(10);
      expect(Array.isArray(history)).toBe(true);

      searchService.clearSearchHistory();
      const clearedHistory = searchService.getSearchHistory(10);
      expect(clearedHistory.length).toBe(0);
    });
  });

  describe("评价服务 (ReviewService)", () => {
    const mockUserId = "user-123";
    const mockProductId = "product-123";

    it("应该能够获取产品评价", async () => {
      const result = await reviewService.getProductReviews(mockProductId);

      expect(result).toHaveProperty("reviews");
      expect(result).toHaveProperty("total");
      expect(result).toHaveProperty("stats");
      expect(Array.isArray(result.reviews)).toBe(true);
      expect(typeof result.total).toBe("number");
      expect(result.stats).toHaveProperty("total_reviews");
      expect(result.stats).toHaveProperty("average_rating");
      expect(result.stats).toHaveProperty("rating_distribution");
    });

    it("应该能够创建评价", async () => {
      const reviewData = {
        product_id: mockProductId,
        rating: 5,
        title: "测试评价",
        content: "这是一个测试评价",
        pros: ["优点1", "优点2"],
        cons: ["缺点1"],
      };

      const result = await reviewService.createReview(reviewData, mockUserId);

      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("rating", 5);
      expect(result).toHaveProperty("title", "测试评价");
    });

    it("应该能够获取评价统计", async () => {
      const stats = await reviewService.getProductReviewStats(mockProductId);

      expect(stats).toHaveProperty("total_reviews");
      expect(stats).toHaveProperty("average_rating");
      expect(stats).toHaveProperty("rating_distribution");
      expect(stats).toHaveProperty("verified_purchase_percentage");
      expect(stats).toHaveProperty("recent_reviews_count");
      expect(typeof stats.total_reviews).toBe("number");
      expect(typeof stats.average_rating).toBe("number");
    });
  });

  describe("通知服务 (NotificationService)", () => {
    const mockUserId = "user-123";

    it("应该能够获取用户通知", async () => {
      const result = await notificationService.getUserNotifications(mockUserId);

      expect(result).toHaveProperty("notifications");
      expect(result).toHaveProperty("total");
      expect(result).toHaveProperty("stats");
      expect(Array.isArray(result.notifications)).toBe(true);
      expect(typeof result.total).toBe("number");
    });

    it("应该能够创建通知", async () => {
      const notificationData = {
        user_id: mockUserId,
        type: "info" as const,
        title: "测试通知",
        message: "这是一个测试通知",
      };

      const result =
        await notificationService.createNotification(notificationData);

      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("title", "测试通知");
      expect(result).toHaveProperty("type", "info");
    });

    it("应该能够获取通知统计", async () => {
      const stats = await notificationService.getNotificationStats(mockUserId);

      expect(stats).toHaveProperty("total");
      expect(stats).toHaveProperty("unread");
      expect(stats).toHaveProperty("important");
      expect(stats).toHaveProperty("by_type");
      expect(typeof stats.total).toBe("number");
      expect(typeof stats.unread).toBe("number");
    });

    it("应该能够管理通知偏好", async () => {
      const preferences =
        await notificationService.getUserPreferences(mockUserId);

      expect(preferences).toHaveProperty("email_notifications");
      expect(preferences).toHaveProperty("push_notifications");
      expect(preferences).toHaveProperty("notification_frequency");
    });
  });

  describe("性能监控服务 (PerformanceService)", () => {
    it("应该能够跟踪性能指标", () => {
      expect(() => {
        performanceService.trackMetric("page_load", "test_page", 1000, "ms");
      }).not.toThrow();

      expect(() => {
        performanceService.trackCustomMetric("custom_metric", 500, "ms");
      }).not.toThrow();

      expect(() => {
        performanceService.trackAPICall("/api/test", "GET", 200, 200, 1024);
      }).not.toThrow();

      expect(() => {
        performanceService.trackUserAction("click", "button", 100);
      }).not.toThrow();
    });

    it("应该能够跟踪错误", () => {
      const errorInfo = {
        message: "Test error",
        stack: "Error stack trace",
        filename: "test.js",
        lineno: 10,
        colno: 5,
        userAgent: "Test User Agent",
        url: "http://test.com",
      };

      expect(() => {
        performanceService.trackError(errorInfo);
      }).not.toThrow();
    });

    it("应该能够设置用户ID", () => {
      expect(() => {
        performanceService.setUserId("user-123");
      }).not.toThrow();
    });

    it("应该能够启用/禁用监控", () => {
      expect(() => {
        performanceService.setEnabled(false);
        performanceService.setEnabled(true);
      }).not.toThrow();
    });
  });

  describe("数据库服务 (DatabaseService)", () => {
    const mockTable = "test_table";

    it("应该能够执行查询", async () => {
      const options = {
        page: 1,
        limit: 10,
        sortBy: "created_at",
        sortOrder: "desc" as const,
      };

      const result = await databaseService.query(mockTable, options);

      expect(result).toHaveProperty("data");
      expect(result).toHaveProperty("count");
      expect(result).toHaveProperty("page", 1);
      expect(result).toHaveProperty("limit", 10);
      expect(result).toHaveProperty("totalPages");
      expect(result).toHaveProperty("hasMore");
      expect(Array.isArray(result.data)).toBe(true);
    });

    it("应该能够创建记录", async () => {
      const data = { name: "Test Record", value: 123 };

      const result = await databaseService.create(mockTable, data);

      expect(result).toBeDefined();
    });

    it("应该能够更新记录", async () => {
      const id = "record-123";
      const data = { name: "Updated Record" };

      const result = await databaseService.update(mockTable, id, data);

      expect(result).toBeDefined();
    });

    it("应该能够删除记录", async () => {
      const id = "record-123";

      await expect(
        databaseService.delete(mockTable, id),
      ).resolves.not.toThrow();
    });

    it("应该能够执行批量操作", async () => {
      const data = [
        { name: "Record 1", value: 1 },
        { name: "Record 2", value: 2 },
      ];

      const result = await databaseService.batchCreate(mockTable, data);

      expect(Array.isArray(result)).toBe(true);
    });

    it("应该能够获取健康状态", async () => {
      const health = await databaseService.healthCheck();

      expect(health).toHaveProperty("status");
      expect(health).toHaveProperty("latency");
      expect(["healthy", "unhealthy"]).toContain(health.status);
      expect(typeof health.latency).toBe("number");
    });

    it("应该能够管理缓存", () => {
      expect(() => {
        databaseService.clearAllCache();
      }).not.toThrow();

      const stats = databaseService.getCacheStats();
      expect(stats).toHaveProperty("size");
      expect(stats).toHaveProperty("keys");
      expect(typeof stats.size).toBe("number");
      expect(Array.isArray(stats.keys)).toBe(true);
    });
  });

  describe("服务间集成", () => {
    it("搜索服务应该能够与数据库服务协同工作", async () => {
      const searchOptions = {
        query: "integration test",
        type: "tools" as const,
      };

      const result = await searchService.search(searchOptions);

      expect(result).toHaveProperty("items");
      expect(result).toHaveProperty("facets");
      expect(result.facets).toHaveProperty("categories");
      expect(result.facets).toHaveProperty("tags");
    });

    it("通知服务应该能够与性能监控协同工作", async () => {
      const startTime = Date.now();

      const notificationData = {
        user_id: "user-123",
        type: "system" as const,
        title: "性能测试通知",
        message: "测试通知与性能监控的集成",
      };

      await notificationService.createNotification(notificationData);

      const endTime = Date.now();
      const duration = endTime - startTime;

      performanceService.trackMetric(
        "notification",
        "create_notification",
        duration,
        "ms",
      );

      expect(duration).toBeGreaterThan(0);
    });

    it("评价服务应该能够触发通知", async () => {
      const reviewData = {
        product_id: "product-123",
        rating: 5,
        title: "集成测试评价",
        content: "测试评价与通知的集成",
      };

      const review = await reviewService.createReview(reviewData, "user-123");

      // 模拟评价创建后的通知
      const notificationData = {
        user_id: "product-owner-123",
        type: "product" as const,
        title: "新评价通知",
        message: `您的产品收到了新的评价: ${review.title}`,
      };

      const notification =
        await notificationService.createNotification(notificationData);

      expect(review).toHaveProperty("id");
      expect(notification).toHaveProperty("id");
    });
  });
});
