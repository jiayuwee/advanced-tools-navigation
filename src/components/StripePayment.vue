<template>
  <div class="stripe-payment" :class="{ 'payment-disabled': !enabled }">
    <div v-if="enabled">
      <div class="payment-header">
        <div class="payment-logo">
          <svg viewBox="0 0 28 28" class="stripe-logo">
            <path fill="#635bff" d="M13.3 11.9c0 .6-.4.9-1.2.9H9.6v-2h2.5c.8 0 1.2.3 1.2.1z"/>
            <path fill="#635bff" d="M20 7H8a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1zm-7.9 6.5c0-1.5-1.2-2.5-3-2.5H7.5v8h2.1v-2.8h1.3l1.6 2.8h2.3L13 15.2c.8-.5 1.1-1.2 1.1-1.7zm5.4 4.5h-2.1v-8h2.1v8z"/>
          </svg>
        </div>
        <h3>信用卡支付</h3>
      </div>
      
      <div class="payment-form">
        <div id="stripe-card-element" class="stripe-element"></div>
        <button 
          class="payment-button" 
          @click="handlePayment"
          :disabled="processing"
        >
          <span v-if="processing">处理中...</span>
          <span v-else>支付 ¥{{ amount }}</span>
        </button>
      </div>
    </div>
    
    <div v-else class="payment-disabled-message">
      <p>Stripe支付当前不可用</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, ref, onMounted } from "vue";
import { loadStripe } from "@stripe/stripe-js";
import type { Stripe, StripeElements, StripeCardElement } from "@stripe/stripe-js";

const props = defineProps({
  clientSecret: { type: String, required: true },
  amount: { type: [Number, String], required: true },
  orderId: { type: String, required: true },
});

const emit = defineEmits<{
  (e: "success", payload: { orderId: string; paymentId: string }): void;
  (e: "error", message: string): void;
  (e: "loading", isLoading: boolean): void;
}>();

const enabled = ref(!!import.meta.env.VITE_STRIPE_PUBLIC_KEY);
const processing = ref(false);
const stripe = ref<Stripe | null>(null);
const elements = ref<StripeElements | null>(null);
const cardElement = ref<StripeCardElement | null>(null);

onMounted(async () => {
  if (!enabled.value) return;

  try {
    stripe.value = await loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
    if (!stripe.value) throw new Error("Stripe初始化失败");

    elements.value = stripe.value.elements({ 
      clientSecret: props.clientSecret,
      appearance: {
        theme: "stripe",
        variables: {
          colorPrimary: "#635bff",
          borderRadius: "8px",
        }
      }
    });

    cardElement.value = elements.value.create("card");
    cardElement.value.mount("#stripe-card-element");
  } catch (error) {
    console.error("Stripe初始化错误:", error);
    emit("error", "支付系统初始化失败");
  }
});

async function handlePayment() {
  if (!stripe.value || !elements.value || !cardElement.value) {
    emit("error", "支付系统未就绪");
    return;
  }

  processing.value = true;
  emit("loading", true);

  try {
    const { error, paymentIntent } = await stripe.value.confirmPayment({
      elements: elements.value,
      confirmParams: {
        return_url: `${window.location.origin}/payment/success?order_id=${props.orderId}`,
      },
    });

    if (error) {
      throw new Error(error.message || "支付处理失败");
    }

    if (paymentIntent?.status === "succeeded") {
      emit("success", {
        orderId: props.orderId,
        paymentId: paymentIntent.id,
      });
    } else {
      throw new Error(`支付状态异常: ${paymentIntent?.status}`);
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
.stripe-payment {
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

.stripe-logo {
  width: 100%;
  height: 100%;
}

.payment-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.stripe-element {
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: white;
}

.payment-button {
  padding: 0.75rem;
  border: none;
  border-radius: 8px;
  background: var(--stripe-DEFAULT);
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.payment-button:hover:not(:disabled) {
  background: var(--stripe-light);
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
