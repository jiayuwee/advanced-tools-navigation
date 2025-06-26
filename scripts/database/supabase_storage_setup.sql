-- Supabase 存储桶设置
-- 请在Supabase控制台的SQL编辑器中运行此脚本

-- 创建存储桶
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
    ('product-images', 'product-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
    ('tool-icons', 'tool-icons', true, 1048576, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']),
    ('uploads', 'uploads', false, 52428800, NULL)
ON CONFLICT (id) DO NOTHING;

-- 头像存储策略
INSERT INTO storage.policies (id, bucket_id, name, definition, check_definition, command)
VALUES (
    'avatars-public-read',
    'avatars',
    '公开读取头像',
    'true',
    'true',
    'SELECT'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.policies (id, bucket_id, name, definition, check_definition, command)
VALUES (
    'avatars-user-upload',
    'avatars',
    '用户可以上传自己的头像',
    'auth.uid()::text = (storage.foldername(name))[1]',
    'auth.uid()::text = (storage.foldername(name))[1]',
    'INSERT'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.policies (id, bucket_id, name, definition, check_definition, command)
VALUES (
    'avatars-user-update',
    'avatars',
    '用户可以更新自己的头像',
    'auth.uid()::text = (storage.foldername(name))[1]',
    'auth.uid()::text = (storage.foldername(name))[1]',
    'UPDATE'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.policies (id, bucket_id, name, definition, check_definition, command)
VALUES (
    'avatars-user-delete',
    'avatars',
    '用户可以删除自己的头像',
    'auth.uid()::text = (storage.foldername(name))[1]',
    'auth.uid()::text = (storage.foldername(name))[1]',
    'DELETE'
) ON CONFLICT (id) DO NOTHING;

-- 产品图片存储策略
INSERT INTO storage.policies (id, bucket_id, name, definition, check_definition, command)
VALUES (
    'product-images-public-read',
    'product-images',
    '公开读取产品图片',
    'true',
    'true',
    'SELECT'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.policies (id, bucket_id, name, definition, check_definition, command)
VALUES (
    'product-images-admin-upload',
    'product-images',
    '管理员可以上传产品图片',
    'EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN (''admin'', ''super_admin''))',
    'EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN (''admin'', ''super_admin''))',
    'INSERT'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.policies (id, bucket_id, name, definition, check_definition, command)
VALUES (
    'product-images-admin-update',
    'product-images',
    '管理员可以更新产品图片',
    'EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN (''admin'', ''super_admin''))',
    'EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN (''admin'', ''super_admin''))',
    'UPDATE'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.policies (id, bucket_id, name, definition, check_definition, command)
VALUES (
    'product-images-admin-delete',
    'product-images',
    '管理员可以删除产品图片',
    'EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN (''admin'', ''super_admin''))',
    'EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN (''admin'', ''super_admin''))',
    'DELETE'
) ON CONFLICT (id) DO NOTHING;

-- 工具图标存储策略
INSERT INTO storage.policies (id, bucket_id, name, definition, check_definition, command)
VALUES (
    'tool-icons-public-read',
    'tool-icons',
    '公开读取工具图标',
    'true',
    'true',
    'SELECT'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.policies (id, bucket_id, name, definition, check_definition, command)
VALUES (
    'tool-icons-admin-upload',
    'tool-icons',
    '管理员可以上传工具图标',
    'EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN (''admin'', ''super_admin''))',
    'EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN (''admin'', ''super_admin''))',
    'INSERT'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.policies (id, bucket_id, name, definition, check_definition, command)
VALUES (
    'tool-icons-admin-update',
    'tool-icons',
    '管理员可以更新工具图标',
    'EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN (''admin'', ''super_admin''))',
    'EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN (''admin'', ''super_admin''))',
    'UPDATE'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.policies (id, bucket_id, name, definition, check_definition, command)
VALUES (
    'tool-icons-admin-delete',
    'tool-icons',
    '管理员可以删除工具图标',
    'EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN (''admin'', ''super_admin''))',
    'EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN (''admin'', ''super_admin''))',
    'DELETE'
) ON CONFLICT (id) DO NOTHING;

-- 用户上传文件存储策略
INSERT INTO storage.policies (id, bucket_id, name, definition, check_definition, command)
VALUES (
    'uploads-user-read',
    'uploads',
    '用户可以读取自己的文件',
    'auth.uid()::text = (storage.foldername(name))[1]',
    'auth.uid()::text = (storage.foldername(name))[1]',
    'SELECT'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.policies (id, bucket_id, name, definition, check_definition, command)
VALUES (
    'uploads-user-upload',
    'uploads',
    '用户可以上传文件到自己的文件夹',
    'auth.uid()::text = (storage.foldername(name))[1]',
    'auth.uid()::text = (storage.foldername(name))[1]',
    'INSERT'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.policies (id, bucket_id, name, definition, check_definition, command)
VALUES (
    'uploads-user-update',
    'uploads',
    '用户可以更新自己的文件',
    'auth.uid()::text = (storage.foldername(name))[1]',
    'auth.uid()::text = (storage.foldername(name))[1]',
    'UPDATE'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.policies (id, bucket_id, name, definition, check_definition, command)
VALUES (
    'uploads-user-delete',
    'uploads',
    '用户可以删除自己的文件',
    'auth.uid()::text = (storage.foldername(name))[1]',
    'auth.uid()::text = (storage.foldername(name))[1]',
    'DELETE'
) ON CONFLICT (id) DO NOTHING;

-- 管理员可以访问所有上传文件
INSERT INTO storage.policies (id, bucket_id, name, definition, check_definition, command)
VALUES (
    'uploads-admin-access',
    'uploads',
    '管理员可以访问所有文件',
    'EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN (''admin'', ''super_admin''))',
    'EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN (''admin'', ''super_admin''))',
    'SELECT'
) ON CONFLICT (id) DO NOTHING;
