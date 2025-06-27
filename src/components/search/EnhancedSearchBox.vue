<template>
  <div class="enhanced-search-box" :class="{ 'is-focused': isFocused, 'is-expanded': isExpanded }">
    <!-- 搜索输入框 -->
    <div class="search-input-container">
      <div class="search-input-wrapper">
        <SearchIcon class="search-icon" />
        <input
          ref="searchInput"
          v-model="query"
          type="text"
          class="search-input"
          :placeholder="placeholder"
          @focus="handleFocus"
          @blur="handleBlur"
          @keydown="handleKeydown"
          @input="handleInput"
        />
        <div class="search-actions">
          <!-- 搜索类型选择 -->
          <select v-model="searchType" class="search-type-select">
            <option value="all">全部</option>
            <option value="tools">工具</option>
            <option value="products">产品</option>
            <option value="categories">分类</option>
          </select>
          
          <!-- 清除按钮 -->
          <button
            v-if="query"
            @click="clearSearch"
            class="clear-button"
            type="button"
          >
            <XIcon class="icon" />
          </button>
          
          <!-- 高级搜索按钮 -->
          <button
            @click="toggleAdvanced"
            class="advanced-button"
            :class="{ active: showAdvanced }"
            type="button"
          >
            <FilterIcon class="icon" />
          </button>
        </div>
      </div>

      <!-- 搜索建议下拉框 -->
      <div v-if="showSuggestions && (suggestions.length > 0 || searchHistory.length > 0)" class="suggestions-dropdown">
        <!-- 搜索建议 -->
        <div v-if="suggestions.length > 0" class="suggestions-section">
          <div class="suggestions-header">搜索建议</div>
          <div
            v-for="(suggestion, index) in suggestions"
            :key="`suggestion-${index}`"
            class="suggestion-item"
            :class="{ active: selectedIndex === index }"
            @click="selectSuggestion(suggestion.text)"
            @mouseenter="selectedIndex = index"
          >
            <component :is="getSuggestionIcon(suggestion.type)" class="suggestion-icon" />
            <span class="suggestion-text">{{ suggestion.text }}</span>
            <span class="suggestion-type">{{ getSuggestionTypeText(suggestion.type) }}</span>
          </div>
        </div>

        <!-- 搜索历史 -->
        <div v-if="searchHistory.length > 0 && !query" class="suggestions-section">
          <div class="suggestions-header">
            <span>最近搜索</span>
            <button @click="clearHistory" class="clear-history-button">清除</button>
          </div>
          <div
            v-for="(history, index) in searchHistory"
            :key="`history-${history.id}`"
            class="suggestion-item history-item"
            :class="{ active: selectedIndex === suggestions.length + index }"
            @click="selectSuggestion(history.query)"
            @mouseenter="selectedIndex = suggestions.length + index"
          >
            <ClockIcon class="suggestion-icon" />
            <span class="suggestion-text">{{ history.query }}</span>
            <span class="suggestion-meta">{{ formatTime(history.timestamp) }}</span>
          </div>
        </div>

        <!-- 热门搜索 -->
        <div v-if="popularSearches.length > 0 && !query" class="suggestions-section">
          <div class="suggestions-header">热门搜索</div>
          <div class="popular-searches">
            <button
              v-for="popular in popularSearches"
              :key="popular"
              @click="selectSuggestion(popular)"
              class="popular-search-tag"
            >
              {{ popular }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 高级搜索面板 -->
    <div v-if="showAdvanced" class="advanced-search-panel">
      <div class="advanced-search-content">
        <div class="advanced-row">
          <div class="advanced-group">
            <label class="advanced-label">分类</label>
            <select v-model="filters.category" class="advanced-select">
              <option value="">所有分类</option>
              <option v-for="category in categories" :key="category.id" :value="category.id">
                {{ category.name }}
              </option>
            </select>
          </div>

          <div class="advanced-group">
            <label class="advanced-label">排序</label>
            <select v-model="filters.sortBy" class="advanced-select">
              <option value="relevance">相关性</option>
              <option value="name">名称</option>
              <option value="created_at">创建时间</option>
              <option value="click_count">热度</option>
              <option value="price">价格</option>
            </select>
          </div>

          <div class="advanced-group">
            <label class="advanced-label">顺序</label>
            <select v-model="filters.sortOrder" class="advanced-select">
              <option value="desc">降序</option>
              <option value="asc">升序</option>
            </select>
          </div>
        </div>

        <div v-if="searchType === 'products'" class="advanced-row">
          <div class="advanced-group">
            <label class="advanced-label">价格范围</label>
            <div class="price-range">
              <input
                v-model.number="filters.priceMin"
                type="number"
                placeholder="最低价"
                class="price-input"
                min="0"
              />
              <span class="price-separator">-</span>
              <input
                v-model.number="filters.priceMax"
                type="number"
                placeholder="最高价"
                class="price-input"
                min="0"
              />
            </div>
          </div>
        </div>

        <div class="advanced-row">
          <div class="advanced-group full-width">
            <label class="advanced-label">标签</label>
            <div class="tags-input">
              <div class="selected-tags">
                <span
                  v-for="tag in selectedTags"
                  :key="tag.id"
                  class="selected-tag"
                >
                  {{ tag.name }}
                  <button @click="removeTag(tag)" class="remove-tag">
                    <XIcon class="icon" />
                  </button>
                </span>
              </div>
              <input
                v-model="tagQuery"
                type="text"
                placeholder="输入标签名称..."
                class="tag-input"
                @input="searchTags"
              />
              <div v-if="availableTags.length > 0" class="tags-dropdown">
                <div
                  v-for="tag in availableTags"
                  :key="tag.id"
                  class="tag-option"
                  @click="addTag(tag)"
                >
                  <span class="tag-color" :style="{ backgroundColor: tag.color }"></span>
                  {{ tag.name }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="advanced-actions">
          <button @click="resetFilters" class="reset-button">重置</button>
          <button @click="applyFilters" class="apply-button">应用筛选</button>
        </div>
      </div>
    </div>

    <!-- 搜索状态 -->
    <div v-if="isSearching" class="search-status">
      <div class="search-loading">
        <div class="loading-spinner"></div>
        <span>搜索中...</span>
      </div>
    </div>

    <!-- 搜索结果统计 -->
    <div v-if="lastSearchResult" class="search-stats">
      找到 {{ lastSearchResult.total }} 个结果，用时 {{ lastSearchResult.searchTime }}ms
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useDebounceFn } from '@vueuse/core'
import { 
  SearchIcon, 
  XIcon, 
  FilterIcon, 
  ClockIcon,
  TagIcon,
  FolderIcon,
  PackageIcon,
  TrendingUpIcon
} from 'lucide-vue-next'
import { searchService } from '@/services/searchService'
import { useCategoriesStore } from '@/stores/categories'
import type { SearchResult, SearchSuggestion, SearchHistory } from '@/services/searchService'
import type { Category, Tag } from '@/types'

interface Props {
  placeholder?: string
  autoFocus?: boolean
  showAdvanced?: boolean
  defaultType?: string
}

interface Emits {
  (e: 'search', result: SearchResult<any>): void
  (e: 'clear'): void
  (e: 'focus'): void
  (e: 'blur'): void
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '搜索工具、产品、分类...',
  autoFocus: false,
  showAdvanced: false,
  defaultType: 'all'
})

