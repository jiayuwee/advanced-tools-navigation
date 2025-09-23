<!-- Stripe 支付组件 -->
<template>
  <div class="stripe-payment">
    <div v-if="isLoading" class="loading">
      <div class="spinner"></div>
      <p>正在初始化支付...</p>
    </div>

    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
      <button class="retry-btn" @click="retryPayment">重试</button>
    </div>

    <div v-else class="payment-form">
      <h3>Stripe 信用卡支付</h3>
      <div class="payment-summary">
        <p>订单金额: ¥{{ amount }}</p>
        <p>订单号: {{ orderId }}</p>
      </div>

      <!-- Stripe Elements 容器 -->
      <div ref="cardElement" class="card-element"></div>

      <button
        :disabled="isProcessing || !isCardComplete"
        class="pay-button"
        @click="handlePayment"
      >
        <span v-if="isProcessing">处理中...</span>
        <span v-else>确认支付 ¥{{ amount }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { loadStripe } from "@stripe/stripe-js";
import type {
  Stripe,
  StripeElements,
  StripeCardElement,
} from "@stripe/stripe-js";

// Props
interface Props {
  clientSecret: string;
  amount: number;
  orderId: string;
}

const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
  success: [paymentResult: any];
  error: [error: string];
}>();

// 响应式数据
const isLoading = ref(true);
const isProcessing = ref(false);
const isCardComplete = ref(false);
const error = ref("");
const cardElement = ref<HTMLElement>();

// Stripe 实例
let stripe: Stripe | null = null;
let elements: StripeElements | null = null;
let card: StripeCardElement | null = null;

// 初始化 Stripe
const initializeStripe = async () => {
  try {
    const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
    if (!stripePublicKey) {
      throw new Error("Stripe 公钥未配置");
    }

    stripe = await loadStripe(stripePublicKey);
    if (!stripe) {
      throw new Error("Stripe 加载失败");
    }

    // 创建 Elements
    elements = stripe.elements();

    // 创建卡片元素
    card = elements.create("card", {
      style: {
        base: {
          fontSize: "16px",
          color: "#424770",
          "::placeholder": {
            color: "#aab7c4",
          },
        },
        invalid: {
          color: "#9e2146",
        },
      },
    });

    // 挂载卡片元素
    if (cardElement.value) {
      card.mount(cardElement.value);
    }

    // 监听卡片变化
    card.on("change", (event) => {
      if (event.error) {
        error.value = event.error.message || "卡片信息有误";
      } else {
        error.value = "";
      }
      isCardComplete.value = event.complete;
    });

    isLoading.value = false;
  } catch (err) {
    console.error("Stripe 初始化失败:", err);
    error.value = err instanceof Error ? err.message : "Stripe 初始化失败";
    isLoading.value = false;
  }
};

// 处理支付
const handlePayment = async () => {
  if (!stripe || !card) {
    error.value = "Stripe 未正确初始化";
    return;
  }

  isProcessing.value = true;
  error.value = "";

  try {
    const { error: paymentError, paymentIntent } =
      await stripe.confirmCardPayment(props.clientSecret, {
        payment_method: {
          card: card,
          billing_details: {
            // 可以添加账单详情
          },
        },
      });

    if (paymentError) {
      throw new Error(paymentError.message);
    }

    if (paymentIntent.status === "succeeded") {
      emit("success", {
        paymentId: paymentIntent.id,
        orderId: props.orderId,
        amount: props.amount,
        method: "stripe",
        status: "succeeded",
      });
    } else {
      throw new Error(`支付状态异常: ${paymentIntent.status}`);
    }
  } catch (err) {
    console.error("支付失败:", err);
    const errorMessage = err instanceof Error ? err.message : "支付处理失败";
    error.value = errorMessage;
    emit("error", errorMessage);
  } finally {
    isProcessing.value = false;
  }
};

// 重试支付
const retryPayment = () => {
  error.value = "";
  isLoading.value = true;
  initializeStripe();
};

// 组件挂载时初始化
onMounted(() => {
  initializeStripe();
});

// 组件卸载时清理
onUnmounted(() => {
  if (card) {
    card.destroy();
  }
});
</script>

<style scoped>
.stripe-payment {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  background: white;
}

.loading {
  text-align: center;
  padding: 40px 20px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #5469d4;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.error {
  text-align: center;
  color: #e74c3c;
  padding: 20px;
}

.retry-btn {
  margin-top: 16px;
  padding: 8px 16px;
  background: #5469d4;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.retry-btn:hover {
  background: #4053c4;
}

.payment-form h3 {
  margin-bottom: 20px;
  color: #32325d;
  text-align: center;
}

.payment-summary {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.payment-summary p {
  margin: 4px 0;
  color: #525f7f;
}

.card-element {
  padding: 16px;
  border: 1px solid #e1e5e9;
  border-radius: 4px;
  background: white;
  margin-bottom: 20px;
  transition: border-color 0.15s ease;
}

.card-element:focus-within {
  border-color: #5469d4;
  box-shadow: 0 0 0 2px rgba(84, 105, 212, 0.1);
}

.pay-button {
  width: 100%;
  padding: 16px;
  background: #5469d4;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.pay-button:hover:not(:disabled) {
  background: #4053c4;
}

.pay-button:disabled {
  background: #aab7c4;
  cursor: not-allowed;
}

.error {
  color: #e74c3c;
  font-size: 14px;
  margin-top: 8px;
}
</style>
