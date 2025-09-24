-- 修复表结构问题
-- 迁移ID: 20250103000002_fix_table_structure
-- 描述: 修复 tools 和 categories 表结构问题，确保表存在且结构正确

BEGIN;

-- 检查并创建 categories 表（如果不存在）
CREATE TABLE IF NOT EXISTS categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    color TEXT DEFAULT '#0078d4',
    parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 检查并创建 tools 表（如果不存在）
CREATE TABLE IF NOT EXISTS tools (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    url TEXT NOT NULL,
    icon TEXT,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    is_featured BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    click_count INTEGER DEFAULT 0,
    is_favorite BOOLEAN DEFAULT false,
    meta_title TEXT,
    meta_description TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- 创建工具标签关联表（如果不存在）
CREATE TABLE IF NOT EXISTS tool_tags (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tool_id UUID REFERENCES tools(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tool_id, tag_id)
);

-- 创建标签表（如果不存在）
CREATE TABLE IF NOT EXISTS tags (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    color TEXT DEFAULT '#0078d4',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 为 categories 表添加索引
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_sort_order ON categories(sort_order);
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON categories(is_active);

-- 为 tools 表添加索引
CREATE INDEX IF NOT EXISTS idx_tools_category_id ON tools(category_id);
CREATE INDEX IF NOT EXISTS idx_tools_status ON tools(status);
CREATE INDEX IF NOT EXISTS idx_tools_is_featured ON tools(is_featured);
CREATE INDEX IF NOT EXISTS idx_tools_click_count ON tools(click_count);
CREATE INDEX IF NOT EXISTS idx_tools_sort_order ON tools(sort_order);

-- 为 tool_tags 表添加索引
CREATE INDEX IF NOT EXISTS idx_tool_tags_tool_id ON tool_tags(tool_id);
CREATE INDEX IF NOT EXISTS idx_tool_tags_tag_id ON tool_tags(tag_id);

-- 启用 RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_tags ENABLE ROW LEVEL SECURITY;

-- 创建 RLS 策略
-- Categories 策略
DROP POLICY IF EXISTS "所有人可以查看分类" ON categories;
CREATE POLICY "所有人可以查看分类" ON categories
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "只有管理员可以管理分类" ON categories;
CREATE POLICY "只有管理员可以管理分类" ON categories
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin' OR auth.jwt() ->> 'role' = 'super_admin');

-- Tools 策略
DROP POLICY IF EXISTS "所有人可以查看活跃工具" ON tools;
CREATE POLICY "所有人可以查看活跃工具" ON tools
    FOR SELECT USING (status = 'active');

DROP POLICY IF EXISTS "用户可以看到自己的工具（包括非活跃）" ON tools;
CREATE POLICY "用户可以看到自己的工具（包括非活跃）" ON tools
    FOR SELECT USING (auth.uid() = created_by OR status = 'active');

DROP POLICY IF EXISTS "用户只能管理自己的工具" ON tools;
CREATE POLICY "用户只能管理自己的工具" ON tools
    FOR ALL USING (auth.uid() = created_by);

DROP POLICY IF EXISTS "管理员可以管理所有工具" ON tools;
CREATE POLICY "管理员可以管理所有工具" ON tools
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin' OR auth.jwt() ->> 'role' = 'super_admin');

-- Tags 策略
DROP POLICY IF EXISTS "所有人可以查看标签" ON tags;
CREATE POLICY "所有人可以查看标签" ON tags
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "只有管理员可以管理标签" ON tags;
CREATE POLICY "只有管理员可以管理标签" ON tags
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin' OR auth.jwt() ->> 'role' = 'super_admin');

-- Tool Tags 策略
DROP POLICY IF EXISTS "所有人可以查看工具标签关联" ON tool_tags;
CREATE POLICY "所有人可以查看工具标签关联" ON tool_tags
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "只有管理员可以管理工具标签关联" ON tool_tags;
CREATE POLICY "只有管理员可以管理工具标签关联" ON tool_tags
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin' OR auth.jwt() ->> 'role' = 'super_admin');

-- 创建更新时间触发器函数（如果不存在）
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为表添加更新时间触发器
DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at 
    BEFORE UPDATE ON categories 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tools_updated_at ON tools;
CREATE TRIGGER update_tools_updated_at 
    BEFORE UPDATE ON tools 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tags_updated_at ON tags;
CREATE TRIGGER update_tags_updated_at 
    BEFORE UPDATE ON tags 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 创建点击计数增加函数
CREATE OR REPLACE FUNCTION increment_click_count(tool_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE tools 
    SET click_count = click_count + 1,
        updated_at = NOW()
    WHERE id = tool_id;
END;
$$ LANGUAGE plpgsql;

-- 插入一些示例数据（如果表为空）
INSERT INTO categories (id, name, description, icon, color, sort_order, is_active) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', '开发工具', '编程开发相关工具', 'code', '#0078d4', 1, true),
    ('550e8400-e29b-41d4-a716-446655440002', '设计工具', 'UI/UX设计相关工具', 'palette', '#ff6b6b', 2, true),
    ('550e8400-e29b-41d4-a716-446655440003', 'AI工具', '人工智能相关工具', 'brain', '#4ecdc4', 3, true),
    ('550e8400-e29b-41d4-a716-446655440004', '效率工具', '提升工作效率的工具', 'zap', '#45b7d1', 4, true)
ON CONFLICT (id) DO NOTHING;

-- 插入一些示例工具数据（如果表为空）
INSERT INTO tools (id, name, description, url, category_id, is_featured, status, sort_order) VALUES
    ('660e8400-e29b-41d4-a716-446655440001', 'Vue.js', '渐进式JavaScript框架', 'https://vuejs.org', '550e8400-e29b-41d4-a716-446655440001', true, 'active', 1),
    ('660e8400-e29b-41d4-a716-446655440002', 'Figma', '协作界面设计工具', 'https://figma.com', '550e8400-e29b-41d4-a716-446655440002', true, 'active', 1),
    ('660e8400-e29b-41d4-a716-446655440003', 'ChatGPT', 'AI对话助手', 'https://chat.openai.com', '550e8400-e29b-41d4-a716-446655440003', true, 'active', 1),
    ('660e8400-e29b-41d4-a716-446655440004', 'Notion', '全能工作空间', 'https://notion.so', '550e8400-e29b-41d4-a716-446655440004', true, 'active', 1)
ON CONFLICT (id) DO NOTHING;

COMMIT;

-- 验证表结构
DO $$ 
DECLARE
    categories_count INTEGER;
    tools_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO categories_count FROM categories;
    SELECT COUNT(*) INTO tools_count FROM tools;
    
    RAISE NOTICE '表结构修复完成: categories表有%条记录, tools表有%条记录', categories_count, tools_count;
    
    -- 检查外键约束
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'tools_category_id_fkey' 
        AND table_name = 'tools'
    ) THEN
        RAISE NOTICE '警告: tools表的外键约束可能未正确创建';
    END IF;
    
EXCEPTION
    WHEN others THEN
        RAISE NOTICE '表结构修复过程中发生错误: %', SQLERRM;
        ROLLBACK;
        RAISE;
END $$;
