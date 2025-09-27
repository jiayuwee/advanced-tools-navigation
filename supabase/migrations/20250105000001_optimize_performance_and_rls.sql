-- =============================================================================
-- 数据库性能优化和安全策略统一迁移
-- 合并多个性能优化和RLS策略迁移
-- 迁移ID: 20250105000001_optimize_performance_and_rls
-- 描述: 统一RLS策略、性能索引优化、约束完整性检查
-- =============================================================================

BEGIN;

-- =============================================================================
-- 1. 统一启用行级安全 (RLS) 并添加注释
-- =============================================================================

-- 为所有表启用RLS并添加说明注释
COMMENT ON TABLE user_profiles IS '用户资料表，存储用户基本信息和权限设置';
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE categories IS '工具分类表，支持层级结构';
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE product_categories IS '产品分类表，支持层级结构';
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE tools IS '工具表，存储AI工具信息';
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE products IS '产品表，存储可购买的产品信息';
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE tags IS '标签表，用于工具和产品的标签管理';
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE tool_tags IS '工具标签关联表';
ALTER TABLE tool_tags ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE favorites IS '用户收藏表';
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE orders IS '订单表';
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE order_items IS '订单项表';
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE payments IS '支付记录表';
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE product_reviews IS '产品评论表';
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE analytics IS '分析数据表，记录用户行为事件';
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 2. 统一RLS策略定义（修复性能问题的策略）
-- =============================================================================

-- 用户资料表RLS策略
DROP POLICY IF EXISTS "用户只能查看自己的资料" ON user_profiles;
DROP POLICY IF EXISTS "用户只能更新自己的资料" ON user_profiles;
DROP POLICY IF EXISTS "管理员可以管理所有用户" ON user_profiles;
DROP POLICY IF EXISTS "Allow authenticated users to read all profiles" ON user_profiles;

CREATE POLICY "用户只能查看自己的资料" ON user_profiles
    FOR SELECT USING ((SELECT auth.uid()) = id);

CREATE POLICY "用户只能更新自己的资料" ON user_profiles
    FOR UPDATE USING ((SELECT auth.uid()) = id);

CREATE POLICY "管理员可以管理所有用户" ON user_profiles
    FOR ALL USING ((SELECT auth.jwt() ->> 'role') IN ('admin', 'super_admin'));

-- 分类表RLS策略
DROP POLICY IF EXISTS "所有人可以查看分类" ON categories;
DROP POLICY IF EXISTS "只有管理员可以管理分类" ON categories;

CREATE POLICY "所有人可以查看分类" ON categories
    FOR SELECT USING (true);

CREATE POLICY "只有管理员可以管理分类" ON categories
    FOR ALL USING ((SELECT auth.jwt() ->> 'role') IN ('admin', 'super_admin'));

-- 产品分类表RLS策略
DROP POLICY IF EXISTS "所有人可以查看产品分类" ON product_categories;
DROP POLICY IF EXISTS "只有管理员可以管理产品分类" ON product_categories;

CREATE POLICY "所有人可以查看产品分类" ON product_categories
    FOR SELECT USING (true);

CREATE POLICY "只有管理员可以管理产品分类" ON product_categories
    FOR ALL USING ((SELECT auth.jwt() ->> 'role') IN ('admin', 'super_admin'));

-- 工具表RLS策略
DROP POLICY IF EXISTS "所有人可以查看活跃工具" ON tools;
DROP POLICY IF EXISTS "用户可以看到自己的工具（包括非活跃）" ON tools;
DROP POLICY IF EXISTS "用户只能管理自己的工具" ON tools;
DROP POLICY IF EXISTS "管理员可以管理所有工具" ON tools;
DROP POLICY IF EXISTS "admin_tools_select_all" ON tools;

CREATE POLICY "所有人可以查看活跃工具" ON tools
    FOR SELECT USING (status = 'active'::tool_status);

