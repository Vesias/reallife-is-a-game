'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/use-translation';
import { useAuth } from '@/hooks/use-auth';
import { useCrew } from '@/hooks/use-crew';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  ArrowLeft, 
  Shield, 
  Globe, 
  Lock,
  Target,
  Trophy,
  MessageCircle
} from 'lucide-react';
import { toast } from 'sonner';

const CREW_TYPES = [
  { 
    value: 'fitness', 
    label: 'Fitness & Health', 
    icon: '💪',
    description: 'Focus on physical wellness and fitness goals'
  },
  { 
    value: 'productivity', 
    label: 'Productivity', 
    icon: '⚡',
    description: 'Boost productivity and achieve professional goals'
  },
  { 
    value: 'learning', 
    label: 'Learning & Growth', 
    icon: '📚',
    description: 'Educational pursuits and skill development'
  },
  { 
    value: 'creative', 
    label: 'Creative Projects', 
    icon: '🎨',
    description: 'Artistic and creative endeavors'
  },
  { 
    value: 'social', 
    label: 'Social Impact', 
    icon: '🌍',
    description: 'Community service and social causes'
  },
  { 
    value: 'general', 
    label: 'General Purpose', 
    icon: '🎯',
    description: 'Mixed goals and general collaboration'
  }
];

export default function CreateCrewPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { createCrew, loading } = useCrew();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: '',
    maxMembers: 5,
    isPrivate: false,
    autoAcceptMembers: true,
    tags: [] as string[],
    rules: ''
  });
  
  const [newTag, setNewTag] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error(t('Please log in to create a crew'));
      return;
    }

    if (!formData.name.trim()) {
      toast.error(t('Crew name is required'));
      return;
    }

    if (!formData.type) {
      toast.error(t('Please select a crew type'));
      return;
    }

    try {
      const crew = await createCrew({
        ...formData,
        leaderId: user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      if (crew) {
        toast.success(t('Crew created successfully!'));
        router.push(`/crew/${crew.id}`);
      }
    } catch (error) {
      console.error('Error creating crew:', error);
      toast.error(t('Failed to create crew. Please try again.'));
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim()) && formData.tags.length < 5) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('Back')}
        </Button>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            {t('Create New Crew')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t('Build a team to tackle quests together')}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              {t('Basic Information')}
            </CardTitle>
            <CardDescription>
              {t('Set up the foundation of your crew')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">{t('Crew Name')} *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder={t('Enter crew name...')}
                maxLength={50}
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                {formData.name.length}/50 {t('characters')}
              </p>
            </div>

            <div>
              <Label htmlFor="description">{t('Description')}</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder={t('Describe what your crew is about...')}
                rows={3}
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {formData.description.length}/200 {t('characters')}
              </p>
            </div>

            <div>
              <Label htmlFor="type">{t('Crew Type')} *</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('Select crew type...')} />
                </SelectTrigger>
                <SelectContent>
                  {CREW_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <span>{type.icon}</span>
                        <div className="text-left">
                          <div className="font-medium">{t(type.label)}</div>
                          <div className="text-xs text-muted-foreground">
                            {t(type.description)}
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              {t('Crew Settings')}
            </CardTitle>
            <CardDescription>
              {t('Configure how your crew operates')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="maxMembers">{t('Maximum Members')}</Label>
              <Select 
                value={formData.maxMembers.toString()} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, maxMembers: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 {t('members')}</SelectItem>
                  <SelectItem value="4">4 {t('members')}</SelectItem>
                  <SelectItem value="5">5 {t('members')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="flex items-center gap-2">
                  {formData.isPrivate ? (
                    <Lock className="h-4 w-4" />
                  ) : (
                    <Globe className="h-4 w-4" />
                  )}
                  {t('Privacy')}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {formData.isPrivate 
                    ? t('Only invited members can join')
                    : t('Anyone can discover and join')
                  }
                </p>
              </div>
              <Switch
                checked={formData.isPrivate}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPrivate: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>{t('Auto-accept Members')}</Label>
                <p className="text-sm text-muted-foreground">
                  {formData.autoAcceptMembers
                    ? t('New members join immediately')
                    : t('Require approval for new members')
                  }
                </p>
              </div>
              <Switch
                checked={formData.autoAcceptMembers}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, autoAcceptMembers: checked }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Tags */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              {t('Tags & Rules')}
            </CardTitle>
            <CardDescription>
              {t('Add tags to help others find your crew')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>{t('Tags')} ({formData.tags.length}/5)</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder={t('Add tag...')}
                  maxLength={20}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button 
                  type="button" 
                  onClick={addTag}
                  disabled={!newTag.trim() || formData.tags.length >= 5}
                >
                  {t('Add')}
                </Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-destructive"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="rules">{t('Crew Rules')} ({t('Optional')})</Label>
              <Textarea
                id="rules"
                value={formData.rules}
                onChange={(e) => setFormData(prev => ({ ...prev, rules: e.target.value }))}
                placeholder={t('Set any rules or expectations for your crew...')}
                rows={3}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {formData.rules.length}/500 {t('characters')}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            {t('Cancel')}
          </Button>
          <Button
            type="submit"
            disabled={loading || !formData.name.trim() || !formData.type}
            className="gap-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Users className="h-4 w-4" />
            )}
            {t('Create Crew')}
          </Button>
        </div>
      </form>
    </div>
  );
}