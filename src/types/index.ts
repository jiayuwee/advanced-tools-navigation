// 业务类型定义

// 工具相关类型
export interface Tool {
  id: string;
  name: string;
  description: string;
  url: string;
  icon: string;
  category_id: string; // 修改为 category_id
  tags: string[]; // 简化为字符串数组
  is_favorite?: boolean; // 修改为 is_favorite
  click_count: number; // 修改为 click_count
  is_featured: boolean; // 修改为 is_featured
  status: "active" | "inactive" | "pending";
  created_at: string; // 修改为 created_at
  updated_at: string; // 修改为 updated_at
  created_by?: string;
  meta_title?: string; // 修改为 meta_title
  meta_description?: string; // 修改为 meta_description
  sort_order: number;
  category?: Category; // 关联的分类信息（查询时包含）
}
// 评论相关类型
export interface Category {
  id: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  parent_id?: string; // 修改为 parent_id
  children?: Category[];
  count: number;
  sort_order: number; // 修改为 sort_order
  is_active: boolean; // 修改为 is_active
  created_at: string; // 修改为 created_at
  updated_at: string; // 修改为 updated_at
}

// 标签相关类型
export interface Tag {
  id: string;
  name: string;
  color: string;
  count: number;
  created_at: string; // 修改为 created_at
}

// 产品相关类型
export interface Product {
  id: string;
  name: string;
  description: string;
  short_description?: string; // 修改为 short_description
  price: number;
  original_price?: number; // 修改为 original_price
  currency: string;
  category_id: string; // 修改为 category_id
  category?: Category; // 关联的分类信息（查询时包含）
  images: string[];
  features: string[];
  demo_url?: string; // 修改为 demo_url
  download_url?: string; // 修改为 download_url
  is_featured: boolean; // 修改为 is_featured
  is_digital: boolean; // 修改为 is_digital
  stock_quantity?: number; // 修改为 stock_quantity
  status: "active" | "inactive" | "draft";
  created_at: string; // 修改为 created_at
  updated_at: string; // 修改为 updated_at
  created_by: string; // 修改为 created_by
  meta_title?: string; // 修改为 meta_title
  meta_description?: string; // 修改为 meta_description
  sort_order: number; // 修改为 sort_order
  reviews?: Review[];
  average_rating?: number; // 修改为 average_rating
  total_reviews?: number; // 修改为 total_reviews
}

// 用户资料类型
export interface UserProfile {
  id: string;
  user_id: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  website?: string;
  location?: string;
  created_at: string;
  updated_at: string;
}

// 用户相关类型
export interface User {
  id: string;
  email: string;
  username?: string;
  full_name?: string; // 修改为 full_name
  avatar_url?: string; // 修改为 avatar_url
  bio?: string;
  website?: string;
  location?: string;
  role: "user" | "admin" | "super_admin";
  is_active: boolean; // 修改为 is_active
  email_verified: boolean; // 修改为 email_verified
  created_at: string; // 修改为 created_at
  updated_at: string; // 修改为 updated_at
  last_login_at?: string; // 修改为 last_login_at
  // 添加缺失的属性
  status?: string; // 用户状态
  last_sign_in_at?: string; // 最后登录时间
  email_confirmed_at?: string; // 邮箱确认时间
  user_profiles?: UserProfile; // 用户资料
}

// 产品评论类型
export interface ProductReview {
  id: string;
  product_id: string;
  user_id: string;
  user?: User; // 关联用户信息
  rating: number;
  content: string;
  images?: string[];
  is_verified_purchase: boolean;
  helpful_count: number;
  unhelpful_count: number;
  created_at: string;
  updated_at: string;
}

// 收藏类型
export interface Favorite {
  id: string;
  user_id: string; // 修改为 user_id
  tool_id?: string; // 修改为 tool_id
  product_id?: string; // 修改为 product_id
  tool?: Tool;
  product?: Product;
  created_at: string; // 修改为 created_at
}

// 订单相关类型
export interface Order {
  id: string;
  user_id: string; // 修改为 user_id
  user?: User;
  items: OrderItem[];
  total_amount: number; // 修改为 total_amount
  currency: string;
  status: "pending" | "paid" | "cancelled" | "refunded";
  payment_method?: string; // 修改为 payment_method
  payment_id?: string; // 修改为 payment_id
  billing_address?: BillingAddress; // 修改为 billing_address
  created_at: string; // 修改为 created_at
  updated_at: string; // 修改为 updated_at
  completed_at?: string; // 修改为 completed_at
}

export interface OrderItem {
  id: string;
  order_id: string; // 修改为 order_id
  product_id: string; // 修改为 product_id
  product?: Product;
  quantity: number;
  unit_price: number; // 修改为 unit_price
  total_price: number; // 修改为 total_price
  created_at: string; // 修改为 created_at
}

