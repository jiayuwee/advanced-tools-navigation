<template>
  <div class="payment-success-view">
    <div class="success-container">
      <div class="success-content">
        <div class="success-icon">
          <CheckCircleIcon class="icon" />
        </div>
        
        <h1 class="success-title">支付成功！</h1>
        <p class="success-message">您的订单已成功支付，感谢您的购买</p>
        
        <div class="order-info">
          <div class="info-item">
            <span class="label">订单号:</span>
            <span class="value">{{ orderId }}</span>
          </div>
          <div class="info-item">
            <span class="label">支付金额:</span>
            <span class="value amount">¥{{ amount }}</span>
          </div>
          <div class="info-item">
            <span class="label">支付时间:</span>
            <span class="value">{{ paymentTime }}</span>
          </div>
          <div class="info-item">
            <span class="label">支付方式:</span>
            <span class="value">{{ paymentMethod }}</span>
          </div>
        </div>
        
        <div class="next-steps">
          <h3>接下来您可以：</h3>
          <div class="steps-list">
            <div class="step-item">
              <DownloadIcon class="step-icon" />
              <div class="step-content">
                <h4>下载产品</h4>
                <p>立即下载您购买的数字产品</p>
                <button class="step-action" @click="downloadProducts">
                  立即下载
                </button>
              </div>
            </div>
            
            <div class="step-item">
              <MailIcon class="step-icon" />
              <div class="step-content">
                <h4>查看邮件</h4>
                <p>我们已向您的邮箱发送了订单确认邮件</p>
              </div>
            </div>
            
            <div class="step-item">
              <FileTextIcon class="step-icon" />
              <div class="step-content">
                <h4>查看订单</h4>
                <p>在个人中心查看完整的订单详情</p>
                <router-link to="/user/orders" class="step-action">
                  查看订单
                </router-link>
              </div>
            </div>
          </div>
        </div>
        
        <div class="action-buttons">
          <router-link to="/" class="btn btn-secondary">
            返回首页
          </router-link>
          <router-link to="/products" class="btn btn-primary">
            继续购物
          </router-link>
        </div>
        
        <div class="support-info">
          <p>如有任何问题，请联系我们的客服团队</p>
          <div class="contact-methods">
            <a href="mailto:support@example.com" class="contact-item">
              <MailIcon class="contact-icon" />
              support@example.com
            </a>
            <a href="tel:400-123-4567" class="contact-item">
              <PhoneIcon class="contact-icon" />
              400-123-4567
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import {
  CheckCircleIcon,
  DownloadIcon,
  MailIcon,
  FileTextIcon,
  PhoneIcon
} from 'lucide-vue-next'

const route = useRoute()

// 响应式状态
const orderId = ref('ORD-20241224-001')
const amount = ref(299)
const paymentTime = ref('')
const paymentMethod = ref('支付宝')

// 方法
const loadPaymentInfo = () => {
  // TODO: 从路由参数或API加载支付信息
  const orderParam = route.query.order
  const amountParam = route.query.amount
  
  if (orderParam) {
    orderId.value = orderParam as string
  }
  
  if (amountParam) {
    amount.value = parseFloat(amountParam as string)
  }
  
  // 设置支付时间为当前时间
  paymentTime.value = new Date().toLocaleString('zh-CN')
}

const downloadProducts = () => {
  // TODO: 实现产品下载逻辑
  console.log('开始下载产品...')
  
  // 模拟下载
  const link = document.createElement('a')
  link.href = '/sample-product.zip'
  link.download = 'product.zip'
  link.click()
}

// 生命周期
onMounted(() => {
  loadPaymentInfo()
})
</script>

<style scoped>
.payment-success-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.success-container {
  max-width: 600px;
  width: 100%;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 1rem;
  padding: 3rem 2rem;
  box-shadow: 0 1rem 3rem rgba(0, 0, 0, 0.1);
  text-align: center;
}

.success-icon {
  margin-bottom: 2rem;
}

.success-icon .icon {
  width: 80px;
  height: 80px;
  color: #10b981;
}

.success-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #323130;
  margin: 0 0 1rem 0;
}

.success-message {
  font-size: 1.125rem;
  color: #605e5c;
  margin: 0 0 2rem 0;
  line-height: 1.6;
}

.order-info {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  text-align: left;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e1dfdd;
}

.info-item:last-child {
  border-bottom: none;
}

.label {
  font-weight: 500;
  color: #605e5c;
}

.value {
  font-weight: 600;
  color: #323130;
}

.value.amount {
  color: #d13438;
  font-size: 1.125rem;
}

.next-steps {
  margin-bottom: 2rem;
  text-align: left;
}

.next-steps h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #323130;
  margin: 0 0 1.5rem 0;
  text-align: center;
}

.steps-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.step-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  border: 1px solid #e1dfdd;
}

.step-icon {
  width: 24px;
  height: 24px;
  color: #0078d4;
  flex-shrink: 0;
  margin-top: 0.25rem;
}

.step-content {
  flex: 1;
}

.step-content h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #323130;
  margin: 0 0 0.25rem 0;
}

.step-content p {
  font-size: 0.875rem;
  color: #605e5c;
  margin: 0 0 0.75rem 0;
  line-height: 1.4;
}

.step-action {
  display: inline-block;
  padding: 0.5rem 1rem;
  background: #0078d4;
  color: white;
  text-decoration: none;
  border: none;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.step-action:hover {
  background: #106ebe;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 2rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  padding: 0.875rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background: #0078d4;
  color: white;
}

.btn-primary:hover {
  background: #106ebe;
}

.btn-secondary {
  background: transparent;
  color: #0078d4;
  border: 1px solid #0078d4;
}

.btn-secondary:hover {
  background: rgba(0, 120, 212, 0.1);
}

.support-info {
  border-top: 1px solid #e1dfdd;
  padding-top: 1.5rem;
}

.support-info p {
  color: #605e5c;
  margin: 0 0 1rem 0;
}

.contact-methods {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #0078d4;
  text-decoration: none;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.contact-item:hover {
  color: #106ebe;
}

.contact-icon {
  width: 16px;
  height: 16px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .payment-success-view {
    padding: 1rem;
  }
  
  .success-container {
    padding: 2rem 1.5rem;
  }
  
  .success-title {
    font-size: 2rem;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .contact-methods {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .step-item {
    flex-direction: column;
    text-align: center;
  }
  
  .step-icon {
    align-self: center;
  }
}
</style>
