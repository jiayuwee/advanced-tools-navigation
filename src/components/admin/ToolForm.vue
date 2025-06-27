<template>
  <div class="tool-form">
    <form class="form" @submit.prevent="handleSubmit">
      <div class="form-header">
        <h2>{{ isEditing ? "编辑工具" : "添加工具" }}</h2>
      </div>

      <div class="form-body">
        <!-- 基本信息 -->
        <div class="form-section">
          <h3>基本信息</h3>

          <div class="form-group">
            <label for="name" class="required">工具名称</label>
            <input
              id="name"
              v-model="form.name"
              type="text"
              placeholder="请输入工具名称"
              :class="{ error: errors.name }"
              required
            />
            <span v-if="errors.name" class="error-message">{{
              errors.name
            }}</span>
          </div>

          <div class="form-group">
            <label for="description" class="required">工具描述</label>
            <textarea
              id="description"
              v-model="form.description"
              placeholder="请输入工具描述"
              rows="3"
              :class="{ error: errors.description }"
              required
            ></textarea>
            <span v-if="errors.description" class="error-message">{{
              errors.description
            }}</span>
          </div>

          <div class="form-group">
            <label for="url" class="required">工具链接</label>
            <input
              id="url"
              v-model="form.url"
              type="url"
              placeholder="https://example.com"
              :class="{ error: errors.url }"
              required
            />
            <span v-if="errors.url" class="error-message">{{
              errors.url
            }}</span>
          </div>

          <div class="form-group">
            <label for="category" class="required">分类</label>
            <select
              id="category"
              v-model="form.categoryId"
              :class="{ error: errors.categoryId }"
              required
            >
              <option value="">请选择分类</option>
              <option
                v-for="category in categories"
                :key="category.id"
                :value="category.id"
              >
                {{ category.icon }} {{ category.name }}
              </option>
            </select>
            <span v-if="errors.categoryId" class="error-message">{{
              errors.categoryId
            }}</span>
          </div>
        </div>

        <!-- 可选信息 -->
        <div class="form-section">
          <h3>可选信息</h3>

          <div class="form-group">
            <label for="icon">图标</label>
            <input
              id="icon"
              v-model="form.icon"
              type="text"
              placeholder="🔧 或图标URL"
            />
          </div>

          <div class="form-group">
            <label class="checkbox-label">
              <input v-model="form.isFeatured" type="checkbox" />
              <span class="checkmark"></span>
              推荐工具
            </label>
          </div>
        </div>

        <!-- SEO 信息 -->
        <div class="form-section">
          <h3>SEO 信息</h3>

          <div class="form-group">
            <label for="metaTitle">SEO 标题</label>
            <input
              id="metaTitle"
              v-model="form.metaTitle"
              type="text"
              placeholder="SEO 标题（可选）"
            />
          </div>

          <div class="form-group">
            <label for="metaDescription">SEO 描述</label>
            <textarea
              id="metaDescription"
              v-model="form.metaDescription"
              placeholder="SEO 描述（可选）"
              rows="2"
            ></textarea>
          </div>
        </div>
      </div>

      <div class="form-footer">
        <button
          type="button"
          class="btn btn-secondary"
          @click="$emit('cancel')"
        >
          取消
        </button>
        <button type="submit" :disabled="loading" class="btn btn-primary">
          <span v-if="loading" class="loading-spinner"></span>
          {{ isEditing ? "更新" : "创建" }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from "vue";
import { useToolsStore } from "../../stores/tools";
import { useCategoriesStore } from "../../stores/categories";
import type { Tool, ToolForm } from "../../types";
import {
  validateRequiredFields,
  requireCategoryId,
} from "../../utils/dataTransform";

// Props
interface Props {
  tool?: Tool;
  isEditing?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isEditing: false,
});

// Emits
const emit = defineEmits<{
  submit: [data: ToolForm];
  cancel: [];
}>();

// Stores
const toolsStore = useToolsStore();
const categoriesStore = useCategoriesStore();

