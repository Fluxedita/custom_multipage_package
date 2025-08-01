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
      app_settings: {
        Row: {
          id: string
          key: string
          value: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          value: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          value?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          id: string
          user_id: string
          content: string
          page_slug: string | null
          is_approved: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          content: string
          page_slug?: string | null
          is_approved?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          content?: string
          page_slug?: string | null
          is_approved?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          }
        ]
      }
      custom_pages: {
        Row: {
          id: string
          slug: string
          title: string
          content: Json
          is_published: boolean
          created_at: string
          updated_at: string
          created_by: string | null
          meta_description: string | null
          meta_keywords: string | null
        }
        Insert: {
          id?: string
          slug: string
          title: string
          content: Json
          is_published?: boolean
          created_at?: string
          updated_at?: string
          created_by?: string | null
          meta_description?: string | null
          meta_keywords?: string | null
        }
        Update: {
          id?: string
          slug?: string
          title?: string
          content?: Json
          is_published?: boolean
          created_at?: string
          updated_at?: string
          created_by?: string | null
          meta_description?: string | null
          meta_keywords?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "custom_pages_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          }
        ]
      }
      gallery_data: {
        Row: {
          id: string
          title: string
          description: string | null
          slug: string
          is_published: boolean
          created_at: string
          updated_at: string
          created_by: string | null
          media_items: string[] | null
          category: string | null
          tags: string[] | null
          featured_image: string | null
          sort_order: number | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          slug: string
          is_published?: boolean
          created_at?: string
          updated_at?: string
          created_by?: string | null
          media_items?: string[] | null
          category?: string | null
          tags?: string[] | null
          featured_image?: string | null
          sort_order?: number | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          slug?: string
          is_published?: boolean
          created_at?: string
          updated_at?: string
          created_by?: string | null
          media_items?: string[] | null
          category?: string | null
          tags?: string[] | null
          featured_image?: string | null
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "gallery_data_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          }
        ]
      }
      media_items: {
        Row: {
          id: string
          title: string
          description: string | null
          url: string
          type: string
          size: number | null
          created_at: string
          updated_at: string
          created_by: string | null
          tags: string[] | null
          category: string | null
          is_public: boolean
          metadata: Json | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          url: string
          type: string
          size?: number | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
          tags?: string[] | null
          category?: string | null
          is_public?: boolean
          metadata?: Json | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          url?: string
          type?: string
          size?: number | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
          tags?: string[] | null
          category?: string | null
          is_public?: boolean
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "media_items_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          }
        ]
      }
      membership_history: {
        Row: {
          id: string
          user_id: string
          old_membership_type: string | null
          new_membership_type: string
          changed_by: string
          reason: string | null
          effective_date: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          old_membership_type?: string | null
          new_membership_type: string
          changed_by: string
          reason?: string | null
          effective_date?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          old_membership_type?: string | null
          new_membership_type?: string
          changed_by?: string
          reason?: string | null
          effective_date?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "membership_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "auth.users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "membership_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "auth.users"
            referencedColumns: ["id"]
          }
        ]
      }
      page_content: {
        Row: {
          id: string
          page_slug: string
          section_type: string
          content: Json
          sort_order: number
          is_published: boolean
          created_at: string
          updated_at: string
          created_by: string | null
          properties: Json | null
        }
        Insert: {
          id?: string
          page_slug: string
          section_type: string
          content: Json
          sort_order: number
          is_published?: boolean
          created_at?: string
          updated_at?: string
          created_by?: string | null
          properties?: Json | null
        }
        Update: {
          id?: string
          page_slug?: string
          section_type?: string
          content?: Json
          sort_order?: number
          is_published?: boolean
          created_at?: string
          updated_at?: string
          created_by?: string | null
          properties?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "page_content_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          }
        ]
      }
      profiles: {
        Row: {
          user_id: string
          full_name: string | null
          username: string | null
          email: string | null
          bio: string | null
          age: number | null
          city: string | null
          country: string | null
          occupation: string | null
          hobbies: string | null
          avatar_url: string | null
          banner_url: string | null
          video_intro_url: string | null
          additional_notes: string | null
          first_name: string | null
          last_name: string | null
          bio_message: string | null
          membership_type: string | null
          profile_media: Json | null
          created_at: string
          updated_at: string
          membership_changed_at: string | null
          membership_changed_by: string | null
          membership_reason: string | null
        }
        Insert: {
          user_id: string
          full_name?: string | null
          username?: string | null
          email?: string | null
          bio?: string | null
          age?: number | null
          city?: string | null
          country?: string | null
          occupation?: string | null
          hobbies?: string | null
          avatar_url?: string | null
          banner_url?: string | null
          video_intro_url?: string | null
          additional_notes?: string | null
          first_name?: string | null
          last_name?: string | null
          bio_message?: string | null
          membership_type?: string | null
          profile_media?: Json | null
          created_at?: string
          updated_at?: string
          membership_changed_at?: string | null
          membership_changed_by?: string | null
          membership_reason?: string | null
        }
        Update: {
          user_id?: string
          full_name?: string | null
          username?: string | null
          email?: string | null
          bio?: string | null
          age?: number | null
          city?: string | null
          country?: string | null
          occupation?: string | null
          hobbies?: string | null
          avatar_url?: string | null
          banner_url?: string | null
          video_intro_url?: string | null
          additional_notes?: string | null
          first_name?: string | null
          last_name?: string | null
          bio_message?: string | null
          membership_type?: string | null
          profile_media?: Json | null
          created_at?: string
          updated_at?: string
          membership_changed_at?: string | null
          membership_changed_by?: string | null
          membership_reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "auth.users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_membership_changed_by_fkey"
            columns: ["membership_changed_by"]
            isOneToOne: false
            referencedRelation: "auth.users"
            referencedColumns: ["id"]
          }
        ]
      }
      root_page_components: {
        Row: {
          id: string
          page_slug: string
          component_type: string
          content: Json
          is_active: boolean
          created_at: string
          updated_at: string
          created_by: string | null
          updated_by: string | null
        }
        Insert: {
          id?: string
          page_slug: string
          component_type: string
          content: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
        }
        Update: {
          id?: string
          page_slug?: string
          component_type?: string
          content?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "root_page_components_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "root_page_components_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          }
        ]
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          plan_id: string
          plan_name: string
          status: string
          current_period_start: string | null
          current_period_end: string | null
          cancel_at_period_end: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          plan_id: string
          plan_name: string
          status?: string
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          plan_id?: string
          plan_name?: string
          status?: string
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "auth.users"
            referencedColumns: ["id"]
          }
        ]
      }
      billing_history: {
        Row: {
          id: string
          user_id: string
          subscription_id: string | null
          stripe_invoice_id: string | null
          amount: number
          currency: string
          status: string
          invoice_url: string | null
          invoice_pdf: string | null
          period_start: string | null
          period_end: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          subscription_id?: string | null
          stripe_invoice_id?: string | null
          amount: number
          currency?: string
          status: string
          invoice_url?: string | null
          invoice_pdf?: string | null
          period_start?: string | null
          period_end?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          subscription_id?: string | null
          stripe_invoice_id?: string | null
          amount?: number
          currency?: string
          status?: string
          invoice_url?: string | null
          invoice_pdf?: string | null
          period_start?: string | null
          period_end?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "auth.users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_history_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          }
        ]
      }
      subscription_plans: {
        Row: {
          id: string
          name: string
          description: string | null
          price: number
          currency: string
          interval: string
          stripe_price_id: string | null
          features: Json | null
          is_active: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          description?: string | null
          price: number
          currency?: string
          interval?: string
          stripe_price_id?: string | null
          features?: Json | null
          is_active?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price?: number
          currency?: string
          interval?: string
          stripe_price_id?: string | null
          features?: Json | null
          is_active?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      update_membership: {
        Args: {
          user_uuid: string
          new_membership: string
          admin_uuid: string
          reason?: string
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
} 