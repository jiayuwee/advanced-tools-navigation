-- 超简单 RLS 修复脚本
-- 只修复 tool_ratings 和 user_feedback 表的 RLS 问题

-- 1. 启用 tool_ratings 表的 RLS（如果表存在）
ALTER TABLE IF EXISTS public.tool_ratings ENABLE ROW LEVEL SECURITY;

-- 2. 启用 user_feedback 表的 RLS（如果表存在）
ALTER TABLE IF EXISTS public.user_feedback ENABLE ROW LEVEL SECURITY;

-- 3. 为 tool_ratings 创建基本安全策略
-- 允许所有人查看评分
CREATE POLICY IF NOT EXISTS "allow_read_tool_ratings" 
ON public.tool_ratings FOR SELECT 
USING (true);

-- 允许认证用户创建评分
CREATE POLICY IF NOT EXISTS "allow_insert_tool_ratings" 
ON public.tool_ratings FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- 4. 为 user_feedback 创建基本安全策略
-- 允许用户查看自己的反馈
CREATE POLICY IF NOT EXISTS "allow_read_own_feedback" 
ON public.user_feedback FOR SELECT 
USING (auth.uid() = user_id);

-- 允许认证用户创建反馈
CREATE POLICY IF NOT EXISTS "allow_insert_feedback" 
ON public.user_feedback FOR INSERT 
WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

-- 5. 验证结果
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
