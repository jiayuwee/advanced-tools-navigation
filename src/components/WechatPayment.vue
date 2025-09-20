<!-- 微信支付组件 -->
<template>
  <div class="wechat-payment">
    <div v-if="isLoading" class="loading">
      <div class="spinner"></div>
      <p>正在生成支付二维码...</p>
    </div>
    
    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
      <button @click="retryPayment" class="retry-btn">重试</button>
    </div>
    
    <div v-else class="payment-form">
      <div class="wechat-logo">
        <div class="logo-placeholder">
          <span style="font-size: 2rem; color: #07c160;">💬</span>
          <p>微信支付</p>
        </div>
      </div>
      
      <h3>微信扫码支付</h3>
      
      <div class="payment-summary">
        <p>订单金额: ¥{{ amount }}</p>
        <p>订单号: {{ orderId }}</p>
      </div>
      
      <div v-if="qrCodeUrl" class="qr-code-section">
        <div class="qr-code">
          <div class="qr-placeholder">
            <div class="qr-icon">📱</div>
            <p>二维码支付</p>
            <small>{{ qrCodeUrl }}</small>
          </div>
        </div>
        
        <div class="scan-instructions">
          <div class="instruction-step">
            <span class="step-number">1</span>
            <span>打开微信"扫一扫"</span>
          </div>
          <div class="instruction-step">
            <span class="step-number">2</span>
            <span>扫描上方二维码</span>
          </div>
          <div class="instruction-step">
            <span class="step-number">3</span>
            <span>确认支付金额</span>
          </div>
          <div class="instruction-step">
            <span class="step-number">4</span>
            <span>完成支付</span>
          </div>
        </div>
      </div>
      
      <div v-else class="generate-qr">
        <button 
          @click="generateQRCode" 
          :disabled="isProcessing"
          class="generate-btn"
        >
          <span v-if="isProcessing">生成中...</span>
          <span v-else>生成支付二维码</span>
        </button>
      </div>
      
      <div class="payment-status">
        <div class="status-item">
          <span class="status-icon">⏱️</span>
          <span>支付有效期：{{ formatTime(remainingTime) }}</span>
        </div>
        <div class="status-item">
          <span class="status-icon">🔄</span>
          <span>正在等待支付...</span>
        </div>
      </div>
      
      <div class="payment-actions">
        <button @click="checkPaymentStatus" class="check-btn">
          检查支付状态
        </button>
        <button @click="cancelPayment" class="cancel-btn">
          取消支付
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
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
  cancel: []
}>()

// 响应式数据
const isLoading = ref(false)
const isProcessing = ref(false)
const error = ref('')
const qrCodeUrl = ref('')
const remainingTime = ref(30 * 60) // 30分钟倒计时
const paymentCheckInterval = ref<NodeJS.Timeout>()
const countdownInterval = ref<NodeJS.Timeout>()

// 生成二维码
const generateQRCode = async () => {
  try {
    isProcessing.value = true
    error.value = ''

    console.log('开始生成微信支付二维码', { orderId: props.orderId, amount: props.amount })

    // 调用支付服务创建微信支付
    const paymentResult = await PaymentService.processWechatPayment({
      order_id: props.orderId,
      payment_method: 'wechat',
      payment_id: `WECHAT_${Date.now()}`,
      amount: props.amount
    })

    if (paymentResult.success && paymentResult.redirectUrl) {
      qrCodeUrl.value = paymentResult.redirectUrl
      
      // 开始检查支付状态
      startPaymentStatusCheck()
      
      // 开始倒计时
      startCountdown()
      
      console.log('微信支付二维码已生成:', paymentResult.redirectUrl)
    } else {
      throw new Error(paymentResult.message || '微信支付二维码生成失败')
    }
  } catch (err) {
    console.error('微信支付二维码生成失败:', err)
    const errorMessage = err instanceof Error ? err.message : '二维码生成失败'
    error.value = errorMessage
    emit('error', errorMessage)
  } finally {
    isProcessing.value = false
  }
}

// 开始检查支付状态
const startPaymentStatusCheck = () => {
  paymentCheckInterval.value = setInterval(async () => {
    await checkPaymentStatus()
  }, 3000) // 每3秒检查一次
}

