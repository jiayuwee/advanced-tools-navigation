<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 页面头部 -->
    <div class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="text-center">
          <h1 class="text-3xl font-bold text-gray-900">使用指南</h1>
          <p class="mt-4 text-lg text-gray-600">
            详细的使用说明和操作指南，帮助您快速上手
          </p>
        </div>
      </div>
    </div>

    <!-- 主要内容 -->
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <!-- 目录导航 -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 class="text-xl font-bold text-gray-900 mb-4">目录</h2>
        <nav class="space-y-2">
          <a
            v-for="section in sections"
            :key="section.id"
            :href="`#${section.id}`"
            class="block text-blue-600 hover:text-blue-800 transition-colors"
          >
            {{ section.title }}
          </a>
        </nav>
      </div>

      <!-- 指南内容 -->
      <div class="space-y-12">
        <!-- 快速开始 -->
        <section id="getting-started" class="bg-white rounded-lg shadow-md p-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Rocket class="w-6 h-6 mr-3 text-blue-600" />
            快速开始
          </h2>
          <div class="prose prose-lg max-w-none">
            <p class="text-gray-700 mb-4">
              欢迎使用工具导航站！这里为您提供了丰富的工具资源和产品信息。
            </p>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div class="text-center p-4 border border-gray-200 rounded-lg">
                <div
                  class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3"
                >
                  <Search class="w-6 h-6 text-blue-600" />
                </div>
                <h3 class="font-semibold text-gray-900 mb-2">1. 搜索工具</h3>
                <p class="text-sm text-gray-600">
                  使用搜索功能快速找到您需要的工具
                </p>
              </div>
              <div class="text-center p-4 border border-gray-200 rounded-lg">
                <div
                  class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3"
                >
                  <Heart class="w-6 h-6 text-green-600" />
                </div>
                <h3 class="font-semibold text-gray-900 mb-2">2. 收藏工具</h3>
                <p class="text-sm text-gray-600">
                  收藏喜欢的工具，方便下次使用
                </p>
              </div>
              <div class="text-center p-4 border border-gray-200 rounded-lg">
                <div
                  class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3"
                >
                  <ShoppingCart class="w-6 h-6 text-purple-600" />
                </div>
                <h3 class="font-semibold text-gray-900 mb-2">3. 购买产品</h3>
                <p class="text-sm text-gray-600">购买高质量的工具和产品</p>
              </div>
            </div>
          </div>
        </section>

        <!-- 账户管理 -->
        <section
          id="account-management"
          class="bg-white rounded-lg shadow-md p-8"
        >
          <h2 class="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Users class="w-6 h-6 mr-3 text-green-600" />
            账户管理
          </h2>
          <div class="space-y-6">
            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-3">注册账户</h3>
              <ol class="list-decimal list-inside space-y-2 text-gray-700">
                <li>点击页面右上角的"注册"按钮</li>
                <li>填写邮箱地址和密码</li>
                <li>点击"注册"完成账户创建</li>
                <li>查看邮箱验证邮件（如需要）</li>
              </ol>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-3">登录账户</h3>
              <ol class="list-decimal list-inside space-y-2 text-gray-700">
                <li>点击页面右上角的"登录"按钮</li>
                <li>输入邮箱和密码</li>
                <li>点击"登录"进入您的账户</li>
              </ol>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-3">
                修改个人信息
              </h3>
              <ol class="list-decimal list-inside space-y-2 text-gray-700">
                <li>登录后点击右上角的用户头像</li>
                <li>选择"个人中心"</li>
                <li>在个人信息页面修改相关信息</li>
                <li>点击"保存"确认修改</li>
              </ol>
            </div>
          </div>
        </section>

        <!-- 工具搜索与浏览 -->
        <section id="tool-browsing" class="bg-white rounded-lg shadow-md p-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Search class="w-6 h-6 mr-3 text-purple-600" />
            工具搜索与浏览
          </h2>
          <div class="space-y-6">
            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-3">搜索工具</h3>
              <ul class="list-disc list-inside space-y-2 text-gray-700">
                <li>在页面顶部的搜索框中输入关键词</li>
                <li>支持按工具名称、描述、标签搜索</li>
                <li>使用筛选器缩小搜索范围</li>
                <li>查看搜索结果并点击进入详情页</li>
              </ul>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-3">分类浏览</h3>
              <ul class="list-disc list-inside space-y-2 text-gray-700">
                <li>点击主页的分类标签</li>
                <li>浏览该分类下的所有工具</li>
                <li>使用排序功能按热度、评分等排序</li>
              </ul>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-3">收藏工具</h3>
              <ul class="list-disc list-inside space-y-2 text-gray-700">
                <li>在工具详情页点击收藏按钮（心形图标）</li>
                <li>收藏的工具会保存到您的个人中心</li>
                <li>在"我的收藏"页面管理收藏的工具</li>
              </ul>
            </div>
          </div>
        </section>

        <!-- 产品购买 -->
        <section
          id="product-purchase"
          class="bg-white rounded-lg shadow-md p-8"
        >
          <h2 class="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <ShoppingCart class="w-6 h-6 mr-3 text-orange-600" />
            产品购买
          </h2>
          <div class="space-y-6">
            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-3">购买流程</h3>
              <ol class="list-decimal list-inside space-y-2 text-gray-700">
                <li>浏览产品页面，选择您需要的产品</li>
                <li>点击"立即购买"或"加入购物车"</li>
                <li>确认订单信息和价格</li>
                <li>选择支付方式完成支付</li>
                <li>下载或获取产品访问权限</li>
              </ol>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-3">支付方式</h3>
              <ul class="list-disc list-inside space-y-2 text-gray-700">
                <li>支付宝</li>
                <li>微信支付</li>
                <li>银行卡支付</li>
                <li>其他第三方支付平台</li>
              </ul>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-3">订单管理</h3>
              <ul class="list-disc list-inside space-y-2 text-gray-700">
                <li>在个人中心查看订单历史</li>
                <li>下载已购买的产品</li>
                <li>申请退款（如适用）</li>
                <li>联系客服处理订单问题</li>
              </ul>
            </div>
          </div>
        </section>

        <!-- 产品上传 -->
        <section id="product-upload" class="bg-white rounded-lg shadow-md p-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Upload class="w-6 h-6 mr-3 text-red-600" />
            产品上传
          </h2>
          <div class="space-y-6">
            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-3">上传要求</h3>
              <ul class="list-disc list-inside space-y-2 text-gray-700">
                <li>产品必须是原创或有合法授权</li>
                <li>提供详细的产品描述和使用说明</li>
                <li>上传高质量的产品截图或演示</li>
                <li>设置合理的价格</li>
              </ul>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-3">上传流程</h3>
              <ol class="list-decimal list-inside space-y-2 text-gray-700">
                <li>登录账户并进入个人中心</li>
                <li>点击"上传产品"按钮</li>
                <li>填写产品信息表单</li>
                <li>上传产品文件和图片</li>
                <li>提交审核，等待管理员审批</li>
              </ol>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-3">审核流程</h3>
              <ul class="list-disc list-inside space-y-2 text-gray-700">
                <li>提交后进入审核队列</li>
                <li>管理员会在1-3个工作日内审核</li>
                <li>审核通过后产品会上线销售</li>
                <li>如被拒绝会收到详细的拒绝原因</li>
              </ul>
            </div>
          </div>
        </section>

        <!-- 常见问题 -->
        <section id="common-issues" class="bg-white rounded-lg shadow-md p-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <HelpCircle class="w-6 h-6 mr-3 text-yellow-600" />
            常见问题
          </h2>
          <div class="space-y-4">
            <div class="border-l-4 border-blue-500 pl-4">
              <h3 class="font-semibold text-gray-900">Q: 忘记密码怎么办？</h3>
              <p class="text-gray-700">
                A: 在登录页面点击"忘记密码"，输入邮箱地址即可重置密码。
              </p>
            </div>
            <div class="border-l-4 border-green-500 pl-4">
              <h3 class="font-semibold text-gray-900">Q: 如何联系客服？</h3>
              <p class="text-gray-700">
                A: 您可以通过页面底部的联系方式或意见反馈功能联系我们。
              </p>
            </div>
            <div class="border-l-4 border-purple-500 pl-4">
              <h3 class="font-semibold text-gray-900">
                Q: 产品下载失败怎么办？
              </h3>
              <p class="text-gray-700">
                A:
                请检查网络连接，或尝试使用其他浏览器下载。如问题持续，请联系技术支持。
              </p>
            </div>
          </div>
        </section>
      </div>

      <!-- 底部帮助 -->
      <div class="mt-12 bg-blue-50 rounded-lg p-6 text-center">
        <h3 class="text-lg font-semibold text-gray-900 mb-2">需要更多帮助？</h3>
        <p class="text-gray-600 mb-4">查看常见问题或联系我们的支持团队</p>
        <div class="flex flex-col sm:flex-row gap-3 justify-center">
          <router-link
            to="/faq"
            class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <HelpCircle class="w-4 h-4 mr-2" />
            常见问题
          </router-link>
          <router-link
            to="/contact"
            class="inline-flex items-center px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
          >
            <MessageCircle class="w-4 h-4 mr-2" />
            联系我们
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import {
  Rocket,
  Search,
  Heart,
  ShoppingCart,
  Users,
  Upload,
  HelpCircle,
  MessageCircle,
} from "lucide-vue-next";

// 目录数据
const sections = ref([
  { id: "getting-started", title: "快速开始" },
  { id: "account-management", title: "账户管理" },
  { id: "tool-browsing", title: "工具搜索与浏览" },
  { id: "product-purchase", title: "产品购买" },
  { id: "product-upload", title: "产品上传" },
  { id: "common-issues", title: "常见问题" },
]);

// 生命周期
onMounted(() => {
  // 设置页面标题
  document.title = "使用指南 - 工具导航站";
});
</script>
