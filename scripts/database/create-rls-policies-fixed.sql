-- 修正的 RLS 策略 - 基于 Context7 Supabase 最佳实践
-- 创建时间: 2025-07-02
-- 修正: 枚举值错误问题
-- 目的: 为所有数据库表提供高性能、安全的 RLS 策略

-- =============================================================================
-- 1. 创建安全定义函数以提高性能
-- =============================================================================

-- 创建私有模式存储安全定义函数
CREATE SCHEMA IF NOT EXISTS private;

-- 优化的用户角色检查函数 (避免 RLS 递归检查)
CREATE OR REPLACE FUNCTION private.get_user_role()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN (
        SELECT role 
        FROM user_profiles 
        WHERE id = auth.uid()
    );
END;
$$;

-- 检查用户是否为管理员
CREATE OR REPLACE FUNCTION private.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN (
        SELECT role IN ('admin', 'super_admin')
        FROM user_profiles 
        WHERE id = auth.uid()
    );
END;
$$;

-- 检查用户是否为超级管理员
CREATE OR REPLACE FUNCTION private.is_super_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN (
        SELECT role = 'super_admin'
        FROM user_profiles 
        WHERE id = auth.uid()
    );
END;
$$;

-- =============================================================================
-- 2. 为所有表启用 RLS
-- =============================================================================

-- 确保所有表都启用了 RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- 为 tool_ratings 表启用 RLS (如果存在)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tool_ratings') THEN
        ALTER TABLE tool_ratings ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- =============================================================================
-- 3. 删除现有策略 (如果存在)
-- =============================================================================

-- 删除可能存在的旧策略
DROP POLICY IF EXISTS "用户可以查看所有用户资料" ON user_profiles;
DROP POLICY IF EXISTS "用户只能更新自己的资料" ON user_profiles;
DROP POLICY IF EXISTS "用户可以插入自己的资料" ON user_profiles;
DROP POLICY IF EXISTS "所有人可以查看分类" ON categories;
DROP POLICY IF EXISTS "管理员可以管理分类" ON categories;
DROP POLICY IF EXISTS "所有人可以查看产品分类" ON product_categories;
DROP POLICY IF EXISTS "管理员可以管理产品分类" ON product_categories;
DROP POLICY IF EXISTS "所有人可以查看活跃工具" ON tools;
DROP POLICY IF EXISTS "管理员可以管理工具" ON tools;
DROP POLICY IF EXISTS "所有人可以查看活跃产品" ON products;
DROP POLICY IF EXISTS "管理员可以管理产品" ON products;
DROP POLICY IF EXISTS "所有人可以查看标签" ON tags;
DROP POLICY IF EXISTS "管理员可以管理标签" ON tags;
DROP POLICY IF EXISTS "所有人可以查看工具标签" ON tool_tags;
DROP POLICY IF EXISTS "管理员可以管理工具标签" ON tool_tags;
DROP POLICY IF EXISTS "用户可以查看自己的收藏" ON favorites;
DROP POLICY IF EXISTS "用户可以管理自己的收藏" ON favorites;
DROP POLICY IF EXISTS "用户可以查看自己的订单" ON orders;
DROP POLICY IF EXISTS "用户可以创建订单" ON orders;
DROP POLICY IF EXISTS "管理员可以查看所有订单" ON orders;
DROP POLICY IF EXISTS "用户可以查看自己订单的订单项" ON order_items;
DROP POLICY IF EXISTS "用户可以查看自己的支付记录" ON payments;
DROP POLICY IF EXISTS "所有人可以查看评论" ON product_reviews;
DROP POLICY IF EXISTS "用户可以创建评论" ON product_reviews;
DROP POLICY IF EXISTS "用户可以更新自己的评论" ON product_reviews;
DROP POLICY IF EXISTS "管理员可以查看分析数据" ON analytics;
DROP POLICY IF EXISTS "所有人可以插入分析数据" ON analytics;

