import { supabase } from "@/lib/supabase";
import type { Order, OrderItem, BillingAddress } from "@/types";

export interface CreateOrderData {
  productId: string;
  quantity: number;
  billingAddress: BillingAddress;
}

export interface PaymentData {
  orderId: string;
  paymentMethod: string;
  paymentId: string;
  amount: number;
}

export class OrderService {
  // 创建订单
  static async createOrder(orderData: CreateOrderData, userId: string): Promise<Order> {
    try {
      // 获取产品信息
      const { data: product, error: productError } = await supabase
        .from("products")
        .select("id, name, price, is_digital")
        .eq("id", orderData.productId)
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
          billing_address: orderData.billingAddress,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 创建订单项
      const { data: orderItem, error: itemError } = await supabase
        .from("order_items")
        .insert({
          order_id: order.id,
          product_id: orderData.productId,
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
            orderId: order.id,
            productId: orderData.productId,
            quantity: orderData.quantity,
            unitPrice: product.price,
            totalPrice: totalAmount,
            createdAt: orderItem.created_at,
            product: {
              id: product.id,
              name: product.name,
              shortDescription: "",
              images: [],
            },
          },
        ],
        totalAmount,
        currency: order.currency,
        status: order.status as "pending" | "paid" | "cancelled" | "refunded",
        billingAddress: orderData.billingAddress,
        createdAt: order.created_at,
        updatedAt: order.updated_at,
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
          payment_method: paymentData.paymentMethod,
          payment_id: paymentData.paymentId,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", paymentData.orderId)
        .eq("status", "pending"); // 只能更新待支付的订单

      if (error) throw error;
    } catch (error) {
      console.error("处理支付失败:", error);
      throw new Error("处理支付失败");
    }
  }

  // 验证用户是否有下载权限
  static async verifyDownloadPermission(productId: string, userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from("order_items")
        .select(`
          id,
          orders!inner(
            id,
            user_id,
            status
          )
        `)
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
        .select(`
          *,
          order_items(
            *,
            products(id, name, images, short_description)
          )
        `)
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
          product: item.products ? {
            id: item.products.id,
            name: item.products.name,
            shortDescription: item.products.short_description || "",
            images: item.products.images || [],
          } : undefined,
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
  static async getOrderById(orderId: string, userId: string): Promise<Order | null> {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          order_items(
            *,
            products(id, name, images, short_description, download_url)
          )
        `)
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
          product: item.products ? {
            id: item.products.id,
            name: item.products.name,
            shortDescription: item.products.short_description || "",
            images: item.products.images || [],
            downloadUrl: item.products.download_url,
          } : undefined,
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
}
