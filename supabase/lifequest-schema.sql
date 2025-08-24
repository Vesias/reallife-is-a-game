-- ==========================================
-- LifeQuest Database Schema for Supabase
-- Gamified Life Management App
-- ==========================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================
-- CORE USER SYSTEM
-- ==========================================

-- Extended user profile data
CREATE TABLE users_profile (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100),
    bio TEXT,
    avatar_url TEXT,
    level INTEGER DEFAULT 1 CHECK (level >= 1),
    total_xp BIGINT DEFAULT 0 CHECK (total_xp >= 0),
    current_streak INTEGER DEFAULT 0 CHECK (current_streak >= 0),
    longest_streak INTEGER DEFAULT 0 CHECK (longest_streak >= 0),
    last_activity_date DATE DEFAULT CURRENT_DATE,
    timezone VARCHAR(50) DEFAULT 'UTC',
    language VARCHAR(5) DEFAULT 'en',
    theme_preference VARCHAR(20) DEFAULT 'auto',
    notification_preferences JSONB DEFAULT '{"email": true, "push": true, "in_app": true}',
    privacy_settings JSONB DEFAULT '{"profile_visibility": "public", "activity_visibility": "friends"}',
    onboarding_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User connections/social network
CREATE TABLE connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requester_id UUID NOT NULL REFERENCES users_profile(id) ON DELETE CASCADE,
    addressee_id UUID NOT NULL REFERENCES users_profile(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked', 'declined')),
    connection_type VARCHAR(20) DEFAULT 'friend' CHECK (connection_type IN ('friend', 'mentor', 'mentee', 'crew_mate')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(requester_id, addressee_id),
    CHECK (requester_id != addressee_id)
);

-- ==========================================
-- GAMIFICATION SYSTEM
-- ==========================================

-- Skill categories for organization
CREATE TABLE skill_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(7), -- hex color
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Skills in the skill tree
CREATE TABLE skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID NOT NULL REFERENCES skill_categories(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    max_level INTEGER DEFAULT 100 CHECK (max_level > 0),
    xp_per_level INTEGER DEFAULT 100 CHECK (xp_per_level > 0),
    prerequisite_skills JSONB DEFAULT '[]', -- Array of skill IDs
    unlock_requirements JSONB DEFAULT '{}', -- Custom unlock conditions
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User's acquired skills with levels
CREATE TABLE user_skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users_profile(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    current_level INTEGER DEFAULT 1 CHECK (current_level >= 1),
    current_xp INTEGER DEFAULT 0 CHECK (current_xp >= 0),
    total_xp_invested INTEGER DEFAULT 0 CHECK (total_xp_invested >= 0),
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_practiced TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    practice_streak INTEGER DEFAULT 0 CHECK (practice_streak >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, skill_id)
);

-- User properties/characteristics
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    property_type VARCHAR(20) DEFAULT 'stat' CHECK (property_type IN ('stat', 'trait', 'attribute')),
    data_type VARCHAR(20) DEFAULT 'integer' CHECK (data_type IN ('integer', 'decimal', 'boolean', 'text')),
    min_value DECIMAL,
    max_value DECIMAL,
    default_value DECIMAL,
    unit VARCHAR(20),
    icon VARCHAR(50),
    is_visible BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User property values
CREATE TABLE user_properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users_profile(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    value_numeric DECIMAL,
    value_text TEXT,
    value_boolean BOOLEAN,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, property_id)
);

-- Digital AI agents/companions
CREATE TABLE digital_agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users_profile(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    agent_type VARCHAR(50) DEFAULT 'companion' CHECK (agent_type IN ('companion', 'mentor', 'coach', 'assistant')),
    personality_traits JSONB DEFAULT '{}',
    appearance_config JSONB DEFAULT '{}',
    level INTEGER DEFAULT 1 CHECK (level >= 1),
    xp INTEGER DEFAULT 0 CHECK (xp >= 0),
    bond_strength INTEGER DEFAULT 0 CHECK (bond_strength >= 0 AND bond_strength <= 100),
    specializations JSONB DEFAULT '[]', -- Array of skill categories they help with
    unlock_requirements JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_interaction TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Achievements/badges system
CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50) DEFAULT 'general',
    rarity VARCHAR(20) DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
    icon VARCHAR(50),
    badge_design JSONB DEFAULT '{}',
    unlock_criteria JSONB NOT NULL, -- Conditions to unlock
    xp_reward INTEGER DEFAULT 0 CHECK (xp_reward >= 0),
    is_hidden BOOLEAN DEFAULT FALSE, -- Secret achievements
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User's earned achievements
CREATE TABLE user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users_profile(id) ON DELETE CASCADE,
    achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
    progress DECIMAL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    completed_at TIMESTAMP WITH TIME ZONE,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
);

