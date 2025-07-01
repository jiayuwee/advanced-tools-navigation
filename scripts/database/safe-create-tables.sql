-- 安全创建表脚本 - 分步执行，避免冲突

-- ========================================
-- 第一步：创建用户反馈表
-- ========================================
CREATE TABLE IF NOT EXISTS user_feedback (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    email TEXT NOT NULL,
    name TEXT,
    category feedback_category DEFAULT 'other',
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status feedback_status DEFAULT 'pending',
    priority INTEGER DEFAULT 3 CHECK (priority BETWEEN 1 AND 5),
    admin_response TEXT,
    admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    responded_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    attachments TEXT[] DEFAULT '{}'
);

-- ========================================
-- 第二步：创建FAQ分类表
-- ========================================
CREATE TABLE IF NOT EXISTS faq_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 第三步：创建FAQ表
-- ========================================
CREATE TABLE IF NOT EXISTS faqs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    category_id UUID REFERENCES faq_categories(id) ON DELETE SET NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    is_featured BOOLEAN DEFAULT false,
    view_count INTEGER DEFAULT 0,
    helpful_count INTEGER DEFAULT 0,
    not_helpful_count INTEGER DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 第四步：创建产品提交表
-- ========================================
CREATE TABLE IF NOT EXISTS product_submissions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    content TEXT,
    price DECIMAL(10,2) DEFAULT 0,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    status product_submission_status DEFAULT 'pending',
    image_url TEXT,
    url TEXT,
    tags TEXT[] DEFAULT '{}',
    admin_notes TEXT,
    reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 第五步：创建网站内容表
-- ========================================
CREATE TABLE IF NOT EXISTS site_content (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    key TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    content_type TEXT DEFAULT 'text',
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- ========================================
-- 第六步：创建联系信息表
-- ========================================
CREATE TABLE IF NOT EXISTS contact_info (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    type TEXT NOT NULL,
    label TEXT NOT NULL,
    value TEXT NOT NULL,
    icon TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 第七步：创建系统通知表
-- ========================================
CREATE TABLE IF NOT EXISTS system_notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    target_users TEXT[] DEFAULT '{}',
    is_global BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- ========================================
-- 第八步：创建用户通知阅读状态表
-- ========================================
CREATE TABLE IF NOT EXISTS user_notification_reads (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    notification_id UUID REFERENCES system_notifications(id) ON DELETE CASCADE,
    read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, notification_id)
);

-- ========================================
-- 第九步：启用RLS
-- ========================================
ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE faq_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notification_reads ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 第十步：创建索引
-- ========================================
CREATE INDEX IF NOT EXISTS idx_user_feedback_status ON user_feedback(status);
CREATE INDEX IF NOT EXISTS idx_user_feedback_category ON user_feedback(category);
CREATE INDEX IF NOT EXISTS idx_user_feedback_created_at ON user_feedback(created_at);
CREATE INDEX IF NOT EXISTS idx_user_feedback_user_id ON user_feedback(user_id);

CREATE INDEX IF NOT EXISTS idx_faqs_category_id ON faqs(category_id);
CREATE INDEX IF NOT EXISTS idx_faqs_is_active ON faqs(is_active);
CREATE INDEX IF NOT EXISTS idx_faqs_is_featured ON faqs(is_featured);

CREATE INDEX IF NOT EXISTS idx_product_submissions_status ON product_submissions(status);
CREATE INDEX IF NOT EXISTS idx_product_submissions_user_id ON product_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_product_submissions_category_id ON product_submissions(category_id);

CREATE INDEX IF NOT EXISTS idx_site_content_key ON site_content(key);
CREATE INDEX IF NOT EXISTS idx_site_content_is_published ON site_content(is_published);

CREATE INDEX IF NOT EXISTS idx_contact_info_type ON contact_info(type);
CREATE INDEX IF NOT EXISTS idx_contact_info_is_active ON contact_info(is_active);

CREATE INDEX IF NOT EXISTS idx_system_notifications_is_active ON system_notifications(is_active);
CREATE INDEX IF NOT EXISTS idx_system_notifications_expires_at ON system_notifications(expires_at);

CREATE INDEX IF NOT EXISTS idx_user_notification_reads_user_id ON user_notification_reads(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notification_reads_notification_id ON user_notification_reads(notification_id);

-- ========================================
-- 验证表创建
-- ========================================
SELECT 'user_feedback' as table_name, count(*) as row_count FROM user_feedback
UNION ALL
SELECT 'faq_categories' as table_name, count(*) as row_count FROM faq_categories
UNION ALL
SELECT 'faqs' as table_name, count(*) as row_count FROM faqs
UNION ALL
SELECT 'product_submissions' as table_name, count(*) as row_count FROM product_submissions
UNION ALL
SELECT 'site_content' as table_name, count(*) as row_count FROM site_content
UNION ALL
SELECT 'contact_info' as table_name, count(*) as row_count FROM contact_info
UNION ALL
SELECT 'system_notifications' as table_name, count(*) as row_count FROM system_notifications
UNION ALL
SELECT 'user_notification_reads' as table_name, count(*) as row_count FROM user_notification_reads;
