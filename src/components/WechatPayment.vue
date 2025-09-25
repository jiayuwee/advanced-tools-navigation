<template>
  <div class="wechat-payment" :class="{ 'payment-disabled': !enabled }">
    <div v-if="enabled">
      <div class="payment-header">
        <div class="payment-logo">
          <svg viewBox="0 0 1024 1024" class="wechat-logo">
            <path fill="#07c160" d="M601.1 556.5c-31.5-12.2-65.3-19.1-100.6-19.1-35.3 0-69.1 6.9-100.6 19.1-9.9 3.8-16.9 13.1-16.9 23.6 0 10.5 7 19.8 16.9 23.6 31.5 12.2 65.3 19.1 100.6 19.1 35.3 0 69.1-6.9 100.6-19.1 9.9-3.8 16.9-13.1 16.9-23.6 0-10.5-7-19.8-16.9-23.6z"/>
            <path fill="#07c160" d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z"/>
          </svg>
        </div>
        <h3>微信支付</h3>
      </div>

      <div class="payment-content">
        <p class="amount">应付金额：<span>¥{{ amount }}</span></p>
        <div class="qrcode-container">
          <div class="qrcode-placeholder" v-if="!qrcodeUrl">
            正在生成支付二维码...
          </div>
          <img v-else :src="qrcodeUrl" alt="微信支付二维码" class="qrcode-image">
        </div>
        <p class="tips">请使用微信扫一扫完成支付</p>
      </div>

      <div class="payment-actions">
        <button class="action-button cancel" @click="onCancel">取消</button>
        <button class="action-button confirm" @click="checkPaymentStatus">
          我已支付
        </button>
      </div>
    </div>

    <div v-else class="payment-disabled-message">
      <p>微信支付当前不可用</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, ref, onMounted } from "vue";
import { PaymentService } from "@/services/paymentService";

const props = defineProps({
  orderId: { type: String, required: true },
  amount: { type: [Number, String], required: true },
});

const emit = defineEmits<{
  (e: "success", payload: { orderId: string; paymentId: string }): void;
  (e: "error", message: string): void;
  (e: "loading", isLoading: boolean): void;
  (e: "cancel"): void;
}>();

const enabled = ref(!!import.meta.env.VITE_WECHAT_APP_ID);
const qrcodeUrl = ref("");
const checking = ref(false);
const errorMessage = ref("");

onMounted(async () => {
  if (!enabled.value) return;

  try {
    emit("loading", true);
    const result = await PaymentService.processPayment(
      {
        order_id: props.orderId,
        payment_method: "wechat",
        amount: Number(props.amount),
      },
      "wechat"
    );

    if (result.success && result.redirectUrl) {
      // 模拟生成二维码
      qrcodeUrl.value = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><rect width='200' height='200' fill='white'/><text x='100' y='100' font-family='Arial' font-size='14' text-anchor='middle' fill='black'>微信支付模拟二维码</text></svg>`;
    } else {
      throw new Error(result.message || "微信支付初始化失败");
    }
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "支付初始化失败";
    emit("error", errorMessage.value);
  } finally {
    emit("loading", false);
  }
});

async function checkPaymentStatus() {
  checking.value = true;
  emit("loading", true);

  try {
    // 模拟支付成功
    setTimeout(() => {
      emit("success", {
        orderId: props.orderId,
        paymentId: `wechat_${Date.now()}`,
      });
      checking.value = false;
      emit("loading", false);
    }, 1000);
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "支付状态检查失败";
    emit("error", errorMessage.value);
    checking.value = false;
    emit("loading", false);
  }
}

function onCancel() {
  emit("cancel");
}
</script>

<style scoped>
.wechat-payment {
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

.wechat-logo {
  width: 100%;
  height: 100%;
}

.payment-content {
  text-align: center;
  margin-bottom: 1.5rem;
}

.amount {
  font-size: 1rem;
  color: #323130;
  margin-bottom: 1rem;
}

.amount span {
  font-weight: 700;
  color: var(--wechat-DEFAULT);
}

.qrcode-container {
  margin: 1rem auto;
  width: 200px;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

.qrcode-placeholder {
  color: #64748b;
  font-size: 0.875rem;
}

.qrcode-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.tips {
  color: #64748b;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.payment-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.action-button {
  flex: 1;
  padding: 0.75rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.action-button.cancel {
  background: #f3f4f6;
  color: #64748b;
}

.action-button.cancel:hover {
  background: #e5e7eb;
}

.action-button.confirm {
  background: var(--wechat-DEFAULT);
  color: white;
}

.action-button.confirm:hover {
  background: var(--wechat-dark);
}

.action-button:disabled {
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
