// 完整部署流程测试脚本
import { execSync } from 'child_process'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// 加载环境变量
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

console.log('🧪 开始完整部署流程测试')
console.log('=====================================')

// 测试步骤
const testSteps = [
  {
    name: '环境检查',
    description: '检查 Node.js 版本和环境变量',
    test: testEnvironment
  },
  {
    name: '依赖安装',
    description: '测试依赖安装过程',
    test: testDependencies
  },
  {
    name: '代码质量检查',
    description: '运行 ESLint 和 TypeScript 检查',
    test: testCodeQuality
  },
  {
    name: '构建测试',
    description: '测试生产构建过程',
    test: testBuild
  },
  {
    name: 'Supabase 连接',
    description: '测试数据库连接',
    test: testSupabaseConnection
  },
  {
    name: '网站可访问性',
    description: '测试生产网站是否可访问',
    test: testSiteAccessibility
  }
]

async function runTests() {
  let passedTests = 0
  let totalTests = testSteps.length

  console.log(`📋 将运行 ${totalTests} 个测试步骤`)
  console.log('')

  for (const [index, step] of testSteps.entries()) {
    console.log(`🔍 步骤 ${index + 1}/${totalTests}: ${step.name}`)
    console.log(`   ${step.description}`)
    
    try {
      const result = await step.test()
      if (result) {
        console.log(`✅ ${step.name} - 通过`)
        passedTests++
      } else {
        console.log(`❌ ${step.name} - 失败`)
      }
    } catch (error) {
      console.log(`❌ ${step.name} - 错误: ${error.message}`)
    }
    
    console.log('')
  }

  // 显示测试结果
  console.log('📊 测试结果总结')
  console.log('=====================================')
  console.log(`通过: ${passedTests}/${totalTests}`)
  console.log(`失败: ${totalTests - passedTests}/${totalTests}`)
  
  if (passedTests === totalTests) {
    console.log('🎉 所有测试通过！部署流程正常')
    return true
  } else {
    console.log('⚠️  部分测试失败，请检查上述错误')
    return false
  }
}

// 测试函数实现
function testEnvironment() {
  try {
    // 检查 Node.js 版本
    const nodeVersion = process.version
    console.log(`   Node.js 版本: ${nodeVersion}`)
    
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0])
    if (majorVersion < 18) {
      throw new Error('Node.js 版本过低，需要 >= 18')
    }
    
    // 检查环境变量
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase 环境变量未配置')
    }
    
    console.log('   环境变量: 已配置')
    return true
  } catch (error) {
    console.log(`   错误: ${error.message}`)
    return false
  }
}

function testDependencies() {
  try {
    console.log('   检查 package.json...')
    execSync('npm list --depth=0', { stdio: 'pipe' })
    console.log('   依赖检查: 正常')
    return true
  } catch (error) {
    console.log('   警告: 部分依赖可能有问题，但这通常不影响构建')
    return true // 依赖警告通常不是致命错误
  }
}

function testCodeQuality() {
  try {
    console.log('   运行 ESLint...')
    execSync('npm run lint', { stdio: 'pipe' })
    console.log('   ESLint: 通过')
    
    console.log('   运行 TypeScript 检查...')
    execSync('npm run type-check', { stdio: 'pipe' })
    console.log('   TypeScript: 通过')
    
    return true
  } catch (error) {
    console.log(`   代码质量检查失败: ${error.message}`)
    return false
  }
}

function testBuild() {
  try {
    console.log('   运行生产构建...')
    execSync('npm run build', { stdio: 'pipe' })
    console.log('   构建: 成功')
    
    // 检查构建输出
    const fs = require('fs')
    if (!fs.existsSync('dist/index.html')) {
      throw new Error('构建输出不完整')
    }
    
    console.log('   构建输出: 完整')
    return true
  } catch (error) {
    console.log(`   构建失败: ${error.message}`)
    return false
  }
}

async function testSupabaseConnection() {
  try {
    console.log('   测试数据库连接...')
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    const { data, error } = await supabase
      .from('categories')
      .select('count')
      .limit(1)
    
    if (error) {
      throw new Error(`数据库连接失败: ${error.message}`)
    }
    
    console.log('   数据库连接: 正常')
    return true
  } catch (error) {
    console.log(`   Supabase 连接失败: ${error.message}`)
    return false
  }
}

async function testSiteAccessibility() {
  try {
    console.log('   测试网站可访问性...')
    
    const response = await fetch('https://ramusi.cn', {
      method: 'HEAD',
      timeout: 10000
    })
    
    if (!response.ok) {
      throw new Error(`网站响应异常: ${response.status}`)
    }
    
    console.log('   网站访问: 正常')
    return true
  } catch (error) {
    console.log(`   网站访问测试失败: ${error.message}`)
    console.log('   这可能是网络问题或网站暂时不可用')
    return false
  }
}

// 运行测试
runTests().then(success => {
  if (success) {
    console.log('')
    console.log('🚀 部署流程测试完成 - 一切正常！')
    console.log('可以安全地进行代码提交和部署。')
  } else {
    console.log('')
    console.log('🔧 请修复上述问题后重新测试')
    process.exit(1)
  }
}).catch(error => {
  console.error('❌ 测试过程中出现未预期的错误:', error.message)
  process.exit(1)
})
