/// <reference types="vite/client" />

// 环境变量类型定义
interface ImportMetaEnv {
  // 基础配置
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_APP_VERSION?: string
  readonly VITE_APP_ENV?: 'development' | 'production' | 'test'
  readonly VITE_ENABLE_ANALYTICS?: 'true' | 'false'
  readonly VITE_DEBUG_MODE?: 'true' | 'false'
  
  // 支付网关配置
  readonly VITE_STRIPE_PUBLIC_KEY?: string
  readonly VITE_STRIPE_SECRET_KEY?: string
  readonly VITE_ALIPAY_APP_ID?: string
  readonly VITE_ALIPAY_PRIVATE_KEY?: string
  readonly VITE_ALIPAY_PUBLIC_KEY?: string
  readonly VITE_WECHAT_APP_ID?: string
  readonly VITE_WECHAT_MCH_ID?: string
  readonly VITE_WECHAT_API_KEY?: string
  
  // 可选服务配置
  readonly VITE_GOOGLE_ANALYTICS_ID?: string
  readonly VITE_SENTRY_DSN?: string
  readonly VITE_RECAPTCHA_SITE_KEY?: string
  readonly VITE_CDN_URL?: string
  readonly VITE_MOCK_API?: 'true' | 'false'
  readonly VITE_HOT_RELOAD?: 'true' | 'false'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Vue 组件类型定义
declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<
    Record<string, never>,
    Record<string, never>,
    unknown
  >;
  export default component;
}
