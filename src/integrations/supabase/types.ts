export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          badge_type: string
          earned_at: string | null
          id: string
          metadata: Json | null
          shared: boolean | null
          user_id: string
        }
        Insert: {
          badge_type: string
          earned_at?: string | null
          id?: string
          metadata?: Json | null
          shared?: boolean | null
          user_id: string
        }
        Update: {
          badge_type?: string
          earned_at?: string | null
          id?: string
          metadata?: Json | null
          shared?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      ai_nudges: {
        Row: {
          category: string | null
          created_at: string | null
          delivered_via: string
          id: string
          nudge_text: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          delivered_via?: string
          id?: string
          nudge_text: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          delivered_via?: string
          id?: string
          nudge_text?: string
          user_id?: string
        }
        Relationships: []
      }
      behavior_logs: {
        Row: {
          created_at: string | null
          id: string
          log_date: string
          meds_taken: boolean | null
          notes: string | null
          ritual_type: string
          sleep_hours: number | null
          sleep_quality: Database["public"]["Enums"]["sleep_quality"] | null
          steps_count: number | null
          stress_level: Database["public"]["Enums"]["stress_level"] | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          log_date: string
          meds_taken?: boolean | null
          notes?: string | null
          ritual_type: string
          sleep_hours?: number | null
          sleep_quality?: Database["public"]["Enums"]["sleep_quality"] | null
          steps_count?: number | null
          stress_level?: Database["public"]["Enums"]["stress_level"] | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          log_date?: string
          meds_taken?: boolean | null
          notes?: string | null
          ritual_type?: string
          sleep_hours?: number | null
          sleep_quality?: Database["public"]["Enums"]["sleep_quality"] | null
          steps_count?: number | null
          stress_level?: Database["public"]["Enums"]["stress_level"] | null
          user_id?: string
        }
        Relationships: []
      }
      bp_logs: {
        Row: {
          created_at: string | null
          diastolic: number
          heart_rate: number | null
          id: string
          measured_at: string
          metadata: Json | null
          notes: string | null
          ritual_type: string | null
          source_type: string | null
          systolic: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          diastolic: number
          heart_rate?: number | null
          id?: string
          measured_at: string
          metadata?: Json | null
          notes?: string | null
          ritual_type?: string | null
          source_type?: string | null
          systolic: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          diastolic?: number
          heart_rate?: number | null
          id?: string
          measured_at?: string
          metadata?: Json | null
          notes?: string | null
          ritual_type?: string | null
          source_type?: string | null
          systolic?: number
          user_id?: string
        }
        Relationships: []
      }
      chat_conversations: {
        Row: {
          created_at: string | null
          id: string
          language: string | null
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          language?: string | null
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          language?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string | null
          id: string
          payload_json: Json | null
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          payload_json?: Json | null
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          payload_json?: Json | null
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      family_links: {
        Row: {
          can_nudge: boolean | null
          can_view: boolean | null
          caregiver_id: string
          created_at: string | null
          id: string
          member_id: string
          relationship: string | null
        }
        Insert: {
          can_nudge?: boolean | null
          can_view?: boolean | null
          caregiver_id: string
          created_at?: string | null
          id?: string
          member_id: string
          relationship?: string | null
        }
        Update: {
          can_nudge?: boolean | null
          can_view?: boolean | null
          caregiver_id?: string
          created_at?: string | null
          id?: string
          member_id?: string
          relationship?: string | null
        }
        Relationships: []
      }
      feature_flags: {
        Row: {
          description: string | null
          key: string
          updated_at: string | null
          value_json: Json
        }
        Insert: {
          description?: string | null
          key: string
          updated_at?: string | null
          value_json?: Json
        }
        Update: {
          description?: string | null
          key?: string
          updated_at?: string | null
          value_json?: Json
        }
        Relationships: []
      }
      health_goals: {
        Row: {
          created_at: string | null
          current_value: number | null
          goal_type: string
          id: string
          notes: string | null
          start_date: string
          status: string
          target_date: string | null
          target_value: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_value?: number | null
          goal_type: string
          id?: string
          notes?: string | null
          start_date?: string
          status?: string
          target_date?: string | null
          target_value: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_value?: number | null
          goal_type?: string
          id?: string
          notes?: string | null
          start_date?: string
          status?: string
          target_date?: string | null
          target_value?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      heart_scores: {
        Row: {
          ai_explanation: string | null
          bp_score: number | null
          consistency_score: number | null
          created_at: string | null
          heart_score: number
          id: string
          score_date: string
          sugar_score: number | null
          user_id: string
        }
        Insert: {
          ai_explanation?: string | null
          bp_score?: number | null
          consistency_score?: number | null
          created_at?: string | null
          heart_score: number
          id?: string
          score_date: string
          sugar_score?: number | null
          user_id: string
        }
        Update: {
          ai_explanation?: string | null
          bp_score?: number | null
          consistency_score?: number | null
          created_at?: string | null
          heart_score?: number
          id?: string
          score_date?: string
          sugar_score?: number | null
          user_id?: string
        }
        Relationships: []
      }
      medication_logs: {
        Row: {
          created_at: string | null
          id: string
          medication_id: string
          notes: string | null
          scheduled_at: string
          skipped: boolean | null
          taken_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          medication_id: string
          notes?: string | null
          scheduled_at: string
          skipped?: boolean | null
          taken_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          medication_id?: string
          notes?: string | null
          scheduled_at?: string
          skipped?: boolean | null
          taken_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "medication_logs_medication_id_fkey"
            columns: ["medication_id"]
            isOneToOne: false
            referencedRelation: "medications"
            referencedColumns: ["id"]
          },
        ]
      }
      medications: {
        Row: {
          active: boolean | null
          created_at: string | null
          custom_times: string[] | null
          dosage: string | null
          frequency: string
          id: string
          name: string
          notes: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          custom_times?: string[] | null
          dosage?: string | null
          frequency: string
          id?: string
          name: string
          notes?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          custom_times?: string[] | null
          dosage?: string | null
          frequency?: string
          id?: string
          name?: string
          notes?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          date_of_birth: string | null
          email: string | null
          evening_ritual_time: string | null
          full_name: string | null
          gender: string | null
          goals: Json | null
          has_diabetes: boolean | null
          has_heart_disease: boolean | null
          has_hypertension: boolean | null
          height_cm: number | null
          high_contrast_mode: boolean | null
          id: string
          language: string | null
          morning_ritual_time: string | null
          onboarding_completed: boolean | null
          phone: string | null
          text_size_preference: string | null
          updated_at: string | null
          weight_kg: number | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          evening_ritual_time?: string | null
          full_name?: string | null
          gender?: string | null
          goals?: Json | null
          has_diabetes?: boolean | null
          has_heart_disease?: boolean | null
          has_hypertension?: boolean | null
          height_cm?: number | null
          high_contrast_mode?: boolean | null
          id: string
          language?: string | null
          morning_ritual_time?: string | null
          onboarding_completed?: boolean | null
          phone?: string | null
          text_size_preference?: string | null
          updated_at?: string | null
          weight_kg?: number | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          evening_ritual_time?: string | null
          full_name?: string | null
          gender?: string | null
          goals?: Json | null
          has_diabetes?: boolean | null
          has_heart_disease?: boolean | null
          has_hypertension?: boolean | null
          height_cm?: number | null
          high_contrast_mode?: boolean | null
          id?: string
          language?: string | null
          morning_ritual_time?: string | null
          onboarding_completed?: boolean | null
          phone?: string | null
          text_size_preference?: string | null
          updated_at?: string | null
          weight_kg?: number | null
        }
        Relationships: []
      }
      streaks: {
        Row: {
          count: number
          created_at: string | null
          id: string
          last_logged_at: string
          type: string
          user_id: string
        }
        Insert: {
          count?: number
          created_at?: string | null
          id?: string
          last_logged_at?: string
          type: string
          user_id: string
        }
        Update: {
          count?: number
          created_at?: string | null
          id?: string
          last_logged_at?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      sugar_logs: {
        Row: {
          created_at: string | null
          glucose_mg_dl: number
          id: string
          measured_at: string
          measurement_type: string
          metadata: Json | null
          notes: string | null
          ritual_type: string | null
          source_type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          glucose_mg_dl: number
          id?: string
          measured_at: string
          measurement_type: string
          metadata?: Json | null
          notes?: string | null
          ritual_type?: string | null
          source_type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          glucose_mg_dl?: number
          id?: string
          measured_at?: string
          measurement_type?: string
          metadata?: Json | null
          notes?: string | null
          ritual_type?: string | null
          source_type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "member" | "family" | "doctor" | "admin"
      sleep_quality: "excellent" | "good" | "fair" | "poor" | "very_poor"
      stress_level: "low" | "moderate" | "high" | "very_high"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["member", "family", "doctor", "admin"],
      sleep_quality: ["excellent", "good", "fair", "poor", "very_poor"],
      stress_level: ["low", "moderate", "high", "very_high"],
    },
  },
} as const
