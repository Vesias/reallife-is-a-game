'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Clock, 
  CheckCircle, 
  Target, 
  Trophy, 
  Zap, 
  Heart, 
  Star, 
  Calendar,
  User,
  Users,
  BookOpen,
  Activity,
  Filter,
  ArrowRight
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { de, enUS } from 'date-fns/locale';
import { useLocale } from 'next-intl';

interface ActivityItem {
  id: string;
  type: 'goal_completed' | 'habit_logged' | 'achievement_earned' | 'level_up' | 'streak_milestone' | 'quest_started' | 'crew_joined' | 'skill_unlocked';
  title: string;
  description: string;
  timestamp: Date;
  xp?: number;
  category?: string;
  metadata?: Record<string, any>;
  priority: 'low' | 'medium' | 'high';
}

interface ActivityTimelineProps {
  activities: ActivityItem[];
}

type ActivityFilter = 'all' | 'goals' | 'habits' | 'achievements' | 'levels' | 'streaks';

const activityConfig = {
  goal_completed: {
    icon: CheckCircle,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/20',
    label: 'Goal Completed'
  },
  habit_logged: {
    icon: Heart,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
    label: 'Habit Logged'
  },
  achievement_earned: {
    icon: Trophy,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/20',
    label: 'Achievement Earned'
  },
  level_up: {
    icon: Star,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20',
    label: 'Level Up'
  },
  streak_milestone: {
    icon: Zap,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/20',
    label: 'Streak Milestone'
  },
  quest_started: {
    icon: Target,
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-500/10',
    borderColor: 'border-indigo-500/20',
    label: 'Quest Started'
  },
  crew_joined: {
    icon: Users,
    color: 'text-pink-500',
    bgColor: 'bg-pink-500/10',
    borderColor: 'border-pink-500/20',
    label: 'Crew Joined'
  },
  skill_unlocked: {
    icon: BookOpen,
    color: 'text-teal-500',
    bgColor: 'bg-teal-500/10',
    borderColor: 'border-teal-500/20',
    label: 'Skill Unlocked'
  },
};

