import { supabase } from "@/lib/supabaseClient";
import type { Order, BillingAddress, Product } from "@/types";

export interface CreateOrderData {
  product_id: string;
  quantity: number;
  billing_address: BillingAddress;
}

export interface PaymentData {
  order_id: string;
  payment_method: string;
  payment_id?: string; // 改为可选属性
  amount: number;
}

// 转换 BillingAddress 类型以匹配数据库格式
const convertBillingAddress = (address: BillingAddress) => {
  return {
    street: address.address || "",
    city: address.city || "",
    state: address.state || "",
    postal_code: address.postal_code || "",
    country: address.country || "",
  };
};

// 数据库表类型定义
interface ProductRow {
  id: string;
  name: string;
  price: number;
  is_digital?: boolean;
  [key: string]: unknown;
}

interface OrderRow {
  id: string;
  user_id: string;
  total_amount: number;
  currency: string;
  status: string;
  payment_method?: string;
  payment_id?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  [key: string]: unknown;
}

interface OrderItemRow {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
  [key: string]: unknown;
}

interface OrderInsertData {
  user_id: string;
  total_amount: number;
  currency: string;
  status: string;
  billing_address: BillingAddress;
}

interface OrderItemInsertData {
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface OrderUpdateData {
  status: string;
  payment_method: string;
  payment_id: string;
  completed_at: string;
  updated_at: string;
}

interface PaymentInsertData {
  order_id: string;
  amount: number;
  currency: string;
  payment_method: string;
  provider_payment_id: string;
  status: string;
  completed_at: string;
  updated_at: string;
}

export class OrderService {
  // 创建订单
  static async createOrder(
    orderData: CreateOrderData,
    userId: string,
  ): Promise<Order> {
    try {
      // 获取产品信息
      // @ts-ignore
      const { data: product, error: productError } = await supabase
        .from("products")
        .select("id, name, price, is_digital")
        .eq("id", orderData.product_id)
        .eq("status", "active")
        .single();

      if (productError || !product) {
        throw new Error("产品不存在或已下架");
      }

      const totalAmount = (product as ProductRow).price * orderData.quantity;

      // 创建订单
      const orderInsertData: OrderInsertData = {
        user_id: userId,
        total_amount: totalAmount,
        currency: "CNY",
        status: "pending",
        billing_address: convertBillingAddress(orderData.billing_address),
      };

      // @ts-ignore
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert([orderInsertData])
        .select()
        .single();

      if (orderError) throw orderError;
      if (!order) throw new Error("创建订单失败");

      // 创建订单项
      const orderItemInsertData: OrderItemInsertData = {
        order_id: (order as OrderRow).id,
        product_id: orderData.product_id,
        quantity: orderData.quantity,
        unit_price: (product as ProductRow).price,
        total_price: totalAmount,
      };

      // @ts-ignore
      const { data: orderItem, error: itemError } = await supabase
        .from("order_items")
        .insert([orderItemInsertData])
        .select()
        .single();

      if (itemError) throw itemError;
      if (!orderItem) throw new Error("创建订单项失败");

      return {
        id: (order as OrderRow).id,
        user_id: (order as OrderRow).user_id,
        items: [
          {
            id: (orderItem as OrderItemRow).id,
            order_id: (order as OrderRow).id,
            product_id: orderData.product_id,
            quantity: orderData.quantity,
            unit_price: (product as ProductRow).price,
            total_price: totalAmount,
            created_at: (orderItem as OrderItemRow).created_at,
            product: {
              id: (product as ProductRow).id,
              name: (product as ProductRow).name,
              description: "",
              short_description: "",
              price: (product as ProductRow).price,
              currency: "CNY",
              category_id: "",
              images: [],
              features: [],
              is_featured: false,
              is_digital: (product as ProductRow).is_digital || false,
              status: "active",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            } as Product,
          },
        ],
        total_amount: totalAmount,
        currency: (order as OrderRow).currency,
        status: (order as OrderRow).status as
          | "pending"
          | "paid"
          | "cancelled"
          | "refunded",
        payment_method: (order as OrderRow).payment_method || undefined,
        payment_id: (order as OrderRow).payment_id || undefined,
        billing_address: orderData.billing_address,
        created_at: (order as OrderRow).created_at,
        updated_at: (order as OrderRow).updated_at,
        completed_at: (order as OrderRow).completed_at || undefined,
      };
    } catch (error) {
      console.error("创建订单失败:", error);
      throw new Error("创建订单失败");
    }
  }

