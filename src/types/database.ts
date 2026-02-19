export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type UserRole = 'brand' | 'user'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string
          role: UserRole
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          role: UserRole
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          role?: UserRole
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          brand_id: string
          name: string
          description: string
          price: number
          category: string | null
          image_url: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          brand_id: string
          name: string
          description: string
          price: number
          category?: string | null
          image_url: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          brand_id?: string
          name?: string
          description?: string
          price?: number
          category?: string | null
          image_url?: string
          created_at?: string
          updated_at?: string
        }
      }
      cart_items: {
        Row: {
          id: string
          user_id: string
          product_id: string
          quantity: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          quantity: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          quantity?: number
          created_at?: string
          updated_at?: string
        }
      }
      wishlist_items: {
        Row: {
          id: string
          user_id: string
          product_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          created_at?: string
        }
      }
      product_ratings: {
        Row: {
          id: string
          user_id: string
          product_id: string
          rating: number
          review_text: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          rating: number
          review_text?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          rating?: number
          review_text?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Product = Database['public']['Tables']['products']['Row']
export type CartItem = Database['public']['Tables']['cart_items']['Row']
export type WishlistItem = Database['public']['Tables']['wishlist_items']['Row']
export type ProductRating = Database['public']['Tables']['product_ratings']['Row']
