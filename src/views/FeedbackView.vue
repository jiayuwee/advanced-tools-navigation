<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 页面头部 -->
    <div class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="text-center">
          <h1 class="text-3xl font-bold text-gray-900">意见反馈</h1>
          <p class="mt-4 text-lg text-gray-600">
            您的意见对我们很重要，帮助我们不断改进服务
          </p>
        </div>
      </div>
    </div>

    <!-- 主要内容 -->
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <!-- 反馈表单 -->
      <div class="bg-white rounded-lg shadow-md p-8">
        <form class="space-y-6" @submit.prevent="submitFeedback">
          <!-- 反馈类型 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              反馈类型 <span class="text-red-500">*</span>
            </label>
            <div class="grid grid-cols-2 md:grid-cols-5 gap-3">
              <button
                v-for="type in feedbackTypes"
                :key="type.value"
                type="button"
                :class="[
                  'p-3 border rounded-lg text-center transition-colors',
                  form.category === type.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400',
                ]"
                @click="form.category = type.value"
              >
                <component :is="type.icon" class="w-5 h-5 mx-auto mb-1" />
                <div class="text-xs font-medium">{{ type.label }}</div>
              </button>
            </div>
          </div>

          <!-- 联系信息 -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                for="name"
                class="block text-sm font-medium text-gray-700 mb-2"
              >
                姓名
              </label>
              <input
                id="name"
                v-model="form.name"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="请输入您的姓名"
              />
            </div>
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
          </div>

          <!-- 主题 -->
          <div>
            <label
              for="subject"
              class="block text-sm font-medium text-gray-700 mb-2"
            >
              主题 <span class="text-red-500">*</span>
            </label>
            <input
              id="subject"
              v-model="form.subject"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="请简要描述您的问题或建议"
            />
          </div>

          <!-- 详细描述 -->
          <div>
            <label
              for="message"
              class="block text-sm font-medium text-gray-700 mb-2"
            >
              详细描述 <span class="text-red-500">*</span>
            </label>
            <textarea
              id="message"
              v-model="form.message"
              rows="6"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="请详细描述您遇到的问题、建议或意见..."
            ></textarea>
            <div class="mt-1 text-sm text-gray-500">
              {{ form.message.length }}/1000 字符
            </div>
          </div>

          <!-- 优先级 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              优先级
            </label>
            <div class="flex space-x-4">
              <label
                v-for="priority in priorities"
                :key="priority.value"
                class="flex items-center"
              >
                <input
                  v-model="form.priority"
                  :value="priority.value"
                  type="radio"
                  class="mr-2 text-blue-600 focus:ring-blue-500"
                />
                <span class="text-sm text-gray-700">{{ priority.label }}</span>
              </label>
            </div>
          </div>

          <!-- 附件上传 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              附件（可选）
            </label>
            <div
              class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center"
            >
              <Upload class="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p class="text-sm text-gray-600 mb-2">拖拽文件到此处或点击上传</p>
              <input
                ref="fileInput"
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx,.txt"
                class="hidden"
                @change="handleFileUpload"
              />
              <button
                type="button"
                class="text-blue-600 hover:text-blue-800 text-sm font-medium"
                @click="($refs.fileInput as HTMLInputElement)?.click()"
              >
                选择文件
              </button>
              <p class="text-xs text-gray-500 mt-1">
                支持图片、PDF、Word文档，最大5MB
              </p>
            </div>

            <!-- 已上传文件列表 -->
            <div v-if="uploadedFiles.length > 0" class="mt-3 space-y-2">
              <div
                v-for="(file, index) in uploadedFiles"
                :key="index"
                class="flex items-center justify-between p-2 bg-gray-50 rounded"
              >
                <span class="text-sm text-gray-700">{{ file.name }}</span>
                <button
                  type="button"
                  class="text-red-600 hover:text-red-800"
                  @click="removeFile(index)"
                >
                  <X class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <!-- 提交按钮 -->
          <div class="flex justify-end space-x-4">
            <button
              type="button"
              class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              @click="resetForm"
            >
              重置
            </button>
            <button
              type="submit"
              :disabled="isSubmitting"
              class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              <Loader2 v-if="isSubmitting" class="w-4 h-4 mr-2 animate-spin" />
              {{ isSubmitting ? "提交中..." : "提交反馈" }}
            </button>
          </div>
        </form>
      </div>

      <!-- 反馈指南 -->
      <div class="mt-12 bg-blue-50 rounded-lg p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Info class="w-5 h-5 mr-2 text-blue-600" />
          反馈指南
        </h3>
        <div
          class="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700"
        >
          <div>
            <h4 class="font-medium mb-2">如何写好反馈？</h4>
            <ul class="space-y-1 list-disc list-inside">
              <li>描述具体的问题或建议</li>
              <li>提供详细的操作步骤</li>
              <li>包含错误信息或截图</li>
              <li>说明期望的结果</li>
            </ul>
          </div>
          <div>
            <h4 class="font-medium mb-2">我们的承诺</h4>
            <ul class="space-y-1 list-disc list-inside">
              <li>24小时内回复您的反馈</li>
              <li>认真对待每一条建议</li>
              <li>及时修复报告的问题</li>
              <li>保护您的隐私信息</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import {
  Bug,
  Lightbulb,
  TrendingUp,
  HelpCircle,
  MessageSquare,
  Upload,
  X,
  Loader2,
  Info,
} from "lucide-vue-next";

// 反馈类型
const feedbackTypes = [
  { value: "bug", label: "错误报告", icon: Bug },
  { value: "feature", label: "功能建议", icon: Lightbulb },
  { value: "improvement", label: "改进建议", icon: TrendingUp },
  { value: "question", label: "使用问题", icon: HelpCircle },
  { value: "other", label: "其他", icon: MessageSquare },
];

// 优先级选项
const priorities = [
  { value: 1, label: "低" },
  { value: 2, label: "中" },
  { value: 3, label: "高" },
  { value: 4, label: "紧急" },
];

// 表单数据
const form = reactive({
  category: "other",
  name: "",
  email: "",
  subject: "",
  message: "",
  priority: 2,
});

// 状态
const isSubmitting = ref(false);
const uploadedFiles = ref<File[]>([]);

// 方法
const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files) {
    const files = Array.from(target.files);
    uploadedFiles.value.push(...files);
  }
};

const removeFile = (index: number) => {
  uploadedFiles.value.splice(index, 1);
};

const resetForm = () => {
  Object.assign(form, {
    category: "other",
    name: "",
    email: "",
    subject: "",
    message: "",
    priority: 2,
  });
  uploadedFiles.value = [];
};

const submitFeedback = async () => {
  if (!form.email || !form.subject || !form.message) {
    alert("请填写必填字段");
    return;
  }

  isSubmitting.value = true;

  try {
    // 这里应该调用API提交反馈
    console.log("提交反馈:", {
      ...form,
      attachments: uploadedFiles.value.map((f) => f.name),
    });

    // 模拟API调用
    await new Promise((resolve) => setTimeout(resolve, 2000));

    alert("反馈提交成功！我们会尽快回复您。");
    resetForm();
  } catch (error) {
    console.error("提交失败:", error);
    alert("提交失败，请稍后重试");
  } finally {
    isSubmitting.value = false;
  }
};

// 设置页面标题
document.title = "意见反馈 - 工具导航站";
</script>
