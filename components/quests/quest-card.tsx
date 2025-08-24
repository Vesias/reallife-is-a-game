'use client';

import { useState } from 'react';
import { useTranslation } from '@/hooks/use-translation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Calendar, 
  Clock, 
  Star, 
  Users, 
  CheckCircle, 
  PlayCircle,
  MoreHorizontal,
  Flag,
  Target
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { format, formatDistanceToNow } from 'date-fns';
import { de, enUS } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export interface Quest {
  id: string;
  title: string;
  description: string;
  category: 'health' | 'career' | 'learning' | 'social' | 'financial' | 'personal';
  difficulty: 1 | 2 | 3 | 4 | 5;
  status: 'active' | 'completed' | 'paused' | 'failed';
  progress: number;
  xpReward: number;
  createdAt: Date;
  deadline?: Date;
  isDaily: boolean;
  isPublic: boolean;
  tags: string[];
  milestones: string[];
  completedMilestones: number;
  participantCount?: number;
  streak?: number;
}

interface QuestCardProps {
  quest: Quest;
  onComplete?: (questId: string) => void;
  onPause?: (questId: string) => void;
  onResume?: (questId: string) => void;
  onDelete?: (questId: string) => void;
  showActions?: boolean;
}

export function QuestCard({ 
  quest, 
  onComplete, 
  onPause, 
  onResume, 
  onDelete,
  showActions = true 
}: QuestCardProps) {
  const { t, locale } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  const categoryConfig = {
    health: { icon: '🏃‍♂️', color: 'bg-green-100 text-green-800', border: 'border-green-200' },
    career: { icon: '💼', color: 'bg-blue-100 text-blue-800', border: 'border-blue-200' },
    learning: { icon: '📚', color: 'bg-purple-100 text-purple-800', border: 'border-purple-200' },
    social: { icon: '👥', color: 'bg-pink-100 text-pink-800', border: 'border-pink-200' },
    financial: { icon: '💰', color: 'bg-yellow-100 text-yellow-800', border: 'border-yellow-200' },
    personal: { icon: '🌟', color: 'bg-indigo-100 text-indigo-800', border: 'border-indigo-200' }
  };

  const difficultyConfig = {
    1: { label: t('quests.difficulty.easy'), stars: 1, color: 'text-green-500' },
    2: { label: t('quests.difficulty.medium'), stars: 2, color: 'text-yellow-500' },
    3: { label: t('quests.difficulty.hard'), stars: 3, color: 'text-orange-500' },
    4: { label: t('quests.difficulty.expert'), stars: 4, color: 'text-red-500' },
    5: { label: t('quests.difficulty.legendary'), stars: 5, color: 'text-purple-500' }
  };

  const statusConfig = {
    active: { label: t('quests.status.active'), color: 'bg-blue-500' },
    completed: { label: t('quests.status.completed'), color: 'bg-green-500' },
    paused: { label: t('quests.status.paused'), color: 'bg-yellow-500' },
    failed: { label: t('quests.status.failed'), color: 'bg-red-500' }
  };

  const category = categoryConfig[quest.category];
  const difficulty = difficultyConfig[quest.difficulty];
  const status = statusConfig[quest.status];

  const isOverdue = quest.deadline && new Date() > quest.deadline && quest.status === 'active';
  const daysLeft = quest.deadline ? Math.ceil((quest.deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null;

  const formatDate = (date: Date) => {
    const dateLocale = locale === 'de' ? de : enUS;
    if (quest.isDaily) {
      return formatDistanceToNow(date, { addSuffix: true, locale: dateLocale });
    }
    return format(date, 'PPP', { locale: dateLocale });
  };

  const handleAction = (action: string, e: React.MouseEvent) => {
    e.stopPropagation();
    switch (action) {
      case 'complete':
        onComplete?.(quest.id);
        break;
      case 'pause':
        onPause?.(quest.id);
        break;
      case 'resume':
        onResume?.(quest.id);
        break;
      case 'delete':
        onDelete?.(quest.id);
        break;
    }
  };

  return (
    <Card 
      className={cn(
        "relative overflow-hidden transition-all hover:shadow-md cursor-pointer",
        category.border,
        isOverdue && "ring-2 ring-red-200",
        quest.status === 'completed' && "bg-green-50",
        quest.status === 'paused' && "bg-gray-50"
      )}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* Status Indicator */}
      <div className={cn("absolute top-0 left-0 right-0 h-1", status.color)} />

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className={cn("text-xs", category.color)}>
                <span className="mr-1">{category.icon}</span>
                {t(`quests.categories.${quest.category}`)}
              </Badge>
              
              {quest.isDaily && (
                <Badge variant="outline" className="text-xs">
                  <Calendar className="w-3 h-3 mr-1" />
                  {t('quests.daily')}
                </Badge>
              )}
              
              {quest.isPublic && (
                <Badge variant="outline" className="text-xs">
                  <Users className="w-3 h-3 mr-1" />
                  {quest.participantCount || 1}
                </Badge>
              )}
            </div>

            <CardTitle className="text-lg leading-tight mb-1">
              {quest.title}
            </CardTitle>
            
            {quest.description && (
              <CardDescription className="text-sm line-clamp-2">
                {quest.description}
              </CardDescription>
            )}
          </div>

          {showActions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {quest.status === 'active' && (
                  <>
                    <DropdownMenuItem onClick={(e) => handleAction('complete', e)}>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {t('quests.actions.complete')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => handleAction('pause', e)}>
                      <Flag className="w-4 h-4 mr-2" />
                      {t('quests.actions.pause')}
                    </DropdownMenuItem>
                  </>
                )}
                
                {quest.status === 'paused' && (
                  <DropdownMenuItem onClick={(e) => handleAction('resume', e)}>
                    <PlayCircle className="w-4 h-4 mr-2" />
                    {t('quests.actions.resume')}
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuItem 
                  onClick={(e) => handleAction('delete', e)}
                  className="text-red-600"
                >
                  {t('quests.actions.delete')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              {t('quests.progress')}
            </span>
            <span className="text-sm font-medium">
              {quest.progress}%
            </span>
          </div>
          <Progress value={quest.progress} className="h-2" />
          
          {quest.milestones.length > 0 && (
            <div className="text-xs text-muted-foreground mt-1">
              {quest.completedMilestones} / {quest.milestones.length} {t('quests.milestonesCompleted')}
            </div>
          )}
        </div>

        {/* Quest Info */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            {/* Difficulty */}
            <div className="flex items-center gap-1">
              {Array.from({ length: difficulty.stars }).map((_, i) => (
                <Star key={i} className={cn("w-3 h-3 fill-current", difficulty.color)} />
              ))}
              <span className="text-muted-foreground ml-1">{difficulty.label}</span>
            </div>

            {/* XP Reward */}
            <div className="flex items-center gap-1 text-primary font-medium">
              <Target className="w-3 h-3" />
              +{quest.xpReward} XP
            </div>
          </div>

          {/* Deadline Info */}
          <div className="flex items-center gap-1 text-muted-foreground">
            {quest.deadline && (
              <>
                <Clock className="w-3 h-3" />
                <span className={cn(isOverdue && "text-red-500 font-medium")}>
                  {daysLeft !== null && daysLeft > 0 
                    ? t('quests.daysLeft', { days: daysLeft })
                    : isOverdue 
                    ? t('quests.overdue')
                    : formatDate(quest.deadline)
                  }
                </span>
              </>
            )}
            
            {quest.isDaily && quest.streak && (
              <>
                <span className="text-orange-500 font-medium">
                  🔥 {quest.streak}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Tags */}
        {quest.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {quest.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Expanded Content */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t">
            {quest.milestones.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm">{t('quests.milestones')}</h4>
                {quest.milestones.map((milestone, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <CheckCircle 
                      className={cn(
                        "w-4 h-4",
                        index < quest.completedMilestones 
                          ? "text-green-500 fill-current" 
                          : "text-muted-foreground"
                      )}
                    />
                    <span className={cn(
                      index < quest.completedMilestones && "line-through text-muted-foreground"
                    )}>
                      {milestone}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="text-xs text-muted-foreground mt-3">
              {t('quests.created')}: {formatDate(quest.createdAt)}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}