-- ==========================================
-- CREW COLLABORATION SYSTEM
-- ==========================================

-- Crews (teams/groups)
CREATE TABLE crews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    creator_id UUID NOT NULL REFERENCES users_profile(id) ON DELETE CASCADE,
    max_members INTEGER DEFAULT 5 CHECK (max_members >= 1 AND max_members <= 10),
    current_members INTEGER DEFAULT 1 CHECK (current_members >= 0),
    crew_type VARCHAR(20) DEFAULT 'public' CHECK (crew_type IN ('public', 'private', 'invite_only')),
    focus_areas JSONB DEFAULT '[]', -- Array of skill categories
    shared_goals JSONB DEFAULT '[]',
    crew_level INTEGER DEFAULT 1 CHECK (crew_level >= 1),
    crew_xp INTEGER DEFAULT 0 CHECK (crew_xp >= 0),
    settings JSONB DEFAULT '{"allow_public_join": true, "require_approval": false}',
    avatar_url TEXT,
    banner_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crew membership junction table
CREATE TABLE crew_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    crew_id UUID NOT NULL REFERENCES crews(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users_profile(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('leader', 'co_leader', 'member')),
    contribution_xp INTEGER DEFAULT 0 CHECK (contribution_xp >= 0),
    join_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'banned')),
    permissions JSONB DEFAULT '{"can_invite": false, "can_kick": false, "can_edit_goals": false}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(crew_id, user_id)
);

-- ==========================================
-- QUEST AND GOAL SYSTEM
-- ==========================================

-- Main quests/goals
CREATE TABLE quests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users_profile(id) ON DELETE CASCADE,
    crew_id UUID REFERENCES crews(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    quest_type VARCHAR(20) DEFAULT 'personal' CHECK (quest_type IN ('personal', 'crew', 'challenge', 'daily', 'weekly', 'monthly')),
    category VARCHAR(50) DEFAULT 'general',
    difficulty VARCHAR(20) DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard', 'expert')),
    priority INTEGER DEFAULT 3 CHECK (priority >= 1 AND priority <= 5),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('draft', 'active', 'completed', 'failed', 'paused', 'cancelled')),
    progress DECIMAL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    target_value INTEGER,
    current_value INTEGER DEFAULT 0,
    unit VARCHAR(20),
    xp_reward INTEGER DEFAULT 0 CHECK (xp_reward >= 0),
    skill_rewards JSONB DEFAULT '[]', -- Array of {skill_id, xp_amount}
    start_date DATE,
    due_date DATE,
    completed_at TIMESTAMP WITH TIME ZONE,
    recurring_config JSONB, -- For recurring quests
    parent_quest_id UUID REFERENCES quests(id) ON DELETE CASCADE,
    tags JSONB DEFAULT '[]',
    attachments JSONB DEFAULT '[]',
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CHECK ((user_id IS NOT NULL AND crew_id IS NULL) OR (user_id IS NULL AND crew_id IS NOT NULL) OR (user_id IS NOT NULL AND crew_id IS NOT NULL))
);

-- Secondary goals/daily habits
CREATE TABLE secondary_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users_profile(id) ON DELETE CASCADE,
    quest_id UUID REFERENCES quests(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    goal_type VARCHAR(20) DEFAULT 'habit' CHECK (goal_type IN ('habit', 'task', 'milestone', 'checkpoint')),
    frequency VARCHAR(20) DEFAULT 'daily' CHECK (frequency IN ('daily', 'weekly', 'monthly', 'custom')),
    frequency_config JSONB DEFAULT '{}', -- Custom frequency settings
    target_value INTEGER DEFAULT 1,
    current_streak INTEGER DEFAULT 0,
    best_streak INTEGER DEFAULT 0,
    xp_reward INTEGER DEFAULT 10 CHECK (xp_reward >= 0),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quest progress tracking
CREATE TABLE quest_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quest_id UUID NOT NULL REFERENCES quests(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users_profile(id) ON DELETE CASCADE,
    progress_value INTEGER NOT NULL DEFAULT 0,
    progress_percentage DECIMAL DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    milestone_reached VARCHAR(100),
    notes TEXT,
    evidence_urls JSONB DEFAULT '[]', -- Photos, videos, documents
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- TRACKING AND ANALYTICS
-- ==========================================

-- XP transaction history
CREATE TABLE xp_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users_profile(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('quest_completion', 'skill_practice', 'achievement_unlock', 'daily_bonus', 'crew_contribution', 'penalty', 'bonus')),
    source_id UUID, -- ID of quest, skill, achievement, etc.
    source_type VARCHAR(50), -- 'quest', 'skill', 'achievement', etc.
    description TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity logs
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users_profile(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50), -- 'quest', 'skill', 'achievement', etc.
    entity_id UUID,
    activity_data JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users_profile(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('quest_reminder', 'achievement_unlock', 'crew_invite', 'friend_request', 'milestone_reached', 'system')),
    title VARCHAR(200) NOT NULL,
    message TEXT,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT FALSE,
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- INTEGRATIONS
-- ==========================================

-- Third-party service integrations
CREATE TABLE integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users_profile(id) ON DELETE CASCADE,
    service_name VARCHAR(50) NOT NULL CHECK (service_name IN ('linkedin', 'strava', 'github', 'google_fit', 'apple_health', 'fitbit', 'spotify', 'goodreads')),
    service_user_id VARCHAR(200),
    access_token TEXT, -- Encrypted
    refresh_token TEXT, -- Encrypted
    token_expires_at TIMESTAMP WITH TIME ZONE,
    sync_settings JSONB DEFAULT '{}',
    last_sync TIMESTAMP WITH TIME ZONE,
    sync_status VARCHAR(20) DEFAULT 'active' CHECK (sync_status IN ('active', 'paused', 'error', 'expired')),
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, service_name)
);

