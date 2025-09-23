<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 页面头部 -->
    <div class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="text-center">
          <h1 class="text-3xl font-bold text-gray-900">常见问题</h1>
          <p class="mt-4 text-lg text-gray-600">快速找到您需要的答案</p>
        </div>

        <!-- 搜索框 -->
        <div class="mt-8 max-w-2xl mx-auto">
          <div class="relative">
            <Search
              class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
            />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="搜索问题..."
              class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 主要内容 -->
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <!-- 分类标签 -->
      <div class="flex flex-wrap gap-2 mb-8">
        <button
          v-for="category in categories"
          :key="category.id"
          :class="[
            'px-4 py-2 rounded-full text-sm font-medium transition-colors',
            selectedCategory === category.id
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100',
          ]"
          @click="selectedCategory = category.id"
        >
          {{ category.name }}
        </button>
      </div>

      <!-- FAQ列表 -->
      <div class="space-y-4">
        <div
          v-for="faq in filteredFAQs"
          :key="faq.id"
          class="bg-white rounded-lg shadow-md overflow-hidden"
        >
          <button
            class="w-full px-6 py-4 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition-colors"
            @click="toggleFAQ(faq.id)"
          >
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold text-gray-900">
                {{ faq.question }}
              </h3>
              <ChevronDown
                :class="[
                  'w-5 h-5 text-gray-500 transition-transform',
                  expandedFAQs.includes(faq.id) ? 'transform rotate-180' : '',
                ]"
              />
            </div>
          </button>

          <div
            v-if="expandedFAQs.includes(faq.id)"
            class="px-6 pb-4 border-t border-gray-100"
          >
            <div
              class="pt-4 text-gray-700 prose prose-sm max-w-none"
              v-text="faq.answer"
            ></div>

            <!-- 有用性评价 -->
            <div class="mt-4 pt-4 border-t border-gray-100">
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600"
                  >这个答案对您有帮助吗？</span
                >
                <div class="flex items-center space-x-2">
                  <button
                    class="flex items-center space-x-1 px-3 py-1 text-sm text-green-600 hover:bg-green-50 rounded-md transition-colors"
                    @click="rateFAQ(faq.id, true)"
                  >
                    <ThumbsUp class="w-4 h-4" />
                    <span>有用 ({{ faq.helpful_count }})</span>
                  </button>
                  <button
                    class="flex items-center space-x-1 px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    @click="rateFAQ(faq.id, false)"
                  >
                    <ThumbsDown class="w-4 h-4" />
                    <span>无用 ({{ faq.not_helpful_count }})</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 没有找到结果 -->
      <div v-if="filteredFAQs.length === 0" class="text-center py-12">
        <div
          class="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center"
        >
          <Search class="w-12 h-12 text-gray-400" />
        </div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">
          没有找到相关问题
        </h3>
        <p class="text-gray-600 mb-6">
          尝试使用不同的关键词搜索，或者联系我们获取帮助
        </p>
        <router-link
          to="/contact"
          class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <MessageCircle class="w-4 h-4 mr-2" />
          联系我们
        </router-link>
      </div>

      <!-- 底部帮助 -->
      <div class="mt-12 bg-blue-50 rounded-lg p-6 text-center">
        <h3 class="text-lg font-semibold text-gray-900 mb-2">还没找到答案？</h3>
        <p class="text-gray-600 mb-4">我们的支持团队随时为您提供帮助</p>
        <div class="flex flex-col sm:flex-row gap-3 justify-center">
          <router-link
            to="/contact"
            class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <MessageCircle class="w-4 h-4 mr-2" />
            联系支持
          </router-link>
          <router-link
            to="/feedback"
            class="inline-flex items-center px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
          >
            <Send class="w-4 h-4 mr-2" />
            提交反馈
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import {
  Search,
  ChevronDown,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Send,
} from "lucide-vue-next";

// 响应式数据
const searchQuery = ref("");
const selectedCategory = ref("all");
const expandedFAQs = ref<string[]>([]);

