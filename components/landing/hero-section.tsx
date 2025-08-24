'use client'

import { useTranslation } from '@/lib/i18n-simple'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/hooks/use-auth'
import Link from 'next/link'
import { ArrowRight, Play, Zap, Users, Target, TrendingUp, Sparkles, Star } from 'lucide-react'
import { useEffect, useState } from 'react'

export function HeroSection() {
  const { t, isGerman, formatters } = useTranslation('common')
  const { user } = useAuth()
  const [heroData, setHeroData] = useState({
    level: 12,
    xp: 2450,
    questsCompleted: 47,
    crewMembers: 12
  })

  // Simulate dynamic stats for demo
  useEffect(() => {
    const interval = setInterval(() => {
      setHeroData(prev => ({
        ...prev,
        xp: prev.xp + Math.floor(Math.random() * 10),
      }))
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-128 h-128 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          >
            <Sparkles className="w-4 h-4 text-purple-400/30" />
          </div>
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          {/* Hero Content */}
          <div className="text-center mb-12">
            {/* Badge */}
            <Badge variant="outline" className="mb-6 bg-purple-500/10 border-purple-500/20 text-purple-200 hover:bg-purple-500/20 transition-all duration-300">
              <Star className="w-3 h-3 mr-1" />
              {isGerman ? 'Das Leben als Spiel erleben' : 'Experience Life as a Game'}
            </Badge>

            {/* Main Title */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-blue-200 leading-tight">
              {isGerman ? 'Willkommen zu' : 'Welcome to'}{' '}
              <span className="text-gradient bg-gradient-to-r from-purple-400 to-blue-400">
                LifeQuest
              </span>
            </h1>

            {/* Subtitle */}
            <div className="text-2xl md:text-3xl lg:text-4xl font-semibold text-purple-200 mb-4">
              {isGerman ? 'Das echte Leben ist ein Spiel' : 'Real Life is a Game'}
            </div>

            {/* Description */}
            <p className="text-xl text-gray-300 max-w-4xl mx-auto mb-10 leading-relaxed">
              {isGerman 
                ? 'Verwandle dein Leben in ein episches Abenteuer. Erstelle deinen digitalen Agenten, schließe dich Crews an, erfülle Quests und level up sowohl im echten Leben als auch in der Spielwelt.'
                : 'Transform your life into an epic adventure. Create your digital agent, join crews, complete quests, and level up in both real life and the game world.'
              }
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              {user ? (
                <Link href="/dashboard">
                  <Button size="lg" className="group bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
                    {isGerman ? 'Zum Dashboard' : 'Go to Dashboard'}
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/onboarding">
                    <Button size="lg" className="group bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
                      {isGerman ? 'Abenteuer starten' : 'Start Adventure'}
                      <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="group border-purple-400/50 text-purple-200 hover:bg-purple-500/20 hover:border-purple-400 px-8 py-4 text-lg font-semibold rounded-xl backdrop-blur-sm transition-all duration-300"
                  >
                    <Play className="mr-2 w-5 h-5 group-hover:scale-110 transition-transform" />
                    {isGerman ? 'Demo ansehen' : 'Watch Demo'}
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Hero Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <Card className="bg-purple-900/30 border-purple-500/30 backdrop-blur-sm hover:bg-purple-900/50 transition-all duration-300 hover:scale-105">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Zap className="w-6 h-6 text-yellow-400" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">
                  {isGerman ? 'Level' : 'Level'} {heroData.level}
                </div>
                <div className="text-sm text-gray-400">
                  {formatters.number(heroData.xp)} XP
                </div>
              </CardContent>
            </Card>

            <Card className="bg-blue-900/30 border-blue-500/30 backdrop-blur-sm hover:bg-blue-900/50 transition-all duration-300 hover:scale-105">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Target className="w-6 h-6 text-green-400" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">
                  {formatters.number(heroData.questsCompleted)}
                </div>
                <div className="text-sm text-gray-400">
                  {isGerman ? 'Quests' : 'Quests'}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green-900/30 border-green-500/30 backdrop-blur-sm hover:bg-green-900/50 transition-all duration-300 hover:scale-105">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Users className="w-6 h-6 text-blue-400" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">
                  {formatters.number(heroData.crewMembers)}
                </div>
                <div className="text-sm text-gray-400">
                  {isGerman ? 'Crew' : 'Crew'}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-indigo-900/30 border-indigo-500/30 backdrop-blur-sm hover:bg-indigo-900/50 transition-all duration-300 hover:scale-105">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp className="w-6 h-6 text-purple-400" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">
                  92%
                </div>
                <div className="text-sm text-gray-400">
                  {isGerman ? 'Erfolg' : 'Success'}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-purple-400/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-purple-400/50 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .text-gradient {
          background: linear-gradient(135deg, #a855f7 0%, #3b82f6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>
    </section>
  )
}