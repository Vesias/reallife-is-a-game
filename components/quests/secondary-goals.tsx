'use client';

import { useState } from 'react';
import { useTranslation } from '@/hooks/use-translation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Calendar, 
  Plus, 
  CheckCircle, 
  Clock, 
  Flame,
  MoreHorizontal,
  Edit3,
  Trash2
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';
import { de, enUS } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export interface SecondaryGoal {
  id: string;
  title: string;
  description?: string;
  category: 'health' | 'productivity' | 'learning' | 'social' | 'mindfulness';
  frequency: 'daily' | 'weekly' | 'custom';
  targetCount: number;
  currentCount: number;
  xpReward: number;
  isCompleted: boolean;
  completedDates: Date[];
  streak: number;
  bestStreak: number;
  createdAt: Date;
  color: string;
}

interface SecondaryGoalsProps {
  goals: SecondaryGoal[];
  onAddGoal?: (goal: Omit<SecondaryGoal, 'id' | 'createdAt' | 'completedDates' | 'currentCount' | 'isCompleted' | 'streak' | 'bestStreak'>) => void;
  onUpdateGoal?: (goalId: string, updates: Partial<SecondaryGoal>) => void;
  onDeleteGoal?: (goalId: string) => void;
  onCompleteGoal?: (goalId: string) => void;
}