-- ==========================================
-- INTERNATIONALIZATION
-- ==========================================

-- Translation table for German i18n support
CREATE TABLE translations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(200) NOT NULL,
    language VARCHAR(5) NOT NULL DEFAULT 'en',
    value TEXT NOT NULL,
    context VARCHAR(100), -- UI section or feature area
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(key, language)
);

-- ==========================================
-- INDEXES FOR PERFORMANCE
-- ==========================================

-- User profile indexes
CREATE INDEX idx_users_profile_user_id ON users_profile(user_id);
CREATE INDEX idx_users_profile_username ON users_profile(username);
CREATE INDEX idx_users_profile_level ON users_profile(level DESC);

-- Connection indexes
CREATE INDEX idx_connections_requester ON connections(requester_id);
CREATE INDEX idx_connections_addressee ON connections(addressee_id);
CREATE INDEX idx_connections_status ON connections(status);

-- Skill system indexes
CREATE INDEX idx_user_skills_user_id ON user_skills(user_id);
CREATE INDEX idx_user_skills_skill_id ON user_skills(skill_id);
CREATE INDEX idx_skills_category ON skills(category_id);

-- Quest indexes
CREATE INDEX idx_quests_user_id ON quests(user_id);
CREATE INDEX idx_quests_crew_id ON quests(crew_id);
CREATE INDEX idx_quests_status ON quests(status);
CREATE INDEX idx_quests_due_date ON quests(due_date);
CREATE INDEX idx_quest_progress_quest_id ON quest_progress(quest_id);

-- Crew indexes
CREATE INDEX idx_crew_members_crew_id ON crew_members(crew_id);
CREATE INDEX idx_crew_members_user_id ON crew_members(user_id);
CREATE INDEX idx_crews_creator ON crews(creator_id);

-- Activity indexes
CREATE INDEX idx_xp_transactions_user_id ON xp_transactions(user_id);
CREATE INDEX idx_xp_transactions_created_at ON xp_transactions(created_at DESC);
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- Notification indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- Translation indexes
CREATE INDEX idx_translations_key_lang ON translations(key, language);
CREATE INDEX idx_translations_language ON translations(language);

-- ==========================================
-- ROW LEVEL SECURITY POLICIES
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE users_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE crews ENABLE ROW LEVEL SECURITY;
ALTER TABLE crew_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE secondary_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE quest_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE translations ENABLE ROW LEVEL SECURITY;

-- Users can only access their own profile
CREATE POLICY "Users can view their own profile" ON users_profile
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON users_profile
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON users_profile
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Connections policies
CREATE POLICY "Users can view their connections" ON connections
    FOR SELECT USING (auth.uid() IN (
        SELECT user_id FROM users_profile WHERE id = connections.requester_id
    ) OR auth.uid() IN (
        SELECT user_id FROM users_profile WHERE id = connections.addressee_id
    ));

CREATE POLICY "Users can create connections" ON connections
    FOR INSERT WITH CHECK (auth.uid() IN (
        SELECT user_id FROM users_profile WHERE id = connections.requester_id
    ));

CREATE POLICY "Users can update their connections" ON connections
    FOR UPDATE USING (auth.uid() IN (
        SELECT user_id FROM users_profile WHERE id = connections.requester_id
    ) OR auth.uid() IN (
        SELECT user_id FROM users_profile WHERE id = connections.addressee_id
    ));

-- Skills are public for reading
CREATE POLICY "Skills are publicly readable" ON skills FOR SELECT TO authenticated USING (true);
CREATE POLICY "Skill categories are publicly readable" ON skill_categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Properties are publicly readable" ON properties FOR SELECT TO authenticated USING (true);
CREATE POLICY "Achievements are publicly readable" ON achievements FOR SELECT TO authenticated USING (true);

