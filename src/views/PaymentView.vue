<template>
  <div class="payment-view">
    <div class="payment-container">
      <div class="payment-header">
        <h1>支付订单</h1>
        <p>请选择支付方式完成购买</p>
      </div>

      <div class="payment-content">
        <!-- 订单信息 -->
        <div class="order-summary">
          <h3>订单信息</h3>
          <div class="order-items">
            <div v-for="item in orderItems" :key="item.id" class="order-item">
              <div class="item-image">
                <img :src="item.image" :alt="item.name" />
              </div>
              <div class="item-info">
                <h4 class="item-name">{{ item.name }}</h4>
                <p class="item-description">{{ item.description }}</p>
                <div class="item-meta">
                  <span class="item-quantity">数量: {{ item.quantity }}</span>
                  <span class="item-price">¥{{ item.price }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="order-total">
            <div class="total-row">
              <span>商品总额</span>
              <span>¥{{ subtotal }}</span>
            </div>
            <div class="total-row">
              <span>优惠折扣</span>
              <span class="discount">-¥{{ discount }}</span>
            </div>
            <div class="total-row final">
              <span>应付金额</span>
              <span class="final-amount">¥{{ finalAmount }}</span>
            </div>
          </div>
        </div>

        <!-- 支付方式 -->
        <div class="payment-methods">
          <h3>选择支付方式</h3>
          <div class="methods-list">
            <label
              v-for="method in paymentMethods"
              :key="method.id"
              class="method-option"
              :class="{ selected: selectedMethod === method.id }"
            >
              <input
                v-model="selectedMethod"
                type="radio"
                :value="method.id"
                name="paymentMethod"
              />
              <div class="method-content">
                <div class="method-icon">
                  <img :src="method.icon" :alt="method.name" />
                </div>
                <div class="method-info">
                  <div class="method-name">{{ method.name }}</div>
                  <div class="method-description">{{ method.description }}</div>
                </div>
                <div class="method-check">
                  <CheckIcon class="check-icon" />
                </div>
              </div>
            </label>
          </div>
        </div>

        <!-- 账单地址 -->
        <div class="billing-address">
          <h3>账单地址</h3>
          <form class="address-form">
            <div class="form-row">
              <div class="form-group">
                <label for="fullName">姓名 *</label>
                <input
                  id="fullName"
                  v-model="billingInfo.fullName"
                  type="text"
                  required
                  placeholder="请输入姓名"
                />
              </div>
              <div class="form-group">
                <label for="email">邮箱 *</label>
                <input
                  id="email"
                  v-model="billingInfo.email"
                  type="email"
                  required
                  placeholder="请输入邮箱地址"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="country">国家/地区 *</label>
                <select id="country" v-model="billingInfo.country" required>
                  <option value="">请选择国家/地区</option>
                  <option value="CN">中国</option>
                  <option value="US">美国</option>
                  <option value="JP">日本</option>
                </select>
              </div>
              <div class="form-group">
                <label for="city">城市 *</label>
                <input
                  id="city"
                  v-model="billingInfo.city"
                  type="text"
                  required
                  placeholder="请输入城市"
                />
              </div>
            </div>

            <div class="form-group">
              <label for="address">详细地址 *</label>
              <input
                id="address"
                v-model="billingInfo.address"
                type="text"
                required
                placeholder="请输入详细地址"
              />
            </div>
          </form>
        </div>

        <!-- 支付按钮 -->
        <div class="payment-actions">
          <button class="cancel-btn" @click="goBack">取消订单</button>
          <button
            class="pay-btn"
            :disabled="!canPay || loading"
            @click="handlePayment"
          >
            <div v-if="loading" class="loading-spinner"></div>
            <span>{{
              loading ? "处理中..." : `立即支付 ¥${finalAmount}`
            }}</span>
          </button>
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { CheckIcon } from "lucide-vue-next";

const router = useRouter();
const route = useRoute();

// 响应式状态
const loading = ref(false);
const error = ref<string | null>(null);
const selectedMethod = ref("");

const orderItems = ref([
  {
    id: "1",
    name: "高效办公套件",
    description: "提升办公效率的完整解决方案",
    quantity: 1,
    price: 299,
    image: "/placeholder.jpg",
  },
]);

const billingInfo = ref({
  fullName: "",
  email: "",
  country: "",
  city: "",
  address: "",
});

const paymentMethods = [
  {
    id: "alipay",
    name: "支付宝",
    description: "使用支付宝安全快捷支付",
    icon: "/payment-alipay.png",
  },
  {
    id: "wechat",
    name: "微信支付",
    description: "使用微信支付便捷支付",
    icon: "/payment-wechat.png",
  },
  {
    id: "stripe",
    name: "信用卡",
    description: "支持 Visa、MasterCard 等",
    icon: "/payment-stripe.png",
  },
];

// 计算属性
const subtotal = computed(() => {
  return orderItems.value.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
});

const discount = computed(() => 0); // 暂时没有折扣

const finalAmount = computed(() => subtotal.value - discount.value);

const canPay = computed(() => {
  return (
    selectedMethod.value &&
    billingInfo.value.fullName &&
    billingInfo.value.email &&
    billingInfo.value.country &&
    billingInfo.value.city &&
    billingInfo.value.address
  );
});

// 方法
const loadOrderData = () => {
  // TODO: 根据路由参数加载订单数据
  const productId = route.query.product;
  const orderId = route.query.order;

  if (productId) {
    // 从产品创建订单
    console.log("从产品创建订单:", productId);
  } else if (orderId) {
    // 加载现有订单
    console.log("加载现有订单:", orderId);
  }
};

const handlePayment = async () => {
  try {
    loading.value = true;
    error.value = null;

    // 导入必要的服务
    const { OrderService } = await import("@/services/orderService");
    const { useAuthStore } = await import("@/stores/auth");

    const authStore = useAuthStore();
    if (!authStore.user) {
      throw new Error("请先登录");
    }

    // 创建订单（如果还没有）
    let orderId = route.query.order as string;

    if (!orderId) {
      // 从产品创建新订单
      const productId = route.query.product as string;
      if (!productId) {
        throw new Error("缺少产品信息");
      }

      const orderData = {
        productId,
        quantity: 1,
        billingAddress: billingInfo.value,
      };

      const newOrder = await OrderService.createOrder(
        orderData,
        authStore.user.id,
      );
      orderId = newOrder.id;
    }

    // 模拟支付处理
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // 处理支付成功
    await OrderService.processPayment({
      orderId,
      paymentMethod: selectedMethod.value!,
      paymentId: `PAY_${Date.now()}`, // 模拟支付ID
      amount: finalAmount.value,
    });

    // 支付成功，跳转到成功页面
    router.push({
      path: "/payment/success",
      query: {
        order: orderId,
        amount: finalAmount.value.toString(),
      },
    });
  } catch (err) {
    error.value = err instanceof Error ? err.message : "支付失败，请重试";
  } finally {
    loading.value = false;
  }
};

const goBack = () => {
  router.go(-1);
};

// 生命周期
onMounted(() => {
  loadOrderData();
  // 默认选择第一个支付方式
  if (paymentMethods.length > 0) {
    selectedMethod.value = paymentMethods[0].id;
  }
});
</script>

<style scoped>
.payment-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.payment-container {
  max-width: 800px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 1rem 3rem rgba(0, 0, 0, 0.1);
}

.payment-header {
  text-align: center;
  margin-bottom: 2rem;
}

.payment-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #323130;
  margin: 0 0 0.5rem 0;
}

