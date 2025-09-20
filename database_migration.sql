-- 数据库迁移脚本 v1.0
-- 支付系统相关表结构迁移
-- 运行所有未执行的迁移以确保数据库结构是最新的
-- 执行前请确保已备份数据库

-- 开始事务
BEGIN;

-- 记录迁移开始时间
DO $$
BEGIN
    RAISE NOTICE '开始执行支付系统迁移脚本，时间: %', NOW();
END
$$;

-- 首先检查 orders 表是否存在
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orders' AND table_schema = 'public') THEN
        RAISE EXCEPTION 'orders 表不存在，请先创建基础表结构';
    END IF;
END
$$;

-- 检查 orders 表是否存在所需的字段
SELECT 
    column_name, 
    data_type, 
    is_nullable 
FROM information_schema.columns 
WHERE table_name = 'orders' 
    AND table_schema = 'public'
    AND column_name IN ('billing_address', 'payment_id');

-- 添加 billing_address 和 payment_id 字段（如果不存在）
DO $$
BEGIN
    -- 添加 billing_address 字段
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'billing_address') THEN
        ALTER TABLE orders ADD COLUMN billing_address JSONB;
        RAISE NOTICE '已添加 orders.billing_address 字段';
    ELSE
        RAISE NOTICE 'orders.billing_address 字段已存在，跳过';
    END IF;
    
    -- 添加 payment_id 字段
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'payment_id') THEN
        ALTER TABLE orders ADD COLUMN payment_id TEXT;
        RAISE NOTICE '已添加 orders.payment_id 字段';
    ELSE
        RAISE NOTICE 'orders.payment_id 字段已存在，跳过';
    END IF;
END
$$;

-- 为新字段添加注释
COMMENT ON COLUMN orders.billing_address IS '账单地址信息，JSONB格式';
COMMENT ON COLUMN orders.payment_id IS '支付ID，关联第三方支付平台';

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_orders_billing_address ON orders USING GIN (billing_address);
CREATE INDEX IF NOT EXISTS idx_orders_payment_id ON orders (payment_id);

-- 创建 payments 表（如果不存在）
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('stripe', 'alipay', 'wechat', 'bank_transfer')),
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded', 'partially_refunded')),
    amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
    currency TEXT NOT NULL DEFAULT 'CNY' CHECK (currency IN ('CNY', 'USD', 'EUR', 'JPY')),
    transaction_id TEXT UNIQUE, -- 第三方支付平台的交易ID
    external_reference TEXT, -- 外部参考号
    payment_data JSONB DEFAULT '{}', -- 存储支付相关的额外信息
    failure_reason TEXT, -- 失败原因
    refund_amount DECIMAL(12,2) DEFAULT 0 CHECK (refund_amount >= 0),
    refunded_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE, -- 支付过期时间
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 约束条件
    CONSTRAINT valid_refund_amount CHECK (refund_amount <= amount),
    CONSTRAINT valid_expiry CHECK (expires_at IS NULL OR expires_at > created_at)
);

-- 为 payments 表添加注释
COMMENT ON TABLE payments IS '支付记录表，存储所有支付相关信息';
COMMENT ON COLUMN payments.order_id IS '关联的订单ID';
COMMENT ON COLUMN payments.payment_method IS '支付方式：stripe, alipay, wechat, bank_transfer';
COMMENT ON COLUMN payments.payment_status IS '支付状态：pending-待支付, processing-处理中, completed-已完成, failed-失败, cancelled-已取消, refunded-已退款, partially_refunded-部分退款';
COMMENT ON COLUMN payments.transaction_id IS '第三方支付平台的唯一交易ID';
COMMENT ON COLUMN payments.external_reference IS '外部系统参考号';
COMMENT ON COLUMN payments.payment_data IS '支付相关的额外信息，JSON格式';
COMMENT ON COLUMN payments.failure_reason IS '支付失败的具体原因';
COMMENT ON COLUMN payments.refund_amount IS '已退款金额';
COMMENT ON COLUMN payments.expires_at IS '支付链接过期时间';

-- 为 payments 表创建索引
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments (order_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments (payment_status);
CREATE INDEX IF NOT EXISTS idx_payments_method ON payments (payment_method);
CREATE INDEX IF NOT EXISTS idx_payments_transaction_id ON payments (transaction_id) WHERE transaction_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments (created_at);
CREATE INDEX IF NOT EXISTS idx_payments_expires_at ON payments (expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_payments_external_ref ON payments (external_reference) WHERE external_reference IS NOT NULL;

-- 为支付数据 JSONB 字段创建 GIN 索引
CREATE INDEX IF NOT EXISTS idx_payments_data_gin ON payments USING GIN (payment_data);

-- 创建更新时间戳的触发器函数（如果不存在）
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为 payments 表添加更新时间戳触发器
DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;
CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 启用行级安全 (RLS) 对于 payments 表
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- 创建 payments 表的 RLS 策略
CREATE POLICY "Users can view their own payments"
    ON payments FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM orders 
        WHERE orders.id = payments.order_id 
        AND orders.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert their own payments"
    ON payments FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM orders 
        WHERE orders.id = payments.order_id 
        AND orders.user_id = auth.uid()
    ));

CREATE POLICY "Users can update their own payments"
    ON payments FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM orders 
        WHERE orders.id = payments.order_id 
        AND orders.user_id = auth.uid()
    ));

-- 验证迁移结果
DO $$
DECLARE
    orders_count INTEGER;
    payments_count INTEGER;
BEGIN
    -- 检查表结构
    SELECT COUNT(*) INTO orders_count
    FROM information_schema.columns 
    WHERE table_name = 'orders' 
        AND column_name IN ('billing_address', 'payment_id');
    
    SELECT COUNT(*) INTO payments_count
    FROM information_schema.tables 
    WHERE table_name = 'payments' AND table_schema = 'public';
    
    IF orders_count = 2 AND payments_count = 1 THEN
        RAISE NOTICE '✅ 迁移验证成功：';
        RAISE NOTICE '  - orders 表新增字段: %', orders_count;
        RAISE NOTICE '  - payments 表创建状态: %', CASE WHEN payments_count = 1 THEN '已创建' ELSE '未创建' END;
        
        -- 提交事务
        COMMIT;
        RAISE NOTICE '📦 支付系统迁移完成，时间: %', NOW();
    ELSE
        RAISE EXCEPTION '❌ 迁移验证失败，请检查脚本执行情况';
    END IF;
END
$$;

SELECT 'Migration completed successfully' AS status,
       NOW() AS completed_at,
       'Payment system tables and indexes created' AS description;