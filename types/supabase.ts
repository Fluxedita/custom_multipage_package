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
          created_at: string
          email: string
          membership_type: string
          name: string | null
        }
        Insert: {
          id: string
          created_at?: string
          email: string
          membership_type?: string
          name?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          email?: string
          membership_type?: string
          name?: string | null
        }
      }
      custom_pages: {
        Row: {
          id: string
          title: string
          slug: string
          type: string
          created_at: string
          updated_at: string
          content: Json | null
        }
        Insert: {
          id?: string
          title: string
          slug: string
          type: string
          created_at?: string
          updated_at?: string
          content?: Json | null
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          type?: string
          created_at?: string
          updated_at?: string
          content?: Json | null
        }
      }
      page_content: {
        Row: {
          id: string
          page_id: string
          sections: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          page_id: string
          sections: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          page_id?: string
          sections?: Json
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 