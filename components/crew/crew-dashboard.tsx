'use client';

import { useTranslation } from '@/hooks/use-translation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Trophy, 
  Target, 
  TrendingUp, 
  Calendar,
  Users,
  Crown,
  Star,
  Zap
} from 'lucide-react';
import type { Crew, CrewMember } from '@/types';

interface CrewDashboardProps {
  crew: Crew;
  members: CrewMember[];
}

export function CrewDashboard({ crew, members }: CrewDashboardProps) {
  const { t } = useTranslation();

  // Calculate crew statistics
  const totalXP = crew.totalXP || 0;
  const currentLevel = Math.floor(totalXP / 1000) + 1;
  const xpToNextLevel = ((currentLevel * 1000) - totalXP);
  const levelProgress = ((totalXP % 1000) / 1000) * 100;

  const completedQuests = members.reduce((sum, member) => 
    sum + (member.stats?.completedQuests || 0), 0
  );

  const averageLevel = members.length > 0 
    ? Math.round(members.reduce((sum, member) => 
        sum + (member.stats?.level || 1), 0
      ) / members.length)
    : 1;

  const topPerformer = members.reduce((top, member) => 
    (member.stats?.totalXP || 0) > (top.stats?.totalXP || 0) ? member : top,
    members[0]
  );

  // Get recent achievements
  const recentAchievements = [
    { type: 'level', description: `Reached Level ${currentLevel}`, date: new Date().toISOString() },
    { type: 'quest', description: 'Completed team fitness challenge', date: new Date(Date.now() - 24*60*60*1000).toISOString() },
    { type: 'member', description: 'New member joined the crew', date: new Date(Date.now() - 2*24*60*60*1000).toISOString() }
  ].slice(0, 3);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Crew Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Trophy className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalXP.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">{t('Total XP')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Target className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completedQuests}</p>
                <p className="text-sm text-muted-foreground">{t('Completed Quests')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Users className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{members.length}</p>
                <p className="text-sm text-muted-foreground">{t('Active Members')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{averageLevel}</p>
                <p className="text-sm text-muted-foreground">{t('Average Level')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Crew Level Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            {t('Crew Level Progress')}
          </CardTitle>
          <CardDescription>
            {t('Level {{level}} • {{xp}} XP until next level', { 
              level: currentLevel, 
              xp: xpToNextLevel 
            })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={levelProgress} className="h-3" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{t('Level {{level}}', { level: currentLevel })}</span>
              <span>{totalXP.toLocaleString()} / {(currentLevel * 1000).toLocaleString()} XP</span>
              <span>{t('Level {{level}}', { level: currentLevel + 1 })}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performer */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-500" />
              {t('Top Performer')}
            </CardTitle>
            <CardDescription>
              {t('Most XP earned this month')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {topPerformer ? (
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={topPerformer.avatar} />
                  <AvatarFallback>
                    {topPerformer.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h4 className="font-semibold">{topPerformer.name || t('Anonymous')}</h4>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{t('Level')} {topPerformer.stats?.level || 1}</span>
                    <span>{(topPerformer.stats?.totalXP || 0).toLocaleString()} XP</span>
                  </div>
                </div>
                <Badge variant="outline" className="gap-1">
                  <Trophy className="h-3 w-3" />
                  {t('MVP')}
                </Badge>
              </div>
            ) : (
              <p className="text-muted-foreground">{t('No data available')}</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              {t('Recent Achievements')}
            </CardTitle>
            <CardDescription>
              {t('Latest crew milestones')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAchievements.map((achievement, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className={`p-1 rounded-full ${
                    achievement.type === 'level' ? 'bg-yellow-500/20 text-yellow-500' :
                    achievement.type === 'quest' ? 'bg-blue-500/20 text-blue-500' :
                    'bg-green-500/20 text-green-500'
                  }`}>
                    {achievement.type === 'level' ? (
                      <Star className="h-3 w-3" />
                    ) : achievement.type === 'quest' ? (
                      <Target className="h-3 w-3" />
                    ) : (
                      <Users className="h-3 w-3" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{achievement.description}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {formatDate(achievement.date)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Crew Info */}
      <Card>
        <CardHeader>
          <CardTitle>{t('Crew Information')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="font-medium text-muted-foreground">{t('Created')}</p>
              <p>{formatDate(crew.createdAt)}</p>
            </div>
            <div>
              <p className="font-medium text-muted-foreground">{t('Type')}</p>
              <p className="capitalize">{crew.type || t('General')}</p>
            </div>
            <div>
              <p className="font-medium text-muted-foreground">{t('Privacy')}</p>
              <p>{crew.isPrivate ? t('Private') : t('Public')}</p>
            </div>
            <div>
              <p className="font-medium text-muted-foreground">{t('Max Members')}</p>
              <p>{crew.maxMembers || 5}</p>
            </div>
          </div>

          {crew.tags && crew.tags.length > 0 && (
            <div>
              <p className="font-medium text-muted-foreground mb-2">{t('Tags')}</p>
              <div className="flex flex-wrap gap-2">
                {crew.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {crew.rules && (
            <div>
              <p className="font-medium text-muted-foreground mb-2">{t('Crew Rules')}</p>
              <p className="text-sm bg-muted/30 p-3 rounded-lg">{crew.rules}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}