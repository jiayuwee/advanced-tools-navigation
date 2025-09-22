/**
 * Supabase 连接测试工具
 * 用于验证前后端连接状态
 */

import { supabase } from "../lib/supabaseClient";

export interface ConnectionTestResult {
  success: boolean;
  message: string;
  details?: any;
}

/**
 * 测试 Supabase 连接
 */
export const testSupabaseConnection = async (): Promise<ConnectionTestResult> => {
  try {
    console.log("🔍 开始测试 Supabase 连接...");

    // 测试基础连接
    const { data: connectionData, error: connectionError } = await supabase
      .from('tools')
      .select('count', { count: 'exact', head: true });

    if (connectionError) {
      return {
        success: false,
        message: `连接失败: ${connectionError.message}`,
        details: connectionError
      };
    }

    console.log("✅ Supabase 基础连接成功");

    // 测试数据查询
    const { data: toolsData, error: toolsError } = await supabase
      .from('tools')
      .select('id, name, status')
      .limit(5);

    if (toolsError) {
      return {
        success: false,
        message: `数据查询失败: ${toolsError.message}`,
        details: toolsError
      };
    }

    console.log("✅ 工具数据查询成功");

    // 测试用户数据查询
    const { data: usersData, error: usersError } = await supabase
      .from('user_profiles')
      .select('count', { count: 'exact', head: true });

    if (usersError) {
      console.warn("⚠️ 用户数据查询失败（可能权限不足）:", usersError.message);
    } else {
      console.log("✅ 用户数据查询成功");
    }

    return {
      success: true,
      message: "Supabase 连接测试通过",
      details: {
        toolsCount: connectionData || 0,
        usersCount: usersData || 0,
        sampleTools: toolsData?.slice(0, 3) || []
      }
    };

  } catch (error: any) {
    console.error("❌ Supabase 连接测试失败:", error);
    return {
      success: false,
      message: `连接测试失败: ${error.message}`,
      details: error
    };
  }
};

/**
 * 测试管理功能权限
 */
export const testAdminPermissions = async (): Promise<ConnectionTestResult> => {
  try {
    console.log("🔍 开始测试管理员权限...");

    // 测试工具管理权限
    const { data: toolsData, error: toolsError } = await supabase
      .from('tools')
      .select('*')
      .limit(1);

    if (toolsError) {
      return {
        success: false,
        message: `工具管理权限测试失败: ${toolsError.message}`,
        details: toolsError
      };
    }

    // 测试用户管理权限
    const { data: usersData, error: usersError } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(1);

    if (usersError) {
      console.warn("⚠️ 用户管理权限测试失败（可能需要管理员权限）:", usersError.message);
    }

    return {
      success: true,
      message: "管理员权限测试完成",
      details: {
        canManageTools: !toolsError,
        canManageUsers: !usersError,
        sampleTool: toolsData?.[0],
        sampleUser: usersData?.[0]
      }
    };

  } catch (error: any) {
    return {
      success: false,
      message: `权限测试失败: ${error.message}`,
      details: error
    };
  }
};

/**
 * 运行完整连接测试
 */
export const runFullConnectionTest = async () => {
  console.log("🚀 开始完整连接测试...\n");

  const results = {
    connection: await testSupabaseConnection(),
    permissions: await testAdminPermissions()
  };

  console.log("\n📊 测试结果汇总:");
  console.log("====================");

  if (results.connection.success) {
    console.log("✅ 基础连接: 通过");
    console.log(`   - 工具数量: ${results.connection.details?.toolsCount || 0}`);
    console.log(`   - 用户数量: ${results.connection.details?.usersCount || 0}`);
  } else {
    console.log("❌ 基础连接: 失败");
    console.log(`   - 错误: ${results.connection.message}`);
  }

  if (results.permissions.success) {
    console.log("✅ 权限测试: 通过");
    console.log(`   - 工具管理: ${results.permissions.details?.canManageTools ? '✅' : '❌'}`);
    console.log(`   - 用户管理: ${results.permissions.details?.canManageUsers ? '✅' : '❌'}`);
  } else {
    console.log("❌ 权限测试: 失败");
    console.log(`   - 错误: ${results.permissions.message}`);
  }

  const overallSuccess = results.connection.success && results.permissions.success;
  console.log("====================");
  console.log(`${overallSuccess ? '🎉' : '⚠️'} 总体结果: ${overallSuccess ? '通过' : '部分失败'}`);

  return results;
};

// 在开发环境下自动运行测试
if (import.meta.env.DEV) {
  // 延迟执行，确保应用完全加载
  setTimeout(() => {
    runFullConnectionTest();
  }, 2000);
}
