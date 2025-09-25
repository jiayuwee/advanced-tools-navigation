<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>回复评价</h3>
        <button class="close-btn" @click="$emit('close')">×</button>
      </div>

      <div class="original-review">
        <h4>原评价</h4>
        <div class="review-info">
          <StarRating :model-value="review.rating" :readonly="true" />
          <span class="review-title">{{ review.title }}</span>
        </div>
        <p class="review-content">{{ review.content }}</p>
      </div>

      <form class="reply-form" @submit.prevent="submitReply">
        <div class="form-group">
          <label for="reply">回复内容</label>
          <textarea
            id="reply"
            v-model="replyContent"
            placeholder="输入您的回复..."
            rows="4"
            required
          ></textarea>
        </div>

        <div class="form-actions">
          <button type="button" class="btn-cancel" @click="$emit('close')">
            取消
          </button>
          <button type="submit" :disabled="submitting" class="btn-submit">
            {{ submitting ? "提交中..." : "提交回复" }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { reviewService } from "@/services/reviewService";
import StarRating from "@/components/ui/StarRating.vue";
import type { Review } from "@/services/reviewService";

interface Props {
  review: Review;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  close: [];
  success: [];
}>();

const submitting = ref(false);
const replyContent = ref("");

const submitReply = async () => {
  try {
    submitting.value = true;
    // 需要传入当前用户ID，这里使用临时值
    await reviewService.addReviewReply(
      props.review.id,
      replyContent.value,
      "current-user-id",
      false,
    );
    emit("success");
    emit("close");
  } catch (error) {
    console.error("提交回复失败:", error);
  } finally {
    submitting.value = false;
  }
};
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
  max-width: 600px;
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

.original-review {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.original-review h4 {
  margin: 0 0 12px 0;
  color: #666;
  font-size: 14px;
}

.review-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.review-title {
  font-weight: 500;
}

.review-content {
  margin: 0;
  color: #666;
  line-height: 1.5;
}

.reply-form .form-group {
  margin-bottom: 16px;
}

.reply-form label {
  display: block;
  margin-bottom: 4px;
  font-weight: 500;
}

.reply-form textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
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
