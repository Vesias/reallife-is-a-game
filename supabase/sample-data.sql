-- ==========================================
-- LifeQuest Sample Data for Development
-- ==========================================
-- This script provides sample data for testing
-- and development purposes

-- ⚠️ WARNING: This should only be run in development environments
-- DO NOT run this in production

-- Insert sample skills for each category
INSERT INTO skills (category_id, name, description, icon, max_level, xp_per_level) 
SELECT 
    sc.id,
    skill_data.name,
    skill_data.description,
    skill_data.icon,
    skill_data.max_level,
    skill_data.xp_per_level
FROM skill_categories sc
CROSS JOIN (VALUES
    -- Health & Fitness skills
    ('Cardiovascular Fitness', 'Improve heart health and endurance through cardio exercise', 'heart', 100, 150),
    ('Strength Training', 'Build muscle strength and power through resistance training', 'dumbbell', 100, 200),
    ('Flexibility & Mobility', 'Enhance range of motion and prevent injuries', 'stretch', 100, 100),
    ('Nutrition Mastery', 'Learn proper nutrition and meal planning', 'apple', 100, 120),
    ('Sleep Optimization', 'Master healthy sleep habits and recovery', 'moon', 100, 80),
    
    -- Learning & Education skills  
    ('Speed Reading', 'Increase reading speed while maintaining comprehension', 'book-open', 100, 100),
    ('Critical Thinking', 'Develop analytical and logical reasoning skills', 'brain', 100, 180),
    ('Memory Techniques', 'Master memorization and retention methods', 'lightbulb', 100, 120),
    ('Research Skills', 'Learn effective information gathering and analysis', 'search', 100, 140),
    ('Note Taking', 'Develop efficient note-taking and organization systems', 'edit-3', 100, 80),
    
    -- Career & Finance skills
    ('Leadership', 'Develop team management and leadership abilities', 'users', 100, 250),
    ('Public Speaking', 'Master presentation and communication skills', 'mic', 100, 200),
    ('Negotiation', 'Learn effective negotiation and persuasion techniques', 'handshake', 100, 180),
    ('Financial Planning', 'Master budgeting, investing, and wealth building', 'dollar-sign', 100, 160),
    ('Time Management', 'Optimize productivity and task prioritization', 'clock', 100, 120),
    
    -- Social & Communication skills
    ('Active Listening', 'Develop deep listening and empathy skills', 'ear', 100, 100),
    ('Conflict Resolution', 'Learn to mediate and resolve disputes effectively', 'shield', 100, 180),
    ('Networking', 'Build meaningful professional and personal connections', 'network', 100, 140),
    ('Emotional Intelligence', 'Understand and manage emotions effectively', 'heart-handshake', 100, 200),
    ('Cross-Cultural Communication', 'Navigate diverse cultural contexts', 'globe', 100, 160),
    
    -- Creativity & Arts skills
    ('Digital Art', 'Create stunning digital artwork and illustrations', 'palette', 100, 150),
    ('Creative Writing', 'Develop storytelling and writing skills', 'pen-tool', 100, 120),
    ('Music Production', 'Compose and produce original music', 'music', 100, 180),
    ('Photography', 'Master composition, lighting, and photo editing', 'camera', 100, 140),
    ('Design Thinking', 'Apply creative problem-solving methodologies', 'lightbulb', 100, 160),
    
    -- Technology & Digital skills
    ('Programming', 'Learn software development and coding', 'code', 100, 200),
    ('Data Analysis', 'Master data visualization and statistical analysis', 'bar-chart', 100, 180),
    ('Digital Marketing', 'Understand online marketing and social media', 'megaphone', 100, 140),
    ('Cybersecurity', 'Learn to protect digital assets and privacy', 'lock', 100, 220),
    ('AI & Machine Learning', 'Understand and apply artificial intelligence', 'cpu', 100, 250),
    
    -- Life Management skills
    ('Goal Setting', 'Learn effective goal-setting and achievement strategies', 'target', 100, 100),
    ('Habit Formation', 'Master the science of building lasting habits', 'repeat', 100, 120),
    ('Stress Management', 'Develop healthy coping mechanisms for stress', 'shield-check', 100, 140),
    ('Decision Making', 'Improve decision-making frameworks and processes', 'git-branch', 100, 160),
    ('Life Planning', 'Create comprehensive life and career plans', 'map', 100, 180),
    
    -- Mindfulness & Wellbeing skills
    ('Meditation', 'Develop mindfulness and meditation practices', 'lotus', 100, 80),
    ('Gratitude Practice', 'Cultivate appreciation and positive thinking', 'heart', 100, 60),
    ('Emotional Regulation', 'Learn to manage and express emotions healthily', 'activity', 100, 120),
    ('Mindful Living', 'Integrate mindfulness into daily activities', 'leaf', 100, 100),
    ('Self-Reflection', 'Develop introspection and self-awareness skills', 'mirror', 100, 140)
) AS skill_data(name, description, icon, max_level, xp_per_level)
WHERE sc.name = CASE 
    WHEN skill_data.name IN ('Cardiovascular Fitness', 'Strength Training', 'Flexibility & Mobility', 'Nutrition Mastery', 'Sleep Optimization') THEN 'Health & Fitness'
    WHEN skill_data.name IN ('Speed Reading', 'Critical Thinking', 'Memory Techniques', 'Research Skills', 'Note Taking') THEN 'Learning & Education'
    WHEN skill_data.name IN ('Leadership', 'Public Speaking', 'Negotiation', 'Financial Planning', 'Time Management') THEN 'Career & Finance'
    WHEN skill_data.name IN ('Active Listening', 'Conflict Resolution', 'Networking', 'Emotional Intelligence', 'Cross-Cultural Communication') THEN 'Social & Communication'
    WHEN skill_data.name IN ('Digital Art', 'Creative Writing', 'Music Production', 'Photography', 'Design Thinking') THEN 'Creativity & Arts'
    WHEN skill_data.name IN ('Programming', 'Data Analysis', 'Digital Marketing', 'Cybersecurity', 'AI & Machine Learning') THEN 'Technology & Digital'
    WHEN skill_data.name IN ('Goal Setting', 'Habit Formation', 'Stress Management', 'Decision Making', 'Life Planning') THEN 'Life Management'
    WHEN skill_data.name IN ('Meditation', 'Gratitude Practice', 'Emotional Regulation', 'Mindful Living', 'Self-Reflection') THEN 'Mindfulness & Wellbeing'