const emit = defineEmits<Emits>()

const router = useRouter()
const categoriesStore = useCategoriesStore()

// 引用
const searchInput = ref<HTMLInputElement>()

// 状态
const query = ref('')
const searchType = ref(props.defaultType)
const isFocused = ref(false)
const isExpanded = ref(false)
const showSuggestions = ref(false)
const showAdvanced = ref(props.showAdvanced)
const isSearching = ref(false)
const selectedIndex = ref(-1)

// 搜索建议
const suggestions = ref<SearchSuggestion[]>([])
const searchHistory = ref<SearchHistory[]>([])
const popularSearches = ref<string[]>([])

// 高级搜索
const filters = ref({
  category: '',
  sortBy: 'relevance',
  sortOrder: 'desc',
  priceMin: null as number | null,
  priceMax: null as number | null
})

// 标签相关
const selectedTags = ref<Tag[]>([])
const tagQuery = ref('')
const availableTags = ref<Tag[]>([])

// 搜索结果
const lastSearchResult = ref<SearchResult<any> | null>(null)

// 计算属性
const categories = computed(() => categoriesStore.categories)

const allSuggestions = computed(() => [
  ...suggestions.value,
  ...searchHistory.value.map(h => ({ text: h.query, type: 'query' as const }))
])

// 方法
const handleFocus = () => {
  isFocused.value = true
  isExpanded.value = true
  showSuggestions.value = true
  emit('focus')
  loadSuggestions()
}