-- User skills policies
CREATE POLICY "Users can view their own skills" ON user_skills
    FOR SELECT USING (auth.uid() IN (SELECT user_id FROM users_profile WHERE id = user_skills.user_id));

CREATE POLICY "Users can manage their own skills" ON user_skills
    FOR ALL USING (auth.uid() IN (SELECT user_id FROM users_profile WHERE id = user_skills.user_id));

-- User properties policies
CREATE POLICY "Users can manage their own properties" ON user_properties
    FOR ALL USING (auth.uid() IN (SELECT user_id FROM users_profile WHERE id = user_properties.user_id));

-- Digital agents policies
CREATE POLICY "Users can manage their own agents" ON digital_agents
    FOR ALL USING (auth.uid() IN (SELECT user_id FROM users_profile WHERE id = digital_agents.user_id));

-- User achievements policies
CREATE POLICY "Users can view their own achievements" ON user_achievements
    FOR SELECT USING (auth.uid() IN (SELECT user_id FROM users_profile WHERE id = user_achievements.user_id));

CREATE POLICY "System can insert user achievements" ON user_achievements
    FOR INSERT WITH CHECK (true); -- Achievements are awarded by system

-- Quest policies
CREATE POLICY "Users can view their own quests" ON quests
    FOR SELECT USING (
        (user_id IS NOT NULL AND auth.uid() IN (SELECT user_id FROM users_profile WHERE id = quests.user_id))
        OR (crew_id IS NOT NULL AND auth.uid() IN (
            SELECT up.user_id FROM users_profile up
            JOIN crew_members cm ON up.id = cm.user_id
            WHERE cm.crew_id = quests.crew_id
        ))
        OR is_public = true
    );

CREATE POLICY "Users can manage their own quests" ON quests
    FOR ALL USING (
        auth.uid() IN (SELECT user_id FROM users_profile WHERE id = quests.user_id)
    );

-- Crew policies
CREATE POLICY "Users can view public crews and their own crews" ON crews
    FOR SELECT USING (
        crew_type = 'public'
        OR auth.uid() IN (
            SELECT up.user_id FROM users_profile up
            JOIN crew_members cm ON up.id = cm.user_id
            WHERE cm.crew_id = crews.id
        )
    );

CREATE POLICY "Users can create crews" ON crews
    FOR INSERT WITH CHECK (auth.uid() IN (SELECT user_id FROM users_profile WHERE id = crews.creator_id));

CREATE POLICY "Crew leaders can update crews" ON crews
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT up.user_id FROM users_profile up
            JOIN crew_members cm ON up.id = cm.user_id
            WHERE cm.crew_id = crews.id AND cm.role IN ('leader', 'co_leader')
        )
    );

-- Secondary goals policies
CREATE POLICY "Users can manage their own secondary goals" ON secondary_goals
    FOR ALL USING (auth.uid() IN (SELECT user_id FROM users_profile WHERE id = secondary_goals.user_id));

