import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export const createClientSupabase = () => createClientComponentClient()
export const supabase = createClientComponentClient()

export type Database = {
  // Define your database types here
  // This will be generated from your Supabase schema
}