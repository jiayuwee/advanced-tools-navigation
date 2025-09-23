-- 性能优化迁移：添加索引和进一步优化RLS策略
-- 迁移ID: 20250103000001_add_performance_indexes
-- 描述: 为常用查询字段添加索引，提升查询性能

BEGIN;

-- =============================================================================
-- 1. 为常用查询字段添加索引
-- =============================================================================

-- 工具表索引
CREATE INDEX IF NOT EXISTS idx_tools_category_id ON tools(category_id);
CREATE INDEX IF NOT EXISTS idx_tools_status ON tools(status);
CREATE INDEX IF NOT EXISTS idx_tools_is_featured ON tools(is_featured);
CREATE INDEX IF NOT EXISTS idx_tools_click_count ON tools(click_count DESC);
CREATE INDEX IF NOT EXISTS idx_tools_created_at ON tools(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tools_name_gin ON tools USING gin(to_tsvector('chinese', name));
CREATE INDEX IF NOT EXISTS idx_tools_description_gin ON tools USING gin(to_tsvector('chinese', description));

-- 产品表索引
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_name_gin ON products USING gin(to_tsvector('chinese', name));
CREATE INDEX IF NOT EXISTS idx_products_description_gin ON products USING gin(to_tsvector('chinese', description));

-- 用户资料表索引
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_created_at ON user_profiles(created_at DESC);

-- 收藏表索引
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_tool_id ON favorites(tool_id);
CREATE INDEX IF NOT EXISTS idx_favorites_product_id ON favorites(product_id);
CREATE INDEX IF NOT EXISTS idx_favorites_created_at ON favorites(created_at DESC);

-- 订单表索引
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_total_amount ON orders(total_amount);

-- 订单项表索引
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- 支付表索引
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at DESC);

-- 评价表索引
CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_user_id ON product_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_rating ON product_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_product_reviews_created_at ON product_reviews(created_at DESC);

-- 反馈表索引
CREATE INDEX IF NOT EXISTS idx_user_feedback_user_id ON user_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_user_feedback_type ON user_feedback(type);
CREATE INDEX IF NOT EXISTS idx_user_feedback_status ON user_feedback(status);
CREATE INDEX IF NOT EXISTS idx_user_feedback_created_at ON user_feedback(created_at DESC);

-- 通知表索引
CREATE INDEX IF NOT EXISTS idx_system_notifications_is_active ON system_notifications(is_active);
CREATE INDEX IF NOT EXISTS idx_system_notifications_expires_at ON system_notifications(expires_at);
CREATE INDEX IF NOT EXISTS idx_system_notifications_created_at ON system_notifications(created_at DESC);

