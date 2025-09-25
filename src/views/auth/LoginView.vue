<template>
  <div class="login-view">
    <div class="login-header">
      <h1>登录</h1>
      <p>欢迎回来，请登录您的账户</p>
    </div>

    <form class="login-form" @submit.prevent="handleLogin">
      <div class="form-group">
        <label for="email">邮箱地址</label>
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
        <label for="password">密码</label>
        <div class="password-input">
          <input
            id="password"
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            required
            placeholder="请输入您的密码"
            :disabled="loading"
          />
          <button
            type="button"
            class="password-toggle"
            @click="showPassword = !showPassword"
          >
            <Eye v-if="!showPassword" class="icon" />
            <EyeOff v-else class="icon" />
          </button>
        </div>
      </div>

      <div class="form-options">
        <label class="checkbox-label">
          <input v-model="form.remember" type="checkbox" />
          <span class="checkmark"></span>
          记住我
        </label>
        <router-link to="/auth/forgot-password" class="forgot-link">
          忘记密码？
        </router-link>
      </div>

      <button type="submit" class="login-btn" :disabled="loading">
        <div v-if="loading" class="loading-spinner"></div>
        <span>{{ loading ? "登录中..." : "登录" }}</span>
      </button>

      <div v-if="error" class="error-message">
        {{ error }}
      </div>
    </form>

    <div class="login-footer">
      <p>
        还没有账户？
        <router-link to="/auth/register" class="register-link"
          >立即注册</router-link
        >
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { Eye, EyeOff } from "lucide-vue-next";
import { AuthService } from "@/services/authService";

const router = useRouter();

// 响应式状态
const loading = ref(false);
const error = ref<string | null>(null);
const showPassword = ref(false);
const form = ref({
  email: "",
  password: "",
  remember: false,
});

// 方法
const handleLogin = async () => {
  try {
    loading.value = true;
    error.value = null;

    const result = await AuthService.login(form.value);

    console.log("登录成功:", result.user.email);
    router.push("/");
  } catch (err) {
    error.value = err instanceof Error ? err.message : "登录失败，请重试";
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-view {
  width: 100%;
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #323130;
  margin: 0 0 0.5rem 0;
}

.login-header p {
  color: #605e5c;
  margin: 0;
}

.login-form {
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

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.875rem;
  color: #605e5c;
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

.forgot-link {
  color: #0078d4;
  text-decoration: none;
  font-size: 0.875rem;
}

.forgot-link:hover {
  text-decoration: underline;
}

.login-btn {
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

.login-btn:hover:not(:disabled) {
  background: #106ebe;
}

.login-btn:disabled {
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

.login-footer {
  text-align: center;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e1dfdd;
}

.login-footer p {
  color: #605e5c;
  margin: 0;
}

.register-link {
  color: #0078d4;
  text-decoration: none;
  font-weight: 600;
}

.register-link:hover {
  text-decoration: underline;
}

.icon {
  width: 1rem;
  height: 1rem;
}
</style>
