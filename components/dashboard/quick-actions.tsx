'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Target, 
  Heart, 
  Users, 
  Trophy, 
  Calendar,
  BookOpen,
  Zap,
  Settings,
  ChevronRight,
  Clock,
  Star
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  bgColor: string;
  href: string;
  badge?: string;
  urgent?: boolean;
}

export function QuickActions() {
  const t = useTranslations('dashboard.quickActions');

  const quickActions: QuickAction[] = [
    {
      id: 'add-goal',
      title: t('addGoal'),
      description: t('addGoalDesc'),
      icon: Target,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10 hover:bg-blue-500/20',
      href: '/goals/new',
    },
    {
      id: 'log-habit',
      title: t('logHabit'),
      description: t('logHabitDesc'),
      icon: Heart,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10 hover:bg-red-500/20',
      href: '/habits/log',
      badge: '3',
      urgent: true,
    },
    {
      id: 'join-crew',
      title: t('joinCrew'),
      description: t('joinCrewDesc'),
      icon: Users,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10 hover:bg-green-500/20',
      href: '/crews',
      badge: 'New',
    },
    {
      id: 'view-quests',
      title: t('viewQuests'),
      description: t('viewQuestsDesc'),
      icon: Trophy,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10 hover:bg-purple-500/20',
      href: '/quests',
    },
    {
      id: 'schedule',
      title: t('schedule'),
      description: t('scheduleDesc'),
      icon: Calendar,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10 hover:bg-orange-500/20',
      href: '/schedule',
    },
    {
      id: 'learn-skill',
      title: t('learnSkill'),
      description: t('learnSkillDesc'),
      icon: BookOpen,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-500/10 hover:bg-indigo-500/20',
      href: '/skills',
      badge: '2',
    },
  ];

  const urgentActions = quickActions.filter(action => action.urgent);
  const regularActions = quickActions.filter(action => !action.urgent);

  return (
    <div className="space-y-4">
      {/* Urgent Actions */}
      {urgentActions.length > 0 && (
        <Card className="border-orange-200 dark:border-orange-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-4 w-4 text-orange-500" />
              <h3 className="font-medium text-orange-600 dark:text-orange-400">
                {t('urgentActions')}
              </h3>
              <Badge variant="destructive" className="text-xs">
                {urgentActions.length}
              </Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {urgentActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={action.id}
                    variant="outline"
                    className={cn(
                      'h-auto p-3 justify-start transition-all',
                      action.bgColor,
                      'border-orange-200 dark:border-orange-800'
                    )}
                    asChild
                  >
                    <a href={action.href}>
                      <div className="flex items-center gap-3 w-full">
                        <div className={cn('p-2 rounded-full bg-background/50')}>
                          <Icon className={cn('h-4 w-4', action.color)} />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm">{action.title}</p>
                            {action.badge && (
                              <Badge variant="secondary" className="text-xs h-5">
                                {action.badge}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {action.description}
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </a>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Regular Quick Actions */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-500" />
              <h3 className="font-medium">{t('title')}</h3>
            </div>
            <Button size="sm" variant="outline" asChild>
              <a href="/settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                {t('customize')}
              </a>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {regularActions.map((action) => {
              const Icon = action.icon;
              return (
                <Button
                  key={action.id}
                  variant="outline"
                  className={cn(
                    'h-auto p-4 justify-start transition-all',
                    action.bgColor
                  )}
                  asChild
                >
                  <a href={action.href}>
                    <div className="flex items-center gap-3 w-full">
                      <div className={cn('p-2 rounded-full bg-background/50')}>
                        <Icon className={cn('h-5 w-5', action.color)} />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">{action.title}</p>
                          {action.badge && (
                            <Badge variant="secondary" className="text-xs h-5">
                              {action.badge}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {action.description}
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </a>
                </Button>
              );
            })}
          </div>
          
          {/* Add Custom Action */}
          <div className="mt-4 pt-4 border-t">
            <Button 
              variant="outline" 
              className="w-full justify-start text-muted-foreground hover:text-foreground"
              asChild
            >
              <a href="/settings/quick-actions">
                <Plus className="h-4 w-4 mr-2" />
                {t('addCustomAction')}
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Contextual Suggestions */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Star className="h-4 w-4 text-blue-500" />
            <h3 className="font-medium text-blue-600 dark:text-blue-400">
              {t('suggestions')}
            </h3>
          </div>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>• {t('suggestion1')}</p>
            <p>• {t('suggestion2')}</p>
            <p>• {t('suggestion3')}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}