import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/database";

// 获取环境变量
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 验证环境变量
if (!supabaseUrl || !supabaseAnonKey || 
    supabaseUrl.includes('your-project-ref') || 
    supabaseAnonKey.includes('your-anon-key')) {
  console.warn(`
    ⚠️  Supabase 环境变量未正确配置!

    开发环境: 请检查 .env.local 文件中是否设置了:
      VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY

    生产环境: 请确保 Netlify 环境变量已设置:
      VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY

    当前值:
      VITE_SUPABASE_URL: ${supabaseUrl || "未设置"}
      VITE_SUPABASE_ANON_KEY: ${supabaseAnonKey ? "已设置" : "未设置"}
      
    应用将使用模拟数据运行，某些功能可能不可用。
  `);
}

// 创建 Supabase 客户端
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// 数据库表名常量
export const TABLES = {
  TOOLS: "tools",
  CATEGORIES: "categories",
  PRODUCTS: "products",
  PRODUCT_CATEGORIES: "product_categories",
  USERS: "users",
  USER_PROFILES: "user_profiles",
  FAVORITES: "favorites",
  ORDERS: "orders",
  ORDER_ITEMS: "order_items",
  PAYMENTS: "payments",
  REVIEWS: "reviews",
  TAGS: "tags",
  TOOL_TAGS: "tool_tags",
  ANALYTICS: "analytics",
} as const;

// 存储桶名称常量
export const STORAGE_BUCKETS = {
  AVATARS: "avatars",
  PRODUCT_IMAGES: "product-images",
  TOOL_ICONS: "tool-icons",
  UPLOADS: "uploads",
} as const;

// 实时订阅配置
export const REALTIME_CHANNELS = {
  TOOLS: "tools-channel",
  PRODUCTS: "products-channel",
  ORDERS: "orders-channel",
  ANALYTICS: "analytics-channel",
} as const;

// 错误处理工具函数
export const handleSupabaseError = (error: any) => {
  console.error("Supabase Error:", error);

  if (error?.message) {
    return error.message;
  }

  if (error?.error_description) {
    return error.error_description;
  }

  return "操作失败，请稍后重试";
};

// 检查用户是否已认证
export const isAuthenticated = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return !!session;
};

// 获取当前用户
export const getCurrentUser = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
};

// 获取用户角色
export const getUserRole = async (userId: string) => {
  const { data, error } = await supabase
    .from(TABLES.USER_PROFILES)
    .select("role")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error fetching user role:", error);
    return "user";
  }

  return data?.role || "user";
};

// 检查用户是否为管理员
export const isAdmin = async (userId?: string) => {
  if (!userId) {
    const user = await getCurrentUser();
    if (!user) return false;
    userId = user.id;
  }

  const role = await getUserRole(userId);
  return role === "admin" || role === "super_admin";
};

// 文件上传工具函数
export const uploadFile = async (
  bucket: string,
  path: string,
  file: File,
  options?: { upsert?: boolean },
) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, options);

  if (error) {
    throw new Error(handleSupabaseError(error));
  }

  return data;
};

// 获取文件公共URL
export const getPublicUrl = (bucket: string, path: string) => {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);

  return data.publicUrl;
};

// 删除文件
export const deleteFile = async (bucket: string, path: string) => {
  const { error } = await supabase.storage.from(bucket).remove([path]);

  if (error) {
    throw new Error(handleSupabaseError(error));
  }
};

// 数据库查询工具函数
export const createRecord = async (table: string, data: Record<string, any>) => {
  const { data: result, error } = await supabase
    .from(table)
    .insert(data)
    .select()
    .single();

  if (error) {
    throw new Error(handleSupabaseError(error));
  }

  return result;
};

export const updateRecord = async (
  table: string,
  id: string,
  data: Record<string, any>,
) => {
  const { data: result, error } = await supabase
    .from(table)
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(handleSupabaseError(error));
  }

  return result;
};

export const deleteRecord = async (table: string, id: string) => {
  const { error } = await supabase.from(table).delete().eq("id", id);

  if (error) {
    throw new Error(handleSupabaseError(error));
  }
};

export const getRecord = async (table: string, id: string) => {
  const { data, error } = await supabase
    .from(table)
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(handleSupabaseError(error));
  }

  return data;
};

export const getRecords = async (
  table: string,
  options?: {
    select?: string;
    filter?: Record<string, any>;
    orderBy?: { column: string; ascending?: boolean };
    limit?: number;
    offset?: number;
  },
) => {
  let query = supabase.from(table).select(options?.select || "*");

  // 应用过滤条件
  if (options?.filter) {
    Object.entries(options.filter).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
  }

  // 应用排序
  if (options?.orderBy) {
    query = query.order(options.orderBy.column, {
      ascending: options.orderBy.ascending ?? true,
    });
  }

  // 应用分页
  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.range(
      options.offset,
      options.offset + (options.limit || 10) - 1,
    );
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(handleSupabaseError(error));
  }

  return data;
};
