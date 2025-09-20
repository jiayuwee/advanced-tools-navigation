import type { PaymentData } from "@/services/orderService";
import { loadStripe } from '@stripe/stripe-js';

// 支付网关配置
const PAYMENT_CONFIG = {
  // Stripe配置
  stripe: {
    publicKey: import.meta.env.VITE_STRIPE_PUBLIC_KEY || "",
    secretKey: import.meta.env.VITE_STRIPE_SECRET_KEY || "",
  },
  // 支付宝配置
  alipay: {
    appId: import.meta.env.VITE_ALIPAY_APP_ID || "",
    privateKey: import.meta.env.VITE_ALIPAY_PRIVATE_KEY || "",
    alipayPublicKey: import.meta.env.VITE_ALIPAY_PUBLIC_KEY || "",
    gateway: import.meta.env.VITE_ALIPAY_GATEWAY_URL || "https://openapi.alipay.com/gateway.do",
    charset: import.meta.env.VITE_ALIPAY_CHARSET || "UTF-8",
    signType: import.meta.env.VITE_ALIPAY_SIGN_TYPE || "RSA2",
  },
  // 微信支付配置
  wechat: {
    appId: import.meta.env.VITE_WECHAT_APP_ID || "",
    mchId: import.meta.env.VITE_WECHAT_MCH_ID || "",
    apiKey: import.meta.env.VITE_WECHAT_API_KEY || "",
    apiVersion: import.meta.env.VITE_WECHAT_API_VERSION || "v3",
  },
};

// 支付结果类型
export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  orderId: string;
  amount: number;
  currency: string;
  method: string;
  message?: string;
  redirectUrl?: string;
  clientSecret?: string; // Stripe 客户端密钥
  paymentIntentId?: string; // Stripe PaymentIntent ID
}

// 初始化 Stripe
let stripeInstance: any = null;
const initializeStripe = async () => {
  if (!stripeInstance && PAYMENT_CONFIG.stripe.publicKey) {
    stripeInstance = await loadStripe(PAYMENT_CONFIG.stripe.publicKey);
  }
  return stripeInstance;
};

export class PaymentService {
  // 处理Stripe支付
  static async processStripePayment(paymentData: PaymentData): Promise<PaymentResult> {
    try {
      // 检查Stripe配置
      if (!PAYMENT_CONFIG.stripe.publicKey) {
        throw new Error("Stripe支付配置缺失，请在.env文件中配置 VITE_STRIPE_PUBLIC_KEY");
      }

      console.log("开始处理Stripe支付:", paymentData);
      
      // 初始化 Stripe
      const stripe = await initializeStripe();
      if (!stripe) {
        throw new Error("Stripe 初始化失败");
      }

      // 创建支付意图 (PaymentIntent)
      // 注意：在实际应用中，PaymentIntent 应该在服务器端创建
      // 这里我们模拟创建过程
      const paymentIntentData = {
        amount: Math.round(paymentData.amount * 100), // Stripe 使用分作为单位
        currency: 'cny',
        metadata: {
          order_id: paymentData.order_id,
          payment_method: paymentData.payment_method
        },
        description: `订单支付 - ${paymentData.order_id}`
      };

      // 在实际应用中，您需要创建一个后端 API 来处理 PaymentIntent
      // 这里我们模拟成功的支付流程
      const mockPaymentIntent = {
        id: `pi_${Date.now()}`,
        client_secret: `pi_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`,
        status: 'requires_payment_method',
        amount: paymentIntentData.amount,
        currency: paymentIntentData.currency
      };

      console.log("Stripe PaymentIntent 已创建", mockPaymentIntent);
      
      return {
        success: true,
        paymentId: mockPaymentIntent.id,
        paymentIntentId: mockPaymentIntent.id,
        clientSecret: mockPaymentIntent.client_secret,
        orderId: paymentData.order_id,
        amount: paymentData.amount,
        currency: "CNY",
        method: "stripe",
        message: "PaymentIntent 已创建，请完成支付确认"
      };
    } catch (error) {
      console.error("Stripe支付处理失败:", error);
      return {
        success: false,
        orderId: paymentData.order_id,
        amount: paymentData.amount,
        currency: "CNY",
        method: "stripe",
        message: error instanceof Error ? error.message : "支付处理失败"
      };
    }
  }

  // 确认 Stripe 支付
  static async confirmStripePayment(clientSecret: string, paymentMethodId: string): Promise<PaymentResult> {
    try {
      const stripe = await initializeStripe();
      if (!stripe) {
        throw new Error("Stripe 初始化失败");
      }

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: paymentMethodId
      });

      if (error) {
        throw new Error(error.message);
      }