-- 删除可能存在的新策略名称
DROP POLICY IF EXISTS "public_profiles_select" ON user_profiles;
DROP POLICY IF EXISTS "users_insert_own_profile" ON user_profiles;
DROP POLICY IF EXISTS "users_update_own_profile" ON user_profiles;
DROP POLICY IF EXISTS "super_admin_delete_profiles" ON user_profiles;
DROP POLICY IF EXISTS "public_categories_select" ON categories;
DROP POLICY IF EXISTS "admin_categories_select_all" ON categories;
DROP POLICY IF EXISTS "admin_categories_insert" ON categories;
DROP POLICY IF EXISTS "admin_categories_update" ON categories;
DROP POLICY IF EXISTS "super_admin_categories_delete" ON categories;
DROP POLICY IF EXISTS "public_product_categories_select" ON product_categories;
DROP POLICY IF EXISTS "admin_product_categories_select_all" ON product_categories;
DROP POLICY IF EXISTS "admin_product_categories_insert" ON product_categories;
DROP POLICY IF EXISTS "admin_product_categories_update" ON product_categories;
DROP POLICY IF EXISTS "super_admin_product_categories_delete" ON product_categories;
DROP POLICY IF EXISTS "public_tools_select" ON tools;
DROP POLICY IF EXISTS "admin_tools_select_all" ON tools;
DROP POLICY IF EXISTS "admin_tools_insert" ON tools;
DROP POLICY IF EXISTS "admin_tools_update" ON tools;
DROP POLICY IF EXISTS "super_admin_tools_delete" ON tools;
DROP POLICY IF EXISTS "public_products_select" ON products;
DROP POLICY IF EXISTS "admin_products_select_all" ON products;
DROP POLICY IF EXISTS "admin_products_insert" ON products;
DROP POLICY IF EXISTS "admin_products_update" ON products;
DROP POLICY IF EXISTS "super_admin_products_delete" ON products;
DROP POLICY IF EXISTS "public_tags_select" ON tags;
DROP POLICY IF EXISTS "admin_tags_insert" ON tags;
DROP POLICY IF EXISTS "admin_tags_update" ON tags;
DROP POLICY IF EXISTS "super_admin_tags_delete" ON tags;
DROP POLICY IF EXISTS "public_tool_tags_select" ON tool_tags;
DROP POLICY IF EXISTS "admin_tool_tags_insert" ON tool_tags;
DROP POLICY IF EXISTS "admin_tool_tags_update" ON tool_tags;
DROP POLICY IF EXISTS "super_admin_tool_tags_delete" ON tool_tags;
DROP POLICY IF EXISTS "users_favorites_select" ON favorites;
DROP POLICY IF EXISTS "users_favorites_insert" ON favorites;
DROP POLICY IF EXISTS "users_favorites_delete" ON favorites;
DROP POLICY IF EXISTS "admin_favorites_select_all" ON favorites;
DROP POLICY IF EXISTS "users_orders_select" ON orders;
DROP POLICY IF EXISTS "users_orders_insert" ON orders;
DROP POLICY IF EXISTS "users_orders_update" ON orders;
DROP POLICY IF EXISTS "admin_orders_select_all" ON orders;
DROP POLICY IF EXISTS "admin_orders_update_all" ON orders;
DROP POLICY IF EXISTS "users_order_items_select" ON order_items;
DROP POLICY IF EXISTS "users_order_items_insert" ON order_items;
DROP POLICY IF EXISTS "admin_order_items_select_all" ON order_items;
DROP POLICY IF EXISTS "admin_order_items_update" ON order_items;
DROP POLICY IF EXISTS "users_payments_select" ON payments;
DROP POLICY IF EXISTS "system_payments_insert" ON payments;
DROP POLICY IF EXISTS "admin_payments_select_all" ON payments;
DROP POLICY IF EXISTS "admin_payments_update" ON payments;
DROP POLICY IF EXISTS "public_product_reviews_select" ON product_reviews;
DROP POLICY IF EXISTS "users_product_reviews_insert" ON product_reviews;
DROP POLICY IF EXISTS "users_product_reviews_update" ON product_reviews;
DROP POLICY IF EXISTS "users_product_reviews_delete" ON product_reviews;
DROP POLICY IF EXISTS "admin_product_reviews_delete" ON product_reviews;
DROP POLICY IF EXISTS "admin_analytics_select" ON analytics;
DROP POLICY IF EXISTS "public_analytics_insert" ON analytics;
DROP POLICY IF EXISTS "admin_analytics_delete" ON analytics;

