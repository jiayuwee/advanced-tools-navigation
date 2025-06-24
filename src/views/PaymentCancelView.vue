<template>
  <div class="payment-cancel-view">
    <div class="cancel-container">
      <div class="cancel-content">
        <div class="cancel-icon">
          <XCircleIcon class="icon" />
        </div>
        
        <h1 class="cancel-title">支付已取消</h1>
        <p class="cancel-message">您的支付已被取消，订单未完成</p>
        
        <div class="order-info" v-if="orderId">
          <div class="info-item">
            <span class="label">订单号:</span>
            <span class="value">{{ orderId }}</span>
          </div>
          <div class="info-item">
            <span class="label">取消时间:</span>
            <span class="value">{{ cancelTime }}</span>
          </div>
        </div>
        
        <div class="next-steps">
          <h3>接下来您可以：</h3>
          <div class="steps-list">
            <div class="step-item">
              <RefreshCwIcon class="step-icon" />
              <div class="step-content">
                <h4>重新支付</h4>
                <p>返回支付页面完成订单支付</p>
                <button class="step-action" @click="retryPayment">
                  重新支付
                </button>
              </div>
            </div>
            
            <div class="step-item">
              <ShoppingCartIcon class="step-icon" />
              <div class="step-content">
                <h4>继续购物</h4>
                <p>浏览更多优质产品</p>
                <router-link to="/products" class="step-action">
                  继续购物
                </router-link>
              </div>
            </div>
            
            <div class="step-item">
              <HeadphonesIcon class="step-icon" />
              <div class="step-content">
                <h4>联系客服</h4>
                <p>如有疑问，请联系我们的客服团队</p>
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
          <p>如需帮助，请联系我们的客服团队</p>
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
import { useRoute, useRouter } from 'vue-router'
import {
  XCircleIcon,
  RefreshCwIcon,
  ShoppingCartIcon,
  HeadphonesIcon,
  MailIcon,
  PhoneIcon
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()

// 响应式状态
const orderId = ref('')
const cancelTime = ref('')

// 方法
const loadCancelInfo = () => {
  // TODO: 从路由参数或API加载取消信息
  const orderParam = route.query.order
  
  if (orderParam) {
    orderId.value = orderParam as string
  }
  
  // 设置取消时间为当前时间
  cancelTime.value = new Date().toLocaleString('zh-CN')
}

const retryPayment = () => {
  if (orderId.value) {
    router.push(`/payment?order=${orderId.value}`)
  } else {
    router.push('/payment')
  }
}

// 生命周期
onMounted(() => {
  loadCancelInfo()
})
</script>

<style scoped>
.payment-cancel-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.cancel-container {
  max-width: 600px;
  width: 100%;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 1rem;
  padding: 3rem 2rem;
  box-shadow: 0 1rem 3rem rgba(0, 0, 0, 0.1);
  text-align: center;
}

.cancel-icon {
  margin-bottom: 2rem;
}

.cancel-icon .icon {
  width: 80px;
  height: 80px;
  color: #f59e0b;
}

.cancel-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #323130;
  margin: 0 0 1rem 0;
}

.cancel-message {
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
  color: #f59e0b;
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
  background: #f59e0b;
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
  background: #d97706;
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
  background: #f59e0b;
  color: white;
}

.btn-primary:hover {
  background: #d97706;
}

.btn-secondary {
  background: transparent;
  color: #f59e0b;
  border: 1px solid #f59e0b;
}

.btn-secondary:hover {
  background: rgba(245, 158, 11, 0.1);
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
  color: #f59e0b;
  text-decoration: none;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.contact-item:hover {
  color: #d97706;
}

.contact-icon {
  width: 16px;
  height: 16px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .payment-cancel-view {
    padding: 1rem;
  }
  
  .cancel-container {
    padding: 2rem 1.5rem;
  }
  
  .cancel-title {
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
