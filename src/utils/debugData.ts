// Debug 工具数据初始化脚本
import { useToolsStore } from '@/stores/tools'
import { useCategoriesStore } from '@/stores/categories'

export async function debugDataInitialization() {
  console.log('🔄 开始调试数据初始化...')
  
  const toolsStore = useToolsStore()
  const categoriesStore = useCategoriesStore()
  
  try {
    // 强制重新初始化
    toolsStore.initialized = false
    categoriesStore.initialized = false
    
    console.log('📋 初始化分类数据...')
    await categoriesStore.initialize()
    console.log(`✅ 分类数据加载完成: ${categoriesStore.categories.length} 个分类`)
    
    console.log('🔧 初始化工具数据...')
    await toolsStore.initialize()
    console.log(`✅ 工具数据加载完成: ${toolsStore.tools.length} 个工具`)
    
    console.log('🎯 数据初始化结果:')
    console.log('分类列表:', categoriesStore.categories.map(c => ({ id: c.id, name: c.name })))
    console.log('工具列表:', toolsStore.tools.map(t => ({ id: t.id, name: t.name, category_id: t.category_id })))
    
    return {
      success: true,
      categories: categoriesStore.categories.length,
      tools: toolsStore.tools.length
    }
  } catch (error) {
    console.error('❌ 数据初始化失败:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }
  }
}

// 在浏览器控制台中可以手动调用
if (typeof window !== 'undefined') {
  (window as any).debugDataInitialization = debugDataInitialization
}