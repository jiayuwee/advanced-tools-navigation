import { supabase } from '../lib/supabase';

// 测试 Supabase 连接
export async function testSupabaseConnection() {
  try {
    console.log('🔍 测试 Supabase 连接...');
    
    // 测试基本连接
    const { data, error } = await supabase
      .from('categories')
      .select('count(*)')
      .limit(1);
    
    if (error) {
      console.error('❌ Supabase 连接失败:', error);
      return false;
    }
    
    console.log('✅ Supabase 连接成功!', data);
    return true;
  } catch (error) {
    console.error('❌ 连接测试异常:', error);
    return false;
  }
}

// 测试分类数据
export async function testCategoriesData() {
  try {
    console.log('🔍 测试分类数据...');
    
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .limit(5);
    
    if (error) {
      console.error('❌ 分类数据获取失败:', error);
      return false;
    }
    
    console.log('✅ 分类数据获取成功:', data);
    return true;
  } catch (error) {
    console.error('❌ 分类数据测试异常:', error);
    return false;
  }
}

// 运行所有测试
export async function runConnectionTests() {
  console.log('🚀 开始连接测试...');
  
  const connectionTest = await testSupabaseConnection();
  const categoriesTest = await testCategoriesData();
  
  if (connectionTest && categoriesTest) {
    console.log('🎉 所有测试通过!');
  } else {
    console.log('⚠️ 部分测试失败');
  }
  
  return { connectionTest, categoriesTest };
}
