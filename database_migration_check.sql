-- 数据库迁移状态检查脚本
-- 用于验证支付系统相关表结构的迁移状态

-- 显示检查开始信息
SELECT '🔍 开始检查支付系统数据库迁移状态...' AS message;

-- 1. 检查 orders 表基础结构
SELECT 
    '📋 Orders 表基础信息' AS section,
    COUNT(*) AS total_columns,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ 存在' 
        ELSE '❌ 不存在' 
    END AS table_status
FROM information_schema.columns 
WHERE table_name = 'orders' AND table_schema = 'public';

-- 2. 检查 orders 表新增字段
SELECT 
    '🆕 Orders 表新增字段检查' AS section,
    column_name,
    data_type,
    is_nullable,
    CASE 
        WHEN column_name IN ('billing_address', 'payment_id') THEN '✅ 已迁移'
        ELSE '⚠️  其他字段'
    END AS migration_status
FROM information_schema.columns 
WHERE table_name = 'orders' 
    AND table_schema = 'public'
    AND column_name IN ('billing_address', 'payment_id', 'id', 'user_id', 'status')
ORDER BY 
    CASE 
        WHEN column_name = 'id' THEN 1
        WHEN column_name = 'user_id' THEN 2
        WHEN column_name = 'status' THEN 3
        WHEN column_name = 'billing_address' THEN 4
        WHEN column_name = 'payment_id' THEN 5
        ELSE 6
    END;

-- 3. 检查 payments 表结构
SELECT 
    '💳 Payments 表结构检查' AS section,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payments' AND table_schema = 'public')
        THEN '✅ 表已创建'
        ELSE '❌ 表不存在'
    END AS table_status,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'payments' AND table_schema = 'public') AS column_count;

-- 4. 检查 payments 表详细字段
SELECT 
    '📊 Payments 表字段详情' AS section,
    column_name,
    data_type,
    is_nullable,
    column_default,
    CASE 
        WHEN column_name IN ('id', 'order_id', 'payment_method', 'payment_status', 'amount', 'currency') THEN '🔥 核心字段'
        WHEN column_name IN ('transaction_id', 'external_reference', 'payment_data') THEN '🔗 关联字段'
        WHEN column_name IN ('failure_reason', 'refund_amount', 'refunded_at', 'expires_at') THEN '🛡️ 扩展字段'
        WHEN column_name IN ('created_at', 'updated_at') THEN '⏰ 时间字段'
        ELSE '📝 其他字段'
    END AS field_category
FROM information_schema.columns 
WHERE table_name = 'payments' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. 检查表约束
SELECT 
    '🔒 表约束检查' AS section,
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    CASE 
        WHEN tc.constraint_type = 'PRIMARY KEY' THEN '🔑 主键'
        WHEN tc.constraint_type = 'FOREIGN KEY' THEN '🔗 外键'
        WHEN tc.constraint_type = 'CHECK' THEN '✅ 检查约束'
        WHEN tc.constraint_type = 'UNIQUE' THEN '🎯 唯一约束'
        ELSE '📋 其他约束'
    END AS constraint_category
FROM information_schema.table_constraints tc
WHERE tc.table_name IN ('orders', 'payments') 
    AND tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_type;

-- 6. 检查索引状态
SELECT 
    '📈 索引状态检查' AS section,
    schemaname,
    tablename,
    indexname,
    CASE 
        WHEN indexname LIKE '%_pkey' THEN '🔑 主键索引'
        WHEN indexname LIKE 'idx_payments_%' THEN '💳 支付索引'
        WHEN indexname LIKE 'idx_orders_%' THEN '📋 订单索引'
        ELSE '📊 其他索引'
    END AS index_category
FROM pg_indexes 
WHERE tablename IN ('orders', 'payments')
    AND schemaname = 'public'
ORDER BY tablename, indexname;

-- 7. 检查 RLS 策略
SELECT 
    '🛡️ 行级安全策略检查' AS section,
    schemaname,
    tablename,
    policyname,
    CASE 
        WHEN cmd = 'SELECT' THEN '👁️ 查看权限'
        WHEN cmd = 'INSERT' THEN '➕ 插入权限'
        WHEN cmd = 'UPDATE' THEN '✏️ 更新权限'
        WHEN cmd = 'DELETE' THEN '🗑️ 删除权限'
        ELSE '📋 其他权限'
    END AS policy_type
FROM pg_policies 
WHERE tablename IN ('orders', 'payments')
    AND schemaname = 'public'
ORDER BY tablename, policyname;

-- 8. 检查触发器
SELECT 
    '⚡ 触发器检查' AS section,
    event_object_table AS table_name,
    trigger_name,
    event_manipulation AS trigger_event,
    action_timing,
    CASE 
        WHEN trigger_name LIKE '%updated_at%' THEN '⏰ 时间戳更新'
        ELSE '🔧 其他触发器'
    END AS trigger_category
FROM information_schema.triggers 
WHERE event_object_table IN ('orders', 'payments')
    AND trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- 9. 迁移状态总结
WITH migration_summary AS (
    SELECT 
        'orders_new_fields' AS item,
        (SELECT COUNT(*) FROM information_schema.columns 
         WHERE table_name = 'orders' AND column_name IN ('billing_address', 'payment_id')) AS actual_count,
        2 AS expected_count
    UNION ALL
    SELECT 
        'payments_table' AS item,
        (SELECT COUNT(*) FROM information_schema.tables 
         WHERE table_name = 'payments' AND table_schema = 'public') AS actual_count,
        1 AS expected_count
    UNION ALL
    SELECT 
        'payments_policies' AS item,
        (SELECT COUNT(*) FROM pg_policies 
         WHERE tablename = 'payments' AND schemaname = 'public') AS actual_count,
        3 AS expected_count
)
SELECT 
    '📊 迁移状态总结' AS section,
    item,
    actual_count,
    expected_count,
    CASE 
        WHEN actual_count = expected_count THEN '✅ 完成'
        WHEN actual_count > 0 AND actual_count < expected_count THEN '⚠️ 部分完成'
        ELSE '❌ 未完成'
    END AS migration_status,
    ROUND((actual_count::DECIMAL / expected_count * 100), 1) || '%' AS completion_percentage
FROM migration_summary
ORDER BY item;

-- 最终状态
SELECT 
    '🎯 最终检查结果' AS section,
    NOW() AS check_time,
    CASE 
        WHEN (
            SELECT COUNT(*) FROM information_schema.columns 
            WHERE table_name = 'orders' AND column_name IN ('billing_address', 'payment_id')
        ) = 2
        AND EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = 'payments' AND table_schema = 'public'
        )
        THEN '✅ 支付系统迁移已完成'
        ELSE '❌ 支付系统迁移未完成或存在问题'
    END AS overall_status;