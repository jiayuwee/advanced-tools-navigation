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
    component: () => import("../views/EnhancedHomeView.vue"),
    meta: {
      title: "工具导航站",
      description: "高效的工具导航和产品展示平台",
    },
  },
  {
    path: "/legacy",
    name: "LegacyHome",
    component: () => import("../views/HomeView.vue"),
    meta: {
      title: "传统版工具导航站",
      description: "传统版本的工具导航和产品展示平台",
    },
  },
  {
    path: "/comparison",
    name: "Comparison",
    component: () => import("../views/ComparisonView.vue"),
    meta: {
      title: "代码优化对比",
      description: "展示原HTML代码与Vue组件化改造后的效果对比",
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
    path: "/products",
    name: "Products",
    component: () => import("../views/ProductsView.vue"),
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
        component: () => import("../views/admin/ProductsManageView.vue"),
        meta: {
          title: "产品管理",
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
        path: "local-test",
        name: "AdminLocalTest",
        component: () => import("../views/admin/LocalManagementTestView.vue"),
        meta: {
          title: "本地管理测试",
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
