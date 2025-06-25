-- 存储桶设置

-- 创建存储桶
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
    ('product-images', 'product-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
    ('tool-icons', 'tool-icons', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']),
    ('uploads', 'uploads', false, 52428800, ARRAY['application/pdf', 'application/zip', 'text/plain']);

-- 头像存储策略
CREATE POLICY "用户可以查看所有头像" ON storage.objects
    FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "用户可以上传自己的头像" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'avatars' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "用户可以更新自己的头像" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'avatars' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "用户可以删除自己的头像" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'avatars' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- 产品图片存储策略
CREATE POLICY "所有人可以查看产品图片" ON storage.objects
    FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "管理员可以上传产品图片" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'product-images'
        AND EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "管理员可以更新产品图片" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'product-images'
        AND EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "管理员可以删除产品图片" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'product-images'
        AND EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- 工具图标存储策略
CREATE POLICY "所有人可以查看工具图标" ON storage.objects
    FOR SELECT USING (bucket_id = 'tool-icons');

CREATE POLICY "管理员可以上传工具图标" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'tool-icons'
        AND EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "管理员可以更新工具图标" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'tool-icons'
        AND EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "管理员可以删除工具图标" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'tool-icons'
        AND EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- 上传文件存储策略
CREATE POLICY "用户可以查看自己的上传文件" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'uploads' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "用户可以上传文件" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'uploads' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "用户可以删除自己的上传文件" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'uploads' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "管理员可以查看所有上传文件" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'uploads'
        AND EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );
