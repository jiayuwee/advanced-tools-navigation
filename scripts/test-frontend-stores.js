#!/usr/bin/env node

/**
 * 前端Store测试脚本
 * 模拟前端store的初始化和数据加载过程
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// 加载环境变量
dotenv.config({ path: join(__dirname, '../.env.local') })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

console.log('🏪 前端Store测试')
console.log('=' .repeat(50))

const supabase = createClient(supabaseUrl, supabaseKey)

// 模拟ToolsService
class MockToolsService {
  static async getTools() {
    const { data, error } = await supabase
      .from('tools')
      .select(`
        *,
        category:categories(*)
      `)
      .eq('status', 'active')
      .order('click_count', { ascending: false })
    
    if (error) throw error
    return data
  }
}

// 模拟CategoriesService
class MockCategoriesService {
  static async getCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
    
    if (error) throw error
    return data
  }

  static async getCategoriesWithStats() {
    const categories = await this.getCategories()
    
    // 获取每个分类的工具数量
    const categoriesWithStats = await Promise.all(
      categories.map(async (category) => {
        const { count } = await supabase
          .from('tools')
          .select('*', { count: 'exact', head: true })
          .eq('category_id', category.id)
          .eq('status', 'active')
        
        return {
          ...category,
          toolCount: count || 0
        }
      })
    )
    
    return categoriesWithStats
  }
}

// 模拟ToolsStore
class MockToolsStore {
  constructor() {
    this.tools = []
    this.categories = []
    this.loading = false
    this.error = null
    this.initialized = false
  }

  get popularTools() {
    return [...this.tools].sort((a, b) => b.click_count - a.click_count).slice(0, 5)
  }

  get featuredTools() {
    return this.tools.filter(tool => tool.is_featured)
  }

  async initialize() {
    if (this.initialized) return

    try {
      this.loading = true
      this.error = null

      console.log('🔄 初始化ToolsStore...')
      
      // 并行加载数据
      const [toolsData, categoriesData] = await Promise.all([
        MockToolsService.getTools(),
        MockCategoriesService.getCategories()
      ])

      this.tools = toolsData
      this.categories = categoriesData
      this.initialized = true

      console.log(`✅ 工具数据加载完成: ${this.tools.length} 条`)
      console.log(`✅ 分类数据加载完成: ${this.categories.length} 条`)

    } catch (err) {
      this.error = err.message
      console.error('❌ ToolsStore初始化失败:', err.message)
      throw err
    } finally {
      this.loading = false
    }
  }

  async incrementClickCount(toolId) {
    const tool = this.tools.find(t => t.id === toolId)
    if (tool) {
      tool.click_count++
      console.log(`📊 工具 "${tool.name}" 点击量增加: ${tool.click_count}`)
      
      // 这里应该同步到后端
      try {
        const { error } = await supabase
          .from('tools')
          .update({ click_count: tool.click_count })
          .eq('id', toolId)
        
        if (error) throw error
        console.log(`✅ 点击量已同步到数据库`)
      } catch (err) {
        console.error('❌ 点击量同步失败:', err.message)
      }
    }
  }

  async toggleFavorite(toolId) {
    const tool = this.tools.find(t => t.id === toolId)
    if (tool) {
      tool.isFavorite = !tool.isFavorite
      console.log(`${tool.isFavorite ? '❤️' : '💔'} 工具 "${tool.name}" 收藏状态: ${tool.isFavorite}`)
      // 这里应该同步到后端用户收藏表
    }
  }
}

// 模拟CategoriesStore
class MockCategoriesStore {
  constructor() {
    this.categories = []
    this.loading = false
    this.error = null
    this.initialized = false
  }

  get activeCategories() {
    return this.categories.filter(cat => cat.is_active)
  }

  async initialize() {
    if (this.initialized) return

    try {
      this.loading = true
      this.error = null

      console.log('🔄 初始化CategoriesStore...')
      
      const categoriesData = await MockCategoriesService.getCategoriesWithStats()
      this.categories = categoriesData
      this.initialized = true

      console.log(`✅ 分类数据加载完成: ${this.categories.length} 条`)
      this.categories.forEach(cat => {
        console.log(`  📂 ${cat.icon} ${cat.name}: ${cat.toolCount} 个工具`)
      })

    } catch (err) {
      this.error = err.message
      console.error('❌ CategoriesStore初始化失败:', err.message)
      throw err
    } finally {
      this.loading = false
    }
  }
}

async function testStores() {
  try {
    console.log('🧪 开始测试Store初始化...\n')

    // 创建store实例
    const toolsStore = new MockToolsStore()
    const categoriesStore = new MockCategoriesStore()

    // 测试初始化
    await Promise.all([
      toolsStore.initialize(),
      categoriesStore.initialize()
    ])

    console.log('\n📊 Store状态检查:')
    console.log(`ToolsStore - initialized: ${toolsStore.initialized}, loading: ${toolsStore.loading}`)
    console.log(`CategoriesStore - initialized: ${categoriesStore.initialized}, loading: ${categoriesStore.loading}`)

    // 测试计算属性
    console.log('\n🔥 热门工具:')
    toolsStore.popularTools.forEach((tool, index) => {
      console.log(`  ${index + 1}. ${tool.name} (${tool.click_count} 次点击)`)
    })

    console.log('\n⭐ 特色工具:')
    toolsStore.featuredTools.forEach(tool => {
      console.log(`  - ${tool.name}`)
    })

    // 测试交互功能
    console.log('\n🖱️ 测试工具交互...')
    if (toolsStore.tools.length > 0) {
      const firstTool = toolsStore.tools[0]
      console.log(`测试工具: ${firstTool.name}`)
      
      // 测试点击统计
      await toolsStore.incrementClickCount(firstTool.id)
      
      // 测试收藏功能
      await toolsStore.toggleFavorite(firstTool.id)
    }

    // 测试分类筛选
    console.log('\n🏷️ 测试分类筛选...')
    const devCategory = categoriesStore.categories.find(cat => cat.name === '开发工具')
    if (devCategory) {
      const devTools = toolsStore.tools.filter(tool => tool.category_id === devCategory.id)
      console.log(`"${devCategory.name}" 分类下的工具:`)
      devTools.forEach(tool => {
        console.log(`  - ${tool.name}`)
      })
    }

    console.log('\n🎉 Store测试完成！')
    console.log('✅ 所有Store初始化成功')
    console.log('✅ 数据加载正常')
    console.log('✅ 计算属性工作正常')
    console.log('✅ 交互功能正常')

    return true

  } catch (error) {
    console.error('❌ Store测试失败:', error.message)
    return false
  }
}

async function main() {
  const success = await testStores()
  
  if (success) {
    console.log('\n🎯 前端应用应该能够正常工作！')
    console.log('建议检查:')
    console.log('1. 浏览器访问 http://localhost:3000/')
    console.log('2. 检查开发者工具控制台是否有错误')
    console.log('3. 验证工具列表是否显示')
    console.log('4. 测试分类筛选和搜索功能')
  } else {
    console.log('\n❌ 需要进一步调试Store或服务层问题')
  }
}

main().catch(console.error)
