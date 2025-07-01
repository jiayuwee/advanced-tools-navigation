-- 最小化 RLS 安全修复脚本
-- 专门解决 tool_ratings 和 user_feedback 表的 RLS 问题
-- 安全版本：只处理确实存在的表

-- =============================================
-- 1. 检查表是否存在并启用 RLS
-- =============================================

-- 检查 tool_ratings 表是否存在，如果存在则启用 RLS
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'tool_ratings'
  ) THEN
    -- 启用 RLS
    ALTER TABLE public.tool_ratings ENABLE ROW LEVEL SECURITY;
    
    -- 删除可能存在的旧策略（避免冲突）
    DROP POLICY IF EXISTS "Tool ratings are viewable by everyone" ON public.tool_ratings;
    DROP POLICY IF EXISTS "Authenticated users can create tool ratings" ON public.tool_ratings;
    DROP POLICY IF EXISTS "Users can update their own tool ratings" ON public.tool_ratings;
    DROP POLICY IF EXISTS "Users can delete their own tool ratings" ON public.tool_ratings;
    
    -- 创建安全策略
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
    
    RAISE NOTICE '✅ tool_ratings 表 RLS 已启用并配置安全策略';
  ELSE
    RAISE NOTICE '⚠️ tool_ratings 表不存在，跳过配置';
  END IF;
END $$;

-- 检查 user_feedback 表是否存在，如果存在则启用 RLS
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'user_feedback'
  ) THEN
    -- 启用 RLS
    ALTER TABLE public.user_feedback ENABLE ROW LEVEL SECURITY;
    
    -- 删除可能存在的旧策略（避免冲突）
    DROP POLICY IF EXISTS "Admins can view all user feedback" ON public.user_feedback;
    DROP POLICY IF EXISTS "Users can view their own feedback" ON public.user_feedback;
    DROP POLICY IF EXISTS "Authenticated users can create feedback" ON public.user_feedback;
    DROP POLICY IF EXISTS "Users can update their own feedback" ON public.user_feedback;
    DROP POLICY IF EXISTS "Users can delete their own feedback" ON public.user_feedback;
    
    -- 创建安全策略
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
    
    RAISE NOTICE '✅ user_feedback 表 RLS 已启用并配置安全策略';
  ELSE
    RAISE NOTICE '⚠️ user_feedback 表不存在，跳过配置';
  END IF;
END $$;

-- =============================================
-- 2. 验证修复结果
-- =============================================

-- 显示所有 public 表的 RLS 状态
SELECT 
  table_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_class c 
      JOIN pg_namespace n ON n.oid = c.relnamespace 
      WHERE c.relname = table_name 
      AND n.nspname = 'public' 
      AND c.relrowsecurity = true
    ) THEN '✅ RLS 已启用'
    ELSE '❌ RLS 未启用'
  END as rls_status
FROM information_schema.tables 
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 显示 tool_ratings 和 user_feedback 表的策略数量
SELECT 
  tablename,
  COUNT(*) as policy_count,
  string_agg(policyname, ', ') as policies
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('tool_ratings', 'user_feedback')
GROUP BY tablename
ORDER BY tablename;

-- 最终状态检查
DO $$
DECLARE
  tool_ratings_exists boolean;
  user_feedback_exists boolean;
  tool_ratings_rls boolean;
  user_feedback_rls boolean;
BEGIN
  -- 检查表是否存在
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'tool_ratings'
  ) INTO tool_ratings_exists;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'user_feedback'
  ) INTO user_feedback_exists;
  
  -- 检查 RLS 状态
  IF tool_ratings_exists THEN
    SELECT EXISTS (
      SELECT 1 FROM pg_class c 
      JOIN pg_namespace n ON n.oid = c.relnamespace 
      WHERE c.relname = 'tool_ratings' 
      AND n.nspname = 'public' 
      AND c.relrowsecurity = true
    ) INTO tool_ratings_rls;
  END IF;
  
  IF user_feedback_exists THEN
    SELECT EXISTS (
      SELECT 1 FROM pg_class c 
      JOIN pg_namespace n ON n.oid = c.relnamespace 
      WHERE c.relname = 'user_feedback' 
      AND n.nspname = 'public' 
      AND c.relrowsecurity = true
    ) INTO user_feedback_rls;
  END IF;
  
  -- 输出最终结果
  RAISE NOTICE '=== 修复结果总结 ===';
  
  IF tool_ratings_exists THEN
    IF tool_ratings_rls THEN
      RAISE NOTICE '✅ tool_ratings: 表存在，RLS 已启用';
    ELSE
      RAISE NOTICE '❌ tool_ratings: 表存在，但 RLS 未启用';
    END IF;
  ELSE
    RAISE NOTICE '⚠️ tool_ratings: 表不存在';
  END IF;
  
  IF user_feedback_exists THEN
    IF user_feedback_rls THEN
      RAISE NOTICE '✅ user_feedback: 表存在，RLS 已启用';
    ELSE
      RAISE NOTICE '❌ user_feedback: 表存在，但 RLS 未启用';
    END IF;
  ELSE
    RAISE NOTICE '⚠️ user_feedback: 表不存在';
  END IF;
  
  RAISE NOTICE '=== 修复完成 ===';
END $$;
