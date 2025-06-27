<template>
  <div class="forgot-password-view">
    <div class="forgot-header">
      <h1>忘记密码</h1>
      <p>输入您的邮箱地址，我们将发送重置密码的链接</p>
    </div>

    <form
      v-if="!emailSent"
      class="forgot-form"
      @submit.prevent="handleForgotPassword"
    >
      <div class="form-group">
        <label for="email">邮箱地址</label>
        <input
          id="email"
          v-model="email"
          type="email"
          required
          placeholder="请输入您的邮箱地址"
          :disabled="loading"
        />
      </div>

      <button type="submit" class="submit-btn" :disabled="loading || !email">
        <div v-if="loading" class="loading-spinner"></div>
        <span>{{ loading ? "发送中..." : "发送重置链接" }}</span>
      </button>

      <div v-if="error" class="error-message">
        {{ error }}
      </div>
    </form>

    <div v-else class="success-state">
      <div class="success-icon">✅</div>
      <h3>邮件已发送</h3>
      <p>
        我们已向 <strong>{{ email }}</strong> 发送了重置密码的链接
      </p>
      <p class="help-text">
        请检查您的邮箱（包括垃圾邮件文件夹），并点击链接重置密码
      </p>

      <div class="success-actions">
        <button
          class="resend-btn"
          :disabled="resendCooldown > 0"
          @click="handleResend"
        >
          {{ resendCooldown > 0 ? `${resendCooldown}秒后可重发` : "重新发送" }}
        </button>
        <router-link to="/auth/login" class="back-btn">返回登录</router-link>
      </div>
    </div>

    <div class="forgot-footer">
      <p>
        记起密码了？
        <router-link to="/auth/login" class="login-link">立即登录</router-link>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from "vue";

// 响应式状态
const loading = ref(false);
const error = ref<string | null>(null);
const email = ref("");
const emailSent = ref(false);
const resendCooldown = ref(0);

let cooldownTimer: number | null = null;

// 方法
const handleForgotPassword = async () => {
  try {
    loading.value = true;
    error.value = null;

    // TODO: 实现忘记密码逻辑
    // await AuthService.forgotPassword(email.value)

    // 模拟发送邮件
    await new Promise((resolve) => setTimeout(resolve, 1000));

    emailSent.value = true;
    startResendCooldown();
  } catch (err) {
    error.value = err instanceof Error ? err.message : "发送失败，请重试";
  } finally {
    loading.value = false;
  }
};

const handleResend = async () => {
  if (resendCooldown.value > 0) return;

  try {
    loading.value = true;
    error.value = null;

    // TODO: 实现重新发送逻辑
    // await AuthService.forgotPassword(email.value)

    // 模拟重新发送
    await new Promise((resolve) => setTimeout(resolve, 500));

    startResendCooldown();
  } catch (err) {
    error.value = err instanceof Error ? err.message : "重新发送失败，请重试";
  } finally {
    loading.value = false;
  }
};

const startResendCooldown = () => {
  resendCooldown.value = 60;
  cooldownTimer = setInterval(() => {
    resendCooldown.value--;
    if (resendCooldown.value <= 0) {
      clearInterval(cooldownTimer!);
      cooldownTimer = null;
    }
  }, 1000);
};

// 生命周期
onUnmounted(() => {
  if (cooldownTimer) {
    clearInterval(cooldownTimer);
  }
});
</script>

<style scoped>
.forgot-password-view {
  width: 100%;
}

.forgot-header {
  text-align: center;
  margin-bottom: 2rem;
}

.forgot-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #323130;
  margin: 0 0 0.5rem 0;
}

.forgot-header p {
  color: #605e5c;
  margin: 0;
  line-height: 1.5;
}

.forgot-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  color: #323130;
}

.form-group input {
  padding: 0.75rem;
  border: 1px solid #e1dfdd;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.form-group input:focus {
  outline: none;
  border-color: #0078d4;
  box-shadow: 0 0 0 2px rgba(0, 120, 212, 0.2);
}

.form-group input:disabled {
  background: #f3f2f1;
  cursor: not-allowed;
}

.submit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.875rem;
  background: #0078d4;
  border: none;
  border-radius: 0.5rem;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.submit-btn:hover:not(:disabled) {
  background: #106ebe;
}

.submit-btn:disabled {
  background: #c8c6c4;
  cursor: not-allowed;
}

.loading-spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid transparent;
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.error-message {
  padding: 0.75rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 0.5rem;
  color: #dc2626;
  font-size: 0.875rem;
  text-align: center;
}

.success-state {
  text-align: center;
  padding: 1rem 0;
}

.success-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.success-state h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #323130;
  margin: 0 0 1rem 0;
}

.success-state p {
  color: #605e5c;
  margin: 0 0 0.75rem 0;
  line-height: 1.5;
}

.help-text {
  font-size: 0.875rem;
  color: #8a8886;
}

.success-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 2rem;
}

.resend-btn {
  padding: 0.75rem;
  background: transparent;
  border: 1px solid #0078d4;
  border-radius: 0.5rem;
  color: #0078d4;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.resend-btn:hover:not(:disabled) {
  background: rgba(0, 120, 212, 0.1);
}

.resend-btn:disabled {
  border-color: #c8c6c4;
  color: #c8c6c4;
  cursor: not-allowed;
}

.back-btn {
  display: inline-block;
  padding: 0.75rem;
  background: #0078d4;
  border-radius: 0.5rem;
  color: white;
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  text-align: center;
  transition: all 0.2s ease;
}

.back-btn:hover {
  background: #106ebe;
}

.forgot-footer {
  text-align: center;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e1dfdd;
}

.forgot-footer p {
  color: #605e5c;
  margin: 0;
}

.login-link {
  color: #0078d4;
  text-decoration: none;
  font-weight: 600;
}

.login-link:hover {
  text-decoration: underline;
}
</style>
