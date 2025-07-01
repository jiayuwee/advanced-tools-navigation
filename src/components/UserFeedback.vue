<template>
  <div class="user-feedback">
    <button @click="showModal = true" class="feedback-trigger">
      <MessageCircleIcon class="icon" />
      意见反馈
    </button>

    <!-- 反馈模态框 -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>意见反馈</h3>
          <button @click="closeModal" class="close-button">
            <XIcon class="icon" />
          </button>
        </div>

        <form @submit.prevent="submitFeedback" class="feedback-form">
          <div class="form-group">
            <label for="feedback-type">反馈类型</label>
            <select id="feedback-type" v-model="feedbackData.type" required>
              <option value="">请选择反馈类型</option>
              <option value="bug">Bug报告</option>
              <option value="feature">功能建议</option>
              <option value="improvement">改进建议</option>
              <option value="general">一般反馈</option>
            </select>
          </div>

          <div class="form-group">
            <label for="feedback-subject">标题</label>
            <input 
              id="feedback-subject"
              type="text" 
              v-model="feedbackData.subject" 
              placeholder="简要描述您的反馈"
              required
              maxlength="200"
            />
          </div>

          <div class="form-group">
            <label for="feedback-content">详细描述</label>
            <textarea 
              id="feedback-content"
              v-model="feedbackData.content" 
              placeholder="请详细描述您的问题或建议..."
              required
              rows="6"
            ></textarea>
          </div>

          <div class="form-group">
            <label for="feedback-priority">优先级</label>
            <select id="feedback-priority" v-model="feedbackData.priority">
              <option value="low">低</option>
              <option value="medium">中</option>
              <option value="high">高</option>
              <option value="urgent">紧急</option>
            </select>
          </div>

          <div class="form-actions">
            <button type="button" @click="closeModal" class="cancel-button">
              取消
            </button>
            <button type="submit" :disabled="submitting" class="submit-button">
              {{ submitting ? '提交中...' : '提交反馈' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 成功提示 -->
    <div v-if="showSuccess" class="success-toast">
      <CheckCircleIcon class="icon" />
      反馈提交成功！我们会尽快处理您的反馈。
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { MessageCircleIcon, XIcon, CheckCircleIcon } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/lib/supabase'

const authStore = useAuthStore()

const showModal = ref(false)
const showSuccess = ref(false)
const submitting = ref(false)

const feedbackData = reactive({
  type: '',
  subject: '',
  content: '',
  priority: 'medium'
})

const closeModal = () => {
  showModal.value = false
  resetForm()
}

const resetForm = () => {
  feedbackData.type = ''
  feedbackData.subject = ''
  feedbackData.content = ''
  feedbackData.priority = 'medium'
}

const submitFeedback = async () => {
  if (!authStore.user) {
    alert('请先登录')
    return
  }

  try {
    submitting.value = true

    const { error } = await supabase
      .from('user_feedback')
      .insert({
        user_id: authStore.user.id,
        feedback_type: feedbackData.type,
        subject: feedbackData.subject,
        content: feedbackData.content,
        priority: feedbackData.priority
      })

    if (error) throw error

    showModal.value = false
    showSuccess.value = true
    resetForm()

    // 3秒后隐藏成功提示
    setTimeout(() => {
      showSuccess.value = false
    }, 3000)

  } catch (error) {
    console.error('提交反馈失败:', error)
    alert('提交失败，请重试')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.feedback-trigger {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 50px;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
  transition: all 0.2s ease;
  z-index: 1000;
}

.feedback-trigger:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.close-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background 0.2s ease;
}

.close-button:hover {
  background: #f0f0f0;
}

.feedback-form {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #333;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-family: inherit;
  font-size: 14px;
  transition: border-color 0.2s ease;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
}

.form-group textarea {
  resize: vertical;
  min-height: 120px;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
}

.cancel-button,
.submit-button {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.cancel-button {
  background: #f0f0f0;
  color: #666;
}

.cancel-button:hover {
  background: #e0e0e0;
}

.submit-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.submit-button:not(:disabled):hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.success-toast {
  position: fixed;
  top: 20px;
  right: 20px;
  background: #4caf50;
  color: white;
  padding: 16px 20px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 16px rgba(76, 175, 80, 0.3);
  z-index: 3000;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.icon {
  width: 16px;
  height: 16px;
}

@media (max-width: 768px) {
  .modal-content {
    margin: 0;
    border-radius: 0;
    height: 100vh;
    max-height: none;
  }
  
  .feedback-trigger {
    bottom: 80px;
    right: 16px;
  }
}
</style>
