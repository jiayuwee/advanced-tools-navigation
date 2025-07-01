-- 插入初始数据脚本
-- 在表创建成功后执行

-- ========================================
-- 第一步：插入FAQ分类数据
-- ========================================

-- 先检查是否已有数据
DO $$
BEGIN
    -- 如果没有数据，则插入
    IF NOT EXISTS (SELECT 1 FROM faq_categories LIMIT 1) THEN
        INSERT INTO faq_categories (name, description, icon, sort_order) VALUES
        ('使用指南', '网站功能使用说明和操作指南', 'BookOpen', 1),
        ('账户问题', '注册、登录、密码等账户相关问题', 'User', 2),
        ('产品相关', '产品购买、下载、使用等问题', 'Package', 3),
        ('技术支持', '技术故障、兼容性等技术问题', 'Settings', 4),
        ('其他问题', '其他常见问题', 'HelpCircle', 5);
        
        RAISE NOTICE 'FAQ分类数据插入成功';
    ELSE
        RAISE NOTICE 'FAQ分类数据已存在，跳过插入';
    END IF;
END
$$;

-- ========================================
-- 第二步：插入FAQ数据
-- ========================================

DO $$
DECLARE
    guide_cat_id UUID;
    account_cat_id UUID;
    product_cat_id UUID;
BEGIN
    -- 获取分类ID
    SELECT id INTO guide_cat_id FROM faq_categories WHERE name = '使用指南';
    SELECT id INTO account_cat_id FROM faq_categories WHERE name = '账户问题';
    SELECT id INTO product_cat_id FROM faq_categories WHERE name = '产品相关';
    
    -- 如果没有FAQ数据，则插入
    IF NOT EXISTS (SELECT 1 FROM faqs LIMIT 1) THEN
        INSERT INTO faqs (category_id, question, answer, is_featured, sort_order) VALUES
        (guide_cat_id, '如何搜索工具？', '您可以使用页面顶部的搜索框输入关键词来搜索工具，也可以通过分类浏览来查找特定类型的工具。', true, 1),
        (guide_cat_id, '如何收藏工具？', '在工具详情页面点击收藏按钮即可收藏工具，收藏的工具会显示在您的个人中心。', true, 2),
        (account_cat_id, '如何注册账户？', '点击页面右上角的"注册"按钮，填写邮箱和密码即可完成注册。', false, 1),
        (account_cat_id, '忘记密码怎么办？', '在登录页面点击"忘记密码"，输入您的邮箱地址，我们会发送重置密码的链接到您的邮箱。', false, 2),
        (product_cat_id, '如何购买产品？', '浏览产品页面，选择您需要的产品，点击"立即购买"按钮，按照提示完成支付即可。', false, 1);
        
        RAISE NOTICE 'FAQ数据插入成功';
    ELSE
        RAISE NOTICE 'FAQ数据已存在，跳过插入';
    END IF;
END
$$;

-- ========================================
-- 第三步：插入联系信息数据
-- ========================================

DO $$
BEGIN
    -- 如果没有联系信息数据，则插入
    IF NOT EXISTS (SELECT 1 FROM contact_info LIMIT 1) THEN
        INSERT INTO contact_info (type, label, value, icon, sort_order) VALUES
        ('email', '邮箱联系', 'support@ramusi.cn', 'Mail', 1),
        ('phone', '电话联系', '+86 400-123-4567', 'Phone', 2),
        ('address', '公司地址', '北京市朝阳区科技园区', 'MapPin', 3),
        ('wechat', '微信客服', 'ramusi_support', 'MessageCircle', 4);
        
        RAISE NOTICE '联系信息数据插入成功';
    ELSE
        RAISE NOTICE '联系信息数据已存在，跳过插入';
    END IF;
END
$$;

-- ========================================
-- 第四步：插入网站内容数据
-- ========================================

DO $$
BEGIN
    -- 如果没有网站内容数据，则插入
    IF NOT EXISTS (SELECT 1 FROM site_content LIMIT 1) THEN
        INSERT INTO site_content (key, title, content, content_type) VALUES
        ('footer_about', '关于我们', 'Ramusi 是一个专业的工具导航平台，致力于为用户提供最优质的工具推荐和服务。', 'text'),
        ('footer_description', '网站描述', '发现最好的工具，提升您的工作效率', 'text'),
        ('contact_hours', '工作时间', '周一至周五 9:00-18:00', 'text'),
        ('support_response_time', '响应时间', '我们会在24小时内回复您的咨询', 'text');
        
        RAISE NOTICE '网站内容数据插入成功';
    ELSE
        RAISE NOTICE '网站内容数据已存在，跳过插入';
    END IF;
END
$$;

-- ========================================
-- 第五步：验证数据插入结果
-- ========================================

SELECT 
    'faq_categories' as table_name, 
    count(*) as row_count,
    string_agg(name, ', ') as sample_data
FROM faq_categories
UNION ALL
SELECT 
    'faqs' as table_name, 
    count(*) as row_count,
    string_agg(left(question, 20) || '...', ', ') as sample_data
FROM faqs
UNION ALL
SELECT 
    'contact_info' as table_name, 
    count(*) as row_count,
    string_agg(label, ', ') as sample_data
FROM contact_info
UNION ALL
SELECT 
    'site_content' as table_name, 
    count(*) as row_count,
    string_agg(key, ', ') as sample_data
FROM site_content;

-- ========================================
-- 第六步：显示详细的FAQ数据
-- ========================================

SELECT 
    fc.name as category_name,
    f.question,
    f.is_featured,
    f.sort_order
FROM faqs f
JOIN faq_categories fc ON f.category_id = fc.id
ORDER BY fc.sort_order, f.sort_order;