-- 通知阅读状态表索引
CREATE INDEX IF NOT EXISTS idx_user_notification_reads_user_id ON user_notification_reads(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notification_reads_notification_id ON user_notification_reads(notification_id);

-- 统计表索引
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_entity_id ON analytics(entity_id);
CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics(created_at DESC);

-- =============================================================================
-- 2. 复合索引优化
-- =============================================================================

-- 工具复合索引
CREATE INDEX IF NOT EXISTS idx_tools_status_featured ON tools(status, is_featured);
CREATE INDEX IF NOT EXISTS idx_tools_category_status ON tools(category_id, status);
CREATE INDEX IF NOT EXISTS idx_tools_featured_clicks ON tools(is_featured, click_count DESC);

-- 产品复合索引
CREATE INDEX IF NOT EXISTS idx_products_status_featured ON products(status, is_featured);
CREATE INDEX IF NOT EXISTS idx_products_category_status ON products(category_id, status);
CREATE INDEX IF NOT EXISTS idx_products_price_range ON products(price, status);

-- 订单复合索引
CREATE INDEX IF NOT EXISTS idx_orders_user_status ON orders(user_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_status_created ON orders(status, created_at DESC);

-- 评价复合索引
CREATE INDEX IF NOT EXISTS idx_reviews_product_rating ON product_reviews(product_id, rating);
CREATE INDEX IF NOT EXISTS idx_reviews_user_created ON product_reviews(user_id, created_at DESC);

-- =============================================================================
-- 3. 全文搜索索引优化
-- =============================================================================

-- 确保 pg_trgm 扩展已安装（用于相似度搜索）
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 工具相似度索引
CREATE INDEX IF NOT EXISTS idx_tools_name_trgm ON tools USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_tools_description_trgm ON tools USING gin(description gin_trgm_ops);

-- 产品相似度索引
CREATE INDEX IF NOT EXISTS idx_products_name_trgm ON products USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_products_description_trgm ON products USING gin(description gin_trgm_ops);

-- =============================================================================
-- 4. 部分索引优化
-- =============================================================================

-- 只为活跃工具创建索引
CREATE INDEX IF NOT EXISTS idx_tools_active_featured ON tools(is_featured) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_tools_active_clicks ON tools(click_count DESC) WHERE status = 'active';

-- 只为活跃产品创建索引
CREATE INDEX IF NOT EXISTS idx_products_active_featured ON products(is_featured) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_products_active_price ON products(price) WHERE status = 'active';

-- 只为未过期通知创建索引
CREATE INDEX IF NOT EXISTS idx_notifications_active ON system_notifications(is_active, created_at DESC)
WHERE is_active = true AND (expires_at IS NULL OR expires_at > NOW());

-- =============================================================================
-- 5. 外键约束优化（如果缺失）
-- =============================================================================

-- 确保外键约束存在（如果不存在）
DO $$
BEGIN
    -- 检查并添加外键约束（如果不存在）
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_tools_category_id'
        AND table_name = 'tools'
    ) THEN
        ALTER TABLE tools ADD CONSTRAINT fk_tools_category_id
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_products_category_id'
        AND table_name = 'products'
    ) THEN
        ALTER TABLE products ADD CONSTRAINT fk_products_category_id
        FOREIGN KEY (category_id) REFERENCES product_categories(id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_orders_user_id'
        AND table_name = 'orders'
    ) THEN
        ALTER TABLE orders ADD CONSTRAINT fk_orders_user_id
        FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_order_items_order_id'
        AND table_name = 'order_items'
    ) THEN
        ALTER TABLE order_items ADD CONSTRAINT fk_order_items_order_id
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_order_items_product_id'
        AND table_name = 'order_items'
    ) THEN
        ALTER TABLE order_items ADD CONSTRAINT fk_order_items_product_id
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_payments_order_id'
        AND table_name = 'payments'
    ) THEN
        ALTER TABLE payments ADD CONSTRAINT fk_payments_order_id
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_product_reviews_product_id'
        AND table_name = 'product_reviews'
    ) THEN
        ALTER TABLE product_reviews ADD CONSTRAINT fk_product_reviews_product_id
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_product_reviews_user_id'
        AND table_name = 'product_reviews'
    ) THEN
        ALTER TABLE product_reviews ADD CONSTRAINT fk_product_reviews_user_id
        FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_favorites_user_id'
        AND table_name = 'favorites'
    ) THEN
        ALTER TABLE favorites ADD CONSTRAINT fk_favorites_user_id
        FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_favorites_tool_id'
        AND table_name = 'favorites'
    ) THEN
        ALTER TABLE favorites ADD CONSTRAINT fk_favorites_tool_id
        FOREIGN KEY (tool_id) REFERENCES tools(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_favorites_product_id'
        AND table_name = 'favorites'
    ) THEN
        ALTER TABLE favorites ADD CONSTRAINT fk_favorites_product_id
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;
    END IF;
END $$;

-- =============================================================================
-- 6. 验证索引创建结果
-- =============================================================================

DO $$
DECLARE
    index_count INTEGER;
BEGIN
    -- 统计创建的索引数量
    SELECT COUNT(*) INTO index_count
    FROM pg_indexes
    WHERE schemaname = 'public'
    AND indexname LIKE 'idx_%';

    RAISE NOTICE '✅ 已创建 % 个性能索引', index_count;

    -- 检查关键索引是否存在
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_tools_name_gin') THEN
        RAISE WARNING '警告: 工具名称全文索引未创建';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_products_name_gin') THEN
        RAISE WARNING '警告: 产品名称全文索引未创建';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_tools_status_featured') THEN
        RAISE WARNING '警告: 工具复合索引未创建';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_products_status_featured') THEN
        RAISE WARNING '警告: 产品复合索引未创建';
    END IF;
END $$;

COMMIT;

