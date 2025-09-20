<!-- 支付宝支付组件 -->
<template>
  <div class="alipay-payment">
    <div v-if="isLoading" class="loading">
      <div class="spinner"></div>
      <p>正在跳转到支付宝...</p>
    </div>
    
    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
      <button @click="retryPayment" class="retry-btn">重试</button>
    </div>
    
    <div v-else class="payment-form">
      <div class="alipay-logo">
        <div class="logo-placeholder">
          <span style="font-size: 2rem; color: #1677ff;">💳</span>
          <p>支付宝</p>
        </div>
      </div>
      
      <h3>支付宝安全支付</h3>
      
      <div class="payment-summary">
        <p>订单金额: ¥{{ amount }}</p>
        <p>订单号: {{ orderId }}</p>
      </div>
      
      <div class="payment-info">
        <div class="info-item">
          <span class="icon">🔒</span>
          <span>安全加密传输</span>
        </div>
        <div class="info-item">
          <span class="icon">⚡</span>
          <span>极速到账</span>
        </div>
        <div class="info-item">
          <span class="icon">✓</span>
          <span>支持多种付款方式</span>
        </div>
      </div>
      
      <button 
        @click="handlePayment" 
        :disabled="isProcessing"
        class="pay-button"
      >
        <span v-if="isProcessing">处理中...</span>
        <span v-else>确认支付 ¥{{ amount }}</span>
      </button>
      
      <div class="payment-notice">
        <p>点击支付按钮后，将跳转到支付宝官方支付页面</p>
        <p>请在新页面中完成支付，支付完成后会自动返回</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { PaymentService } from '@/services/paymentService'

// Props
interface Props {
  amount: number
  orderId: string
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  success: [paymentResult: any]
  error: [error: string]
}>()

// 响应式数据
const isLoading = ref(false)
const isProcessing = ref(false)
const error = ref('')

// 处理支付
const handlePayment = async () => {
  try {
    isProcessing.value = true
    error.value = ''

    console.log('开始处理支付宝支付', { orderId: props.orderId, amount: props.amount })

    // 调用支付服务创建支付宝支付
    const paymentResult = await PaymentService.processAlipayPayment({
      order_id: props.orderId,
      payment_method: 'alipay',
      payment_id: `ALIPAY_${Date.now()}`,
      amount: props.amount
    })

    if (paymentResult.success && paymentResult.redirectUrl) {
      // 跳转到支付宝支付页面
      console.log('跳转到支付宝支付页面:', paymentResult.redirectUrl)
      
      // 在实际应用中，这里会跳转到支付宝支付页面
      // window.open(paymentResult.redirectUrl, '_self')
      
      // 模拟支付流程：显示跳转信息，然后模拟支付完成
      isLoading.value = true
      
      // 模拟跳转延迟
      setTimeout(() => {
        // 模拟支付成功
        const mockSuccessResult = {
          paymentId: paymentResult.paymentId,
          orderId: props.orderId,
          amount: props.amount,
          method: 'alipay',
          status: 'success',
          transactionId: `alipay_${Date.now()}`
        }
        
        emit('success', mockSuccessResult)
        isLoading.value = false
      }, 3000) // 3秒后模拟支付完成
      
    } else {
      throw new Error(paymentResult.message || '支付宝支付创建失败')
    }
  } catch (err) {
    console.error('支付宝支付失败:', err)
    const errorMessage = err instanceof Error ? err.message : '支付处理失败'
    error.value = errorMessage
    emit('error', errorMessage)
    isLoading.value = false
  } finally {
    isProcessing.value = false
  }
}

// 重试支付
const retryPayment = () => {
  error.value = ''
  handlePayment()
}
</script>

<style scoped>
.alipay-payment {
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
  border-top: 3px solid #1677ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error {
  text-align: center;
  color: #e74c3c;
  padding: 20px;
}

.retry-btn {
  margin-top: 16px;
  padding: 8px 16px;
  background: #1677ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.retry-btn:hover {
  background: #0958d9;
}

.alipay-logo {
  text-align: center;
  margin-bottom: 20px;
}

.logo-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.logo-placeholder p {
  margin: 0;
  font-weight: 600;
  color: #1677ff;
}

.alipay-logo img {
  width: 120px;
  height: auto;
}

.payment-form h3 {
  margin-bottom: 20px;
  color: #32325d;
  text-align: center;
  font-size: 1.25rem;
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

.payment-info {
  margin-bottom: 24px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  color: #525f7f;
  font-size: 0.875rem;
}

.icon {
  font-size: 1rem;
}

.pay-button {
  width: 100%;
  padding: 16px;
  background: #1677ff;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.15s ease;
  margin-bottom: 16px;
}

.pay-button:hover:not(:disabled) {
  background: #0958d9;
}

.pay-button:disabled {
  background: #aab7c4;
  cursor: not-allowed;
}

.payment-notice {
  background: #fff7e6;
  border: 1px solid #ffd666;
  border-radius: 4px;
  padding: 12px;
  font-size: 0.875rem;
  color: #d48806;
}

.payment-notice p {
  margin: 2px 0;
}
</style>