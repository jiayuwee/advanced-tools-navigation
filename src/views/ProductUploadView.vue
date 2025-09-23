<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 页面头部 -->
    <div class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="text-center">
          <h1 class="text-3xl font-bold text-gray-900">产品上传</h1>
          <p class="mt-4 text-lg text-gray-600">
            分享您的优质产品，让更多用户发现和使用
          </p>
        </div>
      </div>
    </div>

    <!-- 主要内容 -->
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <!-- 上传须知 -->
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
        <h2 class="text-lg font-semibold text-blue-900 mb-3 flex items-center">
          <Info class="w-5 h-5 mr-2" />
          上传须知
        </h2>
        <ul class="text-sm text-blue-800 space-y-2">
          <li>• 产品必须是原创或拥有合法授权</li>
          <li>• 提供详细的产品描述和使用说明</li>
          <li>• 上传高质量的产品截图或演示视频</li>
          <li>• 设置合理的价格，支持免费产品</li>
          <li>• 审核通过后产品将在1-3个工作日内上线</li>
        </ul>
      </div>

      <!-- 上传表单 -->
      <div class="bg-white rounded-lg shadow-md p-8">
        <form class="space-y-8" @submit.prevent="submitProduct">
          <!-- 基本信息 -->
          <div class="form-section">
            <button
              type="button"
              class="section-header"
              @click="toggleSection('basic')"
            >
              <h3 class="text-xl font-semibold text-gray-900">基本信息</h3>
              <ChevronDown
                :class="[
                  'w-5 h-5 text-gray-500 transition-transform',
                  expandedSections.basic ? 'transform rotate-180' : '',
                ]"
              />
            </button>
            <div v-if="expandedSections.basic" class="section-content">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- 产品名称 -->
                <div class="md:col-span-2">
                  <label
                    for="name"
                    class="block text-sm font-medium text-gray-700 mb-2"
                  >
                    产品名称 <span class="text-red-500">*</span>
                  </label>
                  <input
                    id="name"
                    v-model="form.name"
                    type="text"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="请输入产品名称"
                  />
                </div>

                <!-- 产品分类 -->
                <div>
                  <label
                    for="category"
                    class="block text-sm font-medium text-gray-700 mb-2"
                  >
                    产品分类 <span class="text-red-500">*</span>
                  </label>
                  <select
                    id="category"
                    v-model="form.category_id"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">请选择分类</option>
                    <option
                      v-for="category in categories"
                      :key="category.id"
                      :value="category.id"
                    >
                      {{ category.name }}
                    </option>
                  </select>
                </div>

                <!-- 是否数字产品 -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    产品类型
                  </label>
                  <div class="flex items-center space-x-4">
                    <label class="flex items-center">
                      <input
                        v-model="form.is_digital"
                        type="checkbox"
                        class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span class="ml-2 text-sm text-gray-700">数字产品</span>
                    </label>
                    <label class="flex items-center">
                      <input
                        v-model="form.is_featured"
                        type="checkbox"
                        class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span class="ml-2 text-sm text-gray-700">推荐产品</span>
                    </label>
                  </div>
                </div>

                <!-- 价格设置 -->
                <div>
                  <label
                    for="price"
                    class="block text-sm font-medium text-gray-700 mb-2"
                  >
                    价格（元） <span class="text-red-500">*</span>
                  </label>
                  <input
                    id="price"
                    v-model.number="form.price"
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00（免费请输入0）"
                  />
                </div>

                <!-- 产品链接 -->
                <div>
                  <label
                    for="url"
                    class="block text-sm font-medium text-gray-700 mb-2"
                  >
                    产品链接
                  </label>
                  <input
                    id="url"
                    v-model="form.url"
                    type="url"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://example.com"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- 产品描述 -->
          <div class="form-section">
            <button
              type="button"
              class="section-header"
              @click="toggleSection('description')"
            >
              <h3 class="text-xl font-semibold text-gray-900">产品描述</h3>
              <ChevronDown
                :class="[
                  'w-5 h-5 text-gray-500 transition-transform',
                  expandedSections.description ? 'transform rotate-180' : '',
                ]"
              />
            </button>
            <div v-if="expandedSections.description" class="section-content">
              <!-- 简短描述 -->
              <div class="mb-6">
                <label
                  for="description"
                  class="block text-sm font-medium text-gray-700 mb-2"
                >
                  简短描述 <span class="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  v-model="form.description"
                  rows="3"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="请简要描述您的产品特点和用途..."
                ></textarea>
                <div class="mt-1 text-sm text-gray-500">
                  {{ form.description.length }}/200 字符
                </div>
              </div>

              <!-- 详细介绍 -->
              <div>
                <label
                  for="content"
                  class="block text-sm font-medium text-gray-700 mb-2"
                >
                  详细介绍
                </label>
                <textarea
                  id="content"
                  v-model="form.content"
                  rows="8"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="请详细介绍产品功能、使用方法、适用场景等..."
                ></textarea>
                <div class="mt-1 text-sm text-gray-500">
                  {{ form.content.length }}/2000 字符
                </div>
              </div>
            </div>
          </div>

          <!-- 产品图片 -->
          <div class="form-section">
            <button
              type="button"
              class="section-header"
              @click="toggleSection('images')"
            >
              <h3 class="text-xl font-semibold text-gray-900">产品图片</h3>
              <ChevronDown
                :class="[
                  'w-5 h-5 text-gray-500 transition-transform',
                  expandedSections.images ? 'transform rotate-180' : '',
                ]"
              />
            </button>
            <div v-if="expandedSections.images" class="section-content">
              <!-- 主图上传 -->
              <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  产品主图 <span class="text-red-500">*</span>
                </label>
                <div
                  class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center"
                >
                  <div v-if="!form.main_image" class="space-y-2">
                    <Upload class="w-12 h-12 text-gray-400 mx-auto" />
                    <p class="text-sm text-gray-600">点击上传产品主图</p>
                    <p class="text-xs text-gray-500">
                      支持 JPG、PNG 格式，建议尺寸 800x600
                    </p>
                  </div>
                  <div v-else class="space-y-2">
                    <img
                      :src="form.main_image"
                      alt="产品主图"
                      class="w-32 h-24 object-cover mx-auto rounded"
                    />
                  </div>
                  <input
                    ref="mainImageInput"
                    type="file"
                    accept="image/*"
                    class="hidden"
                    @change="handleMainImageUpload"
                  />
                  <button
                    class="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                    type="button"
                    @click="handleMainImageClick"
                  >
                    {{ form.main_image ? "更换图片" : "选择图片" }}
                  </button>
                </div>
              </div>

              <!-- 附加图片 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  附加图片（可选）
                </label>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <template
                    v-for="(image, index) in form.additional_images"
                    :key="index"
                  >
                    <div class="relative">
                      <img
                        :src="image"
                        alt="附加图片"
                        class="w-full h-20 object-cover rounded"
                      />
                      <button
                        class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                        type="button"
                        @click="removeAdditionalImage(index)"
                      >
                        <X class="w-3 h-3" />
                      </button>
                    </div>
                  </template>
                  <div
                    v-if="form.additional_images.length < 4"
                    class="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400"
                    @click="handleAdditionalImagesClick"
                  >
                    <Plus class="w-6 h-6 text-gray-400 mb-1" />
                    <span class="text-xs text-gray-500">添加图片</span>
                  </div>
                </div>
                <input
                  ref="additionalImageInput"
                  type="file"
                  accept="image/*"
                  multiple
                  class="hidden"
                  @change="handleAdditionalImagesUpload"
                />
              </div>
            </div>
          </div>

          <!-- 标签 -->
          <div class="form-section">
            <button
              type="button"
              class="section-header"
              @click="toggleSection('tags')"
            >
              <h3 class="text-xl font-semibold text-gray-900">产品标签</h3>
              <ChevronDown
                :class="[
                  'w-5 h-5 text-gray-500 transition-transform',
                  expandedSections.tags ? 'transform rotate-180' : '',
                ]"
              />
            </button>
            <div v-if="expandedSections.tags" class="section-content">
              <div class="space-y-4">
                <div>
                  <label
                    for="tags"
                    class="block text-sm font-medium text-gray-700 mb-2"
                  >
                    添加标签
                  </label>
                  <div class="flex space-x-2">
                    <input
                      v-model="newTag"
                      type="text"
                      class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="输入标签名称"
                      @keyup.enter="addTag"
                    />
                    <button
                      type="button"
                      class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      @click="addTag"
                    >
                      添加
                    </button>
                  </div>
                </div>

                <!-- 标签列表 -->
                <div v-if="form.tags.length > 0" class="flex flex-wrap gap-2">
                  <span
                    v-for="(tag, index) in form.tags"
                    :key="index"
                    class="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {{ tag }}
                    <button
                      class="ml-2 text-blue-600 hover:text-blue-800"
                      type="button"
                      @click="removeTag(index)"
                    >
                      <X class="w-3 h-3" />
                    </button>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- 提交按钮 -->
          <div class="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              type="button"
              @click="resetForm"
            >
              重置
            </button>
            <button
              class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
              type="submit"
              :disabled="isSubmitting"
            >
              <Loader2 v-if="isSubmitting" class="w-4 h-4 mr-2 animate-spin" />
              {{ isSubmitting ? "提交中..." : "提交审核" }}
            </button>
          </div>
        </form>
      </div>

      <!-- 审核流程说明 -->
      <div class="mt-12 bg-gray-100 rounded-lg p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Clock class="w-5 h-5 mr-2 text-gray-600" />
          审核流程
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div class="text-center">
            <div
              class="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2 font-semibold"
            >
              1
            </div>
            <p class="font-medium">提交产品</p>
            <p class="text-gray-600">填写完整信息</p>
          </div>
          <div class="text-center">
            <div
              class="w-8 h-8 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-2 font-semibold"
            >
              2
            </div>
            <p class="font-medium">初步审核</p>
            <p class="text-gray-600">1个工作日内</p>
          </div>
          <div class="text-center">
            <div
              class="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-2 font-semibold"
            >
              3
            </div>
            <p class="font-medium">详细审核</p>
            <p class="text-gray-600">2-3个工作日</p>
          </div>
          <div class="text-center">
            <div
              class="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-2 font-semibold"
            >
              4
            </div>
            <p class="font-medium">上线发布</p>
            <p class="text-gray-600">审核通过后</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import type { Ref } from "vue";
