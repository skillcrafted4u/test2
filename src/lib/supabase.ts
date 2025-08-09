import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://sczmgprzihuxbbsihjxa.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjem1ncHJ6aWh1eGJic2loanhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3MTczNjgsImV4cCI6MjA3MDI5MzM2OH0.8UvDOLookvaWO7gZlsYEE_8boIPWxP85mX4y8XbgRP8'

export const supabase = createClient(supabaseUrl, supabaseKey)

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          email?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          email?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      trips: {
        Row: {
          id: string
          user_id: string | null
          session_id: string | null
          destination: string
          start_date: string
          end_date: string
          budget: number | null
          traveler_count: number | null
          selected_moods: any | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          session_id?: string | null
          destination: string
          start_date: string
          end_date: string
          budget?: number | null
          traveler_count?: number | null
          selected_moods?: any | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          session_id?: string | null
          destination?: string
          start_date?: string
          end_date?: string
          budget?: number | null
          traveler_count?: number | null
          selected_moods?: any | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      activities: {
        Row: {
          id: string
          trip_id: string | null
          day_number: number
          title: string
          description: string | null
          location: string | null
          cost: number | null
          duration: string | null
          category: string | null
          image_url: string | null
          order_index: number | null
          created_at: string | null
        }
        Insert: {
          id?: string
          trip_id?: string | null
          day_number: number
          title: string
          description?: string | null
          location?: string | null
          cost?: number | null
          duration?: string | null
          category?: string | null
          image_url?: string | null
          order_index?: number | null
          created_at?: string | null
        }
        Update: {
          id?: string
          trip_id?: string | null
          day_number?: number
          title?: string
          description?: string | null
          location?: string | null
          cost?: number | null
          duration?: string | null
          category?: string | null
          image_url?: string | null
          order_index?: number | null
          created_at?: string | null
        }
      }
      impact_contributions: {
        Row: {
          id: string
          trip_id: string | null
          contribution_amount: number | null
          created_at: string | null
        }
        Insert: {
          id?: string
          trip_id?: string | null
          contribution_amount?: number | null
          created_at?: string | null
        }
        Update: {
          id?: string
          trip_id?: string | null
          contribution_amount?: number | null
          created_at?: string | null
        }
      }
    }
  }
}