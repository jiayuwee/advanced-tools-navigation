<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>写评价</h3>
        <button @click="$emit('close')" class="close-btn">×</button>
      </div>
      
      <form @submit.prevent="submitReview" class="review-form">
        <div class="rating-input">
          <label>评分</label>
          <StarRating v-model:rating="form.rating" :readonly="false" />
        </div>
        
        <div class="form-group">
          <label for="title">标题</label>
          <input
            id="title"
            v-model="form.title"
            type="text"
            placeholder="简短描述您的体验"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="content">评价内容</label>
          <textarea
            id="content"
            v-model="form.content"
            placeholder="详细描述您的使用体验"
            rows="4"
            required
          ></textarea>
        </div>
        
        <div class="form-actions">
          <button type="button" @click="$emit('close')" class="btn-cancel">
            取消
          </button>
          <button type="submit" :disabled="submitting" class="btn-submit">
            {{ submitting ? '提交中...' : '提交评价' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { reviewService } from '@/services/reviewService'
import StarRating from '@/components/ui/StarRating.vue'

interface Props {
  productId: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  success: []
}>()

const submitting = ref(false)
const form = reactive({
  rating: 5,
  title: '',
  content: ''
})

const submitReview = async () => {
  try {
    submitting.value = true
    await reviewService.createReview({
      product_id: props.productId,
      rating: form.rating,
      title: form.title,
      content: form.content
    })
    emit('success')
    emit('close')
  } catch (error) {
    console.error('提交评价失败:', error)
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
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
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  padding: 24px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
}

.review-form .form-group {
  margin-bottom: 16px;
}

.review-form label {
  display: block;
  margin-bottom: 4px;
  font-weight: 500;
}

.review-form input,
.review-form textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.rating-input {
  margin-bottom: 16px;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 20px;
}

.btn-cancel,
.btn-submit {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-cancel {
  background: #f5f5f5;
  color: #666;
}

.btn-submit {
  background: #007bff;
  color: white;
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
