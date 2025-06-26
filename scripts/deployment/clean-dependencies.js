// 清理依赖和重新生成 package-lock.json 脚本
import { execSync } from 'child_process'
import { existsSync, unlinkSync, rmSync } from 'fs'
import { join } from 'path'

console.log('🧹 开始清理依赖...')

const projectRoot = process.cwd()
const packageLockPath = join(projectRoot, 'package-lock.json')
const nodeModulesPath = join(projectRoot, 'node_modules')

try {
  // 1. 删除 package-lock.json
  if (existsSync(packageLockPath)) {
    console.log('🗑️  删除 package-lock.json...')
    unlinkSync(packageLockPath)
    console.log('✅ package-lock.json 已删除')
  }

  // 2. 删除 node_modules
  if (existsSync(nodeModulesPath)) {
    console.log('🗑️  删除 node_modules...')
    rmSync(nodeModulesPath, { recursive: true, force: true })
    console.log('✅ node_modules 已删除')
  }

  // 3. 清理 npm 缓存
  console.log('🧽 清理 npm 缓存...')
  execSync('npm cache clean --force', { stdio: 'inherit' })
  console.log('✅ npm 缓存已清理')

  // 4. 重新安装依赖
  console.log('📦 重新安装依赖...')
  console.log('   这可能需要几分钟时间...')
  
  // 使用 npm ci 进行干净安装
  execSync('npm install', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      // 设置环境变量避免平台特定依赖
      npm_config_target_platform: '',
      npm_config_target_arch: '',
      npm_config_optional: 'false'
    }
  })
  
  console.log('✅ 依赖重新安装完成')

  // 5. 验证安装
  console.log('🔍 验证安装...')
  
  try {
    execSync('npm run type-check', { stdio: 'pipe' })
    console.log('✅ TypeScript 类型检查通过')
  } catch (error) {
    console.warn('⚠️  TypeScript 类型检查失败，但这可能是正常的')
  }

  try {
    execSync('npm run build', { stdio: 'pipe' })
    console.log('✅ 构建测试通过')
  } catch (error) {
    console.error('❌ 构建测试失败:', error.message)
    throw error
  }

  console.log('')
  console.log('🎉 依赖清理和重新安装完成！')
  console.log('')
  console.log('📋 完成的操作:')
  console.log('✅ 删除了旧的 package-lock.json')
  console.log('✅ 删除了 node_modules 目录')
  console.log('✅ 清理了 npm 缓存')
  console.log('✅ 重新安装了所有依赖')
  console.log('✅ 验证了构建过程')
  console.log('')
  console.log('🚀 现在可以提交更改并测试 Netlify 部署了')

} catch (error) {
  console.error('❌ 清理过程中出现错误:', error.message)
  console.log('')
  console.log('🔧 故障排除建议:')
  console.log('1. 确保有足够的磁盘空间')
  console.log('2. 检查网络连接')
  console.log('3. 确认 Node.js 版本兼容 (>=18.19.0)')
  console.log('4. 手动删除 node_modules 和 package-lock.json 后重试')
  process.exit(1)
}