CREATE POLICY "用户可以看到自己的工具（包括非活跃）" ON tools
    FOR SELECT USING ((SELECT auth.uid()) = created_by OR status = 'active'::tool_status);

CREATE POLICY "用户只能管理自己的工具" ON tools
    FOR ALL USING ((SELECT auth.uid()) = created_by);

CREATE POLICY "管理员可以管理所有工具" ON tools
    FOR ALL USING ((SELECT auth.jwt() ->> 'role') IN ('admin', 'super_admin'));

-- 产品表RLS策略
DROP POLICY IF EXISTS "所有人可以查看活跃产品" ON products;
DROP POLICY IF EXISTS "用户可以看到自己的产品（包括非活跃）" ON products;
DROP POLICY IF EXISTS "用户只能管理自己的产品" ON products;
DROP POLICY IF EXISTS "管理员可以管理所有产品" ON products;
DROP POLICY IF EXISTS "admin_products_select_all" ON products;

CREATE POLICY "所有人可以查看活跃产品" ON products
    FOR SELECT USING (status = 'active'::product_status);

CREATE POLICY "用户可以看到自己的产品（包括非活跃）" ON products
    FOR SELECT USING ((SELECT auth.uid()) = created_by OR status = 'active'::product_status);

CREATE POLICY "用户只能管理自己的产品" ON products
    FOR ALL USING ((SELECT auth.uid()) = created_by);

CREATE POLICY "管理员可以管理所有产品" ON products
    FOR ALL USING ((SELECT auth.jwt() ->> 'role') IN ('admin', 'super_admin'));

-- 标签和关联表RLS策略
DROP POLICY IF EXISTS "所有人可以查看标签" ON tags;
DROP POLICY IF EXISTS "只有管理员可以管理标签" ON tags;
DROP POLICY IF EXISTS "所有人可以查看工具标签关联" ON tool_tags;
DROP POLICY IF EXISTS "只有管理员可以管理工具标签关联" ON tool_tags;

CREATE POLICY "所有人可以查看标签" ON tags
    FOR SELECT USING (true);

CREATE POLICY "只有管理员可以管理标签" ON tags
    FOR ALL USING ((SELECT auth.jwt() ->> 'role') IN ('admin', 'super_admin'));

CREATE POLICY "所有人可以查看工具标签关联" ON tool_tags
    FOR SELECT USING (true);

CREATE POLICY "只有管理员可以管理工具标签关联" ON tool_tags
    FOR ALL USING ((SELECT auth.jwt() ->> 'role') IN ('admin', 'super_admin'));

-- 收藏表RLS策略
DROP POLICY IF EXISTS "用户只能查看和管理自己的收藏" ON favorites;
DROP POLICY IF EXISTS "管理员可以查看所有收藏" ON favorites;
DROP POLICY IF EXISTS "admin_favorites_select_all" ON favorites;

CREATE POLICY "用户只能查看和管理自己的收藏" ON favorites
    FOR ALL USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "管理员可以查看所有收藏" ON favorites
    FOR SELECT USING ((SELECT auth.jwt() ->> 'role') IN ('admin', 'super_admin'));

-- 订单相关表RLS策略
DROP POLICY IF EXISTS "用户只能查看和管理自己的订单" ON orders;
DROP POLICY IF EXISTS "管理员可以管理所有订单" ON orders;
DROP POLICY IF EXISTS "admin_orders_select_all" ON orders;
DROP POLICY IF EXISTS "admin_orders_update_all" ON orders;
DROP POLICY IF EXISTS "用户只能查看自己订单的订单项" ON order_items;
DROP POLICY IF EXISTS "管理员可以管理所有订单项" ON order_items;
DROP POLICY IF EXISTS "admin_order_items_select_all" ON order_items;
DROP POLICY IF EXISTS "用户只能查看自己订单的支付记录" ON payments;
DROP POLICY IF EXISTS "管理员可以管理所有支付记录" ON payments;
DROP POLICY IF EXISTS "admin_payments_select_all" ON payments;