import { useRouter } from "vue-router";
import { useProductsStore } from "@/stores/products";
import { supabase } from "@/lib/supabase";
import {
  Info,
  Upload,
  X,
  Plus,
  Clock,
  Loader2,
  ChevronDown,
} from "lucide-vue-next";

const router = useRouter();
const productsStore = useProductsStore();

// 分类数据
const categories = ref<any[]>([]);

// 加载分类数据
const loadCategories = async () => {
  try {
    const { data, error } = await supabase
      .from("product_categories")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error) throw error;
    categories.value = data || [];
  } catch (error) {
    console.error("加载分类失败:", error);
  }
};

// 组件挂载时加载分类
onMounted(() => {
  loadCategories();
});

// 表单数据
const mainImageInput = ref<HTMLInputElement>();
const additionalImageInput = ref<HTMLInputElement>();

// 为了向后兼容，保留旧字段名用于模板显示
const form = reactive({
  name: "",
  category_id: "",
  price: 0,
  currency: "CNY",
  url: "",
  description: "",
  short_description: "",
  features: [] as string[],
  images: [] as string[],
  demo_url: "",
  download_url: "",
  is_featured: false,
  is_digital: false,
  stock_quantity: 0,
  meta_title: "",
  meta_description: "",
  tags: [] as string[],
  // 向后兼容字段
  type: "",
  content: "",
  main_image: "",
  additional_images: [] as string[],
});

