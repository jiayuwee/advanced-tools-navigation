// 测试Supabase数据库连接
import { createClient } from '@supabase/supabase-js'

// 从环境变量读取配置
const supabaseUrl = 'https://fytiwsutzgmygfxnqoft.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5dGl3c3V0emdteWdmeG5xb2Z0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4MDM1ODcsImV4cCI6MjA2NjM3OTU4N30.LM9vazR9QCZ4vLC_Q1lJmtCj3pEVqM6vpW4TKzntAQA'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testConnection() {
  console.log('🔍 测试Supabase数据库连接...')
  
  try {
    // 测试1: 获取分类数据
    console.log('\n📂 测试获取分类数据...')
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
    
    if (categoriesError) {
      console.error('❌ 分类数据获取失败:', categoriesError)
    } else {
      console.log(`✅ 成功获取 ${categories.length} 个分类:`)
      categories.forEach(cat => {
        console.log(`   - ${cat.name} (${cat.icon})`)
      })
    }

    // 测试2: 获取工具数据
    console.log('\n🔧 测试获取工具数据...')
    const { data: tools, error: toolsError } = await supabase
      .from('tools')
      .select(`
        *,
        category:categories(*)
      `)
      .eq('status', 'active')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
    
    if (toolsError) {
      console.error('❌ 工具数据获取失败:', toolsError)
    } else {
      console.log(`✅ 成功获取 ${tools.length} 个工具:`)
      tools.forEach(tool => {
        console.log(`   - ${tool.name} (${tool.category?.name})`)
      })
    }

    // 测试3: 获取产品数据
    console.log('\n🛍️ 测试获取产品数据...')
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select(`
        *,
        category:product_categories(*)
      `)
      .eq('status', 'active')
      .order('sort_order', { ascending: true })
    
    if (productsError) {
      console.error('❌ 产品数据获取失败:', productsError)
    } else {
      console.log(`✅ 成功获取 ${products.length} 个产品:`)
      products.forEach(product => {
        console.log(`   - ${product.name} (¥${product.price})`)
      })
    }

    // 测试4: 获取标签数据
    console.log('\n🏷️ 测试获取标签数据...')
    const { data: tags, error: tagsError } = await supabase
      .from('tags')
      .select('*')
    
    if (tagsError) {
      console.error('❌ 标签数据获取失败:', tagsError)
    } else {
      console.log(`✅ 成功获取 ${tags.length} 个标签:`)
      tags.forEach(tag => {
        console.log(`   - ${tag.name} (${tag.color})`)
      })
    }

    console.log('\n🎉 数据库连接测试完成！')
    
  } catch (error) {
    console.error('❌ 连接测试失败:', error)
  }
}

// 运行测试
testConnection()
