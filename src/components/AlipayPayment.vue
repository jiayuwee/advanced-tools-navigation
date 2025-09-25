<template>
  <div class="alipay-payment-placeholder">
    <p>Alipay 支付占位组件（构建时使用）。</p>
    <button @click="simulateSuccess">模拟支付成功</button>
    <button @click="simulateError">模拟支付失败</button>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from "vue";

const props = defineProps({
  orderId: { type: String, default: "" },
  amount: { type: [Number, String], default: 0 },
});

const emit = defineEmits(["success", "error"]);

function simulateSuccess() {
  emit("success", { orderId: props.orderId });
}

function simulateError() {
  emit("error", "模拟 Alipay 支付错误");
}
</script>

<style scoped>
.alipay-payment-placeholder {
  padding: 1rem;
  border: 1px dashed #ccc;
  border-radius: 8px;
}
.alipay-payment-placeholder button {
  margin-right: 0.5rem;
}
</style>
