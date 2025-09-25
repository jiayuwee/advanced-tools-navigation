<template>
  <AuthLayout>
    <div class="login-container">
      <h1 class="login-title">登录</h1>
      <LoginForm @success="onLoginSuccess" />
    </div>
  </AuthLayout>
</template>

<script setup lang="ts">
import AuthLayout from '@/layouts/AuthLayout.vue';
import LoginForm from '@/components/auth/LoginForm.vue';
import { useRouter } from 'vue-router';

const router = useRouter();

function onLoginSuccess() {
  router.push('/');
}
</script>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem;
}

.login-title {
  text-align: center;
  margin-bottom: 2rem;
  color: var(--text-primary);
}
</style>