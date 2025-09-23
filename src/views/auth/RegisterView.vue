<template>
  <div class="register-view">
    <div class="register-header">
      <h1>注册</h1>
      <p>创建您的账户，开始使用工具导航站</p>
    </div>

    <form class="register-form" @submit.prevent="handleRegister">
      <div class="form-group">
        <label for="fullName">姓名</label>
        <input
          id="fullName"
          v-model="form.fullName"
          type="text"
          placeholder="请输入您的姓名"
          :disabled="loading"
        />
      </div>

      <div class="form-group">
        <label for="email">邮箱地址 *</label>
        <input
          id="email"
          v-model="form.email"
          type="email"
          required
          placeholder="请输入您的邮箱地址"
          :disabled="loading"
        />
      </div>

      <div class="form-group">
        <label for="password">密码 *</label>
        <div class="password-input">
          <input
            id="password"
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            required
            placeholder="请输入密码（至少8位）"
            :disabled="loading"
          />
          <button
            type="button"
            class="password-toggle"
            @click="showPassword = !showPassword"
          >
            <EyeIcon v-if="!showPassword" class="icon" />
            <EyeOffIcon v-else class="icon" />
          </button>
        </div>
        <div class="password-strength">
          <div class="strength-bar">
            <div
              class="strength-fill"
              :class="passwordStrength.class"
              :style="{ width: passwordStrength.width }"
            ></div>
          </div>
          <span class="strength-text">{{ passwordStrength.text }}</span>
        </div>
      </div>

      <div class="form-group">
        <label for="confirmPassword">确认密码 *</label>
        <input
          id="confirmPassword"
          v-model="form.confirmPassword"
          type="password"
          required
          placeholder="请再次输入密码"
          :disabled="loading"
        />
        <div
          v-if="form.confirmPassword && form.password !== form.confirmPassword"
          class="error-hint"
        >
          密码不匹配
        </div>
      </div>

      <div class="form-group">
        <label class="checkbox-label">
          <input v-model="form.agreeToTerms" type="checkbox" required />
          <span class="checkmark"></span>
          我已阅读并同意
          <a href="#" class="terms-link">服务条款</a>
          和
          <a href="#" class="terms-link">隐私政策</a>
        </label>
      </div>

      <button
        type="submit"
        class="register-btn"
        :disabled="loading || !isFormValid"
      >
        <div v-if="loading" class="loading-spinner"></div>
        <span>{{ loading ? "注册中..." : "注册" }}</span>
      </button>

      <div v-if="error" class="error-message">
        {{ error }}
      </div>
    </form>

    <div class="register-footer">
      <p>
        已有账户？
        <router-link to="/auth/login" class="login-link">立即登录</router-link>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { EyeIcon, EyeOffIcon } from "lucide-vue-next";
import { AuthService } from "@/services/authService";

const router = useRouter();

// 响应式状态
const loading = ref(false);
const error = ref<string | null>(null);
const showPassword = ref(false);
const form = ref({
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
  agreeToTerms: false,
});

// 计算属性
const passwordStrength = computed(() => {
  const password = form.value.password;
  if (!password) return { class: "", width: "0%", text: "" };

  let score = 0;
  if (password.length >= 8) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score < 2) return { class: "weak", width: "20%", text: "弱" };
  if (score < 3) return { class: "fair", width: "40%", text: "一般" };
  if (score < 4) return { class: "good", width: "60%", text: "良好" };
  if (score < 5) return { class: "strong", width: "80%", text: "强" };
  return { class: "very-strong", width: "100%", text: "很强" };
});

const isFormValid = computed(() => {
  return (
    form.value.email &&
    form.value.password &&
    form.value.password === form.value.confirmPassword &&
    form.value.agreeToTerms &&
    form.value.password.length >= 8
  );
});

// 方法
const handleRegister = async () => {
  try {
    loading.value = true;
    error.value = null;

    // 调用实际的注册服务
    const registerData = {
      email: form.value.email,
      password: form.value.password,
      confirm_password: form.value.confirmPassword,
      full_name: form.value.fullName,
      username: "", // 可选字段
      agree_to_terms: form.value.agreeToTerms,
    };

    const result = await AuthService.register(registerData);

    console.log("注册成功:", form.value.email);
    router.push("/auth/login");
  } catch (err) {
    error.value = err instanceof Error ? err.message : "注册失败，请重试";
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.register-view {
  width: 100%;
}

.register-header {
  text-align: center;
  margin-bottom: 2rem;
}

.register-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #323130;
  margin: 0 0 0.5rem 0;
}

.register-header p {
  color: #605e5c;
  margin: 0;
}

.register-form {
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

.password-input {
  position: relative;
}

.password-toggle {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #605e5c;
  padding: 0.25rem;
}

.password-toggle:hover {
  color: #323130;
}

.password-strength {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.25rem;
}

.strength-bar {
  flex: 1;
  height: 0.25rem;
  background: #e1dfdd;
  border-radius: 0.125rem;
  overflow: hidden;
}

.strength-fill {
  height: 100%;
  transition: all 0.3s ease;
}

.strength-fill.weak {
  background: #dc2626;
}
.strength-fill.fair {
  background: #f59e0b;
}
.strength-fill.good {
  background: #10b981;
}
.strength-fill.strong {
  background: #059669;
}
.strength-fill.very-strong {
  background: #047857;
}

.strength-text {
  font-size: 0.75rem;
  color: #605e5c;
  min-width: 2rem;
}

.error-hint {
  font-size: 0.75rem;
  color: #dc2626;
  margin-top: 0.25rem;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.875rem;
  color: #605e5c;
  line-height: 1.4;
}

.checkbox-label input {
  display: none;
}

.checkmark {
  width: 1rem;
  height: 1rem;
  border: 1px solid #e1dfdd;
  border-radius: 0.25rem;
  position: relative;
  transition: all 0.2s ease;
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.checkbox-label input:checked + .checkmark {
  background: #0078d4;
  border-color: #0078d4;
}

.checkbox-label input:checked + .checkmark::after {
  content: "✓";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 0.75rem;
}

.terms-link {
  color: #0078d4;
  text-decoration: none;
}

.terms-link:hover {
  text-decoration: underline;
}

.register-btn {
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

.register-btn:hover:not(:disabled) {
  background: #106ebe;
}

.register-btn:disabled {
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

.register-footer {
  text-align: center;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e1dfdd;
}

.register-footer p {
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

.icon {
  width: 1rem;
  height: 1rem;
}
</style>
