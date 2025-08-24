-- ==========================================
-- LifeQuest Database Schema - Safe Migration
-- Handles existing tables gracefully
-- ==========================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================
-- SAFE TABLE CREATION (DROP IF EXISTS)
-- ==========================================

-- Drop existing tables in correct order (reverse dependency)
DROP TABLE IF EXISTS user_achievements CASCADE;
DROP TABLE IF EXISTS achievements CASCADE;
DROP TABLE IF EXISTS xp_transactions CASCADE;
DROP TABLE IF EXISTS quest_progress CASCADE;
DROP TABLE IF EXISTS secondary_goals CASCADE;
DROP TABLE IF EXISTS quests CASCADE;
DROP TABLE IF EXISTS crew_members CASCADE;
DROP TABLE IF EXISTS crews CASCADE;
DROP TABLE IF EXISTS user_skills CASCADE;
DROP TABLE IF EXISTS skills CASCADE;
DROP TABLE IF EXISTS skill_categories CASCADE;
DROP TABLE IF EXISTS user_properties CASCADE;
DROP TABLE IF EXISTS properties CASCADE;
DROP TABLE IF EXISTS activity_logs CASCADE;
DROP TABLE IF EXISTS integrations CASCADE;
DROP TABLE IF EXISTS translations CASCADE;
DROP TABLE IF EXISTS digital_agents CASCADE;
DROP TABLE IF EXISTS connections CASCADE;
DROP TABLE IF EXISTS users_profile CASCADE;

-- Drop the existing notifications table if it exists
DROP TABLE IF EXISTS notifications CASCADE;

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
    UNIQUE(requester_id, addressee_id)
);

-- User properties (characteristics like energy, focus, etc.)
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50) DEFAULT 'personal',
    icon VARCHAR(100),
    color VARCHAR(20) DEFAULT '#3B82F6',
    max_value INTEGER DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE user_properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users_profile(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    current_value INTEGER DEFAULT 0,
    target_value INTEGER,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, property_id)
);

-- ==========================================
-- DIGITAL AGENTS (AI Companions)
-- ==========================================

CREATE TABLE digital_agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users_profile(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL DEFAULT 'Your AI Companion',
    personality_type VARCHAR(50) DEFAULT 'helpful',
    avatar_style VARCHAR(50) DEFAULT 'default',
    level INTEGER DEFAULT 1 CHECK (level >= 1),
    xp BIGINT DEFAULT 0 CHECK (xp >= 0),
    mood VARCHAR(20) DEFAULT 'neutral',
    specialization VARCHAR(100),
    conversation_style JSONB DEFAULT '{"tone": "friendly", "formality": "casual"}',
    preferences JSONB DEFAULT '{}',
    memory_bank JSONB DEFAULT '{}',
    last_interaction TIMESTAMP WITH TIME ZONE,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- SKILL SYSTEM
-- ==========================================

-- Skill categories
CREATE TABLE skill_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(100),
    color VARCHAR(20) DEFAULT '#3B82F6',
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Skills within categories
CREATE TABLE skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID NOT NULL REFERENCES skill_categories(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 5),
    max_level INTEGER DEFAULT 100,
    prerequisites JSONB DEFAULT '[]',
    rewards JSONB DEFAULT '{}',
    icon VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User skill progress
CREATE TABLE user_skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users_profile(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    current_level INTEGER DEFAULT 1 CHECK (current_level >= 1),
    current_xp BIGINT DEFAULT 0 CHECK (current_xp >= 0),
    xp_to_next_level BIGINT DEFAULT 100,
    mastery_percentage DECIMAL(5,2) DEFAULT 0.00,
    last_practiced TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, skill_id)
);

-- ==========================================
-- CREW SYSTEM
-- ==========================================

-- Crews (teams of up to 5 members)
CREATE TABLE crews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    leader_id UUID NOT NULL REFERENCES users_profile(id) ON DELETE CASCADE,
    member_count INTEGER DEFAULT 1 CHECK (member_count BETWEEN 1 AND 5),
    max_members INTEGER DEFAULT 5 CHECK (max_members <= 5),
    crew_level INTEGER DEFAULT 1,
    total_crew_xp BIGINT DEFAULT 0,
    crew_type VARCHAR(50) DEFAULT 'general',
    privacy_setting VARCHAR(20) DEFAULT 'invite_only' CHECK (privacy_setting IN ('public', 'private', 'invite_only')),
    tags JSONB DEFAULT '[]',
    crew_avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crew membership
