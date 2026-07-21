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
      capacity_settings: {
        Row: {
          created_at: string
          id: string
          max_capacity: number
          updated_at: string
          work_date: string
        }
        Insert: {
          created_at?: string
          id?: string
          max_capacity?: number
          updated_at?: string
          work_date: string
        }
        Update: {
          created_at?: string
          id?: string
          max_capacity?: number
          updated_at?: string
          work_date?: string
        }
        Relationships: []
      }
      contact_requests: {
        Row: {
          background_tone: string | null
          budget_range: string | null
          created_at: string
          desired_deadline: string
          email: string
          id: string
          name: string
          phone: string
          point_color: string | null
          reference_site: string | null
          request_details: string
          service_type: string
          status: Database['public']['Enums']['contact_request_status']
          updated_at: string
          user_id: string | null
          zoom_meeting_at: string
        }
        Insert: {
          background_tone?: string | null
          budget_range?: string | null
          created_at?: string
          desired_deadline: string
          email: string
          id?: string
          name: string
          phone: string
          point_color?: string | null
          reference_site?: string | null
          request_details: string
          service_type: string
          status?: Database['public']['Enums']['contact_request_status']
          updated_at?: string
          user_id?: string | null
          zoom_meeting_at: string
        }
        Update: {
          background_tone?: string | null
          budget_range?: string | null
          created_at?: string
          desired_deadline?: string
          email?: string
          id?: string
          name?: string
          phone?: string
          point_color?: string | null
          reference_site?: string | null
          request_details?: string
          service_type?: string
          status?: Database['public']['Enums']['contact_request_status']
          updated_at?: string
          user_id?: string | null
          zoom_meeting_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'contact_requests_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          memo: string | null
          paid_at: string
          payment_type: Database['public']['Enums']['payment_type']
          project_id: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          memo?: string | null
          paid_at: string
          payment_type?: Database['public']['Enums']['payment_type']
          project_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          memo?: string | null
          paid_at?: string
          payment_type?: Database['public']['Enums']['payment_type']
          project_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'payments_project_id_fkey'
            columns: ['project_id']
            isOneToOne: false
            referencedRelation: 'projects'
            referencedColumns: ['id']
          },
        ]
      }
      profiles: {
        Row: {
          company_name: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          is_admin: boolean
          phone_number: string | null
          updated_at: string
        }
        Insert: {
          company_name?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          is_admin?: boolean
          phone_number?: string | null
          updated_at?: string
        }
        Update: {
          company_name?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          is_admin?: boolean
          phone_number?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      project_pages: {
        Row: {
          created_at: string
          id: string
          page_name: string
          project_id: string
          sort_order: number
          status: Database['public']['Enums']['page_status']
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          page_name: string
          project_id: string
          sort_order?: number
          status?: Database['public']['Enums']['page_status']
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          page_name?: string
          project_id?: string
          sort_order?: number
          status?: Database['public']['Enums']['page_status']
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'project_pages_project_id_fkey'
            columns: ['project_id']
            isOneToOne: false
            referencedRelation: 'projects'
            referencedColumns: ['id']
          },
        ]
      }
      projects: {
        Row: {
          care_ended_at: string | null
          client_name: string | null
          company_name: string | null
          created_at: string
          current_stage: Database['public']['Enums']['project_stage']
          deadline: string | null
          deposit_amount: number | null
          id: string
          progress_percent: number
          project_name: string
          started_at: string
          total_amount: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          care_ended_at?: string | null
          client_name?: string | null
          company_name?: string | null
          created_at?: string
          current_stage?: Database['public']['Enums']['project_stage']
          deadline?: string | null
          deposit_amount?: number | null
          id?: string
          progress_percent?: number
          project_name: string
          started_at?: string
          total_amount?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          care_ended_at?: string | null
          client_name?: string | null
          company_name?: string | null
          created_at?: string
          current_stage?: Database['public']['Enums']['project_stage']
          deadline?: string | null
          deposit_amount?: number | null
          id?: string
          progress_percent?: number
          project_name?: string
          started_at?: string
          total_amount?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'projects_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_project_with_pages: {
        Args: {
          input_client_name?: string | null
          input_deadline?: string | null
          input_deposit_amount?: number | null
          input_company_name?: string | null
          input_care_ended_at?: string | null
          input_current_stage?: Database['public']['Enums']['project_stage']
          input_pages?: Json
          input_progress_percent?: number
          input_project_name: string
          input_started_at?: string
          input_total_amount?: number | null
          input_user_id?: string | null
        }
        Returns: string
      }
      get_capacity_availability: {
        Args: { end_date: string; start_date: string }
        Returns: {
          is_unavailable: boolean
          max_capacity: number | null
          reserved_count: number
          work_date: string
        }[]
      }
      get_zoom_meeting_availability: {
        Args: { end_date: string; start_date: string }
        Returns: {
          is_unavailable: boolean
          reserved_count: number
          reserved_times: string[]
          work_date: string
        }[]
      }
      is_admin: { Args: { check_user_id?: string }; Returns: boolean }
      update_project_overview: {
        Args: {
          input_care_ended_at?: string | null
          input_deadline?: string | null
          input_deposit_amount?: number | null
          input_project_id: string
          input_project_name: string
          input_started_at?: string
          input_total_amount?: number | null
        }
        Returns: {
          care_ended_at: string | null
          client_name: string | null
          company_name: string | null
          created_at: string
          current_stage: Database['public']['Enums']['project_stage']
          deadline: string | null
          deposit_amount: number | null
          id: string
          progress_percent: number
          project_name: string
          started_at: string
          total_amount: number | null
          updated_at: string
          user_id: string | null
        }
      }
    }
    Enums: {
      contact_request_status: 'pending' | 'confirmed' | 'rejected'
      page_status: 'pending' | 'in_progress' | 'completed'
      payment_type: 'deposit' | 'interim' | 'final' | 'other'
      project_stage: 'analysis' | 'planning' | 'development' | 'qa' | 'launch' | 'care' | 'completed'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer Row
    }
    ? Row
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer Row
      }
      ? Row
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer Insert
    }
    ? Insert
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer Insert
      }
      ? Insert
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer Update
    }
    ? Update
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer Update
      }
      ? Update
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums'] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      contact_request_status: ['pending', 'confirmed', 'rejected'],
      page_status: ['pending', 'in_progress', 'completed'],
      payment_type: ['deposit', 'interim', 'final', 'other'],
      project_stage: ['analysis', 'planning', 'development', 'qa', 'launch', 'care', 'completed'],
    },
  },
} as const
