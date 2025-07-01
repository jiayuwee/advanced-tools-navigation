-- 数据库安全修复脚本
-- 解决 Supabase RLS (Row Level Security) 安全问题

-- =============================================
-- 1. 启用 RLS 安全策略
-- =============================================

-- 为 tool_ratings 表启用 RLS
ALTER TABLE public.tool_ratings ENABLE ROW LEVEL SECURITY;

-- 为 user_feedback 表启用 RLS  
ALTER TABLE public.user_feedback ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 2. 创建 tool_ratings 表的安全策略
-- =============================================

-- 允许所有人查看工具评分（公开读取）
CREATE POLICY "Tool ratings are viewable by everyone" 
ON public.tool_ratings FOR SELECT 
USING (true);

-- 只允许认证用户创建评分
CREATE POLICY "Authenticated users can create tool ratings" 
ON public.tool_ratings FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- 只允许用户更新自己的评分
CREATE POLICY "Users can update their own tool ratings" 
ON public.tool_ratings FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 只允许用户删除自己的评分
CREATE POLICY "Users can delete their own tool ratings" 
ON public.tool_ratings FOR DELETE 
USING (auth.uid() = user_id);

-- =============================================
-- 3. 创建 user_feedback 表的安全策略
-- =============================================

-- 只允许管理员查看所有反馈
CREATE POLICY "Admins can view all user feedback" 
ON public.user_feedback FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- 允许用户查看自己的反馈
CREATE POLICY "Users can view their own feedback" 
ON public.user_feedback FOR SELECT 
USING (auth.uid() = user_id);

-- 允许认证用户创建反馈
CREATE POLICY "Authenticated users can create feedback" 
ON public.user_feedback FOR INSERT 
WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

-- 只允许用户更新自己的反馈
CREATE POLICY "Users can update their own feedback" 
ON public.user_feedback FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 只允许用户删除自己的反馈
CREATE POLICY "Users can delete their own feedback" 
ON public.user_feedback FOR DELETE 
USING (auth.uid() = user_id);

-- =============================================
-- 4. 检查并修复其他可能的 RLS 问题
-- =============================================

-- 确保所有主要表都启用了 RLS（只处理存在的表）
DO $$
BEGIN
  -- 检查并启用 categories 表的 RLS
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'categories') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE c.relname = 'categories'
      AND n.nspname = 'public'
      AND c.relrowsecurity = true
    ) THEN
      ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
    END IF;
  END IF;

  -- 检查并启用 tools 表的 RLS
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tools') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE c.relname = 'tools'
      AND n.nspname = 'public'
      AND c.relrowsecurity = true
    ) THEN
      ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;
    END IF;
  END IF;

  -- 检查并启用 products 表的 RLS
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'products') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE c.relname = 'products'
      AND n.nspname = 'public'
      AND c.relrowsecurity = true
    ) THEN
      ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
    END IF;
  END IF;

  -- 检查并启用 user_profiles 表的 RLS
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_profiles') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE c.relname = 'user_profiles'
      AND n.nspname = 'public'
      AND c.relrowsecurity = true
    ) THEN
      ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
    END IF;
  END IF;

  -- 检查并启用 favorites 表的 RLS
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'favorites') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE c.relname = 'favorites'
      AND n.nspname = 'public'
      AND c.relrowsecurity = true
    ) THEN
      ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
    END IF;
  END IF;

  -- 检查并启用 orders 表的 RLS
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'orders') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE c.relname = 'orders'
      AND n.nspname = 'public'
      AND c.relrowsecurity = true
    ) THEN
      ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
    END IF;
  END IF;

  -- 检查并启用 analytics 表的 RLS
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'analytics') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE c.relname = 'analytics'
      AND n.nspname = 'public'
      AND c.relrowsecurity = true
    ) THEN
      ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;
    END IF;
  END IF;
END $$;

-- =============================================
-- 5. 验证 RLS 状态
-- =============================================

-- 查询所有表的 RLS 状态
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled,
  CASE 
    WHEN rowsecurity THEN '✅ RLS 已启用'
    ELSE '❌ RLS 未启用'
  END as status
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN (
  'categories', 'tools', 'products', 'user_profiles', 
  'favorites', 'orders', 'reviews', 'tool_ratings', 
  'user_feedback', 'analytics', 'tags', 'tool_tags',
  'order_items', 'product_categories'
)
ORDER BY tablename;

-- =============================================
-- 6. 安全策略验证
-- =============================================

-- 查询所有安全策略
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
