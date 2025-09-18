-- 分类表合并迁移
-- 将categories和product_categories表合并为统一的categories表
-- 迁移ID: 20250101000003_merge_categories
-- 描述: 合并重复的分类表结构，优化数据库设计

BEGIN;

-- 创建新的统一分类表，支持类型区分
CREATE TABLE unified_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    color TEXT DEFAULT '#0078d4',
    category_type TEXT NOT NULL CHECK (category_type IN ('tool', 'product')), -- 添加类型区分
    parent_id UUID REFERENCES unified_categories(id) ON DELETE SET NULL,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE unified_categories IS '统一分类表，支持工具和产品分类';
COMMENT ON COLUMN unified_categories.category_type IS '分类类型: tool-工具分类, product-产品分类';

-- 迁移工具分类数据
INSERT INTO unified_categories (id, name, description, icon, color, parent_id, sort_order, is_active, created_at, updated_at, category_type)
SELECT 
    id, 
    name, 
    description, 
    icon, 
    color, 
    parent_id, 
    sort_order, 
    is_active, 
    created_at, 
    updated_at,
    'tool'::TEXT
FROM categories;

-- 迁移产品分类数据
INSERT INTO unified_categories (id, name, description, icon, color, parent_id, sort_order, is_active, created_at, updated_at, category_type)
SELECT 
    id, 
    name, 
    description, 
    icon, 
    color, 
    parent_id, 
    sort_order, 
    is_active, 
    created_at, 
    updated_at,
    'product'::TEXT
FROM product_categories;

-- 更新工具表的外键引用
ALTER TABLE tools 
DROP CONSTRAINT tools_category_id_fkey,
ADD CONSTRAINT tools_category_id_fkey 
    FOREIGN KEY (category_id) 
    REFERENCES unified_categories(id) 
    ON DELETE SET NULL;

-- 更新产品表的外键引用
ALTER TABLE products 
DROP CONSTRAINT products_category_id_fkey,
ADD CONSTRAINT products_category_id_fkey 
    FOREIGN KEY (category_id) 
    REFERENCES unified_categories(id) 
    ON DELETE SET NULL;

-- 为统一分类表添加索引
CREATE INDEX idx_unified_categories_type ON unified_categories(category_type);
CREATE INDEX idx_unified_categories_parent_id ON unified_categories(parent_id);
CREATE INDEX idx_unified_categories_sort_order ON unified_categories(sort_order);

-- 为统一分类表启用RLS
ALTER TABLE unified_categories ENABLE ROW LEVEL SECURITY;

-- 统一分类表RLS策略
CREATE POLICY "所有人可以查看分类" ON unified_categories
    FOR SELECT USING (true);

CREATE POLICY "只有管理员可以管理分类" ON unified_categories
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin' OR auth.jwt() ->> 'role' = 'super_admin');

-- 添加更新时间触发器
CREATE TRIGGER update_unified_categories_updated_at 
    BEFORE UPDATE ON unified_categories 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 删除旧表（在确认数据迁移成功后）
DROP TABLE categories CASCADE;
DROP TABLE product_categories CASCADE;

-- 重命名新表为categories（可选，保持向后兼容性）
-- ALTER TABLE unified_categories RENAME TO categories;

COMMIT;

-- 数据验证和错误处理
DO $$ 
DECLARE
    tool_count INTEGER;
    product_count INTEGER;
    unified_count INTEGER;
BEGIN
    -- 验证数据迁移完整性
    SELECT COUNT(*) INTO tool_count FROM tools WHERE category_id IS NOT NULL;
    SELECT COUNT(*) INTO product_count FROM products WHERE category_id IS NOT NULL;
    SELECT COUNT(*) INTO unified_count FROM unified_categories;
    
    -- 检查迁移后的数据一致性
    IF (SELECT COUNT(*) FROM tools WHERE category_id IS NOT NULL AND category_id NOT IN (SELECT id FROM unified_categories)) > 0 THEN
        RAISE EXCEPTION '数据迁移错误: 存在无效的工具分类引用';
    END IF;
    
    IF (SELECT COUNT(*) FROM products WHERE category_id IS NOT NULL AND category_id NOT IN (SELECT id FROM unified_categories)) > 0 THEN
        RAISE EXCEPTION '数据迁移错误: 存在无效的产品分类引用';
    END IF;
    
    RAISE NOTICE '迁移完成: 工具分类数=%, 产品分类数=%, 统一分类总数=%', 
        (SELECT COUNT(*) FROM unified_categories WHERE category_type = 'tool'),
        (SELECT COUNT(*) FROM unified_categories WHERE category_type = 'product'),
        unified_count;
        
EXCEPTION
    WHEN others THEN
        RAISE NOTICE '分类表合并迁移失败: %', SQLERRM;
        ROLLBACK;
        RAISE;
END $$;