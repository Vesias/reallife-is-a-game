/**
 * @test Utility Functions
 * @description Unit tests for utility functions and helpers
 */

import { cn } from '@/lib/utils'
import { calculateXP, levelFromXP } from '@/lib/xp-calculator'
import { formatQuestPriority, formatQuestStatus } from '@/lib/quest-utils'

describe('cn utility function', () => {
  it('should merge class names correctly', () => {
    expect(cn('text-red-500', 'bg-blue-500')).toBe('text-red-500 bg-blue-500')
  })

  it('should handle conditional classes', () => {
    expect(cn('text-red-500', false && 'bg-blue-500')).toBe('text-red-500')
    expect(cn('text-red-500', true && 'bg-blue-500')).toBe('text-red-500 bg-blue-500')
  })

  it('should override conflicting classes', () => {
    expect(cn('text-red-500 text-blue-500')).toBe('text-blue-500')
  })

  it('should handle arrays', () => {
    expect(cn(['text-red-500', 'bg-blue-500'])).toBe('text-red-500 bg-blue-500')
  })

  it('should handle empty inputs', () => {
    expect(cn()).toBe('')
    expect(cn(null, undefined, false)).toBe('')
  })
})

describe('XP Calculator', () => {
  describe('calculateXP', () => {
    it('should calculate XP for easy difficulty', () => {
      expect(calculateXP('easy')).toBe(10)
    })

    it('should calculate XP for medium difficulty', () => {
      expect(calculateXP('medium')).toBe(25)
    })

    it('should calculate XP for hard difficulty', () => {
      expect(calculateXP('hard')).toBe(50)
    })

    it('should handle invalid difficulty', () => {
      expect(calculateXP('invalid' as any)).toBe(10) // Default to easy
    })

    it('should apply multiplier correctly', () => {
      expect(calculateXP('medium', 2)).toBe(50)
      expect(calculateXP('hard', 1.5)).toBe(75)
    })

    it('should handle zero multiplier', () => {
      expect(calculateXP('medium', 0)).toBe(0)
    })

    it('should handle negative multiplier', () => {
      expect(calculateXP('medium', -1)).toBe(0) // Should not return negative
    })
  })

  describe('levelFromXP', () => {
    it('should calculate correct level for low XP', () => {
      expect(levelFromXP(0)).toBe(1)
      expect(levelFromXP(50)).toBe(1)
      expect(levelFromXP(99)).toBe(1)
    })

    it('should calculate correct level for mid-range XP', () => {
      expect(levelFromXP(100)).toBe(2)
      expect(levelFromXP(250)).toBe(3)
      expect(levelFromXP(500)).toBe(4)
    })

    it('should calculate correct level for high XP', () => {
      expect(levelFromXP(1000)).toBe(6)
      expect(levelFromXP(2000)).toBe(9)
      expect(levelFromXP(5000)).toBe(16)
    })

    it('should handle edge cases', () => {
      expect(levelFromXP(-10)).toBe(1) // Negative XP should be level 1
      expect(levelFromXP(0.5)).toBe(1) // Fractional XP
    })
  })
})

describe('Quest Utils', () => {
  describe('formatQuestPriority', () => {
    it('should format priority levels correctly', () => {
      expect(formatQuestPriority('low')).toBe('Low Priority')
      expect(formatQuestPriority('medium')).toBe('Medium Priority')  
      expect(formatQuestPriority('high')).toBe('High Priority')
      expect(formatQuestPriority('urgent')).toBe('Urgent')
    })

    it('should handle invalid priority', () => {
      expect(formatQuestPriority('invalid' as any)).toBe('Unknown Priority')
    })

    it('should handle null/undefined', () => {
      expect(formatQuestPriority(null as any)).toBe('Unknown Priority')
      expect(formatQuestPriority(undefined as any)).toBe('Unknown Priority')
    })
  })

  describe('formatQuestStatus', () => {
    it('should format status correctly', () => {
      expect(formatQuestStatus('draft')).toBe('Draft')
      expect(formatQuestStatus('active')).toBe('In Progress')
      expect(formatQuestStatus('completed')).toBe('Completed')
      expect(formatQuestStatus('paused')).toBe('On Hold')
      expect(formatQuestStatus('cancelled')).toBe('Cancelled')
    })

    it('should handle invalid status', () => {
      expect(formatQuestStatus('invalid' as any)).toBe('Unknown')
    })

    it('should be case sensitive', () => {
      expect(formatQuestStatus('ACTIVE' as any)).toBe('Unknown')
    })
  })
})

describe('Performance Tests', () => {
  it('should execute cn utility under 1ms', () => {
    const start = performance.now()
    
    for (let i = 0; i < 1000; i++) {
      cn('class1', 'class2', 'class3', i % 2 === 0 && 'conditional')
    }
    
    const duration = performance.now() - start
    expect(duration).toBeLessThan(50) // 1000 operations under 50ms
  })

  it('should execute XP calculations under 1ms', () => {
    const start = performance.now()
    
    for (let i = 0; i < 1000; i++) {
      calculateXP('medium', Math.random() * 2)
      levelFromXP(i * 10)
    }
    
    const duration = performance.now() - start
    expect(duration).toBeLessThan(10) // Should be very fast
  })
})