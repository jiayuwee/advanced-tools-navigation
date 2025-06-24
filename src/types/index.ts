// 业务类型定义

// 工具相关类型
export interface Tool {
  id: string
  name: string
  description: string
  url: string
  icon?: string
  category: Category
  tags: Tag[]
  isFavorite: boolean
  clickCount: number
  isFeature: boolean
  status: 'active' | 'inactive' | 'pending'
  createdAt: string
  updatedAt: string
  createdBy?: string
  metaTitle?: string
  metaDescription?: string
  sortOrder: number
}

// 分类相关类型
export interface Category {
  id: string
  name: string
  description?: string
  icon: string
  color: string
  parentId?: string
  children?: Category[]
  count: number
  sortOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// 标签相关类型
export interface Tag {
  id: string
  name: string
  color: string
  count: number
  createdAt: string
}

// 产品相关类型
export interface Product {
  id: string
  name: string
  description: string
  shortDescription?: string
  price: number
  originalPrice?: number
  currency: string
  category: Category // 使用统一的 Category 类型
  images: string[]
  features: string[]
  demoUrl?: string
  downloadUrl?: string
  isFeatured: boolean
  isDigital: boolean
  stockQuantity?: number
  status: 'active' | 'inactive' | 'draft'
  createdAt: string
  updatedAt: string
  createdBy: string
  metaTitle?: string
  metaDescription?: string
  sortOrder: number
  reviews?: Review[]
  averageRating?: number
  totalReviews?: number
}

// 用户相关类型
export interface User {
  id: string
  email: string
  username?: string
  fullName?: string
  avatarUrl?: string
  bio?: string
  website?: string
  location?: string
  role: 'user' | 'admin' | 'super_admin'
  isActive: boolean
  emailVerified: boolean
  createdAt: string
  updatedAt: string
  lastLoginAt?: string
}

// 收藏类型
export interface Favorite {
  id: string
  userId: string
  toolId?: string
  productId?: string
  tool?: Tool
  product?: Product
  createdAt: string
}

// 订单相关类型
export interface Order {
  id: string
  userId: string
  user?: User
  items: OrderItem[]
  totalAmount: number
  currency: string
  status: 'pending' | 'paid' | 'cancelled' | 'refunded'
  paymentMethod?: string
  paymentId?: string
  billingAddress?: BillingAddress
  createdAt: string
  updatedAt: string
  completedAt?: string
}

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  product?: Product
  quantity: number
  unitPrice: number
  totalPrice: number
  createdAt: string
}

export interface BillingAddress {
  fullName: string
  email: string
  phone?: string
  country: string
  state?: string
  city: string
  address: string
  postalCode: string
}

// 评价类型
export interface Review {
  id: string
  userId: string
  user?: User
  productId: string
  product?: Product
  rating: number
  title: string
  content: string
  isVerified: boolean
  createdAt: string
  updatedAt: string
}

// 支付相关类型
export interface PaymentMethod {
  id: string
  name: string
  type: 'alipay' | 'wechat' | 'stripe' | 'paypal'
  icon: string
  isEnabled: boolean
  config: Record<string, any>
}

export interface PaymentResult {
  success: boolean
  paymentId?: string
  orderId: string
  amount: number
  currency: string
  method: string
  message?: string
  redirectUrl?: string
}

// 搜索相关类型
export interface SearchFilters {
  query?: string
  category?: string
  tags?: string[]
  priceRange?: [number, number]
  rating?: number
  sortBy?: 'name' | 'price' | 'rating' | 'created_at' | 'click_count'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface SearchResult<T> {
  items: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

// 统计相关类型
export interface Analytics {
  id: string
  type: 'tool_click' | 'product_view' | 'product_purchase' | 'user_register'
  entityId?: string
  userId?: string
  metadata?: Record<string, any>
  createdAt: string
}

export interface DashboardStats {
  totalTools: number
  totalProducts: number
  totalUsers: number
  totalOrders: number
  totalRevenue: number
  monthlyRevenue: number
  popularTools: Tool[]
  popularProducts: Product[]
  recentOrders: Order[]
  userGrowth: Array<{ date: string; count: number }>
  revenueGrowth: Array<{ date: string; amount: number }>
}

// API 响应类型
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

// 表单相关类型
export interface LoginForm {
  email: string
  password: string
  remember?: boolean
}

export interface RegisterForm {
  email: string
  password: string
  confirmPassword: string
  fullName?: string
  username?: string
  agreeToTerms: boolean
}

export interface ProfileForm {
  fullName?: string
  username?: string
  bio?: string
  website?: string
  location?: string
  avatar?: File
}

export interface ToolForm {
  name: string
  description: string
  url: string
  categoryId: string
  tags: string[]
  icon?: File
  isFeatured?: boolean
  metaTitle?: string
  metaDescription?: string
}

export interface ProductForm {
  name: string
  description: string
  shortDescription?: string
  price: number
  originalPrice?: number
  categoryId: string
  features: string[]
  images?: File[]
  demoUrl?: string
  downloadUrl?: string
  isFeatured?: boolean
  isDigital?: boolean
  stockQuantity?: number
  metaTitle?: string
  metaDescription?: string
}

// 通知类型
export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number
  actions?: Array<{
    label: string
    action: () => void
  }>
}

// 主题类型
export interface Theme {
  name: string
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    surface: string
    text: string
    textSecondary: string
    border: string
    error: string
    warning: string
    success: string
    info: string
  }
  fonts: {
    primary: string
    secondary: string
  }
  spacing: {
    xs: string
    sm: string
    md: string
    lg: string
    xl: string
  }
  borderRadius: {
    sm: string
    md: string
    lg: string
    xl: string
  }
}

// 应用配置类型
export interface AppConfig {
  name: string
  description: string
  version: string
  author: string
  website: string
  contact: {
    email: string
    phone?: string
    address?: string
  }
  social: {
    github?: string
    twitter?: string
    linkedin?: string
    wechat?: string
  }
  features: {
    userRegistration: boolean
    productSales: boolean
    reviews: boolean
    analytics: boolean
    multiLanguage: boolean
  }
  seo: {
    title: string
    description: string
    keywords: string[]
    ogImage?: string
  }
  payment: {
    currency: string
    methods: PaymentMethod[]
  }
}
