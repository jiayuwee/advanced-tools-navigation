<template>
  <div class="alipay-payment" :class="{ 'payment-disabled': !enabled }">
    <div v-if="enabled">
      <div class="payment-header">
        <div class="payment-logo">
          <svg viewBox="0 0 1024 1024" class="alipay-logo">
            <path fill="#1677ff" d="M648.9 622.7h-57.4c-1.9 0-3.7-0.8-5-2.1-1.3-1.3-2.1-3.1-2.1-5v-38.4c0-1.9 0.8-3.7 2.1-5 1.3-1.3 3.1-2.1 5-2.1h57.4c1.9 0 3.7 0.8 5 2.1 1.3 1.3 2.1 3.1 2.1 5v38.4c0 1.9-0.8 3.7-2.1 5-1.3 1.3-3.1 2.1-5 2.1z"/>
            <path fill="#1677ff" d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372zm231.1-518.7c-1.3-1.3-3.1-2.1-5-2.1h-57.4c-1.9 0-3.7 0.8-5 2.1-1.3 1.3-2.1 3.1-2.1 5v38.4c0 1.9 0.8 3.7 2.1 5 1.3 1.3 3.1 2.1 5 2.1h57.4c1.9 0 3.7-0.8 5-2.1 1.3-1.3 2.1-3.1 2.1-5v-38.4c0-1.9-0.8-3.7-2.1-5z"/>
          </svg>
        </div>
        <h3>支付宝支付</h3>
      </div>

      <div class="payment-form">
        <button 
          class="payment-button"
          @click="handlePayment"
          :disabled="processing"
        >
          <span v-if="processing">跳转中...</span>
          <span v-else>支付 ¥{{ amount }}</span>
        </button>
      </div>
    </div>

    <div v-else class="payment-disabled-message">
      <p>支付宝支付当前不可用</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, ref } from "vue";
import { PaymentService } from "@/services/paymentService";

const props = defineProps({
  orderId: { type: String, required: true },
  amount: { type: [Number, String], required: true },
});

const emit = defineEmits({
  success: (payload: { orderId: string; paymentId: string }) => true,
  error: (message: string) => true,
  loading: (isLoading: boolean) => true
});

const enabled = ref(!!import.meta.env.VITE_ALIPAY_APP_ID);
const processing = ref(false);

async function handlePayment() {
  if (!enabled.value) {
    emit("error", "支付宝支付未配置");
    return;
  }

  processing.value = true;
  emit("loading", true);

  try {
    const result = await PaymentService.processPayment(
      {
        order_id: props.orderId,
        payment_method: "alipay",
        amount: Number(props.amount),
      },
      "alipay"
    );

    if (result.success && result.redirectUrl) {
      // 在实际应用中这里会跳转到支付宝支付页面
      // 模拟支付成功回调
      setTimeout(() => {
        emit("success", {
          orderId: props.orderId,
          paymentId: result.paymentId || `alipay_${Date.now()}`,
        });
      }, 2000);
    } else {
      throw new Error(result.message || "支付宝支付处理失败");
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "支付处理失败";
    emit("error", message);
  } finally {
    processing.value = false;
    emit("loading", false);
  }
}
</script>

<style scoped>
.alipay-payment {
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  padding: 1.5rem;
  border-radius: 12px;
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.payment-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.payment-logo {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.alipay-logo {
  width: 100%;
  height: 100%;
}

.payment-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.payment-button {
  padding: 0.75rem;
  border: none;
  border-radius: 8px;
  background: var(--alipay-DEFAULT);
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.payment-button:hover:not(:disabled) {
  background: var(--alipay-light);
}

.payment-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.payment-disabled-message {
  padding: 1rem;
  text-align: center;
  color: #64748b;
}

.payment-disabled {
  opacity: 0.6;
  pointer-events: none;
}
</style>
