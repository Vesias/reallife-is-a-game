import { createServerSupabaseClient } from './supabase-server'
import { redirect } from 'next/navigation'
import { User } from '@supabase/supabase-js'

export interface AuthenticatedUser extends User {
  profile?: {
    id: string
    full_name?: string
    username?: string
    website?: string
    avatar_url?: string
    role?: string
    created_at: string
    updated_at: string
  }
}

/**
 * Require authentication for a page/component
 * Redirects to login if not authenticated
 */
export async function requireAuth(): Promise<AuthenticatedUser> {
  const supabase = createServerSupabaseClient()
  
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return {
    ...user,
    profile: profile || undefined,
  }
}

/**
 * Require specific role for access
 * Redirects to unauthorized page if role doesn't match
 */
export async function requireRole(requiredRole: string): Promise<AuthenticatedUser> {
  const user = await requireAuth()
  
  if (user.profile?.role !== requiredRole) {
    redirect('/unauthorized')
  }

  return user
}

/**
 * Check if user has any of the specified roles
 */
export async function hasAnyRole(roles: string[]): Promise<boolean> {
  const supabase = createServerSupabaseClient()
  
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return false
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  return profile?.role ? roles.includes(profile.role) : false
}

/**
 * Get current user without requiring authentication
 * Returns null if not authenticated
 */
export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  const supabase = createServerSupabaseClient()
  
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      return null
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    return {
      ...user,
      profile: profile || undefined,
    }
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

/**
 * Session management helpers
 */
export class SessionManager {
  /**
   * Refresh user session
   */
  static async refreshSession() {
    const supabase = createServerSupabaseClient()
    
    try {
      const { data, error } = await supabase.auth.refreshSession()
      
      if (error) {
        console.error('Session refresh error:', error)
        return false
      }

      return !!data.session
    } catch (error) {
      console.error('Unexpected session refresh error:', error)
      return false
    }
  }

  /**
   * Sign out user and clear session
   */
  static async signOut() {
    const supabase = createServerSupabaseClient()
    
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('Sign out error:', error)
        return false
      }

      redirect('/login')
    } catch (error) {
      console.error('Unexpected sign out error:', error)
      return false
    }
  }

  /**
   * Get session expiry time
   */
  static async getSessionExpiry(): Promise<Date | null> {
    const supabase = createServerSupabaseClient()
    
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.expires_at) {
        return null
      }

      return new Date(session.expires_at * 1000)
    } catch (error) {
      console.error('Error getting session expiry:', error)
      return null
    }
  }

  /**
   * Check if session is expired
   */
  static async isSessionExpired(): Promise<boolean> {
    const expiry = await this.getSessionExpiry()
    
    if (!expiry) {
      return true
    }

    return expiry < new Date()
  }
}

/**
 * Authorization helpers
 */
export class Authorization {
  /**
   * Check if user can access resource
   */
  static async canAccess(
    resourceType: string,
    resourceId: string,
    action: 'read' | 'write' | 'delete' = 'read'
  ): Promise<boolean> {
    const user = await getCurrentUser()
    
    if (!user) {
      return false
    }

    // Admin can access everything
    if (user.profile?.role === 'admin') {
      return true
    }

    // Add your authorization logic here based on your requirements
    // This is a basic example
    switch (resourceType) {
      case 'profile':
        // Users can only access their own profile
        return resourceId === user.id
      
      case 'post':
        // Add post-specific authorization logic
        return await this.checkPostAccess(user.id, resourceId, action)
      
      default:
        return false
    }
  }

  /**
   * Example: Check post access (implement based on your schema)
   */
  private static async checkPostAccess(
    userId: string,
    postId: string,
    action: 'read' | 'write' | 'delete'
  ): Promise<boolean> {
    const supabase = createServerSupabaseClient()
    
    // This is an example - adjust based on your actual schema
    const { data: post } = await supabase
      .from('posts')
      .select('user_id, visibility')
      .eq('id', postId)
      .single()

    if (!post) {
      return false
    }

    // User owns the post
    if (post.user_id === userId) {
      return true
    }

    // Public posts can be read by anyone
    if (action === 'read' && post.visibility === 'public') {
      return true
    }

    return false
  }
}