// GitHub Actions 部署状态检查脚本
import { Octokit } from '@octokit/rest'
import dotenv from 'dotenv'

// 加载环境变量
dotenv.config({ path: '.env.local' })

const REPO_OWNER = 'jiayuwee'
const REPO_NAME = 'advanced-tools-navigation'

// 如果有 GitHub token，使用它来避免 API 限制
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN, // 可选
})

console.log('🔍 检查 GitHub Actions 部署状态...')

async function checkDeploymentStatus() {
  try {
    // 获取最近的工作流运行
    console.log('📋 获取最近的工作流运行记录...')
    
    const { data: runs } = await octokit.rest.actions.listWorkflowRunsForRepo({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      per_page: 10,
    })

    if (runs.total_count === 0) {
      console.log('ℹ️  没有找到工作流运行记录')
      return
    }

    console.log(`📊 找到 ${runs.total_count} 个工作流运行记录`)
    console.log('')

    // 显示最近的运行状态
    console.log('🕒 最近的工作流运行:')
    console.log('=' .repeat(80))

    for (const run of runs.workflow_runs.slice(0, 5)) {
      const status = getStatusIcon(run.status, run.conclusion)
      const duration = run.updated_at ? 
        Math.round((new Date(run.updated_at) - new Date(run.created_at)) / 1000) : 
        '未知'
      
      console.log(`${status} ${run.name}`)
      console.log(`   分支: ${run.head_branch}`)
      console.log(`   状态: ${run.status} ${run.conclusion ? `(${run.conclusion})` : ''}`)
      console.log(`   时间: ${new Date(run.created_at).toLocaleString('zh-CN')}`)
      console.log(`   耗时: ${duration}秒`)
      console.log(`   链接: ${run.html_url}`)
      console.log('')
    }

    // 检查 Supabase 部署工作流
    console.log('🔍 检查 Supabase 部署工作流...')
    
    const supabaseRuns = runs.workflow_runs.filter(run => 
      run.name.includes('Supabase') || run.name.includes('Deploy')
    )

    if (supabaseRuns.length > 0) {
      const latestSupabaseRun = supabaseRuns[0]
      console.log('📊 最新的 Supabase 部署:')
      console.log(`   状态: ${getStatusIcon(latestSupabaseRun.status, latestSupabaseRun.conclusion)} ${latestSupabaseRun.status}`)
      console.log(`   时间: ${new Date(latestSupabaseRun.created_at).toLocaleString('zh-CN')}`)
      console.log(`   提交: ${latestSupabaseRun.head_sha.substring(0, 7)}`)
      
      if (latestSupabaseRun.conclusion === 'success') {
        console.log('✅ 最新部署成功！')
        console.log('🌐 应用地址: https://ramusi.cn')
      } else if (latestSupabaseRun.conclusion === 'failure') {
        console.log('❌ 最新部署失败')
        console.log('🔗 查看详情: ' + latestSupabaseRun.html_url)
      } else if (latestSupabaseRun.status === 'in_progress') {
        console.log('⏳ 部署正在进行中...')
        console.log('🔗 实时查看: ' + latestSupabaseRun.html_url)
      }
    } else {
      console.log('ℹ️  没有找到 Supabase 部署记录')
    }

    // 检查仓库 secrets 配置状态
    console.log('')
    console.log('🔐 检查仓库配置...')
    
    try {
      const { data: secrets } = await octokit.rest.actions.listRepoSecrets({
        owner: REPO_OWNER,
        repo: REPO_NAME,
      })

      const requiredSecrets = [
        'SUPABASE_ACCESS_TOKEN',
        'SUPABASE_PROJECT_REF',
        'VITE_SUPABASE_URL',
        'VITE_SUPABASE_ANON_KEY'
      ]

      const configuredSecrets = secrets.secrets.map(s => s.name)
      
      console.log('📋 Secrets 配置状态:')
      for (const secret of requiredSecrets) {
        const isConfigured = configuredSecrets.includes(secret)
        console.log(`   ${isConfigured ? '✅' : '❌'} ${secret}`)
      }

      const missingSecrets = requiredSecrets.filter(s => !configuredSecrets.includes(s))
      if (missingSecrets.length > 0) {
        console.log('')
        console.log('⚠️  缺失的 Secrets:')
        missingSecrets.forEach(secret => console.log(`   - ${secret}`))
        console.log('')
        console.log('📖 配置指南: docs/GITHUB_SECRETS_SETUP.md')
      } else {
        console.log('')
        console.log('✅ 所有必需的 Secrets 都已配置')
      }

    } catch (error) {
      if (error.status === 403) {
        console.log('⚠️  无法检查 Secrets 配置（需要管理员权限）')
      } else {
        console.log('⚠️  检查 Secrets 时出错:', error.message)
      }
    }

    // 提供有用的链接
    console.log('')
    console.log('🔗 有用的链接:')
    console.log(`   📊 Actions 页面: https://github.com/${REPO_OWNER}/${REPO_NAME}/actions`)
    console.log(`   ⚙️  仓库设置: https://github.com/${REPO_OWNER}/${REPO_NAME}/settings`)
    console.log(`   🔐 Secrets 管理: https://github.com/${REPO_OWNER}/${REPO_NAME}/settings/secrets/actions`)
    console.log('   🌐 应用地址: https://ramusi.cn')

  } catch (error) {
    console.error('❌ 检查部署状态时出错:', error.message)
    
    if (error.status === 404) {
      console.log('请确认仓库名称和权限设置正确')
    } else if (error.status === 403) {
      console.log('请确认 GitHub token 权限或使用有权限的账户')
    }
  }
}

function getStatusIcon(status, conclusion) {
  if (status === 'completed') {
    switch (conclusion) {
      case 'success': return '✅'
      case 'failure': return '❌'
      case 'cancelled': return '⏹️'
      case 'skipped': return '⏭️'
      default: return '❓'
    }
  } else if (status === 'in_progress') {
    return '⏳'
  } else if (status === 'queued') {
    return '⏸️'
  } else {
    return '❓'
  }
}

// 运行检查
checkDeploymentStatus().catch(error => {
  console.error('❌ 脚本执行失败:', error.message)
  process.exit(1)
})
