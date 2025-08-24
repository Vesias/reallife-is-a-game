# LifeQuest Database Schema

## Overview

This directory contains the complete Supabase database schema for LifeQuest, a gamified life management application. The schema is designed to support a comprehensive gamification system with users, crews, quests, skills, achievements, and social features.

## Schema Features

### Core Systems
- **User Management**: Extended profiles with gamification elements
- **Gamification**: XP, levels, skills, achievements, and digital AI agents
- **Quest System**: Main goals, daily habits, and progress tracking
- **Crew Collaboration**: Teams of up to 5 members with shared goals
- **Social Features**: Friend connections and networking
- **Internationalization**: German translation support

### Security
- **Row Level Security (RLS)**: Comprehensive policies for data protection
- **Authentication Integration**: Full Supabase Auth integration
- **Privacy Controls**: User-configurable privacy settings

### Performance
- **Optimized Indexes**: Strategic indexing for common queries
- **Database Views**: Pre-computed views for complex data
- **Efficient Queries**: Designed for scalability

## Installation

To apply this schema to your Supabase project:

1. **Using Supabase CLI**:
   ```bash
   supabase db reset
   supabase db push
   ```

2. **Using SQL Editor**:
   - Copy the content of `lifequest-schema.sql`
   - Paste and execute in your Supabase SQL Editor
   - Execute in sections if needed due to size limits

3. **Using Migration**:
   ```bash
   supabase migration new lifequest_initial_schema
   # Copy schema content to the migration file
   supabase db push
   ```

## Database Tables

### User System
- `users_profile` - Extended user data with gamification elements
- `connections` - Social network connections between users
- `user_properties` - User characteristics and stats
- `properties` - Property definitions (energy, focus, etc.)

### Gamification
- `digital_agents` - AI companions with personality and leveling
- `skills` - Skill tree definitions
- `skill_categories` - Organization of skills into categories  
- `user_skills` - User progress in specific skills
- `achievements` - Badge and reward definitions
- `user_achievements` - User's earned achievements
- `xp_transactions` - Complete history of XP gains/losses

### Quest System
- `quests` - Main goals and challenges
- `secondary_goals` - Daily habits and small tasks
- `quest_progress` - Detailed progress tracking

### Crew Collaboration
- `crews` - Teams/groups (max 5 members)
- `crew_members` - Junction table for crew membership

### Analytics & Tracking
- `activity_logs` - User activity tracking
- `notifications` - In-app notification system

### Integrations
- `integrations` - Third-party service connections (LinkedIn, Strava, etc.)

### Internationalization
- `translations` - German and multi-language support

## Key Features

### Gamification Elements
- **XP System**: Automatic XP calculation and level progression
- **Skill Trees**: Hierarchical skill development with prerequisites
- **Achievement System**: Unlockable badges with rarity levels
- **Digital Agents**: AI companions that level up with users
- **User Properties**: Dynamic stats (energy, focus, motivation, etc.)

### Crew System
- Maximum 5 members per crew
- Shared goals and challenges
- Contribution tracking
- Role-based permissions (leader, co-leader, member)

### Quest Management
- Personal and crew quests
- Progress tracking with milestones
- Recurring quest support
- Priority and difficulty levels
- Due date management with status tracking

### Social Features
- Friend connections with status management
- Public/private profile settings
- Activity sharing and visibility controls

## Database Views

Pre-built views for common queries:

- `user_dashboard_summary` - Complete user dashboard data
- `user_skill_progress` - Skill progress with category information
- `crew_details` - Crew information with member statistics
- `quest_overview` - Quest details with progress and timing
- `user_leaderboard` - User rankings and statistics

## Security Model

### Row Level Security
All tables implement RLS policies ensuring:
- Users can only access their own data
- Crew members can access shared crew data
- Public data is appropriately accessible
- System operations can insert system-generated data

### Privacy Controls
- Configurable profile visibility
- Activity visibility settings
- Connection request management

## Triggers and Functions

Automated database functions:
- **XP Updates**: Automatic XP calculation and level progression
- **Quest Progress**: Automatic progress percentage calculation
- **User Activity**: Last activity date tracking
- **Crew Management**: Member count maintenance
- **Timestamp Updates**: Automatic updated_at field management

## Initial Data

The schema includes sample data:
- 8 skill categories (Health, Learning, Career, Social, Creativity, Technology, Life Management, Mindfulness)
- 8 user properties (Energy Level, Focus Score, Motivation, etc.)
- 10 starter achievements
- German and English translations for UI elements

## API Integration

This schema is designed to work seamlessly with:
- Supabase Auth for user authentication
- Supabase Realtime for live updates
- Supabase Storage for file uploads (avatars, evidence)
- Third-party APIs (LinkedIn, Strava, GitHub, etc.)

## Customization

The schema is designed to be flexible and extensible:
- Add new skill categories and skills
- Create custom achievement types
- Extend user properties
- Add new integration services
- Support additional languages

## Performance Considerations

- Strategic indexes for common query patterns
- Views for complex aggregations
- Efficient foreign key relationships
- Optimized for read-heavy workloads typical in gamification

## Future Enhancements

Areas for potential expansion:
- Badge marketplace and trading
- Advanced analytics and insights
- Machine learning for personalized recommendations
- Advanced crew features (tournaments, challenges)
- Enhanced social features (messaging, forums)

## Support

For questions about the schema or implementation:
- Review the inline SQL comments
- Check the table and column documentation
- Refer to Supabase documentation for RLS and Auth integration