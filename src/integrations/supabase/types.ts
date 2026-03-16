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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      contest_entries: {
        Row: {
          created_at: string
          id: string
          shot_id: string
          user_id: string
          votes: number
        }
        Insert: {
          created_at?: string
          id?: string
          shot_id: string
          user_id: string
          votes?: number
        }
        Update: {
          created_at?: string
          id?: string
          shot_id?: string
          user_id?: string
          votes?: number
        }
        Relationships: [
          {
            foreignKeyName: "contest_entries_shot_id_fkey"
            columns: ["shot_id"]
            isOneToOne: true
            referencedRelation: "shots"
            referencedColumns: ["id"]
          },
        ]
      }
      contest_votes: {
        Row: {
          created_at: string
          entry_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          entry_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          entry_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contest_votes_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "contest_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contest_votes_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "contest_entries_public"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_transactions: {
        Row: {
          action_type: string
          amount: number
          created_at: string
          id: string
          shot_id: string | null
          user_id: string
        }
        Insert: {
          action_type: string
          amount: number
          created_at?: string
          id?: string
          shot_id?: string | null
          user_id: string
        }
        Update: {
          action_type?: string
          amount?: number
          created_at?: string
          id?: string
          shot_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_transactions_shot_id_fkey"
            columns: ["shot_id"]
            isOneToOne: false
            referencedRelation: "shots"
            referencedColumns: ["id"]
          },
        ]
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string
          description: string | null
          id: string
          status: string
          thumbnail_url: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          status?: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          status?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      scenes: {
        Row: {
          id: string
          scene_number: number
          script_id: string
          slugline: string | null
          summary: string | null
        }
        Insert: {
          id?: string
          scene_number: number
          script_id: string
          slugline?: string | null
          summary?: string | null
        }
        Update: {
          id?: string
          scene_number?: number
          script_id?: string
          slugline?: string | null
          summary?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scenes_script_id_fkey"
            columns: ["script_id"]
            isOneToOne: false
            referencedRelation: "scripts"
            referencedColumns: ["id"]
          },
        ]
      }
      scripts: {
        Row: {
          content: string | null
          id: string
          last_ai_suggestion: string | null
          project_id: string
          updated_at: string | null
        }
        Insert: {
          content?: string | null
          id?: string
          last_ai_suggestion?: string | null
          project_id: string
          updated_at?: string | null
        }
        Update: {
          content?: string | null
          id?: string
          last_ai_suggestion?: string | null
          project_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scripts_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      shots: {
        Row: {
          angle: string | null
          camera_angle: string | null
          created_at: string
          description: string
          duration: string | null
          id: string
          is_completed: boolean
          lens: string | null
          motion_intensity: number | null
          movement: string | null
          order_index: number
          project_id: string | null
          prompt: string | null
          scene_id: string | null
          scene_number: string
          shot_code: string
          shot_type: string
          sort_order: number
          status: string | null
          thumbnail_url: string | null
          updated_at: string
          video_url: string | null
        }
        Insert: {
          angle?: string | null
          camera_angle?: string | null
          created_at?: string
          description?: string
          duration?: string | null
          id?: string
          is_completed?: boolean
          lens?: string | null
          motion_intensity?: number | null
          movement?: string | null
          order_index?: number
          project_id?: string | null
          prompt?: string | null
          scene_id?: string | null
          scene_number?: string
          shot_code?: string
          shot_type?: string
          sort_order?: number
          status?: string | null
          thumbnail_url?: string | null
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          angle?: string | null
          camera_angle?: string | null
          created_at?: string
          description?: string
          duration?: string | null
          id?: string
          is_completed?: boolean
          lens?: string | null
          motion_intensity?: number | null
          movement?: string | null
          order_index?: number
          project_id?: string | null
          prompt?: string | null
          scene_id?: string | null
          scene_number?: string
          shot_code?: string
          shot_type?: string
          sort_order?: number
          status?: string | null
          thumbnail_url?: string | null
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shots_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shots_scene_id_fkey"
            columns: ["scene_id"]
            isOneToOne: false
            referencedRelation: "scenes"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          created_at: string
          description: string
          email: string | null
          id: string
          status: string
          subject: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          email?: string | null
          id?: string
          status?: string
          subject: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          email?: string | null
          id?: string
          status?: string
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      user_credits: {
        Row: {
          balance: number
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      videos: {
        Row: {
          created_at: string
          duration: number | null
          id: string
          metadata: Json | null
          project_id: string
          status: string
          title: string
          updated_at: string
          url: string | null
        }
        Insert: {
          created_at?: string
          duration?: number | null
          id?: string
          metadata?: Json | null
          project_id: string
          status?: string
          title: string
          updated_at?: string
          url?: string | null
        }
        Update: {
          created_at?: string
          duration?: number | null
          id?: string
          metadata?: Json | null
          project_id?: string
          status?: string
          title?: string
          updated_at?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "videos_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      contest_entries_public: {
        Row: {
          created_at: string | null
          director_avatar: string | null
          director_name: string | null
          id: string | null
          shot_id: string | null
          votes: number | null
        }
        Relationships: [
          {
            foreignKeyName: "contest_entries_shot_id_fkey"
            columns: ["shot_id"]
            isOneToOne: true
            referencedRelation: "shots"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      is_own_project: { Args: { _project_id: string }; Returns: boolean }
      is_own_script: { Args: { _script_id: string }; Returns: boolean }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
      toggle_contest_vote: { Args: { _entry_id: string }; Returns: boolean }
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
    Enums: {},
  },
} as const