CREATE POLICY "用户只能查看和管理自己的订单" ON orders
    FOR ALL USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "管理员可以管理所有订单" ON orders
    FOR ALL USING ((SELECT auth.jwt() ->> 'role') IN ('admin', 'super_admin'));

CREATE POLICY "用户只能查看自己订单的订单项" ON order_items
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = (SELECT auth.uid())
    ));

CREATE POLICY "管理员可以管理所有订单项" ON order_items
    FOR ALL USING ((SELECT auth.jwt() ->> 'role') IN ('admin', 'super_admin'));

CREATE POLICY "用户只能查看自己订单的支付记录" ON payments
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM orders WHERE orders.id = payments.order_id AND orders.user_id = (SELECT auth.uid())
    ));

CREATE POLICY "管理员可以管理所有支付记录" ON payments
    FOR ALL USING ((SELECT auth.jwt() ->> 'role') IN ('admin', 'super_admin'));

-- 评论表RLS策略
DROP POLICY IF EXISTS "所有人可以查看产品评论" ON product_reviews;
DROP POLICY IF EXISTS "用户只能管理自己的评论" ON product_reviews;
DROP POLICY IF EXISTS "管理员可以管理所有评论" ON product_reviews;
DROP POLICY IF EXISTS "admin_product_reviews_delete" ON product_reviews;

CREATE POLICY "所有人可以查看产品评论" ON product_reviews
    FOR SELECT USING (true);

CREATE POLICY "用户只能管理自己的评论" ON product_reviews
    FOR ALL USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "管理员可以管理所有评论" ON product_reviews
    FOR ALL USING ((SELECT auth.jwt() ->> 'role') IN ('admin', 'super_admin'));

-- 分析数据表RLS策略
DROP POLICY IF EXISTS "只有管理员可以查看分析数据" ON analytics;

CREATE POLICY "只有管理员可以查看分析数据" ON analytics
    FOR ALL USING ((SELECT auth.jwt() ->> 'role') IN ('admin', 'super_admin'));

-- =============================================================================
-- 3. 性能索引优化
-- =============================================================================

