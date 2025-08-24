'use client';

import { useState } from 'react';
import { useTranslation } from '@/hooks/use-translation';
import { useQuests } from '@/hooks/use-quests';
import { QuestList } from '@/components/quests/quest-list';
import { SecondaryGoals } from '@/components/quests/secondary-goals';
import { XpBar } from '@/components/gamification/xp-bar';
import { LevelDisplay } from '@/components/gamification/level-display';
import { AchievementGrid } from '@/components/gamification/achievement-grid';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trophy, Target, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function QuestsPage() {
  const { t } = useTranslation();
  const { quests, dailyGoals, completedQuests } = useQuests();
  const [activeTab, setActiveTab] = useState('active');

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header with Level and XP */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">{t('quests.title')}</h1>
          <p className="text-muted-foreground text-lg">
            {t('quests.subtitle')}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <LevelDisplay />
          <Link href="/quests/create">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              {t('quests.create')}
            </Button>
          </Link>
        </div>
      </div>

      {/* XP Progress */}
      <div className="mb-8">
        <XpBar />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('quests.stats.active')}
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quests.filter(q => q.status === 'active').length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('quests.stats.completed')}
            </CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedQuests.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('quests.stats.dailyStreak')}
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              {t('quests.stats.days')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="active">{t('quests.tabs.active')}</TabsTrigger>
          <TabsTrigger value="daily">{t('quests.tabs.daily')}</TabsTrigger>
          <TabsTrigger value="completed">{t('quests.tabs.completed')}</TabsTrigger>
          <TabsTrigger value="achievements">{t('quests.tabs.achievements')}</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6">
          <QuestList 
            quests={quests.filter(q => q.status === 'active')} 
            showCreateButton={true}
          />
        </TabsContent>

        <TabsContent value="daily" className="mt-6">
          <SecondaryGoals goals={dailyGoals} />
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          <QuestList 
            quests={completedQuests} 
            showCreateButton={false}
          />
        </TabsContent>

        <TabsContent value="achievements" className="mt-6">
          <AchievementGrid />
        </TabsContent>
      </Tabs>
    </div>
  );
}