-- 快速 RLS 安全修复脚本
-- 专门解决 tool_ratings 和 user_feedback 表的 RLS 问题

-- =============================================
-- 1. 启用 RLS 安全策略
-- =============================================

-- 为 tool_ratings 表启用 RLS
ALTER TABLE public.tool_ratings ENABLE ROW LEVEL SECURITY;

-- 为 user_feedback 表启用 RLS  
ALTER TABLE public.user_feedback ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 2. tool_ratings 表安全策略
-- =============================================

-- 删除可能存在的旧策略（避免冲突）
DROP POLICY IF EXISTS "Tool ratings are viewable by everyone" ON public.tool_ratings;
DROP POLICY IF EXISTS "Authenticated users can create tool ratings" ON public.tool_ratings;
DROP POLICY IF EXISTS "Users can update their own tool ratings" ON public.tool_ratings;
DROP POLICY IF EXISTS "Users can delete their own tool ratings" ON public.tool_ratings;

-- 创建新的安全策略
CREATE POLICY "Tool ratings are viewable by everyone" 
ON public.tool_ratings FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create tool ratings" 
ON public.tool_ratings FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own tool ratings" 
ON public.tool_ratings FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tool ratings" 
ON public.tool_ratings FOR DELETE 
USING (auth.uid() = user_id);

-- =============================================
-- 3. user_feedback 表安全策略
-- =============================================

-- 删除可能存在的旧策略（避免冲突）
DROP POLICY IF EXISTS "Admins can view all user feedback" ON public.user_feedback;
DROP POLICY IF EXISTS "Users can view their own feedback" ON public.user_feedback;
DROP POLICY IF EXISTS "Authenticated users can create feedback" ON public.user_feedback;
DROP POLICY IF EXISTS "Users can update their own feedback" ON public.user_feedback;
DROP POLICY IF EXISTS "Users can delete their own feedback" ON public.user_feedback;

-- 创建新的安全策略
CREATE POLICY "Admins can view all user feedback" 
ON public.user_feedback FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  )
);

CREATE POLICY "Users can view their own feedback" 
ON public.user_feedback FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can create feedback" 
ON public.user_feedback FOR INSERT 
WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

CREATE POLICY "Users can update their own feedback" 
ON public.user_feedback FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own feedback" 
ON public.user_feedback FOR DELETE 
USING (auth.uid() = user_id);

-- =============================================
-- 4. 验证修复结果
-- =============================================

-- 检查 RLS 状态
SELECT 
  'tool_ratings' as table_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_class c 
      JOIN pg_namespace n ON n.oid = c.relnamespace 
      WHERE c.relname = 'tool_ratings' 
      AND n.nspname = 'public' 
      AND c.relrowsecurity = true
    ) THEN '✅ RLS 已启用'
    ELSE '❌ RLS 未启用'
  END as rls_status

UNION ALL

SELECT 
  'user_feedback' as table_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_class c 
      JOIN pg_namespace n ON n.oid = c.relnamespace 
      WHERE c.relname = 'user_feedback' 
      AND n.nspname = 'public' 
      AND c.relrowsecurity = true
    ) THEN '✅ RLS 已启用'
    ELSE '❌ RLS 未启用'
  END as rls_status;

-- 检查安全策略数量
SELECT 
  tablename,
  COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('tool_ratings', 'user_feedback')
GROUP BY tablename
ORDER BY tablename;
