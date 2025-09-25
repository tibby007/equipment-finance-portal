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
      brokers: {
        Row: {
          id: string
          email: string
          company_name: string
          subscription_tier: 'starter' | 'pro' | 'premium'
          stripe_customer_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          company_name: string
          subscription_tier: 'starter' | 'pro' | 'premium'
          stripe_customer_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          company_name?: string
          subscription_tier?: 'starter' | 'pro' | 'premium'
          stripe_customer_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      vendors: {
        Row: {
          id: string
          broker_id: string
          email: string
          company_name: string
          first_name: string
          last_name: string
          password_hash: string
          must_change_password: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          broker_id: string
          email: string
          company_name: string
          first_name: string
          last_name: string
          password_hash: string
          must_change_password?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          broker_id?: string
          email?: string
          company_name?: string
          first_name?: string
          last_name?: string
          password_hash?: string
          must_change_password?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      deals: {
        Row: {
          id: string
          vendor_id: string
          broker_id: string
          customer_name: string
          equipment_type: string
          deal_amount: number
          current_stage: string
          prequalification_score: 'green' | 'yellow' | 'red' | null
          application_data: Json | null
          stage_history: Json | null
          last_activity: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          vendor_id: string
          broker_id: string
          customer_name: string
          equipment_type: string
          deal_amount: number
          current_stage: string
          prequalification_score?: 'green' | 'yellow' | 'red' | null
          application_data?: Json | null
          stage_history?: Json | null
          last_activity?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          vendor_id?: string
          broker_id?: string
          customer_name?: string
          equipment_type?: string
          deal_amount?: number
          current_stage?: string
          prequalification_score?: 'green' | 'yellow' | 'red' | null
          application_data?: Json | null
          stage_history?: Json | null
          last_activity?: string
          created_at?: string
          updated_at?: string
        }
      }
      documents: {
        Row: {
          id: string
          deal_id: string
          file_name: string
          file_path: string
          file_type: string
          uploaded_by: string
          created_at: string
        }
        Insert: {
          id?: string
          deal_id: string
          file_name: string
          file_path: string
          file_type: string
          uploaded_by: string
          created_at?: string
        }
        Update: {
          id?: string
          deal_id?: string
          file_name?: string
          file_path?: string
          file_type?: string
          uploaded_by?: string
          created_at?: string
        }
      }
      notes: {
        Row: {
          id: string
          deal_id: string
          author_id: string
          author_type: 'vendor' | 'broker'
          message: string
          created_at: string
        }
        Insert: {
          id?: string
          deal_id: string
          author_id: string
          author_type: 'vendor' | 'broker'
          message: string
          created_at?: string
        }
        Update: {
          id?: string
          deal_id?: string
          author_id?: string
          author_type?: 'vendor' | 'broker'
          message?: string
          created_at?: string
        }
      }
      resources: {
        Row: {
          id: string
          broker_id: string
          title: string
          content: string | null
          file_path: string | null
          resource_type: 'file' | 'text'
          created_at: string
        }
        Insert: {
          id?: string
          broker_id: string
          title: string
          content?: string | null
          file_path?: string | null
          resource_type: 'file' | 'text'
          created_at?: string
        }
        Update: {
          id?: string
          broker_id?: string
          title?: string
          content?: string | null
          file_path?: string | null
          resource_type?: 'file' | 'text'
          created_at?: string
        }
      }
    }
  }
}