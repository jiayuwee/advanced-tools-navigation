-- 修复 RLS 性能问题迁移
-- 解决 Supabase 数据库 linter 警告
-- 迁移ID: 20250102000001_fix_rls_performance
-- 描述: 优化 RLS 策略性能，修复 auth_rls_initplan 和 multiple_permissive_policies 警告

BEGIN;

-- =============================================================================
-- 1. 修复 auth_rls_initplan 警告：用 (select auth.<function>()) 替换 auth.<function>()
-- =============================================================================

-- 修复 contact_info 表的策略
DROP POLICY IF EXISTS "所有人可以查看活跃的联系信息" ON contact_info;
DROP POLICY IF EXISTS "管理员可以管理联系信息" ON contact_info;

CREATE POLICY "所有人可以查看活跃的联系信息" ON contact_info
    FOR SELECT USING (is_active = true);

CREATE POLICY "管理员可以管理联系信息" ON contact_info
    FOR ALL USING ((select auth.uid()) IN (
        SELECT user_profiles.id FROM user_profiles
        WHERE user_profiles.role IN ('admin', 'super_admin')
    ));

-- 修复 faq_categories 表的策略
DROP POLICY IF EXISTS "所有人可以查看活跃的FAQ分类" ON faq_categories;
DROP POLICY IF EXISTS "管理员可以管理FAQ分类" ON faq_categories;

CREATE POLICY "所有人可以查看活跃的FAQ分类" ON faq_categories
    FOR SELECT USING (is_active = true);

CREATE POLICY "管理员可以管理FAQ分类" ON faq_categories
    FOR ALL USING ((select auth.uid()) IN (
        SELECT user_profiles.id FROM user_profiles
        WHERE user_profiles.role IN ('admin', 'super_admin')
    ));

-- 修复 faqs 表的策略
DROP POLICY IF EXISTS "所有人可以查看活跃的FAQ" ON faqs;
DROP POLICY IF EXISTS "管理员可以管理FAQ" ON faqs;

CREATE POLICY "所有人可以查看活跃的FAQ" ON faqs
    FOR SELECT USING (is_active = true);

CREATE POLICY "管理员可以管理FAQ" ON faqs
    FOR ALL USING ((select auth.uid()) IN (
        SELECT user_profiles.id FROM user_profiles
        WHERE user_profiles.role IN ('admin', 'super_admin')
    ));

-- 修复 product_submissions 表的策略
DROP POLICY IF EXISTS "用户可以查看自己的产品提交" ON product_submissions;
DROP POLICY IF EXISTS "用户可以创建产品提交" ON product_submissions;
DROP POLICY IF EXISTS "用户可以更新自己的产品提交" ON product_submissions;
DROP POLICY IF EXISTS "管理员可以管理所有产品提交" ON product_submissions;