// 状态
const isSubmitting = ref(false);
const newTag = ref("");

// 折叠状态
const expandedSections = reactive({
  basic: true,
  description: true,
  images: true,
  tags: true,
});

// 切换折叠状态
const toggleSection = (section: keyof typeof expandedSections) => {
  expandedSections[section] = !expandedSections[section];
};

// 方法
const handleMainImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const file = target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      form.main_image = imageUrl;
      // 将主图添加到images数组的开头
      form.images = [imageUrl, ...form.additional_images];
    };
    reader.readAsDataURL(file);
  }
};

const handleAdditionalImagesUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files) {
    const files = Array.from(target.files);
    files.forEach((file) => {
      if (form.additional_images.length < 4) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageUrl = e.target?.result as string;
          form.additional_images.push(imageUrl);
          // 重新构建images数组
          form.images = [form.main_image, ...form.additional_images].filter(
            Boolean,
          );
        };
        reader.readAsDataURL(file);
      }
    });
  }
};

const removeAdditionalImage = (index: number) => {
  form.additional_images.splice(index, 1);
};

const addTag = () => {
  if (newTag.value.trim() && !form.tags.includes(newTag.value.trim())) {
    form.tags.push(newTag.value.trim());
    newTag.value = "";
  }
};

const removeTag = (index: number) => {
  form.tags.splice(index, 1);
};

