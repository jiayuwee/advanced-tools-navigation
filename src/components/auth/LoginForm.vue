<template>
  <form @submit.prevent="handleSubmit" class="login-form">
    <div class="form-group">
      <label for="email">邮箱</label>
      <input
        v-model="form.email"
        type="email"
        id="email"
        required
        placeholder="请输入邮箱"
      />
    </div>

    <div class="form-group">
      <label for="password">密码</label>
      <input
        v-model="form.password"
        type="password"
        id="password"
        required
        placeholder="请输入密码"
      />
    </div>

    <button type="submit" :disabled="loading" class="submit-btn">
      {{ loading ? '登录中...' : '登录' }}
    </button>

    <div v-if="error" class="error-message">{{ error }}</div>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { AuthService } from '@/services/authService';
import { useAuthStore } from '@/stores/auth';
import type { LoginForm } from '@/types';

const emit = defineEmits(['success']);

const form = ref<LoginForm>({
  email: '',
  password: ''
});

const loading = ref(false);
const error = ref('');

async function handleSubmit() {
  try {
    loading.value = true;
    error.value = '';
    
    const result = await AuthService.login(form.value);
    
    // 强制刷新用户状态
    const authStore = useAuthStore();
    await authStore.initialize();
    
    // 添加短暂延迟确保状态更新
    setTimeout(() => {
      emit('success');
    }, 300);
  } catch (err) {
    error.value = err instanceof Error ? err.message : '登录失败';
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
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

label {
  font-weight: 500;
  color: var(--text-primary);
}

input {
  padding: 0.75rem;
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  font-size: 1rem;
}

.submit-btn {
  padding: 0.75rem;
  background-color: var(--primary);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.submit-btn:hover {
  background-color: var(--primary-dark);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.error-message {
  color: var(--error);
  text-align: center;
  margin-top: 1rem;
}
</style>