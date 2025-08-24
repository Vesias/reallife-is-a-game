/**
 * @test useGamification Hook  
 * @description Unit tests for gamification hook including XP, levels, and achievements
 */

import { renderHook, act, waitFor } from '@testing-library/react'
import { useGamification } from '@/hooks/use-gamification'

// Mock global Supabase 
const mockSupabase = global.mockSupabase

describe('useGamification Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Default mock responses
    mockSupabase.from.mockReturnValue(mockSupabase)
    mockSupabase.select.mockReturnValue(mockSupabase) 
    mockSupabase.eq.mockReturnValue(mockSupabase)
    mockSupabase.single.mockResolvedValue({
      data: {
        id: 'user-123',
        total_xp: 250,
        current_level: 3,
        achievements: []
      },
      error: null
    })
  })

  it('should initialize with default gamification state', async () => {
    const { result } = renderHook(() => useGamification())
    
    expect(result.current.loading).toBe(true)
    expect(result.current.totalXP).toBe(0)
    expect(result.current.currentLevel).toBe(1)
    expect(result.current.achievements).toEqual([])
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
  })

  it('should load user gamification data', async () => {
    const mockGamificationData = {
      id: 'user-123',
      total_xp: 500,
      current_level: 4,
      achievements: ['first_quest', 'level_up']
    }
    
    mockSupabase.single.mockResolvedValue({
      data: mockGamificationData,
      error: null
    })
    
    const { result } = renderHook(() => useGamification())
    
    await waitFor(() => {
      expect(result.current.totalXP).toBe(500)
      expect(result.current.currentLevel).toBe(4)
      expect(result.current.achievements).toEqual(['first_quest', 'level_up'])
      expect(result.current.loading).toBe(false)
    })
  })

  it('should calculate correct level from XP', async () => {
    const { result } = renderHook(() => useGamification())
    
    // Test level calculation
    expect(result.current.getLevelFromXP(0)).toBe(1)
    expect(result.current.getLevelFromXP(100)).toBe(2)
    expect(result.current.getLevelFromXP(250)).toBe(3)
    expect(result.current.getLevelFromXP(500)).toBe(4)
    expect(result.current.getLevelFromXP(1000)).toBe(6)
  })

  it('should calculate XP needed for next level', async () => {
    mockSupabase.single.mockResolvedValue({
      data: { total_xp: 150, current_level: 2 },
      error: null
    })
    
    const { result } = renderHook(() => useGamification())
    
    await waitFor(() => {
      expect(result.current.totalXP).toBe(150)
      expect(result.current.currentLevel).toBe(2)
    })
    
    // At level 2 (100-249 XP), need 250 XP for level 3
    const xpForNext = result.current.getXPForNextLevel()
    expect(xpForNext).toBe(100) // 250 - 150 = 100 XP needed
  })

  it('should award XP and update level', async () => {
    mockSupabase.single.mockResolvedValue({
      data: { total_xp: 90, current_level: 1 },
      error: null
    })
    
    // Mock the update response
    mockSupabase.update.mockReturnValue(mockSupabase)
    mockSupabase.eq.mockReturnValue(mockSupabase)
    mockSupabase.single.mockResolvedValueOnce({
      data: { total_xp: 90, current_level: 1 }, // Initial load
      error: null
    }).mockResolvedValueOnce({
      data: { total_xp: 140, current_level: 2 }, // After XP award
      error: null
    })
    
    const { result } = renderHook(() => useGamification())
    
    await waitFor(() => {
      expect(result.current.totalXP).toBe(90)
      expect(result.current.currentLevel).toBe(1)
    })
    
    // Award 50 XP (should level up from 1 to 2)
    await act(async () => {
      await result.current.awardXP(50)
    })
    
    expect(mockSupabase.update).toHaveBeenCalledWith({
      total_xp: 140,
      current_level: 2
    })
  })

  it('should unlock achievements', async () => {
    mockSupabase.single.mockResolvedValue({
      data: { achievements: [] },
      error: null
    })
    
    const { result } = renderHook(() => useGamification())
    
    await waitFor(() => {
      expect(result.current.achievements).toEqual([])
    })
    
    await act(async () => {
      await result.current.unlockAchievement('first_quest')
    })
    
    expect(mockSupabase.update).toHaveBeenCalledWith(
      expect.objectContaining({
        achievements: expect.arrayContaining(['first_quest'])
      })
    )
  })

  it('should not unlock duplicate achievements', async () => {
    mockSupabase.single.mockResolvedValue({
      data: { achievements: ['first_quest'] },
      error: null
    })
    
    const { result } = renderHook(() => useGamification())
    
    await waitFor(() => {
      expect(result.current.achievements).toEqual(['first_quest'])
    })
    
    await act(async () => {
      await result.current.unlockAchievement('first_quest')
    })
    
    // Should not call update since achievement already exists
    expect(mockSupabase.update).not.toHaveBeenCalled()
  })

  it('should check if achievement is unlocked', async () => {
    mockSupabase.single.mockResolvedValue({
      data: { achievements: ['first_quest', 'level_up'] },
      error: null
    })
    
    const { result } = renderHook(() => useGamification())
    
    await waitFor(() => {
      expect(result.current.hasAchievement('first_quest')).toBe(true)
      expect(result.current.hasAchievement('level_up')).toBe(true)  
      expect(result.current.hasAchievement('nonexistent')).toBe(false)
    })
  })

  it('should handle missing gamification data gracefully', async () => {
    mockSupabase.single.mockResolvedValue({
      data: null,
      error: null
    })
    
    const { result } = renderHook(() => useGamification())
    
    await waitFor(() => {
      expect(result.current.totalXP).toBe(0)
      expect(result.current.currentLevel).toBe(1)
      expect(result.current.achievements).toEqual([])
      expect(result.current.loading).toBe(false)
    })
  })

  it('should handle database errors', async () => {
    mockSupabase.single.mockResolvedValue({
      data: null,
      error: { message: 'Database connection failed' }
    })
    
    const { result } = renderHook(() => useGamification())
    
    await waitFor(() => {
      expect(result.current.error).toBe('Database connection failed')
      expect(result.current.loading).toBe(false)
    })
  })

  it('should calculate progress percentage correctly', async () => {
    mockSupabase.single.mockResolvedValue({
      data: { total_xp: 150, current_level: 2 },
      error: null
    })
    
    const { result } = renderHook(() => useGamification())
    
    await waitFor(() => {
      // Level 2 is 100-249 XP, so 150 XP is 50/150 = 33.33% through level 2
      const progress = result.current.getCurrentLevelProgress()
      expect(progress).toBeCloseTo(33.33, 1)
    })
  })
})

describe('XP Calculation Edge Cases', () => {
  it('should handle negative XP values', () => {
    const { result } = renderHook(() => useGamification())
    
    expect(result.current.getLevelFromXP(-100)).toBe(1)
    expect(result.current.getXPForLevel(0)).toBe(0)
  })

  it('should handle very large XP values', () => {
    const { result } = renderHook(() => useGamification())
    
    const largeXP = 1000000
    const level = result.current.getLevelFromXP(largeXP)
    expect(level).toBeGreaterThan(1)
    expect(level).toBeLessThan(200) // Reasonable upper bound
  })

  it('should calculate consistent XP requirements', () => {
    const { result } = renderHook(() => useGamification())
    
    // XP required for level should be consistent
    for (let level = 1; level <= 10; level++) {
      const xpRequired = result.current.getXPForLevel(level)
      const calculatedLevel = result.current.getLevelFromXP(xpRequired)
      expect(calculatedLevel).toBe(level)
    }
  })
})