const handleBlur = () => {
  // 延迟隐藏，允许点击建议
  setTimeout(() => {
    isFocused.value = false
    showSuggestions.value = false
    selectedIndex.value = -1
  }, 200)
  emit('blur')
}

const handleInput = () => {
  selectedIndex.value = -1
  debouncedLoadSuggestions()
}

const handleKeydown = (event: KeyboardEvent) => {
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      selectedIndex.value = Math.min(selectedIndex.value + 1, allSuggestions.value.length - 1)
      break
    case 'ArrowUp':
      event.preventDefault()
      selectedIndex.value = Math.max(selectedIndex.value - 1, -1)
      break
    case 'Enter':
      event.preventDefault()
      if (selectedIndex.value >= 0) {
        selectSuggestion(allSuggestions.value[selectedIndex.value].text)
      } else {
        performSearch()
      }
      break
    case 'Escape':
      searchInput.value?.blur()
      break
  }
}

const loadSuggestions = async () => {
  try {
    if (query.value) {
      suggestions.value = await searchService.getSmartSuggestions(query.value)
    } else {
      suggestions.value = []
      searchHistory.value = searchService.getSearchHistory(5)
      popularSearches.value = await searchService.getPopularSearches(8)
    }
  } catch (error) {
    console.error('加载搜索建议失败:', error)
  }
}

const debouncedLoadSuggestions = useDebounceFn(loadSuggestions, 300)

const selectSuggestion = (text: string) => {
  query.value = text
  showSuggestions.value = false
  performSearch()
}

const performSearch = async () => {
  if (!query.value.trim()) return

  try {
    isSearching.value = true
    
    const searchOptions = {
      query: query.value.trim(),
      type: searchType.value as any,
      category: filters.value.category || undefined,
      tags: selectedTags.value.map(tag => tag.id),
      priceRange: filters.value.priceMin && filters.value.priceMax 
        ? [filters.value.priceMin, filters.value.priceMax] as [number, number]
        : undefined,
      sortBy: filters.value.sortBy as any,
      sortOrder: filters.value.sortOrder as any,
      limit: 20
    }

    const result = await searchService.search(searchOptions)
    lastSearchResult.value = result
    emit('search', result)

    // 导航到搜索结果页面
    router.push({
      name: 'SearchResults',
      query: {
        q: query.value,
        type: searchType.value,
        ...filters.value
      }
    })
  } catch (error) {
    console.error('搜索失败:', error)
  } finally {
    isSearching.value = false
  }
}

const clearSearch = () => {
  query.value = ''
  lastSearchResult.value = null
  emit('clear')
  searchInput.value?.focus()
}

const clearHistory = () => {
  searchService.clearSearchHistory()
  searchHistory.value = []
}

const toggleAdvanced = () => {
  showAdvanced.value = !showAdvanced.value
  isExpanded.value = showAdvanced.value
}

const resetFilters = () => {
  filters.value = {
    category: '',
    sortBy: 'relevance',
    sortOrder: 'desc',
    priceMin: null,
    priceMax: null
  }
  selectedTags.value = []
}

const applyFilters = () => {
  if (query.value) {
    performSearch()
  }
}

// 标签相关方法
const searchTags = async () => {
  if (!tagQuery.value) {
    availableTags.value = []
    return
  }

  try {
    // 这里应该调用标签搜索API
    // const tags = await tagService.searchTags(tagQuery.value)
    // availableTags.value = tags.filter(tag => !selectedTags.value.find(t => t.id === tag.id))
  } catch (error) {
    console.error('搜索标签失败:', error)
  }
}

const addTag = (tag: Tag) => {
  if (!selectedTags.value.find(t => t.id === tag.id)) {
    selectedTags.value.push(tag)
  }
  tagQuery.value = ''
  availableTags.value = []
}

const removeTag = (tag: Tag) => {
  selectedTags.value = selectedTags.value.filter(t => t.id !== tag.id)
}

// 工具方法
const getSuggestionIcon = (type: string) => {
  switch (type) {
    case 'category': return FolderIcon
    case 'tag': return TagIcon
    case 'tool': return PackageIcon
    case 'product': return PackageIcon
    default: return TrendingUpIcon
  }
}

const getSuggestionTypeText = (type: string) => {
  switch (type) {
    case 'category': return '分类'
    case 'tag': return '标签'
    case 'tool': return '工具'
    case 'product': return '产品'
    default: return '搜索'
  }
}

const formatTime = (date: Date) => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  return `${days}天前`
}