END
ON CONFLICT DO NOTHING;

-- Add more achievements for a complete experience
INSERT INTO achievements (name, description, category, rarity, icon, unlock_criteria, xp_reward, sort_order) VALUES
-- Skill-based achievements
('Skill Explorer', 'Unlock 5 different skills', 'skill', 'common', 'compass', '{"skills_unlocked": 5}', 200, 11),
('Skill Collector', 'Unlock 10 different skills', 'skill', 'rare', 'collection', '{"skills_unlocked": 10}', 500, 12),
('Renaissance Person', 'Unlock skills from 5 different categories', 'skill', 'epic', 'star', '{"skill_categories": 5}', 1000, 13),
('Dedication', 'Practice the same skill for 30 days straight', 'habit', 'rare', 'flame', '{"skill_practice_streak": 30}', 600, 14),

-- Quest achievements
('Goal Getter', 'Complete 10 quests', 'quest', 'common', 'check-circle', '{"quests_completed": 10}', 300, 15),
('Achiever', 'Complete 25 quests', 'quest', 'rare', 'award', '{"quests_completed": 25}', 700, 16),
('Perfectionist', 'Complete 5 quests with 100% accuracy', 'quest', 'rare', 'target', '{"perfect_quests": 5}', 500, 17),
('Speed Demon', 'Complete a quest ahead of deadline', 'quest', 'common', 'zap', '{"early_completion": 1}', 150, 18),

