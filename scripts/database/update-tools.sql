-- 清空现有数据
DELETE FROM tool_tags;
DELETE FROM tools;
DELETE FROM tags;

-- 插入新的标签数据
INSERT INTO tags (id, name, color) VALUES
('750e8400-e29b-41d4-a716-446655440001', '代码托管', '#0078d4'),
('750e8400-e29b-41d4-a716-446655440002', '版本控制', '#0078d4'),
('750e8400-e29b-41d4-a716-446655440003', '开源', '#107c10'),
('750e8400-e29b-41d4-a716-446655440004', '协作', '#8764b8'),
('750e8400-e29b-41d4-a716-446655440005', '代码编辑器', '#0078d4'),
('750e8400-e29b-41d4-a716-446655440006', 'IDE', '#0078d4'),
('750e8400-e29b-41d4-a716-446655440007', 'UI设计', '#8764b8'),
('750e8400-e29b-41d4-a716-446655440008', '原型设计', '#8764b8'),
('750e8400-e29b-41d4-a716-446655440009', '图像编辑', '#8764b8'),
('750e8400-e29b-41d4-a716-446655440010', 'AI助手', '#ff8c00'),
('750e8400-e29b-41d4-a716-446655440011', '对话', '#ff8c00'),
('750e8400-e29b-41d4-a716-446655440012', '写作', '#ff8c00'),
('750e8400-e29b-41d4-a716-446655440013', '编程', '#0078d4'),
('750e8400-e29b-41d4-a716-446655440014', 'AI绘画', '#ff8c00'),
('750e8400-e29b-41d4-a716-446655440015', '图像生成', '#ff8c00'),
('750e8400-e29b-41d4-a716-446655440016', '笔记工具', '#107c10'),
('750e8400-e29b-41d4-a716-446655440017', '数据库', '#107c10'),
('750e8400-e29b-41d4-a716-446655440018', '项目管理', '#107c10'),
('750e8400-e29b-41d4-a716-446655440019', '看板', '#107c10'),
('750e8400-e29b-41d4-a716-446655440020', '网络测试', '#00bcf2'),
('750e8400-e29b-41d4-a716-446655440021', '网速测试', '#00bcf2'),
('750e8400-e29b-41d4-a716-446655440022', '在线设计', '#8764b8'),
('750e8400-e29b-41d4-a716-446655440023', '模板', '#8764b8'),
('750e8400-e29b-41d4-a716-446655440024', '免费图片', '#e74856'),
('750e8400-e29b-41d4-a716-446655440025', '高质量素材', '#e74856'),
('750e8400-e29b-41d4-a716-446655440026', '团队沟通', '#8764b8'),
('750e8400-e29b-41d4-a716-446655440027', '即时通讯', '#8764b8'),
('750e8400-e29b-41d4-a716-446655440028', '视频会议', '#8764b8'),
('750e8400-e29b-41d4-a716-446655440029', '云存储', '#107c10'),
('750e8400-e29b-41d4-a716-446655440030', '文档协作', '#107c10'),
('750e8400-e29b-41d4-a716-446655440031', '在线办公', '#107c10'),
('750e8400-e29b-41d4-a716-446655440032', '代码部署', '#0078d4'),
('750e8400-e29b-41d4-a716-446655440033', '静态网站', '#0078d4'),
('750e8400-e29b-41d4-a716-446655440034', 'CDN', '#00bcf2'),
('750e8400-e29b-41d4-a716-446655440035', '容器化', '#0078d4'),
('750e8400-e29b-41d4-a716-446655440036', 'DevOps', '#0078d4'),
('750e8400-e29b-41d4-a716-446655440037', '监控', '#00bcf2'),
('750e8400-e29b-41d4-a716-446655440038', '日志分析', '#00bcf2'),
('750e8400-e29b-41d4-a716-446655440039', '密码管理', '#e74856'),
('750e8400-e29b-41d4-a716-446655440040', '安全', '#e74856'),
('750e8400-e29b-41d4-a716-446655440041', '翻译', '#ff8c00'),
('750e8400-e29b-41d4-a716-446655440042', '语言学习', '#ff8c00'),
('750e8400-e29b-41d4-a716-446655440043', '音乐', '#e74856'),
('750e8400-e29b-41d4-a716-446655440044', '流媒体', '#e74856'),
('750e8400-e29b-41d4-a716-446655440045', '视频编辑', '#e74856'),
('750e8400-e29b-41d4-a716-446655440046', '短视频', '#e74856'),
('750e8400-e29b-41d4-a716-446655440047', '社交媒体', '#8764b8'),
('750e8400-e29b-41d4-a716-446655440048', '内容创作', '#8764b8'),
('750e8400-e29b-41d4-a716-446655440049', '电子商务', '#107c10'),
('750e8400-e29b-41d4-a716-446655440050', '在线支付', '#107c10')
ON CONFLICT (id) DO NOTHING;

