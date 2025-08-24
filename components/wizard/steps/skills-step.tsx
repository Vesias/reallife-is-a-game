"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SkillSelector } from "@/components/wizard/skill-selector";
import { Search, Plus } from "lucide-react";
import { WizardData } from "@/hooks/use-wizard";

interface SkillsStepProps {
  language: 'de' | 'en';
  data: WizardData;
  onUpdate: (updates: Partial<WizardData>) => void;
}

const content = {
  de: {
    title: "Wähle deine Fähigkeiten",
    subtitle: "Welche Fähigkeiten möchtest du entwickeln oder verbesser n?",
    searchPlaceholder: "Fähigkeiten suchen...",
    selectedSkills: "Ausgewählte Fähigkeiten",
    addCustom: "Eigene hinzufügen",
    customSkillPlaceholder: "Eigene Fähigkeit eingeben",
    levelLabels: {
      beginner: "Anfänger",
      intermediate: "Fortgeschritten",
      advanced: "Experte"
    }
  },
  en: {
    title: "Select your skills",
    subtitle: "Which skills would you like to develop or improve?",
    searchPlaceholder: "Search skills...",
    selectedSkills: "Selected Skills",
    addCustom: "Add Custom",
    customSkillPlaceholder: "Enter custom skill",
    levelLabels: {
      beginner: "Beginner",
      intermediate: "Intermediate",
      advanced: "Advanced"
    }
  }
};

export function SkillsStep({
  language,
  data,
  onUpdate
}: SkillsStepProps) {
  const t = content[language];
  const [searchTerm, setSearchTerm] = useState('');
  const [customSkill, setCustomSkill] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const selectedSkills = data.skills || [];

  const handleSkillToggle = (skill: any) => {
    const isSelected = selectedSkills.find(s => s.id === skill.id);
    
    if (isSelected) {
      // Remove skill
      onUpdate({
        skills: selectedSkills.filter(s => s.id !== skill.id)
      });
    } else {
      // Add skill
      onUpdate({
        skills: [...selectedSkills, { ...skill, level: 'beginner', targetLevel: 'intermediate' }]
      });
    }
  };

  const handleSkillLevelChange = (skillId: string, level: string, type: 'current' | 'target') => {
    onUpdate({
      skills: selectedSkills.map(skill => 
        skill.id === skillId 
          ? { ...skill, [type === 'current' ? 'level' : 'targetLevel']: level }
          : skill
      )
    });
  };

  const handleAddCustomSkill = () => {
    if (customSkill.trim()) {
      const newSkill = {
        id: `custom-${Date.now()}`,
        name: customSkill,
        category: 'custom',
        level: 'beginner',
        targetLevel: 'intermediate',
        isCustom: true
      };
      
      onUpdate({
        skills: [...selectedSkills, newSkill]
      });
      
      setCustomSkill('');
      setShowCustomInput(false);
    }
  };

  const handleRemoveSkill = (skillId: string) => {
    onUpdate({
      skills: selectedSkills.filter(s => s.id !== skillId)
    });
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

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder={t.searchPlaceholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Skill Selector */}
      <SkillSelector
        language={language}
        searchTerm={searchTerm}
        selectedSkills={selectedSkills}
        onSkillToggle={handleSkillToggle}
      />

      {/* Custom Skill Input */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">{t.addCustom}</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCustomInput(!showCustomInput)}
            >
              <Plus className="w-4 h-4 mr-2" />
              {t.addCustom}
            </Button>
          </div>
          
          {showCustomInput && (
            <div className="flex gap-2">
              <Input
                placeholder={t.customSkillPlaceholder}
                value={customSkill}
                onChange={(e) => setCustomSkill(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddCustomSkill()}
              />
              <Button onClick={handleAddCustomSkill}>
                {language === 'de' ? 'Hinzufügen' : 'Add'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected Skills */}
      {selectedSkills.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold text-gray-900 mb-4">
              {t.selectedSkills} ({selectedSkills.length})
            </h3>
            
            <div className="space-y-4">
              {selectedSkills.map((skill) => (
                <div key={skill.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">{skill.name}</span>
                      <Badge variant="secondary">
                        {skill.category}
                      </Badge>
                      {skill.isCustom && (
                        <Badge variant="outline">
                          {language === 'de' ? 'Eigene' : 'Custom'}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex gap-4">
                      <div className="text-sm">
                        <span className="text-gray-600">
                          {language === 'de' ? 'Aktuell:' : 'Current:'}
                        </span>
                        <select
                          value={skill.level}
                          onChange={(e) => handleSkillLevelChange(skill.id, e.target.value, 'current')}
                          className="ml-2 text-sm border rounded px-2 py-1"
                        >
                          <option value="beginner">{t.levelLabels.beginner}</option>
                          <option value="intermediate">{t.levelLabels.intermediate}</option>
                          <option value="advanced">{t.levelLabels.advanced}</option>
                        </select>
                      </div>
                      
                      <div className="text-sm">
                        <span className="text-gray-600">
                          {language === 'de' ? 'Ziel:' : 'Target:'}
                        </span>
                        <select
                          value={skill.targetLevel}
                          onChange={(e) => handleSkillLevelChange(skill.id, e.target.value, 'target')}
                          className="ml-2 text-sm border rounded px-2 py-1"
                        >
                          <option value="beginner">{t.levelLabels.beginner}</option>
                          <option value="intermediate">{t.levelLabels.intermediate}</option>
                          <option value="advanced">{t.levelLabels.advanced}</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveSkill(skill.id)}
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}