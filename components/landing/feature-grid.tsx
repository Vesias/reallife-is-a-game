'use client'

import { useTranslation } from '@/lib/i18n-simple'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Bot, 
  Users, 
  Target, 
  Gamepad2, 
  Brain, 
  Smartphone,
  Zap,
  Star,
  CheckCircle,
  TrendingUp,
  MessageSquare,
  Award
} from 'lucide-react'

const features = [
  {
    icon: Bot,
    titleKey: 'digitalAgent.title',
    descriptionKey: 'digitalAgent.description',
    featuresKey: 'digitalAgent.features',
    color: 'from-purple-500 to-indigo-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20'
  },
  {
    icon: Users,
    titleKey: 'crewSystem.title',
    descriptionKey: 'crewSystem.description',
    featuresKey: 'crewSystem.features',
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20'
  },
  {
    icon: Target,
    titleKey: 'questSystem.title',
    descriptionKey: 'questSystem.description',
    featuresKey: 'questSystem.features',
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/20'
  },
  {
    icon: Gamepad2,
    titleKey: 'gamification.title',
    descriptionKey: 'gamification.description',
    featuresKey: 'gamification.features',
    color: 'from-orange-500 to-red-500',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/20'
  },
  {
    icon: Brain,
    titleKey: 'aiInsights.title',
    descriptionKey: 'aiInsights.description',
    featuresKey: 'aiInsights.features',
    color: 'from-pink-500 to-rose-500',
    bgColor: 'bg-pink-500/10',
    borderColor: 'border-pink-500/20'
  },
  {
    icon: Smartphone,
    titleKey: 'mobileFirst.title',
    descriptionKey: 'mobileFirst.description',
    featuresKey: 'mobileFirst.features',
    color: 'from-violet-500 to-purple-500',
    bgColor: 'bg-violet-500/10',
    borderColor: 'border-violet-500/20'
  }
]