export interface BillingAddress {
  full_name: string; // 修改为 full_name
  email: string;
  phone?: string;
  country: string;
  state?: string;
  city: string;
  address: string;
  postal_code: string; // 修改为 postal_code
}

// 评价类型
export interface Review {
  id: string;
  user_id: string; // 修改为 user_id
  user?: User;
  product_id: string; // 修改为 product_id
  product?: Product;
  rating: number;
  title: string;
  content: string;
  is_verified_purchase: boolean; // 修改为 is_verified_purchase
  created_at: string; // 修改为 created_at
  updated_at: string; // 修改为 updated_at
}

// 支付相关类型
export interface PaymentMethod {
  id: string;
  name: string;
  type: "alipay" | "wechat" | "stripe" | "paypal";
  icon: string;
  is_enabled: boolean; // 修改为 is_enabled
  config: Record<string, unknown>;
}

export interface PaymentResult {
  success: boolean;
  payment_id?: string; // 修改为 payment_id
  order_id: string; // 修改为 order_id
  amount: number;
  currency: string;
  method: string;
  message?: string;
  redirect_url?: string; // 修改为 redirect_url
}

// 搜索相关类型
export interface SearchFilters {
  query?: string;
  category?: string;
  tags?: string[];
  priceRange?: [number, number];
  rating?: number;
  sortBy?: "name" | "price" | "rating" | "created_at" | "click_count";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface SearchResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// 统计相关类型
export interface Analytics {
  id: string;
  event_type:
    | "tool_click"
    | "product_view"
    | "product_purchase"
    | "user_register"; // 修改为 event_type
  entity_id?: string; // 修改为 entity_id
  user_id?: string; // 修改为 user_id
  event_data?: Record<string, unknown>; // 修改为 event_data 和 unknown
  created_at: string; // 修改为 created_at
}

export interface DashboardStats {
  totalTools: number;
  totalProducts: number;
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  monthlyRevenue: number;
  popularTools: Tool[];
  popularProducts: Product[];
  recentOrders: Order[];
  userGrowth: Array<{ date: string; count: number }>;
  revenueGrowth: Array<{ date: string; amount: number }>;
}

// API 响应类型
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// 表单相关类型
export interface LoginForm {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegisterForm {
  email: string;
  password: string;
  confirm_password: string; // 修改为 confirm_password
  full_name?: string; // 修改为 full_name
  username?: string;
  agree_to_terms: boolean; // 修改为 agree_to_terms
}

export interface ProfileForm {
  full_name?: string; // 修改为 full_name
  username?: string;
  bio?: string;
  website?: string;
  location?: string;
  avatar?: File;
}

export interface ToolForm {
  name: string;
  description: string;
  url: string;
  category_id: string; // 修改为 category_id
  tags: string[];
  icon?: File;
  is_featured?: boolean; // 修改为 is_featured
  meta_title?: string; // 修改为 meta_title
  meta_description?: string; // 修改为 meta_description
}

export interface ProductForm {
  name: string;
  description: string;
  short_description?: string; // 修改为 short_description
  price: number;
  original_price?: number; // 修改为 original_price
  category_id: string; // 修改为 category_id
  features: string[];
  images?: File[];
  demo_url?: string; // 修改为 demo_url
  download_url?: string; // 修改为 download_url
  is_featured?: boolean; // 修改为 is_featured
  is_digital?: boolean; // 修改为 is_digital
  stock_quantity?: number; // 修改为 stock_quantity
  meta_title?: string; // 修改为 meta_title
  meta_description?: string; // 修改为 meta_description
}

// 简单通知类型（用于UI提示）
export interface SimpleNotification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
  duration?: number;
  actions?: Array<{
    label: string;
    action: () => void;
  }>;
}

// 主题类型
export interface Theme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    warning: string;
    success: string;
    info: string;
  };
  fonts: {
    primary: string;
    secondary: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

// 应用配置类型
export interface AppConfig {
  name: string;
  description: string;
  version: string;
  author: string;
  website: string;
  contact: {
    email: string;
    phone?: string;
    address?: string;
  };
  social: {
    github?: string;
    twitter?: string;
    linkedin?: string;
    wechat?: string;
  };
  features: {
    userRegistration: boolean;
    productSales: boolean;
    reviews: boolean;
    analytics: boolean;
    multiLanguage: boolean;
  };
  seo: {
    title: string;
    description: string;
    keywords: string[];
    ogImage?: string;
  };
  payment: {
    currency: string;
    methods: PaymentMethod[];
  };
}
