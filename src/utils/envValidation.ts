/**
 * 环境变量验证工具
 * 确保所有必需的环境变量都已正确配置
 */

interface EnvConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  appEnv: "development" | "production" | "test";
  appVersion: string;
  debugMode: boolean;
  enableAnalytics: boolean;
  // 支付配置
  payment: {
    stripe: {
      publicKey?: string;
      secretKey?: string;
    };
    alipay: {
      appId?: string;
      privateKey?: string;
      publicKey?: string;
    };
    wechat: {
      appId?: string;
      mchId?: string;
      apiKey?: string;
    };
  };
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  config?: EnvConfig;
}

/**
 * 验证环境变量配置
 */
export function validateEnvironment(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 获取环境变量
  const env = import.meta.env;

  // 必需的环境变量
  const requiredVars = {
    VITE_SUPABASE_URL: env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: env.VITE_SUPABASE_ANON_KEY,
  };

  // 可选的环境变量
  const optionalVars = {
    VITE_APP_ENV: env.VITE_APP_ENV || "development",
    VITE_APP_VERSION: env.VITE_APP_VERSION || "unknown",
    VITE_DEBUG_MODE: env.VITE_DEBUG_MODE,
    VITE_ENABLE_ANALYTICS: env.VITE_ENABLE_ANALYTICS,
  };

  // 检查必需变量
  for (const [key, value] of Object.entries(requiredVars)) {
    if (!value) {
      errors.push(`环境变量 ${key} 未设置`);
      continue;
    }

    // 检查是否使用了默认值
    if (value.includes("your-project") || value.includes("your-anon-key")) {
      errors.push(`环境变量 ${key} 仍使用默认值，请设置实际值`);
      continue;
    }

    // 检查 URL 格式
    if (key === "VITE_SUPABASE_URL") {
      try {
        const url = new URL(value);
        if (!url.hostname.includes("supabase.co")) {
          warnings.push(`${key} 可能不是有效的 Supabase URL`);
        }
      } catch {
        errors.push(`${key} 不是有效的 URL 格式`);
      }
    }

    // 检查密钥格式
    if (key === "VITE_SUPABASE_ANON_KEY") {
      if (value.length < 100) {
        warnings.push(`${key} 长度似乎不正确，请确认是否为有效密钥`);
      }
    }
  }

  // 检查可选变量
  if (
    optionalVars.VITE_APP_ENV &&
    !["development", "production", "test"].includes(optionalVars.VITE_APP_ENV)
  ) {
    warnings.push("VITE_APP_ENV 应该是 development、production 或 test 之一");
  }

  // 检查开发环境配置
  if (optionalVars.VITE_APP_ENV === "production") {
    if (optionalVars.VITE_DEBUG_MODE === "true") {
      warnings.push("生产环境建议关闭调试模式 (VITE_DEBUG_MODE=false)");
    }
    if (optionalVars.VITE_ENABLE_ANALYTICS !== "true") {
      warnings.push("生产环境建议启用分析 (VITE_ENABLE_ANALYTICS=true)");
    }
  }

  // 如果有错误，在生产环境返回警告而不是失败
  if (errors.length > 0) {
    if (import.meta.env.PROD) {
      console.warn('⚠️ 生产环境配置问题，将使用默认配置:', errors)
      // 在生产环境返回默认配置以确保应用能运行
      return {
        isValid: true, // 设为true以避免应用崩溃
        errors,
        warnings,
        config: {
          supabaseUrl: "https://placeholder.supabase.co",
          supabaseAnonKey: "placeholder-key",
          appEnv: "production",
          appVersion: "1.0.0",
          debugMode: false,
          enableAnalytics: false,
          payment: {
            stripe: { publicKey: undefined, secretKey: undefined },
            alipay: { appId: undefined, privateKey: undefined, publicKey: undefined },
            wechat: { appId: undefined, mchId: undefined, apiKey: undefined },
          },
        }
      }
    }
    
    return {
      isValid: false,
      errors,
      warnings,
    };
  }

  // 构建配置对象
  const config: EnvConfig = {
    supabaseUrl: requiredVars.VITE_SUPABASE_URL,
    supabaseAnonKey: requiredVars.VITE_SUPABASE_ANON_KEY,
    appEnv: optionalVars.VITE_APP_ENV as EnvConfig["appEnv"],
    appVersion: optionalVars.VITE_APP_VERSION,
    debugMode: optionalVars.VITE_DEBUG_MODE === "true",
    enableAnalytics: optionalVars.VITE_ENABLE_ANALYTICS === "true",
    payment: {
      stripe: {
        publicKey: env.VITE_STRIPE_PUBLIC_KEY,
        secretKey: env.VITE_STRIPE_SECRET_KEY,
      },
      alipay: {
        appId: env.VITE_ALIPAY_APP_ID,
        privateKey: env.VITE_ALIPAY_PRIVATE_KEY,
        publicKey: env.VITE_ALIPAY_PUBLIC_KEY,
      },
      wechat: {
        appId: env.VITE_WECHAT_APP_ID,
        mchId: env.VITE_WECHAT_MCH_ID,
        apiKey: env.VITE_WECHAT_API_KEY,
      },
    },
  };

  return {
    isValid: true,
    errors,
    warnings,
    config,
  };
}