CREATE TABLE crew_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    crew_id UUID NOT NULL REFERENCES crews(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users_profile(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('leader', 'co_leader', 'member')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    contribution_score INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'invited')),
    UNIQUE(crew_id, user_id)
);

-- ==========================================
-- QUEST SYSTEM
-- ==========================================

-- Main quests and challenges
CREATE TABLE quests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_id UUID NOT NULL REFERENCES users_profile(id) ON DELETE CASCADE,
    crew_id UUID REFERENCES crews(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    quest_type VARCHAR(50) DEFAULT 'personal' CHECK (quest_type IN ('personal', 'crew', 'daily', 'weekly', 'monthly')),
    category VARCHAR(50) DEFAULT 'general',
    difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 5),
    xp_reward INTEGER DEFAULT 100,
    bonus_xp INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('draft', 'active', 'completed', 'failed', 'archived')),
    start_date DATE DEFAULT CURRENT_DATE,
    due_date DATE,
    completion_criteria JSONB DEFAULT '{}',
    milestones JSONB DEFAULT '[]',
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_pattern VARCHAR(50),
    participant_limit INTEGER,
    public_quest BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Secondary goals (daily habits, small tasks)
CREATE TABLE secondary_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users_profile(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(50) DEFAULT 'habit',
    target_frequency INTEGER DEFAULT 1,
    frequency_period VARCHAR(20) DEFAULT 'daily' CHECK (frequency_period IN ('daily', 'weekly', 'monthly')),
    xp_per_completion INTEGER DEFAULT 10,
    current_streak INTEGER DEFAULT 0,
    best_streak INTEGER DEFAULT 0,
    total_completions INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quest progress tracking
CREATE TABLE quest_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quest_id UUID NOT NULL REFERENCES quests(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users_profile(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'in_progress' CHECK (status IN ('not_started', 'in_progress', 'completed', 'failed', 'abandoned')),
    progress_percentage DECIMAL(5,2) DEFAULT 0.00,
    milestones_completed JSONB DEFAULT '[]',
    notes TEXT,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    xp_earned INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(quest_id, user_id)
);

-- ==========================================
-- GAMIFICATION SYSTEM
-- ==========================================

-- XP transaction log
CREATE TABLE xp_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users_profile(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    transaction_type VARCHAR(50) NOT NULL,
    source_type VARCHAR(50),
    source_id UUID,
    description TEXT,
    multiplier DECIMAL(3,2) DEFAULT 1.00,
    bonus_xp INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Achievement definitions
CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50) DEFAULT 'general',
    rarity VARCHAR(20) DEFAULT 'common' CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary')),
    xp_reward INTEGER DEFAULT 50,
    badge_icon VARCHAR(100),
    badge_color VARCHAR(20) DEFAULT '#FFD700',
    unlock_criteria JSONB DEFAULT '{}',
    is_secret BOOLEAN DEFAULT FALSE,
    is_repeatable BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User achievements
CREATE TABLE user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users_profile(id) ON DELETE CASCADE,
    achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    progress_data JSONB DEFAULT '{}',
    times_earned INTEGER DEFAULT 1,
    UNIQUE(user_id, achievement_id)
);

-- ==========================================
-- NOTIFICATIONS
-- ==========================================

-- Now create notifications table fresh
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users_profile(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    message TEXT,
    notification_type VARCHAR(50) DEFAULT 'info',
    category VARCHAR(50) DEFAULT 'general',
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    read_status BOOLEAN DEFAULT FALSE,
    action_url TEXT,
    action_data JSONB DEFAULT '{}',
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- ACTIVITY TRACKING
-- ==========================================

-- User activity logs
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users_profile(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL,
    activity_data JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- INTEGRATIONS
-- ==========================================

-- Third-party integrations
CREATE TABLE integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users_profile(id) ON DELETE CASCADE,
    service_name VARCHAR(50) NOT NULL,
    service_type VARCHAR(50) DEFAULT 'general',
    access_token_encrypted TEXT,
    refresh_token_encrypted TEXT,
    token_expires_at TIMESTAMP WITH TIME ZONE,
    integration_data JSONB DEFAULT '{}',
    sync_frequency VARCHAR(20) DEFAULT 'daily',
    last_sync_at TIMESTAMP WITH TIME ZONE,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, service_name)
);

-- ==========================================
-- INTERNATIONALIZATION
-- ==========================================

-- Translation strings
CREATE TABLE translations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(200) NOT NULL,
    language VARCHAR(5) NOT NULL,
    value TEXT NOT NULL,
    context VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(key, language)
);