-- 工具表索引
CREATE INDEX IF NOT EXISTS idx_tools_category_id ON tools(category_id);
CREATE INDEX IF NOT EXISTS idx_tools_status ON tools(status);
CREATE INDEX IF NOT EXISTS idx_tools_is_featured ON tools(is_featured);
CREATE INDEX IF NOT EXISTS idx_tools_click_count ON tools(click_count DESC);
CREATE INDEX IF NOT EXISTS idx_tools_created_at ON tools(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tools_created_by ON tools(created_by);
CREATE INDEX IF NOT EXISTS idx_tools_meta_title_gin ON tools USING gin(to_tsvector('chinese', COALESCE(meta_title, '')));
CREATE INDEX IF NOT EXISTS idx_tools_name_gin ON tools USING gin(to_tsvector('chinese', name));
CREATE INDEX IF NOT EXISTS idx_tools_description_gin ON tools USING gin(to_tsvector('chinese', description));

-- 产品表索引
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_created_by ON products(created_by);
CREATE INDEX IF NOT EXISTS idx_products_average_rating ON products(average_rating DESC);
CREATE INDEX IF NOT EXISTS idx_products_meta_title_gin ON products USING gin(to_tsvector('chinese', COALESCE(meta_title, '')));
CREATE INDEX IF NOT EXISTS idx_products_name_gin ON products USING gin(to_tsvector('chinese', name));
CREATE INDEX IF NOT EXISTS idx_products_description_gin ON products USING gin(to_tsvector('chinese', description));

-- 用户资料表索引
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_created_at ON user_profiles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_profiles_updated_at ON user_profiles(updated_at DESC);

-- 分类表索引
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_sort_order ON categories(sort_order);
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON categories(is_active);

CREATE INDEX IF NOT EXISTS idx_product_categories_parent_id ON product_categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_product_categories_sort_order ON product_categories(sort_order);
CREATE INDEX IF NOT EXISTS idx_product_categories_is_active ON product_categories(is_active);

-- 收藏表索引
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_tool_id ON favorites(tool_id);
CREATE INDEX IF NOT EXISTS idx_favorites_product_id ON favorites(product_id);
CREATE INDEX IF NOT EXISTS idx_favorites_created_at ON favorites(created_at DESC);

-- 订单相关索引
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_updated_at ON orders(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at DESC);

-- 评论表索引
CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_user_id ON product_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_rating ON product_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_product_reviews_created_at ON product_reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_product_reviews_is_verified ON product_reviews(is_verified);

-- 分析数据表索引
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics(created_at DESC);

-- 数组和JSON字段的GIN索引
CREATE INDEX IF NOT EXISTS idx_products_images_gin ON products USING GIN (images);
CREATE INDEX IF NOT EXISTS idx_products_features_gin ON products USING GIN (features);
CREATE INDEX IF NOT EXISTS idx_analytics_event_data_gin ON analytics USING GIN (event_data);

-- =============================================================================
-- 4. 复合索引优化
-- =============================================================================

-- 工具复合索引
CREATE INDEX IF NOT EXISTS idx_tools_status_featured ON tools(status, is_featured);
CREATE INDEX IF NOT EXISTS idx_tools_category_status ON tools(category_id, status);
CREATE INDEX IF NOT EXISTS idx_tools_featured_clicks ON tools(is_featured, click_count DESC);
CREATE INDEX IF NOT EXISTS idx_tools_search_meta ON tools(status, is_featured, click_count DESC);

-- 产品复合索引
CREATE INDEX IF NOT EXISTS idx_products_status_featured ON products(status, is_featured);
CREATE INDEX IF NOT EXISTS idx_products_category_status ON products(category_id, status);
CREATE INDEX IF NOT EXISTS idx_products_price_status ON products(price, status);
CREATE INDEX IF NOT EXISTS idx_products_rating_status ON products(average_rating DESC, status);

-- 订单复合索引
CREATE INDEX IF NOT EXISTS idx_orders_user_status ON orders(user_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_status_created ON orders(status, created_at DESC);

-- 评论复合索引
CREATE INDEX IF NOT EXISTS idx_reviews_product_rating ON product_reviews(product_id, rating);
CREATE INDEX IF NOT EXISTS idx_reviews_user_created ON product_reviews(user_id, created_at DESC);

-- =============================================================================
-- 5. 相似度和全文搜索索引优化
-- =============================================================================

-- 启用必要的扩展
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 工具搜索优化索引
CREATE INDEX IF NOT EXISTS idx_tools_name_trgm ON tools USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_tools_description_trgm ON tools USING gin(description gin_trgm_ops);

-- 产品搜索优化索引
CREATE INDEX IF NOT EXISTS idx_products_name_trgm ON products USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_products_description_trgm ON products USING gin(description gin_trgm_ops);

-- =============================================================================
-- 6. 外键约束完整性检查
-- =============================================================================

DO $$
DECLARE
    constraint_record RECORD;
BEGIN
    -- 检查并修复遗漏的外键约束
    FOR constraint_record IN
        SELECT
            tc.table_name,
            tc.constraint_name,
            cc.column_name,
            ccu.table_name AS referenced_table,
            ccu.column_name AS referenced_column
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public'
    LOOP
        RAISE NOTICE '外键约束已存在: %.% -> %.%',
            constraint_record.table_name,
            constraint_record.column_name,
            constraint_record.referenced_table,
            constraint_record.referenced_column;
    END LOOP;

    RAISE NOTICE '外键约束检查完成';
END $$;

-- =============================================================================
-- 7. 字段注释和元数据优化
-- =============================================================================

-- 更新字段注释
COMMENT ON COLUMN user_profiles.id IS '用户ID，引用auth.users表';
COMMENT ON COLUMN user_profiles.role IS '用户角色: user, admin, super_admin';
COMMENT ON COLUMN user_profiles.email_verified IS '邮箱验证状态';
COMMENT ON COLUMN user_profiles.last_login_at IS '最后登录时间';

COMMENT ON COLUMN tools.click_count IS '工具点击次数';
COMMENT ON COLUMN tools.is_featured IS '是否为精选工具';
COMMENT ON COLUMN tools.status IS '工具状态: active, inactive, draft';
COMMENT ON COLUMN tools.meta_title IS 'SEO标题';
COMMENT ON COLUMN tools.meta_description IS 'SEO描述';

COMMENT ON COLUMN products.price IS '产品价格';
COMMENT ON COLUMN products.original_price IS '原价';
COMMENT ON COLUMN products.average_rating IS '平均评分（1-5分）';
COMMENT ON COLUMN products.total_reviews IS '评论总数';
COMMENT ON COLUMN products.images IS '产品图片URL数组';
COMMENT ON COLUMN products.features IS '产品特性描述数组';

COMMENT ON COLUMN orders.total_amount IS '订单总金额';
COMMENT ON COLUMN orders.status IS '订单状态';
COMMENT ON COLUMN orders.billing_address IS '账单地址（JSON格式）';

COMMENT ON COLUMN product_reviews.rating IS '评分（1-5分）';
COMMENT ON COLUMN product_reviews.is_verified IS '是否为验证购买者评价';

COMMENT ON COLUMN analytics.event_data IS '事件详细数据（JSONB格式）';

-- =============================================================================
-- 8. 迁移验证
-- =============================================================================

DO $$
DECLARE
    rls_enabled_count INTEGER;
    index_count INTEGER;
    policy_count INTEGER;
BEGIN
    -- 检查RLS启用情况
    SELECT COUNT(*) INTO rls_enabled_count
    FROM pg_tables
    WHERE schemaname = 'public' AND rowsecurity = true;

    -- 检查索引创建情况
    SELECT COUNT(*) INTO index_count
    FROM pg_indexes
    WHERE schemaname = 'public' AND indexname LIKE 'idx_%';

    -- 检查策略创建情况
    SELECT COUNT(*) INTO policy_count FROM pg_policies WHERE schemaname = 'public';

    RAISE NOTICE '=============================';
    RAISE NOTICE '迁移完成总结:';
    RAISE NOTICE '  - RLS启用表数: %', rls_enabled_count;
    RAISE NOTICE '  - 已创建索引数: %', index_count;
    RAISE NOTICE '  - 安全策略数: %', policy_count;
    RAISE NOTICE '==============================';

    -- 验证关键功能
    IF rls_enabled_count < 10 THEN
        RAISE WARNING '警告: RLS启用表数偏少，可能存在安全风险';
    END IF;

    IF index_count < 30 THEN
        RAISE WARNING '警告: 索引数量偏少，可能影响查询性能';
    END IF;

    IF policy_count < 20 THEN
        RAISE WARNING '警告: 安全策略数量偏少，请检查RLS配置';
    END IF;
END $$;

COMMIT;

-- =============================================================================
-- 回滚说明：如果需要回滚此迁移，请运行以下 SQL
-- =============================================================================
/*
-- 注意：此迁移涉及大量索引和策略的创建和删除
-- 回滚前请务必备份数据库

-- 禁用RLS（如果需要完全回滚）
-- ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE product_categories DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE tools DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE products DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE tags DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE tool_tags DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE favorites DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE payments DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE product_reviews DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE analytics DISABLE ROW LEVEL SECURITY;

-- 删除所有策略（注意：这将删除所有RLS策略，包括之前存在的）
-- 实际回滚时请谨慎操作，最好使用数据库备份恢复
*/
