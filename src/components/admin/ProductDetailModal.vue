<template>
  <div class="fixed inset-0 z-50 overflow-y-auto">
    <div
      class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0"
    >
      <!-- 背景遮罩 -->
      <div
        class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
        @click="$emit('close')"
      ></div>

      <!-- 模态框内容 -->
      <div
        class="inline-block w-full max-w-4xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg"
      >
        <!-- 头部 -->
        <div
          class="flex items-center justify-between pb-4 border-b border-gray-200"
        >
          <h3 class="text-lg font-medium text-gray-900">产品详情</h3>
          <button
            class="text-gray-400 hover:text-gray-600"
            @click="$emit('close')"
          >
            <X class="w-6 h-6" />
          </button>
        </div>

        <!-- 内容 -->
        <div class="mt-6">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- 左侧：产品信息 -->
            <div>
              <!-- 产品图片 -->
              <div class="mb-6">
                <h4 class="text-sm font-medium text-gray-900 mb-3">产品图片</h4>
                <div v-if="product.image_url" class="space-y-3">
                  <img
                    :src="product.image_url"
                    :alt="product.name"
                    class="w-full h-48 object-cover rounded-lg border border-gray-200"
                  />
                </div>
                <div
                  v-else
                  class="w-full h-48 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center"
                >
                  <Package class="w-12 h-12 text-gray-400" />
                </div>
              </div>

              <!-- 基本信息 -->
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700"
                    >产品名称</label
                  >
                  <p class="mt-1 text-sm text-gray-900">{{ product.name }}</p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700"
                    >产品描述</label
                  >
                  <p class="mt-1 text-sm text-gray-900">
                    {{ product.description }}
                  </p>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700"
                      >价格</label
                    >
                    <p class="mt-1 text-sm text-gray-900">
                      {{ product.price === 0 ? "免费" : `¥${product.price}` }}
                    </p>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700"
                      >分类</label
                    >
                    <p class="mt-1 text-sm text-gray-900">
                      {{ getCategoryName(product.category_id) }}
                    </p>
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700"
                    >产品链接</label
                  >
                  <p class="mt-1 text-sm text-gray-900">
                    <a
                      v-if="product.url"
                      :href="product.url"
                      target="_blank"
                      class="text-blue-600 hover:text-blue-800 underline"
                    >
                      {{ product.url }}
                    </a>
                    <span v-else class="text-gray-500">未提供</span>
                  </p>
                </div>
              </div>
            </div>

            <!-- 右侧：状态和操作 -->
            <div>
              <!-- 状态信息 -->
              <div class="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 class="text-sm font-medium text-gray-900 mb-3">状态信息</h4>
                <div class="space-y-3">
                  <div class="flex justify-between">
                    <span class="text-sm text-gray-600">当前状态</span>
                    <span
                      :class="getStatusClass(product.status)"
                      class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                    >
                      {{ getStatusText(product.status) }}
                    </span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-sm text-gray-600">提交时间</span>
                    <span class="text-sm text-gray-900">{{
                      formatDate(product.created_at)
                    }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-sm text-gray-600">更新时间</span>
                    <span class="text-sm text-gray-900">{{
                      formatDate(product.updated_at)
                    }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-sm text-gray-600">提交用户</span>
                    <span class="text-sm text-gray-900">{{
                      product.submitted_by
                    }}</span>
                  </div>
                </div>
              </div>

              <!-- 审核操作 -->
              <div
                v-if="product.status === 'pending'"
                class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6"
              >
                <h4
                  class="text-sm font-medium text-yellow-800 mb-3 flex items-center"
                >
                  <Clock class="w-4 h-4 mr-2" />
                  待审核操作
                </h4>
                <div class="space-y-3">
                  <button
                    class="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    @click="handleApprove"
                  >
                    <CheckCircle class="w-4 h-4 mr-2" />
                    通过审核
                  </button>
                  <button
                    class="w-full flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    @click="handleReject"
                  >
                    <XCircle class="w-4 h-4 mr-2" />
                    拒绝审核
                  </button>
                </div>
              </div>

              <!-- 其他操作 -->
              <div class="space-y-3">
                <button
                  class="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  @click="handleEdit"
                >
                  <Edit class="w-4 h-4 mr-2" />
                  编辑产品
                </button>

                <button
                  v-if="product.status === 'approved'"
                  class="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  @click="handlePublish"
                >
                  <Globe class="w-4 h-4 mr-2" />
                  发布产品
                </button>

                <button
                  v-if="product.status === 'published'"
                  class="w-full flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                  @click="handleUnpublish"
                >
                  <EyeOff class="w-4 h-4 mr-2" />
                  取消发布
                </button>
              </div>

              <!-- 危险操作 -->
              <div class="mt-6 pt-6 border-t border-gray-200">
                <h4 class="text-sm font-medium text-red-800 mb-3">危险操作</h4>
                <button
                  class="w-full flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  @click="handleDelete"
                >
                  <Trash2 class="w-4 h-4 mr-2" />
                  删除产品
                </button>
              </div>
            </div>
          </div>

          <!-- 详细内容 -->
          <div
            v-if="product.content"
            class="mt-8 pt-6 border-t border-gray-200"
          >
            <h4 class="text-sm font-medium text-gray-900 mb-3">详细介绍</h4>
            <div class="prose prose-sm max-w-none">
              <p class="text-sm text-gray-700 whitespace-pre-wrap">
                {{ product.content }}
              </p>
            </div>
          </div>

          <!-- 标签 -->
          <div
            v-if="product.tags && product.tags.length > 0"
            class="mt-6 pt-6 border-t border-gray-200"
          >
            <h4 class="text-sm font-medium text-gray-900 mb-3">产品标签</h4>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="tag in product.tags"
                :key="tag"
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {{ tag }}
              </span>
            </div>
          </div>
        </div>

        <!-- 底部操作 -->
        <div
          class="mt-8 pt-6 border-t border-gray-200 flex justify-end space-x-3"
        >
          <button
            class="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            @click="$emit('close')"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  X,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Edit,
  Globe,
  EyeOff,
  Trash2,
} from "lucide-vue-next";

// Props
interface Product {
  id: string;
  name: string;
  description: string;
  content?: string;
  price: number;
  category_id: string;
  status: "pending" | "approved" | "rejected" | "published";
  image_url?: string;
  url?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
  submitted_by: string;
}

const props = defineProps<{
  product: Product;
}>();

// Emits
const emit = defineEmits<{
  close: [];
  approve: [product: Product];
  reject: [product: Product];
  edit: [product: Product];
  publish: [product: Product];
  unpublish: [product: Product];
  delete: [product: Product];
}>();

// 模拟分类数据
const categories = [
  { id: "1", name: "开发工具" },
  { id: "2", name: "设计工具" },
  { id: "3", name: "办公软件" },
  { id: "4", name: "学习资源" },
  { id: "5", name: "其他工具" },
];

// 方法
const getCategoryName = (categoryId: string) => {
  const category = categories.find((c) => c.id === categoryId);
  return category?.name || "未知分类";
};

const getStatusClass = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "approved":
    case "published":
      return "bg-green-100 text-green-800";
    case "rejected":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case "pending":
      return "待审核";
    case "approved":
      return "已通过";
    case "published":
      return "已发布";
    case "rejected":
      return "已拒绝";
    default:
      return "未知";
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const handleApprove = () => {
  if (confirm(`确定要通过产品"${props.product.name}"的审核吗？`)) {
    emit("approve", props.product);
  }
};

const handleReject = () => {
  const reason = prompt(`请输入拒绝产品"${props.product.name}"的原因：`);
  if (reason) {
    emit("reject", props.product);
  }
};

const handleEdit = () => {
  emit("edit", props.product);
};

const handlePublish = () => {
  if (confirm(`确定要发布产品"${props.product.name}"吗？`)) {
    emit("publish", props.product);
  }
};

const handleUnpublish = () => {
  if (confirm(`确定要取消发布产品"${props.product.name}"吗？`)) {
    emit("unpublish", props.product);
  }
};

const handleDelete = () => {
  if (confirm(`确定要删除产品"${props.product.name}"吗？此操作不可恢复。`)) {
    emit("delete", props.product);
  }
};
</script>