-- ==========================================
-- INITIAL DATA INSERTS
-- ==========================================

-- Insert skill categories
INSERT INTO skill_categories (name, description, icon, color, sort_order) VALUES
('Health & Fitness', 'Physical and mental wellbeing', 'heart', '#EF4444', 1),
('Learning & Education', 'Knowledge acquisition and skill development', 'book', '#3B82F6', 2),
('Career & Business', 'Professional development and entrepreneurship', 'briefcase', '#10B981', 3),
('Social & Relationships', 'Communication and interpersonal skills', 'users', '#F59E0B', 4),
('Creativity & Arts', 'Creative expression and artistic pursuits', 'palette', '#8B5CF6', 5),
('Technology', 'Digital skills and tech literacy', 'monitor', '#06B6D4', 6);

-- Insert sample skills
INSERT INTO skills (category_id, name, description, difficulty_level, max_level, icon) VALUES
((SELECT id FROM skill_categories WHERE name = 'Health & Fitness'), 'Cardio Fitness', 'Improve cardiovascular endurance', 2, 100, 'heart'),
((SELECT id FROM skill_categories WHERE name = 'Health & Fitness'), 'Strength Training', 'Build muscle strength and mass', 3, 100, 'dumbbell'),
((SELECT id FROM skill_categories WHERE name = 'Learning & Education'), 'Speed Reading', 'Read faster while maintaining comprehension', 2, 100, 'book-open'),
((SELECT id FROM skill_categories WHERE name = 'Learning & Education'), 'Memory Palace', 'Memorization using spatial memory', 4, 100, 'brain'),
((SELECT id FROM skill_categories WHERE name = 'Career & Business'), 'Public Speaking', 'Confident presentation and communication', 3, 100, 'mic'),
((SELECT id FROM skill_categories WHERE name = 'Career & Business'), 'Leadership', 'Guide and inspire teams effectively', 4, 100, 'crown'),
((SELECT id FROM skill_categories WHERE name = 'Social & Relationships'), 'Active Listening', 'Listen with full attention and understanding', 2, 100, 'ear'),
((SELECT id FROM skill_categories WHERE name = 'Creativity & Arts'), 'Digital Art', 'Create art using digital tools', 3, 100, 'paintbrush'),
((SELECT id FROM skill_categories WHERE name = 'Technology'), 'Programming', 'Write and understand code', 4, 100, 'code');

-- Insert properties
INSERT INTO properties (name, description, category, icon, color, max_value) VALUES
('Energy Level', 'Current energy and vitality', 'physical', 'zap', '#F59E0B', 100),
('Focus Score', 'Ability to concentrate and stay focused', 'mental', 'target', '#3B82F6', 100),
('Motivation', 'Drive to pursue goals and activities', 'emotional', 'trending-up', '#10B981', 100),
('Stress Level', 'Current stress and pressure (lower is better)', 'emotional', 'alert-triangle', '#EF4444', 100),
('Social Battery', 'Energy for social interactions', 'social', 'users', '#8B5CF6', 100),
('Creativity', 'Creative thinking and inspiration', 'mental', 'lightbulb', '#F59E0B', 100),
('Confidence', 'Self-assurance and belief in abilities', 'emotional', 'shield', '#06B6D4', 100),
('Learning Capacity', 'Ability to absorb new information', 'mental', 'brain', '#3B82F6', 100);