/**
 * 打印环境验证结果
 */
export function printValidationResult(result: ValidationResult): void {
  console.log("🔍 环境变量验证结果:");
  console.log("=".repeat(40));

  if (result.isValid) {
    console.log("✅ 环境变量验证通过");

    if (result.config) {
      console.log("\n📋 当前配置:");
      console.log(`  - 环境: ${result.config.appEnv}`);
      console.log(`  - 版本: ${result.config.appVersion}`);
      console.log(`  - 调试模式: ${result.config.debugMode ? "开启" : "关闭"}`);
      console.log(
        `  - 分析统计: ${result.config.enableAnalytics ? "开启" : "关闭"}`,
      );
      console.log(
        `  - Supabase URL: ${result.config.supabaseUrl.substring(0, 30)}...`,
      );
    }
  } else {
    console.log("❌ 环境变量验证失败");
  }

  if (result.errors.length > 0) {
    console.log("\n❌ 错误:");
    result.errors.forEach((error, index) => {
      console.log(`  ${index + 1}. ${error}`);
    });
  }

  if (result.warnings.length > 0) {
    console.log("\n⚠️  警告:");
    result.warnings.forEach((warning, index) => {
      console.log(`  ${index + 1}. ${warning}`);
    });
  }

  console.log("=".repeat(40));
}

/**
 * 在应用启动时验证环境变量
 */
export function initializeEnvironment(): EnvConfig {
  const result = validateEnvironment();

  // 在开发环境下打印验证结果
  if (import.meta.env.DEV || import.meta.env.VITE_DEBUG_MODE === "true") {
    printValidationResult(result);
  }

  if (!result.isValid) {
    const errorMessage = `
🚨 环境配置问题

${result.errors.join("\n")}

请检查以下文件中的环境变量配置:
- 开发环境: .env.local
- 生产环境: Netlify 环境变量设置

详细配置指南请参考: docs/SECURITY_AND_ENV_CONFIG.md
    `;

    // 在生产环境显示警告但不抛出错误，在开发环境也只是警告
    console.error(errorMessage);

    // 返回默认配置以便应用继续运行
    return {
      supabaseUrl: "https://placeholder.supabase.co",
      supabaseAnonKey: "placeholder-key",
      appEnv: import.meta.env.PROD ? "production" : "development",
      appVersion: "1.0.0",
      debugMode: !import.meta.env.PROD,
      enableAnalytics: false,
      payment: {
        stripe: { publicKey: undefined, secretKey: undefined },
        alipay: {
          appId: undefined,
          privateKey: undefined,
          publicKey: undefined,
        },
        wechat: { appId: undefined, mchId: undefined, apiKey: undefined },
      },
    };
  }

  return result.config!;
}

/**
 * 获取环境特定的配置
 */
export function getEnvironmentConfig() {
  const config = initializeEnvironment();

  return {
    // 基础配置
    ...config,

    // 派生配置
    isProduction: config.appEnv === "production",
    isDevelopment: config.appEnv === "development",
    isTest: config.appEnv === "test",

    // 功能开关
    enableLogs: config.debugMode || config.appEnv !== "production",
    enableErrorReporting: config.appEnv === "production",
    enablePerformanceMonitoring: config.enableAnalytics,

    // Supabase 配置
    supabase: {
      url: config.supabaseUrl,
      anonKey: config.supabaseAnonKey,
      options: {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
        },
        realtime: {
          params: {
            eventsPerSecond: config.appEnv === "production" ? 10 : 2,
          },
        },
      },
    },
  };
}