-- 删除 tool_ratings 策略 (如果存在)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tool_ratings') THEN
        EXECUTE 'DROP POLICY IF EXISTS "public_tool_ratings_select" ON tool_ratings';
        EXECUTE 'DROP POLICY IF EXISTS "users_tool_ratings_insert" ON tool_ratings';
        EXECUTE 'DROP POLICY IF EXISTS "users_tool_ratings_update" ON tool_ratings';
        EXECUTE 'DROP POLICY IF EXISTS "users_tool_ratings_delete" ON tool_ratings';
        EXECUTE 'DROP POLICY IF EXISTS "admin_tool_ratings_delete" ON tool_ratings';
    END IF;
END $$;

-- =============================================================================
-- 4. 用户资料表策略 (user_profiles)
-- =============================================================================

-- 公开查看所有用户资料 (优化性能)
CREATE POLICY "public_profiles_select" ON user_profiles
FOR SELECT
TO authenticated, anon
USING (true);

-- 用户只能插入自己的资料
CREATE POLICY "users_insert_own_profile" ON user_profiles
FOR INSERT
TO authenticated
WITH CHECK ((SELECT auth.uid()) = id);

-- 用户只能更新自己的资料
CREATE POLICY "users_update_own_profile" ON user_profiles
FOR UPDATE
TO authenticated
USING ((SELECT auth.uid()) = id)
WITH CHECK ((SELECT auth.uid()) = id);

-- 超级管理员可以删除用户资料
CREATE POLICY "super_admin_delete_profiles" ON user_profiles
FOR DELETE
TO authenticated
USING ((SELECT private.is_super_admin()));

-- =============================================================================
-- 5. 分类表策略 (categories)
-- =============================================================================

-- 所有人可以查看活跃分类
CREATE POLICY "public_categories_select" ON categories
FOR SELECT
TO authenticated, anon
USING (is_active = true);

-- 管理员可以查看所有分类
CREATE POLICY "admin_categories_select_all" ON categories
FOR SELECT
TO authenticated
USING ((SELECT private.is_admin()));

-- 管理员可以插入分类
CREATE POLICY "admin_categories_insert" ON categories
FOR INSERT
TO authenticated
WITH CHECK ((SELECT private.is_admin()));

-- 管理员可以更新分类
CREATE POLICY "admin_categories_update" ON categories
FOR UPDATE
TO authenticated
USING ((SELECT private.is_admin()))
WITH CHECK ((SELECT private.is_admin()));

-- 超级管理员可以删除分类
CREATE POLICY "super_admin_categories_delete" ON categories
FOR DELETE
TO authenticated
USING ((SELECT private.is_super_admin()));

-- =============================================================================
-- 6. 产品分类表策略 (product_categories)
-- =============================================================================

-- 所有人可以查看活跃产品分类
CREATE POLICY "public_product_categories_select" ON product_categories
FOR SELECT
TO authenticated, anon
USING (is_active = true);

-- 管理员可以查看所有产品分类
CREATE POLICY "admin_product_categories_select_all" ON product_categories
FOR SELECT
TO authenticated
USING ((SELECT private.is_admin()));

-- 管理员可以管理产品分类
CREATE POLICY "admin_product_categories_insert" ON product_categories
FOR INSERT
TO authenticated
WITH CHECK ((SELECT private.is_admin()));

CREATE POLICY "admin_product_categories_update" ON product_categories
FOR UPDATE
TO authenticated
USING ((SELECT private.is_admin()))
WITH CHECK ((SELECT private.is_admin()));

CREATE POLICY "super_admin_product_categories_delete" ON product_categories
FOR DELETE
TO authenticated
USING ((SELECT private.is_super_admin()));

-- =============================================================================
-- 7. 工具表策略 (tools) - 使用正确的枚举值
-- =============================================================================