-- Insert sample achievements
INSERT INTO achievements (name, description, category, rarity, xp_reward, badge_icon, badge_color) VALUES
('First Steps', 'Complete your first quest', 'milestone', 'common', 50, 'footprints', '#22C55E'),
('Streak Master', 'Maintain a 7-day streak', 'consistency', 'uncommon', 100, 'flame', '#F59E0B'),
('Crew Leader', 'Create your first crew', 'social', 'uncommon', 150, 'crown', '#8B5CF6'),
('Knowledge Seeker', 'Complete 10 learning quests', 'learning', 'rare', 250, 'book', '#3B82F6'),
('Fitness Enthusiast', 'Complete 25 health & fitness goals', 'health', 'rare', 300, 'heart', '#EF4444'),
('Social Butterfly', 'Connect with 20 other users', 'social', 'rare', 200, 'butterfly', '#F472B6'),
('The Grind', 'Earn 10,000 total XP', 'milestone', 'epic', 500, 'trophy', '#FFD700'),
('Legendary', 'Reach level 50', 'milestone', 'legendary', 1000, 'star', '#A855F7');

-- Insert German translations
INSERT INTO translations (key, language, value, context) VALUES
('welcome', 'de', 'Willkommen zu LifeQuest', 'onboarding'),
('welcome', 'en', 'Welcome to LifeQuest', 'onboarding'),
('create_crew', 'de', 'Crew erstellen', 'navigation'),
('create_crew', 'en', 'Create Crew', 'navigation'),
('main_quest', 'de', 'Hauptquest', 'quests'),
('main_quest', 'en', 'Main Quest', 'quests'),
('secondary_goal', 'de', 'Nebenquest', 'quests'),
('secondary_goal', 'en', 'Secondary Goal', 'quests'),
('experience_points', 'de', 'Erfahrungspunkte', 'gamification'),
('experience_points', 'en', 'Experience Points', 'gamification'),
('level', 'de', 'Stufe', 'gamification'),
('level', 'en', 'Level', 'gamification'),
('achievements', 'de', 'Abzeichen', 'gamification'),
('achievements', 'en', 'Achievements', 'gamification'),
('skill_tree', 'de', 'Fähigkeitsbaum', 'skills'),
('skill_tree', 'en', 'Skill Tree', 'skills'),
('properties', 'de', 'Eigenschaften', 'profile'),
('properties', 'en', 'Properties', 'profile'),
('connections', 'de', 'Verbindungen', 'social'),
('connections', 'en', 'Connections', 'social');

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE users_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE crews ENABLE ROW LEVEL SECURITY;
ALTER TABLE crew_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE secondary_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE quest_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE translations ENABLE ROW LEVEL SECURITY;

-- Users can only access their own profile data
CREATE POLICY "Users can view their own profile" ON users_profile
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON users_profile
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON users_profile
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can see public profiles of others
CREATE POLICY "Users can view public profiles" ON users_profile
    FOR SELECT USING (
        auth.uid() = user_id OR 
        (privacy_settings->>'profile_visibility' = 'public')
    );

-- Connection policies
CREATE POLICY "Users can view their connections" ON connections
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM users_profile WHERE id = requester_id
        ) OR 
        auth.uid() IN (
            SELECT user_id FROM users_profile WHERE id = addressee_id
        )
    );

CREATE POLICY "Users can create connections" ON connections
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM users_profile WHERE id = requester_id
        )
    );

-- Digital agents - users can only manage their own agents
CREATE POLICY "Users can manage their own agents" ON digital_agents
    FOR ALL USING (
        auth.uid() IN (
            SELECT user_id FROM users_profile WHERE id = digital_agents.user_id
        )
    );

-- Skill and property policies
CREATE POLICY "Anyone can view skill categories and skills" ON skill_categories
    FOR SELECT USING (true);

CREATE POLICY "Anyone can view skills" ON skills
    FOR SELECT USING (true);

CREATE POLICY "Anyone can view properties" ON properties
    FOR SELECT USING (true);

CREATE POLICY "Users can manage their own skill progress" ON user_skills
    FOR ALL USING (
        auth.uid() IN (
            SELECT user_id FROM users_profile WHERE id = user_skills.user_id
        )
    );