// State
const loading = ref(false);
const form = reactive<ToolForm>({
  name: "",
  description: "",
  url: "",
  categoryId: "",
  tags: [],
  icon: "",
  isFeatured: false,
  metaTitle: "",
  metaDescription: "",
});

const errors = reactive<Record<string, string>>({});

// Computed
const categories = computed(() => categoriesStore.categories);

// Methods
const validateForm = (): boolean => {
  // 清空之前的错误
  Object.keys(errors).forEach((key) => {
    delete errors[key];
  });

  try {
    // 验证必需字段
    validateRequiredFields(form, ["name", "description", "url"], "Tool");

    // 验证分类
    requireCategoryId(form);

    // 验证 URL 格式
    if (form.url && !isValidUrl(form.url)) {
      errors.url = "请输入有效的URL地址";
      return false;
    }

    return true;
  } catch (error) {
    // 处理验证错误
    const message = error instanceof Error ? error.message : "验证失败";

    if (message.includes("name")) {
      errors.name = "工具名称不能为空";
    }
    if (message.includes("description")) {
      errors.description = "工具描述不能为空";
    }
    if (message.includes("url")) {
      errors.url = "工具链接不能为空";
    }
    if (message.includes("Category")) {
      errors.categoryId = "请选择分类";
    }

    return false;
  }
};

const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const handleSubmit = async () => {
  if (!validateForm()) {
    return;
  }

  try {
    loading.value = true;

    // 发送表单数据
    emit("submit", { ...form });
  } catch (error) {
    console.error("提交表单失败:", error);
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  Object.assign(form, {
    name: "",
    description: "",
    url: "",
    categoryId: "",
    tags: [],
    icon: "",
    isFeatured: false,
    metaTitle: "",
    metaDescription: "",
  });

  Object.keys(errors).forEach((key) => {
    delete errors[key];
  });
};

const loadFormData = () => {
  if (props.tool) {
    Object.assign(form, {
      name: props.tool.name,
      description: props.tool.description,
      url: props.tool.url,
      categoryId: props.tool.category.id,
      tags: props.tool.tags.map((tag) => tag.name),
      icon: props.tool.icon || "",
      isFeatured: props.tool.isFeatured,
      metaTitle: props.tool.metaTitle || "",
      metaDescription: props.tool.metaDescription || "",
    });
  }
};

// Lifecycle
onMounted(async () => {
  // 加载分类数据
  if (categories.value.length === 0) {
    await categoriesStore.loadCategories();
  }

  // 加载表单数据
  loadFormData();
});

// Watch for tool changes
watch(
  () => props.tool,
  () => {
    loadFormData();
  },
  { deep: true }
);
</script>

<style scoped>
.tool-form {
  max-width: 600px;
  margin: 0 auto;
}

.form {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.form-header {
  padding: 1.5rem;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.form-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #323130;
}

.form-body {
  padding: 1.5rem;
}

.form-section {
  margin-bottom: 2rem;
}

.form-section:last-child {
  margin-bottom: 0;
}

.form-section h3 {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: #323130;
  border-bottom: 1px solid #e9ecef;
  padding-bottom: 0.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #323130;
}

.form-group label.required::after {
  content: " *";
  color: #d13438;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #0078d4;
  box-shadow: 0 0 0 3px rgba(0, 120, 212, 0.1);
}

.form-group input.error,
.form-group textarea.error,
.form-group select.error {
  border-color: #d13438;
}

.error-message {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: #d13438;
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-weight: normal !important;
}

.checkbox-label input[type="checkbox"] {
  width: auto;
  margin-right: 0.5rem;
}

.form-footer {
  padding: 1.5rem;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #5a6268;
}

.btn-primary {
  background: #0078d4;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #106ebe;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .tool-form {
    margin: 0;
  }

  .form {
    border-radius: 0;
  }

  .form-header,
  .form-body,
  .form-footer {
    padding: 1rem;
  }

  .form-footer {
    flex-direction: column;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