// 检查支付状态
const checkPaymentStatus = async () => {
  try {
    // 在实际应用中，这里会调用后端API检查支付状态
    // 这里我们模拟支付状态检查
    console.log('检查支付状态...')
    
    // 模拟随机支付成功（实际应用中不应该这样做）
    const shouldSimulateSuccess = Math.random() < 0.1 // 10% 概率模拟支付成功
    
    if (shouldSimulateSuccess) {
      const successResult = {
        paymentId: `wechat_${Date.now()}`,
        orderId: props.orderId,
        amount: props.amount,
        method: 'wechat',
        status: 'success',
        transactionId: `wx_${Date.now()}`
      }
      
      // 清理定时器
      clearIntervals()
      
      emit('success', successResult)
    }
  } catch (err) {
    console.error('检查支付状态失败:', err)
  }
}

// 开始倒计时
const startCountdown = () => {
  countdownInterval.value = setInterval(() => {
    remainingTime.value--
    
    if (remainingTime.value <= 0) {
      clearIntervals()
      error.value = '支付超时，请重新生成二维码'
      qrCodeUrl.value = ''
    }
  }, 1000)
}

// 格式化时间
const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
}

// 取消支付
const cancelPayment = () => {
  clearIntervals()
  emit('cancel')
}

// 重试支付
const retryPayment = () => {
  error.value = ''
  qrCodeUrl.value = ''
  remainingTime.value = 30 * 60
  generateQRCode()
}

// 清理定时器
const clearIntervals = () => {
  if (paymentCheckInterval.value) {
    clearInterval(paymentCheckInterval.value)
    paymentCheckInterval.value = undefined
  }
  if (countdownInterval.value) {
    clearInterval(countdownInterval.value)
    countdownInterval.value = undefined
  }
}

// 组件挂载时自动生成二维码
onMounted(() => {
  generateQRCode()
})

// 组件卸载时清理定时器
onUnmounted(() => {
  clearIntervals()
})
</script>

<style scoped>
.wechat-payment {
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
  border-top: 3px solid #07c160;
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
  background: #07c160;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.retry-btn:hover {
  background: #06a052;
}

.wechat-logo {
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
  color: #07c160;
}

.wechat-logo img {
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

.qr-code-section {
  margin-bottom: 24px;
}

.qr-code {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.qr-placeholder {
  width: 200px;
  height: 200px;
  border: 2px dashed #07c160;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  text-align: center;
}

.qr-icon {
  font-size: 3rem;
  margin-bottom: 8px;
}

.qr-placeholder p {
  margin: 4px 0;
  font-weight: 600;
  color: #07c160;
}

.qr-placeholder small {
  font-size: 0.75rem;
  color: #666;
  word-break: break-all;
  padding: 0 10px;
}

.scan-instructions {
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 4px;
  padding: 16px;
}

.instruction-step {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
  font-size: 0.875rem;
  color: #0369a1;
}

.instruction-step:last-child {
  margin-bottom: 0;
}

.step-number {
  width: 20px;
  height: 20px;
  background: #0369a1;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  flex-shrink: 0;
}

.generate-qr {
  text-align: center;
  margin-bottom: 24px;
}

.generate-btn {
  padding: 12px 24px;
  background: #07c160;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.generate-btn:hover:not(:disabled) {
  background: #06a052;
}

.generate-btn:disabled {
  background: #aab7c4;
  cursor: not-allowed;
}

.payment-status {
  background: #fffbeb;
  border: 1px solid #fed7aa;
  border-radius: 4px;
  padding: 12px;
  margin-bottom: 16px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
  font-size: 0.875rem;
  color: #92400e;
}

.status-item:last-child {
  margin-bottom: 0;
}

.status-icon {
  font-size: 1rem;
}

.payment-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.check-btn,
.cancel-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.check-btn {
  background: #07c160;
  color: white;
}

.check-btn:hover {
  background: #06a052;
}

.cancel-btn {
  background: #f3f4f6;
  color: #6b7280;
  border: 1px solid #d1d5db;
}

.cancel-btn:hover {
  background: #e5e7eb;
}
</style>