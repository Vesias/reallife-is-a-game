export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          updated_at: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          website: string | null
          bio: string | null
          role: 'admin' | 'moderator' | 'user'
        }
        Insert: {
          id: string
          updated_at?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          website?: string | null
          bio?: string | null
          role?: 'admin' | 'moderator' | 'user'
        }
        Update: {
          id?: string
          updated_at?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          website?: string | null
          bio?: string | null
          role?: 'admin' | 'moderator' | 'user'
        }
        Relationships: []
      }
      posts: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          title: string
          content: string | null
          excerpt: string | null
          slug: string | null
          status: 'draft' | 'published' | 'archived'
          visibility: 'public' | 'private' | 'friends'
          user_id: string
          featured_image_url: string | null
          tags: string[] | null
          view_count: number
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          title: string
          content?: string | null
          excerpt?: string | null
          slug?: string | null
          status?: 'draft' | 'published' | 'archived'
          visibility?: 'public' | 'private' | 'friends'
          user_id: string
          featured_image_url?: string | null
          tags?: string[] | null
          view_count?: number
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          title?: string
          content?: string | null
          excerpt?: string | null
          slug?: string | null
          status?: 'draft' | 'published' | 'archived'
          visibility?: 'public' | 'private' | 'friends'
          user_id?: string
          featured_image_url?: string | null
          tags?: string[] | null
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "posts_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      comments: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          content: string
          user_id: string
          post_id: string
          parent_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          content: string
          user_id: string
          post_id: string
          parent_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          content?: string
          user_id?: string
          post_id?: string
          parent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            referencedRelation: "comments"
            referencedColumns: ["id"]
          }
        ]
      }
      likes: {
        Row: {
          id: string
          created_at: string
          user_id: string
          post_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          post_id: string
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "likes_post_id_fkey"
            columns: ["post_id"]
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      follows: {
        Row: {
          id: string
          created_at: string
          follower_id: string
          following_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          follower_id: string
          following_id: string
        }
        Update: {
          id?: string
          created_at?: string
          follower_id?: string
          following_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "follows_follower_id_fkey"
            columns: ["follower_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follows_following_id_fkey"
            columns: ["following_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      notifications: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          type: string
          title: string
          message: string | null
          read: boolean
          data: Json | null
          action_url: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          type: string
          title: string
          message?: string | null
          read?: boolean
          data?: Json | null
          action_url?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          type?: string
          title?: string
          message?: string | null
          read?: boolean
          data?: Json | null
          action_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_sessions: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          session_token: string
          expires_at: string
          device_info: Json | null
          ip_address: string | null
          is_active: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          session_token: string
          expires_at: string
          device_info?: Json | null
          ip_address?: string | null
          is_active?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          session_token?: string
          expires_at?: string
          device_info?: Json | null
          ip_address?: string | null
          is_active?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "user_sessions_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      post_with_stats: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          title: string
          content: string | null
          excerpt: string | null
          slug: string | null
          status: 'draft' | 'published' | 'archived'
          visibility: 'public' | 'private' | 'friends'
          user_id: string
          featured_image_url: string | null
          tags: string[] | null
          view_count: number
          author_username: string | null
          author_name: string | null
          author_avatar: string | null
          likes_count: number
          comments_count: number
        }
      }
    }
    Functions: {
      get_user_stats: {
        Args: {
          user_uuid: string
        }
        Returns: Json
      }
      is_valid_username: {
        Args: {
          username: string
        }
        Returns: boolean
      }
      cleanup_expired_sessions: {
        Args: {}
        Returns: undefined
      }
    }
    Enums: {
      user_role: 'admin' | 'moderator' | 'user'
      post_status: 'draft' | 'published' | 'archived'
      visibility_type: 'public' | 'private' | 'friends'
    }
  }
}

// Helper types for better DX
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Post = Database['public']['Tables']['posts']['Row']
export type Comment = Database['public']['Tables']['comments']['Row']
export type Like = Database['public']['Tables']['likes']['Row']
export type Follow = Database['public']['Tables']['follows']['Row']
export type Notification = Database['public']['Tables']['notifications']['Row']
export type UserSession = Database['public']['Tables']['user_sessions']['Row']
export type PostWithStats = Database['public']['Views']['post_with_stats']['Row']

export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type PostInsert = Database['public']['Tables']['posts']['Insert']
export type CommentInsert = Database['public']['Tables']['comments']['Insert']

export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']
export type PostUpdate = Database['public']['Tables']['posts']['Update']
export type CommentUpdate = Database['public']['Tables']['comments']['Update']