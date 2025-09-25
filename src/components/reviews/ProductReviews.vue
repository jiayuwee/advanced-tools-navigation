<template>
  <div class="product-reviews">
    <!-- 评价概览 -->
    <div class="reviews-overview">
      <div class="rating-summary">
        <div class="overall-rating">
          <div class="rating-score">{{ stats.average_rating.toFixed(1) }}</div>
          <div class="rating-stars">
            <StarRating :model-value="stats.average_rating" :readonly="true" />
          </div>
          <div class="rating-count">基于 {{ stats.total_reviews }} 条评价</div>
        </div>

        <div class="rating-breakdown">
          <div
            v-for="(count, rating) in stats.rating_distribution"
            :key="rating"
            class="rating-bar"
            @click="filterByRating(Number(rating))"
          >
            <span class="rating-label">{{ rating }} 星</span>
            <div class="bar-container">
              <div
                class="bar-fill"
                :style="{ width: `${(count / stats.total_reviews) * 100}%` }"
              ></div>
            </div>
            <span class="rating-count">{{ count }}</span>
          </div>
        </div>
      </div>

      <div class="review-actions">
        <button
          v-if="canWriteReview"
          class="write-review-button"
          @click="showWriteReview = true"
        >
          写评价
        </button>

        <div class="review-filters">
          <select
            v-model="filters.sort_by"
            class="sort-select"
            @change="() => loadReviews()"
          >
            <option value="newest">最新</option>
            <option value="oldest">最早</option>
            <option value="highest_rating">评分最高</option>
            <option value="lowest_rating">评分最低</option>
            <option value="most_helpful">最有用</option>
          </select>

          <label class="filter-checkbox">
            <input
              v-model="filters.verified_only"
              type="checkbox"
              @change="() => loadReviews()"
            />
            只看验证购买
          </label>

          <label class="filter-checkbox">
            <input
              v-model="filters.with_content"
              type="checkbox"
              @change="() => loadReviews()"
            />
            只看有内容的评价
          </label>
        </div>
      </div>
    </div>

    <!-- 评价列表 -->
    <div class="reviews-list">
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>加载评价中...</p>
      </div>

      <div v-else-if="reviews.length === 0" class="empty-state">
        <div class="empty-icon">💬</div>
        <h3>暂无评价</h3>
        <p>成为第一个评价此产品的用户</p>
        <button
          v-if="canWriteReview"
          class="write-first-review-button"
          @click="showWriteReview = true"
        >
          写第一条评价
        </button>
      </div>

      <div v-else>
        <ReviewItem
          v-for="review in reviews"
          :key="review.id"
          :review="review"
          :current-user-id="currentUserId"
          @vote="handleVote"
          @reply="handleReply"
          @edit="handleEdit"
          @delete="handleDelete"
        />

        <!-- 加载更多 -->
        <div v-if="hasMore" class="load-more">
          <button
            :disabled="loadingMore"
            class="load-more-button"
            @click="loadMore"
          >
            {{ loadingMore ? "加载中..." : "加载更多" }}
          </button>
        </div>
      </div>
    </div>

    <!-- 写评价模态框 -->
    <WriteReviewModal
      v-if="showWriteReview"
      :product-id="productId"
      @close="showWriteReview = false"
      @success="handleReviewCreated"
    />

    <!-- 编辑评价模态框 -->
    <EditReviewModal
      v-if="editingReview"
      :review="editingReview"
      @close="editingReview = null"
      @success="handleReviewUpdated"
    />

    <!-- 回复模态框 -->
    <ReplyModal
      v-if="replyingToReview"
      :review="replyingToReview"
      @close="replyingToReview = null"
      @success="handleReplyAdded"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useAuthStore } from "@/stores/auth";
import { reviewService } from "@/services/reviewService";
import StarRating from "@/components/ui/StarRating.vue";
import ReviewItem from "./ReviewItem.vue";
import WriteReviewModal from "./WriteReviewModal.vue";
import EditReviewModal from "./EditReviewModal.vue";
import ReplyModal from "./ReplyModal.vue";
import type {
  Review,
  ReviewStats,
  ReviewFilters,
} from "@/services/reviewService";

interface Props {
  productId: string;
  canWriteReview?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  canWriteReview: true,
});

const authStore = useAuthStore();

// 状态
const loading = ref(true);
const loadingMore = ref(false);
const reviews = ref<Review[]>([]);
const stats = ref<ReviewStats>({
  total_reviews: 0,
  average_rating: 0,
  rating_distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  verified_purchase_percentage: 0,
  recent_reviews_count: 0,
});

const currentPage = ref(1);
const hasMore = ref(false);

// 筛选器
const filters = ref<ReviewFilters>({
  sort_by: "newest",
});

// 模态框状态
const showWriteReview = ref(false);
const editingReview = ref<Review | null>(null);
const replyingToReview = ref<Review | null>(null);

// 计算属性
const currentUserId = computed(() => authStore.user?.id);