-- 所有人可以查看活跃工具 (status: 'active', 'inactive', 'draft')
CREATE POLICY "public_tools_select" ON tools
FOR SELECT
TO authenticated, anon
USING (status = 'active' AND is_active = true);

-- 管理员可以查看所有工具
CREATE POLICY "admin_tools_select_all" ON tools
FOR SELECT
TO authenticated
USING ((SELECT private.is_admin()));

-- 管理员可以管理工具
CREATE POLICY "admin_tools_insert" ON tools
FOR INSERT
TO authenticated
WITH CHECK ((SELECT private.is_admin()));

CREATE POLICY "admin_tools_update" ON tools
FOR UPDATE
TO authenticated
USING ((SELECT private.is_admin()))
WITH CHECK ((SELECT private.is_admin()));

CREATE POLICY "super_admin_tools_delete" ON tools
FOR DELETE
TO authenticated
USING ((SELECT private.is_super_admin()));

-- =============================================================================
-- 8. 产品表策略 (products) - 使用正确的枚举值
-- =============================================================================

-- 所有人可以查看活跃产品 (status: 'active', 'inactive', 'draft')
CREATE POLICY "public_products_select" ON products
FOR SELECT
TO authenticated, anon
USING (status = 'active');

-- 管理员可以查看所有产品
CREATE POLICY "admin_products_select_all" ON products
FOR SELECT
TO authenticated
USING ((SELECT private.is_admin()));

-- 管理员可以管理产品
CREATE POLICY "admin_products_insert" ON products
FOR INSERT
TO authenticated
WITH CHECK ((SELECT private.is_admin()));

CREATE POLICY "admin_products_update" ON products
FOR UPDATE
TO authenticated
USING ((SELECT private.is_admin()))
WITH CHECK ((SELECT private.is_admin()));

CREATE POLICY "super_admin_products_delete" ON products
FOR DELETE
TO authenticated
USING ((SELECT private.is_super_admin()));

-- =============================================================================
-- 9. 标签表策略 (tags)
-- =============================================================================

-- 所有人可以查看标签
CREATE POLICY "public_tags_select" ON tags
FOR SELECT
TO authenticated, anon
USING (true);

-- 管理员可以管理标签
CREATE POLICY "admin_tags_insert" ON tags
FOR INSERT
TO authenticated
WITH CHECK ((SELECT private.is_admin()));

CREATE POLICY "admin_tags_update" ON tags
FOR UPDATE
TO authenticated
USING ((SELECT private.is_admin()))
WITH CHECK ((SELECT private.is_admin()));

CREATE POLICY "super_admin_tags_delete" ON tags
FOR DELETE
TO authenticated
USING ((SELECT private.is_super_admin()));

-- =============================================================================
-- 10. 工具标签关联表策略 (tool_tags)
-- =============================================================================

-- 所有人可以查看工具标签关联
CREATE POLICY "public_tool_tags_select" ON tool_tags
FOR SELECT
TO authenticated, anon
USING (true);

-- 管理员可以管理工具标签关联
CREATE POLICY "admin_tool_tags_insert" ON tool_tags
FOR INSERT
TO authenticated
WITH CHECK ((SELECT private.is_admin()));

CREATE POLICY "admin_tool_tags_update" ON tool_tags
FOR UPDATE
TO authenticated
USING ((SELECT private.is_admin()))
WITH CHECK ((SELECT private.is_admin()));

CREATE POLICY "super_admin_tool_tags_delete" ON tool_tags
FOR DELETE
TO authenticated
USING ((SELECT private.is_super_admin()));

-- =============================================================================
-- 11. 收藏表策略 (favorites)
-- =============================================================================

-- 用户只能查看自己的收藏
CREATE POLICY "users_favorites_select" ON favorites
FOR SELECT
TO authenticated
USING ((SELECT auth.uid()) = user_id);

-- 用户可以添加收藏
CREATE POLICY "users_favorites_insert" ON favorites
FOR INSERT
TO authenticated
WITH CHECK ((SELECT auth.uid()) = user_id);

-- 用户可以删除自己的收藏
CREATE POLICY "users_favorites_delete" ON favorites
FOR DELETE
TO authenticated
USING ((SELECT auth.uid()) = user_id);

