import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { CategoriesService } from "../services/categoriesService";
import type { Category } from "../types";

export const useCategoriesStore = defineStore("categories", () => {
  // 状态
  const loading = ref(false);
  const error = ref<string | null>(null);
  const initialized = ref(false);

  // 数据
  const categories = ref<Category[]>([]);
  const currentCategory = ref<Category | null>(null);

  // 计算属性
  const activeCategories = computed(() =>
    categories.value.filter((category) => category.isActive),
  );

  const categoriesWithStats = computed(() =>
    categories.value.map((category) => ({
      ...category,
      // 这里可以添加统计信息，比如工具数量
    })),
  );

  const categoryTree = computed(() => {
    const rootCategories = categories.value.filter((cat) => !cat.parentId);

    const buildTree = (parentCategories: Category[]): Category[] => {
      return parentCategories.map((parent) => ({
        ...parent,
        children: categories.value.filter((cat) => cat.parentId === parent.id),
      }));
    };

    return buildTree(rootCategories);
  });

  // 方法
  const loadCategories = async () => {
    try {
      loading.value = true;
      error.value = null;
      const result = await CategoriesService.getCategoriesWithStats();
      categories.value = result;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "加载分类失败";
      console.error("Error loading categories:", err);
    } finally {
      loading.value = false;
    }
  };

  const loadCategory = async (id: string) => {
    try {
      loading.value = true;
      error.value = null;
      const category = await CategoriesService.getCategory(id);
      currentCategory.value = category;
      return category;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "加载分类详情失败";
      console.error("Error loading category:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createCategory = async (categoryData: Partial<Category>) => {
    try {
      loading.value = true;
      error.value = null;
      const newCategory = await CategoriesService.createCategory(categoryData);
      categories.value.unshift(newCategory);
      return newCategory;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "创建分类失败";
      console.error("Error creating category:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateCategory = async (
    id: string,
    categoryData: Partial<Category>,
  ) => {
    try {
      loading.value = true;
      error.value = null;
      const updatedCategory = await CategoriesService.updateCategory(
        id,
        categoryData,
      );

      const index = categories.value.findIndex((c) => c.id === id);
      if (index !== -1) {
        categories.value[index] = updatedCategory;
      }

      if (currentCategory.value?.id === id) {
        currentCategory.value = updatedCategory;
      }

      return updatedCategory;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "更新分类失败";
      console.error("Error updating category:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      loading.value = true;
      error.value = null;
      await CategoriesService.deleteCategory(id);
      categories.value = categories.value.filter((c) => c.id !== id);

      if (currentCategory.value?.id === id) {
        currentCategory.value = null;
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : "删除分类失败";
      console.error("Error deleting category:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getCategoryById = (id: string): Category | undefined => {
    return categories.value.find((category) => category.id === id);
  };

  const getCategoriesByParent = (parentId: string | null): Category[] => {
    return categories.value.filter(
      (category) => category.parentId === parentId,
    );
  };

  const clearError = () => {
    error.value = null;
  };

  const clearCurrentCategory = () => {
    currentCategory.value = null;
  };

  // 初始化
  const initialize = async () => {
    if (initialized.value) return;

    try {
      await loadCategories();
      initialized.value = true;
    } catch (err) {
      console.error("Error initializing categories store:", err);
    }
  };

  return {
    // 状态
    loading,
    error,
    initialized,

    // 数据
    categories,
    currentCategory,

    // 计算属性
    activeCategories,
    categoriesWithStats,
    categoryTree,

    // 方法
    initialize,
    loadCategories,
    loadCategory,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoryById,
    getCategoriesByParent,
    clearError,
    clearCurrentCategory,
  };
});