-- Social achievements
('Connector', 'Connect with 10 friends', 'social', 'common', 'link', '{"connections": 10}', 200, 19),
('Crew Leader', 'Create and lead a successful crew', 'social', 'rare', 'crown', '{"crews_created": 1, "crew_members": 3}', 800, 20),
('Mentor', 'Help 5 crew members complete their goals', 'social', 'epic', 'graduation-cap', '{"mentoring_assists": 5}', 1200, 21),

-- Streak achievements
('Consistency King', 'Maintain a 30-day streak', 'habit', 'epic', 'calendar', '{"streak_days": 30}', 800, 22),
('Unstoppable', 'Maintain a 100-day streak', 'habit', 'legendary', 'fire', '{"streak_days": 100}', 2000, 23),

-- XP achievements
('Rising Star', 'Earn 1,000 XP', 'progression', 'common', 'trending-up', '{"total_xp": 1000}', 100, 24),
('XP Hunter', 'Earn 5,000 XP', 'progression', 'rare', 'target', '{"total_xp": 5000}', 300, 25),
('XP Master', 'Earn 25,000 XP', 'progression', 'epic', 'diamond', '{"total_xp": 25000}', 1500, 26),

-- Special achievements
('Early Bird', 'Complete morning routine for 7 days', 'habit', 'common', 'sunrise', '{"morning_routine": 7}', 200, 27),
('Night Owl', 'Complete evening routine for 7 days', 'habit', 'common', 'moon', '{"evening_routine": 7}', 200, 28),
('Well Rounded', 'Have active quests in 3 different categories', 'quest', 'rare', 'circle', '{"quest_categories": 3}', 400, 29),
('Overachiever', 'Complete 3 quests in a single day', 'quest', 'rare', 'battery', '{"daily_completions": 3}', 600, 30);

-- Add more German translations
INSERT INTO translations (key, language, value, context) VALUES
-- Achievement names in German
('achievement.welcome_aboard', 'de', 'Willkommen an Bord', 'achievements'),
('achievement.first_steps', 'de', 'Erste Schritte', 'achievements'),
('achievement.skill_seeker', 'de', 'Fähigkeitssuchender', 'achievements'),
('achievement.team_player', 'de', 'Teamplayer', 'achievements'),
('achievement.week_warrior', 'de', 'Wochenkrieger', 'achievements'),
('achievement.level_up', 'de', 'Level Up', 'achievements'),
('achievement.quest_master', 'de', 'Quest-Meister', 'achievements'),
('achievement.skill_master', 'de', 'Fähigkeitsmeister', 'achievements'),
('achievement.legend', 'de', 'Legende', 'achievements'),
('achievement.social_butterfly', 'de', 'Sozialer Schmetterling', 'achievements'),

-- UI Elements
('ui.level', 'de', 'Level', 'general'),
('ui.xp', 'de', 'XP', 'general'),
('ui.streak', 'de', 'Serie', 'general'),
('ui.progress', 'de', 'Fortschritt', 'general'),
('ui.completed', 'de', 'Abgeschlossen', 'general'),
('ui.in_progress', 'de', 'In Bearbeitung', 'general'),
('ui.not_started', 'de', 'Nicht begonnen', 'general'),

-- Quest types
('quest.type.daily', 'de', 'Täglich', 'quests'),
('quest.type.weekly', 'de', 'Wöchentlich', 'quests'),
('quest.type.monthly', 'de', 'Monatlich', 'quests'),
('quest.type.personal', 'de', 'Persönlich', 'quests'),
('quest.type.crew', 'de', 'Team', 'quests'),

-- Difficulty levels
('difficulty.easy', 'de', 'Einfach', 'general'),
('difficulty.medium', 'de', 'Mittel', 'general'),
('difficulty.hard', 'de', 'Schwer', 'general'),
('difficulty.expert', 'de', 'Experte', 'general'),

