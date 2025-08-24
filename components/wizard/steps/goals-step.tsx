"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Target, Calendar, Trophy, X } from "lucide-react";
import { WizardData } from "@/hooks/use-wizard";

interface GoalsStepProps {
  language: 'de' | 'en';
  data: WizardData;
  onUpdate: (updates: Partial<WizardData>) => void;
}

const goalCategories = {
  de: [
    { value: 'career', label: 'Beruflich' },
    { value: 'education', label: 'Bildung' },
    { value: 'health', label: 'Gesundheit' },
    { value: 'personal', label: 'Persönlich' },
    { value: 'relationships', label: 'Beziehungen' },
    { value: 'financial', label: 'Finanziell' },
    { value: 'creative', label: 'Kreativ' },
    { value: 'social', label: 'Sozial' }
  ],
  en: [
    { value: 'career', label: 'Career' },
    { value: 'education', label: 'Education' },
    { value: 'health', label: 'Health' },
    { value: 'personal', label: 'Personal' },
    { value: 'relationships', label: 'Relationships' },
    { value: 'financial', label: 'Financial' },
    { value: 'creative', label: 'Creative' },
    { value: 'social', label: 'Social' }
  ]
};

const timeframes = {
  de: [
    { value: '1-month', label: '1 Monat' },
    { value: '3-months', label: '3 Monate' },
    { value: '6-months', label: '6 Monate' },
    { value: '1-year', label: '1 Jahr' },
    { value: '2-years', label: '2 Jahre' },
    { value: '5-years', label: '5+ Jahre' }
  ],
  en: [
    { value: '1-month', label: '1 Month' },
    { value: '3-months', label: '3 Months' },
    { value: '6-months', label: '6 Months' },
    { value: '1-year', label: '1 Year' },
    { value: '2-years', label: '2 Years' },
    { value: '5-years', label: '5+ Years' }
  ]
};

const content = {
  de: {
    title: "Definiere deine Ziele",
    subtitle: "Was möchtest du erreichen? Setze dir ein Hauptziel und mehrere Nebenziele.",
    mainGoal: "Hauptziel",
    mainGoalPlaceholder: "Dein wichtigstes Ziel...",
    mainGoalDescription: "Beschreibung des Hauptziels",
    mainGoalDescriptionPlaceholder: "Beschreibe dein Hauptziel genauer...",
    secondaryGoals: "Nebenziele",
    addSecondaryGoal: "Nebenziel hinzufügen",
    goalTitle: "Titel",
    goalTitlePlaceholder: "Ziel Titel...",
    goalDescription: "Beschreibung",
    goalDescriptionPlaceholder: "Beschreibe dein Ziel...",
    category: "Kategorie",
    timeframe: "Zeitrahmen",
    priority: "Priorität",
    priorities: {
      low: "Niedrig",
      medium: "Mittel",
      high: "Hoch"
    },
    remove: "Entfernen",
    noSecondaryGoals: "Noch keine Nebenziele definiert"
  },
  en: {
    title: "Define your goals",
    subtitle: "What do you want to achieve? Set a main goal and several secondary goals.",
    mainGoal: "Main Goal",
    mainGoalPlaceholder: "Your most important goal...",
    mainGoalDescription: "Main Goal Description",
    mainGoalDescriptionPlaceholder: "Describe your main goal in detail...",
    secondaryGoals: "Secondary Goals",
    addSecondaryGoal: "Add Secondary Goal",
    goalTitle: "Title",
    goalTitlePlaceholder: "Goal title...",
    goalDescription: "Description",
    goalDescriptionPlaceholder: "Describe your goal...",
    category: "Category",
    timeframe: "Timeframe",
    priority: "Priority",
    priorities: {
      low: "Low",
      medium: "Medium",
      high: "High"
    },
    remove: "Remove",
    noSecondaryGoals: "No secondary goals defined yet"
  }
};

interface Goal {
  id: string;
  title: string;
  description: string;
  category: string;
  timeframe: string;
  priority: 'low' | 'medium' | 'high';
}

