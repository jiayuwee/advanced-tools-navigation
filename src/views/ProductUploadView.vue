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
        <form @submit.prevent="submitProduct" class="space-y-8">
          <!-- 基本信息 -->
          <div>
            <h3 class="text-xl font-semibold text-gray-900 mb-6">基本信息</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- 产品名称 -->
              <div class="md:col-span-2">
                <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
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
                <label for="category" class="block text-sm font-medium text-gray-700 mb-2">
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

              <!-- 产品类型 -->
              <div>
                <label for="type" class="block text-sm font-medium text-gray-700 mb-2">
                  产品类型 <span class="text-red-500">*</span>
                </label>
                <select
                  id="type"
                  v-model="form.type"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">请选择类型</option>
                  <option value="software">软件工具</option>
                  <option value="template">模板素材</option>
                  <option value="course">教程课程</option>
                  <option value="service">服务</option>
                  <option value="other">其他</option>
                </select>
              </div>

              <!-- 价格设置 -->
              <div>
                <label for="price" class="block text-sm font-medium text-gray-700 mb-2">
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
                <label for="url" class="block text-sm font-medium text-gray-700 mb-2">
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

          <!-- 产品描述 -->
          <div>
            <h3 class="text-xl font-semibold text-gray-900 mb-6">产品描述</h3>
            
            <!-- 简短描述 -->
            <div class="mb-6">
              <label for="description" class="block text-sm font-medium text-gray-700 mb-2">
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
              <label for="content" class="block text-sm font-medium text-gray-700 mb-2">
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

          <!-- 产品图片 -->
          <div>
            <h3 class="text-xl font-semibold text-gray-900 mb-6">产品图片</h3>
            
            <!-- 主图上传 -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                产品主图 <span class="text-red-500">*</span>
              </label>
              <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <div v-if="!form.main_image" class="space-y-2">
                  <Upload class="w-12 h-12 text-gray-400 mx-auto" />
                  <p class="text-sm text-gray-600">点击上传产品主图</p>
                  <p class="text-xs text-gray-500">支持 JPG、PNG 格式，建议尺寸 800x600</p>
                </div>
                <div v-else class="space-y-2">
                  <img :src="form.main_image" alt="产品主图" class="w-32 h-24 object-cover mx-auto rounded" />
                  <button
                    type="button"
                    @click="form.main_image = ''"
                    class="text-red-600 hover:text-red-800 text-sm"
                  >
                    删除图片
                  </button>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  class="hidden"
                  ref="mainImageInput"
                  @change="handleMainImageUpload"
                />
                <button
                  type="button"
                  @click="$refs.mainImageInput.click()"
                  class="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  {{ form.main_image ? '更换图片' : '选择图片' }}
                </button>
              </div>
            </div>

            <!-- 附加图片 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                附加图片（可选）
              </label>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div
                  v-for="(image, index) in form.additional_images"
                  :key="index"
                  class="relative border border-gray-300 rounded-lg p-2"
                >
                  <img :src="image" alt="附加图片" class="w-full h-20 object-cover rounded" />
                  <button
                    type="button"
                    @click="removeAdditionalImage(index)"
                    class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                  >
                    <X class="w-3 h-3" />
                  </button>
                </div>
                <div
                  v-if="form.additional_images.length < 4"
                  class="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400"
                  @click="$refs.additionalImageInput.click()"
                >
                  <Plus class="w-6 h-6 text-gray-400 mb-1" />
                  <span class="text-xs text-gray-500">添加图片</span>
                </div>
              </div>
              <input
                type="file"
                accept="image/*"
                multiple
                class="hidden"
                ref="additionalImageInput"
                @change="handleAdditionalImagesUpload"
              />
            </div>
          </div>

          <!-- 标签 -->
          <div>
            <h3 class="text-xl font-semibold text-gray-900 mb-6">产品标签</h3>
            <div class="space-y-4">
              <div>
                <label for="tags" class="block text-sm font-medium text-gray-700 mb-2">
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
                    @click="addTag"
                    class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
                    type="button"
                    @click="removeTag(index)"
                    class="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    <X class="w-3 h-3" />
                  </button>
                </span>
              </div>
            </div>
          </div>

          <!-- 提交按钮 -->
          <div class="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              @click="resetForm"
              class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              重置
            </button>
            <button
              type="submit"
              :disabled="isSubmitting"
              class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              <Loader2 v-if="isSubmitting" class="w-4 h-4 mr-2 animate-spin" />
              {{ isSubmitting ? '提交中...' : '提交审核' }}
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
            <div class="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2 font-semibold">1</div>
            <p class="font-medium">提交产品</p>
            <p class="text-gray-600">填写完整信息</p>
          </div>
          <div class="text-center">
            <div class="w-8 h-8 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-2 font-semibold">2</div>
            <p class="font-medium">初步审核</p>
            <p class="text-gray-600">1个工作日内</p>
          </div>
          <div class="text-center">
            <div class="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-2 font-semibold">3</div>
            <p class="font-medium">详细审核</p>
            <p class="text-gray-600">2-3个工作日</p>
          </div>
          <div class="text-center">
            <div class="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-2 font-semibold">4</div>
            <p class="font-medium">上线发布</p>
            <p class="text-gray-600">审核通过后</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { 
  Info, 
  Upload, 
  X, 
  Plus, 
  Clock, 
  Loader2 
} from 'lucide-vue-next'

// 分类数据
const categories = ref([
  { id: 1, name: '开发工具' },
  { id: 2, name: '设计工具' },
  { id: 3, name: '办公软件' },
  { id: 4, name: '学习资源' },
  { id: 5, name: '其他工具' }
])

// 表单数据
const form = reactive({
  name: '',
  category_id: '',
  type: '',
  price: 0,
  url: '',
  description: '',
  content: '',
  main_image: '',
  additional_images: [] as string[],
  tags: [] as string[]
})

// 状态
const isSubmitting = ref(false)
const newTag = ref('')

// 方法
const handleMainImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]
    const reader = new FileReader()
    reader.onload = (e) => {
      form.main_image = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

const handleAdditionalImagesUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    const files = Array.from(target.files)
    files.forEach(file => {
      if (form.additional_images.length < 4) {
        const reader = new FileReader()
        reader.onload = (e) => {
          form.additional_images.push(e.target?.result as string)
        }
        reader.readAsDataURL(file)
      }
    })
  }
}

const removeAdditionalImage = (index: number) => {
  form.additional_images.splice(index, 1)
}

const addTag = () => {
  if (newTag.value.trim() && !form.tags.includes(newTag.value.trim())) {
    form.tags.push(newTag.value.trim())
    newTag.value = ''
  }
}

const removeTag = (index: number) => {
  form.tags.splice(index, 1)
}

const resetForm = () => {
  Object.assign(form, {
    name: '',
    category_id: '',
    type: '',
    price: 0,
    url: '',
    description: '',
    content: '',
    main_image: '',
    additional_images: [],
    tags: []
  })
  newTag.value = ''
}

const submitProduct = async () => {
  if (!form.name || !form.category_id || !form.type || !form.description || !form.main_image) {
    alert('请填写必填字段')
    return
  }

  isSubmitting.value = true

  try {
    // 这里应该调用API提交产品
    console.log('提交产品:', form)

    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 2000))

    alert('产品提交成功！我们会在1-3个工作日内完成审核。')
    resetForm()
  } catch (error) {
    console.error('提交失败:', error)
    alert('提交失败，请稍后重试')
  } finally {
    isSubmitting.value = false
  }
}

// 生命周期
onMounted(() => {
  document.title = '产品上传 - 工具导航站'
})
</script>
