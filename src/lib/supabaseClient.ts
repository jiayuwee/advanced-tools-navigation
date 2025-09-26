import { createClient } from "@supabase/supabase-js";
import { getEnvironmentConfig } from "../utils/envValidation";

// 获取验证后的环境配置
const envConfig = getEnvironmentConfig();
const { supabase: supabaseConfig } = envConfig;

// 创建 Supabase 客户端
export const supabase = createClient(
  supabaseConfig.url,
  supabaseConfig.anonKey,
  supabaseConfig.options,
);

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
export const handleSupabaseError = (error: unknown) => {
  console.error("Supabase Error:", error);
  const err = error as { message?: string; error_description?: string } | null;
  if (err?.message) return err.message;
  if (err?.error_description) return err.error_description;
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
export const getUserRole = async (userId: string): Promise<string> => {
  const { data, error } = await supabase
    .from(TABLES.USER_PROFILES)
    .select("role")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error fetching user role:", error);
    return "user";
  }

  return data?.role ?? "user";
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
export const createRecord = async <T = unknown>(
  table: string,
  data: Record<string, unknown>,
): Promise<T> => {
  const { data: result, error } = await supabase
    .from(table as never)
    .insert(data as never)
    .select()
    .single();

  if (error) {
    throw new Error(handleSupabaseError(error));
  }

  return result as T;
};

export const updateRecord = async <T = unknown>(
  table: string,
  id: string,
  data: Record<string, unknown>,
): Promise<T> => {
  const { data: result, error } = await supabase
    .from(table as never)
    .update(data as never)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(handleSupabaseError(error));
  }

  return result as T;
};

export const deleteRecord = async (table: string, id: string) => {
  const { error } = await supabase
    .from(table as never)
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(handleSupabaseError(error));
  }
};

export const getRecord = async <T = unknown>(table: string, id: string) => {
  const { data, error } = await supabase
    .from(table as never)
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(handleSupabaseError(error));
  }

  return data as T;
};

export const getRecords = async <T = unknown>(
  table: string,
  options?: {
    select?: string;
    filter?: Record<string, unknown>;
    orderBy?: { column: string; ascending?: boolean };
    limit?: number;
    offset?: number;
  },
) => {
  let query = supabase
    .from(table as never)
    .select(options?.select || "*");

  // 应用过滤条件
  if (options?.filter) {
    Object.entries(options.filter).forEach(([key, value]) => {
      query = query.eq(key, value as never);
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

  return (data as T[]) || [];
};
