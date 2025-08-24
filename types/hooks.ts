import type { UseAsyncResult, UseFormResult } from './components'
import type { User, UserProfile } from './index'
import type { CrewMember, Quest, ActivityItem } from './index'

// Auth hook types
export interface UseAuthResult {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>
  deleteAccount: () => Promise<void>
  isAuthenticated: boolean
}

// Local storage hook types
export interface UseLocalStorageResult<T> {
  value: T
  setValue: (value: T | ((prev: T) => T)) => void
  removeValue: () => void
  loading: boolean
  error: string | null
}

// Session storage hook types  
export interface UseSessionStorageResult<T> extends UseLocalStorageResult<T> {}

// Async hook types
export interface UseAsyncOptions {
  immediate?: boolean
  onSuccess?: (data: any) => void
  onError?: (error: Error) => void
  resetOnReload?: boolean
}

// API hook types
export interface UseApiOptions extends UseAsyncOptions {
  refetchInterval?: number
  refetchOnFocus?: boolean
  refetchOnReconnect?: boolean
  cacheKey?: string
  cacheTime?: number
}

export interface UseApiResult<T> extends UseAsyncResult<T> {
  refetch: () => Promise<T>
  cancel: () => void
  isCached: boolean
  isStale: boolean
  lastRefetch?: Date
}

// Form hook types
export interface UseFormOptions<T> {
  initialValues: T
  validationSchema?: any // Zod schema or similar
  onSubmit: (values: T) => Promise<void> | void
  validateOnChange?: boolean
  validateOnBlur?: boolean
}

// Toast hook types
export interface UseToastResult {
  toast: (options: ToastOptions) => string
  dismiss: (id?: string) => void
  dismissAll: () => void
  toasts: ToastState[]
}

export interface ToastState {
  id: string
  title?: string
  description?: string
  variant: 'default' | 'destructive' | 'success' | 'warning'
  duration: number
  createdAt: Date
  dismissed?: boolean
}

