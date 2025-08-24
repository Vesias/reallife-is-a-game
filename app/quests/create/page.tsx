'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/use-translation';
import { useQuests } from '@/hooks/use-quests';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, ArrowLeft, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { calculateXpReward } from '@/lib/xp-calculator';
import Link from 'next/link';

export default function CreateQuestPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { createQuest } = useQuests();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    difficulty: 1,
    deadline: null as Date | null,
    isDaily: false,
    isPublic: false,
    tags: [] as string[],
    milestones: [] as string[]
  });

  const [currentTag, setCurrentTag] = useState('');
  const [currentMilestone, setCurrentMilestone] = useState('');

  const categories = [
    { value: 'health', label: t('quests.categories.health'), icon: '🏃‍♂️' },
    { value: 'career', label: t('quests.categories.career'), icon: '💼' },
    { value: 'learning', label: t('quests.categories.learning'), icon: '📚' },
    { value: 'social', label: t('quests.categories.social'), icon: '👥' },
    { value: 'financial', label: t('quests.categories.financial'), icon: '💰' },
    { value: 'personal', label: t('quests.categories.personal'), icon: '🌟' }
  ];

  const difficultyLabels = {
    1: { label: t('quests.difficulty.easy'), color: 'bg-green-500' },
    2: { label: t('quests.difficulty.medium'), color: 'bg-yellow-500' },
    3: { label: t('quests.difficulty.hard'), color: 'bg-orange-500' },
    4: { label: t('quests.difficulty.expert'), color: 'bg-red-500' },
    5: { label: t('quests.difficulty.legendary'), color: 'bg-purple-500' }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.category) {
      return;
    }

    const questData = {
      ...formData,
      category: formData.category as 'health' | 'career' | 'learning' | 'social' | 'personal' | 'financial',
      xpReward: calculateXpReward(formData.difficulty as 1 | 2 | 3 | 4 | 5, formData.isDaily),
      createdAt: new Date(),
      status: 'active' as const,
      progress: 0,
      completedMilestones: []
    };

    try {
      await createQuest(questData);
      router.push('/quests');
    } catch (error) {
      console.error('Failed to create quest:', error);
    }
  };

  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const addMilestone = () => {
    if (currentMilestone.trim()) {
      setFormData(prev => ({
        ...prev,
        milestones: [...prev.milestones, currentMilestone.trim()]
      }));
      setCurrentMilestone('');
    }
  };

  const removeMilestone = (index: number) => {
    setFormData(prev => ({
      ...prev,
      milestones: prev.milestones.filter((_, i) => i !== index)
    }));
  };

  const estimatedXp = calculateXpReward(formData.difficulty, formData.isDaily);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/quests">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">{t('quests.create.title')}</h1>
          <p className="text-muted-foreground">
            {t('quests.create.subtitle')}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('quests.create.basicInfo')}</CardTitle>
                <CardDescription>
                  {t('quests.create.basicInfoDesc')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">{t('quests.create.questTitle')}</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder={t('quests.create.titlePlaceholder')}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">{t('quests.create.description')}</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder={t('quests.create.descriptionPlaceholder')}
                    rows={4}
                  />
                </div>

                <div>
                  <Label>{t('quests.create.category')}</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('quests.create.selectCategory')} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          <span className="flex items-center gap-2">
                            <span>{category.icon}</span>
                            {category.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('quests.create.difficulty')}</CardTitle>
                <CardDescription>
                  {t('quests.create.difficultyDesc')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>{t('quests.create.difficultyLevel')}</Label>
                    <Badge className={difficultyLabels[formData.difficulty as keyof typeof difficultyLabels].color}>
                      {difficultyLabels[formData.difficulty as keyof typeof difficultyLabels].label}
                    </Badge>
                  </div>
                  <Slider
                    value={[formData.difficulty]}
                    onValueChange={([value]) => setFormData(prev => ({ ...prev, difficulty: value }))}
                    min={1}
                    max={5}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground mt-2">
                    <span>{t('quests.difficulty.easy')}</span>
                    <span>{t('quests.difficulty.legendary')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('quests.create.schedule')}</CardTitle>
                <CardDescription>
                  {t('quests.create.scheduleDesc')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="daily"
                    checked={formData.isDaily}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isDaily: checked }))}
                  />
                  <Label htmlFor="daily">{t('quests.create.dailyQuest')}</Label>
                </div>

                {!formData.isDaily && (
                  <div>
                    <Label>{t('quests.create.deadline')}</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.deadline && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.deadline ? format(formData.deadline, "PPP") : t('quests.create.selectDeadline')}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.deadline}
                          onSelect={(date) => setFormData(prev => ({ ...prev, deadline: date }))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('quests.create.milestones')}</CardTitle>
                <CardDescription>
                  {t('quests.create.milestonesDesc')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={currentMilestone}
                    onChange={(e) => setCurrentMilestone(e.target.value)}
                    placeholder={t('quests.create.milestonePlaceholder')}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMilestone())}
                  />
                  <Button type="button" onClick={addMilestone}>
                    {t('quests.create.add')}
                  </Button>
                </div>
                
                {formData.milestones.length > 0 && (
                  <div className="space-y-2">
                    {formData.milestones.map((milestone, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                        <span>{milestone}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeMilestone(index)}
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  {t('quests.create.rewards')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">
                    +{estimatedXp} XP
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t('quests.create.estimatedReward')}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('quests.create.tags')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    placeholder={t('quests.create.tagPlaceholder')}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" onClick={addTag}>
                    {t('quests.create.add')}
                  </Button>
                </div>
                
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                        {tag} ×
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('quests.create.settings')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="public"
                    checked={formData.isPublic}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublic: checked }))}
                  />
                  <Label htmlFor="public">{t('quests.create.publicQuest')}</Label>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Link href="/quests">
            <Button variant="outline">{t('common.cancel')}</Button>
          </Link>
          <Button type="submit" disabled={!formData.title.trim() || !formData.category}>
            {t('quests.create.createQuest')}
          </Button>
        </div>
      </form>
    </div>
  );
}