-- Rarity levels
('rarity.common', 'de', 'Gewöhnlich', 'achievements'),
('rarity.rare', 'de', 'Selten', 'achievements'),
('rarity.epic', 'de', 'Episch', 'achievements'),
('rarity.legendary', 'de', 'Legendär', 'achievements');

-- Sample notification types with translations
INSERT INTO translations (key, language, value, context) VALUES
-- Notification types
('notification.quest_reminder', 'de', 'Quest-Erinnerung', 'notifications'),
('notification.achievement_unlock', 'de', 'Erfolg freigeschaltet', 'notifications'),
('notification.crew_invite', 'de', 'Team-Einladung', 'notifications'),
('notification.friend_request', 'de', 'Freundschaftsanfrage', 'notifications'),
('notification.milestone_reached', 'de', 'Meilenstein erreicht', 'notifications'),
('notification.level_up', 'de', 'Level aufgestiegen', 'notifications'),
('notification.streak_milestone', 'de', 'Serie-Meilenstein', 'notifications'),
('notification.crew_goal_completed', 'de', 'Team-Ziel abgeschlossen', 'notifications');

-- Add sample property descriptions in German
INSERT INTO translations (key, language, value, context) VALUES
('property.energy_level', 'de', 'Energie-Level', 'properties'),
('property.focus_score', 'de', 'Fokus-Punkte', 'properties'),
('property.motivation', 'de', 'Motivation', 'properties'),
('property.stress_level', 'de', 'Stress-Level', 'properties'),
('property.happiness', 'de', 'Glück', 'properties'),
('property.confidence', 'de', 'Selbstvertrauen', 'properties'),
('property.creativity', 'de', 'Kreativität', 'properties'),
('property.social_connection', 'de', 'Soziale Verbindung', 'properties');

-- Add English translations for all new content
INSERT INTO translations (key, language, value, context) VALUES
-- Achievement names in English
('achievement.welcome_aboard', 'en', 'Welcome Aboard', 'achievements'),
('achievement.first_steps', 'en', 'First Steps', 'achievements'),
('achievement.skill_seeker', 'en', 'Skill Seeker', 'achievements'),
('achievement.team_player', 'en', 'Team Player', 'achievements'),
('achievement.week_warrior', 'en', 'Week Warrior', 'achievements'),
('achievement.level_up', 'en', 'Level Up', 'achievements'),
('achievement.quest_master', 'en', 'Quest Master', 'achievements'),
('achievement.skill_master', 'en', 'Skill Master', 'achievements'),
('achievement.legend', 'en', 'Legend', 'achievements'),
('achievement.social_butterfly', 'en', 'Social Butterfly', 'achievements'),

-- UI Elements (English)
('ui.level', 'en', 'Level', 'general'),
('ui.xp', 'en', 'XP', 'general'),
('ui.streak', 'en', 'Streak', 'general'),
('ui.progress', 'en', 'Progress', 'general'),
('ui.completed', 'en', 'Completed', 'general'),
('ui.in_progress', 'en', 'In Progress', 'general'),
('ui.not_started', 'en', 'Not Started', 'general'),

-- Quest types (English)
('quest.type.daily', 'en', 'Daily', 'quests'),
('quest.type.weekly', 'en', 'Weekly', 'quests'),
('quest.type.monthly', 'en', 'Monthly', 'quests'),
('quest.type.personal', 'en', 'Personal', 'quests'),
('quest.type.crew', 'en', 'Crew', 'quests');

-- Summary information
SELECT 'Sample Data Load Complete' as status,
       (SELECT COUNT(*) FROM skills) as total_skills,
       (SELECT COUNT(*) FROM achievements) as total_achievements,
       (SELECT COUNT(*) FROM translations WHERE language = 'de') as german_translations,
       (SELECT COUNT(*) FROM translations WHERE language = 'en') as english_translations;

RAISE NOTICE '🎮 Sample data loaded successfully for LifeQuest development! 🎮';