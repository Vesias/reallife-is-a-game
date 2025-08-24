-- ==========================================
-- LifeQuest Database Schema Validation
-- ==========================================
-- This script validates the database schema
-- and provides sample data for testing

-- Check that all required tables exist
DO $$
BEGIN
    -- Check core tables exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users_profile') THEN
        RAISE EXCEPTION 'Table users_profile does not exist';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'digital_agents') THEN
        RAISE EXCEPTION 'Table digital_agents does not exist';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'crews') THEN
        RAISE EXCEPTION 'Table crews does not exist';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'quests') THEN
        RAISE EXCEPTION 'Table quests does not exist';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'skills') THEN
        RAISE EXCEPTION 'Table skills does not exist';
    END IF;
    
    RAISE NOTICE 'All required tables exist ✓';
END $$;

-- Check that all required indexes exist
DO $$
BEGIN
    -- Check key indexes
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_users_profile_user_id') THEN
        RAISE EXCEPTION 'Index idx_users_profile_user_id does not exist';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_quests_user_id') THEN
        RAISE EXCEPTION 'Index idx_quests_user_id does not exist';
    END IF;
    
    RAISE NOTICE 'All required indexes exist ✓';
END $$;

-- Check that all required views exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'user_dashboard_summary') THEN
        RAISE EXCEPTION 'View user_dashboard_summary does not exist';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'quest_overview') THEN
        RAISE EXCEPTION 'View quest_overview does not exist';
    END IF;
    
    RAISE NOTICE 'All required views exist ✓';
END $$;

-- Check RLS is enabled on all tables
DO $$
DECLARE
    tbl RECORD;
BEGIN
    FOR tbl IN 
        SELECT schemaname, tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename NOT IN ('schema_info', 'skill_categories', 'skills', 'properties', 'achievements', 'translations')
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM pg_class c 
            JOIN pg_namespace n ON c.relnamespace = n.oid 
            WHERE n.nspname = tbl.schemaname 
            AND c.relname = tbl.tablename 
            AND c.relrowsecurity = true
        ) THEN
            RAISE EXCEPTION 'RLS not enabled on table %.%', tbl.schemaname, tbl.tablename;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'RLS enabled on all required tables ✓';
END $$;

-- Validate initial data exists
DO $$
BEGIN
    -- Check skill categories
    IF (SELECT COUNT(*) FROM skill_categories) < 5 THEN
        RAISE EXCEPTION 'Insufficient skill categories loaded';
    END IF;
    
    -- Check properties
    IF (SELECT COUNT(*) FROM properties) < 5 THEN
        RAISE EXCEPTION 'Insufficient properties loaded';
    END IF;
    
    -- Check achievements
    IF (SELECT COUNT(*) FROM achievements) < 5 THEN
        RAISE EXCEPTION 'Insufficient achievements loaded';
    END IF;
    
    -- Check translations
    IF (SELECT COUNT(*) FROM translations WHERE language = 'de') < 10 THEN
        RAISE EXCEPTION 'Insufficient German translations loaded';
    END IF;
    
    RAISE NOTICE 'Initial data validation passed ✓';
END $$;

-- Test functions exist and work
DO $$
DECLARE
    test_level INTEGER;
BEGIN
    -- Test XP to level calculation
    SELECT calculate_user_level(10000) INTO test_level;
    IF test_level != 11 THEN
        RAISE EXCEPTION 'calculate_user_level function not working correctly';
    END IF;
    
    RAISE NOTICE 'Database functions validation passed ✓';
END $$;

-- Performance check - ensure key queries run efficiently
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM user_dashboard_summary LIMIT 1;

EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM quest_overview WHERE status = 'active' LIMIT 10;

-- Final validation summary
SELECT 
    'LifeQuest Database Schema' as component,
    'VALIDATED' as status,
    NOW() as validated_at,
    (SELECT version FROM schema_info ORDER BY applied_at DESC LIMIT 1) as schema_version;

RAISE NOTICE '🎮 LifeQuest database schema validation completed successfully! 🎮';