-- 行级安全策略 (Row Level Security)

-- 启用 RLS
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

-- 用户资料策略
CREATE POLICY "用户可以查看所有公开资料" ON user_profiles
    FOR SELECT USING (true);

CREATE POLICY "用户可以更新自己的资料" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "用户可以插入自己的资料" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 分类策略（公开读取）
CREATE POLICY "所有人可以查看活跃分类" ON categories
    FOR SELECT USING (is_active = true);

CREATE POLICY "管理员可以管理分类" ON categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- 产品分类策略
CREATE POLICY "所有人可以查看活跃产品分类" ON product_categories
    FOR SELECT USING (is_active = true);

CREATE POLICY "管理员可以管理产品分类" ON product_categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- 工具策略
CREATE POLICY "所有人可以查看活跃工具" ON tools
    FOR SELECT USING (status = 'active');

CREATE POLICY "管理员可以管理所有工具" ON tools
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "用户可以查看自己创建的工具" ON tools
    FOR SELECT USING (created_by = auth.uid());

-- 产品策略
CREATE POLICY "所有人可以查看活跃产品" ON products
    FOR SELECT USING (status = 'active');

CREATE POLICY "管理员可以管理所有产品" ON products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "用户可以查看自己创建的产品" ON products
    FOR SELECT USING (created_by = auth.uid());

-- 标签策略
CREATE POLICY "所有人可以查看标签" ON tags
    FOR SELECT USING (true);

CREATE POLICY "管理员可以管理标签" ON tags
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- 工具标签关联策略
CREATE POLICY "所有人可以查看工具标签" ON tool_tags
    FOR SELECT USING (true);

CREATE POLICY "管理员可以管理工具标签" ON tool_tags
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- 收藏策略
CREATE POLICY "用户可以查看自己的收藏" ON favorites
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "用户可以管理自己的收藏" ON favorites
    FOR ALL USING (user_id = auth.uid());

-- 订单策略
CREATE POLICY "用户可以查看自己的订单" ON orders
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "用户可以创建订单" ON orders
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "用户可以更新自己的待支付订单" ON orders
    FOR UPDATE USING (
        user_id = auth.uid() 
        AND status = 'pending'
    );

CREATE POLICY "管理员可以查看所有订单" ON orders
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "管理员可以更新订单状态" ON orders
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- 订单项策略
CREATE POLICY "用户可以查看自己订单的订单项" ON order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id 
            AND orders.user_id = auth.uid()
        )
    );

CREATE POLICY "用户可以创建订单项" ON order_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id 
            AND orders.user_id = auth.uid()
            AND orders.status = 'pending'
        )
    );

CREATE POLICY "管理员可以查看所有订单项" ON order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- 支付策略
CREATE POLICY "用户可以查看自己订单的支付信息" ON payments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = payments.order_id 
            AND orders.user_id = auth.uid()
        )
    );

CREATE POLICY "系统可以创建支付记录" ON payments
    FOR INSERT WITH CHECK (true);

CREATE POLICY "系统可以更新支付状态" ON payments
    FOR UPDATE USING (true);

CREATE POLICY "管理员可以查看所有支付信息" ON payments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- 产品评论策略
CREATE POLICY "所有人可以查看已验证的评论" ON product_reviews
    FOR SELECT USING (is_verified = true);

CREATE POLICY "用户可以查看自己的评论" ON product_reviews
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "用户可以创建评论" ON product_reviews
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "用户可以更新自己的评论" ON product_reviews
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "用户可以删除自己的评论" ON product_reviews
    FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "管理员可以管理所有评论" ON product_reviews
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- 分析数据策略
CREATE POLICY "系统可以插入分析数据" ON analytics
    FOR INSERT WITH CHECK (true);

CREATE POLICY "管理员可以查看分析数据" ON analytics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- 创建函数：检查用户是否为管理员
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'super_admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建函数：获取当前用户角色
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role 
    FROM user_profiles 
    WHERE id = auth.uid();
    
    RETURN COALESCE(user_role, 'user');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建函数：更新产品评分
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
    -- 更新产品的平均评分和评论总数
    UPDATE products SET
        average_rating = (
            SELECT ROUND(AVG(rating)::numeric, 2)
            FROM product_reviews 
            WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
            AND is_verified = true
        ),
        total_reviews = (
            SELECT COUNT(*)
            FROM product_reviews 
            WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
            AND is_verified = true
        )
    WHERE id = COALESCE(NEW.product_id, OLD.product_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 创建触发器：自动更新产品评分
CREATE TRIGGER update_product_rating_trigger
    AFTER INSERT OR UPDATE OR DELETE ON product_reviews
    FOR EACH ROW EXECUTE FUNCTION update_product_rating();
