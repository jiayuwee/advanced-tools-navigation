<template>
  <div class="wechat-payment">
    <div class="payment-card">
      <div class="header">
        <img class="logo" src="/payment-wechat.png" alt="微信支付" />
        <h3>微信支付</h3>
      </div>

      <div class="content">
        <p class="amount">应付金额：<span>¥{{ amount }}</span></p>
        <div class="qrcode-box">
          <div class="qrcode-placeholder">二维码加载中</div>
        </div>
        <p class="tips">请使用微信扫一扫完成支付</p>
      </div>

      <div class="actions">
        <button class="btn cancel" @click="onCancel">取消</button>
        <button class="btn primary" @click="mockPaySuccess">我已完成支付</button>
      </div>
    </div>
  </div>
  
  <div v-if="errorMessage" class="error">{{ errorMessage }}</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

const props = defineProps<{
  amount: number | string;
  orderId: string;
}>();

const emit = defineEmits<{
  (e: "success", payload: { orderId: string }): void;
  (e: "error", message: string): void;
  (e: "cancel"): void;
}>();

const errorMessage = ref("");

onMounted(() => {
  // 这里通常会请求后端生成微信支付二维码链接
  // 当前为占位实现，确保构建通过
});

const mockPaySuccess = () => {
  try {
    emit("success", { orderId: props.orderId });
  } catch (err) {
    emit("error", err instanceof Error ? err.message : "支付回调处理失败");
  }
};

const onCancel = () => {
  emit("cancel");
};
</script>

<style scoped>
.wechat-payment {
  display: flex;
  justify-content: center;
}

.payment-card {
  width: 100%;
  max-width: 420px;
  background: #ffffff;
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
}

.header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.logo {
  width: 28px;
  height: 28px;
}

.content {
  text-align: center;
}

.amount {
  font-size: 0.95rem;
  color: #323130;
}

.amount span {
  font-weight: 700;
  color: #16a34a;
}

.qrcode-box {
  margin: 1rem 0;
  display: flex;
  justify-content: center;
}

.qrcode-placeholder {
  width: 200px;
  height: 200px;
  border-radius: 8px;
  background: repeating-linear-gradient(
      45deg,
      #f3f4f6,
      #f3f4f6 10px,
      #e5e7eb 10px,
      #e5e7eb 20px
    );
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  font-size: 0.875rem;
}

.tips {
  color: #6b7280;
  font-size: 0.85rem;
}

.actions {
  margin-top: 1rem;
  display: flex;
  gap: 0.75rem;
}

.btn {
  flex: 1;
  padding: 0.625rem 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  font-weight: 600;
}

.btn.primary {
  background: #22c55e;
  border-color: #22c55e;
  color: #fff;
}

.btn.cancel:hover {
  background: #f3f4f6;
}

.btn.primary:hover {
  background: #16a34a;
  border-color: #16a34a;
}

.error {
  margin-top: 0.75rem;
  text-align: center;
  color: #dc2626;
}
</style>