// 生命周期
onMounted(async () => {
  if (props.autoFocus) {
    await nextTick()
    searchInput.value?.focus()
  }
  
  // 加载分类数据
  if (categoriesStore.categories.length === 0) {
    await categoriesStore.fetchCategories()
  }
})

// 监听器
watch(query, () => {
  if (!query.value) {
    lastSearchResult.value = null
  }
})

// 暴露方法
defineExpose({
  focus: () => searchInput.value?.focus(),
  clear: clearSearch,
  search: performSearch
})
</script>

<style scoped>
.enhanced-search-box {
  position: relative;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

.search-input-container {
  position: relative;
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 0.75rem 1rem;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.enhanced-search-box.is-focused .search-input-wrapper {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.search-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: #64748b;
  margin-right: 0.75rem;
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 1rem;
  color: #1e293b;
  background: transparent;
}

.search-input::placeholder {
  color: #94a3b8;
}

.search-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: 0.75rem;
}

.search-type-select {
  padding: 0.25rem 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.875rem;
  color: #64748b;
  background: white;
  cursor: pointer;
}

.clear-button,
.advanced-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
}

.clear-button:hover,
.advanced-button:hover {
  background: #f1f5f9;
  color: #475569;
}

.advanced-button.active {
  background: #3b82f6;
  color: white;
}

.suggestions-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  max-height: 400px;
  overflow-y: auto;
  margin-top: 0.5rem;
}

.suggestions-section {
  padding: 0.75rem 0;
}

.suggestions-section:not(:last-child) {
  border-bottom: 1px solid #f1f5f9;
}

.suggestions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 1rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.clear-history-button {
  background: none;
  border: none;
  color: #3b82f6;
  cursor: pointer;
  font-size: 0.75rem;
  text-transform: none;
  letter-spacing: normal;
}

.suggestion-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.suggestion-item:hover,
.suggestion-item.active {
  background: #f8fafc;
}

.suggestion-icon {
  width: 1rem;
  height: 1rem;
  color: #64748b;
  margin-right: 0.75rem;
  flex-shrink: 0;
}

.suggestion-text {
  flex: 1;
  color: #1e293b;
  font-size: 0.875rem;
}

.suggestion-type,
.suggestion-meta {
  font-size: 0.75rem;
  color: #94a3b8;
}

.popular-searches {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0 1rem;
}

.popular-search-tag {
  padding: 0.25rem 0.75rem;
  background: #f1f5f9;
  border: none;
  border-radius: 16px;
  font-size: 0.75rem;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s ease;
}

.popular-search-tag:hover {
  background: #e2e8f0;
}

.advanced-search-panel {
  margin-top: 1rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.advanced-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.advanced-row:last-child {
  margin-bottom: 0;
}

.advanced-group {
  display: flex;
  flex-direction: column;
}

.advanced-group.full-width {
  grid-column: 1 / -1;
}

.advanced-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.advanced-select,
.price-input,
.tag-input {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  transition: border-color 0.2s ease;
}

.advanced-select:focus,
.price-input:focus,
.tag-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.price-range {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.price-separator {
  color: #64748b;
  font-weight: 500;
}

.tags-input {
  position: relative;
}

.selected-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.selected-tag {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  background: #dbeafe;
  color: #1e40af;
  border-radius: 4px;
  font-size: 0.75rem;
}

.remove-tag {
  background: none;
  border: none;
  color: #1e40af;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
}

.tags-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 100;
  max-height: 200px;
  overflow-y: auto;
}

.tag-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.tag-option:hover {
  background: #f8fafc;
}

.tag-color {
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 50%;
}

.advanced-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #f1f5f9;
}

.reset-button,
.apply-button {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.reset-button {
  background: transparent;
  border: 1px solid #d1d5db;
  color: #374151;
}

.reset-button:hover {
  background: #f9fafb;
}

.apply-button {
  background: #3b82f6;
  border: 1px solid #3b82f6;
  color: white;
}

.apply-button:hover {
  background: #2563eb;
}

.search-status {
  margin-top: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
  text-align: center;
}

.search-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  color: #64748b;
  font-size: 0.875rem;
}

.loading-spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid #e2e8f0;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.search-stats {
  margin-top: 0.5rem;
  padding: 0.5rem 1rem;
  background: #f0f9ff;
  border-radius: 6px;
  font-size: 0.75rem;
  color: #0369a1;
  text-align: center;
}

@media (max-width: 768px) {
  .advanced-row {
    grid-template-columns: 1fr;
  }
  
  .search-actions {
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .advanced-actions {
    flex-direction: column;
  }
}
</style>
