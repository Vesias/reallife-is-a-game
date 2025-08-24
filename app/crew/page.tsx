'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/use-translation';
import { useAuth } from '@/hooks/use-auth';
import { useCrew } from '@/hooks/use-crew';
import { CrewList } from '@/components/crew/crew-list';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Users, Crown, Target } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CrewPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { crews, loadUserCrews, loading } = useCrew();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'my-crews' | 'discover'>('my-crews');

  useEffect(() => {
    if (user) {
      loadUserCrews(user.id);
    }
  }, [user, loadUserCrews]);

  if (!user) {
    return <div className="flex justify-center items-center min-h-screen">
      {t('Loading...')}
    </div>;
  }

  const handleCreateCrew = () => {
    router.push('/crew/create');
  };

  const stats = {
    totalCrews: crews?.length || 0,
    leadingCrews: crews?.filter(crew => crew.leaderId === user.id).length || 0,
    totalMembers: crews?.reduce((acc, crew) => acc + crew.memberCount, 0) || 0
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            {t('Crew Management')}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t('Build teams, share quests, and achieve greatness together')}
          </p>
        </div>
        <Button onClick={handleCreateCrew} className="gap-2">
          <Plus className="h-4 w-4" />
          {t('Create Crew')}
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('Total Crews')}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCrews}</div>
            <p className="text-xs text-muted-foreground">
              {t('Active memberships')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('Leading')}
            </CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.leadingCrews}</div>
            <p className="text-xs text-muted-foreground">
              {t('Crews you lead')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('Team Members')}
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMembers}</div>
            <p className="text-xs text-muted-foreground">
              {t('Collective strength')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-4 border-b">
        <button
          onClick={() => setActiveTab('my-crews')}
          className={`pb-2 px-1 ${
            activeTab === 'my-crews'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {t('My Crews')}
        </button>
        <button
          onClick={() => setActiveTab('discover')}
          className={`pb-2 px-1 ${
            activeTab === 'discover'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {t('Discover')}
        </button>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {activeTab === 'my-crews' ? (
          <CrewList crews={crews || []} loading={loading} showJoinButton={false} />
        ) : (
          <CrewList crews={[]} loading={loading} showJoinButton={true} />
        )}
      </div>

      {/* Empty State */}
      {!loading && crews?.length === 0 && activeTab === 'my-crews' && (
        <Card className="text-center py-8">
          <CardContent>
            <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">
              {t('No crews yet')}
            </h3>
            <p className="text-muted-foreground mb-4">
              {t('Create your first crew or join an existing one to start collaborating')}
            </p>
            <Button onClick={handleCreateCrew}>
              {t('Create Your First Crew')}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}