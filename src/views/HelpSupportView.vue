<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 页面头部 -->
    <div class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="text-center">
          <h1 class="text-3xl font-bold text-gray-900">帮助支持</h1>
          <p class="mt-4 text-lg text-gray-600">
            我们致力于为您提供最好的服务体验，如有任何问题请查看以下资源
          </p>
        </div>
      </div>
    </div>

    <!-- 主要内容 -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <!-- 快速导航 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <router-link
          to="/faq"
          class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200 group"
        >
          <div class="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4 group-hover:bg-blue-200 transition-colors">
            <HelpCircle class="w-6 h-6 text-blue-600" />
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">常见问题</h3>
          <p class="text-gray-600">查看常见问题解答，快速找到解决方案</p>
        </router-link>

        <router-link
          to="/user-guide"
          class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200 group"
        >
          <div class="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4 group-hover:bg-green-200 transition-colors">
            <BookOpen class="w-6 h-6 text-green-600" />
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">使用指南</h3>
          <p class="text-gray-600">详细的使用说明和操作指南</p>
        </router-link>

        <router-link
          to="/contact"
          class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200 group"
        >
          <div class="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-4 group-hover:bg-purple-200 transition-colors">
            <MessageCircle class="w-6 h-6 text-purple-600" />
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">联系我们</h3>
          <p class="text-gray-600">通过多种方式联系我们的支持团队</p>
        </router-link>

        <router-link
          to="/feedback"
          class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200 group"
        >
          <div class="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mb-4 group-hover:bg-orange-200 transition-colors">
            <Send class="w-6 h-6 text-orange-600" />
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">意见反馈</h3>
          <p class="text-gray-600">提交您的意见和建议，帮助我们改进</p>
        </router-link>
      </div>

      <!-- 热门帮助主题 -->
      <div class="bg-white rounded-lg shadow-md p-8 mb-12">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">热门帮助主题</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-4">账户相关</h3>
            <ul class="space-y-3">
              <li>
                <a href="#" class="text-blue-600 hover:text-blue-800 flex items-center">
                  <ChevronRight class="w-4 h-4 mr-2" />
                  如何注册账户？
                </a>
              </li>
              <li>
                <a href="#" class="text-blue-600 hover:text-blue-800 flex items-center">
                  <ChevronRight class="w-4 h-4 mr-2" />
                  忘记密码怎么办？
                </a>
              </li>
              <li>
                <a href="#" class="text-blue-600 hover:text-blue-800 flex items-center">
                  <ChevronRight class="w-4 h-4 mr-2" />
                  如何修改个人信息？
                </a>
              </li>
              <li>
                <a href="#" class="text-blue-600 hover:text-blue-800 flex items-center">
                  <ChevronRight class="w-4 h-4 mr-2" />
                  如何删除账户？
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-4">使用功能</h3>
            <ul class="space-y-3">
              <li>
                <a href="#" class="text-blue-600 hover:text-blue-800 flex items-center">
                  <ChevronRight class="w-4 h-4 mr-2" />
                  如何搜索工具？
                </a>
              </li>
              <li>
                <a href="#" class="text-blue-600 hover:text-blue-800 flex items-center">
                  <ChevronRight class="w-4 h-4 mr-2" />
                  如何收藏工具？
                </a>
              </li>
              <li>
                <a href="#" class="text-blue-600 hover:text-blue-800 flex items-center">
                  <ChevronRight class="w-4 h-4 mr-2" />
                  如何购买产品？
                </a>
              </li>
              <li>
                <a href="#" class="text-blue-600 hover:text-blue-800 flex items-center">
                  <ChevronRight class="w-4 h-4 mr-2" />
                  如何上传自己的产品？
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- 技术支持 -->
      <div class="bg-white rounded-lg shadow-md p-8 mb-12">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">技术支持</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="text-center">
            <div class="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4">
              <Clock class="w-8 h-8 text-blue-600" />
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">响应时间</h3>
            <p class="text-gray-600">工作日内24小时响应</p>
          </div>
          <div class="text-center">
            <div class="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto mb-4">
              <Shield class="w-8 h-8 text-green-600" />
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">安全保障</h3>
            <p class="text-gray-600">数据安全与隐私保护</p>
          </div>
          <div class="text-center">
            <div class="flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mx-auto mb-4">
              <Users class="w-8 h-8 text-purple-600" />
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">专业团队</h3>
            <p class="text-gray-600">经验丰富的技术支持团队</p>
          </div>
        </div>
      </div>

      <!-- 联系方式 -->
      <div class="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-md p-8 text-white">
        <div class="text-center">
          <h2 class="text-2xl font-bold mb-4">还有其他问题？</h2>
          <p class="text-lg mb-6">我们的支持团队随时为您提供帮助</p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <router-link
              to="/contact"
              class="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              联系支持团队
            </router-link>
            <router-link
              to="/feedback"
              class="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              提交反馈
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { 
  HelpCircle, 
  BookOpen, 
  MessageCircle, 
  Send, 
  ChevronRight, 
  Clock, 
  Shield, 
  Users 
} from 'lucide-vue-next'

// 设置页面标题
document.title = '帮助支持 - 工具导航站'
</script>

<style scoped>
/* 自定义样式 */
.group:hover .group-hover\:bg-blue-200 {
  background-color: rgb(191 219 254);
}

.group:hover .group-hover\:bg-green-200 {
  background-color: rgb(187 247 208);
}

.group:hover .group-hover\:bg-purple-200 {
  background-color: rgb(221 214 254);
}

.group:hover .group-hover\:bg-orange-200 {
  background-color: rgb(254 215 170);
}
</style>
