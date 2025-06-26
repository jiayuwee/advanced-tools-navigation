// 在主应用页面的浏览器控制台中运行此代码
// 打开 http://localhost:3001，按F12打开开发者工具，在控制台中粘贴运行

console.log('🔍 开始调试应用状态...')

// 等待一下确保应用加载完成
setTimeout(async () => {
  try {
    // 检查 Vue 应用
    const appElement = document.querySelector('#app')
    if (!appElement) {
      console.error('❌ 找不到 #app 元素')
      return
    }

    const vueApp = appElement.__vue_app__
    if (!vueApp) {
      console.error('❌ 找不到 Vue 应用实例')
      return
    }

    console.log('✅ Vue 应用实例找到')

    // 检查 Pinia store
    const pinia = vueApp.config.globalProperties.$pinia
    if (!pinia) {
      console.error('❌ 找不到 Pinia 实例')
      return
    }

    console.log('✅ Pinia 实例找到')

    // 获取 tools store
    const toolsStore = pinia._s.get('tools')
    if (!toolsStore) {
      console.error('❌ 找不到 tools store')
      return
    }

    console.log('✅ Tools store 找到')
    console.log('📊 Store 状态:')
    console.log('- 初始化状态:', toolsStore.initialized)
    console.log('- 加载状态:', toolsStore.loading)
    console.log('- 错误信息:', toolsStore.error)
    console.log('- 分类数量:', toolsStore.categories?.length || 0)
    console.log('- 工具数量:', toolsStore.tools?.length || 0)
    console.log('- 推荐工具数量:', toolsStore.featuredTools?.length || 0)
    console.log('- 热门工具数量:', toolsStore.popularTools?.length || 0)

    if (toolsStore.categories && toolsStore.categories.length > 0) {
      console.log('📂 分类数据:')
      toolsStore.categories.forEach((cat, index) => {
        console.log(`  ${index + 1}. ${cat.icon} ${cat.name} (${cat.count} 个工具)`)
      })
    }

    if (toolsStore.error) {
      console.error('❌ Store 错误:', toolsStore.error)
    }

    // 检查网络请求
    console.log('🌐 检查网络请求...')
    
    // 手动测试分类加载
    console.log('🔄 手动测试分类加载...')
    try {
      await toolsStore.loadCategories()
      console.log('✅ 分类加载成功')
      console.log('📊 加载后分类数量:', toolsStore.categories?.length || 0)
    } catch (error) {
      console.error('❌ 分类加载失败:', error)
    }

    // 手动测试工具加载
    console.log('🔄 手动测试工具加载...')
    try {
      await toolsStore.loadTools()
      console.log('✅ 工具加载成功')
      console.log('🔧 加载后工具数量:', toolsStore.tools?.length || 0)
    } catch (error) {
      console.error('❌ 工具加载失败:', error)
    }

  } catch (error) {
    console.error('❌ 调试过程中出错:', error)
  }
}, 2000) // 等待2秒确保应用加载完成

console.log('⏳ 等待应用加载完成...')
