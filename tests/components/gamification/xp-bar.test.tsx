/**
 * @test XP Bar Component
 * @description Unit tests for XP progress bar component
 */

import { render, screen } from '@testing-library/react'
import { XPBar } from '@/components/gamification/xp-bar'

describe('XPBar Component', () => {
  it('should render with basic props', () => {
    render(<XPBar currentXP={150} totalXP={500} level={3} />)
    
    expect(screen.getByText('Level 3')).toBeInTheDocument()
    expect(screen.getByText('150 / 500 XP')).toBeInTheDocument()
  })

  it('should calculate progress percentage correctly', () => {
    render(<XPBar currentXP={250} totalXP={500} level={4} />)
    
    const progressBar = screen.getByRole('progressbar')
    expect(progressBar).toHaveAttribute('aria-valuenow', '50') // 250/500 = 50%
  })

  it('should handle zero values', () => {
    render(<XPBar currentXP={0} totalXP={100} level={1} />)
    
    expect(screen.getByText('Level 1')).toBeInTheDocument()
    expect(screen.getByText('0 / 100 XP')).toBeInTheDocument()
    
    const progressBar = screen.getByRole('progressbar')
    expect(progressBar).toHaveAttribute('aria-valuenow', '0')
  })

  it('should handle 100% progress', () => {
    render(<XPBar currentXP={500} totalXP={500} level={5} />)
    
    const progressBar = screen.getByRole('progressbar')
    expect(progressBar).toHaveAttribute('aria-valuenow', '100')
  })

  it('should show custom label when provided', () => {
    render(
      <XPBar 
        currentXP={300} 
        totalXP={600} 
        level={4} 
        label="Progress to next level" 
      />
    )
    
    expect(screen.getByText('Progress to next level')).toBeInTheDocument()
  })

  it('should apply custom className', () => {
    const { container } = render(
      <XPBar 
        currentXP={100} 
        totalXP={200} 
        level={2} 
        className="custom-class" 
      />
    )
    
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('should show level up indicator when leveled up', () => {
    render(
      <XPBar 
        currentXP={500} 
        totalXP={500} 
        level={5} 
        showLevelUp={true} 
      />
    )
    
    expect(screen.getByText(/level up/i)).toBeInTheDocument()
  })

  it('should handle edge case of more current XP than total', () => {
    render(<XPBar currentXP={600} totalXP={500} level={6} />)
    
    // Should cap at 100%
    const progressBar = screen.getByRole('progressbar')
    expect(progressBar).toHaveAttribute('aria-valuenow', '100')
  })

  it('should be accessible', () => {
    render(<XPBar currentXP={200} totalXP={400} level={3} />)
    
    const progressBar = screen.getByRole('progressbar')
    expect(progressBar).toHaveAttribute('aria-label', expect.stringContaining('XP progress'))
    expect(progressBar).toHaveAttribute('aria-valuemin', '0')
    expect(progressBar).toHaveAttribute('aria-valuemax', '100')
  })

  it('should render with animated progress when enabled', () => {
    render(
      <XPBar 
        currentXP={250} 
        totalXP={500} 
        level={4} 
        animated={true} 
      />
    )
    
    const progressBar = screen.getByRole('progressbar')
    expect(progressBar).toHaveClass('animate-pulse') // or whatever animation class
  })

  it('should format large numbers correctly', () => {
    render(<XPBar currentXP={1500} totalXP={3000} level={10} />)
    
    expect(screen.getByText('1,500 / 3,000 XP')).toBeInTheDocument()
  })

  it('should show next level XP when provided', () => {
    render(
      <XPBar 
        currentXP={400} 
        totalXP={500} 
        level={4} 
        nextLevelXP={600}
      />
    )
    
    // Should show progress within current level
    expect(screen.getByText(/200 more XP to level 5/i)).toBeInTheDocument()
  })
})

describe('XPBar Visual States', () => {
  it('should apply different colors based on progress', () => {
    const { rerender } = render(
      <XPBar currentXP={50} totalXP={500} level={2} />
    )
    
    let progressBar = screen.getByRole('progressbar')
    expect(progressBar.firstChild).toHaveClass('bg-red-500') // Low progress
    
    rerender(<XPBar currentXP={250} totalXP={500} level={3} />)
    progressBar = screen.getByRole('progressbar')
    expect(progressBar.firstChild).toHaveClass('bg-yellow-500') // Medium progress
    
    rerender(<XPBar currentXP={450} totalXP={500} level={4} />)
    progressBar = screen.getByRole('progressbar')
    expect(progressBar.firstChild).toHaveClass('bg-green-500') // High progress
  })

  it('should show pulsing animation on level up', () => {
    render(
      <XPBar 
        currentXP={500} 
        totalXP={500} 
        level={5} 
        showLevelUp={true} 
      />
    )
    
    expect(screen.getByText(/level up/i)).toHaveClass('animate-pulse')
  })
})

describe('XPBar Performance', () => {
  it('should render quickly with large numbers', () => {
    const start = performance.now()
    
    render(<XPBar currentXP={999999} totalXP={1000000} level={50} />)
    
    const duration = performance.now() - start
    expect(duration).toBeLessThan(50) // Should render under 50ms
  })

  it('should handle rapid prop changes efficiently', () => {
    const { rerender } = render(
      <XPBar currentXP={100} totalXP={500} level={2} />
    )
    
    const start = performance.now()
    
    // Simulate rapid XP updates
    for (let i = 100; i <= 400; i += 10) {
      rerender(<XPBar currentXP={i} totalXP={500} level={Math.floor(i / 100) + 1} />)
    }
    
    const duration = performance.now() - start
    expect(duration).toBeLessThan(100) // 30 renders under 100ms
  })
})