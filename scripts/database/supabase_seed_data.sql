-- Supabase 种子数据
-- 请在运行完主部署脚本后运行此脚本

-- 插入默认分类
INSERT INTO categories (id, name, description, icon, color, sort_order) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', '开发工具', '编程和开发相关的工具', '💻', '#0078d4', 1),
    ('550e8400-e29b-41d4-a716-446655440002', '设计工具', '设计和创意相关的工具', '🎨', '#7b1fa2', 2),
    ('550e8400-e29b-41d4-a716-446655440003', '办公工具', '办公和生产力工具', '📊', '#388e3c', 3),
    ('550e8400-e29b-41d4-a716-446655440004', '学习工具', '学习和教育相关的工具', '📚', '#f57c00', 4),
    ('550e8400-e29b-41d4-a716-446655440005', '娱乐工具', '娱乐和休闲工具', '🎮', '#e91e63', 5),
    ('550e8400-e29b-41d4-a716-446655440006', '实用工具', '日常实用工具', '🔧', '#607d8b', 6)
ON CONFLICT (id) DO NOTHING;

-- 插入产品分类
INSERT INTO product_categories (id, name, description, icon, color, sort_order) VALUES
    ('650e8400-e29b-41d4-a716-446655440001', '软件工具', '各类软件和应用程序', '💾', '#0078d4', 1),
    ('650e8400-e29b-41d4-a716-446655440002', '设计资源', '设计模板、图标、字体等', '🎨', '#7b1fa2', 2),
    ('650e8400-e29b-41d4-a716-446655440003', '办公套件', '办公效率提升工具包', '📊', '#388e3c', 3),
    ('650e8400-e29b-41d4-a716-446655440004', '学习课程', '在线课程和教育资源', '📚', '#f57c00', 4),
    ('650e8400-e29b-41d4-a716-446655440005', '游戏娱乐', '游戏和娱乐相关产品', '🎮', '#e91e63', 5)
ON CONFLICT (id) DO NOTHING;

-- 插入示例工具
INSERT INTO tools (id, name, description, url, icon, category_id, is_featured, sort_order) VALUES
    ('750e8400-e29b-41d4-a716-446655440001', 'Visual Studio Code', '强大的代码编辑器，支持多种编程语言', 'https://code.visualstudio.com', '💻', '550e8400-e29b-41d4-a716-446655440001', true, 1),
    ('750e8400-e29b-41d4-a716-446655440002', 'GitHub', '全球最大的代码托管平台', 'https://github.com', '🐙', '550e8400-e29b-41d4-a716-446655440001', true, 2),
    ('750e8400-e29b-41d4-a716-446655440003', 'Figma', '协作式界面设计工具', 'https://figma.com', '🎨', '550e8400-e29b-41d4-a716-446655440002', true, 3),
    ('750e8400-e29b-41d4-a716-446655440004', 'Notion', '全能的笔记和协作工具', 'https://notion.so', '📝', '550e8400-e29b-41d4-a716-446655440003', true, 4),
    ('750e8400-e29b-41d4-a716-446655440005', 'Canva', '简单易用的在线设计工具', 'https://canva.com', '🖼️', '550e8400-e29b-41d4-a716-446655440002', false, 5),
    ('750e8400-e29b-41d4-a716-446655440006', 'Slack', '团队沟通和协作平台', 'https://slack.com', '💬', '550e8400-e29b-41d4-a716-446655440003', false, 6)
ON CONFLICT (id) DO NOTHING;

-- 插入示例产品
INSERT INTO products (id, name, description, short_description, price, original_price, category_id, images, features, is_featured, sort_order) VALUES
    ('850e8400-e29b-41d4-a716-446655440001', '高效办公套件', '提升办公效率的完整解决方案，包含文档处理、项目管理、时间追踪等功能。适合个人和团队使用，支持多平台同步。', '办公效率提升工具包', 299.00, 399.00, '650e8400-e29b-41d4-a716-446655440003', ARRAY['/images/office-suite-1.jpg', '/images/office-suite-2.jpg'], ARRAY['文档处理', '项目管理', '时间追踪', '团队协作', '多平台同步'], true, 1),
    ('850e8400-e29b-41d4-a716-446655440002', '设计师工具包', '专业设计师必备的工具集合，包含图标库、字体包、设计模板等资源。', '设计资源大礼包', 199.00, 299.00, '650e8400-e29b-41d4-a716-446655440002', ARRAY['/images/design-kit-1.jpg', '/images/design-kit-2.jpg'], ARRAY['10000+ 图标', '100+ 字体', '设计模板', '配色方案', '商用授权'], true, 2),
    ('850e8400-e29b-41d4-a716-446655440003', '开发者工具集', '前端开发必备工具集合，包含代码片段、组件库、开发模板等。', '前端开发加速器', 399.00, 499.00, '650e8400-e29b-41d4-a716-446655440001', ARRAY['/images/dev-tools-1.jpg', '/images/dev-tools-2.jpg'], ARRAY['React组件库', 'Vue模板', '代码片段', '开发工具', '技术支持'], true, 3),
    ('850e8400-e29b-41d4-a716-446655440004', '在线学习课程', '全栈开发从入门到精通的完整课程体系，包含实战项目和就业指导。', '全栈开发课程', 999.00, 1299.00, '650e8400-e29b-41d4-a716-446655440004', ARRAY['/images/course-1.jpg', '/images/course-2.jpg'], ARRAY['视频教程', '实战项目', '代码示例', '就业指导', '终身更新'], false, 4)
