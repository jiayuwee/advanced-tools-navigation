<template>
  <div class="tool-rating">
    <div class="rating-header">
      <h3>用户评价</h3>
      <div class="rating-summary">
        <div class="average-rating">
          <span class="rating-score">{{ averageRating.toFixed(1) }}</span>
          <div class="stars">
            <StarIcon
              v-for="i in 5"
              :key="i"
              :class="{ filled: i <= Math.round(averageRating) }"
              class="star"
            />
          </div>
          <span class="rating-count">({{ totalRatings }} 评价)</span>
        </div>
      </div>
    </div>

    <!-- 评分分布 -->
    <div class="rating-distribution">
      <div
        v-for="(count, rating) in ratingDistribution"
        :key="rating"
        class="rating-bar"
      >
        <span class="rating-label">{{ rating }}星</span>
        <div class="bar-container">
          <div class="bar" :style="{ width: getBarWidth(count) + '%' }"></div>
        </div>
        <span class="rating-count">{{ count }}</span>
      </div>
    </div>

    <!-- 用户评分区域 -->
    <div v-if="authStore.isAuthenticated" class="user-rating-section">
      <h4>{{ userRating ? "修改评价" : "添加评价" }}</h4>
      <div class="rating-input">
        <div class="stars-input">
          <StarIcon
            v-for="i in 5"
            :key="i"
            :class="{ filled: i <= currentRating, hover: i <= hoverRating }"
            class="star clickable"
            @click="setRating(i)"
            @mouseenter="hoverRating = i"
            @mouseleave="hoverRating = 0"
          />
        </div>
        <span class="rating-text">{{ getRatingText(currentRating) }}</span>
      </div>

      <textarea
        v-model="reviewText"
        placeholder="分享您的使用体验（可选）"
        class="review-input"
        rows="3"
      ></textarea>

      <div class="rating-actions">
        <label class="anonymous-checkbox">
          <input v-model="isAnonymous" type="checkbox" />
          匿名评价
        </label>
        <button
          :disabled="!currentRating || submitting"
          class="submit-button"
          @click="submitRating"
        >
          {{ submitting ? "提交中..." : userRating ? "更新评价" : "提交评价" }}
        </button>
      </div>
    </div>

    <!-- 登录提示 -->
    <div v-else class="login-prompt">
      <p>登录后可以评价工具</p>
      <button class="login-button" @click="$router.push('/auth/login')">
        立即登录
      </button>
    </div>

    <!-- 评价列表 -->
    <div class="reviews-section">
      <h4>用户评价 ({{ reviews.length }})</h4>
      <div v-if="reviews.length === 0" class="no-reviews">
        暂无评价，成为第一个评价者吧！
      </div>
      <div v-else class="reviews-list">
        <div v-for="review in reviews" :key="review.id" class="review-item">
          <div class="review-header">
            <div class="reviewer-info">
              <span class="reviewer-name">
                {{
                  review.is_anonymous
                    ? "匿名用户"
                    : review.user_profiles?.username || "用户"
                }}
              </span>
              <div class="review-rating">
                <StarIcon
                  v-for="i in 5"
                  :key="i"
                  :class="{ filled: i <= review.rating }"
                  class="star small"
                />
              </div>
            </div>
            <span class="review-date">{{ formatDate(review.created_at) }}</span>
          </div>
          <p v-if="review.review" class="review-content">{{ review.review }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { StarIcon } from "lucide-vue-next";
import { useAuthStore } from "@/stores/auth";
import { supabase } from "@/lib/supabase";

interface Props {
  toolId: string;
}

const props = defineProps<Props>();
const authStore = useAuthStore();

const ratings = ref([]);
const reviews = ref([]);
const userRating = ref(null);
const currentRating = ref(0);
const hoverRating = ref(0);
const reviewText = ref("");
const isAnonymous = ref(false);
const submitting = ref(false);

const averageRating = computed(() => {
  if (ratings.value.length === 0) return 0;
  const sum = ratings.value.reduce((acc, rating) => acc + rating.rating, 0);
  return sum / ratings.value.length;
});

const totalRatings = computed(() => ratings.value.length);

const ratingDistribution = computed(() => {
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  ratings.value.forEach((rating) => {
    distribution[rating.rating]++;
  });
  return distribution;
});

onMounted(async () => {
  await loadRatings();
  await loadUserRating();
});

const loadRatings = async () => {
  try {
    const { data, error } = await supabase
      .from("tool_ratings")
      .select(
        `
        *,
        user_profiles (username)
      `,
      )
      .eq("tool_id", props.toolId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    ratings.value = data || [];
    reviews.value = data?.filter((r) => r.review) || [];
  } catch (error) {
    console.error("加载评分失败:", error);
  }
};

const loadUserRating = async () => {
  if (!authStore.user) return;

  try {
    const { data, error } = await supabase
      .from("tool_ratings")
      .select("*")
      .eq("tool_id", props.toolId)
      .eq("user_id", authStore.user.id)
      .single();

    if (data) {
      userRating.value = data;
      currentRating.value = data.rating;
      reviewText.value = data.review || "";
      isAnonymous.value = data.is_anonymous;
    }
  } catch (error) {
    // 用户还没有评分，这是正常的
  }
};

const setRating = (rating: number) => {
  currentRating.value = rating;
};

const getRatingText = (rating: number) => {
  const texts = ["", "很差", "一般", "不错", "很好", "极佳"];
  return texts[rating] || "";
};

const getBarWidth = (count: number) => {
  if (totalRatings.value === 0) return 0;
  return (count / totalRatings.value) * 100;
};

const submitRating = async () => {
  if (!currentRating.value || !authStore.user) return;

  try {
    submitting.value = true;

    const ratingData = {
      tool_id: props.toolId,
      user_id: authStore.user.id,
      rating: currentRating.value,
      review: reviewText.value.trim() || null,
      is_anonymous: isAnonymous.value,
    };

    if (userRating.value) {
      // 更新现有评分
      const { error } = await supabase
        .from("tool_ratings")
        .update(ratingData)
        .eq("id", userRating.value.id);

      if (error) throw error;
    } else {
      // 创建新评分
      const { error } = await supabase.from("tool_ratings").insert(ratingData);

      if (error) throw error;
    }

    await loadRatings();
    await loadUserRating();
  } catch (error) {
    console.error("提交评分失败:", error);
    alert("提交失败，请重试");
  } finally {
    submitting.value = false;
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("zh-CN");
};
</script>

<style scoped>
.tool-rating {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-top: 24px;
}

.rating-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.rating-summary {
  text-align: right;
}

.average-rating {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rating-score {
  font-size: 24px;
  font-weight: 700;
  color: #333;
}

.stars {
  display: flex;
  gap: 2px;
}

.star {
  width: 16px;
  height: 16px;
  color: #ddd;
}

.star.filled {
  color: #ffc107;
}

.star.small {
  width: 12px;
  height: 12px;
}

.star.clickable {
  cursor: pointer;
  transition: color 0.2s ease;
}

.star.hover {
  color: #ffeb3b;
}

.rating-distribution {
  margin-bottom: 24px;
}

.rating-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.rating-label {
  width: 40px;
  font-size: 14px;
}

.bar-container {
  flex: 1;
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.bar {
  height: 100%;
  background: #ffc107;
  transition: width 0.3s ease;
}

.user-rating-section {
  border-top: 1px solid #eee;
  padding-top: 20px;
  margin-bottom: 24px;
}

.rating-input {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.stars-input {
  display: flex;
  gap: 4px;
}

.rating-text {
  font-weight: 500;
  color: #666;
}

.review-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  resize: vertical;
  font-family: inherit;
  margin-bottom: 12px;
}

.rating-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.anonymous-checkbox {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

.submit-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  cursor: pointer;
  font-weight: 500;
  transition: opacity 0.2s ease;
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.login-prompt {
  text-align: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 24px;
}

.login-button {
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  cursor: pointer;
  margin-top: 8px;
}

.reviews-section h4 {
  margin-bottom: 16px;
}

.no-reviews {
  text-align: center;
  color: #666;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.review-item {
  border-bottom: 1px solid #eee;
  padding: 16px 0;
}

.review-item:last-child {
  border-bottom: none;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.reviewer-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.reviewer-name {
  font-weight: 500;
}

.review-date {
  color: #666;
  font-size: 14px;
}

.review-content {
  color: #333;
  line-height: 1.5;
  margin: 0;
}
</style>
