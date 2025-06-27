<template>
  <div class="feedback-widget">
    <!-- 反馈按钮 -->
    <button
      v-if="!showPanel"
      @click="togglePanel"
      class="feedback-button"
      :class="{ 'has-feedback': unreadCount > 0 }"
      title="用户反馈"
    >
      <MessageCircleIcon class="icon" />
      <span v-if="unreadCount > 0" class="feedback-badge">{{ unreadCount }}</span>
    </button>

    <!-- 反馈面板 -->
    <div v-if="showPanel" class="feedback-panel">
      <div class="panel-header">
        <h3 class="panel-title">用户反馈</h3>
        <button @click="togglePanel" class="close-button">
          <XIcon class="icon" />
        </button>
      </div>

      <div class="panel-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          class="tab-button"
          :class="{ active: activeTab === tab.id }"
        >
          {{ tab.label }}
        </button>
      </div>

      <div class="panel-content">
        <!-- 提交反馈 -->
        <div v-if="activeTab === 'submit'" class="submit-feedback">
          <form @submit.prevent="submitFeedback" class="feedback-form">
            <div class="form-group">
              <label for="feedback-type" class="form-label">反馈类型</label>
              <select
                id="feedback-type"
                v-model="feedbackForm.type"
                class="form-select"
                required
              >
                <option value="">请选择反馈类型</option>
                <option value="bug">Bug 报告</option>
                <option value="feature">功能建议</option>
                <option value="improvement">改进建议</option>
                <option value="question">问题咨询</option>
                <option value="other">其他</option>
              </select>
            </div>

            <div class="form-group">
              <label for="feedback-title" class="form-label">标题</label>
              <input
                id="feedback-title"
                v-model="feedbackForm.title"
                type="text"
                class="form-input"
                placeholder="简要描述您的反馈"
                required
              />
            </div>

            <div class="form-group">
              <label for="feedback-content" class="form-label">详细描述</label>
              <textarea
                id="feedback-content"
                v-model="feedbackForm.content"
                class="form-textarea"
                rows="4"
                placeholder="请详细描述您的反馈内容"
                required
              ></textarea>
            </div>

            <div class="form-group">
              <label for="feedback-priority" class="form-label">优先级</label>
              <select
                id="feedback-priority"
                v-model="feedbackForm.priority"
                class="form-select"
              >
                <option value="low">低</option>
                <option value="medium">中</option>
                <option value="high">高</option>
                <option value="urgent">紧急</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">
                <input
                  v-model="feedbackForm.includeSystemInfo"
                  type="checkbox"
                  class="form-checkbox"
                />
                包含系统信息（浏览器、设备等）
              </label>
            </div>

            <div class="form-actions">
              <button
                type="submit"
                :disabled="submitting"
                class="submit-button"
              >
                {{ submitting ? '提交中...' : '提交反馈' }}
              </button>
            </div>
          </form>
        </div>

        <!-- 反馈历史 -->
        <div v-else-if="activeTab === 'history'" class="feedback-history">
          <div v-if="loading" class="loading-state">
            <div class="loading-spinner"></div>
            <p>加载反馈历史...</p>
          </div>

          <div v-else-if="feedbackList.length === 0" class="empty-state">
            <MessageCircleIcon class="empty-icon" />
            <p>暂无反馈记录</p>
          </div>

          <div v-else class="feedback-list">
            <div
              v-for="feedback in feedbackList"
              :key="feedback.id"
              class="feedback-item"
              :class="{ unread: !feedback.is_read }"
            >
              <div class="feedback-header">
                <span class="feedback-type" :class="feedback.type">
                  {{ getTypeLabel(feedback.type) }}
                </span>
                <span class="feedback-priority" :class="feedback.priority">
                  {{ getPriorityLabel(feedback.priority) }}
                </span>
                <span class="feedback-date">
                  {{ formatDate(feedback.created_at) }}
                </span>
              </div>
              <h4 class="feedback-title">{{ feedback.title }}</h4>
              <p class="feedback-content">{{ feedback.content }}</p>
              <div v-if="feedback.response" class="feedback-response">
                <h5>开发者回复：</h5>
                <p>{{ feedback.response }}</p>
                <span class="response-date">
                  {{ formatDate(feedback.response_at) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 反馈统计 -->
        <div v-else-if="activeTab === 'stats'" class="feedback-stats">
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-number">{{ stats.total }}</div>
              <div class="stat-label">总反馈数</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">{{ stats.pending }}</div>
              <div class="stat-label">待处理</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">{{ stats.resolved }}</div>
              <div class="stat-label">已解决</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">{{ stats.response_rate }}%</div>
              <div class="stat-label">回复率</div>
            </div>
          </div>

          <div class="stats-charts">
            <div class="chart-section">
              <h4>反馈类型分布</h4>
              <div class="type-distribution">
                <div
                  v-for="(count, type) in stats.by_type"
                  :key="type"
                  class="type-item"
                >
                  <span class="type-label">{{ getTypeLabel(type) }}</span>
                  <div class="type-bar">
                    <div
                      class="type-fill"
                      :style="{ width: `${(count / stats.total) * 100}%` }"
                    ></div>
                  </div>
                  <span class="type-count">{{ count }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 反馈成功提示 -->
    <div v-if="showSuccessMessage" class="success-message">
      <CheckCircleIcon class="success-icon" />
      <span>反馈提交成功！我们会尽快处理您的反馈。</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { MessageCircleIcon, XIcon, CheckCircleIcon } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'

interface FeedbackForm {
  type: string
  title: string
  content: string
  priority: string
  includeSystemInfo: boolean
}

interface Feedback {
  id: string
  type: string
  title: string
  content: string
  priority: string
  status: string
  response?: string
  response_at?: string
  is_read: boolean
  created_at: string
}

interface FeedbackStats {
  total: number
  pending: number
  resolved: number
  response_rate: number
  by_type: Record<string, number>
}

const authStore = useAuthStore()

// 状态
const showPanel = ref(false)
const activeTab = ref('submit')
const loading = ref(false)
const submitting = ref(false)
const showSuccessMessage = ref(false)

// 表单数据
const feedbackForm = reactive<FeedbackForm>({
  type: '',
  title: '',
  content: '',
  priority: 'medium',
  includeSystemInfo: true
})

// 反馈数据
const feedbackList = ref<Feedback[]>([])
const stats = ref<FeedbackStats>({
  total: 0,
  pending: 0,
  resolved: 0,
  response_rate: 0,
  by_type: {}
})

// 标签页配置
const tabs = [
  { id: 'submit', label: '提交反馈' },
  { id: 'history', label: '反馈历史' },
  { id: 'stats', label: '反馈统计' }
]

// 计算属性
const unreadCount = computed(() => {
  return feedbackList.value.filter(f => !f.is_read).length
})

// 方法
const togglePanel = () => {
  showPanel.value = !showPanel.value
  if (showPanel.value && activeTab.value === 'history') {
    loadFeedbackHistory()
  }
}

const submitFeedback = async () => {
  if (!authStore.user) {
    alert('请先登录后再提交反馈')
    return
  }

  try {
    submitting.value = true

    const feedbackData = {
      ...feedbackForm,
      user_id: authStore.user.id,
      system_info: feedbackForm.includeSystemInfo ? getSystemInfo() : null
    }

    // 这里应该调用实际的 API
    console.log('提交反馈:', feedbackData)

    // 模拟 API 调用
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 重置表单
    Object.assign(feedbackForm, {
      type: '',
      title: '',
      content: '',
      priority: 'medium',
      includeSystemInfo: true
    })

    // 显示成功消息
    showSuccessMessage.value = true
    setTimeout(() => {
      showSuccessMessage.value = false
    }, 3000)

    // 关闭面板
    showPanel.value = false

  } catch (error) {
    console.error('提交反馈失败:', error)
    alert('提交反馈失败，请稍后重试')
  } finally {
    submitting.value = false
  }
}

const loadFeedbackHistory = async () => {
  if (!authStore.user) return

  try {
    loading.value = true

    // 这里应该调用实际的 API
    console.log('加载反馈历史')

    // 模拟数据
    feedbackList.value = [
      {
        id: '1',
        type: 'feature',
        title: '希望增加暗色主题',
        content: '建议增加暗色主题选项，方便夜间使用',
        priority: 'medium',
        status: 'resolved',
        response: '感谢您的建议！暗色主题功能已经在最新版本中上线。',
        response_at: '2024-12-25T10:00:00Z',
        is_read: true,
        created_at: '2024-12-24T15:30:00Z'
      }
    ]

    stats.value = {
      total: 5,
      pending: 2,
      resolved: 3,
      response_rate: 80,
      by_type: {
        bug: 2,
        feature: 2,
        improvement: 1
      }
    }

  } catch (error) {
    console.error('加载反馈历史失败:', error)
  } finally {
    loading.value = false
  }
}

const getSystemInfo = () => {
  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    screenResolution: `${screen.width}x${screen.height}`,
    timestamp: new Date().toISOString()
  }
}

const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    bug: 'Bug 报告',
    feature: '功能建议',
    improvement: '改进建议',
    question: '问题咨询',
    other: '其他'
  }
  return labels[type] || type
}

