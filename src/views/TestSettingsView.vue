<template>
  <div class="p-6">
    <h1 class="text-2xl font-semibold mb-4">测试设置</h1>
    <p>这是一个占位测试设置页面，可在需要时扩展真实功能。</p>
    <div class="mt-4">
      <label class="block mb-2">示例开关</label>
      <input v-model="enabled" type="checkbox" /> 启用
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const enabled = ref(false);
</script>

<style scoped>
.p-6 {
  padding: 1.5rem;
}
.text-2xl {
  font-size: 1.5rem;
}
.font-semibold {
  font-weight: 600;
}
.mb-4 {
  margin-bottom: 1rem;
}
.mt-4 {
  margin-top: 1rem;
}
</style>