-- 插入工具数据
INSERT INTO tools (id, name, description, url, icon, category_id, is_featured, click_count, sort_order) VALUES
-- 开发工具
('850e8400-e29b-41d4-a716-446655440001', 'GitHub', '全球最大的代码托管平台，支持Git版本控制和团队协作开发', 'https://github.com', '💻', '550e8400-e29b-41d4-a716-446655440001', true, 156, 1),
('850e8400-e29b-41d4-a716-446655440002', 'Visual Studio Code', '微软开发的免费代码编辑器，支持多种编程语言和丰富的扩展', 'https://code.visualstudio.com', '💻', '550e8400-e29b-41d4-a716-446655440001', true, 234, 2),
('850e8400-e29b-41d4-a716-446655440013', 'Vercel', '现代化的前端部署平台，支持静态网站和Serverless函数', 'https://vercel.com', '💻', '550e8400-e29b-41d4-a716-446655440001', true, 128, 13),
('850e8400-e29b-41d4-a716-446655440014', 'Netlify', '静态网站托管和部署平台，支持持续集成和CDN加速', 'https://netlify.com', '💻', '550e8400-e29b-41d4-a716-446655440001', false, 95, 14),
('850e8400-e29b-41d4-a716-446655440015', 'Docker', '容器化平台，简化应用程序的打包、分发和部署', 'https://docker.com', '💻', '550e8400-e29b-41d4-a716-446655440001', false, 87, 15),
('850e8400-e29b-41d4-a716-446655440016', 'Stack Overflow', '程序员问答社区，解决编程问题的最佳平台', 'https://stackoverflow.com', '💻', '550e8400-e29b-41d4-a716-446655440001', true, 203, 16),

-- 设计工具
('850e8400-e29b-41d4-a716-446655440003', 'Figma', '协作式界面设计工具，支持实时协作和原型制作，设计师必备', 'https://figma.com', '🎨', '550e8400-e29b-41d4-a716-446655440002', true, 189, 3),
('850e8400-e29b-41d4-a716-446655440004', 'Adobe Photoshop', '专业的图像编辑和设计软件，创意设计的行业标准', 'https://www.adobe.com/products/photoshop.html', '🎨', '550e8400-e29b-41d4-a716-446655440002', false, 145, 4),
('850e8400-e29b-41d4-a716-446655440011', 'Canva', '在线图形设计平台，提供丰富的模板和设计素材', 'https://canva.com', '🎨', '550e8400-e29b-41d4-a716-446655440002', false, 65, 11),
('850e8400-e29b-41d4-a716-446655440017', 'Sketch', 'Mac平台专业的UI/UX设计工具，矢量图形设计的首选', 'https://sketch.com', '🎨', '550e8400-e29b-41d4-a716-446655440002', false, 78, 17),
('850e8400-e29b-41d4-a716-446655440018', 'Adobe XD', 'Adobe的UI/UX设计和原型制作工具，支持协作和交互设计', 'https://www.adobe.com/products/xd.html', '🎨', '550e8400-e29b-41d4-a716-446655440002', false, 56, 18),

-- 效率工具
('850e8400-e29b-41d4-a716-446655440007', 'Notion', '全能的笔记和协作工具，支持数据库、模板和团队协作', 'https://notion.so', '📝', '550e8400-e29b-41d4-a716-446655440003', true, 167, 7),
('850e8400-e29b-41d4-a716-446655440008', 'Trello', '基于看板的项目管理工具，简单直观的任务管理方式', 'https://trello.com', '📋', '550e8400-e29b-41d4-a716-446655440003', false, 87, 8),
('850e8400-e29b-41d4-a716-446655440019', 'Slack', '团队协作和即时通讯平台，提高团队沟通效率', 'https://slack.com', '💬', '550e8400-e29b-41d4-a716-446655440003', true, 142, 19),
('850e8400-e29b-41d4-a716-446655440020', 'Zoom', '视频会议和在线协作平台，远程办公的必备工具', 'https://zoom.us', '📹', '550e8400-e29b-41d4-a716-446655440003', true, 198, 20),
('850e8400-e29b-41d4-a716-446655440021', 'Google Drive', '云存储和文档协作平台，随时随地访问和编辑文件', 'https://drive.google.com', '☁️', '550e8400-e29b-41d4-a716-446655440003', false, 176, 21),
('850e8400-e29b-41d4-a716-446655440022', 'Dropbox', '云存储和文件同步服务，安全可靠的文件备份解决方案', 'https://dropbox.com', '☁️', '550e8400-e29b-41d4-a716-446655440003', false, 89, 22),

