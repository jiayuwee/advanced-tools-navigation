-- 数据库架构修复和改进迁移
-- 修复安全漏洞、优化性能、改进设计
-- 迁移ID: 20250101000002_fix_schema_issues
-- 描述: 添加RLS策略、性能索引、增强注释

BEGIN;

-- 启用所有表的行级安全 (RLS)
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

-- 用户资料表RLS策略
COMMENT ON COLUMN user_profiles.id IS '用户ID，引用auth.users表';
COMMENT ON COLUMN user_profiles.role IS '用户角色: user, admin, super_admin';
CREATE POLICY "用户只能查看自己的资料" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "用户只能更新自己的资料" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "管理员可以管理所有用户" ON user_profiles
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin' OR auth.jwt() ->> 'role' = 'super_admin');

-- 分类表RLS策略
CREATE POLICY "所有人可以查看分类" ON categories
    FOR SELECT USING (true);

CREATE POLICY "只有管理员可以管理分类" ON categories
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin' OR auth.jwt() ->> 'role' = 'super_admin');

CREATE POLICY "所有人可以查看产品分类" ON product_categories
    FOR SELECT USING (true);

CREATE POLICY "只有管理员可以管理产品分类" ON product_categories
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin' OR auth.jwt() ->> 'role' = 'super_admin');

-- 工具表RLS策略
CREATE POLICY "所有人可以查看活跃工具" ON tools
    FOR SELECT USING (status = 'active'::tool_status);

CREATE POLICY "用户可以看到自己的工具（包括非活跃）" ON tools
    FOR SELECT USING (auth.uid() = created_by OR status = 'active'::tool_status);

CREATE POLICY "用户只能管理自己的工具" ON tools
    FOR ALL USING (auth.uid() = created_by);

CREATE POLICY "管理员可以管理所有工具" ON tools
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin' OR auth.jwt() ->> 'role' = 'super_admin');

-- 产品表RLS策略
CREATE POLICY "所有人可以查看活跃产品" ON products
    FOR SELECT USING (status = 'active'::product_status);

CREATE POLICY "用户可以看到自己的产品（包括非活跃）" ON products
    FOR SELECT USING (auth.uid() = created_by OR status = 'active'::product_status);

CREATE POLICY "用户只能管理自己的产品" ON products
    FOR ALL USING (auth.uid() = created_by);

CREATE POLICY "管理员可以管理所有产品" ON products
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin' OR auth.jwt() ->> 'role' = 'super_admin');

-- 标签表RLS策略
CREATE POLICY "所有人可以查看标签" ON tags
    FOR SELECT USING (true);

CREATE POLICY "只有管理员可以管理标签" ON tags
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin' OR auth.jwt() ->> 'role' = 'super_admin');

-- 工具标签关联表RLS策略
CREATE POLICY "所有人可以查看工具标签关联" ON tool_tags
    FOR SELECT USING (true);

CREATE POLICY "只有管理员可以管理工具标签关联" ON tool_tags
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin' OR auth.jwt() ->> 'role' = 'super_admin');

-- 收藏表RLS策略
CREATE POLICY "用户只能查看和管理自己的收藏" ON favorites
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "管理员可以查看所有收藏" ON favorites
    FOR SELECT USING (auth.jwt() ->> 'role' = 'admin' OR auth.jwt() ->> 'role' = 'super_admin');

-- 订单表RLS策略
CREATE POLICY "用户只能查看和管理自己的订单" ON orders
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "管理员可以管理所有订单" ON orders
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin' OR auth.jwt() ->> 'role' = 'super_admin');

-- 订单项表RLS策略
CREATE POLICY "用户只能查看自己订单的订单项" ON order_items
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
    ));

CREATE POLICY "管理员可以管理所有订单项" ON order_items
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin' OR auth.jwt() ->> 'role' = 'super_admin');

-- 支付表RLS策略
CREATE POLICY "用户只能查看自己订单的支付记录" ON payments
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM orders WHERE orders.id = payments.order_id AND orders.user_id = auth.uid()
    ));

CREATE POLICY "管理员可以管理所有支付记录" ON payments
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin' OR auth.jwt() ->> 'role' = 'super_admin');

-- 评论表RLS策略
CREATE POLICY "所有人可以查看产品评论" ON product_reviews
    FOR SELECT USING (true);

CREATE POLICY "用户只能管理自己的评论" ON product_reviews
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "管理员可以管理所有评论" ON product_reviews
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin' OR auth.jwt() ->> 'role' = 'super_admin');

-- 分析数据表RLS策略
CREATE POLICY "只有管理员可以查看分析数据" ON analytics
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin' OR auth.jwt() ->> 'role' = 'super_admin');

-- 为数组字段添加GIN索引
CREATE INDEX IF NOT EXISTS idx_products_images_gin ON products USING GIN (images);
COMMENT ON INDEX idx_products_images_gin IS '产品图片数组的GIN索引，支持数组操作查询';

CREATE INDEX IF NOT EXISTS idx_products_features_gin ON products USING GIN (features);
COMMENT ON INDEX idx_products_features_gin IS '产品特性数组的GIN索引，支持数组操作查询';

-- 为JSONB字段添加索引
CREATE INDEX IF NOT EXISTS idx_analytics_event_data_gin ON analytics USING GIN (event_data);
COMMENT ON INDEX idx_analytics_event_data_gin IS '分析事件数据的GIN索引，支持JSONB查询';

-- 添加常用复合索引
CREATE INDEX IF NOT EXISTS idx_tools_category_status ON tools(category_id, status);
COMMENT ON INDEX idx_tools_category_status IS '工具表按分类和状态的复合索引';

CREATE INDEX IF NOT EXISTS idx_products_category_status ON products(category_id, status);
COMMENT ON INDEX idx_products_category_status IS '产品表按分类和状态的复合索引';

CREATE INDEX IF NOT EXISTS idx_products_price_status ON products(price, status);
COMMENT ON INDEX idx_products_price_status IS '产品表按价格和状态的复合索引';

CREATE INDEX IF NOT EXISTS idx_orders_user_status ON orders(user_id, status);
COMMENT ON INDEX idx_orders_user_status IS '订单表按用户和状态的复合索引';

-- 添加字段注释
COMMENT ON COLUMN products.images IS '产品图片URL数组';
COMMENT ON COLUMN products.features IS '产品特性描述数组';
COMMENT ON COLUMN analytics.event_data IS '事件详细数据，JSONB格式';
COMMENT ON COLUMN user_profiles.email_verified IS '邮箱验证状态';
COMMENT ON COLUMN products.average_rating IS '产品平均评分（1-5分）';
COMMENT ON COLUMN products.total_reviews IS '产品评论总数';

COMMIT;

-- 错误处理：如果迁移失败，记录错误信息
DO $$ 
BEGIN
    -- 检查RLS是否成功启用
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'user_profiles' AND rowsecurity = true
    ) THEN
        RAISE NOTICE '警告: user_profiles表RLS启用可能失败';
    END IF;
    
    -- 检查索引是否创建成功
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_products_images_gin'
    ) THEN
        RAISE NOTICE '警告: 产品图片数组索引创建可能失败';
    END IF;
    
EXCEPTION
    WHEN others THEN
        RAISE NOTICE '迁移执行过程中发生错误: %', SQLERRM;
        ROLLBACK;
        RAISE;
END $$;