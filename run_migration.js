import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// ES 模块中获取 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 从环境变量读取 Supabase 配置
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('错误: 请确保在 .env.local 文件中配置了 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
    try {
        console.log('开始运行数据库迁移...');
        
        // 读取迁移 SQL 文件
        const migrationPath = path.join(__dirname, 'database_migration.sql');
        console.log(`迁移文件路径: ${migrationPath}`);
        
        if (!fs.existsSync(migrationPath)) {
            throw new Error('迁移文件不存在');
        }
        
        // 执行迁移（注意：这需要适当的权限）
        console.log('正在执行迁移 SQL...');
        
        // 由于 Supabase 客户端库的限制，我们需要逐个执行 SQL 语句
        // 首先检查 orders 表结构
        const { data: columns, error: columnError } = await supabase
            .from('information_schema.columns')
            .select('column_name, data_type, is_nullable')
            .eq('table_name', 'orders')
            .eq('table_schema', 'public')
            .in('column_name', ['billing_address', 'payment_id']);
            
        if (columnError) {
            console.error('检查表结构时出错:', columnError);
        } else {
            console.log('当前 orders 表字段:', columns);
            
            const existingColumns = columns?.map(col => col.column_name) || [];
            
            if (!existingColumns.includes('billing_address')) {
                console.log('需要添加 billing_address 字段');
            } else {
                console.log('✓ billing_address 字段已存在');
            }
            
            if (!existingColumns.includes('payment_id')) {
                console.log('需要添加 payment_id 字段');
            } else {
                console.log('✓ payment_id 字段已存在');
            }
        }
        
        // 检查 payments 表是否存在
        const { data: tables, error: tableError } = await supabase
            .from('information_schema.tables')
            .select('table_name')
            .eq('table_schema', 'public')
            .eq('table_name', 'payments');
            
        if (tableError) {
            console.error('检查表存在性时出错:', tableError);
        } else {
            if (tables && tables.length > 0) {
                console.log('✓ payments 表已存在');
            } else {
                console.log('需要创建 payments 表');
            }
        }
        
        console.log('\n注意: 由于权限限制，直接的 DDL 操作需要在 Supabase Dashboard 中手动执行。');
        console.log('请打开 Supabase Dashboard 的 SQL Editor，复制并执行 database_migration.sql 中的内容。');
        console.log('\n或者，如果您有 service_role 密钥，可以使用它来执行 DDL 操作。');
        
    } catch (error) {
        console.error('迁移过程中出错:', error);
    }
}

// 运行迁移
runMigration();