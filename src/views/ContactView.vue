<template>
  <div class="contact-view">
    <div class="container">
      <h1>联系我们</h1>
      <p class="subtitle">有任何问题或建议？我们很乐意听取您的意见</p>
      
      <div class="contact-content">
        <div class="contact-info">
          <h2>联系信息</h2>
          <div class="contact-item">
            <span class="icon">📧</span>
            <div>
              <strong>邮箱</strong>
              <p>support@example.com</p>
            </div>
          </div>
          <div class="contact-item">
            <span class="icon">📱</span>
            <div>
              <strong>电话</strong>
              <p>+86 400-123-4567</p>
            </div>
          </div>
          <div class="contact-item">
            <span class="icon">📍</span>
            <div>
              <strong>地址</strong>
              <p>北京市朝阳区某某大厦</p>
            </div>
          </div>
        </div>

        <div class="contact-form">
          <h2>发送消息</h2>
          <form @submit.prevent="submitForm">
            <div class="form-group">
              <label for="name">姓名</label>
              <input
                v-model="form.name"
                type="text"
                id="name"
                required
                placeholder="请输入您的姓名"
              />
            </div>
            <div class="form-group">
              <label for="email">邮箱</label>
              <input
                v-model="form.email"
                type="email"
                id="email"
                required
                placeholder="请输入您的邮箱"
              />
            </div>
            <div class="form-group">
              <label for="subject">主题</label>
              <input
                v-model="form.subject"
                type="text"
                id="subject"
                required
                placeholder="请输入消息主题"
              />
            </div>
            <div class="form-group">
              <label for="message">消息内容</label>
              <textarea
                v-model="form.message"
                id="message"
                rows="5"
                required
                placeholder="请输入详细的消息内容"
              ></textarea>
            </div>
            <button type="submit" class="submit-btn">发送消息</button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const form = ref({
  name: '',
  email: '',
  subject: '',
  message: ''
})

function submitForm() {
  // 这里可以添加表单提交逻辑
  console.log('提交表单:', form.value)
  alert('消息已发送！我们会尽快回复您。')
  // 重置表单
  form.value = { name: '', email: '', subject: '', message: '' }
}
</script>

<style scoped>
.contact-view {
  min-height: 100vh;
  padding: 2rem;
  background: hsl(var(--background));
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  font-size: 2.5rem;
  color: hsl(var(--foreground));
  text-align: center;
  margin-bottom: 1rem;
}

.subtitle {
  font-size: 1.2rem;
  color: hsl(var(--muted-foreground));
  text-align: center;
  margin-bottom: 3rem;
}

.contact-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  margin-top: 2rem;
}

.contact-info h2,
.contact-form h2 {
  color: hsl(var(--foreground));
  margin-bottom: 2rem;
}

.contact-item {
  display: flex;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1rem;
  background: hsl(var(--card));
  border-radius: 0.5rem;
  border: 1px solid hsl(var(--border));
}

.icon {
  font-size: 2rem;
  margin-right: 1rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: hsl(var(--foreground));
  font-weight: 500;
}

input,
textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid hsl(var(--border));
  border-radius: 0.5rem;
  font-size: 1rem;
  background: hsl(var(--background));
  color: hsl(var(--foreground));
}

input:focus,
textarea:focus {
  outline: 2px solid hsl(var(--ring));
  outline-offset: 2px;
}

.submit-btn {
  width: 100%;
  padding: 1rem;
  background-color: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  border: none;
  border-radius: 0.5rem;
  font-size: 1.1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.submit-btn:hover {
  background-color: hsl(var(--primary) / 0.9);
}

@media (max-width: 768px) {
  .contact-content {
    grid-template-columns: 1fr;
  }
  
  .contact-view {
    padding: 1rem;
  }
}
</style>
