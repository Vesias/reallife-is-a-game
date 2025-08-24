'use client'

import { useTranslation, useQuestTranslation, useGamificationTranslation } from '@/hooks/use-translation'
import { LanguageSwitcher } from '@/components/ui/language-switcher'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trophy, Star, Zap, Target, Users, BookOpen } from 'lucide-react'

export default function DemoPage() {
  const { t, formatters, locale, isGerman } = useTranslation()
  const quest = useQuestTranslation()
  const gamification = useGamificationTranslation()

  // Sample data
  const userStats = {
    xp: 2450,
    level: 12,
    coins: 1850,
    completedQuests: 47,
    badges: 8
  }

  const sampleQuests = [
    {
      id: 1,
      type: 'main',
      difficulty: 'normal',
      category: 'health',
      status: 'inProgress'
    },
    {
      id: 2,
      type: 'side',
      difficulty: 'easy',
      category: 'career',
      status: 'completed'
    },
    {
      id: 3,
      type: 'daily',
      difficulty: 'trivial',
      category: 'fitness',
      status: 'notStarted'
    }
  ]

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              {t('onboarding.welcome')}
            </h1>
            <p className="text-lg text-muted-foreground">
              {t('onboarding.subtitle')}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Current locale: {locale} {isGerman ? '(Standard)' : '(Default)'}
            </p>
          </div>
          <LanguageSwitcher variant="dropdown" />
        </div>

        {/* User Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {gamification.t('levels.currentLevel')}
              </CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.level}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {gamification.t('experience.xp')}
              </CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatters.number(userStats.xp)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {gamification.t('rewards.coins')}
              </CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatters.number(userStats.coins)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {quest.t('stats.completedQuests')}
              </CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.completedQuests}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {gamification.t('badges.badges')}
              </CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.badges}</div>
            </CardContent>
          </Card>
        </div>

        {/* Quests Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              {quest.t('filters.activeQuests')}
            </CardTitle>
            <CardDescription>
              {quest.t('filters.allQuests')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sampleQuests.map((questItem) => (
                <div key={questItem.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={questItem.status === 'completed' ? 'default' : 'secondary'}>
                        {quest.t(`types.${questItem.type}`)}
                      </Badge>
                      <Badge variant="outline">
                        {quest.t(`difficulty.${questItem.difficulty}`)}
                      </Badge>
                      <Badge variant="outline">
                        {quest.t(`categories.${questItem.category}`)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {quest.t(`status.${questItem.status}`)}
                    </p>
                  </div>
                  <Button size="sm">
                    {quest.t('actions.start')}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Navigation Demo */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{t('navigation.home')}</CardTitle>
            <CardDescription>
              Navigation elements demonstrating localization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm">
                <Users className="h-4 w-4 mr-2" />
                {t('navigation.createCrew')}
              </Button>
              <Button variant="outline" size="sm">
                <BookOpen className="h-4 w-4 mr-2" />
                {t('navigation.startSideQuest')}
              </Button>
              <Button variant="outline" size="sm">
                <Target className="h-4 w-4 mr-2" />
                {t('navigation.skillsAndTraits')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Gamification Demo */}
        <Card>
          <CardHeader>
            <CardTitle>{gamification.t('achievements.achievements')}</CardTitle>
            <CardDescription>
              Gamification elements with German/English translations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {['firstSteps', 'questMaster', 'streakKeeper', 'explorer', 'achiever', 'perfectionist'].map((badge) => (
                <div key={badge} className="flex items-center gap-3 p-3 border rounded-lg">
                  <Trophy className="h-8 w-8 text-yellow-500" />
                  <div>
                    <p className="font-medium">{gamification.t(`badges.${badge}`)}</p>
                    <p className="text-sm text-muted-foreground">
                      {gamification.t('badges.earnedBadges')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Language Switcher Variants */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Language Switcher Variants</CardTitle>
            <CardDescription>
              Different styles of language switching components
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">Dropdown:</span>
                <LanguageSwitcher variant="dropdown" />
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">Compact:</span>
                <LanguageSwitcher variant="compact" />
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">Button:</span>
                <LanguageSwitcher variant="button" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}