'use client';

import { useState } from 'react';
import { useTranslation } from '@/hooks/use-translation';
import { Quest } from './quest-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  Calendar, 
  Clock, 
  Star, 
  Users, 
  CheckCircle, 
  PlayCircle,
  PauseCircle,
  Flag,
  Target,
  MessageSquare,
  Share2,
  Edit3,
  Plus
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { de, enUS } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface QuestDetailsProps {
  quest: Quest;
  onComplete?: (questId: string) => void;
  onPause?: (questId: string) => void;
  onResume?: (questId: string) => void;
  onUpdate?: (questId: string, updates: Partial<Quest>) => void;
  showComments?: boolean;
}

interface Comment {
  id: string;
  author: string;
  avatar?: string;
  content: string;
  createdAt: Date;
  likes: number;
}

interface Activity {
  id: string;
  type: 'milestone' | 'progress' | 'comment' | 'shared';
  content: string;
  createdAt: Date;
  author?: string;
}

export function QuestDetails({ 
  quest, 
  onComplete, 
  onPause, 
  onResume, 
  onUpdate,
  showComments = true
}: QuestDetailsProps) {
  const { t, locale } = useTranslation();
  const [newComment, setNewComment] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Mock data - in real app, fetch from API
  const comments: Comment[] = [
    {
      id: '1',
      author: 'Max Mustermann',
      content: 'Great quest! I\'m working on something similar.',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      likes: 3
    },
    {
      id: '2',
      author: 'Anna Schmidt',
      content: 'How do you stay motivated for daily runs?',
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
      likes: 1
    }
  ];

  const activities: Activity[] = [
    {
      id: '1',
      type: 'milestone',
      content: 'Completed milestone: First week of daily runs',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
    },
    {
      id: '2',
      type: 'progress',
      content: 'Updated progress to 25%',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    },
    {
      id: '3',
      type: 'shared',
      content: 'Shared quest publicly',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    }
  ];

  const categoryConfig = {
    health: { icon: '🏃‍♂️', color: 'bg-green-100 text-green-800' },
    career: { icon: '💼', color: 'bg-blue-100 text-blue-800' },
    learning: { icon: '📚', color: 'bg-purple-100 text-purple-800' },
    social: { icon: '👥', color: 'bg-pink-100 text-pink-800' },
    financial: { icon: '💰', color: 'bg-yellow-100 text-yellow-800' },
    personal: { icon: '🌟', color: 'bg-indigo-100 text-indigo-800' }
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
    return format(date, 'PPPp', { locale: dateLocale });
  };

  const handleAction = (action: string) => {
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
    }
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      // In real app, send to API
      console.log('Adding comment:', newComment);
      setNewComment('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Quest Header */}
      <Card>
        <div className={cn("h-2", status.color)} />
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Badge className={cn("text-sm", category.color)}>
                  <span className="mr-1">{category.icon}</span>
                  {t(`quests.categories.${quest.category}`)}
                </Badge>
                
                <Badge variant="outline" className={cn("text-sm", status.color.replace('bg-', 'text-').replace('-500', '-600'))}>
                  {status.label}
                </Badge>
                
                {quest.isDaily && (
                  <Badge variant="outline" className="text-sm">
                    <Calendar className="w-3 h-3 mr-1" />
                    {t('quests.daily')}
                  </Badge>
                )}
                
                {quest.isPublic && (
                  <Badge variant="outline" className="text-sm">
                    <Users className="w-3 h-3 mr-1" />
                    {quest.participantCount || 1}
                  </Badge>
                )}
              </div>

              <CardTitle className="text-2xl mb-2">{quest.title}</CardTitle>
              
              {quest.description && (
                <CardDescription className="text-base leading-relaxed">
                  {quest.description}
                </CardDescription>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                {t('quests.actions.share')}
              </Button>
              
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Edit3 className="h-4 w-4 mr-2" />
                {t('quests.actions.edit')}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Progress Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                {t('quests.progress')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{t('quests.overallProgress')}</span>
                  <span className="text-lg font-bold">{quest.progress}%</span>
                </div>
                <Progress value={quest.progress} className="h-3" />
              </div>

              {quest.milestones.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">{t('quests.milestones')}</h4>
                  <div className="space-y-2">
                    {quest.milestones.map((milestone, index) => (
                      <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                        <CheckCircle 
                          className={cn(
                            "w-5 h-5 flex-shrink-0",
                            index < quest.completedMilestones 
                              ? "text-green-500 fill-current" 
                              : "text-muted-foreground"
                          )}
                        />
                        <span className={cn(
                          "text-sm",
                          index < quest.completedMilestones && "line-through text-muted-foreground"
                        )}>
                          {milestone}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Activity Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>{t('quests.activity')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activities.map((activity, index) => (
                  <div key={activity.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-white text-xs",
                        activity.type === 'milestone' ? 'bg-green-500' :
                        activity.type === 'progress' ? 'bg-blue-500' :
                        activity.type === 'comment' ? 'bg-purple-500' : 'bg-gray-500'
                      )}>
                        {activity.type === 'milestone' ? '🏆' :
                         activity.type === 'progress' ? '📈' :
                         activity.type === 'comment' ? '💬' : '📤'}
                      </div>
                      {index < activities.length - 1 && (
                        <div className="w-px h-6 bg-border mt-2" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="text-sm">{activity.content}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(activity.createdAt, { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Comments Section */}
          {showComments && quest.isPublic && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  {t('quests.comments')} ({comments.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add Comment */}
                <div className="flex gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Textarea
                      placeholder={t('quests.addComment')}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows={2}
                    />
                    <div className="flex justify-end mt-2">
                      <Button 
                        size="sm" 
                        onClick={handleAddComment}
                        disabled={!newComment.trim()}
                      >
                        {t('quests.postComment')}
                      </Button>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Comments List */}
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={comment.avatar} />
                      <AvatarFallback>
                        {comment.author.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{comment.author}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm">{comment.content}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button variant="ghost" size="sm" className="text-xs h-6 px-2">
                          👍 {comment.likes}
                        </Button>
                        <Button variant="ghost" size="sm" className="text-xs h-6 px-2">
                          {t('quests.reply')}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quest Info */}
          <Card>
            <CardHeader>
              <CardTitle>{t('quests.questInfo')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Difficulty */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t('quests.difficulty.label')}</span>
                <div className="flex items-center gap-1">
                  {Array.from({ length: difficulty.stars }).map((_, i) => (
                    <Star key={i} className={cn("w-4 h-4 fill-current", difficulty.color)} />
                  ))}
                  <span className="text-sm ml-1">{difficulty.label}</span>
                </div>
              </div>

              {/* XP Reward */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t('quests.xpReward')}</span>
                <span className="font-medium text-primary">+{quest.xpReward} XP</span>
              </div>

              {/* Deadline */}
              {quest.deadline && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t('quests.deadline')}</span>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span className={cn(
                      "text-sm",
                      isOverdue && "text-red-500 font-medium"
                    )}>
                      {daysLeft !== null && daysLeft > 0 
                        ? t('quests.daysLeft', { days: daysLeft })
                        : isOverdue 
                        ? t('quests.overdue')
                        : format(quest.deadline, 'PPP')
                      }
                    </span>
                  </div>
                </div>
              )}

              {/* Created Date */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t('quests.created')}</span>
                <span className="text-sm">{formatDate(quest.createdAt)}</span>
              </div>

              {/* Streak */}
              {quest.isDaily && quest.streak && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t('quests.streak')}</span>
                  <span className="text-sm font-medium">
                    🔥 {quest.streak} {t('quests.days')}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>{t('quests.actions.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {quest.status === 'active' && (
                <>
                  <Button 
                    className="w-full" 
                    onClick={() => handleAction('complete')}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {t('quests.actions.complete')}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => handleAction('pause')}
                  >
                    <PauseCircle className="w-4 h-4 mr-2" />
                    {t('quests.actions.pause')}
                  </Button>
                </>
              )}

              {quest.status === 'paused' && (
                <Button 
                  className="w-full"
                  onClick={() => handleAction('resume')}
                >
                  <PlayCircle className="w-4 h-4 mr-2" />
                  {t('quests.actions.resume')}
                </Button>
              )}

              {quest.status === 'completed' && (
                <div className="text-center py-4">
                  <div className="text-4xl mb-2">🎉</div>
                  <p className="text-sm text-muted-foreground">
                    {t('quests.completed')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tags */}
          {quest.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>{t('quests.tags')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {quest.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}