const priorityConfig = {
  low: 'opacity-70',
  medium: 'opacity-85',
  high: 'opacity-100 ring-1 ring-blue-500/20'
};

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
  const t = useTranslations('dashboard.timeline');
  const locale = useLocale();
  const [filter, setFilter] = useState<ActivityFilter>('all');
  const [showAll, setShowAll] = useState(false);

  const dateLocale = locale === 'de' ? de : enUS;

  // Filter activities
  const filteredActivities = activities.filter(activity => {
    if (filter === 'all') return true;
    
    const filterMap: Record<ActivityFilter, string[]> = {
      all: [],
      goals: ['goal_completed'],
      habits: ['habit_logged'],
      achievements: ['achievement_earned'],
      levels: ['level_up'],
      streaks: ['streak_milestone']
    };
    
    return filterMap[filter]?.includes(activity.type);
  });

  // Show limited or all activities
  const displayedActivities = showAll ? filteredActivities : filteredActivities.slice(0, 10);

  // Group activities by date
  const groupedActivities = displayedActivities.reduce((groups, activity) => {
    const dateKey = activity.timestamp.toDateString();
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(activity);
    return groups;
  }, {} as Record<string, ActivityItem[]>);

  const formatRelativeTime = (date: Date) => {
    return formatDistanceToNow(date, { 
      addSuffix: true, 
      locale: dateLocale 
    });
  };

  const getActivityStats = () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const todayActivities = activities.filter(a => 
      a.timestamp.toDateString() === today.toDateString()
    ).length;
    
    const yesterdayActivities = activities.filter(a => 
      a.timestamp.toDateString() === yesterday.toDateString()
    ).length;
    
    return { todayActivities, yesterdayActivities };
  };

  const { todayActivities, yesterdayActivities } = getActivityStats();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-500" />
            {t('title')}
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {t('today')}: {todayActivities}
            </Badge>
            {yesterdayActivities > 0 && (
              <Badge variant="secondary">
                {t('yesterday')}: {yesterdayActivities}
              </Badge>
            )}
          </div>
        </div>
        
        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={filter === 'all' ? "default" : "outline"}
            onClick={() => setFilter('all')}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            {t('all')}
          </Button>
          {(['goals', 'habits', 'achievements', 'levels', 'streaks'] as ActivityFilter[]).map(f => (
            <Button
              key={f}
              size="sm"
              variant={filter === f ? "default" : "outline"}
              onClick={() => setFilter(f)}
            >
              {t(f)}
            </Button>
          ))}
        </div>
      </CardHeader>
      
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-6">
            {Object.entries(groupedActivities).map(([dateKey, dayActivities]) => {
              const date = new Date(dateKey);
              const isToday = date.toDateString() === new Date().toDateString();
              const isYesterday = date.toDateString() === new Date(Date.now() - 86400000).toDateString();
              
              let dateLabel = date.toLocaleDateString(locale, { 
                weekday: 'long',
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              });
              
              if (isToday) dateLabel = t('today');
              else if (isYesterday) dateLabel = t('yesterday');
              
              return (
                <div key={dateKey} className="space-y-3">
                  <div className="flex items-center gap-2 sticky top-0 bg-background/95 backdrop-blur-sm py-2 -mx-2 px-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <h4 className="font-medium text-sm text-muted-foreground">
                      {dateLabel}
                    </h4>
                    <div className="flex-1 h-px bg-border" />
                    <Badge variant="secondary" className="text-xs">
                      {dayActivities.length}
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    {dayActivities.map((activity, index) => {
                      const config = activityConfig[activity.type];
                      const Icon = config.icon;
                      
                      return (
                        <div 
                          key={activity.id}
                          className={cn(
                            'flex items-start gap-3 p-3 rounded-lg border transition-all hover:shadow-sm',
                            config.bgColor,
                            config.borderColor,
                            priorityConfig[activity.priority]
                          )}
                        >
                          <div className={cn(
                            'p-2 rounded-full shrink-0 mt-0.5',
                            config.bgColor
                          )}>
                            <Icon className={cn('h-4 w-4', config.color)} />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <h4 className="font-medium text-sm mb-1">
                                  {activity.title}
                                </h4>
                                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                                  {activity.description}
                                </p>
                                
                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {formatRelativeTime(activity.timestamp)}
                                  </div>
                                  
                                  {activity.xp && (
                                    <div className="flex items-center gap-1">
                                      <Zap className="h-3 w-3 text-yellow-500" />
                                      +{activity.xp} XP
                                    </div>
                                  )}
                                  
                                  {activity.category && (
                                    <Badge variant="outline" className="text-xs h-5">
                                      {activity.category}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              
                              {activity.priority === 'high' && (
                                <Star className="h-4 w-4 text-yellow-500 shrink-0" />
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            
            {displayedActivities.length === 0 && (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">{t('noActivities')}</p>
              </div>
            )}
            
            {filteredActivities.length > 10 && !showAll && (
              <div className="text-center pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowAll(true)}
                  className="flex items-center gap-2"
                >
                  {t('showMore')} ({filteredActivities.length - 10})
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>
        
        {/* Activity Summary */}
        <div className="mt-4 p-4 bg-muted/50 rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-500">
                {activities.filter(a => a.type === 'goal_completed').length}
              </div>
              <p className="text-xs text-muted-foreground">{t('goalsCompleted')}</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-500">
                {activities.filter(a => a.type === 'habit_logged').length}
              </div>
              <p className="text-xs text-muted-foreground">{t('habitsLogged')}</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-500">
                {activities.filter(a => a.type === 'achievement_earned').length}
              </div>
              <p className="text-xs text-muted-foreground">{t('achievements')}</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-500">
                {activities.reduce((sum, a) => sum + (a.xp || 0), 0)}
              </div>
              <p className="text-xs text-muted-foreground">{t('totalXp')}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}