const resetForm = () => {
  Object.assign(form, {
    name: "",
    category_id: "",
    type: "",
    price: 0,
    url: "",
    description: "",
    content: "",
    main_image: "",
    additional_images: [],
    tags: [],
  });
  newTag.value = "";
};

// 点击处理函数
const handleMainImageClick = () => {
  mainImageInput.value?.click();
};

const handleAdditionalImagesClick = () => {
  additionalImageInput.value?.click();
};

const submitProduct = async () => {
  if (
    !form.name ||
    !form.category_id ||
    !form.description ||
    !form.main_image
  ) {
    alert("请填写必填字段");
    return;
  }

  isSubmitting.value = true;

  try {
    // 准备产品数据，匹配数据库schema
    const productData = {
      name: form.name,
      category_id: form.category_id,
      price: form.price,
      currency: form.currency,
      url: form.url || undefined,
      description: form.description,
      short_description: form.short_description || undefined,
      features: form.features,
      images: form.images,
      demo_url: form.demo_url || undefined,
      download_url: form.download_url || undefined,
      is_featured: form.is_featured,
      is_digital: form.is_digital,
      stock_quantity: form.stock_quantity || undefined,
      meta_title: form.meta_title || undefined,
      meta_description: form.meta_description || undefined,
    };

    // 调用store创建产品
    await productsStore.createProduct(productData);

    // 提交成功后重置表单并跳转
    resetForm();
    router.push({ name: "Products" });
    alert("产品提交成功！我们会在1-3个工作日内完成审核。");
  } catch (error) {
    console.error("产品提交失败:", error);
    alert("产品提交失败，请稍后重试");
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
/* 表单折叠样式 */
.form-section {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 1.5rem;
}

.section-header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  background: #f9fafb;
  border: none;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.section-header:hover {
  background: #f3f4f6;
}

.section-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
}

.section-content {
  padding: 1.5rem;
  background: white;
  border-top: 1px solid #e5e7eb;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    max-height: 0;
    padding-top: 0;
    padding-bottom: 0;
  }
  to {
    opacity: 1;
    max-height: 1000px;
    padding-top: 1.5rem;
    padding-bottom: 1.5rem;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .section-header {
    padding: 1rem;
  }

  .section-content {
    padding: 1rem;
  }

  .section-header h3 {
    font-size: 1.125rem;
  }
}
</style>
