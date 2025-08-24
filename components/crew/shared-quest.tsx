'use client';

import { useState } from 'react';
import { useTranslation } from '@/hooks/use-translation';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Target, 
  Trophy, 
  Calendar, 
  Users,
  Clock,
  CheckCircle,
  Circle,
  Star,
  Zap,
  ChevronRight
} from 'lucide-react';
import type { Quest, CrewMember } from '@/types';

interface SharedQuestProps {
  quest: Quest;
  members: CrewMember[];
}

export function SharedQuest({ quest, members }: SharedQuestProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);

  // Calculate quest progress based on member participation
  const participatingMembers = members.filter(member => 
    quest.participants?.includes(member.userId)
  );

  const completedByMembers = participatingMembers.filter(member =>
    quest.completedBy?.includes(member.userId)
  );

  const progressPercentage = participatingMembers.length > 0 
    ? (completedByMembers.length / participatingMembers.length) * 100 
    : 0;

  const isUserParticipating = quest.participants?.includes(user?.id || '');
  const isUserCompleted = quest.completedBy?.includes(user?.id || '');

  const formatTimeRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffMs = end.getTime() - now.getTime();
    
    if (diffMs < 0) return t('Expired');
    
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (diffDays > 0) {
      return t('{{days}}d {{hours}}h remaining', { days: diffDays, hours: diffHours });
    } else if (diffHours > 0) {
      return t('{{hours}}h remaining', { hours: diffHours });
    } else {
      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      return t('{{minutes}}m remaining', { minutes: diffMinutes });
    }
  };

  const getQuestTypeIcon = (type: string) => {
    const icons: Record<string, JSX.Element> = {
      daily: <Calendar className="h-4 w-4" />,
      weekly: <Target className="h-4 w-4" />,
      challenge: <Trophy className="h-4 w-4" />,
      milestone: <Star className="h-4 w-4" />,
      collaborative: <Users className="h-4 w-4" />
    };
    return icons[type] || <Target className="h-4 w-4" />;
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors: Record<string, string> = {
      easy: 'text-green-500 bg-green-500/10',
      medium: 'text-yellow-500 bg-yellow-500/10',
      hard: 'text-red-500 bg-red-500/10',
      epic: 'text-purple-500 bg-purple-500/10'
    };
    return colors[difficulty] || colors.medium;
  };

  const isOverdue = quest.endDate && new Date(quest.endDate) < new Date();
  const isCompleted = quest.status === 'completed';

  return (
    <Card className={`transition-all duration-200 ${
      isCompleted ? 'bg-green-50/50 border-green-200' : 
      isOverdue ? 'bg-red-50/50 border-red-200' : 
      'hover:shadow-md'
    }`}>
      <CardHeader 
        className="cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              {getQuestTypeIcon(quest.type || 'daily')}
              <CardTitle className={`text-lg ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                {quest.title}
              </CardTitle>
              <ChevronRight 
                className={`h-4 w-4 text-muted-foreground transition-transform ${
                  expanded ? 'rotate-90' : ''
                }`} 
              />
            </div>
            
            <CardDescription className="line-clamp-2">
              {quest.description}
            </CardDescription>

            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className={getDifficultyColor(quest.difficulty || 'medium')}>
                {t(quest.difficulty || 'medium')}
              </Badge>
              
              <Badge variant="secondary" className="gap-1">
                <Trophy className="h-3 w-3" />
                {quest.xpReward || 0} XP
              </Badge>

              {quest.endDate && (
                <Badge variant={isOverdue ? 'destructive' : 'outline'} className="gap-1">
                  <Clock className="h-3 w-3" />
                  {formatTimeRemaining(quest.endDate)}
                </Badge>
              )}

              {isCompleted && (
                <Badge variant="outline" className="gap-1 text-green-600 bg-green-50">
                  <CheckCircle className="h-3 w-3" />
                  {t('Completed')}
                </Badge>
              )}
            </div>
          </div>

          {/* Quest Status Icon */}
          <div className="ml-4">
            {isCompleted ? (
              <CheckCircle className="h-6 w-6 text-green-500" />
            ) : isUserCompleted ? (
              <CheckCircle className="h-6 w-6 text-blue-500" />
            ) : isUserParticipating ? (
              <Circle className="h-6 w-6 text-primary" />
            ) : (
              <Circle className="h-6 w-6 text-muted-foreground" />
            )}
          </div>
        </div>
      </CardHeader>

      {/* Progress Section - Always Visible */}
      <CardContent className="pt-0 space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{t('Team Progress')}</span>
            <span>{completedByMembers.length}/{participatingMembers.length} {t('completed')}</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Member Avatars */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{t('Participants:')}</span>
            <div className="flex -space-x-2">
              {participatingMembers.slice(0, 5).map((member) => (
                <Avatar 
                  key={member.userId} 
                  className={`h-6 w-6 border-2 border-background ${
                    completedByMembers.some(cm => cm.userId === member.userId)
                      ? 'ring-2 ring-green-500'
                      : 'ring-2 ring-muted'
                  }`}
                  title={`${member.name} - ${completedByMembers.some(cm => cm.userId === member.userId) ? t('Completed') : t('In Progress')}`}
                >
                  <AvatarImage src={member.avatar} />
                  <AvatarFallback className="text-xs">
                    {member.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
              ))}
              {participatingMembers.length > 5 && (
                <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                  <span className="text-xs font-medium">+{participatingMembers.length - 5}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Button */}
          <div className="flex gap-2">
            {!isUserParticipating ? (
              <Button size="sm" variant="outline">
                {t('Join Quest')}
              </Button>
            ) : !isUserCompleted && !isCompleted ? (
              <Button size="sm" className="gap-1">
                <CheckCircle className="h-4 w-4" />
                {t('Mark Complete')}
              </Button>
            ) : null}
          </div>
        </div>

        {/* Expanded Content */}
        {expanded && (
          <div className="space-y-4 border-t pt-4">
            {/* Detailed Progress */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-muted-foreground">{t('Created')}</p>
                <p>{new Date(quest.createdAt).toLocaleDateString()}</p>
              </div>
              {quest.endDate && (
                <div>
                  <p className="font-medium text-muted-foreground">{t('Deadline')}</p>
                  <p>{new Date(quest.endDate).toLocaleDateString()}</p>
                </div>
              )}
            </div>

            {/* Quest Requirements/Steps */}
            {quest.requirements && quest.requirements.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">{t('Requirements')}</h4>
                <ul className="space-y-1 text-sm">
                  {quest.requirements.map((req, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Circle className="h-3 w-3 mt-0.5 text-muted-foreground shrink-0" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Detailed Member Progress */}
            <div>
              <h4 className="font-medium mb-2">{t('Member Progress')}</h4>
              <div className="space-y-2">
                {participatingMembers.map((member) => {
                  const memberCompleted = completedByMembers.some(cm => cm.userId === member.userId);
                  return (
                    <div key={member.userId} className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback className="text-xs">
                          {member.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{member.name || t('Anonymous')}</p>
                      </div>
                      <Badge variant={memberCompleted ? 'default' : 'outline'} className="gap-1">
                        {memberCompleted ? (
                          <>
                            <CheckCircle className="h-3 w-3" />
                            {t('Done')}
                          </>
                        ) : (
                          <>
                            <Clock className="h-3 w-3" />
                            {t('In Progress')}
                          </>
                        )}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Rewards Section */}
            {(quest.xpReward || quest.rewards) && (
              <div className="bg-muted/30 p-3 rounded-lg">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  {t('Rewards')}
                </h4>
                <div className="flex flex-wrap gap-2 text-sm">
                  {quest.xpReward && (
                    <Badge variant="outline" className="gap-1">
                      <Trophy className="h-3 w-3" />
                      {quest.xpReward} XP
                    </Badge>
                  )}
                  {quest.rewards?.map((reward, index) => (
                    <Badge key={index} variant="outline">
                      {reward}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}