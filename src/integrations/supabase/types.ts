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
      activity_sessions: {
        Row: {
          activity_type: string
          avg_heart_rate: number | null
          created_at: string | null
          duration_minutes: number | null
          ended_at: string | null
          estimated_calories_burned: number | null
          id: string
          intensity: string | null
          metadata: Json | null
          source: string
          started_at: string
          steps_count: number | null
          user_id: string
        }
        Insert: {
          activity_type: string
          avg_heart_rate?: number | null
          created_at?: string | null
          duration_minutes?: number | null
          ended_at?: string | null
          estimated_calories_burned?: number | null
          id?: string
          intensity?: string | null
          metadata?: Json | null
          source: string
          started_at: string
          steps_count?: number | null
          user_id: string
        }
        Update: {
          activity_type?: string
          avg_heart_rate?: number | null
          created_at?: string | null
          duration_minutes?: number | null
          ended_at?: string | null
          estimated_calories_burned?: number | null
          id?: string
          intensity?: string | null
          metadata?: Json | null
          source?: string
          started_at?: string
          steps_count?: number | null
          user_id?: string
        }
        Relationships: []
      }
      agent_action_log: {
        Row: {
          action_payload: Json
          action_type: string
          created_at: string
          id: string
          revert_reason: string | null
          reverted_at: string | null
          status: string
          trigger_reason: string
          trigger_type: string
          user_id: string
        }
        Insert: {
          action_payload?: Json
          action_type: string
          created_at?: string
          id?: string
          revert_reason?: string | null
          reverted_at?: string | null
          status?: string
          trigger_reason: string
          trigger_type?: string
          user_id: string
        }
        Update: {
          action_payload?: Json
          action_type?: string
          created_at?: string
          id?: string
          revert_reason?: string | null
          reverted_at?: string | null
          status?: string
          trigger_reason?: string
          trigger_type?: string
          user_id?: string
        }
        Relationships: []
      }
      agent_preferences: {
        Row: {
          auto_celebrate_enabled: boolean
          auto_escalate_enabled: boolean
          auto_goal_adjust_enabled: boolean
          auto_nudge_enabled: boolean
          autonomy_level: string
          created_at: string
          id: string
          max_goal_adjustments_per_week: number
          max_nudges_per_day: number
          preferred_nudge_times: Json | null
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_celebrate_enabled?: boolean
          auto_escalate_enabled?: boolean
          auto_goal_adjust_enabled?: boolean
          auto_nudge_enabled?: boolean
          autonomy_level?: string
          created_at?: string
          id?: string
          max_goal_adjustments_per_week?: number
          max_nudges_per_day?: number
          preferred_nudge_times?: Json | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_celebrate_enabled?: boolean
          auto_escalate_enabled?: boolean
          auto_goal_adjust_enabled?: boolean
          auto_nudge_enabled?: boolean
          autonomy_level?: string
          created_at?: string
          id?: string
          max_goal_adjustments_per_week?: number
          max_nudges_per_day?: number
          preferred_nudge_times?: Json | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      agent_scheduled_tasks: {
        Row: {
          attempts: number
          completed_at: string | null
          created_at: string
          error_message: string | null
          id: string
          max_attempts: number
          payload: Json
          priority: number
          result: Json | null
          scheduled_for: string
          status: string
          task_type: string
          user_id: string
        }
        Insert: {
          attempts?: number
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          max_attempts?: number
          payload?: Json
          priority?: number
          result?: Json | null
          scheduled_for: string
          status?: string
          task_type: string
          user_id: string
        }
        Update: {
          attempts?: number
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          max_attempts?: number
          payload?: Json
          priority?: number
          result?: Json | null
          scheduled_for?: string
          status?: string
          task_type?: string
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
      appointment_reminders: {
        Row: {
          appointment_id: string
          created_at: string | null
          id: string
          message: string | null
          remind_at: string
          reminder_type: string
          sent: boolean | null
        }
        Insert: {
          appointment_id: string
          created_at?: string | null
          id?: string
          message?: string | null
          remind_at: string
          reminder_type: string
          sent?: boolean | null
        }
        Update: {
          appointment_id?: string
          created_at?: string | null
          id?: string
          message?: string | null
          remind_at?: string
          reminder_type?: string
          sent?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "appointment_reminders_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          appointment_type: string
          created_at: string | null
          duration_minutes: number | null
          id: string
          linked_lab_result_id: string | null
          location: string | null
          notes: string | null
          post_visit_notes: string | null
          pre_visit_tasks: Json | null
          provider_name: string | null
          reminder_sent: boolean | null
          scheduled_at: string
          status: string | null
          user_id: string
        }
        Insert: {
          appointment_type: string
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          linked_lab_result_id?: string | null
          location?: string | null
          notes?: string | null
          post_visit_notes?: string | null
          pre_visit_tasks?: Json | null
          provider_name?: string | null
          reminder_sent?: boolean | null
          scheduled_at: string
          status?: string | null
          user_id: string
        }
        Update: {
          appointment_type?: string
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          linked_lab_result_id?: string | null
          location?: string | null
          notes?: string | null
          post_visit_notes?: string | null
          pre_visit_tasks?: Json | null
          provider_name?: string | null
          reminder_sent?: boolean | null
          scheduled_at?: string
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string
          id: string
          metadata: Json | null
          resource_id: string | null
          resource_type: string
          target_user_id: string
          timestamp: string | null
        }
        Insert: {
          action: string
          actor_id: string
          id?: string
          metadata?: Json | null
          resource_id?: string | null
          resource_type: string
          target_user_id: string
          timestamp?: string | null
        }
        Update: {
          action?: string
          actor_id?: string
          id?: string
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string
          target_user_id?: string
          timestamp?: string | null
        }
        Relationships: []
      }
      behavior_logs: {
        Row: {
          created_at: string | null
          id: string
          log_date: string
          loneliness_score: number | null
          meds_taken: boolean | null
          mood_score: number | null
          notes: string | null
          ritual_type: string
          sleep_hours: number | null
          sleep_quality: Database["public"]["Enums"]["sleep_quality"] | null
          social_interaction_count: number | null
          steps_count: number | null
          stress_level: Database["public"]["Enums"]["stress_level"] | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          log_date: string
          loneliness_score?: number | null
          meds_taken?: boolean | null
          mood_score?: number | null
          notes?: string | null
          ritual_type: string
          sleep_hours?: number | null
          sleep_quality?: Database["public"]["Enums"]["sleep_quality"] | null
          social_interaction_count?: number | null
          steps_count?: number | null
          stress_level?: Database["public"]["Enums"]["stress_level"] | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          log_date?: string
          loneliness_score?: number | null
          meds_taken?: boolean | null
          mood_score?: number | null
          notes?: string | null
          ritual_type?: string
          sleep_hours?: number | null
          sleep_quality?: Database["public"]["Enums"]["sleep_quality"] | null
          social_interaction_count?: number | null
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
      cgm_readings: {
        Row: {
          created_at: string | null
          glucose_mg_dl: number
          id: string
          measured_at: string
          metadata: Json | null
          source: string
          time_in_range: boolean | null
          trend_arrow: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          glucose_mg_dl: number
          id?: string
          measured_at: string
          metadata?: Json | null
          source: string
          time_in_range?: boolean | null
          trend_arrow?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          glucose_mg_dl?: number
          id?: string
          measured_at?: string
          metadata?: Json | null
          source?: string
          time_in_range?: boolean | null
          trend_arrow?: string | null
          user_id?: string
        }
        Relationships: []
      }
      challenge_members: {
        Row: {
          challenge_id: string
          completed: boolean | null
          completed_at: string | null
          id: string
          joined_at: string
          progress: number | null
          user_id: string
        }
        Insert: {
          challenge_id: string
          completed?: boolean | null
          completed_at?: string | null
          id?: string
          joined_at?: string
          progress?: number | null
          user_id: string
        }
        Update: {
          challenge_id?: string
          completed?: boolean | null
          completed_at?: string | null
          id?: string
          joined_at?: string
          progress?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_members_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      challenges: {
        Row: {
          created_at: string
          description: string | null
          end_date: string
          id: string
          is_active: boolean | null
          reward_points: number | null
          rule_json: Json | null
          start_date: string
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_date: string
          id?: string
          is_active?: boolean | null
          reward_points?: number | null
          rule_json?: Json | null
          start_date: string
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_date?: string
          id?: string
          is_active?: boolean | null
          reward_points?: number | null
          rule_json?: Json | null
          start_date?: string
          title?: string
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
      cognitive_assessments: {
        Row: {
          ai_analysis: Json | null
          assessment_date: string
          assessment_type: string
          created_at: string | null
          id: string
          max_score: number | null
          responses: Json | null
          risk_level: string | null
          score: number | null
          time_taken_seconds: number | null
          user_id: string
        }
        Insert: {
          ai_analysis?: Json | null
          assessment_date: string
          assessment_type: string
          created_at?: string | null
          id?: string
          max_score?: number | null
          responses?: Json | null
          risk_level?: string | null
          score?: number | null
          time_taken_seconds?: number | null
          user_id: string
        }
        Update: {
          ai_analysis?: Json | null
          assessment_date?: string
          assessment_type?: string
          created_at?: string | null
          id?: string
          max_score?: number | null
          responses?: Json | null
          risk_level?: string | null
          score?: number | null
          time_taken_seconds?: number | null
          user_id?: string
        }
        Relationships: []
      }
      cognitive_patterns: {
        Row: {
          analyzed_at: string | null
          baseline_value: Json | null
          current_value: Json | null
          deviation_percent: number | null
          id: string
          pattern_type: string
          user_id: string
        }
        Insert: {
          analyzed_at?: string | null
          baseline_value?: Json | null
          current_value?: Json | null
          deviation_percent?: number | null
          id?: string
          pattern_type: string
          user_id: string
        }
        Update: {
          analyzed_at?: string | null
          baseline_value?: Json | null
          current_value?: Json | null
          deviation_percent?: number | null
          id?: string
          pattern_type?: string
          user_id?: string
        }
        Relationships: []
      }
      condition_analysis: {
        Row: {
          analysis_date: string
          conditions: Json
          created_at: string | null
          cross_impacts: Json | null
          id: string
          recommendations: Json | null
          risk_scores: Json
          user_id: string
        }
        Insert: {
          analysis_date: string
          conditions: Json
          created_at?: string | null
          cross_impacts?: Json | null
          id?: string
          recommendations?: Json | null
          risk_scores: Json
          user_id: string
        }
        Update: {
          analysis_date?: string
          conditions?: Json
          created_at?: string | null
          cross_impacts?: Json | null
          id?: string
          recommendations?: Json | null
          risk_scores?: Json
          user_id?: string
        }
        Relationships: []
      }
      drug_interactions: {
        Row: {
          created_at: string | null
          description: string
          drug_a: string
          drug_b: string
          id: string
          recommendation: string | null
          severity: string
          source: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          drug_a: string
          drug_b: string
          id?: string
          recommendation?: string | null
          severity: string
          source?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          drug_a?: string
          drug_b?: string
          id?: string
          recommendation?: string | null
          severity?: string
          source?: string | null
        }
        Relationships: []
      }
      emergency_contacts: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          is_primary: boolean | null
          name: string
          notify_on_fall: boolean | null
          notify_on_health_emergency: boolean | null
          notify_on_missed_checkin: boolean | null
          phone: string
          relationship: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          is_primary?: boolean | null
          name: string
          notify_on_fall?: boolean | null
          notify_on_health_emergency?: boolean | null
          notify_on_missed_checkin?: boolean | null
          phone: string
          relationship: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          is_primary?: boolean | null
          name?: string
          notify_on_fall?: boolean | null
          notify_on_health_emergency?: boolean | null
          notify_on_missed_checkin?: boolean | null
          phone?: string
          relationship?: string
          user_id?: string
        }
        Relationships: []
      }
      environmental_logs: {
        Row: {
          aqi: number
          city: string | null
          created_at: string | null
          humidity_percent: number | null
          id: string
          location_lat: number | null
          location_lon: number | null
          measured_at: string
          pm10: number | null
          pm25: number | null
          pollen_index: number | null
          source: string
          temperature_celsius: number | null
          user_id: string
          uv_index: number | null
        }
        Insert: {
          aqi: number
          city?: string | null
          created_at?: string | null
          humidity_percent?: number | null
          id?: string
          location_lat?: number | null
          location_lon?: number | null
          measured_at: string
          pm10?: number | null
          pm25?: number | null
          pollen_index?: number | null
          source?: string
          temperature_celsius?: number | null
          user_id: string
          uv_index?: number | null
        }
        Update: {
          aqi?: number
          city?: string | null
          created_at?: string | null
          humidity_percent?: number | null
          id?: string
          location_lat?: number | null
          location_lon?: number | null
          measured_at?: string
          pm10?: number | null
          pm25?: number | null
          pollen_index?: number | null
          source?: string
          temperature_celsius?: number | null
          user_id?: string
          uv_index?: number | null
        }
        Relationships: []
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
      fall_events: {
        Row: {
          acceleration_magnitude: number | null
          created_at: string | null
          detected_at: string
          emergency_contacts_notified: Json | null
          id: string
          location_lat: number | null
          location_lon: number | null
          notes: string | null
          response_status: string | null
          severity: string
          user_id: string
          user_response_at: string | null
        }
        Insert: {
          acceleration_magnitude?: number | null
          created_at?: string | null
          detected_at?: string
          emergency_contacts_notified?: Json | null
          id?: string
          location_lat?: number | null
          location_lon?: number | null
          notes?: string | null
          response_status?: string | null
          severity: string
          user_id: string
          user_response_at?: string | null
        }
        Update: {
          acceleration_magnitude?: number | null
          created_at?: string | null
          detected_at?: string
          emergency_contacts_notified?: Json | null
          id?: string
          location_lat?: number | null
          location_lon?: number | null
          notes?: string | null
          response_status?: string | null
          severity?: string
          user_id?: string
          user_response_at?: string | null
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
      fitness_imports: {
        Row: {
          created_at: string
          data_types: string[]
          error_message: string | null
          file_name: string | null
          id: string
          import_status: string
          raw_data: Json | null
          records_imported: number
          source_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data_types?: string[]
          error_message?: string | null
          file_name?: string | null
          id?: string
          import_status?: string
          raw_data?: Json | null
          records_imported?: number
          source_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          data_types?: string[]
          error_message?: string | null
          file_name?: string | null
          id?: string
          import_status?: string
          raw_data?: Json | null
          records_imported?: number
          source_type?: string
          user_id?: string
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
      lab_reminders: {
        Row: {
          created_at: string | null
          frequency_months: number
          id: string
          last_test_date: string | null
          next_due_date: string | null
          reminder_sent: boolean | null
          test_type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          frequency_months?: number
          id?: string
          last_test_date?: string | null
          next_due_date?: string | null
          reminder_sent?: boolean | null
          test_type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          frequency_months?: number
          id?: string
          last_test_date?: string | null
          next_due_date?: string | null
          reminder_sent?: boolean | null
          test_type?: string
          user_id?: string
        }
        Relationships: []
      }
      lab_results: {
        Row: {
          created_at: string | null
          id: string
          lab_name: string | null
          next_test_due: string | null
          notes: string | null
          results: Json
          test_date: string
          test_type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          lab_name?: string | null
          next_test_due?: string | null
          notes?: string | null
          results: Json
          test_date: string
          test_type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          lab_name?: string | null
          next_test_due?: string | null
          notes?: string | null
          results?: Json
          test_date?: string
          test_type?: string
          user_id?: string
        }
        Relationships: []
      }
      lifestyle_correlations: {
        Row: {
          accuracy_score: number | null
          actual_outcome: Json | null
          analyzed_at: string | null
          correlation_type: string
          id: string
          input_factors: Json
          predicted_outcome: Json
          user_id: string
        }
        Insert: {
          accuracy_score?: number | null
          actual_outcome?: Json | null
          analyzed_at?: string | null
          correlation_type: string
          id?: string
          input_factors: Json
          predicted_outcome: Json
          user_id: string
        }
        Update: {
          accuracy_score?: number | null
          actual_outcome?: Json | null
          analyzed_at?: string | null
          correlation_type?: string
          id?: string
          input_factors?: Json
          predicted_outcome?: Json
          user_id?: string
        }
        Relationships: []
      }
      meal_logs: {
        Row: {
          ai_detected_items: Json | null
          created_at: string | null
          description: string | null
          estimated_calories: number | null
          estimated_carbs: number | null
          estimated_glycemic_load: number | null
          id: string
          image_url: string | null
          logged_at: string
          meal_type: string
          user_id: string
        }
        Insert: {
          ai_detected_items?: Json | null
          created_at?: string | null
          description?: string | null
          estimated_calories?: number | null
          estimated_carbs?: number | null
          estimated_glycemic_load?: number | null
          id?: string
          image_url?: string | null
          logged_at: string
          meal_type: string
          user_id: string
        }
        Update: {
          ai_detected_items?: Json | null
          created_at?: string | null
          description?: string | null
          estimated_calories?: number | null
          estimated_carbs?: number | null
          estimated_glycemic_load?: number | null
          id?: string
          image_url?: string | null
          logged_at?: string
          meal_type?: string
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
      medication_protocols: {
        Row: {
          adjustment_rules: Json
          condition: string
          contraindications: string[] | null
          created_at: string | null
          id: string
          medication_class: string
          target_range: Json
        }
        Insert: {
          adjustment_rules: Json
          condition: string
          contraindications?: string[] | null
          created_at?: string | null
          id?: string
          medication_class: string
          target_range: Json
        }
        Update: {
          adjustment_rules?: Json
          condition?: string
          contraindications?: string[] | null
          created_at?: string | null
          id?: string
          medication_class?: string
          target_range?: Json
        }
        Relationships: []
      }
      medications: {
        Row: {
          active: boolean | null
          created_at: string | null
          custom_times: string[] | null
          dosage: string | null
          drug_class: string | null
          drug_code: string | null
          frequency: string
          id: string
          interactions_checked: boolean | null
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
          drug_class?: string | null
          drug_code?: string | null
          frequency: string
          id?: string
          interactions_checked?: boolean | null
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
          drug_class?: string | null
          drug_code?: string | null
          frequency?: string
          id?: string
          interactions_checked?: boolean | null
          name?: string
          notes?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          created_at: string
          daily_reminder_enabled: boolean | null
          email_enabled: boolean | null
          id: string
          push_enabled: boolean | null
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          updated_at: string
          user_id: string
          weekly_summary_enabled: boolean | null
          whatsapp_enabled: boolean | null
        }
        Insert: {
          created_at?: string
          daily_reminder_enabled?: boolean | null
          email_enabled?: boolean | null
          id?: string
          push_enabled?: boolean | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          updated_at?: string
          user_id: string
          weekly_summary_enabled?: boolean | null
          whatsapp_enabled?: boolean | null
        }
        Update: {
          created_at?: string
          daily_reminder_enabled?: boolean | null
          email_enabled?: boolean | null
          id?: string
          push_enabled?: boolean | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          updated_at?: string
          user_id?: string
          weekly_summary_enabled?: boolean | null
          whatsapp_enabled?: boolean | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          aqi_sensitivity_score: number | null
          avatar_url: string | null
          cognitive_monitoring_enabled: boolean | null
          created_at: string | null
          date_of_birth: string | null
          email: string | null
          evening_ritual_time: string | null
          fall_detection_enabled: boolean | null
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
          last_location_lat: number | null
          last_location_lon: number | null
          morning_ritual_time: string | null
          onboarding_completed: boolean | null
          phone: string | null
          text_size_preference: string | null
          tutorial_completed: boolean | null
          tutorial_step: number | null
          updated_at: string | null
          weight_kg: number | null
        }
        Insert: {
          aqi_sensitivity_score?: number | null
          avatar_url?: string | null
          cognitive_monitoring_enabled?: boolean | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          evening_ritual_time?: string | null
          fall_detection_enabled?: boolean | null
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
          last_location_lat?: number | null
          last_location_lon?: number | null
          morning_ritual_time?: string | null
          onboarding_completed?: boolean | null
          phone?: string | null
          text_size_preference?: string | null
          tutorial_completed?: boolean | null
          tutorial_step?: number | null
          updated_at?: string | null
          weight_kg?: number | null
        }
        Update: {
          aqi_sensitivity_score?: number | null
          avatar_url?: string | null
          cognitive_monitoring_enabled?: boolean | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          evening_ritual_time?: string | null
          fall_detection_enabled?: boolean | null
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
          last_location_lat?: number | null
          last_location_lon?: number | null
          morning_ritual_time?: string | null
          onboarding_completed?: boolean | null
          phone?: string | null
          text_size_preference?: string | null
          tutorial_completed?: boolean | null
          tutorial_step?: number | null
          updated_at?: string | null
          weight_kg?: number | null
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          created_at: string | null
          endpoint: string
          id: string
          request_count: number | null
          user_id: string
          window_start: string | null
        }
        Insert: {
          created_at?: string | null
          endpoint: string
          id?: string
          request_count?: number | null
          user_id: string
          window_start?: string | null
        }
        Update: {
          created_at?: string | null
          endpoint?: string
          id?: string
          request_count?: number | null
          user_id?: string
          window_start?: string | null
        }
        Relationships: []
      }
      referrals: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          referral_code: string
          referred_id: string | null
          referrer_id: string
          reward_given: boolean | null
          status: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          referral_code: string
          referred_id?: string | null
          referrer_id: string
          reward_given?: boolean | null
          status?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          referral_code?: string
          referred_id?: string | null
          referrer_id?: string
          reward_given?: boolean | null
          status?: string
        }
        Relationships: []
      }
      risk_forecasts: {
        Row: {
          confidence_score: number | null
          created_at: string | null
          current_risk_percent: number
          forecast_date: string
          forecast_horizon_months: number
          id: string
          key_risk_factors: Json | null
          mitigation_actions: Json | null
          projected_risk_percent: number
          risk_type: string
          user_id: string
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string | null
          current_risk_percent: number
          forecast_date: string
          forecast_horizon_months: number
          id?: string
          key_risk_factors?: Json | null
          mitigation_actions?: Json | null
          projected_risk_percent: number
          risk_type: string
          user_id: string
        }
        Update: {
          confidence_score?: number | null
          created_at?: string | null
          current_risk_percent?: number
          forecast_date?: string
          forecast_horizon_months?: number
          id?: string
          key_risk_factors?: Json | null
          mitigation_actions?: Json | null
          projected_risk_percent?: number
          risk_type?: string
          user_id?: string
        }
        Relationships: []
      }
      social_wellness_logs: {
        Row: {
          created_at: string | null
          id: string
          interaction_types: string[] | null
          left_home: boolean | null
          log_date: string
          loneliness_score: number | null
          mood_score: number | null
          notes: string | null
          social_interactions: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          interaction_types?: string[] | null
          left_home?: boolean | null
          log_date: string
          loneliness_score?: number | null
          mood_score?: number | null
          notes?: string | null
          social_interactions?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          interaction_types?: string[] | null
          left_home?: boolean | null
          log_date?: string
          loneliness_score?: number | null
          mood_score?: number | null
          notes?: string | null
          social_interactions?: number | null
          user_id?: string
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
      subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan_type: string
          razorpay_customer_id: string | null
          razorpay_subscription_id: string | null
          status: string
          trial_end: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_type?: string
          razorpay_customer_id?: string | null
          razorpay_subscription_id?: string | null
          status?: string
          trial_end?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_type?: string
          razorpay_customer_id?: string | null
          razorpay_subscription_id?: string | null
          status?: string
          trial_end?: string | null
          updated_at?: string
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
      vitals_continuous: {
        Row: {
          created_at: string | null
          id: string
          measured_at: string
          metadata: Json | null
          source: string
          user_id: string
          value: number
          vital_type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          measured_at: string
          metadata?: Json | null
          source: string
          user_id: string
          value: number
          vital_type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          measured_at?: string
          metadata?: Json | null
          source?: string
          user_id?: string
          value?: number
          vital_type?: string
        }
        Relationships: []
      }
      wellness_activities: {
        Row: {
          category: string
          description: string | null
          difficulty: string | null
          duration_minutes: number | null
          id: string
          is_active: boolean | null
          suitable_for: string[] | null
          title: string
        }
        Insert: {
          category: string
          description?: string | null
          difficulty?: string | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          suitable_for?: string[] | null
          title: string
        }
        Update: {
          category?: string
          description?: string | null
          difficulty?: string | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          suitable_for?: string[] | null
          title?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_rate_limit: {
        Args: {
          _endpoint: string
          _max_requests: number
          _user_id: string
          _window_seconds: number
        }
        Returns: boolean
      }
      create_ai_nudge: {
        Args: {
          category?: string
          delivered_via?: string
          nudge_text: string
          target_user_id: string
        }
        Returns: undefined
      }
      get_agent_goal_adjustments_this_week: {
        Args: { p_user_id: string }
        Returns: number
      }
      get_agent_nudge_count_today: {
        Args: { p_user_id: string }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      lookup_user_by_email: { Args: { _email: string }; Returns: string }
      update_or_create_streak: {
        Args: { p_type: string; p_user_id: string }
        Returns: undefined
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
