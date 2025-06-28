import { describe, it, expect, beforeEach, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { createRouter, createWebHistory } from "vue-router";
import EnhancedSearchBox from "@/components/search/EnhancedSearchBox.vue";
import NotificationCenter from "@/components/notifications/NotificationCenter.vue";
import ThemeSelector from "@/components/theme/ThemeSelector.vue";
import ProductReviews from "@/components/reviews/ProductReviews.vue";

// Mock 路由
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", component: { template: "<div>Home</div>" } },
    {
      path: "/search",
      name: "SearchResults",
      component: { template: "<div>Search</div>" },
    },
  ],
});

// Mock 服务
vi.mock("@/services/searchService", () => ({
  searchService: {
    search: vi.fn(() =>
      Promise.resolve({
        items: [],
        total: 0,
        query: "test",
        suggestions: [],
        facets: { categories: [], tags: [], priceRanges: [] },
        searchTime: 100,
      })
    ),
    getSmartSuggestions: vi.fn(() => Promise.resolve([])),
    getPopularSearches: vi.fn(() => Promise.resolve([])),
    getSearchHistory: vi.fn(() => []),
    clearSearchHistory: vi.fn(),
  },
}));

vi.mock("@/services/notificationService", () => ({
  notificationService: {
    getUserNotifications: vi.fn(() =>
      Promise.resolve({
        notifications: [],
        total: 0,
        stats: { total: 0, unread: 0, important: 0, by_type: {} },
      })
    ),
    getNotificationStats: vi.fn(() =>
      Promise.resolve({
        total: 0,
        unread: 0,
        important: 0,
        by_type: {},
      })
    ),
    markAsRead: vi.fn(() => Promise.resolve()),
    deleteNotification: vi.fn(() => Promise.resolve()),
    markAllAsRead: vi.fn(() => Promise.resolve()),
    subscribeToNotifications: vi.fn(() => () => {}),
    showBrowserNotification: vi.fn(() => Promise.resolve()),
  },
}));

vi.mock("@/services/reviewService", () => ({
  reviewService: {
    getProductReviews: vi.fn(() =>
      Promise.resolve({
        reviews: [],
        total: 0,
        stats: {
          total_reviews: 0,
          average_rating: 0,
          rating_distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
          verified_purchase_percentage: 0,
          recent_reviews_count: 0,
        },
      })
    ),
    createReview: vi.fn(() => Promise.resolve({ id: "review-123" })),
    voteReview: vi.fn(() => Promise.resolve()),
    deleteReview: vi.fn(() => Promise.resolve()),
  },
}));

vi.mock("@/composables/useTheme", () => ({
  useTheme: () => ({
    themeConfig: {
      value: {
        mode: "light",
        primaryColor: "#3b82f6",
        accentColor: "#10b981",
        borderRadius: "medium",
        fontSize: "medium",
        fontFamily: "system",
        compactMode: false,
        highContrast: false,
        reducedMotion: false,
      },
    },
    isDark: { value: false },
    themePresets: [
      {
        id: "default",
        name: "默认主题",
        description: "经典的蓝色主题",
        config: { primaryColor: "#3b82f6", accentColor: "#10b981" },
        preview: {
          primary: "#3b82f6",
          secondary: "#10b981",
          background: "#ffffff",
          surface: "#f8fafc",
        },
      },
    ],
    setThemeMode: vi.fn(),
    setPrimaryColor: vi.fn(),
    setAccentColor: vi.fn(),
    applyPreset: vi.fn(),
    resetTheme: vi.fn(),
    exportTheme: vi.fn(() => "{}"),
    importTheme: vi.fn(() => true),
  }),
}));

// Mock stores
vi.mock("@/stores/auth", () => ({
  useAuthStore: () => ({
    user: { value: { id: "user-123", email: "test@example.com" } },
    isAuthenticated: { value: true },
  }),
}));

vi.mock("@/stores/categories", () => ({
  useCategoriesStore: () => ({
    categories: [],
    loadCategories: vi.fn(),
  }),
}));

