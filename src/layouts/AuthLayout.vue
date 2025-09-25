<template>
  <div class="auth-layout">
    <header class="auth-header">
      <router-link to="/" class="logo-link">
        <img src="@/assets/logo.svg" alt="Logo" class="logo" />
      </router-link>
    </header>
    
    <main class="auth-main">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.auth-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.auth-header {
  padding: 1rem;
  border-bottom: 1px solid var(--border);
}

.logo-link {
  display: inline-block;
}

.logo {
  height: 2.5rem;
}

.auth-main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}
</style>