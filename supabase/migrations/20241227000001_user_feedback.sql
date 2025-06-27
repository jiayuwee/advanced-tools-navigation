-- 用户反馈系统

-- 创建用户反馈表
CREATE TABLE IF NOT EXISTS user_feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type VARCHAR(20) NOT NULL CHECK (type IN ('bug', 'feature', 'improvement', 'question', 'other')),
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    priority VARCHAR(10) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved', 'closed')),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    system_info JSONB,
    response TEXT,
    response_at TIMESTAMPTZ,
    response_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_user_feedback_user_id ON user_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_user_feedback_type ON user_feedback(type);
CREATE INDEX IF NOT EXISTS idx_user_feedback_status ON user_feedback(status);
CREATE INDEX IF NOT EXISTS idx_user_feedback_priority ON user_feedback(priority);
CREATE INDEX IF NOT EXISTS idx_user_feedback_created_at ON user_feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_feedback_is_read ON user_feedback(is_read);

-- 创建复合索引
CREATE INDEX IF NOT EXISTS idx_user_feedback_user_status ON user_feedback(user_id, status);
CREATE INDEX IF NOT EXISTS idx_user_feedback_type_priority ON user_feedback(type, priority);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_user_feedback_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_feedback_updated_at
    BEFORE UPDATE ON user_feedback
    FOR EACH ROW
    EXECUTE FUNCTION update_user_feedback_updated_at();

-- 创建反馈统计视图
CREATE OR REPLACE VIEW feedback_stats AS
SELECT 
    COUNT(*) as total_feedbacks,
    COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
    COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress_count,
    COUNT(*) FILTER (WHERE status = 'resolved') as resolved_count,
    COUNT(*) FILTER (WHERE status = 'closed') as closed_count,
    COUNT(*) FILTER (WHERE response IS NOT NULL) as responded_count,
    ROUND(
        (COUNT(*) FILTER (WHERE response IS NOT NULL)::DECIMAL / NULLIF(COUNT(*), 0)) * 100, 
        2
    ) as response_rate,
    AVG(
        CASE 
            WHEN response_at IS NOT NULL AND created_at IS NOT NULL 
            THEN EXTRACT(EPOCH FROM (response_at - created_at)) / 3600 
        END
    ) as avg_response_time_hours,
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as recent_count,
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as monthly_count
FROM user_feedback;

-- 创建按类型统计的视图
CREATE OR REPLACE VIEW feedback_type_stats AS
SELECT 
    type,
    COUNT(*) as count,
    COUNT(*) FILTER (WHERE status = 'pending') as pending,
    COUNT(*) FILTER (WHERE status = 'resolved') as resolved,
    ROUND(
        (COUNT(*) FILTER (WHERE response IS NOT NULL)::DECIMAL / NULLIF(COUNT(*), 0)) * 100, 
        2
    ) as response_rate
FROM user_feedback
GROUP BY type
ORDER BY count DESC;

-- 创建按优先级统计的视图
CREATE OR REPLACE VIEW feedback_priority_stats AS
SELECT 
    priority,
    COUNT(*) as count,
    COUNT(*) FILTER (WHERE status = 'pending') as pending,
    COUNT(*) FILTER (WHERE status = 'resolved') as resolved,
    AVG(
        CASE 
            WHEN response_at IS NOT NULL AND created_at IS NOT NULL 
            THEN EXTRACT(EPOCH FROM (response_at - created_at)) / 3600 
        END
    ) as avg_response_time_hours
FROM user_feedback
GROUP BY priority
ORDER BY 
    CASE priority
        WHEN 'urgent' THEN 1
        WHEN 'high' THEN 2
        WHEN 'medium' THEN 3
        WHEN 'low' THEN 4
    END;