-- 管理员可以查看所有收藏
CREATE POLICY "admin_favorites_select_all" ON favorites
FOR SELECT
TO authenticated
USING ((SELECT private.is_admin()));

-- =============================================================================
-- 12. 订单表策略 (orders) - 使用正确的枚举值
-- =============================================================================

-- 用户只能查看自己的订单
CREATE POLICY "users_orders_select" ON orders
FOR SELECT
TO authenticated
USING ((SELECT auth.uid()) = user_id);

-- 用户可以创建订单
CREATE POLICY "users_orders_insert" ON orders
FOR INSERT
TO authenticated
WITH CHECK ((SELECT auth.uid()) = user_id);

-- 用户可以更新自己的订单 (仅限 pending 状态)
-- order_status: 'pending', 'paid', 'cancelled', 'refunded'
CREATE POLICY "users_orders_update" ON orders
FOR UPDATE
TO authenticated
USING (
    (SELECT auth.uid()) = user_id
    AND status = 'pending'
)
WITH CHECK (
    (SELECT auth.uid()) = user_id
    AND status IN ('pending', 'cancelled')
);

-- 管理员可以查看和管理所有订单
CREATE POLICY "admin_orders_select_all" ON orders
FOR SELECT
TO authenticated
USING ((SELECT private.is_admin()));

CREATE POLICY "admin_orders_update_all" ON orders
FOR UPDATE
TO authenticated
USING ((SELECT private.is_admin()))
WITH CHECK ((SELECT private.is_admin()));

-- =============================================================================
-- 13. 订单项表策略 (order_items)
-- =============================================================================

-- 用户只能查看自己订单的订单项 (优化查询)
CREATE POLICY "users_order_items_select" ON order_items
FOR SELECT
TO authenticated
USING (
    order_id IN (
        SELECT id FROM orders
        WHERE user_id = (SELECT auth.uid())
    )
);

-- 用户可以在创建订单时添加订单项 (仅限 pending 状态)
CREATE POLICY "users_order_items_insert" ON order_items
FOR INSERT
TO authenticated
WITH CHECK (
    order_id IN (
        SELECT id FROM orders
        WHERE user_id = (SELECT auth.uid())
        AND status = 'pending'
    )
);

-- 管理员可以查看所有订单项
CREATE POLICY "admin_order_items_select_all" ON order_items
FOR SELECT
TO authenticated
USING ((SELECT private.is_admin()));

-- 管理员可以管理订单项
CREATE POLICY "admin_order_items_update" ON order_items
FOR UPDATE
TO authenticated
USING ((SELECT private.is_admin()))
WITH CHECK ((SELECT private.is_admin()));

-- =============================================================================
-- 14. 支付记录表策略 (payments)
-- =============================================================================

-- 用户只能查看自己的支付记录 (优化查询)
CREATE POLICY "users_payments_select" ON payments
FOR SELECT
TO authenticated
USING (
    order_id IN (
        SELECT id FROM orders
        WHERE user_id = (SELECT auth.uid())
    )
);

-- 系统可以插入支付记录
CREATE POLICY "system_payments_insert" ON payments
FOR INSERT
TO authenticated
WITH CHECK (true);

-- 管理员可以查看所有支付记录
CREATE POLICY "admin_payments_select_all" ON payments
FOR SELECT
TO authenticated
USING ((SELECT private.is_admin()));

-- 管理员可以更新支付记录
CREATE POLICY "admin_payments_update" ON payments
FOR UPDATE
TO authenticated
USING ((SELECT private.is_admin()))
WITH CHECK ((SELECT private.is_admin()));

-- =============================================================================
-- 15. 产品评论表策略 (product_reviews)
-- =============================================================================

-- 所有人可以查看评论
CREATE POLICY "public_product_reviews_select" ON product_reviews
FOR SELECT
TO authenticated, anon
USING (true);

-- 认证用户可以创建评论
CREATE POLICY "users_product_reviews_insert" ON product_reviews
FOR INSERT
TO authenticated
WITH CHECK ((SELECT auth.uid()) = user_id);

