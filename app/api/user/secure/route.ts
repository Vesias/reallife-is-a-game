import { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createSecureAPIHandler, authenticatedAPIMiddleware } from '@/lib/security/api-security';
import { apiSchemas } from '@/lib/security/validation';
import type { RequestContext } from '@/lib/security/api-security';

// GET /api/user/secure - Get current user profile with security
async function handleGetUser(request: NextRequest, context: RequestContext) {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error('User not found');
  }

  // Get user profile data
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profileError && profileError.code !== 'PGRST116') {
    throw new Error('Failed to fetch profile');
  }

  return {
    user: {
      id: user.id,
      email: user.email,
      email_confirmed_at: user.email_confirmed_at,
      created_at: user.created_at,
      updated_at: user.updated_at,
      ...profile,
    },
  };
}

// PUT /api/user/secure - Update user profile with validation
async function handleUpdateUser(request: NextRequest, context: RequestContext) {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error('User not found');
  }

  const body = await request.json();
  
  // Validate with Zod schema
  const validation = apiSchemas.updateProfile.safeParse(body);
  if (!validation.success) {
    throw new Error('Validation failed');
  }

  const { firstName, lastName, avatar, bio, location, website, preferences } = validation.data;

  // Update profile
  const { data, error } = await supabase
    .from('profiles')
    .update({
      first_name: firstName,
      last_name: lastName,
      avatar_url: avatar,
      bio,
      location,
      website,
      preferences,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)
    .select()
    .single();

  if (error) {
    throw new Error('Failed to update profile');
  }

  return {
    message: 'Profile updated successfully',
    profile: data,
  };
}

// Create secure handlers with middleware
export const GET = createSecureAPIHandler(handleGetUser, authenticatedAPIMiddleware);
export const PUT = createSecureAPIHandler(handleUpdateUser, authenticatedAPIMiddleware);