// 模拟数据（实际应该从API获取）
const categories = ref([
  { id: "all", name: "全部" },
  { id: "account", name: "账户问题" },
  { id: "usage", name: "使用指南" },
  { id: "product", name: "产品相关" },
  { id: "technical", name: "技术支持" },
  { id: "other", name: "其他问题" },
]);

const faqs = ref([
  {
    id: "1",
    category: "usage",
    question: "如何搜索工具？",
    answer:
      "您可以使用页面顶部的搜索框输入关键词来搜索工具。支持按工具名称、描述、标签等进行搜索。您也可以通过分类浏览来查找特定类型的工具。",
    helpful_count: 25,
    not_helpful_count: 2,
    is_featured: true,
  },
  {
    id: "2",
    category: "usage",
    question: "如何收藏工具？",
    answer:
      '在工具详情页面点击收藏按钮（心形图标）即可收藏工具。收藏的工具会显示在您的个人中心的"我的收藏"页面中，方便您快速访问。',
    helpful_count: 18,
    not_helpful_count: 1,
    is_featured: true,
  },
  {
    id: "3",
    category: "account",
    question: "如何注册账户？",
    answer:
      '点击页面右上角的"注册"按钮，填写邮箱和密码即可完成注册。注册后您可以收藏工具、购买产品、提交反馈等。',
    helpful_count: 32,
    not_helpful_count: 0,
    is_featured: false,
  },
  {
    id: "4",
    category: "account",
    question: "忘记密码怎么办？",
    answer:
      '在登录页面点击"忘记密码"链接，输入您的邮箱地址，我们会发送重置密码的链接到您的邮箱。请检查邮箱（包括垃圾邮件文件夹）并按照邮件中的说明重置密码。',
    helpful_count: 15,
    not_helpful_count: 3,
    is_featured: false,
  },
  {
    id: "5",
    category: "product",
    question: "如何购买产品？",
    answer:
      '浏览产品页面，选择您需要的产品，点击"立即购买"按钮。您需要先登录账户，然后按照提示完成支付即可。我们支持多种支付方式。',
    helpful_count: 22,
    not_helpful_count: 1,
    is_featured: false,
  },
  {
    id: "6",
    category: "technical",
    question: "网站无法正常访问怎么办？",
    answer:
      "请尝试以下解决方案：<br>1. 检查您的网络连接<br>2. 清除浏览器缓存和Cookie<br>3. 尝试使用其他浏览器访问<br>4. 检查是否有防火墙或安全软件阻止访问<br>如问题持续存在，请联系我们的技术支持。",
    helpful_count: 12,
    not_helpful_count: 2,
    is_featured: false,
  },
]);

// 计算属性
const filteredFAQs = computed(() => {
  let filtered = faqs.value;

  // 按分类过滤
  if (selectedCategory.value !== "all") {
    filtered = filtered.filter(
      (faq) => faq.category === selectedCategory.value,
    );
  }

  // 按搜索关键词过滤
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (faq) =>
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query),
    );
  }

  return filtered;
});

// 方法
const toggleFAQ = (faqId: string) => {
  const index = expandedFAQs.value.indexOf(faqId);
  if (index > -1) {
    expandedFAQs.value.splice(index, 1);
  } else {
    expandedFAQs.value.push(faqId);
  }
};

const rateFAQ = async (faqId: string, isHelpful: boolean) => {
  // 这里应该调用API来记录评价
  console.log(`FAQ ${faqId} rated as ${isHelpful ? "helpful" : "not helpful"}`);

  // 更新本地计数（实际应该从API响应更新）
  const faq = faqs.value.find((f) => f.id === faqId);
  if (faq) {
    if (isHelpful) {
      faq.helpful_count++;
    } else {
      faq.not_helpful_count++;
    }
  }
};

// 生命周期
onMounted(() => {
  // 设置页面标题
  document.title = "常见问题 - 工具导航站";

  // 这里可以从API加载FAQ数据
  // loadFAQs()
});
</script>
