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
      appointment_reminders: {
        Row: {
          appointment_id: string
          attempts: number
          created_at: string
          id: string
          last_error: string | null
          reminder_type: string
          scheduled_for: string
          sent_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          appointment_id: string
          attempts?: number
          created_at?: string
          id?: string
          last_error?: string | null
          reminder_type: string
          scheduled_for: string
          sent_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          appointment_id?: string
          attempts?: number
          created_at?: string
          id?: string
          last_error?: string | null
          reminder_type?: string
          scheduled_for?: string
          sent_at?: string | null
          status?: string
          updated_at?: string
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
          appointment_at: string
          appointment_date: string
          appointment_time: string
          client_name: string
          client_phone: string
          confirmation_whatsapp_attempts: number
          confirmation_whatsapp_error: string | null
          confirmation_whatsapp_sent_at: string | null
          confirmation_whatsapp_status: string
          created_at: string
          id: string
          language: string
          normalized_client_phone: string
          status: string
          updated_at: string
          whatsapp_chat_id: string
        }
        Insert: {
          appointment_at: string
          appointment_date: string
          appointment_time: string
          client_name: string
          client_phone: string
          confirmation_whatsapp_attempts?: number
          confirmation_whatsapp_error?: string | null
          confirmation_whatsapp_sent_at?: string | null
          confirmation_whatsapp_status?: string
          created_at?: string
          id?: string
          language: string
          normalized_client_phone: string
          status?: string
          updated_at?: string
          whatsapp_chat_id: string
        }
        Update: {
          appointment_at?: string
          appointment_date?: string
          appointment_time?: string
          client_name?: string
          client_phone?: string
          confirmation_whatsapp_attempts?: number
          confirmation_whatsapp_error?: string | null
          confirmation_whatsapp_sent_at?: string | null
          confirmation_whatsapp_status?: string
          created_at?: string
          id?: string
          language?: string
          normalized_client_phone?: string
          status?: string
          updated_at?: string
          whatsapp_chat_id?: string
        }
        Relationships: []
      }
      dashboard_cache: {
        Row: {
          data: Json
          id: string
          updated_at: string
        }
        Insert: {
          data?: Json
          id?: string
          updated_at?: string
        }
        Update: {
          data?: Json
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      opticians: {
        Row: {
          address: string | null
          id: string
          is_active: boolean
          map_link: string | null
          name: string
          phone: string | null
          created_at: string
        }
        Insert: {
          address?: string | null
          id?: string
          is_active?: boolean
          map_link?: string | null
          name: string
          phone?: string | null
          created_at?: string
        }
        Update: {
          address?: string | null
          id?: string
          is_active?: boolean
          map_link?: string | null
          name?: string
          phone?: string | null
          created_at?: string
        }
        Relationships: []
      }
      patient_profiles: {
        Row: {
          created_at: string
          id: string
          name: string
          normalized_phone: string
          phone: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          normalized_phone: string
          phone: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          normalized_phone?: string
          phone?: string
          updated_at?: string
        }
        Relationships: []
      }
      queue_patients: {
        Row: {
          id: string
          queue_date: string
          queue_type: string
          client_name: string
          client_phone: string | null
          patient_profile_id: string | null
          status: string
          notes: string | null
          procedure: string | null
          procedure_at: string | null
          follow_up: string | null
          follow_up_date: string | null
          follow_up_queue_patient_id: string | null
          optician_id: string | null
          position: number
          checked_in_at: string
          with_doctor_at: string | null
          completed_at: string | null
          no_show_at: string | null
          cancelled_at: string | null
          created_at: string
          updated_at: string
          appointment_id: string | null
        }
        Insert: {
          id?: string
          queue_date?: string
          queue_type: string
          client_name: string
          client_phone?: string | null
          patient_profile_id?: string | null
          status?: string
          notes?: string | null
          procedure?: string | null
          procedure_at?: string | null
          follow_up?: string | null
          follow_up_date?: string | null
          follow_up_queue_patient_id?: string | null
          optician_id?: string | null
          position?: number
          checked_in_at?: string
          with_doctor_at?: string | null
          completed_at?: string | null
          no_show_at?: string | null
          cancelled_at?: string | null
          created_at?: string
          updated_at?: string
          appointment_id?: string | null
        }
        Update: {
          id?: string
          queue_date?: string
          queue_type?: string
          client_name?: string
          client_phone?: string | null
          patient_profile_id?: string | null
          status?: string
          notes?: string | null
          procedure?: string | null
          procedure_at?: string | null
          follow_up?: string | null
          follow_up_date?: string | null
          follow_up_queue_patient_id?: string | null
          optician_id?: string | null
          position?: number
          checked_in_at?: string
          with_doctor_at?: string | null
          completed_at?: string | null
          no_show_at?: string | null
          cancelled_at?: string | null
          created_at?: string
          updated_at?: string
          appointment_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "queue_patients_patient_profile_id_fkey"
            columns: ["patient_profile_id"]
            isOneToOne: false
            referencedRelation: "patient_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "queue_patients_follow_up_queue_patient_id_fkey"
            columns: ["follow_up_queue_patient_id"]
            isOneToOne: false
            referencedRelation: "queue_patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "queue_patients_optician_id_fkey"
            columns: ["optician_id"]
            isOneToOne: false
            referencedRelation: "opticians"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          amount: number
          created_at: string
          currency: string
          customer_email: string | null
          customer_name: string | null
          id: string
          plan_slug: string | null
          status: string | null
          stripe_payment_intent: string | null
          stripe_session_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          currency?: string
          customer_email?: string | null
          customer_name?: string | null
          id?: string
          plan_slug?: string | null
          status?: string | null
          stripe_payment_intent?: string | null
          stripe_session_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          customer_email?: string | null
          customer_name?: string | null
          id?: string
          plan_slug?: string | null
          status?: string | null
          stripe_payment_intent?: string | null
          stripe_session_id?: string
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
      add_queue_patient_atomic: {
        Args: {
          _client_name: string
          _client_phone?: string | null
          _notes?: string | null
          _queue_date: string
          _queue_type: string
        }
        Returns: {
          appointment_id: string | null
          cancelled_at: string | null
          checked_in_at: string
          client_name: string
          client_phone: string | null
          patient_profile_id: string | null
          completed_at: string | null
          created_at: string
          follow_up: string | null
          follow_up_date: string | null
          follow_up_queue_patient_id: string | null
          id: string
          no_show_at: string | null
          notes: string | null
          optician_id: string | null
          position: number
          procedure: string | null
          procedure_at: string | null
          queue_date: string
          queue_type: string
          status: string
          updated_at: string
          with_doctor_at: string | null
        }
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      move_queue_patient_to_medecin_atomic: {
        Args: {
          _patient_id: string
        }
        Returns: {
          appointment_id: string | null
          cancelled_at: string | null
          checked_in_at: string
          client_name: string
          client_phone: string | null
          patient_profile_id: string | null
          completed_at: string | null
          created_at: string
          follow_up: string | null
          follow_up_date: string | null
          follow_up_queue_patient_id: string | null
          id: string
          no_show_at: string | null
          notes: string | null
          optician_id: string | null
          position: number
          procedure: string | null
          procedure_at: string | null
          queue_date: string
          queue_type: string
          status: string
          updated_at: string
          with_doctor_at: string | null
        }
      }
      set_queue_patient_follow_up_atomic: {
        Args: {
          _follow_up: string
          _follow_up_date: string
          _source_queue_patient_id: string
        }
        Returns: {
          appointment_id: string | null
          cancelled_at: string | null
          checked_in_at: string
          client_name: string
          client_phone: string | null
          patient_profile_id: string | null
          completed_at: string | null
          created_at: string
          follow_up: string | null
          follow_up_date: string | null
          follow_up_queue_patient_id: string | null
          id: string
          no_show_at: string | null
          notes: string | null
          optician_id: string | null
          position: number
          procedure: string | null
          procedure_at: string | null
          queue_date: string
          queue_type: string
          status: string
          updated_at: string
          with_doctor_at: string | null
        }
      }
      update_reservation_status_atomic: {
        Args: {
          _reservation_id: string
          _status: string
        }
        Returns: number
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