CREATE POLICY "Users can manage their own properties" ON user_properties
    FOR ALL USING (
        auth.uid() IN (
            SELECT user_id FROM users_profile WHERE id = user_properties.user_id
        )
    );

-- Crew policies
CREATE POLICY "Users can view crews they are members of" ON crews
    FOR SELECT USING (
        auth.uid() IN (
            SELECT up.user_id FROM users_profile up
            JOIN crew_members cm ON up.id = cm.user_id
            WHERE cm.crew_id = crews.id
        ) OR
        privacy_setting = 'public'
    );

CREATE POLICY "Crew leaders can manage their crews" ON crews
    FOR ALL USING (
        auth.uid() IN (
            SELECT user_id FROM users_profile WHERE id = leader_id
        )
    );

CREATE POLICY "Users can view crew memberships" ON crew_members
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM users_profile WHERE id = crew_members.user_id
        ) OR
        crew_id IN (
            SELECT c.id FROM crews c
            JOIN crew_members cm ON c.id = cm.crew_id
            JOIN users_profile up ON cm.user_id = up.id
            WHERE up.user_id = auth.uid()
        )
    );

-- Quest policies
CREATE POLICY "Users can view public quests or their own quests" ON quests
    FOR SELECT USING (
        public_quest = true OR
        auth.uid() IN (
            SELECT user_id FROM users_profile WHERE id = creator_id
        ) OR
        crew_id IN (
            SELECT cm.crew_id FROM crew_members cm
            JOIN users_profile up ON cm.user_id = up.id
            WHERE up.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create quests" ON quests
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM users_profile WHERE id = creator_id
        )
    );

-- Secondary goals - users manage their own
CREATE POLICY "Users can manage their own secondary goals" ON secondary_goals
    FOR ALL USING (
        auth.uid() IN (
            SELECT user_id FROM users_profile WHERE id = secondary_goals.user_id
        )
    );

-- Quest progress - users can see their own and crew members' progress
CREATE POLICY "Users can view quest progress" ON quest_progress
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM users_profile WHERE id = quest_progress.user_id
        ) OR
        quest_id IN (
            SELECT q.id FROM quests q
            WHERE q.crew_id IN (
                SELECT cm.crew_id FROM crew_members cm
                JOIN users_profile up ON cm.user_id = up.id
                WHERE up.user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can manage their own quest progress" ON quest_progress
    FOR ALL USING (
        auth.uid() IN (
            SELECT user_id FROM users_profile WHERE id = quest_progress.user_id
        )
    );

-- XP transactions - users can only see their own
CREATE POLICY "Users can view their own XP transactions" ON xp_transactions
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM users_profile WHERE id = xp_transactions.user_id
        )
    );

-- Achievements - anyone can view, users manage their own
CREATE POLICY "Anyone can view achievements" ON achievements
    FOR SELECT USING (true);

CREATE POLICY "Users can view their own achievements" ON user_achievements
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM users_profile WHERE id = user_achievements.user_id
        )
    );

-- Notifications - users see only their own
CREATE POLICY "Users can manage their own notifications" ON notifications
    FOR ALL USING (
        auth.uid() IN (
            SELECT user_id FROM users_profile WHERE id = notifications.user_id
        )
    );

-- Activity logs - users see only their own
CREATE POLICY "Users can view their own activity" ON activity_logs
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM users_profile WHERE id = activity_logs.user_id
        )
    );

-- Integrations - users manage their own
CREATE POLICY "Users can manage their own integrations" ON integrations
    FOR ALL USING (
        auth.uid() IN (
            SELECT user_id FROM users_profile WHERE id = integrations.user_id
        )
    );

-- Translations - anyone can read
CREATE POLICY "Anyone can view translations" ON translations
    FOR SELECT USING (true);

-- ==========================================
-- TRIGGERS AND FUNCTIONS
-- ==========================================

-- Function to update user level based on XP
CREATE OR REPLACE FUNCTION update_user_level()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE users_profile 
    SET level = GREATEST(1, FLOOR(SQRT(total_xp / 100)) + 1),
        updated_at = NOW()
    WHERE id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update level when XP changes
