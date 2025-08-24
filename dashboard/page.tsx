'use client';

import { Suspense } from 'react';
import { useDashboard } from '@/hooks/use-dashboard';
import { StatsOverview } from '@/components/dashboard/stats-overview';
import { AgentStatus } from '@/components/dashboard/agent-status';
import { SkillTree } from '@/components/dashboard/skill-tree';
import { ProgressChart } from '@/components/dashboard/progress-chart';
import { ActivityTimeline } from '@/components/dashboard/activity-timeline';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { DailySummary } from '@/components/dashboard/daily-summary';
import { CrewWidget } from '@/components/dashboard/crew-widget';
import { QuestWidget } from '@/components/dashboard/quest-widget';
import { AchievementShowcase } from '@/components/dashboard/achievement-showcase';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslations } from 'next-intl';

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-6">
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-8 w-16" />
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <Skeleton className="h-6 w-32 mb-4" />
          <Skeleton className="h-64 w-full" />
        </Card>
        <Card className="p-6">
          <Skeleton className="h-6 w-24 mb-4" />
          <Skeleton className="h-64 w-full" />
        </Card>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const t = useTranslations('dashboard');
  const { 
    stats, 
    agent, 
    skills, 
    progress, 
    activities, 
    crew, 
    quests, 
    achievements,
    isLoading 
  } = useDashboard();

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>
        <DashboardSkeleton />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Stats Overview */}
      <StatsOverview stats={stats} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Agent Status */}
          <AgentStatus agent={agent} />
          
          {/* Progress Charts */}
          <ProgressChart data={progress} />
          
          {/* Skill Tree */}
          <SkillTree skills={skills} />
          
          {/* Activity Timeline */}
          <ActivityTimeline activities={activities} />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Daily Summary */}
          <DailySummary />
          
          {/* Crew Widget */}
          <CrewWidget crew={crew} />
          
          {/* Quest Widget */}
          <QuestWidget quests={quests} />
          
          {/* Achievement Showcase */}
          <AchievementShowcase achievements={achievements} />
        </div>
      </div>
    </div>
  );
}

// Wrap with Suspense for better loading states
export function Dashboard() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardPage />
    </Suspense>
  );
}