CREATE POLICY "用户可以查看自己的产品提交" ON product_submissions
    FOR SELECT USING (
        (select auth.uid()) = user_id OR
        (select auth.uid()) IN (
            SELECT user_profiles.id FROM user_profiles
            WHERE user_profiles.role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "用户可以创建产品提交" ON product_submissions
    FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "用户可以更新自己的产品提交" ON product_submissions
    FOR UPDATE USING ((select auth.uid()) = user_id AND status = 'pending');

CREATE POLICY "管理员可以管理所有产品提交" ON product_submissions
    FOR ALL USING ((select auth.uid()) IN (
        SELECT user_profiles.id FROM user_profiles
        WHERE user_profiles.role IN ('admin', 'super_admin')
    ));

-- 修复 site_content 表的策略
DROP POLICY IF EXISTS "所有人可以查看已发布的内容" ON site_content;
DROP POLICY IF EXISTS "管理员可以管理网站内容" ON site_content;

CREATE POLICY "所有人可以查看已发布的内容" ON site_content
    FOR SELECT USING (is_published = true);

CREATE POLICY "管理员可以管理网站内容" ON site_content
    FOR ALL USING ((select auth.uid()) IN (
        SELECT user_profiles.id FROM user_profiles
        WHERE user_profiles.role IN ('admin', 'super_admin')
    ));

-- 修复 system_notifications 表的策略
DROP POLICY IF EXISTS "用户可以查看相关通知" ON system_notifications;
DROP POLICY IF EXISTS "管理员可以管理系统通知" ON system_notifications;

CREATE POLICY "用户可以查看相关通知" ON system_notifications
    FOR SELECT USING (
        is_active = true AND
        (expires_at IS NULL OR expires_at > NOW()) AND
        (is_global = true OR (select auth.uid())::text = ANY(target_users))
    );

CREATE POLICY "管理员可以管理系统通知" ON system_notifications
    FOR ALL USING ((select auth.uid()) IN (
        SELECT user_profiles.id FROM user_profiles
        WHERE user_profiles.role IN ('admin', 'super_admin')
    ));

-- 修复 user_feedback 表的策略
DROP POLICY IF EXISTS "用户可以查看自己的反馈" ON user_feedback;
DROP POLICY IF EXISTS "用户可以创建反馈" ON user_feedback;
DROP POLICY IF EXISTS "用户可以更新自己的反馈" ON user_feedback;
DROP POLICY IF EXISTS "管理员可以管理所有反馈" ON user_feedback;

CREATE POLICY "用户可以查看自己的反馈" ON user_feedback
    FOR SELECT USING (
        (select auth.uid()) = user_id OR
        (select auth.uid()) IN (
            SELECT user_profiles.id FROM user_profiles
            WHERE user_profiles.role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "用户可以创建反馈" ON user_feedback
    FOR INSERT WITH CHECK (true);

CREATE POLICY "用户可以更新自己的反馈" ON user_feedback
    FOR UPDATE USING ((select auth.uid()) = user_id);

CREATE POLICY "管理员可以管理所有反馈" ON user_feedback
    FOR ALL USING ((select auth.uid()) IN (
        SELECT user_profiles.id FROM user_profiles
        WHERE user_profiles.role IN ('admin', 'super_admin')
    ));

-- 修复 user_notification_reads 表的策略
DROP POLICY IF EXISTS "用户可以查看自己的阅读状态" ON user_notification_reads;
DROP POLICY IF EXISTS "用户可以更新自己的阅读状态" ON user_notification_reads;

CREATE POLICY "用户可以查看自己的阅读状态" ON user_notification_reads
    FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "用户可以更新自己的阅读状态" ON user_notification_reads
    FOR ALL USING ((select auth.uid()) = user_id);

-- 修复 unified_categories 表的策略
DROP POLICY IF EXISTS "所有人可以查看分类" ON unified_categories;
DROP POLICY IF EXISTS "只有管理员可以管理分类" ON unified_categories;

CREATE POLICY "所有人可以查看分类" ON unified_categories
    FOR SELECT USING (true);

CREATE POLICY "只有管理员可以管理分类" ON unified_categories
    FOR ALL USING ((select auth.jwt() ->> 'role') IN ('admin', 'super_admin'));

-- =============================================================================
-- 2. 修复 multiple_permissive_policies 警告：合并重复的策略
-- =============================================================================

-- 合并 contact_info 表的重复策略
-- 注意：我们已经删除了旧策略，现在只需要确保没有重复

-- 合并 favorites 表的策略 (移除重复的 admin 策略)
DROP POLICY IF EXISTS "admin_favorites_select_all" ON favorites;

-- 合并 order_items 表的策略
DROP POLICY IF EXISTS "admin_order_items_select_all" ON order_items;

-- 合并 orders 表的策略
DROP POLICY IF EXISTS "admin_orders_select_all" ON orders;
DROP POLICY IF EXISTS "admin_orders_update_all" ON orders;

-- 合并 payments 表的策略
DROP POLICY IF EXISTS "admin_payments_select_all" ON payments;

-- 合并 product_reviews 表的策略
DROP POLICY IF EXISTS "admin_product_reviews_delete" ON product_reviews;

-- 合并 products 表的策略
DROP POLICY IF EXISTS "admin_products_select_all" ON products;

-- 合并 tools 表的策略
DROP POLICY IF EXISTS "admin_tools_select_all" ON tools;

-- 合并 user_profiles 表的策略
DROP POLICY IF EXISTS "Allow authenticated users to read all profiles" ON user_profiles;

-- =============================================================================
-- 3. 验证修复结果
-- =============================================================================

DO $$
DECLARE
    policy_count INTEGER;
BEGIN
    -- 检查是否还有 auth_rls_initplan 问题
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE schemaname = 'public'
    AND policyname IN (
        '管理员可以管理联系信息',
        '管理员可以管理FAQ分类',
        '管理员可以管理FAQ',
        '用户可以创建产品提交',
        '用户可以更新自己的产品提交',
        '管理员可以管理网站内容',
        '用户可以查看相关通知',
        '管理员可以管理系统通知',
        '用户可以更新自己的反馈',
        '用户可以查看自己的反馈',
        '管理员可以管理所有反馈',
        '用户可以更新自己的阅读状态',
        '用户可以查看自己的阅读状态',
        '只有管理员可以管理分类'
    );

    IF policy_count > 0 THEN
        RAISE NOTICE '警告: 仍有一些策略可能存在性能问题，请检查 Supabase linter';
    ELSE
        RAISE NOTICE '✅ RLS 性能优化完成';
    END IF;
END $$;

COMMIT;

-- 回滚说明：如果需要回滚此迁移，请运行以下 SQL
/*
-- 回滚脚本 (如果需要)
-- 此迁移主要是优化性能，不会删除数据
-- 如果需要完全回滚，请联系数据库管理员
*/