-- Quest progress policies
CREATE POLICY "Users can view quest progress they're involved in" ON quest_progress
    FOR SELECT USING (
        auth.uid() IN (SELECT user_id FROM users_profile WHERE id = quest_progress.user_id)
        OR auth.uid() IN (
            SELECT q.user_id FROM quests q
            JOIN users_profile up ON q.user_id = up.id
            WHERE q.id = quest_progress.quest_id AND up.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own quest progress" ON quest_progress
    FOR INSERT WITH CHECK (auth.uid() IN (SELECT user_id FROM users_profile WHERE id = quest_progress.user_id));

-- XP transactions policies
CREATE POLICY "Users can view their own XP transactions" ON xp_transactions
    FOR SELECT USING (auth.uid() IN (SELECT user_id FROM users_profile WHERE id = xp_transactions.user_id));

CREATE POLICY "System can insert XP transactions" ON xp_transactions
    FOR INSERT WITH CHECK (true);

-- Activity logs policies
CREATE POLICY "Users can view their own activity logs" ON activity_logs
    FOR SELECT USING (auth.uid() IN (SELECT user_id FROM users_profile WHERE id = activity_logs.user_id));

CREATE POLICY "System can insert activity logs" ON activity_logs
    FOR INSERT WITH CHECK (true);

-- Notification policies
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (auth.uid() IN (SELECT user_id FROM users_profile WHERE id = notifications.user_id));

CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (auth.uid() IN (SELECT user_id FROM users_profile WHERE id = notifications.user_id));

-- Integration policies
CREATE POLICY "Users can manage their own integrations" ON integrations
    FOR ALL USING (auth.uid() IN (SELECT user_id FROM users_profile WHERE id = integrations.user_id));

-- Translations are publicly readable
CREATE POLICY "Translations are publicly readable" ON translations
    FOR SELECT TO authenticated USING (true);

-- ==========================================
-- TRIGGERS AND FUNCTIONS
-- ==========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_users_profile_updated_at BEFORE UPDATE ON users_profile FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_connections_updated_at BEFORE UPDATE ON connections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_skills_updated_at BEFORE UPDATE ON user_skills FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_digital_agents_updated_at BEFORE UPDATE ON digital_agents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_crews_updated_at BEFORE UPDATE ON crews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quests_updated_at BEFORE UPDATE ON quests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_secondary_goals_updated_at BEFORE UPDATE ON secondary_goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_integrations_updated_at BEFORE UPDATE ON integrations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_translations_updated_at BEFORE UPDATE ON translations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate user level based on XP
CREATE OR REPLACE FUNCTION calculate_user_level(total_xp BIGINT)
RETURNS INTEGER AS $$
BEGIN
    -- Level formula: sqrt(total_xp / 100) + 1
    RETURN GREATEST(1, FLOOR(SQRT(total_xp / 100.0)) + 1);
END;
$$ LANGUAGE plpgsql;

-- Function to update user XP and level
CREATE OR REPLACE FUNCTION update_user_xp()
RETURNS TRIGGER AS $$
DECLARE
    new_level INTEGER;
BEGIN
    -- Update total XP in user profile
    UPDATE users_profile 
    SET total_xp = total_xp + NEW.amount,
        updated_at = NOW()
    WHERE id = (SELECT id FROM users_profile WHERE user_id = NEW.user_id);
    
    -- Calculate new level
    SELECT calculate_user_level(total_xp) INTO new_level
    FROM users_profile 
    WHERE user_id = NEW.user_id;
    
    -- Update level if changed
    UPDATE users_profile 
    SET level = new_level,
        updated_at = NOW()
    WHERE user_id = NEW.user_id AND level != new_level;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update user XP when XP transaction is added
CREATE TRIGGER update_user_xp_trigger 
    AFTER INSERT ON xp_transactions 
    FOR EACH ROW EXECUTE FUNCTION update_user_xp();

-- Function to update quest progress percentage
CREATE OR REPLACE FUNCTION update_quest_progress_percentage()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.target_value IS NOT NULL AND NEW.target_value > 0 THEN
        NEW.progress = LEAST(100, (NEW.current_value::DECIMAL / NEW.target_value::DECIMAL) * 100);
    END IF;
    
    -- Mark as completed if progress reaches 100%
    IF NEW.progress >= 100 AND NEW.status != 'completed' THEN
        NEW.status = 'completed';
        NEW.completed_at = NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update quest progress
CREATE TRIGGER update_quest_progress_trigger 
    BEFORE UPDATE ON quests 
    FOR EACH ROW EXECUTE FUNCTION update_quest_progress_percentage();

-- Function to update crew member count
CREATE OR REPLACE FUNCTION update_crew_member_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE crews 
        SET current_members = current_members + 1,
            updated_at = NOW()
        WHERE id = NEW.crew_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE crews 
        SET current_members = current_members - 1,
            updated_at = NOW()
        WHERE id = OLD.crew_id;
        RETURN OLD;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update crew member count
CREATE TRIGGER update_crew_member_count_trigger
    AFTER INSERT OR DELETE ON crew_members
    FOR EACH ROW EXECUTE FUNCTION update_crew_member_count();

-- Function to handle user activity updates
CREATE OR REPLACE FUNCTION update_user_activity()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE users_profile 
    SET last_activity_date = CURRENT_DATE,
        updated_at = NOW()
    WHERE user_id = NEW.user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update user activity on various actions
CREATE TRIGGER update_user_activity_xp AFTER INSERT ON xp_transactions FOR EACH ROW EXECUTE FUNCTION update_user_activity();
CREATE TRIGGER update_user_activity_quest AFTER INSERT OR UPDATE ON quest_progress FOR EACH ROW EXECUTE FUNCTION update_user_activity();

-- ==========================================
-- DATABASE VIEWS FOR COMPLEX QUERIES
-- ==========================================

-- User dashboard summary view
CREATE VIEW user_dashboard_summary AS
SELECT 
    up.id as user_profile_id,
    up.user_id,
    up.username,
    up.display_name,
    up.level,
    up.total_xp,
    up.current_streak,
    up.longest_streak,
    up.last_activity_date,
    -- Quest statistics
    COUNT(DISTINCT q.id) FILTER (WHERE q.status = 'active') as active_quests,
    COUNT(DISTINCT q.id) FILTER (WHERE q.status = 'completed') as completed_quests,
    AVG(q.progress) FILTER (WHERE q.status = 'active') as avg_quest_progress,
    -- Skill statistics  
    COUNT(DISTINCT us.id) as total_skills,
    AVG(us.current_level) as avg_skill_level,
    -- Achievement statistics
    COUNT(DISTINCT ua.id) FILTER (WHERE ua.completed_at IS NOT NULL) as total_achievements,
    -- Crew statistics
    COUNT(DISTINCT cm.crew_id) as crew_count,
    -- Recent XP
    COALESCE(SUM(xt.amount) FILTER (WHERE xt.created_at >= NOW() - INTERVAL '7 days'), 0) as weekly_xp,
    COALESCE(SUM(xt.amount) FILTER (WHERE xt.created_at >= NOW() - INTERVAL '30 days'), 0) as monthly_xp
FROM users_profile up
LEFT JOIN quests q ON up.id = q.user_id
LEFT JOIN user_skills us ON up.id = us.user_id
LEFT JOIN user_achievements ua ON up.id = ua.user_id
LEFT JOIN crew_members cm ON up.id = cm.user_id AND cm.status = 'active'
LEFT JOIN xp_transactions xt ON up.id = (SELECT id FROM users_profile WHERE user_id = xt.user_id)
GROUP BY up.id, up.user_id, up.username, up.display_name, up.level, 
         up.total_xp, up.current_streak, up.longest_streak, up.last_activity_date;

-- Skill progress view with category information
CREATE VIEW user_skill_progress AS
SELECT 
    us.id,
    us.user_id,
    us.skill_id,
    s.name as skill_name,
    s.description as skill_description,
    s.icon as skill_icon,
    sc.name as category_name,
    sc.color as category_color,
    us.current_level,
    us.current_xp,
    us.total_xp_invested,
    us.last_practiced,
    us.practice_streak,
    ROUND((us.current_xp::DECIMAL / s.xp_per_level::DECIMAL) * 100, 2) as level_progress_percentage,
    (us.current_level * s.xp_per_level + us.current_xp) as total_skill_xp,
    CASE 
        WHEN us.last_practiced >= NOW() - INTERVAL '1 day' THEN 'active'
        WHEN us.last_practiced >= NOW() - INTERVAL '7 days' THEN 'recent'
        ELSE 'stale'
    END as practice_status
FROM user_skills us
JOIN skills s ON us.skill_id = s.id
JOIN skill_categories sc ON s.category_id = sc.id
WHERE s.is_active = true;

-- Crew details view with member information
CREATE VIEW crew_details AS
SELECT 
    c.id,
    c.name,
    c.description,
    c.creator_id,
    up_creator.username as creator_username,
    c.max_members,
    c.current_members,
    c.crew_type,
    c.focus_areas,
    c.crew_level,
    c.crew_xp,
    c.avatar_url,
    c.is_active,
    c.created_at,
    -- Member statistics
    COUNT(DISTINCT cm.id) FILTER (WHERE cm.status = 'active') as active_member_count,
    AVG(up.level) FILTER (WHERE cm.status = 'active') as avg_member_level,
    SUM(up.total_xp) FILTER (WHERE cm.status = 'active') as total_crew_member_xp,
    -- Recent activity
    COUNT(DISTINCT q.id) FILTER (WHERE q.created_at >= NOW() - INTERVAL '7 days') as recent_quests
FROM crews c
JOIN users_profile up_creator ON c.creator_id = up_creator.id
LEFT JOIN crew_members cm ON c.id = cm.crew_id
LEFT JOIN users_profile up ON cm.user_id = up.id
LEFT JOIN quests q ON c.id = q.crew_id
WHERE c.is_active = true
GROUP BY c.id, c.name, c.description, c.creator_id, up_creator.username,
         c.max_members, c.current_members, c.crew_type, c.focus_areas,
         c.crew_level, c.crew_xp, c.avatar_url, c.is_active, c.created_at;

-- Quest overview with progress and member information
CREATE VIEW quest_overview AS
SELECT 
    q.id,
    q.user_id,
    q.crew_id,
    q.title,
    q.description,
    q.quest_type,
    q.category,
    q.difficulty,
    q.priority,
    q.status,
    q.progress,
    q.target_value,
    q.current_value,
    q.unit,
    q.xp_reward,
    q.start_date,
    q.due_date,
    q.completed_at,
    q.is_public,
    q.created_at,
    -- User information
    up.username as owner_username,
    up.display_name as owner_display_name,
    -- Crew information
    c.name as crew_name,
    -- Progress tracking
    COUNT(DISTINCT qp.id) as progress_entries,
    MAX(qp.created_at) as last_progress_update,
    -- Time tracking
    CASE 
        WHEN q.due_date IS NOT NULL THEN 
            EXTRACT(DAYS FROM q.due_date - CURRENT_DATE)
        ELSE NULL 
    END as days_remaining,
    CASE
        WHEN q.status = 'completed' THEN 'completed'
        WHEN q.due_date IS NOT NULL AND q.due_date < CURRENT_DATE THEN 'overdue'
        WHEN q.due_date IS NOT NULL AND q.due_date <= CURRENT_DATE + INTERVAL '3 days' THEN 'due_soon'
        ELSE 'on_track'
    END as time_status
FROM quests q
LEFT JOIN users_profile up ON q.user_id = up.id
LEFT JOIN crews c ON q.crew_id = c.id
LEFT JOIN quest_progress qp ON q.id = qp.quest_id
GROUP BY q.id, q.user_id, q.crew_id, q.title, q.description, q.quest_type,
         q.category, q.difficulty, q.priority, q.status, q.progress,
         q.target_value, q.current_value, q.unit, q.xp_reward,
         q.start_date, q.due_date, q.completed_at, q.is_public, q.created_at,
         up.username, up.display_name, c.name;

-- User leaderboard view
CREATE VIEW user_leaderboard AS
SELECT 
    ROW_NUMBER() OVER (ORDER BY up.total_xp DESC, up.level DESC) as rank,
    up.id,
    up.user_id,
    up.username,
    up.display_name,
    up.avatar_url,
    up.level,
    up.total_xp,
    up.current_streak,
    COUNT(DISTINCT q.id) FILTER (WHERE q.status = 'completed') as completed_quests,
    COUNT(DISTINCT ua.id) FILTER (WHERE ua.completed_at IS NOT NULL) as total_achievements,
    COUNT(DISTINCT cm.crew_id) as crew_count
FROM users_profile up
LEFT JOIN quests q ON up.id = q.user_id
LEFT JOIN user_achievements ua ON up.id = ua.user_id
LEFT JOIN crew_members cm ON up.id = cm.user_id AND cm.status = 'active'
GROUP BY up.id, up.user_id, up.username, up.display_name, up.avatar_url,
         up.level, up.total_xp, up.current_streak
ORDER BY up.total_xp DESC, up.level DESC;

-- ==========================================
-- INITIAL DATA SETUP
-- ==========================================

-- Insert default skill categories
INSERT INTO skill_categories (name, description, icon, color, sort_order) VALUES
('Health & Fitness', 'Physical health, exercise, and wellness skills', 'heart', '#e74c3c', 1),
('Learning & Education', 'Academic, professional, and personal learning', 'book', '#3498db', 2),
('Career & Finance', 'Professional development and financial literacy', 'briefcase', '#2ecc71', 3),
('Social & Communication', 'Relationships, networking, and communication', 'users', '#9b59b6', 4),
('Creativity & Arts', 'Creative expression and artistic pursuits', 'palette', '#f39c12', 5),
('Technology & Digital', 'Programming, digital tools, and tech skills', 'laptop', '#34495e', 6),
('Life Management', 'Organization, productivity, and life skills', 'calendar', '#1abc9c', 7),
('Mindfulness & Wellbeing', 'Mental health, meditation, and personal growth', 'lotus', '#ff6b6b', 8);

-- Insert default properties
INSERT INTO properties (name, description, property_type, data_type, min_value, max_value, default_value, unit, icon) VALUES
('Energy Level', 'Current energy and vitality', 'stat', 'integer', 0, 100, 50, '%', 'battery'),
('Focus Score', 'Ability to concentrate and stay focused', 'stat', 'integer', 0, 100, 50, 'points', 'target'),
('Motivation', 'Current motivation and drive', 'stat', 'integer', 0, 100, 50, '%', 'fire'),
('Stress Level', 'Current stress and pressure', 'stat', 'integer', 0, 100, 30, '%', 'gauge'),
('Happiness', 'Overall happiness and satisfaction', 'stat', 'integer', 0, 100, 70, '%', 'smile'),
('Confidence', 'Self-confidence and self-esteem', 'stat', 'integer', 0, 100, 60, '%', 'shield'),
('Creativity', 'Creative thinking and innovation', 'stat', 'integer', 0, 100, 50, '%', 'sparkles'),
('Social Connection', 'Quality of relationships and social bonds', 'stat', 'integer', 0, 100, 60, '%', 'heart-handshake');

-- Insert sample achievements
INSERT INTO achievements (name, description, category, rarity, icon, unlock_criteria, xp_reward, sort_order) VALUES
('Welcome Aboard', 'Complete your profile setup', 'onboarding', 'common', 'star', '{"profile_completed": true}', 100, 1),
('First Steps', 'Complete your first quest', 'quest', 'common', 'footsteps', '{"quests_completed": 1}', 150, 2),
('Skill Seeker', 'Unlock your first skill', 'skill', 'common', 'book-open', '{"skills_unlocked": 1}', 100, 3),
('Team Player', 'Join your first crew', 'social', 'common', 'users', '{"crews_joined": 1}', 200, 4),
('Week Warrior', 'Maintain a 7-day streak', 'habit', 'rare', 'calendar-check', '{"streak_days": 7}', 300, 5),
('Level Up', 'Reach level 10', 'progression', 'rare', 'arrow-up', '{"level_reached": 10}', 500, 6),
('Quest Master', 'Complete 50 quests', 'quest', 'epic', 'trophy', '{"quests_completed": 50}', 1000, 7),
('Skill Master', 'Max out a skill to level 100', 'skill', 'epic', 'graduation-cap', '{"skill_max_level": 100}', 1500, 8),
('Legend', 'Reach level 50', 'progression', 'legendary', 'crown', '{"level_reached": 50}', 2500, 9),
('Social Butterfly', 'Connect with 25 friends', 'social', 'rare', 'butterfly', '{"connections": 25}', 400, 10);

-- Insert German translations for common UI elements
INSERT INTO translations (key, language, value, context) VALUES
-- Navigation
('nav.dashboard', 'de', 'Dashboard', 'navigation'),
('nav.quests', 'de', 'Quests', 'navigation'),
('nav.skills', 'de', 'Fähigkeiten', 'navigation'),
('nav.crews', 'de', 'Teams', 'navigation'),
('nav.achievements', 'de', 'Erfolge', 'navigation'),
('nav.profile', 'de', 'Profil', 'navigation'),

-- Common actions
('action.create', 'de', 'Erstellen', 'buttons'),
('action.edit', 'de', 'Bearbeiten', 'buttons'),
('action.delete', 'de', 'Löschen', 'buttons'),
('action.save', 'de', 'Speichern', 'buttons'),
('action.cancel', 'de', 'Abbrechen', 'buttons'),
('action.complete', 'de', 'Abschließen', 'buttons'),

-- Quest status
('quest.status.active', 'de', 'Aktiv', 'quests'),
('quest.status.completed', 'de', 'Abgeschlossen', 'quests'),
('quest.status.failed', 'de', 'Fehlgeschlagen', 'quests'),
('quest.status.paused', 'de', 'Pausiert', 'quests'),

-- Skill categories (German)
('skill.category.health', 'de', 'Gesundheit & Fitness', 'skills'),
('skill.category.learning', 'de', 'Lernen & Bildung', 'skills'),
('skill.category.career', 'de', 'Karriere & Finanzen', 'skills'),
('skill.category.social', 'de', 'Soziales & Kommunikation', 'skills'),
('skill.category.creativity', 'de', 'Kreativität & Kunst', 'skills'),
('skill.category.technology', 'de', 'Technologie & Digital', 'skills'),
('skill.category.life', 'de', 'Lebensführung', 'skills'),
('skill.category.mindfulness', 'de', 'Achtsamkeit & Wohlbefinden', 'skills');

-- Add default English translations
INSERT INTO translations (key, language, value, context) VALUES
-- Navigation (English)
('nav.dashboard', 'en', 'Dashboard', 'navigation'),
('nav.quests', 'en', 'Quests', 'navigation'),
('nav.skills', 'en', 'Skills', 'navigation'),
('nav.crews', 'en', 'Crews', 'navigation'),
('nav.achievements', 'en', 'Achievements', 'navigation'),
('nav.profile', 'en', 'Profile', 'navigation'),

-- Common actions (English)
('action.create', 'en', 'Create', 'buttons'),
('action.edit', 'en', 'Edit', 'buttons'),
('action.delete', 'en', 'Delete', 'buttons'),
('action.save', 'en', 'Save', 'buttons'),
('action.cancel', 'en', 'Cancel', 'buttons'),
('action.complete', 'en', 'Complete', 'buttons'),

-- Quest status (English)
('quest.status.active', 'en', 'Active', 'quests'),
('quest.status.completed', 'en', 'Completed', 'quests'),
('quest.status.failed', 'en', 'Failed', 'quests'),
('quest.status.paused', 'en', 'Paused', 'quests');

-- ==========================================
-- SCHEMA COMPLETE
-- ==========================================

-- Add comments for documentation
COMMENT ON TABLE users_profile IS 'Extended user profile data with gamification elements';
COMMENT ON TABLE digital_agents IS 'AI companions that help users with their goals';
COMMENT ON TABLE crews IS 'Teams/groups of users working together (max 5 members)';
COMMENT ON TABLE quests IS 'Main goals and challenges for users or crews';
COMMENT ON TABLE secondary_goals IS 'Daily habits and smaller tasks';
COMMENT ON TABLE skills IS 'Skills in the skill tree system';
COMMENT ON TABLE user_skills IS 'User progress in specific skills';
COMMENT ON TABLE achievements IS 'Badges and rewards users can unlock';
COMMENT ON TABLE xp_transactions IS 'History of all XP gains and losses';
COMMENT ON TABLE translations IS 'Internationalization support for German and other languages';

-- Schema version for future migrations
CREATE TABLE schema_info (
    version VARCHAR(20) PRIMARY KEY,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    description TEXT
);

INSERT INTO schema_info (version, description) VALUES 
('1.0.0', 'Initial LifeQuest database schema with full gamification system');