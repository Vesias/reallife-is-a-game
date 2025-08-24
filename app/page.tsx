'use client'

import { Navbar } from '@/components/nav/navbar'
import { HeroSection } from '@/components/landing/hero-section'
import { FeatureGrid } from '@/components/landing/feature-grid'
import { TestimonialsSection } from '@/components/landing/testimonials'
import { CTASection } from '@/components/landing/cta-section'

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <HeroSection />
      
      {/* Features Section */}
      <FeatureGrid />
      
      {/* Testimonials Section */}
      <TestimonialsSection />
      
      {/* CTA Section */}
      <CTASection />
    </div>
  )
}