      if (paymentIntent.status === 'succeeded') {
        return {
          success: true,
          paymentId: paymentIntent.id,
          orderId: paymentIntent.metadata?.order_id || '',
          amount: paymentIntent.amount / 100, // 转换回元
          currency: paymentIntent.currency.toUpperCase(),
          method: "stripe",
          message: "支付成功"
        };
      } else {
        throw new Error(`支付状态异常: ${paymentIntent.status}`);
      }
    } catch (error) {
      console.error("Stripe支付确认失败:", error);
      return {
        success: false,
        orderId: '',
        amount: 0,
        currency: "CNY",
        method: "stripe",
        message: error instanceof Error ? error.message : "支付确认失败"
      };
    }
  }

  // 处理支付宝支付
  static async processAlipayPayment(paymentData: PaymentData): Promise<PaymentResult> {
    try {
      // 检查支付宝配置
      if (!PAYMENT_CONFIG.alipay.appId) {
        throw new Error("支付宝支付配置缺失，请在.env文件中配置 VITE_ALIPAY_APP_ID");
      }

      console.log("开始处理支付宝支付:", paymentData);
      
      // 创建支付宝支付请求参数
      const alipayParams = {
        // 公共参数
        app_id: PAYMENT_CONFIG.alipay.appId,
        method: "alipay.trade.page.pay", // PC网站支付
        charset: PAYMENT_CONFIG.alipay.charset,
        sign_type: PAYMENT_CONFIG.alipay.signType,
        timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
        version: "1.0",
        notify_url: `${window.location.origin}/api/payment/alipay/notify`, // 异步通知URL
        return_url: `${window.location.origin}/payment/success`, // 同步返回URL
        
        // 业务参数
        biz_content: JSON.stringify({
          out_trade_no: paymentData.order_id, // 商户订单号
          total_amount: paymentData.amount.toFixed(2), // 支付金额
          subject: `订单支付 - ${paymentData.order_id}`, // 订单标题
          product_code: "FAST_INSTANT_TRADE_PAY", // 产品码
          timeout_express: "30m" // 超时时间
        })
      };

      // 在实际应用中，签名操作应该在服务器端进行
      // 这里我们模拟生成支付URL
      const mockPaymentUrl = this.generateAlipayMockUrl(alipayParams);
      
      console.log("支付宝支付URL已生成", mockPaymentUrl);
      
      return {
        success: true,
        paymentId: `alipay_${Date.now()}`,
        orderId: paymentData.order_id,
        amount: paymentData.amount,
        currency: "CNY",
        method: "alipay",
        message: "跳转到支付宝支付页面",
        redirectUrl: mockPaymentUrl
      };
    } catch (error) {
      console.error("支付宝支付处理失败:", error);
      return {
        success: false,
        orderId: paymentData.order_id,
        amount: paymentData.amount,
        currency: "CNY",
        method: "alipay",
        message: error instanceof Error ? error.message : "支付处理失败"
      };
    }
  }

  // 生成支付宝模拟支付URL（实际应用中应在服务器端进行签名）
  private static generateAlipayMockUrl(params: any): string {
    const baseUrl = PAYMENT_CONFIG.alipay.gateway;
    const queryParams = new URLSearchParams();
    
    // 添加参数
    Object.keys(params).forEach(key => {
      queryParams.append(key, params[key]);
    });
    
    // 模拟签名（实际应用中需要使用私钥签名）
    queryParams.append('sign', 'MOCK_SIGNATURE_' + Date.now());
    
    return `${baseUrl}?${queryParams.toString()}`;
  }

  // 处理微信支付
  static async processWechatPayment(paymentData: PaymentData): Promise<PaymentResult> {
    try {
      // 检查微信支付配置
      if (!PAYMENT_CONFIG.wechat.appId || !PAYMENT_CONFIG.wechat.mchId) {
        throw new Error("微信支付配置缺失，请在.env文件中配置 VITE_WECHAT_APP_ID 和 VITE_WECHAT_MCH_ID");
      }

      console.log("开始处理微信支付:", paymentData);
      
      // 创建微信支付请求参数
      const wechatParams = {
        // 公共参数
        appid: PAYMENT_CONFIG.wechat.appId,
        mch_id: PAYMENT_CONFIG.wechat.mchId,
        nonce_str: this.generateNonceStr(),
        body: `订单支付 - ${paymentData.order_id}`,
        out_trade_no: paymentData.order_id,
        total_fee: Math.round(paymentData.amount * 100), // 微信支付使用分为单位
        spbill_create_ip: this.getClientIP(),
        notify_url: `${window.location.origin}/api/payment/wechat/notify`,
        trade_type: "NATIVE", // 二维码支付
        product_id: paymentData.order_id
      };

      // 在实际应用中，签名操作应该在服务器端进行
      // 这里我们模拟生成二维码支付URL
      const mockQRCodeUrl = this.generateWechatMockQRCode(wechatParams);
      
      console.log("微信支付二维码已生成", mockQRCodeUrl);
      
      return {
        success: true,
        paymentId: `wechat_${Date.now()}`,
        orderId: paymentData.order_id,
        amount: paymentData.amount,
        currency: "CNY",
        method: "wechat",
        message: "请使用微信扫码支付",
        redirectUrl: mockQRCodeUrl
      };
    } catch (error) {
      console.error("微信支付处理失败:", error);
      return {
        success: false,
        orderId: paymentData.order_id,
        amount: paymentData.amount,
        currency: "CNY",
        method: "wechat",
        message: error instanceof Error ? error.message : "支付处理失败"
      };
    }
  }

  // 生成随机字符串
  private static generateNonceStr(): string {
    return Math.random().toString(36).substr(2, 15);
  }

  // 获取客户端IP（模拟）
  private static getClientIP(): string {
    return '127.0.0.1'; // 在实际应用中需要从服务器获取真实IP
  }

  // 生成微信支付模拟二维码URL（实际应用中应在服务器端进行签名）
  private static generateWechatMockQRCode(params: any): string {
    // 模拟生成二维码内容
    const qrCodeData = `weixin://wxpay/bizpayurl?pr=mock_${Date.now()}&order=${params.out_trade_no}`;
    return qrCodeData;
  }

  // 根据支付方式处理支付
  static async processPayment(paymentData: PaymentData, method: string): Promise<PaymentResult> {
    switch (method) {
      case "stripe":
        return await this.processStripePayment(paymentData);
      case "alipay":
        return await this.processAlipayPayment(paymentData);
      case "wechat":
        return await this.processWechatPayment(paymentData);
      default:
        return {
          success: false,
          orderId: paymentData.order_id,
          amount: paymentData.amount,
          currency: "CNY",
          method: method,
          message: "不支持的支付方式"
        };
    }
  }
}