-- 创建用户反馈统计函数
CREATE OR REPLACE FUNCTION get_user_feedback_stats(user_uuid UUID)
RETURNS TABLE (
    total_feedbacks BIGINT,
    pending_count BIGINT,
    resolved_count BIGINT,
    response_rate NUMERIC,
    avg_response_time_hours NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_feedbacks,
        COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
        COUNT(*) FILTER (WHERE status = 'resolved') as resolved_count,
        ROUND(
            (COUNT(*) FILTER (WHERE response IS NOT NULL)::DECIMAL / NULLIF(COUNT(*), 0)) * 100, 
            2
        ) as response_rate,
        AVG(
            CASE 
                WHEN response_at IS NOT NULL AND created_at IS NOT NULL 
                THEN EXTRACT(EPOCH FROM (response_at - created_at)) / 3600 
            END
        ) as avg_response_time_hours
    FROM user_feedback
    WHERE user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 设置行级安全策略
ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;

-- 用户只能查看自己的反馈
CREATE POLICY "用户可以查看自己的反馈" ON user_feedback
    FOR SELECT USING (auth.uid() = user_id);

-- 用户可以创建反馈
CREATE POLICY "用户可以创建反馈" ON user_feedback
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 用户可以更新自己的反馈（仅限特定字段）
CREATE POLICY "用户可以更新自己的反馈" ON user_feedback
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (
        auth.uid() = user_id AND
        -- 用户只能更新 is_read 字段
        (OLD.type = NEW.type AND
         OLD.title = NEW.title AND
         OLD.content = NEW.content AND
         OLD.priority = NEW.priority AND
         OLD.status = NEW.status AND
         OLD.response = NEW.response AND
         OLD.response_at = NEW.response_at AND
         OLD.response_by = NEW.response_by)
    );

-- 管理员可以查看所有反馈
CREATE POLICY "管理员可以查看所有反馈" ON user_feedback
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- 管理员可以更新所有反馈
CREATE POLICY "管理员可以更新所有反馈" ON user_feedback
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- 管理员可以删除反馈
CREATE POLICY "管理员可以删除反馈" ON user_feedback
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- 创建反馈通知触发器
CREATE OR REPLACE FUNCTION notify_feedback_created()
RETURNS TRIGGER AS $$
BEGIN
    -- 发送实时通知
    PERFORM pg_notify(
        'feedback_created',
        json_build_object(
            'id', NEW.id,
            'type', NEW.type,
            'title', NEW.title,
            'priority', NEW.priority,
            'user_id', NEW.user_id,
            'created_at', NEW.created_at
        )::text
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_feedback_created
    AFTER INSERT ON user_feedback
    FOR EACH ROW
    EXECUTE FUNCTION notify_feedback_created();

-- 创建反馈回复通知触发器
CREATE OR REPLACE FUNCTION notify_feedback_responded()
RETURNS TRIGGER AS $$
BEGIN
    -- 只有当 response 字段从 NULL 变为非 NULL 时才触发
    IF OLD.response IS NULL AND NEW.response IS NOT NULL THEN
        PERFORM pg_notify(
            'feedback_responded',
            json_build_object(
                'id', NEW.id,
                'title', NEW.title,
                'user_id', NEW.user_id,
                'response', NEW.response,
                'response_at', NEW.response_at
            )::text
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_feedback_responded
    AFTER UPDATE ON user_feedback
    FOR EACH ROW
    EXECUTE FUNCTION notify_feedback_responded();

-- 插入示例数据（可选）
INSERT INTO user_feedback (
    type, title, content, priority, user_id, status
) VALUES 
(
    'feature',
    '希望增加暗色主题',
    '建议增加暗色主题选项，方便夜间使用。当前的亮色主题在晚上使用时对眼睛不太友好。',
    'medium',
    '00000000-0000-0000-0000-000000000000',
    'resolved'
),
(
    'bug',
    '搜索功能偶尔无响应',
    '在使用搜索功能时，偶尔会出现无响应的情况，需要刷新页面才能恢复正常。',
    'high',
    '00000000-0000-0000-0000-000000000000',
    'pending'
)
ON CONFLICT DO NOTHING;

-- 更新示例数据的回复
UPDATE user_feedback 
SET 
    response = '感谢您的建议！暗色主题功能已经在最新版本中上线，您可以在设置中切换主题模式。',
    response_at = NOW(),
    response_by = '00000000-0000-0000-0000-000000000000'
WHERE title = '希望增加暗色主题';

-- 添加注释
COMMENT ON TABLE user_feedback IS '用户反馈表';
COMMENT ON COLUMN user_feedback.type IS '反馈类型：bug, feature, improvement, question, other';
COMMENT ON COLUMN user_feedback.priority IS '优先级：low, medium, high, urgent';
COMMENT ON COLUMN user_feedback.status IS '状态：pending, in_progress, resolved, closed';
COMMENT ON COLUMN user_feedback.system_info IS '系统信息（浏览器、设备等）';
COMMENT ON COLUMN user_feedback.response IS '开发者回复';
COMMENT ON COLUMN user_feedback.is_read IS '用户是否已读回复';
