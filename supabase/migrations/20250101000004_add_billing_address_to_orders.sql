-- 添加 billing_address 字段到 orders 表
-- 迁移ID: 20250101000004_add_billing_address_to_orders

BEGIN;

-- 添加 billing_address 字段到 orders 表
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS billing_address JSONB,
ADD COLUMN IF NOT EXISTS payment_id TEXT;

-- 为新字段添加注释
COMMENT ON COLUMN orders.billing_address IS '账单地址信息，JSONB格式';
COMMENT ON COLUMN orders.payment_id IS '支付ID，关联第三方支付平台';

-- 为新字段创建索引
CREATE INDEX IF NOT EXISTS idx_orders_billing_address ON orders USING GIN (billing_address);

COMMIT;

-- 验证字段是否添加成功
DO $$ 
BEGIN
    -- 检查字段是否成功添加
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'billing_address'
    ) THEN
        RAISE NOTICE '警告: billing_address字段添加可能失败';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'payment_id'
    ) THEN
        RAISE NOTICE '警告: payment_id字段添加可能失败';
    END IF;
    
EXCEPTION
    WHEN others THEN
        RAISE NOTICE '迁移执行过程中发生错误: %', SQLERRM;
        ROLLBACK;
        RAISE;
END $$;