.payment-header p {
  color: #605e5c;
  margin: 0;
}

.payment-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* 订单信息 */
.order-summary h3,
.payment-methods h3,
.billing-address h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #323130;
  margin: 0 0 1rem 0;
}

.order-items {
  margin-bottom: 1.5rem;
}

.order-item {
  display: flex;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid #e1dfdd;
}

.order-item:last-child {
  border-bottom: none;
}

.item-image {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-info {
  flex: 1;
}

.item-name {
  font-size: 1rem;
  font-weight: 600;
  color: #323130;
  margin: 0 0 0.25rem 0;
}

.item-description {
  color: #605e5c;
  font-size: 0.875rem;
  margin: 0 0 0.5rem 0;
}

.item-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: #8a8886;
}

.item-price {
  font-weight: 600;
  color: #323130;
}

.order-total {
  border-top: 1px solid #e1dfdd;
  padding-top: 1rem;
}

.total-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.total-row.final {
  font-size: 1.125rem;
  font-weight: 700;
  color: #323130;
  border-top: 1px solid #e1dfdd;
  padding-top: 0.5rem;
  margin-top: 0.5rem;
}

.discount {
  color: #16a34a;
}

.final-amount {
  color: #d13438;
}

/* 支付方式 */
.methods-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.method-option {
  display: block;
  cursor: pointer;
}

.method-option input {
  display: none;
}

.method-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 2px solid #e1dfdd;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.method-option:hover .method-content {
  border-color: #0078d4;
}

.method-option.selected .method-content {
  border-color: #0078d4;
  background: rgba(0, 120, 212, 0.05);
}

.method-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.method-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.method-info {
  flex: 1;
}

.method-name {
  font-weight: 600;
  color: #323130;
  margin-bottom: 0.25rem;
}

.method-description {
  font-size: 0.875rem;
  color: #605e5c;
}

.method-check {
  opacity: 0;
  transition: opacity 0.2s ease;
}

.method-option.selected .method-check {
  opacity: 1;
}

.check-icon {
  width: 20px;
  height: 20px;
  color: #0078d4;
}

/* 账单地址 */
.address-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  color: #323130;
}

.form-group input,
.form-group select {
  padding: 0.75rem;
  border: 1px solid #e1dfdd;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #0078d4;
  box-shadow: 0 0 0 2px rgba(0, 120, 212, 0.2);
}

/* 支付按钮 */
.payment-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.cancel-btn,
.pay-btn {
  padding: 0.875rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-btn {
  background: transparent;
  color: #605e5c;
  border: 1px solid #e1dfdd;
}

.cancel-btn:hover {
  background: #f3f2f1;
}

.pay-btn {
  background: #0078d4;
  color: white;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.pay-btn:hover:not(:disabled) {
  background: #106ebe;
}

.pay-btn:disabled {
  background: #c8c6c4;
  cursor: not-allowed;
}

.loading-spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid transparent;
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.error-message {
  padding: 0.75rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 0.5rem;
  color: #dc2626;
  font-size: 0.875rem;
  text-align: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .payment-view {
    padding: 1rem;
  }

  .payment-container {
    padding: 1.5rem;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .payment-actions {
    flex-direction: column;
  }

  .method-content {
    flex-direction: column;
    text-align: center;
  }
}
</style>