export function FeatureGrid() {
  const { t, isGerman } = useTranslation()

  // Get feature translations from landing namespace
  const getFeatureText = (key: string) => {
    // For now, we'll use hardcoded translations since we don't have landing namespace loaded
    const translations: Record<string, Record<string, any>> = {
      de: {
        'digitalAgent.title': 'Digitaler Agent',
        'digitalAgent.description': 'Dein persönlicher KI-Begleiter hilft dir bei der Planung, Verfolgung und Optimierung deiner Lebensziele.',
        'digitalAgent.features': ['Intelligente Questvorschläge', 'Fortschrittsverfolgung', 'Personalisierte Tipps', '24/7 Unterstützung'],
        'crewSystem.title': 'Crew-System',
        'crewSystem.description': 'Schließe dich mit Freunden zusammen, teile Ziele und motiviert euch gegenseitig zum Erfolg.',
        'crewSystem.features': ['Gemeinsame Quests', 'Echtzeit-Chat', 'Fortschritts-Sharing', 'Team-Herausforderungen'],
        'questSystem.title': 'Quest-System',
        'questSystem.description': 'Verwandle langweilige Aufgaben in spannende Missionen mit Belohnungen und Fortschrittsmessung.',
        'questSystem.features': ['Personalisierte Quests', 'Fortschrittsverfolgung', 'Belohnungssystem', 'Schwierigkeitsgrade'],
        'gamification.title': 'Gamification',
        'gamification.description': 'Sammle XP, erreiche neue Level, verdiene Abzeichen und klettere in den Ranglisten nach oben.',
        'gamification.features': ['XP und Level-System', 'Errungenschaften', 'Ranglisten', 'Skill-Baum'],
        'aiInsights.title': 'KI-Einblicke',
        'aiInsights.description': 'Erhalte datengestützte Erkenntnisse über deine Gewohnheiten, Fortschritte und Verbesserungsmöglichkeiten.',
        'aiInsights.features': ['Verhaltensmuster', 'Fortschrittsanalysen', 'Optimierungsvorschläge', 'Prognosen'],
        'mobileFirst.title': 'Mobile-First',
        'mobileFirst.description': 'Verwalte dein Leben von überall aus mit unserer responsiven, mobilfreundlichen Plattform.',
        'mobileFirst.features': ['Offline-Zugang', 'Push-Benachrichtigungen', 'Responsive Design', 'Cross-Platform Sync']
      },
      en: {
        'digitalAgent.title': 'Digital Agent',
        'digitalAgent.description': 'Your personal AI companion helps you plan, track, and optimize your life goals.',
        'digitalAgent.features': ['Smart Quest Suggestions', 'Progress Tracking', 'Personalized Tips', '24/7 Support'],
        'crewSystem.title': 'Crew System',
        'crewSystem.description': 'Team up with friends, share goals, and motivate each other towards success.',
        'crewSystem.features': ['Shared Quests', 'Real-time Chat', 'Progress Sharing', 'Team Challenges'],
        'questSystem.title': 'Quest System',
        'questSystem.description': 'Turn boring tasks into exciting missions with rewards and progress tracking.',
        'questSystem.features': ['Personalized Quests', 'Progress Tracking', 'Reward System', 'Difficulty Levels'],
        'gamification.title': 'Gamification',
        'gamification.description': 'Earn XP, reach new levels, unlock badges, and climb the leaderboards.',
        'gamification.features': ['XP and Level System', 'Achievements', 'Leaderboards', 'Skill Trees'],
        'aiInsights.title': 'AI Insights',
        'aiInsights.description': 'Get data-driven insights about your habits, progress, and optimization opportunities.',
        'aiInsights.features': ['Behavior Patterns', 'Progress Analytics', 'Optimization Suggestions', 'Predictions'],
        'mobileFirst.title': 'Mobile-First',
        'mobileFirst.description': 'Manage your life from anywhere with our responsive, mobile-friendly platform.',
        'mobileFirst.features': ['Offline Access', 'Push Notifications', 'Responsive Design', 'Cross-Platform Sync']
      }
    }
    
    return translations[isGerman ? 'de' : 'en'][key] || key
  }

  return (
    <section className="py-24 bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 bg-purple-50 border-purple-200 text-purple-700">
            <Star className="w-3 h-3 mr-1" />
            {isGerman ? 'Funktionen' : 'Features'}
          </Badge>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600">
            {isGerman ? 'Entdecke die Macht der Gamification' : 'Discover the Power of Gamification'}
          </h2>
          
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            {isGerman 
              ? 'LifeQuest verwandelt alltägliche Aufgaben in spannende Quests und hilft dir dabei, deine Ziele zu erreichen.'
              : 'LifeQuest transforms everyday tasks into exciting quests and helps you achieve your goals.'
            }
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => {
            const IconComponent = feature.icon
            return (
              <Card 
                key={index} 
                className={`group hover:shadow-2xl transition-all duration-500 hover:scale-105 ${feature.bgColor} ${feature.borderColor} border-2 relative overflow-hidden`}
              >
                {/* Background Gradient Effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                
                <CardHeader className="relative">
                  {/* Icon with gradient background */}
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} p-4 mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="w-full h-full text-white" />
                  </div>
                  
                  <CardTitle className="text-2xl font-bold mb-3 group-hover:text-purple-700 transition-colors">
                    {getFeatureText(feature.titleKey)}
                  </CardTitle>
                  
                  <CardDescription className="text-slate-600 text-base leading-relaxed">
                    {getFeatureText(feature.descriptionKey)}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  {/* Feature List */}
                  <div className="space-y-3">
                    {(getFeatureText(feature.featuresKey) as string[]).map((featureItem, featureIndex) => (
                      <div key={featureIndex} className="flex items-start gap-3 group/item">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0 group-hover/item:scale-110 transition-transform" />
                        <span className="text-slate-700 group-hover/item:text-slate-900 transition-colors">
                          {featureItem}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Hover Effect Elements */}
                  <div className="mt-6 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
                    <div className={`h-1 bg-gradient-to-r ${feature.color} rounded-full`} />
                  </div>
                </CardContent>

                {/* Corner Decoration */}
                <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <IconComponent className="w-8 h-8" />
                </div>
              </Card>
            )
          })}
        </div>

        {/* Bottom Stats */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          {[
            { icon: Zap, label: isGerman ? 'Aktive Spieler' : 'Active Players', value: '50K+', color: 'text-yellow-500' },
            { icon: Target, label: isGerman ? 'Quests abgeschlossen' : 'Quests Completed', value: '2.5M+', color: 'text-green-500' },
            { icon: Users, label: isGerman ? 'Crews gebildet' : 'Crews Formed', value: '12K+', color: 'text-blue-500' },
            { icon: Award, label: isGerman ? 'XP verdient' : 'XP Earned', value: '150M+', color: 'text-purple-500' }
          ].map((stat, index) => (
            <div key={index} className="text-center group">
              <div className={`w-12 h-12 mx-auto mb-3 ${stat.color} group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-full h-full" />
              </div>
              <div className="text-3xl font-bold text-slate-800 mb-1">{stat.value}</div>
              <div className="text-slate-600 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}