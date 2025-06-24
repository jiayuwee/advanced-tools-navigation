import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ProductsService } from '../services/productsService'
import type { Product, Category, SearchFilters, SearchResult } from '../types'

export const useProductsStore = defineStore('products', () => {
  // 状态
  const loading = ref(false)
  const error = ref<string | null>(null)
  const initialized = ref(false)

  // 数据
  const products = ref<Product[]>([])
  const categories = ref<Category[]>([])
  const searchResult = ref<SearchResult<Product> | null>(null)
  const featuredProducts = ref<Product[]>([])
  const currentProduct = ref<Product | null>(null)

  // 搜索和筛选状态
  const searchQuery = ref('')
  const selectedCategory = ref('')
  const priceRange = ref<[number, number] | null>(null)
  const sortBy = ref('created_at')
  const sortOrder = ref<'asc' | 'desc'>('desc')

  // 计算属性
  const filteredProducts = computed(() => {
    if (searchResult.value) {
      return searchResult.value.items
    }
    return products.value
  })

  const totalProducts = computed(() => {
    return searchResult.value ? searchResult.value.total : products.value.length
  })

  const productsByCategory = computed(() => {
    const grouped = new Map<string, Product[]>()
    products.value.forEach(product => {
      const categoryId = product.category.id
      if (!grouped.has(categoryId)) {
        grouped.set(categoryId, [])
      }
      grouped.get(categoryId)!.push(product)
    })
    return grouped
  })

  const recentProducts = computed(() =>
    [...products.value]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 6)
  )

  // 方法
  const loadProducts = async (filters?: SearchFilters) => {
    try {
      loading.value = true
      error.value = null

      const result = await ProductsService.getProducts(filters)

      if (filters) {
        searchResult.value = result
      } else {
        products.value = result.items
        searchResult.value = null
      }

      return result
    } catch (err) {
      error.value = err instanceof Error ? err.message : '加载产品失败'
      console.error('Error loading products:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const loadProduct = async (id: string) => {
    try {
      loading.value = true
      error.value = null

      const product = await ProductsService.getProduct(id)
      currentProduct.value = product

      return product
    } catch (err) {
      error.value = err instanceof Error ? err.message : '加载产品详情失败'
      console.error('Error loading product:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const loadFeaturedProducts = async (limit = 6) => {
    try {
      const featured = await ProductsService.getFeaturedProducts(limit)
      featuredProducts.value = featured
      return featured
    } catch (err) {
      console.error('Error loading featured products:', err)
      return []
    }
  }

  const loadRelatedProducts = async (productId: string, categoryId: string, limit = 4) => {
    try {
      return await ProductsService.getRelatedProducts(productId, categoryId, limit)
    } catch (err) {
      console.error('Error loading related products:', err)
      return []
    }
  }

  const searchProducts = async (query: string, filters?: Partial<SearchFilters>) => {
    if (!query.trim()) {
      searchResult.value = null
      return
    }

    try {
      loading.value = true
      error.value = null

      const searchFilters: SearchFilters = {
        query: query.trim(),
        category: selectedCategory.value || undefined,
        priceRange: priceRange.value || undefined,
        sortBy: sortBy.value,
        sortOrder: sortOrder.value,
        limit: 20,
        ...filters
      }

      await loadProducts(searchFilters)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '搜索产品失败'
      console.error('Error searching products:', err)
    } finally {
      loading.value = false
    }
  }

  const createProduct = async (productData: Partial<Product>) => {
    try {
      loading.value = true
      error.value = null

      const newProduct = await ProductsService.createProduct(productData as any)
      products.value.unshift(newProduct)

      return newProduct
    } catch (err) {
      error.value = err instanceof Error ? err.message : '创建产品失败'
      console.error('Error creating product:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateProduct = async (id: string, productData: Partial<Product>) => {
    try {
      loading.value = true
      error.value = null

      const updatedProduct = await ProductsService.updateProduct(id, productData as any)
      
      const index = products.value.findIndex(p => p.id === id)
      if (index !== -1) {
        products.value[index] = updatedProduct
      }

      if (currentProduct.value?.id === id) {
        currentProduct.value = updatedProduct
      }

      return updatedProduct
    } catch (err) {
      error.value = err instanceof Error ? err.message : '更新产品失败'
      console.error('Error updating product:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteProduct = async (id: string) => {
    try {
      loading.value = true
      error.value = null

      await ProductsService.deleteProduct(id)
      products.value = products.value.filter(p => p.id !== id)

      if (currentProduct.value?.id === id) {
        currentProduct.value = null
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '删除产品失败'
      console.error('Error deleting product:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const uploadProductImage = async (file: File, productId: string) => {
    try {
      loading.value = true
      error.value = null

      const imageUrl = await ProductsService.uploadProductImage(file, productId)
      return imageUrl
    } catch (err) {
      error.value = err instanceof Error ? err.message : '上传图片失败'
      console.error('Error uploading product image:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // 筛选和排序方法
  const setSearchQuery = (query: string) => {
    searchQuery.value = query
    if (query.trim()) {
      searchProducts(query)
    } else {
      searchResult.value = null
    }
  }

  const setSelectedCategory = (categoryId: string) => {
    selectedCategory.value = categoryId
    if (searchQuery.value.trim()) {
      searchProducts(searchQuery.value)
    }
  }

  const setPriceRange = (range: [number, number] | null) => {
    priceRange.value = range
    if (searchQuery.value.trim()) {
      searchProducts(searchQuery.value)
    }
  }

  const setSortBy = (sort: string) => {
    sortBy.value = sort
    if (searchQuery.value.trim()) {
      searchProducts(searchQuery.value)
    }
  }

  const setSortOrder = (order: 'asc' | 'desc') => {
    sortOrder.value = order
    if (searchQuery.value.trim()) {
      searchProducts(searchQuery.value)
    }
  }

  const clearFilters = () => {
    searchQuery.value = ''
    selectedCategory.value = ''
    priceRange.value = null
    sortBy.value = 'created_at'
    sortOrder.value = 'desc'
    searchResult.value = null
  }

  const clearError = () => {
    error.value = null
  }

  // 初始化
  const initialize = async () => {
    if (initialized.value) return

    try {
      await Promise.all([
        loadProducts(),
        loadFeaturedProducts()
      ])
      initialized.value = true
    } catch (err) {
      console.error('Error initializing products store:', err)
    }
  }

  return {
    // 状态
    loading,
    error,
    initialized,

    // 数据
    products,
    categories,
    searchResult,
    featuredProducts,
    currentProduct,

    // 搜索和筛选状态
    searchQuery,
    selectedCategory,
    priceRange,
    sortBy,
    sortOrder,

    // 计算属性
    filteredProducts,
    totalProducts,
    productsByCategory,
    recentProducts,

    // 方法
    initialize,
    loadProducts,
    loadProduct,
    loadFeaturedProducts,
    loadRelatedProducts,
    searchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    uploadProductImage,

    // 筛选和排序方法
    setSearchQuery,
    setSelectedCategory,
    setPriceRange,
    setSortBy,
    setSortOrder,
    clearFilters,
    clearError
  }
})