CREATE TRIGGER trigger_update_user_level
    AFTER INSERT OR UPDATE ON xp_transactions
    FOR EACH ROW EXECUTE FUNCTION update_user_level();

-- Function to update total XP in user profile
CREATE OR REPLACE FUNCTION update_total_xp()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE users_profile
    SET total_xp = (
        SELECT COALESCE(SUM(amount), 0)
        FROM xp_transactions
        WHERE user_id = NEW.user_id
    ),
    updated_at = NOW()
    WHERE id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for XP updates
CREATE TRIGGER trigger_update_total_xp
    AFTER INSERT OR UPDATE ON xp_transactions
    FOR EACH ROW EXECUTE FUNCTION update_total_xp();

-- Function to update crew member count
CREATE OR REPLACE FUNCTION update_crew_member_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE crews 
        SET member_count = member_count + 1,
            updated_at = NOW()
        WHERE id = NEW.crew_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE crews 
        SET member_count = member_count - 1,
            updated_at = NOW()
        WHERE id = OLD.crew_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Triggers for crew member count
CREATE TRIGGER trigger_crew_member_insert
    AFTER INSERT ON crew_members
    FOR EACH ROW EXECUTE FUNCTION update_crew_member_count();

CREATE TRIGGER trigger_crew_member_delete
    AFTER DELETE ON crew_members
    FOR EACH ROW EXECUTE FUNCTION update_crew_member_count();

-- Function to update last activity
CREATE OR REPLACE FUNCTION update_last_activity()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE users_profile
    SET last_activity_date = CURRENT_DATE,
        updated_at = NOW()
    WHERE user_id = auth.uid();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for activity tracking
CREATE TRIGGER trigger_activity_on_quest_progress
    AFTER INSERT OR UPDATE ON quest_progress
    FOR EACH ROW EXECUTE FUNCTION update_last_activity();

CREATE TRIGGER trigger_activity_on_xp
    AFTER INSERT ON xp_transactions
    FOR EACH ROW EXECUTE FUNCTION update_last_activity();

-- ==========================================
-- INDEXES FOR PERFORMANCE
-- ==========================================

-- User profile indexes
CREATE INDEX idx_users_profile_user_id ON users_profile(user_id);
CREATE INDEX idx_users_profile_username ON users_profile(username);
CREATE INDEX idx_users_profile_level ON users_profile(level);
CREATE INDEX idx_users_profile_total_xp ON users_profile(total_xp);

-- Connection indexes
CREATE INDEX idx_connections_requester ON connections(requester_id);
CREATE INDEX idx_connections_addressee ON connections(addressee_id);
CREATE INDEX idx_connections_status ON connections(status);

-- Crew indexes
CREATE INDEX idx_crews_leader ON crews(leader_id);
CREATE INDEX idx_crew_members_crew ON crew_members(crew_id);
CREATE INDEX idx_crew_members_user ON crew_members(user_id);

-- Quest indexes
CREATE INDEX idx_quests_creator ON quests(creator_id);
CREATE INDEX idx_quests_crew ON quests(crew_id);
CREATE INDEX idx_quests_status ON quests(status);
CREATE INDEX idx_quests_category ON quests(category);
CREATE INDEX idx_quest_progress_quest ON quest_progress(quest_id);
CREATE INDEX idx_quest_progress_user ON quest_progress(user_id);

-- Skill indexes
CREATE INDEX idx_skills_category ON skills(category_id);
CREATE INDEX idx_user_skills_user ON user_skills(user_id);
CREATE INDEX idx_user_skills_skill ON user_skills(skill_id);

-- XP and achievement indexes
CREATE INDEX idx_xp_transactions_user ON xp_transactions(user_id);
CREATE INDEX idx_xp_transactions_created ON xp_transactions(created_at);
CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);

-- Notification indexes
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read_status);
CREATE INDEX idx_notifications_created ON notifications(created_at);

-- Activity log indexes
CREATE INDEX idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_type ON activity_logs(activity_type);
CREATE INDEX idx_activity_logs_created ON activity_logs(created_at);

-- Translation indexes
CREATE INDEX idx_translations_key_lang ON translations(key, language);

COMMENT ON DATABASE postgres IS 'LifeQuest - Gamified Life Management App Database';