export function SecondaryGoals({ 
  goals = [], 
  onAddGoal, 
  onUpdateGoal, 
  onDeleteGoal,
  onCompleteGoal 
}: SecondaryGoalsProps) {
  const { t, locale } = useTranslation();
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<SecondaryGoal['category']>('health');

  const dateLocale = locale === 'de' ? de : enUS;
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const categories = [
    { value: 'health', label: t('quests.categories.health'), icon: '🏃‍♂️', color: 'bg-green-100 text-green-800' },
    { value: 'productivity', label: t('secondaryGoals.categories.productivity'), icon: '⚡', color: 'bg-blue-100 text-blue-800' },
    { value: 'learning', label: t('quests.categories.learning'), icon: '📚', color: 'bg-purple-100 text-purple-800' },
    { value: 'social', label: t('quests.categories.social'), icon: '👥', color: 'bg-pink-100 text-pink-800' },
    { value: 'mindfulness', label: t('secondaryGoals.categories.mindfulness'), icon: '🧘‍♂️', color: 'bg-orange-100 text-orange-800' }
  ];

  const handleAddGoal = () => {
    if (!newGoalTitle.trim()) return;

    const newGoal: Omit<SecondaryGoal, 'id' | 'createdAt' | 'completedDates' | 'currentCount' | 'isCompleted' | 'streak' | 'bestStreak'> = {
      title: newGoalTitle,
      category: selectedCategory,
      frequency: 'daily',
      targetCount: 1,
      xpReward: 10,
      color: categories.find(c => c.value === selectedCategory)?.color || 'bg-gray-100 text-gray-800'
    };

    onAddGoal?.(newGoal);
    setNewGoalTitle('');
    setIsAddingGoal(false);
  };

  const handleCompleteGoal = (goalId: string) => {
    onCompleteGoal?.(goalId);
  };

  const getTodayProgress = (goal: SecondaryGoal) => {
    if (goal.frequency === 'daily') {
      const todayCompleted = goal.completedDates.some(date => isSameDay(date, today));
      return todayCompleted ? 1 : 0;
    }
    return goal.currentCount;
  };

  const getWeekProgress = (goal: SecondaryGoal) => {
    const thisWeekCompletions = goal.completedDates.filter(date => 
      date >= weekStart && date <= weekEnd
    ).length;
    return thisWeekCompletions;
  };

  const totalXpToday = goals.reduce((total, goal) => {
    return total + (getTodayProgress(goal) > 0 ? goal.xpReward : 0);
  }, 0);

  const completedTodayCount = goals.filter(goal => getTodayProgress(goal) > 0).length;

  return (
    <div className="space-y-6">
      {/* Daily Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('secondaryGoals.todayCompleted')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTodayCount}</div>
            <p className="text-xs text-muted-foreground">
              {t('secondaryGoals.of')} {goals.length} {t('secondaryGoals.goals')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('secondaryGoals.xpEarnedToday')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">+{totalXpToday}</div>
            <p className="text-xs text-muted-foreground">XP</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('secondaryGoals.bestStreak')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.max(...goals.map(g => g.bestStreak), 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('secondaryGoals.days')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('secondaryGoals.weeklyProgress')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {goals.reduce((total, goal) => total + getWeekProgress(goal), 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('secondaryGoals.completions')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Add Goal Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t('secondaryGoals.dailyHabits')}</CardTitle>
              <CardDescription>{t('secondaryGoals.description')}</CardDescription>
            </div>
            <Button onClick={() => setIsAddingGoal(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              {t('secondaryGoals.addGoal')}
            </Button>
          </div>
        </CardHeader>

        {isAddingGoal && (
          <CardContent className="border-t">
            <div className="flex gap-2 items-center">
              <Input
                placeholder={t('secondaryGoals.goalPlaceholder')}
                value={newGoalTitle}
                onChange={(e) => setNewGoalTitle(e.target.value)}
                className="flex-1"
                onKeyPress={(e) => e.key === 'Enter' && handleAddGoal()}
              />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as SecondaryGoal['category'])}
                className="px-3 py-2 border border-input rounded-md"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>
              <Button onClick={handleAddGoal} disabled={!newGoalTitle.trim()}>
                {t('common.add')}
              </Button>
              <Button variant="outline" onClick={() => setIsAddingGoal(false)}>
                {t('common.cancel')}
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Goals List */}
      {goals.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 text-6xl opacity-20">📋</div>
            <h3 className="text-lg font-medium mb-2">
              {t('secondaryGoals.empty.title')}
            </h3>
            <p className="text-muted-foreground mb-4 max-w-md">
              {t('secondaryGoals.empty.description')}
            </p>
            <Button onClick={() => setIsAddingGoal(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              {t('secondaryGoals.addFirstGoal')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map((goal) => {
            const category = categories.find(c => c.value === goal.category);
            const todayProgress = getTodayProgress(goal);
            const isCompletedToday = todayProgress >= goal.targetCount;
            const progressPercentage = Math.min((todayProgress / goal.targetCount) * 100, 100);

            return (
              <Card key={goal.id} className={cn(
                "relative transition-all hover:shadow-md",
                isCompletedToday && "bg-green-50 border-green-200"
              )}>
                {/* Completion indicator */}
                {isCompletedToday && (
                  <div className="absolute top-0 right-0 p-2">
                    <CheckCircle className="w-5 h-5 text-green-500 fill-current" />
                  </div>
                )}

                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={cn("text-xs", goal.color || category?.color)}>
                          <span className="mr-1">{category?.icon}</span>
                          {category?.label}
                        </Badge>
                        
                        {goal.streak > 0 && (
                          <Badge variant="outline" className="text-xs">
                            <Flame className="w-3 h-3 mr-1 text-orange-500" />
                            {goal.streak}
                          </Badge>
                        )}
                      </div>

                      <CardTitle className="text-base leading-tight">
                        {goal.title}
                      </CardTitle>
                      
                      {goal.description && (
                        <CardDescription className="text-sm">
                          {goal.description}
                        </CardDescription>
                      )}
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit3 className="w-4 h-4 mr-2" />
                          {t('common.edit')}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => onDeleteGoal?.(goal.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          {t('common.delete')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>

                <CardContent>
                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">
                        {t('secondaryGoals.todayProgress')}
                      </span>
                      <span className="text-sm font-medium">
                        {todayProgress} / {goal.targetCount}
                      </span>
                    </div>
                    <Progress value={progressPercentage} className="h-2" />
                  </div>

                  {/* Weekly Calendar */}
                  <div className="mb-4">
                    <div className="text-xs text-muted-foreground mb-2">
                      {t('secondaryGoals.thisWeek')}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {weekDays.map((day, index) => {
                        const isCompleted = goal.completedDates.some(date => isSameDay(date, day));
                        const isToday = isSameDay(day, today);
                        
                        return (
                          <div
                            key={index}
                            className={cn(
                              "h-6 w-6 rounded text-xs flex items-center justify-center",
                              isCompleted ? "bg-green-500 text-white" : "bg-muted",
                              isToday && "ring-2 ring-primary ring-offset-1"
                            )}
                          >
                            {format(day, 'd')}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-primary font-medium">
                        +{goal.xpReward} XP
                      </span>
                      {goal.bestStreak > 0 && (
                        <span className="text-xs text-muted-foreground">
                          {t('secondaryGoals.best')}: {goal.bestStreak}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={isCompletedToday}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            handleCompleteGoal(goal.id);
                          }
                        }}
                        disabled={isCompletedToday}
                      />
                      <span className="text-sm">
                        {isCompletedToday ? t('secondaryGoals.completed') : t('secondaryGoals.markComplete')}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}