-- 回滚说明：如果需要回滚此迁移，请运行以下 SQL
/*
-- 回滚脚本
-- 删除所有创建的索引
DROP INDEX IF EXISTS idx_tools_category_id;
DROP INDEX IF EXISTS idx_tools_status;
DROP INDEX IF EXISTS idx_tools_is_featured;
DROP INDEX IF EXISTS idx_tools_click_count;
DROP INDEX IF EXISTS idx_tools_created_at;
DROP INDEX IF EXISTS idx_tools_name_gin;
DROP INDEX IF EXISTS idx_tools_description_gin;
DROP INDEX IF EXISTS idx_products_category_id;
DROP INDEX IF EXISTS idx_products_status;
DROP INDEX IF EXISTS idx_products_is_featured;
DROP INDEX IF EXISTS idx_products_price;
DROP INDEX IF EXISTS idx_products_created_at;
DROP INDEX IF EXISTS idx_products_name_gin;
DROP INDEX IF EXISTS idx_products_description_gin;
DROP INDEX IF EXISTS idx_user_profiles_email;
DROP INDEX IF EXISTS idx_user_profiles_role;
DROP INDEX IF EXISTS idx_user_profiles_created_at;
DROP INDEX IF EXISTS idx_favorites_user_id;
DROP INDEX IF EXISTS idx_favorites_tool_id;
DROP INDEX IF EXISTS idx_favorites_product_id;
DROP INDEX IF EXISTS idx_favorites_created_at;
DROP INDEX IF EXISTS idx_orders_user_id;
DROP INDEX IF EXISTS idx_orders_status;
DROP INDEX IF EXISTS idx_orders_created_at;
DROP INDEX IF EXISTS idx_orders_total_amount;
DROP INDEX IF EXISTS idx_order_items_order_id;
DROP INDEX IF EXISTS idx_order_items_product_id;
DROP INDEX IF EXISTS idx_payments_order_id;
DROP INDEX IF EXISTS idx_payments_status;
DROP INDEX IF EXISTS idx_payments_created_at;
DROP INDEX IF EXISTS idx_product_reviews_product_id;
DROP INDEX IF EXISTS idx_product_reviews_user_id;
DROP INDEX IF EXISTS idx_product_reviews_rating;
DROP INDEX IF EXISTS idx_product_reviews_created_at;
DROP INDEX IF EXISTS idx_user_feedback_user_id;
DROP INDEX IF EXISTS idx_user_feedback_type;
DROP INDEX IF EXISTS idx_user_feedback_status;
DROP INDEX IF EXISTS idx_user_feedback_created_at;
DROP INDEX IF EXISTS idx_system_notifications_is_active;
DROP INDEX IF EXISTS idx_system_notifications_expires_at;
DROP INDEX IF EXISTS idx_system_notifications_created_at;
DROP INDEX IF EXISTS idx_user_notification_reads_user_id;
DROP INDEX IF EXISTS idx_user_notification_reads_notification_id;
DROP INDEX IF EXISTS idx_analytics_event_type;
DROP INDEX IF EXISTS idx_analytics_entity_id;
DROP INDEX IF EXISTS idx_analytics_user_id;
DROP INDEX IF EXISTS idx_analytics_created_at;
-- 复合索引
DROP INDEX IF EXISTS idx_tools_status_featured;
DROP INDEX IF EXISTS idx_tools_category_status;
DROP INDEX IF EXISTS idx_tools_featured_clicks;
DROP INDEX IF EXISTS idx_products_status_featured;
DROP INDEX IF EXISTS idx_products_category_status;
DROP INDEX IF EXISTS idx_products_price_range;
DROP INDEX IF EXISTS idx_orders_user_status;
DROP INDEX IF EXISTS idx_orders_status_created;
DROP INDEX IF EXISTS idx_reviews_product_rating;
DROP INDEX IF EXISTS idx_reviews_user_created;
-- 相似度索引
DROP INDEX IF EXISTS idx_tools_name_trgm;
DROP INDEX IF EXISTS idx_tools_description_trgm;
DROP INDEX IF EXISTS idx_products_name_trgm;
DROP INDEX IF EXISTS idx_products_description_trgm;
-- 部分索引
DROP INDEX IF EXISTS idx_tools_active_featured;
DROP INDEX IF EXISTS idx_tools_active_clicks;
DROP INDEX IF EXISTS idx_products_active_featured;
DROP INDEX IF EXISTS idx_products_active_price;
DROP INDEX IF EXISTS idx_notifications_active;
*/
