-- 超级简单 RLS 修复脚本
-- 只启用 RLS，不创建复杂策略

-- 1. 启用 tool_ratings 表的 RLS（如果表存在）
ALTER TABLE IF EXISTS public.tool_ratings ENABLE ROW LEVEL SECURITY;

-- 2. 启用 user_feedback 表的 RLS（如果表存在）
ALTER TABLE IF EXISTS public.user_feedback ENABLE ROW LEVEL SECURITY;

-- 3. 验证结果
SELECT 
  'tool_ratings' as table_name,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tool_ratings') 
    THEN 
      CASE 
        WHEN EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'tool_ratings' AND n.nspname = 'public' AND c.relrowsecurity = true)
        THEN '✅ RLS 已启用'
        ELSE '❌ RLS 未启用'
      END
    ELSE '⚠️ 表不存在'
  END as status

UNION ALL

SELECT 
  'user_feedback' as table_name,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_feedback') 
    THEN 
      CASE 
        WHEN EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'user_feedback' AND n.nspname = 'public' AND c.relrowsecurity = true)
        THEN '✅ RLS 已启用'
        ELSE '❌ RLS 未启用'
      END
    ELSE '⚠️ 表不存在'
  END as status;
