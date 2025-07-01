-- 创建RLS策略脚本
-- 在表创建和数据插入成功后执行

-- ========================================
-- 第一步：用户反馈表策略
-- ========================================

-- 删除可能存在的旧策略
DROP POLICY IF EXISTS "用户可以查看自己的反馈" ON user_feedback;
DROP POLICY IF EXISTS "用户可以创建反馈" ON user_feedback;
DROP POLICY IF EXISTS "用户可以更新自己的反馈" ON user_feedback;
DROP POLICY IF EXISTS "管理员可以管理所有反馈" ON user_feedback;

-- 创建新策略
CREATE POLICY "用户可以查看自己的反馈" ON user_feedback
    FOR SELECT USING (
        auth.uid() = user_id OR 
        auth.uid() IN (
            SELECT user_profiles.id FROM user_profiles 
            WHERE user_profiles.role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "用户可以创建反馈" ON user_feedback
    FOR INSERT WITH CHECK (true);

CREATE POLICY "用户可以更新自己的反馈" ON user_feedback
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "管理员可以管理所有反馈" ON user_feedback
    FOR ALL USING (
        auth.uid() IN (
            SELECT user_profiles.id FROM user_profiles 
            WHERE user_profiles.role IN ('admin', 'super_admin')
        )
    );

-- ========================================
-- 第二步：FAQ分类表策略
-- ========================================

-- 删除可能存在的旧策略
DROP POLICY IF EXISTS "所有人可以查看活跃的FAQ分类" ON faq_categories;
DROP POLICY IF EXISTS "管理员可以管理FAQ分类" ON faq_categories;

-- 创建新策略
CREATE POLICY "所有人可以查看活跃的FAQ分类" ON faq_categories
    FOR SELECT USING (is_active = true);

CREATE POLICY "管理员可以管理FAQ分类" ON faq_categories
    FOR ALL USING (
        auth.uid() IN (
            SELECT user_profiles.id FROM user_profiles 
            WHERE user_profiles.role IN ('admin', 'super_admin')
        )
    );

-- ========================================
-- 第三步：FAQ表策略
-- ========================================

-- 删除可能存在的旧策略
DROP POLICY IF EXISTS "所有人可以查看活跃的FAQ" ON faqs;
DROP POLICY IF EXISTS "管理员可以管理FAQ" ON faqs;

-- 创建新策略
CREATE POLICY "所有人可以查看活跃的FAQ" ON faqs
    FOR SELECT USING (is_active = true);

CREATE POLICY "管理员可以管理FAQ" ON faqs
    FOR ALL USING (
        auth.uid() IN (
            SELECT user_profiles.id FROM user_profiles 
            WHERE user_profiles.role IN ('admin', 'super_admin')
        )
    );

-- ========================================
-- 第四步：产品提交表策略
-- ========================================

-- 删除可能存在的旧策略
DROP POLICY IF EXISTS "用户可以查看自己的产品提交" ON product_submissions;
DROP POLICY IF EXISTS "用户可以创建产品提交" ON product_submissions;
DROP POLICY IF EXISTS "用户可以更新自己的产品提交" ON product_submissions;
DROP POLICY IF EXISTS "管理员可以管理所有产品提交" ON product_submissions;

-- 创建新策略
CREATE POLICY "用户可以查看自己的产品提交" ON product_submissions
    FOR SELECT USING (
        auth.uid() = user_id OR 
        auth.uid() IN (
            SELECT user_profiles.id FROM user_profiles 
            WHERE user_profiles.role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "用户可以创建产品提交" ON product_submissions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户可以更新自己的产品提交" ON product_submissions
    FOR UPDATE USING (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "管理员可以管理所有产品提交" ON product_submissions
    FOR ALL USING (
        auth.uid() IN (
            SELECT user_profiles.id FROM user_profiles 
            WHERE user_profiles.role IN ('admin', 'super_admin')
        )
    );

-- ========================================
-- 第五步：网站内容表策略
-- ========================================

-- 删除可能存在的旧策略
DROP POLICY IF EXISTS "所有人可以查看已发布的内容" ON site_content;
DROP POLICY IF EXISTS "管理员可以管理网站内容" ON site_content;

-- 创建新策略
CREATE POLICY "所有人可以查看已发布的内容" ON site_content
    FOR SELECT USING (is_published = true);

CREATE POLICY "管理员可以管理网站内容" ON site_content
    FOR ALL USING (
        auth.uid() IN (
            SELECT user_profiles.id FROM user_profiles 
            WHERE user_profiles.role IN ('admin', 'super_admin')
        )
    );

-- ========================================
-- 第六步：联系信息表策略
-- ========================================

-- 删除可能存在的旧策略
DROP POLICY IF EXISTS "所有人可以查看活跃的联系信息" ON contact_info;
DROP POLICY IF EXISTS "管理员可以管理联系信息" ON contact_info;

-- 创建新策略
CREATE POLICY "所有人可以查看活跃的联系信息" ON contact_info
    FOR SELECT USING (is_active = true);

CREATE POLICY "管理员可以管理联系信息" ON contact_info
    FOR ALL USING (
        auth.uid() IN (
            SELECT user_profiles.id FROM user_profiles 
            WHERE user_profiles.role IN ('admin', 'super_admin')
        )
    );

-- ========================================
-- 第七步：系统通知表策略
-- ========================================

-- 删除可能存在的旧策略
DROP POLICY IF EXISTS "用户可以查看相关通知" ON system_notifications;
DROP POLICY IF EXISTS "管理员可以管理系统通知" ON system_notifications;

-- 创建新策略
CREATE POLICY "用户可以查看相关通知" ON system_notifications
    FOR SELECT USING (
        is_active = true AND 
        (expires_at IS NULL OR expires_at > NOW()) AND
        (is_global = true OR auth.uid()::text = ANY(target_users))
    );

CREATE POLICY "管理员可以管理系统通知" ON system_notifications
    FOR ALL USING (
        auth.uid() IN (
            SELECT user_profiles.id FROM user_profiles 
            WHERE user_profiles.role IN ('admin', 'super_admin')
        )
    );

-- ========================================
-- 第八步：用户通知阅读状态表策略
-- ========================================

-- 删除可能存在的旧策略
DROP POLICY IF EXISTS "用户可以查看自己的阅读状态" ON user_notification_reads;
DROP POLICY IF EXISTS "用户可以更新自己的阅读状态" ON user_notification_reads;

-- 创建新策略
CREATE POLICY "用户可以查看自己的阅读状态" ON user_notification_reads
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "用户可以更新自己的阅读状态" ON user_notification_reads
    FOR ALL USING (auth.uid() = user_id);

-- ========================================
-- 第九步：验证策略创建
-- ========================================

SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    cmd,
    CASE 
        WHEN cmd = 'r' THEN 'SELECT'
        WHEN cmd = 'a' THEN 'INSERT'
        WHEN cmd = 'w' THEN 'UPDATE'
        WHEN cmd = 'd' THEN 'DELETE'
        WHEN cmd = '*' THEN 'ALL'
        ELSE cmd
    END as command_type
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN (
    'user_feedback', 'faq_categories', 'faqs', 'product_submissions',
    'site_content', 'contact_info', 'system_notifications', 'user_notification_reads'
)
ORDER BY tablename, policyname;

-- ========================================
-- 第十步：验证RLS状态
-- ========================================

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
    'user_feedback', 'faq_categories', 'faqs', 'product_submissions',
    'site_content', 'contact_info', 'system_notifications', 'user_notification_reads'
)
ORDER BY tablename;
