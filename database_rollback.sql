-- 数据库回滚脚本 v1.0
-- 回滚支付系统相关表结构迁移
-- 执行前请确保已备份数据库
-- 警告：此操作将删除所有支付相关数据

-- 开始事务
BEGIN;

-- 记录回滚开始时间
DO $$
BEGIN
    RAISE NOTICE '开始执行支付系统回滚脚本，时间: %', NOW();
    RAISE WARNING '⚠️  此操作将删除所有支付相关数据，请确认已备份数据库';
END
$$;

-- 1. 删除 payments 表的 RLS 策略
DO $$
BEGIN
    -- 删除 RLS 策略
    DROP POLICY IF EXISTS "Users can view their own payments" ON payments;
    DROP POLICY IF EXISTS "Users can insert their own payments" ON payments;
    DROP POLICY IF EXISTS "Users can update their own payments" ON payments;
    
    RAISE NOTICE '✅ 已删除 payments 表的 RLS 策略';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ 删除 RLS 策略时出错: %', SQLERRM;
END
$$;

-- 2. 删除 payments 表的触发器
DO $$
BEGIN
    DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;
    RAISE NOTICE '✅ 已删除 payments 表的更新触发器';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ 删除触发器时出错: %', SQLERRM;
END
$$;

-- 3. 删除 payments 表的索引
DO $$
BEGIN
    DROP INDEX IF EXISTS idx_payments_order_id;
    DROP INDEX IF EXISTS idx_payments_status;
    DROP INDEX IF EXISTS idx_payments_method;
    DROP INDEX IF EXISTS idx_payments_transaction_id;
    DROP INDEX IF EXISTS idx_payments_created_at;
    DROP INDEX IF EXISTS idx_payments_expires_at;
    DROP INDEX IF EXISTS idx_payments_external_ref;
    DROP INDEX IF EXISTS idx_payments_data_gin;
    
    RAISE NOTICE '✅ 已删除 payments 表的所有索引';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ 删除索引时出错: %', SQLERRM;
END
$$;

-- 4. 删除 payments 表
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payments' AND table_schema = 'public') THEN
        DROP TABLE payments CASCADE;
        RAISE NOTICE '✅ 已删除 payments 表';
    ELSE
        RAISE NOTICE 'ℹ️  payments 表不存在，跳过删除';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ 删除 payments 表时出错: %', SQLERRM;
END
$$;

-- 5. 删除 orders 表的新增字段索引
DO $$
BEGIN
    DROP INDEX IF EXISTS idx_orders_billing_address;
    DROP INDEX IF EXISTS idx_orders_payment_id;
    
    RAISE NOTICE '✅ 已删除 orders 表新增字段的索引';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ 删除 orders 表索引时出错: %', SQLERRM;
END
$$;

-- 6. 删除 orders 表的新增字段
DO $$
BEGIN
    -- 删除 billing_address 字段
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'billing_address') THEN
        ALTER TABLE orders DROP COLUMN billing_address;
        RAISE NOTICE '✅ 已删除 orders.billing_address 字段';
    ELSE
        RAISE NOTICE 'ℹ️  orders.billing_address 字段不存在，跳过删除';
    END IF;
    
    -- 删除 payment_id 字段
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'payment_id') THEN
        ALTER TABLE orders DROP COLUMN payment_id;
        RAISE NOTICE '✅ 已删除 orders.payment_id 字段';
    ELSE
        RAISE NOTICE 'ℹ️  orders.payment_id 字段不存在，跳过删除';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ 删除 orders 表字段时出错: %', SQLERRM;
END
$$;

-- 7. 验证回滚结果
DO $$
DECLARE
    orders_columns_count INTEGER;
    payments_table_exists BOOLEAN;
BEGIN
    -- 检查 orders 表字段是否已删除
    SELECT COUNT(*) INTO orders_columns_count
    FROM information_schema.columns 
    WHERE table_name = 'orders' 
        AND column_name IN ('billing_address', 'payment_id');
    
    -- 检查 payments 表是否已删除
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'payments' AND table_schema = 'public'
    ) INTO payments_table_exists;
    
    IF orders_columns_count = 0 AND NOT payments_table_exists THEN
        RAISE NOTICE '✅ 回滚验证成功：';
        RAISE NOTICE '  - orders 表字段删除状态: 已删除 % 个字段', 2;
        RAISE NOTICE '  - payments 表删除状态: %', CASE WHEN NOT payments_table_exists THEN '已删除' ELSE '删除失败' END;
        
        -- 提交事务
        COMMIT;
        RAISE NOTICE '📦 支付系统回滚完成，时间: %', NOW();
    ELSE
        RAISE EXCEPTION '❌ 回滚验证失败，请检查脚本执行情况';
    END IF;
END
$$;

SELECT 'Rollback completed successfully' AS status,
       NOW() AS completed_at,
       'Payment system rollback completed' AS description;