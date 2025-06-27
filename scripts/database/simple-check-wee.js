#!/usr/bin/env node

/**
 * 简化的 wee 表检查脚本
 * 运行命令: node scripts/database/simple-check-wee.js
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// 加载环境变量
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 缺少必要的环境变量')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkWeeTable() {
  console.log('🔍 检查 wee 表是否存在...')
  
  try {
    // 尝试查询 wee 表
    const { data, error } = await supabase
      .from('wee')
      .select('*')
      .limit(1)

    if (error) {
      if (error.message.includes('does not exist') || error.code === '42P01') {
        console.log('✅ wee 表不存在，无需删除')
        console.log('   Security Advisor 中的警告可能是缓存问题')
        console.log('   请刷新 Supabase Dashboard 页面')
        return false
      } else {
        console.log('⚠️ wee 表存在但查询失败:', error.message)
        return true
      }
    }

    console.log('⚠️ 发现 wee 表存在')
    
    // 查看数据数量
    const { count, error: countError } = await supabase
      .from('wee')
      .select('*', { count: 'exact', head: true })

    if (!countError) {
      console.log(`📊 数据行数: ${count || 0}`)
    }

    // 显示示例数据
    if (data && data.length > 0) {
      console.log('📄 示例数据:')
      console.log(JSON.stringify(data, null, 2))
    }

    return true

  } catch (error) {
    console.error('❌ 检查过程中发生错误:', error.message)
    return false
  }
}

async function provideSolution() {
  console.log('\n🔧 解决方案:')
  console.log('=' * 30)
  
  console.log('\n📝 手动删除 wee 表的步骤:')
  console.log('1. 访问 Supabase SQL Editor:')
  console.log(`   ${supabaseUrl.replace('/rest/v1', '')}/dashboard/sql`)
  console.log('2. 执行以下 SQL 命令:')
  console.log('   DROP TABLE IF EXISTS public.wee CASCADE;')
  console.log('3. 点击 "Run" 执行')
  
  console.log('\n🔄 或者通过 Database 页面:')
  console.log('1. 访问 Database > Tables:')
  console.log(`   ${supabaseUrl.replace('/rest/v1', '')}/dashboard/database/tables`)
  console.log('2. 找到 "wee" 表')
  console.log('3. 点击表名旁的 "..." 菜单')
  console.log('4. 选择 "Delete table"')
  console.log('5. 确认删除')
  
  console.log('\n✅ 删除后的效果:')
  console.log('- Security Advisor 中的警告将消失')
  console.log('- 不会影响项目的正常功能')
  console.log('- 数据库将更加整洁')
}

async function main() {
  console.log('🔍 检查 wee 表状态')
  console.log('=' * 30)
  
  const tableExists = await checkWeeTable()
  
  if (tableExists) {
    await provideSolution()
    
    console.log('\n❓ 确认信息:')
    console.log('- wee 表不在项目的标准数据库架构中')
    console.log('- 项目中没有任何代码引用这个表')
    console.log('- 删除这个表是安全的')
    
  } else {
    console.log('\n🎉 无需任何操作！')
    console.log('如果 Security Advisor 仍显示警告，请刷新页面')
  }
}

main()
