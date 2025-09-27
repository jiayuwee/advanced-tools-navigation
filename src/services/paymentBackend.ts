// =================================================================
// 后端支付处理服务
// 该服务应该部署在安全的后端服务器上，而非前端
// =================================================================

import type { PaymentData } from "@/services/orderService";

// 支付处理结果类型
export interface BackendPaymentResult {
  success: boolean;
  paymentId: string;
  orderId: string;
  amount: number;
  currency: string;
  method: string;
  clientSecret?: string; // Stripe PaymentIntent 客户端密钥
  paymentUrl?: string;   // 支付宝/微信支付跳转URL
  message: string;
  rawResponse?: any;     // 原始支付平台响应
}

/**
 * 支付后端服务类
 * 在生产环境中，这应该是一个独立的Node.js/Express服务
 */
export class PaymentBackendService {
  private static readonly API_BASE_URL = process.env.PAYMENT_BACKEND_URL || 'http://localhost:3001';

  /**
   * 前端调用后端支付API的统一入口
   */
  static async processPayment(
    paymentData: PaymentData,
    method: 'stripe' | 'alipay' | 'wechat'
  ): Promise<BackendPaymentResult> {
    try {
      const response = await this.callBackendAPI('/api/payments/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`,
        },
        body: JSON.stringify({
          orderId: paymentData.order_id,
          amount: paymentData.amount,
          currency: paymentData.currency || 'CNY',
          method,
          description: paymentData.description || `订单支付 - ${paymentData.order_id}`,
        }),
      });

      if (!response.success) {
        throw new Error(response.message || '支付处理失败');
      }

