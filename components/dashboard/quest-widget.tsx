'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Sword, 
  Clock, 
  Star, 
  Zap, 
  Trophy, 
  Plus,
  ChevronRight,
  Flag,
  Users,
  Target,
  Calendar,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { de, enUS } from 'date-fns/locale';
import { useLocale } from 'next-intl';

interface QuestObjective {
  id: string;
  description: string;
  completed: boolean;
  progress?: number;
  target?: number;
}

interface Quest {
  id: string;
  title: string;
  description: string;
  category: 'daily' | 'weekly' | 'epic' | 'special';
  difficulty: 'easy' | 'medium' | 'hard' | 'legendary';
  xpReward: number;
  objectives: QuestObjective[];
  timeLimit?: Date;
  isGroupQuest: boolean;
  participants?: number;
  maxParticipants?: number;
  status: 'available' | 'active' | 'completed' | 'failed' | 'locked';
  progress: number;
  tags: string[];
}

interface QuestWidgetProps {
  quests: Quest[];
}

const categoryConfig = {
  daily: { color: 'text-blue-500', bg: 'bg-blue-500/10', label: 'Daily' },
  weekly: { color: 'text-green-500', bg: 'bg-green-500/10', label: 'Weekly' },
  epic: { color: 'text-purple-500', bg: 'bg-purple-500/10', label: 'Epic' },
  special: { color: 'text-orange-500', bg: 'bg-orange-500/10', label: 'Special' },
};

const difficultyConfig = {
  easy: { stars: 1, color: 'text-green-500' },
  medium: { stars: 2, color: 'text-yellow-500' },
  hard: { stars: 3, color: 'text-orange-500' },
  legendary: { stars: 5, color: 'text-red-500' },
};

const statusConfig = {
  available: { icon: Flag, color: 'text-gray-500', bg: 'bg-gray-500/10' },
  active: { icon: Zap, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  completed: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10' },
  failed: { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
  locked: { icon: Target, color: 'text-gray-400', bg: 'bg-gray-400/10' },
};

export function QuestWidget({ quests }: QuestWidgetProps) {
  const t = useTranslations('dashboard.quests');
  const locale = useLocale();
  const dateLocale = locale === 'de' ? de : enUS;

  const activeQuests = quests.filter(q => q.status === 'active');
  const availableQuests = quests.filter(q => q.status === 'available').slice(0, 3);
  const completedToday = quests.filter(q => 
    q.status === 'completed' && 
    new Date(q.timeLimit || Date.now()).toDateString() === new Date().toDateString()
  ).length;

  const getTimeRemaining = (quest: Quest) => {
    if (!quest.timeLimit) return null;
    return formatDistanceToNow(quest.timeLimit, { locale: dateLocale });
  };

  const getCompletedObjectives = (quest: Quest) => {
    return quest.objectives.filter(obj => obj.completed).length;
  };

  const renderQuest = (quest: Quest, isActive = false) => {
    const categoryStyle = categoryConfig[quest.category];
    const difficultyStyle = difficultyConfig[quest.difficulty];
    const statusStyle = statusConfig[quest.status];
    const StatusIcon = statusStyle.icon;
    const completedObjectives = getCompletedObjectives(quest);
    const timeRemaining = getTimeRemaining(quest);

    return (
      <div 
        key={quest.id}
        className={cn(
          'p-3 border rounded-lg transition-all hover:shadow-sm',
          isActive ? 'border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20' : 'border-border'
        )}
      >
        <div className="space-y-3">
          {/* Quest Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-sm truncate">{quest.title}</h4>
                <div className={cn('p-1 rounded-full', statusStyle.bg)}>
                  <StatusIcon className={cn('h-3 w-3', statusStyle.color)} />
                </div>
              </div>
              
              <div className="flex items-center gap-2 mb-2">
                <Badge className={cn(categoryStyle.color, categoryStyle.bg)} variant="secondary">
                  {categoryStyle.label}
                </Badge>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: difficultyStyle.stars }).map((_, i) => (
                    <Star key={i} className={cn('h-3 w-3', difficultyStyle.color)} fill="currentColor" />
                  ))}
                </div>
                
                {quest.isGroupQuest && (
                  <Badge variant="outline" className="text-xs h-5">
                    <Users className="h-3 w-3 mr-1" />
                    {quest.participants}/{quest.maxParticipants}
                  </Badge>
                )}
              </div>
              
              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                {quest.description}
              </p>
            </div>
            
            <div className="text-right shrink-0">
              <div className="flex items-center gap-1 text-yellow-500">
                <Zap className="h-3 w-3" />
                <span className="text-xs font-medium">{quest.xpReward}</span>
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                {t('progress')}: {completedObjectives}/{quest.objectives.length}
              </span>
              <span className="font-medium">{Math.round(quest.progress)}%</span>
            </div>
            <Progress value={quest.progress} className="h-1" />
          </div>

          {/* Time & Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {timeRemaining && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{timeRemaining}</span>
                </div>
              )}
              {quest.tags.length > 0 && (
                <div className="flex gap-1">
                  {quest.tags.slice(0, 2).map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs h-4 px-1">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            
            <Button size="sm" variant="outline" className="h-6 text-xs px-2">
              {quest.status === 'available' ? t('start') : t('view')}
              <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  if (quests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sword className="h-5 w-5 text-purple-500" />
            {t('title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="py-8">
            <Sword className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground mb-4">{t('noQuests')}</p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t('exploreQuests')}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sword className="h-5 w-5 text-purple-500" />
            {t('title')}
          </div>
          <div className="flex items-center gap-2">
            {activeQuests.length > 0 && (
              <Badge variant="default">
                {activeQuests.length} {t('active')}
              </Badge>
            )}
            {completedToday > 0 && (
              <Badge variant="secondary">
                +{completedToday} {t('today')}
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Active Quests */}
        {activeQuests.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <Zap className="h-4 w-4 text-blue-500" />
              {t('activeQuests')}
            </h4>
            <div className="space-y-2">
              {activeQuests.map(quest => renderQuest(quest, true))}
            </div>
          </div>
        )}

        {/* Available Quests */}
        {availableQuests.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <Flag className="h-4 w-4 text-gray-500" />
              {t('availableQuests')}
            </h4>
            <ScrollArea className="h-64">
              <div className="space-y-2 pr-2">
                {availableQuests.map(quest => renderQuest(quest))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Quest Stats */}
        <div className="grid grid-cols-3 gap-3 p-3 bg-muted/50 rounded-lg">
          <div className="text-center">
            <div className="text-lg font-bold text-blue-500">
              {activeQuests.length}
            </div>
            <p className="text-xs text-muted-foreground">{t('active')}</p>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-500">
              {quests.filter(q => q.status === 'completed').length}
            </div>
            <p className="text-xs text-muted-foreground">{t('completed')}</p>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-yellow-500">
              {quests.reduce((sum, q) => sum + (q.status === 'completed' ? q.xpReward : 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">{t('xpEarned')}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Button size="sm" variant="outline">
            <Target className="h-4 w-4 mr-2" />
            {t('allQuests')}
          </Button>
          <Button size="sm">
            <Trophy className="h-4 w-4 mr-2" />
            {t('leaderboard')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}