  // 处理支付
  static async processPayment(paymentData: PaymentData): Promise<void> {
    try {
      const orderUpdateData: OrderUpdateData = {
        status: "paid",
        payment_method: paymentData.payment_method,
        payment_id: paymentData.payment_id,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // @ts-ignore
      const { error } = await supabase
        .from("orders")
        .update(orderUpdateData)
        .eq("id", paymentData.order_id)
        .eq("status", "pending"); // 只能更新待支付的订单

      if (error) throw error;

      // 创建支付记录
      const paymentInsertData: PaymentInsertData = {
        order_id: paymentData.order_id,
        amount: paymentData.amount,
        currency: "CNY",
        payment_method: paymentData.payment_method,
        provider_payment_id: paymentData.payment_id,
        status: "completed",
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // @ts-ignore
      const { error: paymentError } = await supabase
        .from("payments")
        .insert([paymentInsertData]);

      if (paymentError) throw paymentError;
    } catch (error) {
      console.error("处理支付失败:", error);
      throw new Error("处理支付失败");
    }
  }

  // 验证用户是否有下载权限
  static async verifyDownloadPermission(
    productId: string,
    userId: string,
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from("order_items")
        .select(
          `
          id,
          orders!inner(
            id,
            user_id,
            status
          )
        `,
        )
        .eq("product_id", productId)
        .eq("orders.user_id", userId)
        .eq("orders.status", "paid");

      if (error) throw error;

      return data && data.length > 0;
    } catch (error) {
      console.error("验证下载权限失败:", error);
      return false;
    }
  }

  // 获取用户订单列表
  static async getUserOrders(userId: string): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          *,
          order_items(
            *,
            products(id, name, images, short_description)
          )
        `,
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return (data || []).map((order: OrderRow & { order_items?: OrderItemRow[] }) => ({
        id: order.id,
        user_id: order.user_id,
        items:
          order.order_items?.map((item: any) => ({
            id: item.id,
            order_id: item.order_id,
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total_price: item.total_price,
            created_at: item.created_at,
            product: item.products
              ? {
                  id: item.products.id,
                  name: item.products.name,
                  description: "",
                  short_description: item.products.short_description || "",
                  price: 0,
                  currency: "CNY",
                  category_id: "",
                  images: item.products.images || [],
                  features: [],
                  is_featured: false,
                  is_digital: false,
                  status: "active",
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                }
              : undefined,
          })) || [],
        total_amount: order.total_amount,
        currency: order.currency,
        status: order.status,
        payment_method: order.payment_method || undefined,
        payment_id: order.payment_id || undefined,
        billing_address: order.billing_address
          ? {
              full_name: "",
              email: "",
              phone: "",
              country: order.billing_address.country,
              state: order.billing_address.state,
              city: order.billing_address.city,
              address: order.billing_address.street,
              postal_code: order.billing_address.postal_code,
            }
          : undefined,
        created_at: order.created_at,
        updated_at: order.updated_at,
        completed_at: order.completed_at || undefined,
      }));
    } catch (error) {
      console.error("获取用户订单失败:", error);
      throw new Error("获取用户订单失败");
    }
  }

  // 取消订单
  static async cancelOrder(orderId: string, userId: string): Promise<void> {
    try {
      const orderUpdateData = {
        status: "cancelled",
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("orders")
        .update(orderUpdateData)
        .eq("id", orderId)
        .eq("user_id", userId)
        .eq("status", "pending"); // 只能取消待支付的订单

      if (error) throw error;
    } catch (error) {
      console.error("取消订单失败:", error);
      throw new Error("取消订单失败");
    }
  }

  // 获取订单详情
  static async getOrderById(
    orderId: string,
    userId: string,
  ): Promise<Order | null> {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          *,
          order_items(
            *,
            products(id, name, images, short_description, download_url)
          )
        `,
        )
        .eq("id", orderId)
        .eq("user_id", userId)
        .single();

      if (error) throw error;
      if (!data) return null;

