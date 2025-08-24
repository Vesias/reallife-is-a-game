import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import type { 
  UserApiResponse, 
  UpdateUserProfileRequest, 
  UpdateUserProfileResponse,
  ApiErrorResponse 
} from '@/types/api'

export const runtime = 'nodejs' // Force Node.js runtime for Supabase compatibility

// GET /api/user - Get current user profile
export async function GET(request: NextRequest): Promise<NextResponse<UserApiResponse | ApiErrorResponse>> {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Unauthorized',
          statusCode: 401
        },
        { status: 401 }
      )
    }

    // Get user profile data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Profile fetch error:', profileError)
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to fetch profile',
          statusCode: 500
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        email_confirmed_at: user.email_confirmed_at,
        created_at: user.created_at,
        updated_at: user.updated_at,
        ...profile,
      },
    })
  } catch (error) {
    console.error('User API error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        statusCode: 500
      },
      { status: 500 }
    )
  }
}

// PUT /api/user - Update user profile  
export async function PUT(request: NextRequest): Promise<NextResponse<UpdateUserProfileResponse | ApiErrorResponse>> {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Unauthorized',
          statusCode: 401
        },
        { status: 401 }
      )
    }

    const body: UpdateUserProfileRequest = await request.json()
    const { full_name, username, website, avatar_url } = body

    // Validate input
    if (username && username.length < 3) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Username must be at least 3 characters',
          statusCode: 400
        },
        { status: 400 }
      )
    }

    // Update profile
    const { data, error } = await supabase
      .from('profiles')
      .update({
        full_name,
        username,
        website,
        avatar_url,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Profile update error:', error)
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to update profile',
          statusCode: 500
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Profile updated successfully',
      profile: data,
    })
  } catch (error) {
    console.error('Profile update API error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        statusCode: 500
      },
      { status: 500 }
    )
  }
}

// DELETE /api/user - Delete user account
export async function DELETE(request: NextRequest): Promise<NextResponse<{ message: string } | ApiErrorResponse>> {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Unauthorized',
          statusCode: 401
        },
        { status: 401 }
      )
    }

    // Delete user account (requires service role key)
    const { error } = await supabase.auth.admin.deleteUser(user.id)

    if (error) {
      console.error('User deletion error:', error)
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to delete account',
          statusCode: 500
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Account deleted successfully',
    })
  } catch (error) {
    console.error('Delete user API error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        statusCode: 500
      },
      { status: 500 }
    )
  }
}