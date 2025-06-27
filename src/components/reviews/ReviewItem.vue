<template>
  <div class="review-item border-b border-gray-200 pb-4 mb-4 last:border-b-0">
    <!-- 用户信息 -->
    <div class="flex items-start space-x-3">
      <div class="flex-shrink-0">
        <img
          :src="review.user?.avatar_url || '/default-avatar.png'"
          :alt="review.user?.username || '匿名用户'"
          class="w-10 h-10 rounded-full"
        />
      </div>
      
      <div class="flex-1 min-w-0">
        <!-- 用户名和评分 -->
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <h4 class="text-sm font-medium text-gray-900">
              {{ review.user?.username || '匿名用户' }}
            </h4>
            <div class="flex items-center">
              <div class="flex items-center">
                <StarIcon
                  v-for="star in 5"
                  :key="star"
                  :class="[
                    star <= review.rating
                      ? 'text-yellow-400'
                      : 'text-gray-300',
                    'h-4 w-4'
                  ]"
                  fill="currentColor"
                />
              </div>
              <span class="ml-1 text-sm text-gray-600">{{ review.rating }}/5</span>
            </div>
          </div>
          
          <!-- 时间和认证购买标识 -->
          <div class="flex items-center space-x-2 text-xs text-gray-500">
            <span>{{ formatDate(review.created_at) }}</span>
            <span v-if="review.is_verified_purchase" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              已购买
            </span>
          </div>
        </div>
        
        <!-- 评价内容 -->
        <div class="mt-2">
          <p class="text-sm text-gray-700">{{ review.content }}</p>
        </div>
        
        <!-- 评价图片 -->
        <div v-if="review.images && review.images.length > 0" class="mt-3">
          <div class="flex space-x-2">
            <img
              v-for="(image, index) in review.images.slice(0, 3)"
              :key="index"
              :src="image"
              :alt="`评价图片 ${index + 1}`"
              class="w-16 h-16 object-cover rounded-lg cursor-pointer hover:opacity-80"
              @click="openImageModal(image)"
            />
            <div
              v-if="review.images.length > 3"
              class="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-500 cursor-pointer hover:bg-gray-200"
              @click="openImageModal(review.images[3])"
            >
              +{{ review.images.length - 3 }}
            </div>
          </div>
        </div>
        
        <!-- 有用性投票 -->
        <div class="mt-3 flex items-center space-x-4">
          <button
            @click="voteHelpful(true)"
            :class="[
              'flex items-center space-x-1 text-xs',
              userVote === true ? 'text-green-600' : 'text-gray-500 hover:text-green-600'
            ]"
          >
            <ThumbUpIcon class="h-4 w-4" />
            <span>有用 ({{ review.helpful_count || 0 }})</span>
          </button>
          
          <button
            @click="voteHelpful(false)"
            :class="[
              'flex items-center space-x-1 text-xs',
              userVote === false ? 'text-red-600' : 'text-gray-500 hover:text-red-600'
            ]"
          >
            <ThumbDownIcon class="h-4 w-4" />
            <span>无用 ({{ review.unhelpful_count || 0 }})</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { StarIcon, ThumbUpIcon, ThumbDownIcon } from '@heroicons/vue/24/solid'
import type { ProductReview } from '@/types'

interface Props {
  review: ProductReview
}

const props = defineProps<Props>()

const userVote = ref<boolean | null>(null)

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const voteHelpful = async (helpful: boolean) => {
  // TODO: 实现投票逻辑
  userVote.value = helpful
  console.log('投票:', helpful ? '有用' : '无用')
}

const openImageModal = (imageUrl: string) => {
  // TODO: 实现图片预览模态框
  console.log('打开图片:', imageUrl)
}
</script>

<style scoped>
.review-item {
  transition: all 0.2s ease-in-out;
}

.review-item:hover {
  background-color: #f9fafb;
}
</style>
