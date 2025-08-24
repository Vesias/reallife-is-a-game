'use client'

import { useTranslation } from '@/lib/i18n-simple'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Star, Quote, TrendingUp, Users, Target } from 'lucide-react'
import { useEffect, useState } from 'react'

const testimonials = [
  {
    textDe: "LifeQuest hat mein Produktivitätsspiel komplett verändert. Ich freue mich jetzt tatsächlich auf meine To-Do-Liste!",
    textEn: "LifeQuest completely changed my productivity game. I actually look forward to my to-do list now!",
    author: "Sarah M.",
    role: "Marketing Managerin",
    roleEn: "Marketing Manager",
    level: 23,
    xp: 12450,
    questsCompleted: 89,
    avatar: "/testimonials/sarah.jpg",
    initials: "SM",
    color: "from-purple-500 to-pink-500"
  },
  {
    textDe: "Das Crew-System ist genial. Wir motivieren uns gegenseitig jeden Tag und haben bereits 50+ gemeinsame Quests abgeschlossen.",
    textEn: "The crew system is brilliant. We motivate each other daily and have completed 50+ shared quests already.",
    author: "Max K.",
    role: "Software-Entwickler",
    roleEn: "Software Developer",
    level: 31,
    xp: 18750,
    questsCompleted: 127,
    avatar: "/testimonials/max.jpg",
    initials: "MK",
    color: "from-blue-500 to-cyan-500"
  },
  {
    textDe: "Der KI-Agent gibt mir perfekte Vorschläge und hilft mir dabei, meine Ziele tatsächlich zu erreichen. Game-Changer!",
    textEn: "The AI agent gives me perfect suggestions and helps me actually achieve my goals. Game-changer!",
    author: "Lisa T.",
    role: "Studentin",
    roleEn: "Student",
    level: 18,
    xp: 8920,
    questsCompleted: 64,
    avatar: "/testimonials/lisa.jpg",
    initials: "LT",
    color: "from-green-500 to-emerald-500"
  }
]