export interface ToastOptions {
  title?: string
  description?: string
  variant?: 'default' | 'destructive' | 'success' | 'warning'
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

// Theme hook types
export type ThemeMode = 'light' | 'dark' | 'system'

export interface UseThemeResult {
  theme: ThemeMode
  setTheme: (theme: ThemeMode) => void
  resolvedTheme: 'light' | 'dark'
  systemTheme: 'light' | 'dark'
}

// Media query hook types
export interface UseMediaQueryResult {
  matches: boolean
  media: string
}

// Debounce hook types
export interface UseDebounceResult<T> {
  debouncedValue: T
  isPending: boolean
  cancel: () => void
  flush: () => void
}

// Throttle hook types  
export interface UseThrottleResult<T> {
  throttledValue: T
  cancel: () => void
}

// Intersection observer hook types
export interface UseIntersectionObserverOptions {
  threshold?: number | number[]
  root?: Element | null
  rootMargin?: string
  triggerOnce?: boolean
}

export interface UseIntersectionObserverResult {
  ref: (element: Element | null) => void
  isIntersecting: boolean
  entry?: IntersectionObserverEntry
}

// Window size hook types
export interface UseWindowSizeResult {
  width: number | undefined
  height: number | undefined
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
}

// Copy to clipboard hook types
export interface UseCopyToClipboardResult {
  copy: (text: string) => Promise<boolean>
  copied: boolean
  error: Error | null
  reset: () => void
}

// Geolocation hook types
export interface UseGeolocationOptions {
  enableHighAccuracy?: boolean
  timeout?: number
  maximumAge?: number
}

export interface UseGeolocationResult {
  location: GeolocationPosition | null
  error: GeolocationPositionError | null
  loading: boolean
  getCurrentPosition: () => void
}

// Online status hook types
export interface UseOnlineStatusResult {
  isOnline: boolean
  isOffline: boolean
}

// Previous value hook types
export interface UsePreviousResult<T> {
  previous: T | undefined
}

// Counter hook types
export interface UseCounterResult {
  count: number
  increment: (step?: number) => void
  decrement: (step?: number) => void
  reset: (value?: number) => void
  set: (value: number) => void
}

// Toggle hook types
export interface UseToggleResult {
  value: boolean
  toggle: () => void
  setTrue: () => void
  setFalse: () => void
  setValue: (value: boolean) => void
}

// Array hook types
export interface UseArrayResult<T> {
  array: T[]
  set: (array: T[]) => void
  push: (element: T) => void
  pop: () => T | undefined
  shift: () => T | undefined
  unshift: (element: T) => void
  remove: (index: number) => void
  clear: () => void
  move: (from: number, to: number) => void
  update: (index: number, element: T) => void
  filter: (predicate: (item: T) => boolean) => void
  sort: (compareFn?: (a: T, b: T) => number) => void
}

// Map hook types  
export interface UseMapResult<K, V> {
  map: Map<K, V>
  set: (key: K, value: V) => void
  get: (key: K) => V | undefined
  has: (key: K) => boolean
  delete: (key: K) => boolean
  clear: () => void
  size: number
  keys: K[]
  values: V[]
  entries: [K, V][]
}

// Set hook types
export interface UseSetResult<T> {
  set: Set<T>
  add: (value: T) => void
  delete: (value: T) => boolean
  has: (value: T) => boolean
  clear: () => void
  size: number
  values: T[]
}

// Interval hook types
export interface UseIntervalResult {
  start: () => void
  stop: () => void
  toggle: () => void
  isActive: boolean
}

// Timeout hook types
export interface UseTimeoutResult {
  start: () => void
  stop: () => void
  restart: () => void
  isActive: boolean
}

// Idle hook types
export interface UseIdleOptions {
  timeout?: number
  events?: string[]
  initialState?: boolean
}

export interface UseIdleResult {
  isIdle: boolean
  lastActivity: Date | null
  reset: () => void
}

// Scroll hook types
export interface UseScrollOptions {
  threshold?: number
}

export interface UseScrollResult {
  x: number
  y: number
  isScrolling: boolean
  direction: {
    x: 'left' | 'right' | null
    y: 'up' | 'down' | null
  }
}

// Measure hook types
export interface UseMeasureResult {
  ref: (element: Element | null) => void
  bounds: DOMRectReadOnly | null
  width: number
  height: number
}

// Hover hook types
export interface UseHoverResult {
  ref: (element: Element | null) => void
  isHovered: boolean
}

// Focus hook types
export interface UseFocusResult {
  ref: (element: Element | null) => void
  isFocused: boolean
}

// Click outside hook types
export interface UseClickOutsideResult {
  ref: (element: Element | null) => void
}

// Key press hook types
export interface UseKeyPressOptions {
  target?: Element | Window | Document
}

export interface UseKeyPressResult {
  isPressed: boolean
}

// Event listener hook types
export interface UseEventListenerOptions {
  target?: Element | Window | Document | null
  passive?: boolean
  capture?: boolean
}

// Permission hook types
export type PermissionName = 
  | 'camera' 
  | 'microphone' 
  | 'geolocation' 
  | 'notifications' 
  | 'persistent-storage'
  | 'push'
  | 'screen-wake-lock'

export interface UsePermissionResult {
  state: PermissionState | 'unsupported'
  isGranted: boolean
  isDenied: boolean
  isPrompt: boolean
  request: () => Promise<PermissionState>
}

// Battery hook types
export interface UseBatteryResult {
  charging: boolean
  chargingTime: number
  dischargingTime: number
  level: number
  loading: boolean
  error: Error | null
}

// Network hook types
export interface UseNetworkResult {
  online: boolean
  downlink?: number
  downlinkMax?: number
  effectiveType?: '2g' | '3g' | '4g' | 'slow-2g'
  rtt?: number
  saveData?: boolean
  type?: 'bluetooth' | 'cellular' | 'ethernet' | 'none' | 'wifi' | 'wimax' | 'other' | 'unknown'
}

// Color scheme hook types
export interface UseColorSchemeResult {
  colorScheme: 'light' | 'dark'
  preference: 'light' | 'dark' | 'no-preference'
}

// Reduced motion hook types
export interface UseReducedMotionResult {
  prefersReducedMotion: boolean
}

// LifeQuest specific hook types

// Crew hooks
export interface UseCrewResult extends UseApiResult<CrewMember[]> {
  joinCrew: (crewId: string) => Promise<void>
  leaveCrew: (crewId: string) => Promise<void>
  createCrew: (crew: any) => Promise<string>
  updateCrew: (crewId: string, updates: any) => Promise<void>
  deleteCrew: (crewId: string) => Promise<void>
}

export interface UseCrewMembersResult extends UseApiResult<CrewMember[]> {
  inviteMember: (email: string) => Promise<void>
  removeMember: (memberId: string) => Promise<void>
  updateMemberRole: (memberId: string, role: string) => Promise<void>
}

// Quest hooks
export interface UseQuestsResult extends UseApiResult<Quest[]> {
  createQuest: (quest: any) => Promise<string>
  updateQuest: (questId: string, updates: any) => Promise<void>
  deleteQuest: (questId: string) => Promise<void>
  completeQuest: (questId: string) => Promise<void>
  abandonQuest: (questId: string) => Promise<void>
}

export interface UseQuestProgressResult {
  progress: number
  updateProgress: (questId: string, progress: number) => Promise<void>
  resetProgress: (questId: string) => Promise<void>
}

// Activity hooks
export interface UseActivityResult extends UseApiResult<ActivityItem[]> {
  markAsRead: (activityId: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  deleteActivity: (activityId: string) => Promise<void>
}

// Gamification hooks
export interface UseXPResult {
  totalXP: number
  level: number
  nextLevelXP: number
  progressToNext: number
  addXP: (amount: number, source?: string) => Promise<void>
}

export interface UseAchievementsResult extends UseApiResult<any[]> {
  unlockAchievement: (achievementId: string) => Promise<void>
  checkProgress: (achievementId: string) => Promise<number>
}

// Stats hooks
export interface UseStatsResult extends UseApiResult<any> {
  refreshStats: () => Promise<void>
  getStatsByPeriod: (period: 'daily' | 'weekly' | 'monthly') => Promise<any>
}

// Real-time hooks
export interface UseRealtimeResult<T> {
  data: T | null
  status: 'connecting' | 'connected' | 'disconnected' | 'error'
  error: Error | null
  subscribe: (channel: string, callback: (data: T) => void) => () => void
  unsubscribe: (channel: string) => void
}

// Presence hooks
export interface UsePresenceResult {
  onlineUsers: string[]
  userStatus: Record<string, 'online' | 'away' | 'offline'>
  setStatus: (status: 'online' | 'away' | 'offline') => void
}

// Error boundary hook types
export interface UseErrorBoundaryResult {
  resetError: () => void
  captureError: (error: Error) => void
}

// Custom validation hook types
export interface UseValidationOptions<T> {
  schema: any // Zod schema
  mode?: 'onChange' | 'onBlur' | 'onSubmit'
}

export interface UseValidationResult<T> {
  errors: Record<keyof T, string>
  isValid: boolean
  validate: (field?: keyof T) => boolean
  clearError: (field: keyof T) => void
  clearAllErrors: () => void
}