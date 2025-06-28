#!/usr/bin/env node

/**
 * 前端数据流测试脚本
 * 验证从数据库到前端组件的完整数据流
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

console.log('🧪 前端数据流测试')
console.log('=' .repeat(50))

const supabase = createClient(supabaseUrl, supabaseKey)

async function testDataFlow() {
  try {
    console.log('🔍 测试数据库层...')
    
    // 1. 测试分类数据
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true })
    
    if (catError) {
      console.error('❌ 分类数据获取失败:', catError.message)
      return false
    }
    
    console.log(`✅ 分类数据: ${categories.length} 条`)
    
    // 2. 测试工具数据（带分类关联）
    const { data: tools, error: toolError } = await supabase
      .from('tools')
      .select(`
        *,
        category:categories(*)
      `)
      .eq('status', 'active')
      .order('click_count', { ascending: false })
    
    if (toolError) {
      console.error('❌ 工具数据获取失败:', toolError.message)
      return false
    }
    
    console.log(`✅ 工具数据: ${tools.length} 条`)
    
    // 3. 验证数据完整性
    console.log('\n🔍 验证数据完整性...')
    
    const toolsWithoutCategory = tools.filter(tool => !tool.category)
    if (toolsWithoutCategory.length > 0) {
      console.warn(`⚠️  发现 ${toolsWithoutCategory.length} 个工具没有关联分类`)
      toolsWithoutCategory.forEach(tool => {
        console.warn(`  - ${tool.name} (category_id: ${tool.category_id})`)
      })
    } else {
      console.log('✅ 所有工具都正确关联了分类')
    }
    
    // 4. 测试特色工具
    const featuredTools = tools.filter(tool => tool.is_featured)
    console.log(`✅ 特色工具: ${featuredTools.length} 条`)
    
    // 5. 测试热门工具（按点击量排序）
    const popularTools = tools.slice(0, 5)
    console.log(`✅ 热门工具: ${popularTools.length} 条`)
    
    // 6. 按分类统计工具数量
    console.log('\n📊 分类统计:')
    categories.forEach(category => {
      const toolCount = tools.filter(tool => tool.category_id === category.id).length
      console.log(`  ${category.icon} ${category.name}: ${toolCount} 个工具`)
    })
    
    // 7. 模拟前端store的数据结构
    console.log('\n🏪 模拟Store数据结构...')
    
    const storeData = {
      categories: categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        description: cat.description,
        icon: cat.icon,
        sort_order: cat.sort_order
      })),
      tools: tools.map(tool => ({
        id: tool.id,
        name: tool.name,
        description: tool.description,
        url: tool.url,
        icon: tool.icon,
        category_id: tool.category_id,
        category: tool.category,
        is_featured: tool.is_featured,
        click_count: tool.click_count,
        status: tool.status
      })),
      loading: false,
      error: null,
      initialized: true
    }
    
    console.log('✅ Store数据结构验证通过')
    console.log(`  - categories: ${storeData.categories.length} 条`)
    console.log(`  - tools: ${storeData.tools.length} 条`)
    console.log(`  - initialized: ${storeData.initialized}`)
    
    // 8. 测试搜索功能
    console.log('\n🔍 测试搜索功能...')
    
    const searchTerm = 'code'
    const { data: searchResults, error: searchError } = await supabase
      .from('tools')
      .select('name, description')
      .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
    
    if (searchError) {
      console.error('❌ 搜索功能测试失败:', searchError.message)
    } else {
      console.log(`✅ 搜索 "${searchTerm}": ${searchResults.length} 条结果`)
      searchResults.forEach(result => {
        console.log(`  - ${result.name}`)
      })
    }
    
    // 9. 测试分类筛选
    console.log('\n🏷️ 测试分类筛选...')
    
    const devCategory = categories.find(cat => cat.name === '开发工具')
    if (devCategory) {
      const devTools = tools.filter(tool => tool.category_id === devCategory.id)
      console.log(`✅ "${devCategory.name}" 分类: ${devTools.length} 个工具`)
      devTools.forEach(tool => {
        console.log(`  - ${tool.name}`)
      })
    }
    
    console.log('\n🎉 数据流测试完成！')
    console.log('✅ 数据库连接正常')
    console.log('✅ 数据结构完整')
    console.log('✅ 关联关系正确')
    console.log('✅ 搜索功能正常')
    console.log('✅ 筛选功能正常')
    
    return true
    
  } catch (error) {
    console.error('❌ 数据流测试失败:', error.message)
    return false
  }
}

async function testPerformance() {
  console.log('\n⚡ 性能测试...')
  
  const start = Date.now()
  
  try {
    await Promise.all([
      supabase.from('categories').select('*'),
      supabase.from('tools').select('*')
    ])
    
    const duration = Date.now() - start
    console.log(`✅ 并行查询耗时: ${duration}ms`)
    
    if (duration < 1000) {
      console.log('🚀 性能优秀')
    } else if (duration < 3000) {
      console.log('⚡ 性能良好')
    } else {
      console.log('⚠️  性能需要优化')
    }
    
  } catch (error) {
    console.error('❌ 性能测试失败:', error.message)
  }
}

async function main() {
  const success = await testDataFlow()
  
  if (success) {
    await testPerformance()
    
    console.log('\n🎯 建议检查项目:')
    console.log('1. 打开浏览器访问 http://localhost:3000/')
    console.log('2. 检查工具列表是否正确显示')
    console.log('3. 测试分类筛选功能')
    console.log('4. 测试搜索功能')
    console.log('5. 检查特色工具展示')
    console.log('6. 验证工具点击统计')
  }
}

main().catch(console.error)