-- 用户可以更新自己的评论
CREATE POLICY "users_product_reviews_update" ON product_reviews
FOR UPDATE
TO authenticated
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);

-- 用户可以删除自己的评论
CREATE POLICY "users_product_reviews_delete" ON product_reviews
FOR DELETE
TO authenticated
USING ((SELECT auth.uid()) = user_id);

-- 管理员可以删除任何评论
CREATE POLICY "admin_product_reviews_delete" ON product_reviews
FOR DELETE
TO authenticated
USING ((SELECT private.is_admin()));

-- =============================================================================
-- 16. 工具评分表策略 (tool_ratings) - 如果表存在
-- =============================================================================

-- 检查 tool_ratings 表是否存在，如果存在则创建策略
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tool_ratings') THEN

        -- 所有人可以查看工具评分
        EXECUTE 'CREATE POLICY "public_tool_ratings_select" ON tool_ratings
        FOR SELECT
        TO authenticated, anon
        USING (true)';

        -- 认证用户可以创建评分
        EXECUTE 'CREATE POLICY "users_tool_ratings_insert" ON tool_ratings
        FOR INSERT
        TO authenticated
        WITH CHECK ((SELECT auth.uid()) = user_id)';

        -- 用户可以更新自己的评分
        EXECUTE 'CREATE POLICY "users_tool_ratings_update" ON tool_ratings
        FOR UPDATE
        TO authenticated
        USING ((SELECT auth.uid()) = user_id)
        WITH CHECK ((SELECT auth.uid()) = user_id)';

        -- 用户可以删除自己的评分
        EXECUTE 'CREATE POLICY "users_tool_ratings_delete" ON tool_ratings
        FOR DELETE
        TO authenticated
        USING ((SELECT auth.uid()) = user_id)';

        -- 管理员可以删除任何评分
        EXECUTE 'CREATE POLICY "admin_tool_ratings_delete" ON tool_ratings
        FOR DELETE
        TO authenticated
        USING ((SELECT private.is_admin()))';

    END IF;
END $$;

-- =============================================================================
-- 17. 分析数据表策略 (analytics)
-- =============================================================================

-- 管理员可以查看分析数据
CREATE POLICY "admin_analytics_select" ON analytics
FOR SELECT
TO authenticated
USING ((SELECT private.is_admin()));

-- 所有人可以插入分析数据 (用于统计)
CREATE POLICY "public_analytics_insert" ON analytics
FOR INSERT
TO authenticated, anon
WITH CHECK (true);

-- 管理员可以删除分析数据
CREATE POLICY "admin_analytics_delete" ON analytics
FOR DELETE
TO authenticated
USING ((SELECT private.is_admin()));

-- =============================================================================
-- 18. 创建性能优化索引
-- =============================================================================

-- 为 RLS 策略中常用的列创建索引
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_orders_user_id_status ON orders(user_id, status);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_user_id ON product_reviews(user_id);

-- 为 tool_ratings 表创建索引 (如果存在)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tool_ratings') THEN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_tool_ratings_user_id ON tool_ratings(user_id)';
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_tool_ratings_tool_id ON tool_ratings(tool_id)';
    END IF;
END $$;

-- =============================================================================
-- 完成
-- =============================================================================

-- 输出完成信息
DO $$
BEGIN
    RAISE NOTICE '✅ RLS 策略修正完成！';
    RAISE NOTICE '🔧 已修正枚举值错误问题';
    RAISE NOTICE '📊 已为所有表创建高性能 RLS 策略';
    RAISE NOTICE '🔒 已创建安全定义函数避免性能问题';
    RAISE NOTICE '⚡ 已添加必要的数据库索引';
    RAISE NOTICE '🎯 策略遵循 Context7 Supabase 最佳实践';
    RAISE NOTICE '📋 使用正确的枚举值:';
    RAISE NOTICE '   - order_status: pending, paid, cancelled, refunded';
    RAISE NOTICE '   - tool_status: active, inactive, draft';
    RAISE NOTICE '   - product_status: active, inactive, draft';
    RAISE NOTICE '   - payment_status: pending, completed, failed, cancelled';
    RAISE NOTICE '   - user_role: user, admin, super_admin';
END $$;
