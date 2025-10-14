export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string
          email: string
          type: 'homeowner' | 'tradesperson'
          avatar?: string
          location?: string
          trades?: string[]
          rating?: number
          reviews?: number
          verified?: boolean
          credits?: number
          membership_type?: 'none' | 'basic' | 'premium' | 'unlimited_5_year'
          membership_expiry?: string
          verification_status?: 'pending' | 'verified' | 'rejected'
          verification_data?: any
          account_status?: 'active' | 'parked' | 'deleted'
          parked_date?: string
          reactivated_date?: string
          working_area?: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          type: 'homeowner' | 'tradesperson'
          avatar?: string
          location?: string
          trades?: string[]
          rating?: number
          reviews?: number
          verified?: boolean
          credits?: number
          membership_type?: 'none' | 'basic' | 'premium' | 'unlimited_5_year'
          membership_expiry?: string
          verification_status?: 'pending' | 'verified' | 'rejected'
          verification_data?: any
          account_status?: 'active' | 'parked' | 'deleted'
          parked_date?: string
          reactivated_date?: string
          working_area?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          type?: 'homeowner' | 'tradesperson'
          avatar?: string
          location?: string
          trades?: string[]
          rating?: number
          reviews?: number
          verified?: boolean
          credits?: number
          membership_type?: 'none' | 'basic' | 'premium' | 'unlimited_5_year'
          membership_expiry?: string
          verification_status?: 'pending' | 'verified' | 'rejected'
          verification_data?: any
          account_status?: 'active' | 'parked' | 'deleted'
          parked_date?: string
          reactivated_date?: string
          working_area?: any
          created_at?: string
          updated_at?: string
        }
      }
      job_leads: {
        Row: {
          id: string
          title: string
          description: string
          category: string
          location: string
          budget: string
          urgency: 'Low' | 'Medium' | 'High'
          posted_by: string
          posted_date: string
          contact_details: any
          purchased_by: string[]
          max_purchases: number
          price: number
          interests: any[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          category: string
          location: string
          budget: string
          urgency: 'Low' | 'Medium' | 'High'
          posted_by: string
          posted_date: string
          contact_details: any
          purchased_by?: string[]
          max_purchases?: number
          price?: number
          interests?: any[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          category?: string
          location?: string
          budget?: string
          urgency?: 'Low' | 'Medium' | 'High'
          posted_by?: string
          posted_date?: string
          contact_details?: any
          purchased_by?: string[]
          max_purchases?: number
          price?: number
          interests?: any[]
          created_at?: string
          updated_at?: string
        }
      }
      quote_requests: {
        Row: {
          id: string
          homeowner_id: string
          homeowner_name: string
          project_title: string
          project_description: string
          category: string
          location: string
          budget: string
          urgency: 'Low' | 'Medium' | 'High'
          contact_details: any
          responses: any[]
          max_responses: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          homeowner_id: string
          homeowner_name: string
          project_title: string
          project_description: string
          category: string
          location: string
          budget: string
          urgency: 'Low' | 'Medium' | 'High'
          contact_details: any
          responses?: any[]
          max_responses?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          homeowner_id?: string
          homeowner_name?: string
          project_title?: string
          project_description?: string
          category?: string
          location?: string
          budget?: string
          urgency?: 'Low' | 'Medium' | 'High'
          contact_details?: any
          responses?: any[]
          max_responses?: number
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
      user_type: 'homeowner' | 'tradesperson'
      urgency_level: 'Low' | 'Medium' | 'High'
      account_status: 'active' | 'parked' | 'deleted'
      verification_status: 'pending' | 'verified' | 'rejected'
      membership_type: 'none' | 'basic' | 'premium' | 'unlimited_5_year'
    }
  }
}