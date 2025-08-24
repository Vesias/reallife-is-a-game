'use client'

import { useTranslation } from '@/lib/i18n-simple'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/use-auth'
import Link from 'next/link'
import { ArrowRight, CheckCircle, Sparkles, Zap, Gift, Crown, Star } from 'lucide-react'
import { useEffect, useState } from 'react'

export function CTASection() {
  const { isGerman } = useTranslation()
  const { user } = useAuth()
  const [animatedFeatures, setAnimatedFeatures] = useState<boolean[]>([false, false, false, false])

  // Animate features on mount
  useEffect(() => {
    const timers = animatedFeatures.map((_, index) => 
      setTimeout(() => {
        setAnimatedFeatures(prev => {
          const newState = [...prev]
          newState[index] = true
          return newState
        })
      }, index * 200 + 500)
    )

    return () => timers.forEach(clearTimeout)
  }, [])

  const features = [
    {
      textDe: 'Kostenlose Registrierung',
      textEn: 'Free registration',
      icon: CheckCircle
    },
    {
      textDe: 'Keine Kreditkarte erforderlich',
      textEn: 'No credit card required',
      icon: Gift
    },
    {
      textDe: 'Sofortiger Zugang zu allen Grundfunktionen',
      textEn: 'Instant access to all core features',
      icon: Zap
    },
    {
      textDe: 'Community-Support inklusive',
      textEn: 'Community support included',
      icon: Crown
    }
  ]

  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900" />
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      {/* Floating Sparkles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${4 + Math.random() * 3}s`
            }}
          >
            <Sparkles className="w-3 h-3 text-purple-400/20" />
          </div>
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-6 bg-purple-500/10 border-purple-400/30 text-purple-200">
              <Star className="w-3 h-3 mr-1" />
              {isGerman ? 'Bereit für das Abenteuer?' : 'Ready for Adventure?'}
            </Badge>

            <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-blue-200">
              {isGerman ? 'Bereit für dein Abenteuer?' : 'Ready for Your Adventure?'}
            </h2>

            <p className="text-xl md:text-2xl text-purple-100 mb-4">
              {isGerman ? 'Verwandle dein Leben noch heute in ein Spiel' : 'Gamify your life today'}
            </p>

            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              {isGerman 
                ? 'Schließe dich Tausenden von Spielern an, die bereits ihr Leben gamifiziert haben und ihre Ziele erreichen.'
                : 'Join thousands of players who have already gamified their lives and are achieving their goals.'
              }
            </p>
          </div>

          {/* Main CTA Card */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border-white/20 shadow-2xl">
            {/* Card Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5" />
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-purple-400/10 to-transparent rounded-full blur-2xl" />
            
            <CardContent className="relative p-8 md:p-12">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                {/* Left Side - Features */}
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-8">
                    {isGerman ? 'Was du bekommst:' : 'What You Get:'}
                  </h3>

                  <div className="space-y-6">
                    {features.map((feature, index) => (
                      <div 
                        key={index}
                        className={`flex items-center gap-4 transition-all duration-700 ${
                          animatedFeatures[index] 
                            ? 'opacity-100 translate-x-0' 
                            : 'opacity-0 -translate-x-4'
                        }`}
                      >
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                          <feature.icon className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-white text-lg font-medium">
                          {isGerman ? feature.textDe : feature.textEn}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Additional Info */}
                  <div className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-400/20">
                    <div className="flex items-center gap-3 mb-2">
                      <Gift className="w-5 h-5 text-yellow-400" />
                      <span className="text-purple-200 font-semibold">
                        {isGerman ? 'Bonus:' : 'Bonus:'}
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm">
                      {isGerman 
                        ? 'Starte mit 100 XP und einem exklusiven Willkommens-Quest!'
                        : 'Start with 100 XP and an exclusive welcome quest!'
                      }
                    </p>
                  </div>
                </div>

                {/* Right Side - CTA */}
                <div className="text-center lg:text-left">
                  <div className="relative">
                    {/* Glowing Effect */}
                    <div className="absolute -inset-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl blur opacity-20 animate-pulse" />
                    
                    {user ? (
                      <Link href="/dashboard">
                        <Button 
                          size="lg" 
                          className="relative group bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-12 py-6 text-xl font-bold rounded-2xl shadow-2xl hover:shadow-purple-500/25 transform hover:scale-105 transition-all duration-300 w-full lg:w-auto"
                        >
                          {isGerman ? 'Zum Dashboard' : 'Go to Dashboard'}
                          <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    ) : (
                      <div className="space-y-4">
                        <Link href="/onboarding">
                          <Button 
                            size="lg" 
                            className="relative group bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-12 py-6 text-xl font-bold rounded-2xl shadow-2xl hover:shadow-purple-500/25 transform hover:scale-105 transition-all duration-300 w-full"
                          >
                            {isGerman ? 'Kostenlos starten' : 'Start Free'}
                            <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </Link>
                        
                        <Link href="/demo">
                          <Button 
                            variant="outline" 
                            size="lg"
                            className="group border-purple-400/50 text-purple-200 hover:bg-purple-500/20 hover:border-purple-400 px-12 py-6 text-lg font-semibold rounded-2xl backdrop-blur-sm transition-all duration-300 w-full"
                          >
                            {isGerman ? 'Mehr erfahren' : 'Learn More'}
                          </Button>
                        </Link>
                      </div>
                    )}

                    {/* Trust Indicators */}
                    <div className="mt-8 flex items-center justify-center gap-6 text-sm text-gray-400">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                        <span>50K+ {isGerman ? 'aktive Spieler' : 'active players'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
                          ))}
                        </div>
                        <span>4.9/5</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bottom Text */}
          <div className="text-center mt-12">
            <p className="text-gray-400 text-sm">
              {isGerman 
                ? 'Keine Bindung • Jederzeit kündbar • Datenschutz garantiert'
                : 'No commitment • Cancel anytime • Privacy guaranteed'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.2; }
          50% { transform: translateY(-15px) rotate(180deg); opacity: 0.4; }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </section>
  )
}