export function GoalsStep({
  language,
  data,
  onUpdate
}: GoalsStepProps) {
  const t = content[language];
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoal, setNewGoal] = useState<Partial<Goal>>({
    title: '',
    description: '',
    category: '',
    timeframe: '',
    priority: 'medium'
  });

  const goals = data.goals || { mainGoal: '', mainGoalDescription: '', secondaryGoals: [] };

  const handleMainGoalChange = (field: string, value: string) => {
    onUpdate({
      goals: {
        ...goals,
        [field]: value
      }
    });
  };

  const handleAddSecondaryGoal = () => {
    if (newGoal.title && newGoal.category && newGoal.timeframe) {
      const goal: Goal = {
        id: `goal-${Date.now()}`,
        title: newGoal.title || '',
        description: newGoal.description || '',
        category: newGoal.category || '',
        timeframe: newGoal.timeframe || '',
        priority: newGoal.priority || 'medium'
      };

      onUpdate({
        goals: {
          ...goals,
          secondaryGoals: [...(goals.secondaryGoals || []), goal]
        }
      });

      setNewGoal({
        title: '',
        description: '',
        category: '',
        timeframe: '',
        priority: 'medium'
      });
      setShowAddGoal(false);
    }
  };

  const handleRemoveSecondaryGoal = (goalId: string) => {
    onUpdate({
      goals: {
        ...goals,
        secondaryGoals: (goals.secondaryGoals || []).filter(goal => goal.id !== goalId)
      }
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          {t.title}
        </h2>
        <p className="text-gray-600">
          {t.subtitle}
        </p>
      </div>

      {/* Main Goal */}
      <Card className="border-2 border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-blue-900">
              {t.mainGoal}
            </h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <Input
                placeholder={t.mainGoalPlaceholder}
                value={goals.mainGoal || ''}
                onChange={(e) => handleMainGoalChange('mainGoal', e.target.value)}
                className="bg-white"
              />
            </div>
            
            <div>
              <Label htmlFor="mainGoalDescription">{t.mainGoalDescription}</Label>
              <Textarea
                id="mainGoalDescription"
                placeholder={t.mainGoalDescriptionPlaceholder}
                value={goals.mainGoalDescription || ''}
                onChange={(e) => handleMainGoalChange('mainGoalDescription', e.target.value)}
                rows={3}
                className="bg-white mt-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Secondary Goals */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Target className="w-6 h-6 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                {t.secondaryGoals}
              </h3>
            </div>
            
            <Button
              variant="outline"
              onClick={() => setShowAddGoal(!showAddGoal)}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {t.addSecondaryGoal}
            </Button>
          </div>

          {/* Add New Goal Form */}
          {showAddGoal && (
            <Card className="mb-6 border-dashed">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="goalTitle">{t.goalTitle} *</Label>
                      <Input
                        id="goalTitle"
                        placeholder={t.goalTitlePlaceholder}
                        value={newGoal.title || ''}
                        onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="goalCategory">{t.category} *</Label>
                      <Select 
                        value={newGoal.category || ''} 
                        onValueChange={(value) => setNewGoal({ ...newGoal, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t.category} />
                        </SelectTrigger>
                        <SelectContent>
                          {goalCategories[language].map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>
                              {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="goalDescription">{t.goalDescription}</Label>
                    <Textarea
                      id="goalDescription"
                      placeholder={t.goalDescriptionPlaceholder}
                      value={newGoal.description || ''}
                      onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                      rows={2}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="goalTimeframe">{t.timeframe} *</Label>
                      <Select 
                        value={newGoal.timeframe || ''} 
                        onValueChange={(value) => setNewGoal({ ...newGoal, timeframe: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t.timeframe} />
                        </SelectTrigger>
                        <SelectContent>
                          {timeframes[language].map((time) => (
                            <SelectItem key={time.value} value={time.value}>
                              {time.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="goalPriority">{t.priority}</Label>
                      <Select 
                        value={newGoal.priority || 'medium'} 
                        onValueChange={(value) => setNewGoal({ ...newGoal, priority: value as 'low' | 'medium' | 'high' })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t.priority} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">{t.priorities.low}</SelectItem>
                          <SelectItem value="medium">{t.priorities.medium}</SelectItem>
                          <SelectItem value="high">{t.priorities.high}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      onClick={() => setShowAddGoal(false)}
                    >
                      {language === 'de' ? 'Abbrechen' : 'Cancel'}
                    </Button>
                    <Button
                      onClick={handleAddSecondaryGoal}
                      disabled={!newGoal.title || !newGoal.category || !newGoal.timeframe}
                    >
                      {language === 'de' ? 'Hinzufügen' : 'Add'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Secondary Goals List */}
          <div className="space-y-4">
            {(!goals.secondaryGoals || goals.secondaryGoals.length === 0) ? (
              <div className="text-center py-8 text-gray-500">
                <Target className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>{t.noSecondaryGoals}</p>
              </div>
            ) : (
              goals.secondaryGoals.map((goal) => {
                const categoryLabel = goalCategories[language].find(cat => cat.value === goal.category)?.label;
                const timeframeLabel = timeframes[language].find(time => time.value === goal.timeframe)?.label;
                
                return (
                  <Card key={goal.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-gray-900">{goal.title}</h4>
                            <Badge className={getPriorityColor(goal.priority)}>
                              {t.priorities[goal.priority]}
                            </Badge>
                          </div>
                          
                          {goal.description && (
                            <p className="text-gray-600 text-sm mb-3">
                              {goal.description}
                            </p>
                          )}
                          
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <Badge variant="outline">
                                {categoryLabel}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">{timeframeLabel}</span>
                            </div>
                          </div>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveSecondaryGoal(goal.id)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}