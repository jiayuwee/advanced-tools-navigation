<template>
  <div class="profile-view">
    <div class="profile-header">
      <h1>个人资料</h1>
      <p>管理您的个人信息和偏好设置</p>
    </div>

    <div class="profile-content">
      <!-- 头像部分 -->
      <div class="avatar-section">
        <div class="avatar-container">
          <img :src="profile.avatarUrl || '/placeholder-user.jpg'" :alt="profile.fullName" class="avatar" />
          <button class="avatar-upload" @click="triggerFileUpload">
            <CameraIcon class="icon" />
          </button>
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            style="display: none"
            @change="handleAvatarUpload"
          />
        </div>
        <div class="avatar-info">
          <h3>{{ profile.fullName || '未设置姓名' }}</h3>
          <p>{{ profile.email }}</p>
        </div>
      </div>

      <!-- 个人信息表单 -->
      <form @submit.prevent="handleSave" class="profile-form">
        <div class="form-section">
          <h3>基本信息</h3>
          
          <div class="form-row">
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
              <label for="username">用户名</label>
              <input
                id="username"
                v-model="form.username"
                type="text"
                placeholder="请输入用户名"
                :disabled="loading"
              />
            </div>
          </div>

          <div class="form-group">
            <label for="email">邮箱地址</label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              disabled
              class="readonly"
            />
            <small class="form-hint">邮箱地址不可修改</small>
          </div>

          <div class="form-group">
            <label for="bio">个人简介</label>
            <textarea
              id="bio"
              v-model="form.bio"
              rows="4"
              placeholder="介绍一下您自己..."
              :disabled="loading"
            ></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="website">个人网站</label>
              <input
                id="website"
                v-model="form.website"
                type="url"
                placeholder="https://example.com"
                :disabled="loading"
              />
            </div>
            
            <div class="form-group">
              <label for="location">所在地</label>
              <input
                id="location"
                v-model="form.location"
                type="text"
                placeholder="请输入您的所在地"
                :disabled="loading"
              />
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="btn btn-secondary" @click="handleReset" :disabled="loading">
            重置
          </button>
          <button type="submit" class="btn btn-primary" :disabled="loading || !hasChanges">
            <div v-if="loading" class="loading-spinner"></div>
            <span>{{ loading ? '保存中...' : '保存更改' }}</span>
          </button>
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <div v-if="success" class="success-message">
          个人资料已成功更新！
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { CameraIcon } from 'lucide-vue-next'

// 响应式状态
const loading = ref(false)
const error = ref<string | null>(null)
const success = ref(false)
const fileInput = ref<HTMLInputElement>()

const profile = ref({
  id: '',
  email: '',
  username: '',
  fullName: '',
  avatarUrl: '',
  bio: '',
  website: '',
  location: ''
})

const form = ref({
  fullName: '',
  username: '',
  email: '',
  bio: '',
  website: '',
  location: ''
})

const originalForm = ref({
  fullName: '',
  username: '',
  email: '',
  bio: '',
  website: '',
  location: ''
})

// 计算属性
const hasChanges = computed(() => {
  return Object.keys(form.value).some(key => {
    return form.value[key as keyof typeof form.value] !== originalForm.value[key as keyof typeof originalForm.value]
  })
})

// 方法
const loadProfile = async () => {
  try {
    loading.value = true
    error.value = null

    // TODO: 实现加载用户资料逻辑
    // const userProfile = await UserService.getProfile()
    
    // 模拟数据
    const mockProfile = {
      id: 'user-1',
      email: 'user@example.com',
      username: 'user123',
      fullName: '张三',
      avatarUrl: '',
      bio: '这是我的个人简介',
      website: 'https://example.com',
      location: '北京'
    }
    
    profile.value = mockProfile
    form.value = { ...mockProfile }
    originalForm.value = { ...mockProfile }
  } catch (err) {
    error.value = err instanceof Error ? err.message : '加载用户资料失败'
  } finally {
    loading.value = false
  }
}

const handleSave = async () => {
  try {
    loading.value = true
    error.value = null
    success.value = false

    // TODO: 实现保存用户资料逻辑
    // await UserService.updateProfile(form.value)
    
    // 模拟保存
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    profile.value = { ...profile.value, ...form.value }
    originalForm.value = { ...form.value }
    success.value = true
    
    setTimeout(() => {
      success.value = false
    }, 3000)
  } catch (err) {
    error.value = err instanceof Error ? err.message : '保存失败，请重试'
  } finally {
    loading.value = false
  }
}

const handleReset = () => {
  form.value = { ...originalForm.value }
  error.value = null
  success.value = false
}

const triggerFileUpload = () => {
  fileInput.value?.click()
}

const handleAvatarUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return
  
  try {
    loading.value = true
    error.value = null

    // TODO: 实现头像上传逻辑
    // const avatarUrl = await UserService.uploadAvatar(file)
    
    // 模拟上传
    await new Promise(resolve => setTimeout(resolve, 1000))
    const avatarUrl = URL.createObjectURL(file)
    
    profile.value.avatarUrl = avatarUrl
  } catch (err) {
    error.value = err instanceof Error ? err.message : '头像上传失败'
  } finally {
    loading.value = false
  }
}

// 生命周期
onMounted(() => {
  loadProfile()
})
</script>

<style scoped>
.profile-view {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.profile-header {
  text-align: center;
  margin-bottom: 3rem;
}

.profile-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: #323130;
  margin: 0 0 0.5rem 0;
}

.profile-header p {
  color: #605e5c;
  font-size: 1.125rem;
  margin: 0;
}

.profile-content {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 3rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #e1dfdd;
}

.avatar-container {
  position: relative;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #e1dfdd;
}

.avatar-upload {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 28px;
  height: 28px;
  background: #0078d4;
  border: 2px solid white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.avatar-upload:hover {
  background: #106ebe;
}

.avatar-upload .icon {
  width: 14px;
  height: 14px;
  color: white;
}

.avatar-info h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #323130;
  margin: 0 0 0.25rem 0;
}

.avatar-info p {
  color: #605e5c;
  margin: 0;
}

.profile-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.form-section h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #323130;
  margin: 0 0 1.5rem 0;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
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

.form-group input,
.form-group textarea {
  padding: 0.75rem;
  border: 1px solid #e1dfdd;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: all 0.2s ease;
  font-family: inherit;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #0078d4;
  box-shadow: 0 0 0 2px rgba(0, 120, 212, 0.2);
}

.form-group input:disabled,
.form-group textarea:disabled {
  background: #f3f2f1;
  cursor: not-allowed;
}

.form-group input.readonly {
  background: #faf9f8;
  color: #8a8886;
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
}

.form-hint {
  font-size: 0.75rem;
  color: #8a8886;
  margin-top: 0.25rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding-top: 1rem;
  border-top: 1px solid #e1dfdd;
}

.btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background: #0078d4;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #106ebe;
}

.btn-secondary {
  background: transparent;
  color: #0078d4;
  border: 1px solid #0078d4;
}

.btn-secondary:hover:not(:disabled) {
  background: rgba(0, 120, 212, 0.1);
}

.btn:disabled {
  background: #c8c6c4;
  color: #8a8886;
  border-color: #c8c6c4;
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
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  padding: 0.75rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 0.5rem;
  color: #dc2626;
  font-size: 0.875rem;
}

.success-message {
  padding: 0.75rem;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 0.5rem;
  color: #166534;
  font-size: 0.875rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .profile-view {
    padding: 1rem;
  }
  
  .profile-content {
    padding: 1.5rem;
  }
  
  .avatar-section {
    flex-direction: column;
    text-align: center;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
}
</style>