      return response;
    } catch (error) {
      console.error('支付处理失败:', error);
      throw error;
    }
  }

  /**
   * 创建Stripe PaymentIntent
   */
  static async createStripePaymentIntent(
    paymentData: PaymentData
  ): Promise<BackendPaymentResult> {
    try {
      const response = await this.callBackendAPI('/api/payments/stripe/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`,
        },
        body: JSON.stringify({
          orderId: paymentData.order_id,
          amount: paymentData.amount,
          currency: 'cny',
          description: `订单支付 - ${paymentData.order_id}`,
        }),
      });

      return response;
    } catch (error) {
      console.error('Stripe PaymentIntent 创建失败:', error);
      throw error;
    }
  }

  /**
   * 创建支付宝支付订单
   */
  static async createAlipayOrder(
    paymentData: PaymentData
  ): Promise<BackendPaymentResult> {
    try {
      const response = await this.callBackendAPI('/api/payments/alipay/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`,
        },
        body: JSON.stringify({
          orderId: paymentData.order_id,
          amount: paymentData.amount,
          subject: `订单支付 - ${paymentData.order_id}`,
          body: paymentData.description || '商品购买',
        }),
      });

      return response;
    } catch (error) {
      console.error('支付宝订单创建失败:', error);
      throw error;
    }
  }

  /**
   * 创建微信支付订单
   */
  static async createWechatOrder(
    paymentData: PaymentData
  ): Promise<BackendPaymentResult> {
    try {
      const response = await this.callBackendAPI('/api/payments/wechat/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`,
        },
        body: JSON.stringify({
          orderId: paymentData.order_id,
          amount: paymentData.amount,
          description: `订单支付 - ${paymentData.order_id}`,
        }),
      });

      return response;
    } catch (error) {
      console.error('微信支付订单创建失败:', error);
      throw error;
    }
  }

  /**
   * 验证支付结果
   */
  static async verifyPayment(
    paymentId: string,
    provider: 'stripe' | 'alipay' | 'wechat'
  ): Promise<{ verified: boolean; details?: any }> {
    try {
      const response = await this.callBackendAPI('/api/payments/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`,
        },
        body: JSON.stringify({
          paymentId,
          provider,
        }),
      });

      return {
        verified: response.success,
        details: response.details,
      };
    } catch (error) {
      console.error('支付验证失败:', error);
      return { verified: false };
    }
  }

  /**
   * 处理支付回调
   * 注意：这是一个服务端方法，前端不应该调用
   */
  static async handlePaymentWebhook(
    provider: 'stripe' | 'alipay' | 'wechat',
    webhookData: any,
    signature?: string
  ): Promise<{ processed: boolean; orderId?: string; status?: string }> {
    try {
      const response = await this.callBackendAPI('/api/payments/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Payment-Provider': provider,
          'X-Webhook-Signature': signature || '',
        },
        body: JSON.stringify(webhookData),
      });

      return response;
    } catch (error) {
      console.error('支付回调处理失败:', error);
      throw error;
    }
  }

  /**
   * 获取用户信息用于认证
   */
  private static getAuthToken(): string {
    // 在实际应用中，从用户认证状态获取token
    // 这里返回一个placeholder，实际实现需要从认证服务获取
    return 'user-auth-token-placeholder';
  }

  /**
   * 调用后端API的内部方法
   */
  private static async callBackendAPI(
    endpoint: string,
    options: RequestInit
  ): Promise<any> {
    const url = `${this.API_BASE_URL}${endpoint}`;

    try {
      // 在开发环境中，如果后端服务不可用，返回模拟响应
      if (process.env.NODE_ENV === 'development') {
        return this.getMockResponse(endpoint, options);
      }

      const response = await fetch(url, options);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API调用失败 ${url}:`, error);

      // 在开发环境中，网络错误时返回模拟响应
      if (process.env.NODE_ENV === 'development') {
        console.warn('使用模拟响应（仅开发环境）');
        return this.getMockResponse(endpoint, options);
      }

      throw error;
    }
  }

  /**
   * 开发环境的模拟响应
   * 注意：生产环境绝不应该使用这个方法
   */
  private static getMockResponse(endpoint: string, options: RequestInit): any {
    const body = options.body ? JSON.parse(options.body as string) : {};

    // 模拟Stripe PaymentIntent创建
    if (endpoint === '/api/payments/stripe/create-intent') {
      return {
        success: true,
        paymentId: `pi_mock_${Date.now()}`,
        orderId: body.orderId,
        amount: body.amount,
        currency: body.currency,
        method: 'stripe',
        clientSecret: `pi_mock_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`,
        message: 'PaymentIntent创建成功（模拟环境）',
      };
    }

    // 模拟支付宝订单创建
    if (endpoint === '/api/payments/alipay/create-order') {
      return {
        success: true,
        paymentId: `alipay_mock_${Date.now()}`,
        orderId: body.orderId,
        amount: body.amount,
        currency: 'CNY',
        method: 'alipay',
        paymentUrl: `https://mock.alipay.com/pay?order=${body.orderId}`,
        message: '支付宝订单创建成功（模拟环境）',
      };
    }

    // 模拟微信支付订单创建
    if (endpoint === '/api/payments/wechat/create-order') {
      return {
        success: true,
        paymentId: `wechat_mock_${Date.now()}`,
        orderId: body.orderId,
        amount: body.amount,
        currency: 'CNY',
        method: 'wechat',
        paymentUrl: `weixin://wxpay/bizpayurl?pr=mock_${Date.now()}&order=${body.orderId}`,
        message: '微信支付订单创建成功（模拟环境）',
      };
    }

    // 模拟支付验证
    if (endpoint === '/api/payments/verify') {
      return {
        success: Math.random() > 0.5, // 随机成功/失败用于测试
        message: '支付验证完成（模拟环境）',
      };
    }

    // 默认响应
    return {
      success: true,
      message: '操作成功（模拟环境）',
    };
  }
}

/**
 * 安全建议：
 *
 * 1. 这个文件中的逻辑应该移动到独立的后端服务器
 * 2. 支付密钥和敏感信息应该保存在服务器环境变量中
 * 3. 前端只负责显示UI和跳转到支付页面
 * 4. 所有支付签名和验证都在服务器端进行
 * 5. 使用HTTPS进行前后端通信
 * 6. 实现适当的身份验证和授权
 */

// =================================================================
// 后端服务器实现模板 (Node.js/Express)
// =================================================================

/*
const express = require('express');
const app = express();

// 中间件
app.use(express.json());

// 支付处理路由
app.post('/api/payments/stripe/create-intent', async (req, res) => {
  try {
    // 调用Stripe API创建PaymentIntent
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: req.body.amount * 100, // 转换为分
      currency: req.body.currency,
      metadata: { order_id: req.body.orderId },
    });

    res.json({
      success: true,
      paymentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(3001, () => {
  console.log('支付后端服务运行在端口 3001');
});
*/
