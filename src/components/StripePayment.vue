<template>
  <div class="stripe-payment-placeholder">
    <p>Stripe 支付占位组件（构建时使用）。</p>
    <button @click="simulateSuccess">模拟支付成功</button>
    <button @click="simulateError">模拟支付失败</button>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  clientSecret: { type: String, default: '' },
  amount: { type: [Number, String], default: 0 },
  orderId: { type: String, default: '' },
})

const emit = defineEmits(['success', 'error'])

function simulateSuccess() {
  // emit a success payload similar to real integration
  emit('success', { orderId: props.orderId })
}

function simulateError() {
  emit('error', '模拟支付错误')
}
</script>

<style scoped>
.stripe-payment-placeholder {
  padding: 1rem;
  border: 1px dashed #ccc;
  border-radius: 8px;
}
.stripe-payment-placeholder button {
  margin-right: 0.5rem;
}
</style>