const getPriorityLabel = (priority: string) => {
  const labels: Record<string, string> = {
    low: '低',
    medium: '中',
    high: '高',
    urgent: '紧急'
  }
  return labels[priority] || priority
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

// 生命周期
onMounted(() => {
  if (authStore.user) {
    loadFeedbackHistory()
  }
})
</script>

<style scoped>
.feedback-widget {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 1000;
}

.feedback-button {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3.5rem;
  height: 3.5rem;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

.feedback-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

.feedback-button .icon {
  width: 1.5rem;
  height: 1.5rem;
}

.feedback-badge {
  position: absolute;
  top: -0.25rem;
  right: -0.25rem;
  background: #ef4444;
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.125rem 0.375rem;
  border-radius: 0.75rem;
  min-width: 1.25rem;
  text-align: center;
}

.feedback-panel {
  position: absolute;
  bottom: 4rem;
  right: 0;
  width: 24rem;
  max-height: 32rem;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  box-shadow: 0 20px 25px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-surface);
}

.panel-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
}

.close-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-button:hover {
  background: var(--color-surface-hover);
  color: var(--color-text);
}

.close-button .icon {
  width: 1rem;
  height: 1rem;
}

.panel-tabs {
  display: flex;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
}

.tab-button {
  flex: 1;
  padding: 0.75rem 1rem;
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-button:hover {
  background: var(--color-surface-hover);
  color: var(--color-text);
}

.tab-button.active {
  background: var(--color-background);
  color: var(--color-primary);
  border-bottom: 2px solid var(--color-primary);
}

.panel-content {
  max-height: 24rem;
  overflow-y: auto;
  padding: 1.5rem;
}

.feedback-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text);
}

