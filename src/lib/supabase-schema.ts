// Auto-generated minimal TypeScript types based on provided SQL schema (public schema)
// Note: these are conservative shapes intended to help TypeScript checks in the frontend.

export interface Analytics {
  id: string;
  event_type: string;
  event_data?: any;
  user_id?: string | null;
  session_id?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
  created_at?: string;
}

export interface ContactInfo {
  id: string;
  type: string;
  label: string;
  value: string;
  icon?: string | null;
  sort_order?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface FaqCategories {
  id: string;
  name: string;
  description?: string | null;
  icon?: string | null;
  sort_order?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Faqs {
  id: string;
  category_id?: string | null;
  question: string;
  answer: string;
  is_featured?: boolean;
  view_count?: number;
  helpful_count?: number;
  not_helpful_count?: number;
  sort_order?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Favorites {
  id: string;
  user_id?: string | null;
  tool_id?: string | null;
  created_at?: string;
}

export interface OrderItems {
  id: string;
  order_id?: string | null;
  product_id?: string | null;
  quantity: number;
  unit_price: string;
  total_price: string;
  created_at?: string;
}

export interface Orders {
  id: string;
  user_id?: string | null;
  total_amount: string;
  currency?: string;
  status?: string | null;
  payment_method?: string | null;
  payment_id?: string | null;
  billing_address?: any;
  created_at?: string;
  updated_at?: string;
  completed_at?: string | null;
}

export interface Payments {
  id: string;
  order_id?: string | null;
  amount: string;
  currency?: string;
  payment_method: string;
  payment_provider?: string | null;
  provider_payment_id?: string | null;
  status?: string | null;
  created_at?: string;
  updated_at?: string;
  completed_at?: string | null;
}

export interface ProductReviews {
  id: string;
  product_id?: string | null;
  user_id?: string | null;
  rating?: number;
  title?: string | null;
  content?: string | null;
  is_verified_purchase?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ProductSubmissions {
  id: string;
  user_id?: string | null;
  name: string;
  description: string;
  content?: string | null;
  price?: string | null;
  category_id?: string | null;
  status?: string | null;
  image_url?: string | null;
  url?: string | null;
  tags?: string[];
  admin_notes?: string | null;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Products {
  id: string;
  name: string;
  description: string;
  short_description?: string | null;
  price: string;
  original_price?: string | null;
  currency?: string;
  category_id?: string | null;
  images?: string[];
  features?: string[];
  demo_url?: string | null;
  download_url?: string | null;
  is_featured?: boolean;
  is_digital?: boolean;
  stock_quantity?: number | null;
  status?: string | null;
  created_at?: string;
  updated_at?: string;
  created_by?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  sort_order?: number;
}

export interface SiteContent {
  id: string;
  key: string;
  title: string;
  content: string;
  content_type?: string;
  is_published?: boolean;
  created_at?: string;
  updated_at?: string;
  created_by?: string | null;
}

export interface SystemNotifications {
  id: string;
  title: string;
  message: string;
  type?: string;
  target_users?: string[];
  is_global?: boolean;
  is_active?: boolean;
  expires_at?: string | null;
  created_at?: string;
  created_by?: string | null;
}

export interface Tags {
  id: string;
  name: string;
  color?: string;
  created_at?: string;
}

export interface ToolRatings {
  id: string;
  tool_id: string;
  user_id?: string | null;
  rating: number;
  review?: string | null;
  is_anonymous?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ToolTags {
  id: string;
  tool_id?: string | null;
  tag_id?: string | null;
  created_at?: string;
}

export interface Tools {
  id: string;
  name: string;
  description?: string | null;
  url: string;
  icon?: string | null;
  category_id?: string | null;
  is_featured?: boolean;
  click_count?: number;
  status?: string | null;
  is_active?: boolean;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
  created_by?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  tutorial_content?: string | null;
  tutorial_video_url?: string | null;
  features?: any;
  pros_cons?: any;
  pricing_info?: string | null;
}

export interface UnifiedCategories {
  id: string;
  name: string;
  description?: string | null;
  icon?: string | null;
  color?: string;
  category_type: 'tool' | 'product';
  parent_id?: string | null;
  sort_order?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface UserFeedback {
  id: string;
  user_id?: string | null;
  email: string;
  category?: string | null;
  subject: string;
  message: string;
  status?: string | null;
  created_at?: string;
}

export interface UserNotificationReads {
  id: string;
  user_id?: string | null;
  notification_id?: string | null;
  read_at?: string;
}

export interface UserProfiles {
  id: string;
  email: string;
  username?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  website?: string | null;
  location?: string | null;
  role?: string | null;
  is_active?: boolean;
  email_verified?: boolean;
  created_at?: string;
  updated_at?: string;
  last_login_at?: string | null;
}

// A minimal Database mapping (compatible with supabase-js generic types)
export interface Database {
  public: {
    analytics: Analytics;
    contact_info: ContactInfo;
    faq_categories: FaqCategories;
    faqs: Faqs;
    favorites: Favorites;
    order_items: OrderItems;
    orders: Orders;
    payments: Payments;
    product_reviews: ProductReviews;
    product_submissions: ProductSubmissions;
    products: Products;
    site_content: SiteContent;
    system_notifications: SystemNotifications;
    tags: Tags;
    tool_ratings: ToolRatings;
    tool_tags: ToolTags;
    tools: Tools;
    unified_categories: UnifiedCategories;
    user_feedback: UserFeedback;
    user_notification_reads: UserNotificationReads;
    user_profiles: UserProfiles;
  };
}

export default Database;