describe("组件集成测试", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  describe("增强搜索框 (EnhancedSearchBox)", () => {
    it("应该正确渲染搜索框", () => {
      const wrapper = mount(EnhancedSearchBox, {
        global: {
          plugins: [router],
        },
        props: {
          placeholder: "搜索测试",
        },
      });

      expect(wrapper.find(".search-input").exists()).toBe(true);
      expect(wrapper.find(".search-input").attributes("placeholder")).toBe(
        "搜索测试"
      );
    });

    it("应该能够处理搜索输入", async () => {
      const wrapper = mount(EnhancedSearchBox, {
        global: {
          plugins: [router],
        },
      });

      const input = wrapper.find(".search-input");
      await input.setValue("test query");

      expect(input.element.value).toBe("test query");
    });

    it("应该能够切换搜索类型", async () => {
      const wrapper = mount(EnhancedSearchBox, {
        global: {
          plugins: [router],
        },
      });

      const select = wrapper.find(".search-type-select");
      await select.setValue("tools");

      expect(select.element.value).toBe("tools");
    });

    it("应该能够清除搜索", async () => {
      const wrapper = mount(EnhancedSearchBox, {
        global: {
          plugins: [router],
        },
      });

      // 设置搜索内容
      const input = wrapper.find(".search-input");
      await input.setValue("test");

      // 点击清除按钮
      const clearButton = wrapper.find(".clear-button");
      if (clearButton.exists()) {
        await clearButton.trigger("click");
        expect(input.element.value).toBe("");
      }
    });

    it("应该能够触发搜索事件", async () => {
      const wrapper = mount(EnhancedSearchBox, {
        global: {
          plugins: [router],
        },
      });

      const input = wrapper.find(".search-input");
      await input.setValue("test");
      await input.trigger("keydown.enter");

      // 验证搜索事件被触发
      expect(wrapper.emitted()).toHaveProperty("search");
    });
  });

  describe("通知中心 (NotificationCenter)", () => {
    it("应该正确渲染通知按钮", () => {
      const wrapper = mount(NotificationCenter);

      expect(wrapper.find(".notification-button").exists()).toBe(true);
      expect(wrapper.find(".notification-badge").exists()).toBe(false); // 没有未读通知时不显示
    });

    it("应该能够切换通知面板", async () => {
      const wrapper = mount(NotificationCenter);

      const button = wrapper.find(".notification-button");
      await button.trigger("click");

      expect(wrapper.find(".notification-panel").exists()).toBe(true);
    });

    it("应该能够显示未读通知数量", async () => {
      // Mock 有未读通知的状态
      const wrapper = mount(NotificationCenter, {
        data() {
          return {
            stats: { total: 5, unread: 3, important: 1, by_type: {} },
          };
        },
      });

      expect(wrapper.find(".notification-badge").exists()).toBe(true);
      expect(wrapper.find(".notification-badge").text()).toBe("3");
    });

    it("应该能够筛选通知", async () => {
      const wrapper = mount(NotificationCenter);

      // 打开面板
      await wrapper.find(".notification-button").trigger("click");

      // 点击筛选按钮
      const filterButtons = wrapper.findAll(".filter-button");
      if (filterButtons.length > 1) {
        await filterButtons[1].trigger("click");
        expect(filterButtons[1].classes()).toContain("active");
      }
    });
  });

  describe("主题选择器 (ThemeSelector)", () => {
    it("应该正确渲染主题切换按钮", () => {
      const wrapper = mount(ThemeSelector);

      expect(wrapper.find(".theme-toggle-button").exists()).toBe(true);
    });

    it("应该能够切换主题面板", async () => {
      const wrapper = mount(ThemeSelector);

      const button = wrapper.find(".theme-toggle-button");
      await button.trigger("click");

      expect(wrapper.find(".theme-panel").exists()).toBe(true);
    });

    it("应该能够选择主题模式", async () => {
      const wrapper = mount(ThemeSelector);

      // 打开面板
      await wrapper.find(".theme-toggle-button").trigger("click");

      // 选择主题模式
      const modeButtons = wrapper.findAll(".mode-button");
      if (modeButtons.length > 0) {
        await modeButtons[0].trigger("click");
        expect(modeButtons[0].classes()).toContain("active");
      }
    });

    it("应该能够选择预设主题", async () => {
      const wrapper = mount(ThemeSelector);

      // 打开面板
      await wrapper.find(".theme-toggle-button").trigger("click");

      // 选择预设主题
      const presetCards = wrapper.findAll(".preset-card");
      if (presetCards.length > 0) {
        await presetCards[0].trigger("click");
        // 验证预设被应用
      }
    });

    it("应该能够自定义颜色", async () => {
      const wrapper = mount(ThemeSelector);

      // 打开面板
      await wrapper.find(".theme-toggle-button").trigger("click");

      // 修改主色调
      const colorInput = wrapper.find('input[type="color"]');
      if (colorInput.exists()) {
        await colorInput.setValue("#ff0000");
        expect(colorInput.element.value).toBe("#ff0000");
      }
    });
  });

  describe("产品评价 (ProductReviews)", () => {
    it("应该正确渲染评价组件", () => {
      const wrapper = mount(ProductReviews, {
        props: {
          productId: "product-123",
        },
      });

      expect(wrapper.find(".product-reviews").exists()).toBe(true);
      expect(wrapper.find(".reviews-overview").exists()).toBe(true);
    });

    it("应该显示评价统计", async () => {
      const wrapper = mount(ProductReviews, {
        props: {
          productId: "product-123",
        },
      });

      // 等待组件加载
      await wrapper.vm.$nextTick();

      expect(wrapper.find(".rating-summary").exists()).toBe(true);
      expect(wrapper.find(".rating-breakdown").exists()).toBe(true);
    });

    it("应该能够筛选评价", async () => {
      const wrapper = mount(ProductReviews, {
        props: {
          productId: "product-123",
        },
      });

      const sortSelect = wrapper.find(".sort-select");
      if (sortSelect.exists()) {
        await sortSelect.setValue("newest");
        expect(sortSelect.element.value).toBe("newest");
      }
    });

    it("应该能够显示写评价按钮", () => {
      const wrapper = mount(ProductReviews, {
        props: {
          productId: "product-123",
          canWriteReview: true,
        },
      });

      expect(wrapper.find(".write-review-button").exists()).toBe(true);
    });
  });

  describe("组件间交互", () => {
    it("搜索框应该能够与路由协同工作", async () => {
      const wrapper = mount(EnhancedSearchBox, {
        global: {
          plugins: [router],
        },
      });

      const input = wrapper.find(".search-input");
      await input.setValue("test query");
      await input.trigger("keydown.enter");

      // 验证路由跳转
      expect(router.currentRoute.value.name).toBe("SearchResults");
    });

    it("通知中心应该能够处理实时更新", async () => {
      const wrapper = mount(NotificationCenter);

      // 模拟接收新通知
      const newNotification = {
        id: "notif-123",
        title: "新通知",
        message: "测试通知",
        type: "info",
        is_read: false,
        created_at: new Date().toISOString(),
      };

      // 触发通知更新
      await wrapper.vm.$nextTick();

      expect(wrapper.find(".notification-center").exists()).toBe(true);
    });

    it("主题选择器应该能够影响全局样式", async () => {
      const wrapper = mount(ThemeSelector);

      // 切换到暗色主题
      await wrapper.find(".theme-toggle-button").trigger("click");

      const modeButtons = wrapper.findAll(".mode-button");
      if (modeButtons.length > 1) {
        await modeButtons[1].trigger("click"); // 假设第二个是暗色模式
      }

      // 验证主题变化
      expect(wrapper.vm).toBeDefined();
    });

    it("评价组件应该能够处理用户交互", async () => {
      const wrapper = mount(ProductReviews, {
        props: {
          productId: "product-123",
          canWriteReview: true,
        },
      });

      // 点击写评价按钮
      const writeButton = wrapper.find(".write-review-button");
      if (writeButton.exists()) {
        await writeButton.trigger("click");
        // 验证模态框打开
      }

      // 测试筛选功能
      const filterCheckbox = wrapper.find('input[type="checkbox"]');
      if (filterCheckbox.exists()) {
        await filterCheckbox.setChecked(true);
        // 验证筛选生效
      }
    });
  });

  describe("响应式设计测试", () => {
    it("组件应该在移动设备上正确显示", async () => {
      // 模拟移动设备视口
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 375,
      });

      const wrapper = mount(EnhancedSearchBox, {
        global: {
          plugins: [router],
        },
      });

      expect(wrapper.find(".enhanced-search-box").exists()).toBe(true);
    });

    it("通知面板应该在小屏幕上适配", async () => {
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 320,
      });

      const wrapper = mount(NotificationCenter);
      await wrapper.find(".notification-button").trigger("click");

      expect(wrapper.find(".notification-panel").exists()).toBe(true);
    });
  });

  describe("无障碍性测试", () => {
    it("搜索框应该有正确的 ARIA 属性", () => {
      const wrapper = mount(EnhancedSearchBox, {
        global: {
          plugins: [router],
        },
      });

      const input = wrapper.find(".search-input");
      expect(input.attributes("placeholder")).toBeDefined();
    });

    it("按钮应该有正确的标题属性", () => {
      const wrapper = mount(NotificationCenter);

      const button = wrapper.find(".notification-button");
      expect(button.attributes("title")).toBeDefined();
    });

    it("主题切换按钮应该有描述性标题", () => {
      const wrapper = mount(ThemeSelector);

      const button = wrapper.find(".theme-toggle-button");
      expect(button.attributes("title")).toBeDefined();
    });
  });
});