      return {
        id: data.id,
        user_id: data.user_id,
        items:
          data.order_items?.map((item: any) => ({
            id: item.id,
            order_id: item.order_id,
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total_price: item.total_price,
            created_at: item.created_at,
            product: item.products
              ? {
                  id: item.products.id,
                  name: item.products.name,
                  description: "",
                  short_description: item.products.short_description || "",
                  price: 0,
                  currency: "CNY",
                  category_id: "",
                  images: item.products.images || [],
                  features: [],
                  is_featured: false,
                  is_digital: false,
                  status: "active",
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                  download_url: item.products.download_url,
                }
              : undefined,
          })) || [],
        total_amount: data.total_amount,
        currency: data.currency,
        status: data.status,
        payment_method: data.payment_method || undefined,
        payment_id: data.payment_id || undefined,
        billing_address: data.billing_address
          ? {
              full_name: "",
              email: "",
              phone: "",
              country: data.billing_address.country,
              state: data.billing_address.state,
              city: data.billing_address.city,
              address: data.billing_address.street,
              postal_code: data.billing_address.postal_code,
            }
          : undefined,
        created_at: data.created_at,
        updated_at: data.updated_at,
        completed_at: data.completed_at || undefined,
      };
    } catch (error) {
      console.error("获取订单详情失败:", error);
      return null;
    }
  }

  // 管理员获取所有订单
  static async getAllOrders(filters?: {
    status?: string;
    paymentMethod?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    orders: Order[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const page = filters?.page || 1;
      const limit = filters?.limit || 10;
      const offset = (page - 1) * limit;

      let query = supabase.from("orders").select(
        `
          *,
          user_profiles!inner(id, email, full_name, avatar_url),
          order_items(
            *,
            products(id, name, images, short_description)
          )
        `,
        { count: "exact" },
      );

      // 应用筛选条件
      if (filters?.status) {
        query = query.eq("status", filters.status);
      }

      if (filters?.paymentMethod) {
        query = query.eq("payment_method", filters.paymentMethod);
      }

      if (filters?.search) {
        const search = filters.search.toLowerCase();
        query = query.or(
          `id.ilike.%${search}%,user_profiles.email.ilike.%${search}%,user_profiles.full_name.ilike.%${search}%`,
        );
      }

      if (filters?.startDate) {
        query = query.gte("created_at", filters.startDate);
      }

      if (filters?.endDate) {
        const endDate = new Date(filters.endDate);
        endDate.setHours(23, 59, 59, 999);
        query = query.lte("created_at", endDate.toISOString());
      }

      // 排序和分页
      query = query
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      const orders = (data || []).map((order: any) => ({
        id: order.id,
        user_id: order.user_id,
        user: order.user_profiles
          ? {
              id: order.user_profiles.id,
              email: order.user_profiles.email,
              full_name: order.user_profiles.full_name,
              avatar_url: order.user_profiles.avatar_url,
            }
          : undefined,
        items:
          order.order_items?.map((item: any) => ({
            id: item.id,
            order_id: item.order_id,
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total_price: item.total_price,
            created_at: item.created_at,
            product: item.products
              ? {
                  id: item.products.id,
                  name: item.products.name,
                  description: "",
                  short_description: item.products.short_description || "",
                  price: 0,
                  currency: "CNY",
                  category_id: "",
                  images: item.products.images || [],
                  features: [],
                  is_featured: false,
                  is_digital: false,
                  status: "active",
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                }
              : undefined,
          })) || [],
        total_amount: order.total_amount,
        currency: order.currency,
        status: order.status,
        payment_method: order.payment_method || undefined,
        payment_id: order.payment_id || undefined,
        billing_address: order.billing_address
          ? {
              full_name: "",
              email: "",
              phone: "",
              country: order.billing_address.country,
              state: order.billing_address.state,
              city: order.billing_address.city,
              address: order.billing_address.street,
              postal_code: order.billing_address.postal_code,
            }
          : undefined,
        created_at: order.created_at,
        updated_at: order.updated_at,
        completed_at: order.completed_at || undefined,
      }));

      return {
        orders,
        total: count || 0,
        page,
        limit,
      };
    } catch (error) {
      console.error("获取所有订单失败:", error);
      throw new Error("获取所有订单失败");
    }
  }

  // 管理员更新订单状态
  static async updateOrderStatus(
    orderId: string,
    status: "pending" | "paid" | "cancelled" | "refunded",
    adminUserId: string,
  ): Promise<void> {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString(),
      };

      // 如果状态是已完成，设置完成时间
      if (status === "paid") {
        updateData.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("orders")
        .update(updateData)
        .eq("id", orderId);

      if (error) throw error;

      console.log(
        `管理员 ${adminUserId} 将订单 ${orderId} 状态更新为 ${status}`,
      );
    } catch (error) {
      console.error("更新订单状态失败:", error);
      throw new Error("更新订单状态失败");
    }
  }

  // 管理员获取订单统计
  static async getOrderStats(): Promise<{
    totalOrders: number;
    pendingOrders: number;
    paidOrders: number;
    cancelledOrders: number;
    totalRevenue: number;
    todayOrders: number;
    todayRevenue: number;
  }> {
    try {
      // 获取所有订单统计
      const { data: allOrders, error: allError } = await supabase
        .from("orders")
        .select("status, total_amount, created_at");

      if (allError) throw allError;

      // 获取今日订单
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayISO = today.toISOString();

      const { data: todayOrders, error: todayError } = await supabase
        .from("orders")
        .select("status, total_amount")
        .gte("created_at", todayISO);

      if (todayError) throw todayError;

      // 计算统计数据
      const totalOrders = allOrders?.length || 0;
      const pendingOrders =
        allOrders?.filter((o) => o.status === "pending").length || 0;
      const paidOrders =
        allOrders?.filter((o) => o.status === "paid").length || 0;
      const cancelledOrders =
        allOrders?.filter((o) => o.status === "cancelled").length || 0;
      const totalRevenue =
        allOrders
          ?.filter((o) => o.status === "paid")
          .reduce((sum, o) => sum + o.total_amount, 0) || 0;

      const todayOrdersCount = todayOrders?.length || 0;
      const todayRevenue =
        todayOrders
          ?.filter((o) => o.status === "paid")
          .reduce((sum, o) => sum + o.total_amount, 0) || 0;

      return {
        totalOrders,
        pendingOrders,
        paidOrders,
        cancelledOrders,
        totalRevenue,
        todayOrders: todayOrdersCount,
        todayRevenue,
      };
    } catch (error) {
      console.error("获取订单统计失败:", error);
      throw new Error("获取订单统计失败");
    }
  }

  // 管理员导出订单数据
  static async exportOrders(filters?: {
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<string> {
    try {
      let query = supabase.from("orders").select(`
          *,
          user_profiles!inner(email, full_name),
          order_items(
            *,
            products(name)
          )
        `);

      // 应用筛选条件
      if (filters?.status) {
        query = query.eq("status", filters.status);
      }

      if (filters?.startDate) {
        query = query.gte("created_at", filters.startDate);
      }

      if (filters?.endDate) {
        const endDate = new Date(filters.endDate);
        endDate.setHours(23, 59, 59, 999);
        query = query.lte("created_at", endDate.toISOString());
      }

      query = query.order("created_at", { ascending: false });

      const { data, error } = await query;

      if (error) throw error;

      // 生成CSV内容
      const headers = [
        "订单ID",
        "用户邮箱",
        "用户姓名",
        "商品名称",
        "数量",
        "单价",
        "总金额",
        "货币",
        "状态",
        "支付方式",
        "支付ID",
        "创建时间",
        "完成时间",
      ];

      let csvContent = headers.join(",") + "\n";

      data?.forEach((order: any) => {
        order.order_items?.forEach((item: any) => {
          const row = [
            order.id,
            order.user_profiles?.email || "",
            order.user_profiles?.full_name || "",
            item.products?.name || "",
            item.quantity,
            item.unit_price,
            order.total_amount,
            order.currency,
            order.status,
            order.payment_method || "",
            order.payment_id || "",
            new Date(order.created_at).toLocaleString("zh-CN"),
            order.completed_at
              ? new Date(order.completed_at).toLocaleString("zh-CN")
              : "",
          ];
          csvContent += row.map((field) => `"${field}"`).join(",") + "\n";
        });
      });

      return csvContent;
    } catch (error) {
      console.error("导出订单数据失败:", error);
      throw new Error("导出订单数据失败");
    }
  }
}
