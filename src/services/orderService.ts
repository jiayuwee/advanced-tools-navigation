import { supabase } from "@/lib/supabase";
import type { Order, OrderItem, BillingAddress } from "@/types";

export interface CreateOrderData {
  product_id: string;
  quantity: number;
  billing_address: BillingAddress;
}

export interface PaymentData {
  order_id: string;
  payment_method: string;
  payment_id: string;
  amount: number;
}

export class OrderService {
  // 创建订单
  static async createOrder(
    orderData: CreateOrderData,
    userId: string,
  ): Promise<Order> {
    try {
      // 获取产品信息
      const { data: product, error: productError } = await supabase
        .from("products")
        .select("id, name, price, is_digital")
        .eq("id", orderData.product_id)
        .eq("status", "active")
        .single();

      if (productError || !product) {
        throw new Error("产品不存在或已下架");
      }

      const totalAmount = product.price * orderData.quantity;

      // 创建订单
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: userId,
          total_amount: totalAmount,
          currency: "CNY",
          status: "pending",
          billing_address: orderData.billing_address,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 创建订单项
      const { data: orderItem, error: itemError } = await supabase
        .from("order_items")
        .insert({
          order_id: order.id,
          product_id: orderData.product_id,
          quantity: orderData.quantity,
          unit_price: product.price,
          total_price: totalAmount,
        })
        .select()
        .single();

      if (itemError) throw itemError;

      return {
        id: order.id,
        userId: order.user_id,
        items: [
          {
            id: orderItem.id,
            order_id: order.id,
            product_id: orderData.product_id,
            quantity: orderData.quantity,
            unit_price: product.price,
            total_price: totalAmount,
            created_at: orderItem.created_at,
            product: {
              id: product.id,
              name: product.name,
              short_description: "",
              images: [],
            },
          },
        ],
        total_amount: totalAmount,
        currency: order.currency,
        status: order.status as "pending" | "paid" | "cancelled" | "refunded",
        billing_address: orderData.billing_address,
        created_at: order.created_at,
        updated_at: order.updated_at,
      };
    } catch (error) {
      console.error("创建订单失败:", error);
      throw new Error("创建订单失败");
    }
  }

  // 处理支付
  static async processPayment(paymentData: PaymentData): Promise<void> {
    try {
      const { error } = await supabase
        .from("orders")
        .update({
          status: "paid",
          payment_method: paymentData.payment_method,
          payment_id: paymentData.payment_id,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", paymentData.order_id)
        .eq("status", "pending"); // 只能更新待支付的订单

      if (error) throw error;
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

      return data.map((order) => ({
        id: order.id,
        userId: order.user_id,
        items: order.order_items.map((item: any) => ({
          id: item.id,
          orderId: item.order_id,
          productId: item.product_id,
          quantity: item.quantity,
          unitPrice: item.unit_price,
          totalPrice: item.total_price,
          createdAt: item.created_at,
          product: item.products
            ? {
                id: item.products.id,
                name: item.products.name,
                shortDescription: item.products.short_description || "",
                images: item.products.images || [],
              }
            : undefined,
        })),
        totalAmount: order.total_amount,
        currency: order.currency,
        status: order.status,
        paymentMethod: order.payment_method,
        paymentId: order.payment_id,
        billingAddress: order.billing_address,
        createdAt: order.created_at,
        updatedAt: order.updated_at,
        completedAt: order.completed_at,
      }));
    } catch (error) {
      console.error("获取用户订单失败:", error);
      throw new Error("获取用户订单失败");
    }
  }

  // 取消订单
  static async cancelOrder(orderId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("orders")
        .update({
          status: "cancelled",
          updated_at: new Date().toISOString(),
        })
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
        userId: data.user_id,
        items: data.order_items.map((item: any) => ({
          id: item.id,
          orderId: item.order_id,
          productId: item.product_id,
          quantity: item.quantity,
          unitPrice: item.unit_price,
          totalPrice: item.total_price,
          createdAt: item.created_at,
          product: item.products
            ? {
                id: item.products.id,
                name: item.products.name,
                shortDescription: item.products.short_description || "",
                images: item.products.images || [],
                downloadUrl: item.products.download_url,
              }
            : undefined,
        })),
        totalAmount: data.total_amount,
        currency: data.currency,
        status: data.status,
        paymentMethod: data.payment_method,
        paymentId: data.payment_id,
        billingAddress: data.billing_address,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        completedAt: data.completed_at,
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
        userId: order.user_id,
        user: order.user_profiles
          ? {
              id: order.user_profiles.id,
              email: order.user_profiles.email,
              full_name: order.user_profiles.full_name,
              avatar_url: order.user_profiles.avatar_url,
            }
          : undefined,
        items: order.order_items.map((item: any) => ({
          id: item.id,
          orderId: item.order_id,
          productId: item.product_id,
          quantity: item.quantity,
          unitPrice: item.unit_price,
          totalPrice: item.total_price,
          createdAt: item.created_at,
          product: item.products
            ? {
                id: item.products.id,
                name: item.products.name,
                shortDescription: item.products.short_description || "",
                images: item.products.images || [],
              }
            : undefined,
        })),
        totalAmount: order.total_amount,
        currency: order.currency,
        status: order.status,
        paymentMethod: order.payment_method,
        paymentId: order.payment_id,
        billingAddress: order.billing_address,
        createdAt: order.created_at,
        updatedAt: order.updated_at,
        completedAt: order.completed_at,
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
        order.order_items.forEach((item: any) => {
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