ON CONFLICT (id) DO NOTHING;

-- 插入标签
INSERT INTO tags (id, name, color) VALUES
    ('950e8400-e29b-41d4-a716-446655440001', '免费', '#28a745'),
    ('950e8400-e29b-41d4-a716-446655440002', '开源', '#17a2b8'),
    ('950e8400-e29b-41d4-a716-446655440003', '付费', '#ffc107'),
    ('950e8400-e29b-41d4-a716-446655440004', '热门', '#dc3545'),
    ('950e8400-e29b-41d4-a716-446655440005', '推荐', '#6f42c1'),
    ('950e8400-e29b-41d4-a716-446655440006', '新品', '#fd7e14')
ON CONFLICT (id) DO NOTHING;

-- 插入工具标签关联
INSERT INTO tool_tags (tool_id, tag_id) VALUES
    ('750e8400-e29b-41d4-a716-446655440001', '950e8400-e29b-41d4-a716-446655440001'), -- VS Code - 免费
    ('750e8400-e29b-41d4-a716-446655440001', '950e8400-e29b-41d4-a716-446655440004'), -- VS Code - 热门
    ('750e8400-e29b-41d4-a716-446655440002', '950e8400-e29b-41d4-a716-446655440001'), -- GitHub - 免费
    ('750e8400-e29b-41d4-a716-446655440002', '950e8400-e29b-41d4-a716-446655440004'), -- GitHub - 热门
    ('750e8400-e29b-41d4-a716-446655440003', '950e8400-e29b-41d4-a716-446655440001'), -- Figma - 免费
    ('750e8400-e29b-41d4-a716-446655440003', '950e8400-e29b-41d4-a716-446655440005'), -- Figma - 推荐
    ('750e8400-e29b-41d4-a716-446655440004', '950e8400-e29b-41d4-a716-446655440001'), -- Notion - 免费
    ('750e8400-e29b-41d4-a716-446655440004', '950e8400-e29b-41d4-a716-446655440005'), -- Notion - 推荐
    ('750e8400-e29b-41d4-a716-446655440005', '950e8400-e29b-41d4-a716-446655440001'), -- Canva - 免费
    ('750e8400-e29b-41d4-a716-446655440006', '950e8400-e29b-41d4-a716-446655440003')  -- Slack - 付费
ON CONFLICT (tool_id, tag_id) DO NOTHING;

-- 创建存储桶（需要在Supabase控制台中手动创建或使用存储API）
-- 这里只是记录需要创建的存储桶
/*
需要创建的存储桶：
1. avatars (公开) - 用户头像
2. product-images (公开) - 产品图片
3. tool-icons (公开) - 工具图标
4. uploads (私有) - 用户上传文件
*/

-- 存储策略将在存储桶创建后自动应用
-- 或者可以通过以下SQL手动创建（需要先创建存储桶）

/*
-- 头像存储策略
INSERT INTO storage.policies (id, bucket_id, name, definition, check_definition, command)
VALUES (
    'avatars-public-read',
    'avatars',
    '公开读取头像',
    'true',
    'true',
    'SELECT'
);

INSERT INTO storage.policies (id, bucket_id, name, definition, check_definition, command)
VALUES (
    'avatars-user-upload',
    'avatars',
    '用户可以上传自己的头像',
    'auth.uid()::text = (storage.foldername(name))[1]',
    'auth.uid()::text = (storage.foldername(name))[1]',
    'INSERT'
);

-- 产品图片存储策略
INSERT INTO storage.policies (id, bucket_id, name, definition, check_definition, command)
VALUES (
    'product-images-public-read',
    'product-images',
    '公开读取产品图片',
    'true',
    'true',
    'SELECT'
);

INSERT INTO storage.policies (id, bucket_id, name, definition, check_definition, command)
VALUES (
    'product-images-admin-upload',
    'product-images',
    '管理员可以上传产品图片',
    'EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN (''admin'', ''super_admin''))',
    'EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN (''admin'', ''super_admin''))',
    'INSERT'
);

-- 工具图标存储策略
INSERT INTO storage.policies (id, bucket_id, name, definition, check_definition, command)
VALUES (
    'tool-icons-public-read',
    'tool-icons',
    '公开读取工具图标',
    'true',
    'true',
    'SELECT'
);

INSERT INTO storage.policies (id, bucket_id, name, definition, check_definition, command)
VALUES (
    'tool-icons-admin-upload',
    'tool-icons',
    '管理员可以上传工具图标',
    'EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN (''admin'', ''super_admin''))',
    'EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN (''admin'', ''super_admin''))',
    'INSERT'
);

-- 用户上传文件存储策略
INSERT INTO storage.policies (id, bucket_id, name, definition, check_definition, command)
VALUES (
    'uploads-user-read',
    'uploads',
    '用户可以读取自己的文件',
    'auth.uid()::text = (storage.foldername(name))[1]',
    'auth.uid()::text = (storage.foldername(name))[1]',
    'SELECT'
);

INSERT INTO storage.policies (id, bucket_id, name, definition, check_definition, command)
VALUES (
    'uploads-user-upload',
    'uploads',
    '用户可以上传文件到自己的文件夹',
    'auth.uid()::text = (storage.foldername(name))[1]',
    'auth.uid()::text = (storage.foldername(name))[1]',
    'INSERT'
);
*/
