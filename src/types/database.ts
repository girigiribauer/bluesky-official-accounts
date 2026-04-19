export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      account_fields: {
        Row: {
          account_id: string
          classification_id: string | null
          field_id: string
          id: string
        }
        Insert: {
          account_id: string
          classification_id?: string | null
          field_id: string
          id?: string
        }
        Update: {
          account_id?: string
          classification_id?: string | null
          field_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "account_fields_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "account_fields_classification_id_fkey"
            columns: ["classification_id"]
            isOneToOne: false
            referencedRelation: "classifications"
            referencedColumns: ["id"]
          },
        ]
      }
      accounts: {
        Row: {
          created_at: string
          display_name: string
          id: string
          old_category: string | null
          submitted_by: string | null
        }
        Insert: {
          created_at?: string
          display_name: string
          id?: string
          old_category?: string | null
          submitted_by?: string | null
        }
        Update: {
          created_at?: string
          display_name?: string
          id?: string
          old_category?: string | null
          submitted_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "accounts_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "moderators"
            referencedColumns: ["id"]
          },
        ]
      }
      activities: {
        Row: {
          account_id: string
          action: string
          created_at: string
          id: string
          moderator_id: string | null
          payload: Json
        }
        Insert: {
          account_id: string
          action: string
          created_at?: string
          id?: string
          moderator_id?: string | null
          payload?: Json
        }
        Update: {
          account_id?: string
          action?: string
          created_at?: string
          id?: string
          moderator_id?: string | null
          payload?: Json
        }
        Relationships: [
          {
            foreignKeyName: "activities_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_moderator_id_fkey"
            columns: ["moderator_id"]
            isOneToOne: false
            referencedRelation: "moderators"
            referencedColumns: ["id"]
          },
        ]
      }
      classifications: {
        Row: {
          created_at: string
          deleted_at: string | null
          field_id: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          field_id: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          field_id?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      entries: {
        Row: {
          account_id: string
          approved_at: string | null
          bluesky_did: string
          bluesky_handle: string
          created_at: string
          id: string
          status: string
          transition_status: string
          twitter_handle: string | null
          updated_at: string
        }
        Insert: {
          account_id: string
          approved_at?: string | null
          bluesky_did: string
          bluesky_handle: string
          created_at?: string
          id?: string
          status: string
          transition_status: string
          twitter_handle?: string | null
          updated_at?: string
        }
        Update: {
          account_id?: string
          approved_at?: string | null
          bluesky_did?: string
          bluesky_handle?: string
          created_at?: string
          id?: string
          status?: string
          transition_status?: string
          twitter_handle?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "entries_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      evidences: {
        Row: {
          account_id: string
          content: string
          created_at: string
          id: string
          moderator_id: string | null
        }
        Insert: {
          account_id: string
          content: string
          created_at?: string
          id?: string
          moderator_id?: string | null
        }
        Update: {
          account_id?: string
          content?: string
          created_at?: string
          id?: string
          moderator_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "evidences_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evidences_moderator_id_fkey"
            columns: ["moderator_id"]
            isOneToOne: false
            referencedRelation: "moderators"
            referencedColumns: ["id"]
          },
        ]
      }
      field_memberships: {
        Row: {
          field_id: string
          id: string
          joined_at: string
          moderator_id: string
        }
        Insert: {
          field_id: string
          id?: string
          joined_at?: string
          moderator_id: string
        }
        Update: {
          field_id?: string
          id?: string
          joined_at?: string
          moderator_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "field_memberships_moderator_id_fkey"
            columns: ["moderator_id"]
            isOneToOne: false
            referencedRelation: "moderators"
            referencedColumns: ["id"]
          },
        ]
      }
      moderators: {
        Row: {
          avatar: string | null
          created_at: string
          did: string
          display_name: string
          handle: string
          id: string
          is_admin: boolean
          last_active_at: string
        }
        Insert: {
          avatar?: string | null
          created_at?: string
          did: string
          display_name: string
          handle: string
          id?: string
          is_admin?: boolean
          last_active_at?: string
        }
        Update: {
          avatar?: string | null
          created_at?: string
          did?: string
          display_name?: string
          handle?: string
          id?: string
          is_admin?: boolean
          last_active_at?: string
        }
        Relationships: []
      }
      news: {
        Row: {
          created_at: string
          id: string
          published_at: string
          title: string
        }
        Insert: {
          created_at?: string
          id?: string
          published_at: string
          title: string
        }
        Update: {
          created_at?: string
          id?: string
          published_at?: string
          title?: string
        }
        Relationships: []
      }
      oauth_sessions: {
        Row: {
          did: string
          updated_at: string
          value: Json
        }
        Insert: {
          did: string
          updated_at?: string
          value: Json
        }
        Update: {
          did?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      oauth_states: {
        Row: {
          created_at: string
          key: string
          value: Json
        }
        Insert: {
          created_at?: string
          key: string
          value: Json
        }
        Update: {
          created_at?: string
          key?: string
          value?: Json
        }
        Relationships: []
      }
      old_categories: {
        Row: {
          created_at: string
          criteria: string
          id: string
          sort_order: number
          title: string
        }
        Insert: {
          created_at?: string
          criteria?: string
          id: string
          sort_order: number
          title: string
        }
        Update: {
          created_at?: string
          criteria?: string
          id?: string
          sort_order?: number
          title?: string
        }
        Relationships: []
      }
      requests: {
        Row: {
          account_id: string
          id: string
          twitter_handle: string
        }
        Insert: {
          account_id: string
          id?: string
          twitter_handle: string
        }
        Update: {
          account_id?: string
          id?: string
          twitter_handle?: string
        }
        Relationships: [
          {
            foreignKeyName: "requests_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

