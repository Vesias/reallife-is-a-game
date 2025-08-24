"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { WizardContainer } from "@/components/wizard/wizard-container";
import { WelcomeStep } from "@/components/wizard/steps/welcome-step";
import { PersonalInfoStep } from "@/components/wizard/steps/personal-info-step";
import { SkillsStep } from "@/components/wizard/steps/skills-step";
import { PropertiesStep } from "@/components/wizard/steps/properties-step";
import { GoalsStep } from "@/components/wizard/steps/goals-step";
import { AgentCreationStep } from "@/components/wizard/steps/agent-creation-step";
import { ConnectionsStep } from "@/components/wizard/steps/connections-step";
import { useWizard } from "@/hooks/use-wizard";
import { getStepValidation } from "@/lib/wizard-utils";

const TOTAL_STEPS = 7;

const stepTitles = {
  de: [
    "Willkommen",
    "Persönliche Daten",
    "Fähigkeiten",
    "Eigenschaften",
    "Ziele",
    "Digitaler Agent",
    "Verbindungen"
  ],
  en: [
    "Welcome",
    "Personal Info",
    "Skills",
    "Properties", 
    "Goals",
    "Digital Agent",
    "Connections"
  ]
};

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [language, setLanguage] = useState<'de' | 'en'>('de');
  const { wizardData, updateWizardData, resetWizard } = useWizard();

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    try {
      // Save wizard data to backend
      console.log('Completing onboarding with data:', wizardData);
      // TODO: API call to save user profile and agent configuration
      
      // Navigate to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  const isStepValid = getStepValidation(currentStep, wizardData);
  const progress = ((currentStep + 1) / TOTAL_STEPS) * 100;

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <WelcomeStep
            language={language}
            onLanguageChange={setLanguage}
            data={wizardData}
            onUpdate={updateWizardData}
          />
        );
      case 1:
        return (
          <PersonalInfoStep
            language={language}
            data={wizardData}
            onUpdate={updateWizardData}
          />
        );
      case 2:
        return (
          <SkillsStep
            language={language}
            data={wizardData}
            onUpdate={updateWizardData}
          />
        );
      case 3:
        return (
          <PropertiesStep
            language={language}
            data={wizardData}
            onUpdate={updateWizardData}
          />
        );
      case 4:
        return (
          <GoalsStep
            language={language}
            data={wizardData}
            onUpdate={updateWizardData}
          />
        );
      case 5:
        return (
          <AgentCreationStep
            language={language}
            data={wizardData}
            onUpdate={updateWizardData}
          />
        );
      case 6:
        return (
          <ConnectionsStep
            language={language}
            data={wizardData}
            onUpdate={updateWizardData}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {language === 'de' ? 'Willkommen bei LifeQuest' : 'Welcome to LifeQuest'}
          </h1>
          <p className="text-gray-600">
            {language === 'de' 
              ? 'Erstelle dein Profil und deinen digitalen Assistenten'
              : 'Create your profile and digital assistant'
            }
          </p>
        </div>

        {/* Progress */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-700">
                {language === 'de' ? 'Fortschritt' : 'Progress'}
              </span>
              <span className="text-sm text-gray-500">
                {currentStep + 1} / {TOTAL_STEPS}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between mt-2">
              {stepTitles[language].map((title, index) => (
                <span
                  key={index}
                  className={`text-xs ${
                    index <= currentStep ? 'text-blue-600 font-medium' : 'text-gray-400'
                  }`}
                >
                  {title}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <WizardContainer>
          {renderStep()}
          
          {/* Navigation */}
          <div className="flex justify-between pt-6 border-t">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              {language === 'de' ? 'Zurück' : 'Previous'}
            </Button>
            
            <Button
              onClick={handleNext}
              disabled={!isStepValid}
              className="min-w-24"
            >
              {currentStep === TOTAL_STEPS - 1
                ? (language === 'de' ? 'Fertigstellen' : 'Complete')
                : (language === 'de' ? 'Weiter' : 'Next')
              }
            </Button>
          </div>
        </WizardContainer>
      </div>
    </div>
  );
}