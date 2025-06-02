export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      calibration_results: {
        Row: {
          accuracy_score: number
          comprehension_score: number
          created_at: string
          id: string
          passage_id: string
          user_id: string
          wpm_tested: number
        }
        Insert: {
          accuracy_score: number
          comprehension_score: number
          created_at?: string
          id?: string
          passage_id: string
          user_id: string
          wpm_tested: number
        }
        Update: {
          accuracy_score?: number
          comprehension_score?: number
          created_at?: string
          id?: string
          passage_id?: string
          user_id?: string
          wpm_tested?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          calibration_status: string | null
          created_at: string
          id: string
          preferred_wpm: number | null
          role: string
          updated_at: string
        }
        Insert: {
          calibration_status?: string | null
          created_at?: string
          id: string
          preferred_wpm?: number | null
          role?: string
          updated_at?: string
        }
        Update: {
          calibration_status?: string | null
          created_at?: string
          id?: string
          preferred_wpm?: number | null
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      reading_history: {
        Row: {
          calibrated: boolean | null
          content_id: string
          created_at: string
          current_position: number | null
          id: string
          parsed_text: string | null
          source: string | null
          source_input: string | null
          source_type: string | null
          summary: string | null
          title: string
          total_words: number | null
          updated_at: string
          user_id: string
          wpm: number | null
        }
        Insert: {
          calibrated?: boolean | null
          content_id: string
          created_at?: string
          current_position?: number | null
          id?: string
          parsed_text?: string | null
          source?: string | null
          source_input?: string | null
          source_type?: string | null
          summary?: string | null
          title: string
          total_words?: number | null
          updated_at?: string
          user_id: string
          wpm?: number | null
        }
        Update: {
          calibrated?: boolean | null
          content_id?: string
          created_at?: string
          current_position?: number | null
          id?: string
          parsed_text?: string | null
          source?: string | null
          source_input?: string | null
          source_type?: string | null
          summary?: string | null
          title?: string
          total_words?: number | null
          updated_at?: string
          user_id?: string
          wpm?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "reading_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          books_limit: number | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          status: string | null
          stripe_customer_id: string | null
          stripe_price_id: string | null
          stripe_subscription_id: string | null
          tier: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          books_limit?: number | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          status?: string | null
          stripe_customer_id?: string | null
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          tier?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          books_limit?: number | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          status?: string | null
          stripe_customer_id?: string | null
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          tier?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_tracking: {
        Row: {
          count: number
          created_at: string
          id: string
          month_year: string
          updated_at: string
          user_id: string
        }
        Insert: {
          count?: number
          created_at?: string
          id?: string
          month_year: string
          updated_at?: string
          user_id: string
        }
        Update: {
          count?: number
          created_at?: string
          id?: string
          month_year?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "usage_tracking_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          preferred_wpm: number | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          preferred_wpm?: number | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          preferred_wpm?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      admin_user_overview: {
        Row: {
          id: string
          role: string
          profile_created_at: string
          profile_updated_at: string
          email: string
          auth_created_at: string
          email_confirmed_at: string | null
          last_sign_in_at: string | null
          tier: string | null
          subscription_status: string | null
          books_limit: number | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          current_month_usage: number | null
          usage_month: string | null
        }
        Insert: {
          [_ in never]: never
        }
        Update: {
          [_ in never]: never
        }
        Relationships: []
      }
    }
    Functions: {
      get_current_usage: {
        Args: {
          p_user_id: string
        }
        Returns: number
      }
      increment_user_usage: {
        Args: {
          p_user_id: string
        }
        Returns: undefined
      }
      reset_user_usage: {
        Args: {
          p_user_id: string
          p_month_year?: string
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
