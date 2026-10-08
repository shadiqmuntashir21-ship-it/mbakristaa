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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      activities: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          deadline: string | null
          delivery_mode: string
          description: string | null
          end_at: string | null
          id: string
          location: string | null
          owner_region_id: string | null
          program_id: string | null
          start_at: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          created_by?: string | null
          deadline?: string | null
          delivery_mode?: string
          description?: string | null
          end_at?: string | null
          id?: string
          location?: string | null
          owner_region_id?: string | null
          program_id?: string | null
          start_at?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          deadline?: string | null
          delivery_mode?: string
          description?: string | null
          end_at?: string | null
          id?: string
          location?: string | null
          owner_region_id?: string | null
          program_id?: string | null
          start_at?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "activities_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "participant_progress_summary"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "activities_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_owner_region_id_fkey"
            columns: ["owner_region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_requirements: {
        Row: {
          activity_id: string
          config: Json
          created_at: string
          due_at: string | null
          id: string
          instructions: string | null
          required: boolean
          requirement_type: string
          sort_order: number
          title: string
        }
        Insert: {
          activity_id: string
          config?: Json
          created_at?: string
          due_at?: string | null
          id?: string
          instructions?: string | null
          required?: boolean
          requirement_type: string
          sort_order?: number
          title: string
        }
        Update: {
          activity_id?: string
          config?: Json
          created_at?: string
          due_at?: string | null
          id?: string
          instructions?: string | null
          required?: boolean
          requirement_type?: string
          sort_order?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_requirements_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_targets: {
        Row: {
          activity_id: string
          cohort_id: string | null
          created_at: string
          id: string
          profile_id: string | null
          region_id: string | null
          target_type: string
        }
        Insert: {
          activity_id: string
          cohort_id?: string | null
          created_at?: string
          id?: string
          profile_id?: string | null
          region_id?: string | null
          target_type: string
        }
        Update: {
          activity_id?: string
          cohort_id?: string | null
          created_at?: string
          id?: string
          profile_id?: string | null
          region_id?: string | null
          target_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_targets_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_targets_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "cohorts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_targets_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "participant_progress_summary"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "activity_targets_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_targets_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      assignments: {
        Row: {
          activity_id: string
          assigned_at: string
          completed_at: string | null
          due_at: string | null
          id: string
          profile_id: string
          requirement_id: string
          status: string
          updated_at: string
        }
        Insert: {
          activity_id: string
          assigned_at?: string
          completed_at?: string | null
          due_at?: string | null
          id?: string
          profile_id: string
          requirement_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          activity_id?: string
          assigned_at?: string
          completed_at?: string | null
          due_at?: string | null
          id?: string
          profile_id?: string
          requirement_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignments_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignments_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "participant_progress_summary"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "assignments_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignments_requirement_id_fkey"
            columns: ["requirement_id"]
            isOneToOne: false
            referencedRelation: "activity_requirements"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance_records: {
        Row: {
          activity_id: string
          checked_in_at: string | null
          created_at: string
          id: string
          note: string | null
          profile_id: string
          session_id: string
          status: string
          verified_by: string | null
        }
        Insert: {
          activity_id: string
          checked_in_at?: string | null
          created_at?: string
          id?: string
          note?: string | null
          profile_id: string
          session_id: string
          status?: string
          verified_by?: string | null
        }
        Update: {
          activity_id?: string
          checked_in_at?: string | null
          created_at?: string
          id?: string
          note?: string | null
          profile_id?: string
          session_id?: string
          status?: string
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_records_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_records_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "participant_progress_summary"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "attendance_records_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_records_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "attendance_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_records_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "participant_progress_summary"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "attendance_records_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance_sessions: {
        Row: {
          active: boolean
          activity_id: string
          checkin_code: string | null
          closes_at: string | null
          created_at: string
          id: string
          opens_at: string | null
          title: string
        }
        Insert: {
          active?: boolean
          activity_id: string
          checkin_code?: string | null
          closes_at?: string | null
          created_at?: string
          id?: string
          opens_at?: string | null
          title?: string
        }
        Update: {
          active?: boolean
          activity_id?: string
          checkin_code?: string | null
          closes_at?: string | null
          created_at?: string
          id?: string
          opens_at?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_sessions_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor_profile_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: number
          payload: Json
        }
        Insert: {
          action: string
          actor_profile_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: never
          payload?: Json
        }
        Update: {
          action?: string
          actor_profile_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: never
          payload?: Json
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_profile_id_fkey"
            columns: ["actor_profile_id"]
            isOneToOne: false
            referencedRelation: "participant_progress_summary"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "audit_logs_actor_profile_id_fkey"
            columns: ["actor_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cohorts: {
        Row: {
          active: boolean
          created_at: string
          id: string
          label: string
          year: number
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          label: string
          year: number
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          label?: string
          year?: number
        }
        Relationships: []
      }
      documents: {
        Row: {
          activity_id: string | null
          category: string
          created_at: string
          created_by: string | null
          external_url: string | null
          id: string
          metadata: Json
          profile_id: string | null
          region_id: string | null
          storage_path: string | null
          title: string
        }
        Insert: {
          activity_id?: string | null
          category: string
          created_at?: string
          created_by?: string | null
          external_url?: string | null
          id?: string
          metadata?: Json
          profile_id?: string | null
          region_id?: string | null
          storage_path?: string | null
          title: string
        }
        Update: {
          activity_id?: string | null
          category?: string
          created_at?: string
          created_by?: string | null
          external_url?: string | null
          id?: string
          metadata?: Json
          profile_id?: string | null
          region_id?: string | null
          storage_path?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "participant_progress_summary"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "documents_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "participant_progress_summary"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "documents_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_reports: {
        Row: {
          content: Json
          created_at: string
          feedback: string | null
          id: string
          period_month: string
          profile_id: string
          reviewed_at: string | null
          reviewer_id: string | null
          status: string
          submitted_at: string | null
          updated_at: string
        }
        Insert: {
          content?: Json
          created_at?: string
          feedback?: string | null
          id?: string
          period_month: string
          profile_id: string
          reviewed_at?: string | null
          reviewer_id?: string | null
          status?: string
          submitted_at?: string | null
          updated_at?: string
        }
        Update: {
          content?: Json
          created_at?: string
          feedback?: string | null
          id?: string
          period_month?: string
          profile_id?: string
          reviewed_at?: string | null
          reviewer_id?: string | null
          status?: string
          submitted_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "monthly_reports_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "participant_progress_summary"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "monthly_reports_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monthly_reports_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "participant_progress_summary"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "monthly_reports_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          href: string | null
          id: string
          message: string
          profile_id: string
          read_at: string | null
          title: string
          type: string
        }
        Insert: {
          created_at?: string
          href?: string | null
          id?: string
          message: string
          profile_id: string
          read_at?: string | null
          title: string
          type?: string
        }
        Update: {
          created_at?: string
          href?: string | null
          id?: string
          message?: string
          profile_id?: string
          read_at?: string | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "participant_progress_summary"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "notifications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      point_transactions: {
        Row: {
          activity_id: string | null
          created_at: string
          created_by: string | null
          id: string
          points: number
          profile_id: string
          reason: string
          source: string
        }
        Insert: {
          activity_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          points: number
          profile_id: string
          reason: string
          source?: string
        }
        Update: {
          activity_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          points?: number
          profile_id?: string
          reason?: string
          source?: string
        }
        Relationships: [
          {
            foreignKeyName: "point_transactions_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "point_transactions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "participant_progress_summary"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "point_transactions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "point_transactions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "participant_progress_summary"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "point_transactions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          active: boolean
          app_role: string
          auth_user_id: string | null
          avatar_url: string | null
          cohort_id: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          joined_at: string | null
          participant_code: string | null
          phone: string | null
          region_id: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          app_role?: string
          auth_user_id?: string | null
          avatar_url?: string | null
          cohort_id?: string | null
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          joined_at?: string | null
          participant_code?: string | null
          phone?: string | null
          region_id?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          app_role?: string
          auth_user_id?: string | null
          avatar_url?: string | null
          cohort_id?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          joined_at?: string | null
          participant_code?: string | null
          phone?: string | null
          region_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "cohorts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      programs: {
        Row: {
          active: boolean
          code: string
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          code: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      regional_activity_plans: {
        Row: {
          activity_description: string | null
          created_at: string
          created_by: string | null
          duration_minutes: number | null
          estimated_budget: number | null
          follow_up: string | null
          id: string
          involved_parties: string | null
          period_end: string | null
          period_start: string
          region_id: string
          status: string
          target_date: string | null
          target_output: string | null
          title: string
          updated_at: string
        }
        Insert: {
          activity_description?: string | null
          created_at?: string
          created_by?: string | null
          duration_minutes?: number | null
          estimated_budget?: number | null
          follow_up?: string | null
          id?: string
          involved_parties?: string | null
          period_end?: string | null
          period_start: string
          region_id: string
          status?: string
          target_date?: string | null
          target_output?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          activity_description?: string | null
          created_at?: string
          created_by?: string | null
          duration_minutes?: number | null
          estimated_budget?: number | null
          follow_up?: string | null
          id?: string
          involved_parties?: string | null
          period_end?: string | null
          period_start?: string
          region_id?: string
          status?: string
          target_date?: string | null
          target_output?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "regional_activity_plans_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "participant_progress_summary"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "regional_activity_plans_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "regional_activity_plans_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      regions: {
        Row: {
          active: boolean
          code: string
          created_at: string
          id: string
          name: string
        }
        Insert: {
          active?: boolean
          code: string
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          active?: boolean
          code?: string
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          created_at: string
          decision: string
          feedback: string | null
          id: string
          reviewer_id: string | null
          submission_id: string
        }
        Insert: {
          created_at?: string
          decision: string
          feedback?: string | null
          id?: string
          reviewer_id?: string | null
          submission_id: string
        }
        Update: {
          created_at?: string
          decision?: string
          feedback?: string | null
          id?: string
          reviewer_id?: string | null
          submission_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "participant_progress_summary"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      submission_files: {
        Row: {
          created_at: string
          id: string
          mime_type: string | null
          original_name: string
          size_bytes: number | null
          storage_path: string
          submission_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          mime_type?: string | null
          original_name: string
          size_bytes?: number | null
          storage_path: string
          submission_id: string
        }
        Update: {
          created_at?: string
          id?: string
          mime_type?: string | null
          original_name?: string
          size_bytes?: number | null
          storage_path?: string
          submission_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "submission_files_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      submissions: {
        Row: {
          assignment_id: string
          created_at: string
          id: string
          profile_id: string
          response_data: Json
          response_text: string | null
          status: string
          submitted_at: string | null
          updated_at: string
          version: number
        }
        Insert: {
          assignment_id: string
          created_at?: string
          id?: string
          profile_id: string
          response_data?: Json
          response_text?: string | null
          status?: string
          submitted_at?: string | null
          updated_at?: string
          version?: number
        }
        Update: {
          assignment_id?: string
          created_at?: string
          id?: string
          profile_id?: string
          response_data?: Json
          response_text?: string | null
          status?: string
          submitted_at?: string | null
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "submissions_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "participant_progress_summary"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "submissions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      participant_progress_summary: {
        Row: {
          cohort_id: string | null
          completed_or_submitted: number | null
          credit_points: number | null
          full_name: string | null
          needs_attention: number | null
          participant_code: string | null
          profile_id: string | null
          region_id: string | null
          total_assignments: number | null
          verified_assignments: number | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "cohorts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      generate_activity_assignments: {
        Args: { p_activity_id: string }
        Returns: number
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