export function TestimonialsSection() {
  const { isGerman, formatters } = useTranslation()
  const [currentTestimonial, setCurrentTestimonial] = useState(0)

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 6000)

    return () => clearInterval(interval)
  }, [])

  return (
    <section className="py-24 bg-gradient-to-b from-white to-slate-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 bg-purple-50 border-purple-200 text-purple-700">
            <Quote className="w-3 h-3 mr-1" />
            {isGerman ? 'Erfahrungen' : 'Testimonials'}
          </Badge>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600">
            {isGerman ? 'Was unsere Spieler sagen' : 'What Our Players Say'}
          </h2>
          
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            {isGerman 
              ? 'Echte Erfahrungen von der LifeQuest-Community'
              : 'Real experiences from the LifeQuest community'
            }
          </p>
        </div>

        {/* Featured Testimonial */}
        <div className="max-w-4xl mx-auto mb-16">
          <Card className="relative overflow-hidden bg-gradient-to-br from-slate-900 to-purple-900 border-0 shadow-2xl">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-purple-400 to-transparent rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-blue-400 to-transparent rounded-full blur-3xl" />
            </div>

            <CardContent className="relative p-8 md:p-12">
              <div className="flex flex-col md:flex-row items-center gap-8">
                {/* Avatar and User Info */}
                <div className="flex-shrink-0 text-center">
                  <div className="relative mb-4">
                    <Avatar className="w-24 h-24 border-4 border-white/20">
                      <AvatarImage src={testimonials[currentTestimonial].avatar} />
                      <AvatarFallback className={`text-2xl font-bold bg-gradient-to-br ${testimonials[currentTestimonial].color} text-white`}>
                        {testimonials[currentTestimonial].initials}
                      </AvatarFallback>
                    </Avatar>
                    
                    {/* Level Badge */}
                    <Badge className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-gradient-to-r ${testimonials[currentTestimonial].color} text-white border-0`}>
                      Level {testimonials[currentTestimonial].level}
                    </Badge>
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-1">
                    {testimonials[currentTestimonial].author}
                  </h3>
                  <p className="text-purple-200">
                    {isGerman ? testimonials[currentTestimonial].role : testimonials[currentTestimonial].roleEn}
                  </p>

                  {/* Stats */}
                  <div className="flex justify-center gap-4 mt-4 text-sm">
                    <div className="text-center">
                      <div className="text-white font-bold">
                        {formatters.number(testimonials[currentTestimonial].xp)}
                      </div>
                      <div className="text-purple-200">XP</div>
                    </div>
                    <div className="text-center">
                      <div className="text-white font-bold">
                        {testimonials[currentTestimonial].questsCompleted}
                      </div>
                      <div className="text-purple-200">
                        {isGerman ? 'Quests' : 'Quests'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Testimonial Content */}
                <div className="flex-1 text-center md:text-left">
                  <Quote className="w-12 h-12 text-purple-300 mb-4 mx-auto md:mx-0" />
                  
                  <blockquote className="text-2xl md:text-3xl font-medium text-white leading-relaxed mb-6">
                    "{isGerman ? testimonials[currentTestimonial].textDe : testimonials[currentTestimonial].textEn}"
                  </blockquote>

                  {/* Rating */}
                  <div className="flex justify-center md:justify-start gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Testimonial Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={index}
              className={`group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                index === currentTestimonial 
                  ? 'ring-2 ring-purple-500 shadow-lg' 
                  : 'hover:ring-1 hover:ring-purple-300'
              }`}
              onClick={() => setCurrentTestimonial(index)}
            >
              <CardContent className="p-6">
                {/* Header */}
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={testimonial.avatar} />
                    <AvatarFallback className={`font-bold bg-gradient-to-br ${testimonial.color} text-white`}>
                      {testimonial.initials}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <h4 className="font-semibold text-slate-900">{testimonial.author}</h4>
                    <p className="text-sm text-slate-600">
                      {isGerman ? testimonial.role : testimonial.roleEn}
                    </p>
                  </div>
                  
                  <Badge variant="secondary" className="ml-auto">
                    L{testimonial.level}
                  </Badge>
                </div>

                {/* Quote */}
                <blockquote className="text-slate-700 italic mb-4 line-clamp-3">
                  "{isGerman ? testimonial.textDe : testimonial.textEn}"
                </blockquote>

                {/* Stats */}
                <div className="flex justify-between text-sm border-t pt-4">
                  <div className="flex items-center gap-1 text-slate-600">
                    <TrendingUp className="w-4 h-4" />
                    {formatters.number(testimonial.xp)} XP
                  </div>
                  <div className="flex items-center gap-1 text-slate-600">
                    <Target className="w-4 h-4" />
                    {testimonial.questsCompleted} {isGerman ? 'Quests' : 'Quests'}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Navigation Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {testimonials.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentTestimonial 
                  ? 'bg-purple-600 scale-125' 
                  : 'bg-slate-300 hover:bg-slate-400'
              }`}
              onClick={() => setCurrentTestimonial(index)}
            />
          ))}
        </div>

        {/* Community Stats */}
        <div className="mt-20 text-center">
          <h3 className="text-2xl font-bold text-slate-800 mb-8">
            {isGerman ? 'Werde Teil unserer Community' : 'Join Our Community'}
          </h3>
          
          <div className="grid grid-cols-3 gap-8 max-w-md mx-auto">
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">4.9</div>
              <div className="text-slate-600 text-sm">
                {isGerman ? 'Bewertung' : 'Rating'}
              </div>
              <div className="flex justify-center gap-0.5 mt-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
                ))}
              </div>
            </div>
            
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">50K+</div>
              <div className="text-slate-600 text-sm">
                {isGerman ? 'Spieler' : 'Players'}
              </div>
            </div>
            
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">98%</div>
              <div className="text-slate-600 text-sm">
                {isGerman ? 'Zufrieden' : 'Satisfied'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}