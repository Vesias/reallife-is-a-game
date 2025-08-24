'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  TreePine, 
  Star, 
  Lock, 
  CheckCircle, 
  Circle, 
  Zap,
  Book,
  Dumbbell,
  Heart,
  Brain,
  Target,
  Trophy,
  Clock,
  Users
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface Skill {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'health' | 'mind' | 'social' | 'productivity' | 'creativity';
  level: number;
  maxLevel: number;
  xp: number;
  xpToNext: number;
  unlocked: boolean;
  prerequisites: string[];
  rewards: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

interface SkillTreeProps {
  skills: Skill[];
}

const skillIcons = {
  health: Heart,
  mind: Brain,
  social: Users,
  productivity: Target,
  creativity: Star,
  fitness: Dumbbell,
  learning: Book,
  focus: Zap,
  time: Clock,
  achievement: Trophy,
};

const categoryColors = {
  health: 'text-red-500 bg-red-500/10',
  mind: 'text-purple-500 bg-purple-500/10',
  social: 'text-blue-500 bg-blue-500/10',
  productivity: 'text-green-500 bg-green-500/10',
  creativity: 'text-yellow-500 bg-yellow-500/10',
};

const difficultyColors = {
  beginner: 'bg-green-500',
  intermediate: 'bg-yellow-500',
  advanced: 'bg-orange-500',
  expert: 'bg-red-500',
};

export function SkillTree({ skills }: SkillTreeProps) {
  const t = useTranslations('dashboard.skillTree');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);

  const categories = Array.from(new Set(skills.map(s => s.category)));
  const filteredSkills = selectedCategory 
    ? skills.filter(s => s.category === selectedCategory)
    : skills;

  const getSkillIcon = (iconName: string) => {
    const Icon = skillIcons[iconName as keyof typeof skillIcons] || Circle;
    return Icon;
  };

  const getSkillProgress = (skill: Skill) => {
    if (skill.level === skill.maxLevel) return 100;
    return (skill.xp / skill.xpToNext) * 100;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TreePine className="h-5 w-5 text-green-500" />
          {t('title')}
        </CardTitle>
        
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mt-4">
          <Button
            size="sm"
            variant={selectedCategory === null ? "default" : "outline"}
            onClick={() => setSelectedCategory(null)}
          >
            {t('allCategories')}
          </Button>
          {categories.map(category => (
            <Button
              key={category}
              size="sm"
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
            >
              {t(`categories.${category}`)}
            </Button>
          ))}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Skills Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSkills.map((skill) => {
            const Icon = getSkillIcon(skill.icon);
            const progress = getSkillProgress(skill);
            const isMaxLevel = skill.level === skill.maxLevel;
            
            return (
              <Card 
                key={skill.id} 
                className={cn(
                  'cursor-pointer transition-all hover:shadow-md border-2',
                  skill.unlocked 
                    ? 'border-transparent hover:border-blue-200 dark:hover:border-blue-800'
                    : 'border-gray-200 dark:border-gray-800 opacity-60',
                  selectedSkill?.id === skill.id && 'ring-2 ring-blue-500'
                )}
                onClick={() => setSelectedSkill(skill)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      'p-2 rounded-full',
                      skill.unlocked 
                        ? categoryColors[skill.category]
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                    )}>
                      {skill.unlocked ? (
                        <Icon className="h-5 w-5" />
                      ) : (
                        <Lock className="h-5 w-5" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={cn(
                          'font-medium truncate',
                          !skill.unlocked && 'text-muted-foreground'
                        )}>
                          {skill.name}
                        </h4>
                        {isMaxLevel && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {skill.description}
                      </p>
                      
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {t(`difficulties.${skill.difficulty}`)}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {t('level')} {skill.level}/{skill.maxLevel}
                        </Badge>
                      </div>
                      
                      {skill.unlocked && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{isMaxLevel ? t('mastered') : t('progress')}</span>
                            <span>
                              {isMaxLevel ? t('maxLevel') : `${skill.xp}/${skill.xpToNext} XP`}
                            </span>
                          </div>
                          <Progress 
                            value={progress} 
                            className={cn(
                              'h-2',
                              isMaxLevel && 'bg-green-100 dark:bg-green-900'
                            )}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Skill Detail Panel */}
        {selectedSkill && (
          <Card className="border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className={cn('p-2 rounded-full', categoryColors[selectedSkill.category])}>
                  <Icon className="h-5 w-5" />
                </div>
                {selectedSkill.name}
                <Badge 
                  variant="outline" 
                  className={cn(
                    'text-white',
                    difficultyColors[selectedSkill.difficulty]
                  )}
                >
                  {t(`difficulties.${selectedSkill.difficulty}`)}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                {selectedSkill.description}
              </p>
              
              {/* Prerequisites */}
              {selectedSkill.prerequisites.length > 0 && (
                <div>
                  <h5 className="font-medium mb-2">{t('prerequisites')}</h5>
                  <div className="flex flex-wrap gap-2">
                    {selectedSkill.prerequisites.map(prereq => (
                      <Badge key={prereq} variant="outline" className="text-xs">
                        {prereq}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Rewards */}
              {selectedSkill.rewards.length > 0 && (
                <div>
                  <h5 className="font-medium mb-2">{t('rewards')}</h5>
                  <div className="space-y-1">
                    {selectedSkill.rewards.map((reward, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <Star className="h-4 w-4 text-yellow-500" />
                        {reward}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Progress Detail */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-500">
                    {selectedSkill.level}
                  </div>
                  <p className="text-xs text-muted-foreground">{t('currentLevel')}</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-500">
                    {selectedSkill.xp}
                  </div>
                  <p className="text-xs text-muted-foreground">{t('totalXp')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Skill Tree Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-500">
              {skills.filter(s => s.unlocked).length}
            </div>
            <p className="text-sm text-muted-foreground">{t('unlockedSkills')}</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-500">
              {skills.filter(s => s.level === s.maxLevel).length}
            </div>
            <p className="text-sm text-muted-foreground">{t('masteredSkills')}</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-500">
              {Math.round(skills.reduce((acc, s) => acc + (s.level / s.maxLevel * 100), 0) / skills.length)}%
            </div>
            <p className="text-sm text-muted-foreground">{t('overallProgress')}</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-500">
              {skills.reduce((acc, s) => acc + s.xp, 0).toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground">{t('totalSkillXp')}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const Icon = getSkillIcon(selectedSkill.icon);