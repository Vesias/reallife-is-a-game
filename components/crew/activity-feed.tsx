'use client';

import { useTranslation } from '@/hooks/use-translation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Activity, 
  Trophy, 
  Target, 
  Users, 
  Crown,
  Star,
  Calendar,
  MessageCircle,
  TrendingUp,
  Plus,
  CheckCircle
} from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'quest_completed' | 'member_joined' | 'level_up' | 'achievement' | 'message' | 'quest_created';
  userId: string;
  userName: string;
  userAvatar?: string;
  description: string;
  timestamp: string;
  metadata?: {
    questTitle?: string;
    level?: number;
    xpGained?: number;
    achievementName?: string;
    [key: string]: any;
  };
}

interface ActivityFeedProps {
  activities: ActivityItem[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  const { t } = useTranslation();

  const getActivityIcon = (type: string) => {
    const icons: Record<string, JSX.Element> = {
      quest_completed: <CheckCircle className="h-4 w-4 text-green-500" />,
      member_joined: <Users className="h-4 w-4 text-blue-500" />,
      level_up: <TrendingUp className="h-4 w-4 text-purple-500" />,
      achievement: <Trophy className="h-4 w-4 text-yellow-500" />,
      message: <MessageCircle className="h-4 w-4 text-gray-500" />,
      quest_created: <Plus className="h-4 w-4 text-primary" />
    };
    return icons[type] || <Activity className="h-4 w-4 text-muted-foreground" />;
  };

  const getActivityColor = (type: string) => {
    const colors: Record<string, string> = {
      quest_completed: 'bg-green-50 border-green-200',
      member_joined: 'bg-blue-50 border-blue-200',
      level_up: 'bg-purple-50 border-purple-200',
      achievement: 'bg-yellow-50 border-yellow-200',
      message: 'bg-gray-50 border-gray-200',
      quest_created: 'bg-primary/5 border-primary/20'
    };
    return colors[type] || 'bg-muted/30 border-border';
  };

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMinutes < 1) return t('Just now');
    if (diffMinutes < 60) return t('{{minutes}}m ago', { minutes: diffMinutes });
    if (diffHours < 24) return t('{{hours}}h ago', { hours: diffHours });
    if (diffDays < 7) return t('{{days}}d ago', { days: diffDays });
    
    return date.toLocaleDateString();
  };

  const getActivityDescription = (activity: ActivityItem) => {
    const { type, userName, metadata } = activity;
    
    switch (type) {
      case 'quest_completed':
        return t('{{name}} completed "{{quest}}" and earned {{xp}} XP', {
          name: userName,
          quest: metadata?.questTitle || t('a quest'),
          xp: metadata?.xpGained || 0
        });
      case 'member_joined':
        return t('{{name}} joined the crew', { name: userName });
      case 'level_up':
        return t('{{name}} reached level {{level}}!', {
          name: userName,
          level: metadata?.level || 1
        });
      case 'achievement':
        return t('{{name}} earned "{{achievement}}"', {
          name: userName,
          achievement: metadata?.achievementName || t('an achievement')
        });
      case 'message':
        return t('{{name}} sent a message', { name: userName });
      case 'quest_created':
        return t('{{name}} created a new quest: "{{quest}}"', {
          name: userName,
          quest: metadata?.questTitle || t('New Quest')
        });
      default:
        return activity.description || t('Unknown activity');
    }
  };

  // Group activities by day
  const groupedActivities = activities.reduce((groups, activity) => {
    const date = new Date(activity.timestamp).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(activity);
    return groups;
  }, {} as Record<string, ActivityItem[]>);

  const sortedDates = Object.keys(groupedActivities).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            {t('Activity Feed')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Activity className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">{t('No activity yet')}</h3>
            <p className="text-muted-foreground">
              {t('Crew activity will appear here as members complete quests and interact')}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          {t('Activity Feed')}
        </CardTitle>
        <CardDescription>
          {t('Recent crew member activities and achievements')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {sortedDates.slice(0, 7).map((date) => (
            <div key={date} className="space-y-3">
              {/* Date Header */}
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {new Date(date).toLocaleDateString() === new Date().toDateString()
                  ? t('Today')
                  : new Date(date).toLocaleDateString() === 
                    new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString()
                  ? t('Yesterday')
                  : new Date(date).toLocaleDateString()
                }
              </div>

              {/* Activities for this date */}
              <div className="space-y-3">
                {groupedActivities[date].slice(0, 10).map((activity) => (
                  <div
                    key={activity.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border transition-colors hover:shadow-sm ${getActivityColor(activity.type)}`}
                  >
                    {/* Avatar */}
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarImage src={activity.userAvatar} />
                      <AvatarFallback className="text-xs">
                        {activity.userName.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>

                    {/* Activity Content */}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-start gap-2">
                        {getActivityIcon(activity.type)}
                        <div className="flex-1">
                          <p className="text-sm">
                            {getActivityDescription(activity)}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted-foreground">
                              {formatTimeAgo(activity.timestamp)}
                            </span>
                            
                            {/* Additional metadata badges */}
                            {activity.type === 'quest_completed' && activity.metadata?.xpGained && (
                              <Badge variant="outline" className="text-xs gap-1">
                                <Trophy className="h-3 w-3" />
                                {activity.metadata.xpGained} XP
                              </Badge>
                            )}
                            
                            {activity.type === 'level_up' && activity.metadata?.level && (
                              <Badge variant="outline" className="text-xs gap-1">
                                <Star className="h-3 w-3" />
                                Level {activity.metadata.level}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Load More Indicator */}
          {activities.length > 20 && (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">
                {t('Showing recent {{count}} activities', { count: Math.min(20, activities.length) })}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}