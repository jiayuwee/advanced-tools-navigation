<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 页面头部 -->
    <div class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="text-center">
          <h1 class="text-3xl font-bold text-gray-900">联系我们</h1>
          <p class="mt-4 text-lg text-gray-600">
            多种方式联系我们，我们随时为您提供帮助
          </p>
        </div>
      </div>
    </div>

    <!-- 主要内容 -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <!-- 联系方式 -->
        <div>
          <h2 class="text-2xl font-bold text-gray-900 mb-8">联系方式</h2>

          <div class="space-y-6">
            <!-- 客服邮箱 -->
            <div class="flex items-start space-x-4">
              <div class="flex-shrink-0">
                <div
                  class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center"
                >
                  <Mail class="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900">客服邮箱</h3>
                <p class="text-gray-600 mt-1">一般问题和技术支持</p>
                <a
                  href="mailto:contact@ramusi.cn"
                  class="text-blue-600 hover:text-blue-800 font-medium"
                >
                  contact@ramusi.cn
                </a>
              </div>
            </div>

            <!-- 商务合作 -->
            <div class="flex items-start space-x-4">
              <div class="flex-shrink-0">
                <div
                  class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center"
                >
                  <Briefcase class="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900">商务合作</h3>
                <p class="text-gray-600 mt-1">合作洽谈和商务咨询</p>
                <a
                  href="mailto:business@ramusi.cn"
                  class="text-blue-600 hover:text-blue-800 font-medium"
                >
                  business@ramusi.cn
                </a>
              </div>
            </div>

            <!-- 客服电话 -->
            <div class="flex items-start space-x-4">
              <div class="flex-shrink-0">
                <div
                  class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center"
                >
                  <Phone class="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900">客服电话</h3>
                <p class="text-gray-600 mt-1">工作日 9:00-18:00</p>
                <a
                  href="tel:+8613800138000"
                  class="text-blue-600 hover:text-blue-800 font-medium"
                >
                  +86 138-0013-8000
                </a>
              </div>
            </div>

            <!-- 公司地址 -->
            <div class="flex items-start space-x-4">
              <div class="flex-shrink-0">
                <div
                  class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center"
                >
                  <MapPin class="w-6 h-6 text-orange-600" />
                </div>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900">公司地址</h3>
                <p class="text-gray-600 mt-1">
                  中国 北京市 海淀区<br />
                  中关村软件园 2号楼
                </p>
              </div>
            </div>
          </div>

          <!-- 社交媒体 -->
          <div class="mt-12">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">关注我们</h3>
            <div class="flex space-x-4">
              <a
                href="https://github.com/jiayuwee/advanced-tools-navigation"
                target="_blank"
                class="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-white hover:bg-gray-700 transition-colors"
              >
                <Github class="w-5 h-5" />
              </a>
              <a
                href="#"
                class="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-white hover:bg-green-600 transition-colors"
              >
                <MessageCircle class="w-5 h-5" />
              </a>
            </div>
            <p class="text-sm text-gray-600 mt-2">微信公众号：ramusi_tools</p>
          </div>

          <!-- 工作时间 -->
          <div class="mt-8 bg-blue-50 rounded-lg p-6">
            <h3
              class="text-lg font-semibold text-gray-900 mb-4 flex items-center"
            >
              <Clock class="w-5 h-5 mr-2 text-blue-600" />
              工作时间
            </h3>
            <div class="space-y-2 text-sm text-gray-700">
              <div class="flex justify-between">
                <span>周一至周五</span>
                <span>9:00 - 18:00</span>
              </div>
              <div class="flex justify-between">
                <span>周六</span>
                <span>10:00 - 16:00</span>
              </div>
              <div class="flex justify-between">
                <span>周日</span>
                <span>休息</span>
              </div>
            </div>
            <p class="text-xs text-gray-600 mt-3">
              * 紧急问题请发送邮件，我们会尽快回复
            </p>
          </div>
        </div>

        <!-- 快速联系表单 -->
        <div>
          <h2 class="text-2xl font-bold text-gray-900 mb-8">快速联系</h2>

          <div class="bg-white rounded-lg shadow-md p-8">
            <form class="space-y-6" @submit.prevent="submitContact">
              <!-- 姓名 -->
              <div>
                <label
                  for="name"
                  class="block text-sm font-medium text-gray-700 mb-2"
                >
                  姓名 <span class="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  v-model="form.name"
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="请输入您的姓名"
                />
              </div>

              <!-- 邮箱 -->
              <div>
                <label
                  for="email"
                  class="block text-sm font-medium text-gray-700 mb-2"
                >
                  邮箱 <span class="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  v-model="form.email"
                  type="email"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="请输入您的邮箱地址"
                />
              </div>

              <!-- 电话 -->
              <div>
                <label
                  for="phone"
                  class="block text-sm font-medium text-gray-700 mb-2"
                >
                  电话
                </label>
                <input
                  id="phone"
                  v-model="form.phone"
                  type="tel"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="请输入您的电话号码"
                />
              </div>

              <!-- 主题 -->
              <div>
                <label
                  for="subject"
                  class="block text-sm font-medium text-gray-700 mb-2"
                >
                  主题 <span class="text-red-500">*</span>
                </label>
                <select
                  id="subject"
                  v-model="form.subject"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">请选择主题</option>
                  <option value="general">一般咨询</option>
                  <option value="technical">技术支持</option>
                  <option value="business">商务合作</option>
                  <option value="feedback">意见反馈</option>
                  <option value="other">其他</option>
                </select>
              </div>

              <!-- 消息 -->
              <div>
                <label
                  for="message"
                  class="block text-sm font-medium text-gray-700 mb-2"
                >
                  消息 <span class="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  v-model="form.message"
                  rows="5"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="请详细描述您的问题或需求..."
                ></textarea>
              </div>

              <!-- 提交按钮 -->
              <button
                type="submit"
                :disabled="isSubmitting"
                class="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <Loader2
                  v-if="isSubmitting"
                  class="w-4 h-4 mr-2 animate-spin"
                />
                {{ isSubmitting ? "发送中..." : "发送消息" }}
              </button>
            </form>
          </div>

          <!-- 其他联系方式 -->
          <div class="mt-8 bg-gray-100 rounded-lg p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">其他方式</h3>
            <div class="space-y-3">
              <router-link
                to="/feedback"
                class="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
              >
                <Send class="w-4 h-4 mr-2" />
                提交意见反馈
              </router-link>
              <router-link
                to="/faq"
                class="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
              >
                <HelpCircle class="w-4 h-4 mr-2" />
                查看常见问题
              </router-link>
              <router-link
                to="/user-guide"
                class="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
              >
                <BookOpen class="w-4 h-4 mr-2" />
                阅读使用指南
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import {
  Mail,
  Briefcase,
  Phone,
  MapPin,
  Github,
  MessageCircle,
  Clock,
  Send,
  HelpCircle,
  BookOpen,
  Loader2,
} from "lucide-vue-next";

// 表单数据
const form = reactive({
  name: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
});

// 状态
const isSubmitting = ref(false);

// 方法
const submitContact = async () => {
  if (!form.name || !form.email || !form.subject || !form.message) {
    alert("请填写必填字段");
    return;
  }

  isSubmitting.value = true;

  try {
    // 这里应该调用API提交联系表单
    console.log("提交联系表单:", form);

    // 模拟API调用
    await new Promise((resolve) => setTimeout(resolve, 2000));

    alert("消息发送成功！我们会尽快回复您。");

    // 重置表单
    Object.assign(form, {
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    });
  } catch (error) {
    console.error("发送失败:", error);
    alert("发送失败，请稍后重试");
  } finally {
    isSubmitting.value = false;
  }
};

// 设置页面标题
document.title = "联系我们 - 工具导航站";
</script>