-- AI工具
('850e8400-e29b-41d4-a716-446655440005', 'ChatGPT', 'OpenAI开发的AI对话助手，支持多种任务包括写作、编程和问答', 'https://chat.openai.com', '🤖', '550e8400-e29b-41d4-a716-446655440004', true, 312, 5),
('850e8400-e29b-41d4-a716-446655440006', 'Midjourney', 'AI图像生成工具，通过文本描述创建高质量的艺术作品', 'https://midjourney.com', '🤖', '550e8400-e29b-41d4-a716-446655440004', false, 98, 6),
('850e8400-e29b-41d4-a716-446655440023', 'Claude', 'Anthropic开发的AI助手，擅长分析、写作和复杂推理任务', 'https://claude.ai', '🤖', '550e8400-e29b-41d4-a716-446655440004', true, 156, 23),
('850e8400-e29b-41d4-a716-446655440024', 'Stable Diffusion', '开源的AI图像生成模型，支持本地部署和自定义训练', 'https://stability.ai', '🤖', '550e8400-e29b-41d4-a716-446655440004', false, 87, 24),
('850e8400-e29b-41d4-a716-446655440025', 'GitHub Copilot', 'AI代码助手，基于机器学习提供智能代码补全和建议', 'https://github.com/features/copilot', '🤖', '550e8400-e29b-41d4-a716-446655440004', true, 134, 25),

-- 网络工具
('850e8400-e29b-41d4-a716-446655440009', 'Ping.pe', '网络连通性测试工具，支持全球多地点ping测试和网络诊断', 'https://ping.pe', '🌐', '550e8400-e29b-41d4-a716-446655440005', false, 43, 9),
('850e8400-e29b-41d4-a716-446655440010', 'Speedtest', '网络速度测试工具，准确测量上传下载速度和延迟', 'https://speedtest.net', '🌐', '550e8400-e29b-41d4-a716-446655440005', true, 76, 10),
('850e8400-e29b-41d4-a716-446655440026', 'Cloudflare', '全球CDN和网络安全服务，提供网站加速和DDoS防护', 'https://cloudflare.com', '🌐', '550e8400-e29b-41d4-a716-446655440005', false, 92, 26),

-- 媒体工具
('850e8400-e29b-41d4-a716-446655440012', 'Unsplash', '免费高质量图片素材库，摄影师和设计师的灵感来源', 'https://unsplash.com', '📸', '550e8400-e29b-41d4-a716-446655440006', true, 92, 12),
('850e8400-e29b-41d4-a716-446655440027', 'YouTube', '全球最大的视频分享平台，观看和上传各类视频内容', 'https://youtube.com', '📺', '550e8400-e29b-41d4-a716-446655440006', true, 456, 27),
('850e8400-e29b-41d4-a716-446655440028', 'TikTok', '短视频社交平台，创作和分享有趣的短视频内容', 'https://tiktok.com', '🎵', '550e8400-e29b-41d4-a716-446655440006', true, 298, 28),
('850e8400-e29b-41d4-a716-446655440029', 'Spotify', '音乐流媒体平台，收听和发现全球音乐内容', 'https://spotify.com', '🎵', '550e8400-e29b-41d4-a716-446655440006', false, 187, 29),

-- 实用工具
('850e8400-e29b-41d4-a716-446655440030', 'Google Translate', '谷歌翻译，支持100多种语言的在线翻译服务', 'https://translate.google.com', '🌍', '550e8400-e29b-41d4-a716-446655440007', true, 234, 30),
('850e8400-e29b-41d4-a716-446655440031', '1Password', '密码管理器，安全存储和管理所有账户密码', 'https://1password.com', '🔐', '550e8400-e29b-41d4-a716-446655440007', false, 78, 31),
('850e8400-e29b-41d4-a716-446655440032', 'PayPal', '在线支付平台，安全便捷的国际支付解决方案', 'https://paypal.com', '💳', '550e8400-e29b-41d4-a716-446655440007', false, 156, 32)
ON CONFLICT (id) DO NOTHING;
