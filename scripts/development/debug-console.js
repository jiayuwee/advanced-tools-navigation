// 在浏览器控制台中运行此代码来调试数据库连接
// 打开浏览器开发者工具，在控制台中粘贴并执行以下代码

console.log('🔍 开始调试数据库连接...')

// 检查 Vue 应用和 store 状态
if (window.__VUE_DEVTOOLS_GLOBAL_HOOK__) {
  console.log('✅ Vue DevTools 可用')
} else {
  console.log('⚠️ Vue DevTools 不可用')
}

// 检查 toolsStore 状态
try {
  // 获取 Vue 应用实例
  const app = document.querySelector('#app').__vue_app__
  if (app) {
    console.log('✅ Vue 应用实例找到')

    // 检查 store 状态
    const toolsStore = app.config.globalProperties.$toolsStore
    if (toolsStore) {
      console.log('✅ toolsStore 找到')
      console.log('📊 Store 状态:')
      console.log('- 初始化状态:', toolsStore.initialized)
      console.log('- 加载状态:', toolsStore.loading)
      console.log('- 错误信息:', toolsStore.error)
      console.log('- 分类数量:', toolsStore.categories?.length || 0)
      console.log('- 工具数量:', toolsStore.tools?.length || 0)
      console.log('- 分类数据:', toolsStore.categories)
      console.log('- 工具数据:', toolsStore.tools)
    } else {
      console.log('❌ toolsStore 未找到')
    }
  } else {
    console.log('❌ Vue 应用实例未找到')
  }
} catch (error) {
  console.error('❌ 检查 Vue 应用失败:', error)
}

// 直接测试 Supabase 连接
async function testSupabaseConnection() {
  try {
    console.log('🔗 测试 Supabase 连接...')

    // 检查环境变量
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

    console.log('环境变量:')
    console.log('- SUPABASE_URL:', supabaseUrl)
    console.log('- SUPABASE_KEY:', supabaseKey ? '已设置' : '未设置')

    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ 环境变量未正确设置')
      return
    }

    // 动态导入 Supabase 客户端
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(supabaseUrl, supabaseKey)

    console.log('📊 测试分类查询...')
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)

    if (catError) {
      console.error('❌ 分类查询错误:', catError)
    } else {
      console.log('✅ 分类数据:', categories)
    }

    console.log('🔧 测试工具查询...')
    const { data: tools, error: toolError } = await supabase
      .from('tools')
      .select('*, category:categories(*)')
      .eq('status', 'active')

    if (toolError) {
      console.error('❌ 工具查询错误:', toolError)
    } else {
      console.log('✅ 工具数据:', tools)
    }
  } catch (error) {
    console.error('❌ Supabase 连接测试失败:', error)
  }
}

// 运行测试
testSupabaseConnection()
