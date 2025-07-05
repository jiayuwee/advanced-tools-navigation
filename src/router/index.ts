import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from "vue-router";

// 路由配置
const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "Home",
    component: () => import("../views/HomeView.vue"),
    meta: {
      title: "高效工具导航站",
      description: "现代化设计的工具导航平台",
    },
  },

  {
    path: "/search",
    name: "SearchResults",
    component: () => import("../views/SearchResultsView.vue"),
    meta: {
      title: "搜索结果",
      description: "搜索工具和产品",
    },
  },

  // 帮助支持相关页面
  {
    path: "/help",
    name: "HelpSupport",
    component: () => import("../views/HelpSupportView.vue"),
    meta: {
      title: "帮助支持",
      description: "获取使用帮助和技术支持",
    },
  },
  {
    path: "/faq",
    name: "FAQ",
    component: () => import("../views/FAQView.vue"),
    meta: {
      title: "常见问题",
      description: "查看常见问题解答",
    },
  },
  {
    path: "/user-guide",
    name: "UserGuide",
    component: () => import("../views/UserGuideView.vue"),
    meta: {
      title: "使用指南",
      description: "详细的使用说明和操作指南",
    },
  },
  {
    path: "/guide",
    redirect: "/user-guide",
  },
  {
    path: "/feedback",
    name: "Feedback",
    component: () => import("../views/FeedbackView.vue"),
    meta: {
      title: "意见反馈",
      description: "提交您的意见和建议",
    },
  },
  {
    path: "/contact",
    name: "Contact",
    component: () => import("../views/ContactView.vue"),
    meta: {
      title: "联系我们",
      description: "多种方式联系我们获取帮助",
    },
  },
  {
    path: "/terms",
    name: "TermsOfService",
    component: () => import("../views/TermsOfServiceView.vue"),
    meta: {
      title: "服务条款",
      description: "网站服务条款和使用协议",
    },
  },
  {
    path: "/upload-product",
    name: "ProductUpload",
    component: () => import("../views/ProductUploadView.vue"),
    meta: {
      title: "产品上传",
      description: "上传您的产品到平台",
      requiresAuth: true,
    },
  },
  {
    path: "/tools",
    name: "Tools",
    component: () => import("../views/ToolsView.vue"),
    meta: {
      title: "工具导航",
      description: "发现和管理您的常用工具",
    },
  },
  {
    path: "/tools/:id",
    name: "ToolDetail",
    component: () => import("../views/ToolDetailView.vue"),
    meta: {
      title: "工具详情",
      description: "查看工具详细信息和使用教程",
    },
  },
  {
    path: "/products",
    name: "Products",
    component: () => import("@/views/ProductsView.vue"),
    meta: {
      title: "产品展示",
      description: "浏览和购买优质产品",
    },
  },
  {
    path: "/product/:id",
    name: "ProductDetail",
    component: () => import("../views/ProductDetailView.vue"),
    meta: {
      title: "产品详情",
      description: "查看产品详细信息",
    },
  },
  {
    path: "/user",
    name: "User",
    component: () => import("../views/UserView.vue"),
    meta: {
      title: "个人中心",
      description: "管理您的账户和偏好设置",
      requiresAuth: true,
    },
    children: [
      {
        path: "profile",
        name: "UserProfile",
        component: () => import("../views/user/ProfileView.vue"),
        meta: {
          title: "个人资料",
          requiresAuth: true,
        },
      },
      {
        path: "favorites",
        name: "UserFavorites",
        component: () => import("../views/user/FavoritesView.vue"),
        meta: {
          title: "我的收藏",
          requiresAuth: true,
        },
      },
      {
        path: "orders",
        name: "UserOrders",
        component: () => import("../views/user/OrdersView.vue"),
        meta: {
          title: "我的订单",
          requiresAuth: true,
        },
      },
    ],
  },
  {
    path: "/auth",
    name: "Auth",
    component: () => import("../views/AuthView.vue"),
    meta: {
      title: "登录注册",
      description: "登录或注册您的账户",
    },
    children: [
      {
        path: "login",
        name: "Login",
        component: () => import("../views/auth/LoginView.vue"),
        meta: {
          title: "登录",
        },
      },
      {
        path: "register",
        name: "Register",
        component: () => import("../views/auth/RegisterView.vue"),
        meta: {
          title: "注册",
        },
      },
      {
        path: "forgot-password",
        name: "ForgotPassword",
        component: () => import("../views/auth/ForgotPasswordView.vue"),
        meta: {
          title: "忘记密码",
        },
      },
    ],
  },
  {
    path: "/admin",
    name: "Admin",
    component: () => import("../views/AdminView.vue"),
    meta: {
      title: "管理后台",
      description: "系统管理和数据统计",
      requiresAuth: true,
      requiresAdmin: true,
    },
    children: [
      {
        path: "",
        redirect: "/admin/dashboard",
      },
      {
        path: "dashboard",
        name: "AdminDashboard",
        component: () => import("../views/admin/DashboardView.vue"),
        meta: {
          title: "仪表盘",
          requiresAuth: true,
          requiresAdmin: true,
        },
      },
      {
        path: "tools",
        name: "AdminTools",
        component: () => import("../views/AdminToolsView.vue"),
        meta: {
          title: "工具管理",
          requiresAuth: true,
          requiresAdmin: true,
        },
      },
      {
        path: "products",
        name: "AdminProducts",
        component: () => import("../views/admin/ProductManagementView.vue"),
        meta: {
          title: "产品管理",
          requiresAuth: true,
          requiresAdmin: true,
        },
      },
      {
        path: "users",
        name: "AdminUsers",
        component: () => import("../views/admin/UserManagementView.vue"),
        meta: {
          title: "用户管理",
          requiresAuth: true,
          requiresAdmin: true,
        },
      },
      {
        path: "orders",
        name: "AdminOrders",
        component: () => import("../views/admin/OrderManagementView.vue"),
        meta: {
          title: "订单管理",
          requiresAuth: true,
          requiresAdmin: true,
        },
      },
      {
        path: "local",
        name: "AdminLocal",
        component: () => import("../views/admin/LocalManagementView.vue"),
        meta: {
          title: "本地管理",
          requiresAuth: true,
          requiresAdmin: true,
        },
      },
      {
        path: "settings",
        name: "AdminSettings",
        component: () => import("../views/admin/SettingsView.vue"),
        meta: {
          title: "系统设置",
          requiresAuth: true,
          requiresAdmin: true,
        },
      },
    ],
  },
  {
    path: "/payment",
    name: "Payment",
    component: () => import("../views/PaymentView.vue"),
    meta: {
      title: "支付页面",
      description: "安全的支付处理",
      requiresAuth: true,
    },
  },
  {
    path: "/payment/success",
    name: "PaymentSuccess",
    component: () => import("../views/PaymentSuccessView.vue"),
    meta: {
      title: "支付成功",
      description: "支付完成确认",
    },
  },
  {
    path: "/payment/cancel",
    name: "PaymentCancel",
    component: () => import("../views/PaymentCancelView.vue"),
    meta: {
      title: "支付取消",
      description: "支付已取消",
    },
  },
  {
    path: "/settings",
    name: "SimpleSettings",
    component: () => import("../views/SimpleSettingsView.vue"),
    meta: {
      title: "网站设置",
      description: "更新网站内容和配置",
    },
  },
  {
    path: "/test-settings",
    name: "TestSettings",
    component: () => import("../views/TestSettingsView.vue"),
    meta: {
      title: "测试设置",
      description: "测试设置页面",
    },
  },

  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("../views/NotFoundView.vue"),
    meta: {
      title: "页面未找到",
      description: "您访问的页面不存在",
    },
  },
  // 开发者工具路由已移除 - 文件不存在
];

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes,
});

export { router, routes };