.form-input,
.form-select,
.form-textarea {
  padding: 0.75rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  color: var(--color-text);
  font-size: 0.875rem;
  transition: border-color 0.2s ease;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--color-primary);
}

.form-textarea {
  resize: vertical;
  min-height: 4rem;
}

.form-checkbox {
  margin-right: 0.5rem;
}

.form-actions {
  margin-top: 0.5rem;
}

.submit-button {
  width: 100%;
  padding: 0.75rem;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.submit-button:hover:not(:disabled) {
  background: color-mix(in srgb, var(--color-primary) 90%, black);
}

.submit-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  color: var(--color-text-secondary);
}

.loading-spinner {
  width: 2rem;
  height: 2rem;
  border: 2px solid var(--color-border);
  border-top: 2px solid var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-icon {
  width: 3rem;
  height: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.feedback-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.feedback-item {
  padding: 1rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
}

.feedback-item.unread {
  border-left: 3px solid var(--color-primary);
}

.feedback-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  font-size: 0.75rem;
}

.feedback-type,
.feedback-priority {
  padding: 0.125rem 0.5rem;
  border-radius: 1rem;
  font-weight: 500;
}

.feedback-type.bug { background: #fef2f2; color: #dc2626; }
.feedback-type.feature { background: #f0f9ff; color: #2563eb; }
.feedback-type.improvement { background: #f0fdf4; color: #16a34a; }

.feedback-priority.high { background: #fef2f2; color: #dc2626; }
.feedback-priority.urgent { background: #7c2d12; color: white; }

.feedback-date {
  color: var(--color-text-secondary);
  margin-left: auto;
}

.feedback-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 0.5rem 0;
}

.feedback-content {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  line-height: 1.4;
  margin: 0;
}

.feedback-response {
  margin-top: 1rem;
  padding: 1rem;
  background: var(--color-background);
  border-radius: 6px;
}

.feedback-response h5 {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-primary);
  margin: 0 0 0.5rem 0;
}

.feedback-response p {
  font-size: 0.875rem;
  color: var(--color-text);
  margin: 0 0 0.5rem 0;
}

.response-date {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  padding: 1rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  text-align: center;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.chart-section h4 {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 1rem 0;
}

.type-distribution {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.type-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.type-label {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  min-width: 4rem;
}

.type-bar {
  flex: 1;
  height: 0.5rem;
  background: var(--color-border);
  border-radius: 0.25rem;
  overflow: hidden;
}

.type-fill {
  height: 100%;
  background: var(--color-primary);
  transition: width 0.3s ease;
}

.type-count {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text);
  min-width: 1.5rem;
  text-align: right;
}

.success-message {
  position: fixed;
  bottom: 6rem;
  right: 2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  background: #10b981;
  color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: slideIn 0.3s ease;
}

.success-icon {
  width: 1.25rem;
  height: 1.25rem;
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

@media (max-width: 640px) {
  .feedback-widget {
    bottom: 1rem;
    right: 1rem;
  }
  
  .feedback-panel {
    width: calc(100vw - 2rem);
    max-width: 20rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