// 方法
const loadReviews = async (reset = true) => {
  try {
    if (reset) {
      loading.value = true;
      currentPage.value = 1;
      reviews.value = [];
    } else {
      loadingMore.value = true;
    }

    const result = await reviewService.getProductReviews(props.productId, {
      page: currentPage.value,
      limit: 10,
      ...filters.value,
    });

    if (reset) {
      reviews.value = result.reviews;
    } else {
      reviews.value.push(...result.reviews);
    }

    stats.value = result.stats;
    hasMore.value = reviews.value.length < result.total;
  } catch (error) {
    console.error("加载评价失败:", error);
  } finally {
    loading.value = false;
    loadingMore.value = false;
  }
};

const loadMore = async () => {
  if (hasMore.value && !loadingMore.value) {
    currentPage.value++;
    await loadReviews(false);
  }
};

const filterByRating = (rating: number) => {
  if (filters.value.rating === rating) {
    // 取消筛选
    delete filters.value.rating;
  } else {
    filters.value.rating = rating;
  }
  loadReviews();
};

const handleVote = async (
  reviewId: string,
  voteType: "helpful" | "unhelpful",
) => {
  if (!currentUserId.value) {
    // 提示用户登录
    return;
  }

  try {
    await reviewService.voteReview(reviewId, voteType, currentUserId.value);

    // 更新本地状态
    const review = reviews.value.find((r) => r.id === reviewId);
    if (review) {
      if (review.user_vote === voteType) {
        // 取消投票
        review.user_vote = null;
        if (voteType === "helpful") {
          review.helpful_count--;
        } else {
          review.unhelpful_count--;
        }
      } else {
        // 新投票或更改投票
        if (review.user_vote) {
          // 更改投票
          if (review.user_vote === "helpful") {
            review.helpful_count--;
          } else {
            review.unhelpful_count--;
          }
        }

        review.user_vote = voteType;
        if (voteType === "helpful") {
          review.helpful_count++;
        } else {
          review.unhelpful_count++;
        }
      }
    }
  } catch (error) {
    console.error("投票失败:", error);
  }
};

const handleReply = (review: Review) => {
  if (!currentUserId.value) {
    // 提示用户登录
    return;
  }
  replyingToReview.value = review;
};

const handleEdit = (review: Review) => {
  editingReview.value = review;
};

const handleDelete = async (reviewId: string) => {
  if (!currentUserId.value) return;

  if (confirm("确定要删除这条评价吗？")) {
    try {
      await reviewService.deleteReview(reviewId, currentUserId.value);
      reviews.value = reviews.value.filter((r) => r.id !== reviewId);
      stats.value.total_reviews--;
    } catch (error) {
      console.error("删除评价失败:", error);
    }
  }
};

const handleReviewCreated = (newReview: Review) => {
  reviews.value.unshift(newReview);
  stats.value.total_reviews++;
  showWriteReview.value = false;
};

const handleReviewUpdated = (updatedReview: Review) => {
  const index = reviews.value.findIndex((r) => r.id === updatedReview.id);
  if (index !== -1) {
    reviews.value[index] = updatedReview;
  }
  editingReview.value = null;
};

const handleReplyAdded = (reviewId: string) => {
  const review = reviews.value.find((r) => r.id === reviewId);
  if (review) {
    review.reply_count++;
  }
  replyingToReview.value = null;
  // 重新加载该评价的回复
  loadReviews();
};

// 生命周期
onMounted(() => {
  loadReviews();
});

// 监听器
watch(
  () => props.productId,
  () => {
    loadReviews();
  },
);
</script>

<style scoped>
.product-reviews {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
}

.reviews-overview {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.rating-summary {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.overall-rating {
  text-align: center;
}

.rating-score {
  font-size: 3rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.rating-stars {
  margin-bottom: 0.5rem;
}

.rating-count {
  color: #64748b;
  font-size: 0.875rem;
}

.rating-breakdown {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.rating-bar {
  display: grid;
  grid-template-columns: 3rem 1fr 2rem;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.rating-bar:hover {
  background: #f8fafc;
}

.rating-label {
  font-size: 0.875rem;
  color: #64748b;
}

.bar-container {
  height: 0.5rem;
  background: #e2e8f0;
  border-radius: 0.25rem;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: #fbbf24;
  transition: width 0.3s ease;
}

.review-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.write-review-button {
  padding: 0.75rem 1.5rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.write-review-button:hover {
  background: #2563eb;
}

.review-filters {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.sort-select {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  background: white;
  cursor: pointer;
}

.filter-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #64748b;
  cursor: pointer;
}

.filter-checkbox input {
  cursor: pointer;
}

.reviews-list {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.loading-spinner {
  width: 2rem;
  height: 2rem;
  border: 2px solid #e2e8f0;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: #64748b;
  margin-bottom: 1.5rem;
}

.write-first-review-button {
  padding: 0.75rem 1.5rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.write-first-review-button:hover {
  background: #2563eb;
}

.load-more {
  padding: 2rem;
  text-align: center;
  border-top: 1px solid #f1f5f9;
}

.load-more-button {
  padding: 0.75rem 2rem;
  background: transparent;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s ease;
}

.load-more-button:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #9ca3af;
}

.load-more-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .product-reviews {
    padding: 1rem;
  }

  .rating-summary {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .review-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .review-filters {
    justify-content: center;
  }

  .rating-bar {
    grid-template-columns: 4rem 1fr 3rem;
  }
}
</style>
