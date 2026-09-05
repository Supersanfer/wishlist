/**
 * Tipos del esquema de Postgres. FICHERO GENERADO: no editar a mano.
 *
 *   npx supabase gen types typescript --linked > src/types/database.ts
 *
 * Regenerar tras cada migracion.
 */
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
    PostgrestVersion: "14.5"
  }
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
      couple_invitations: {
        Row: {
          code: string
          couple_id: string
          created_at: string
          created_by: string
          expires_at: string
          id: string
          redeemed_at: string | null
          redeemed_by: string | null
          revoked_at: string | null
        }
        Insert: {
          code: string
          couple_id: string
          created_at?: string
          created_by: string
          expires_at?: string
          id?: string
          redeemed_at?: string | null
          redeemed_by?: string | null
          revoked_at?: string | null
        }
        Update: {
          code?: string
          couple_id?: string
          created_at?: string
          created_by?: string
          expires_at?: string
          id?: string
          redeemed_at?: string | null
          redeemed_by?: string | null
          revoked_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "couple_invitations_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couple_invitations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couple_invitations_redeemed_by_fkey"
            columns: ["redeemed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      couple_members: {
        Row: {
          couple_id: string
          joined_at: string
          member_slot: number
          user_id: string
        }
        Insert: {
          couple_id: string
          joined_at?: string
          member_slot: number
          user_id: string
        }
        Update: {
          couple_id?: string
          joined_at?: string
          member_slot?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "couple_members_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couple_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      couples: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "couples_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      gift_reservations: {
        Row: {
          cancelled_at: string | null
          created_at: string
          id: string
          item_owner_id: string
          purchased_at: string | null
          reserver_id: string
          status: Database["public"]["Enums"]["reservation_status"]
          updated_at: string
          wishlist_item_id: string
        }
        Insert: {
          cancelled_at?: string | null
          created_at?: string
          id?: string
          item_owner_id: string
          purchased_at?: string | null
          reserver_id: string
          status?: Database["public"]["Enums"]["reservation_status"]
          updated_at?: string
          wishlist_item_id: string
        }
        Update: {
          cancelled_at?: string | null
          created_at?: string
          id?: string
          item_owner_id?: string
          purchased_at?: string | null
          reserver_id?: string
          status?: Database["public"]["Enums"]["reservation_status"]
          updated_at?: string
          wishlist_item_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gift_reservations_item_fk"
            columns: ["wishlist_item_id", "item_owner_id"]
            isOneToOne: false
            referencedRelation: "wishlist_items"
            referencedColumns: ["id", "owner_id"]
          },
          {
            foreignKeyName: "gift_reservations_reserver_id_fkey"
            columns: ["reserver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      occasions: {
        Row: {
          created_at: string
          id: string
          name: string
          occasion_date: string
          owner_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          occasion_date: string
          owner_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          occasion_date?: string
          owner_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "occasions_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name: string
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      shared_wishlist_items: {
        Row: {
          couple_id: string
          created_at: string
          created_by: string | null
          currency: string
          description: string | null
          id: string
          image_path: string | null
          image_url: string | null
          price_cents: number | null
          title: string
          updated_at: string
          url: string | null
        }
        Insert: {
          couple_id: string
          created_at?: string
          created_by?: string | null
          currency?: string
          description?: string | null
          id?: string
          image_path?: string | null
          image_url?: string | null
          price_cents?: number | null
          title: string
          updated_at?: string
          url?: string | null
        }
        Update: {
          couple_id?: string
          created_at?: string
          created_by?: string | null
          currency?: string
          description?: string | null
          id?: string
          image_path?: string | null
          image_url?: string | null
          price_cents?: number | null
          title?: string
          updated_at?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shared_wishlist_items_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shared_wishlist_items_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      wishlist_items: {
        Row: {
          created_at: string
          currency: string
          description: string | null
          id: string
          image_path: string | null
          image_url: string | null
          occasion_id: string | null
          owner_id: string
          price_cents: number | null
          priority: Database["public"]["Enums"]["wish_priority"]
          title: string
          updated_at: string
          url: string | null
        }
        Insert: {
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          image_path?: string | null
          image_url?: string | null
          occasion_id?: string | null
          owner_id: string
          price_cents?: number | null
          priority?: Database["public"]["Enums"]["wish_priority"]
          title: string
          updated_at?: string
          url?: string | null
        }
        Update: {
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          image_path?: string | null
          image_url?: string | null
          occasion_id?: string | null
          owner_id?: string
          price_cents?: number | null
          priority?: Database["public"]["Enums"]["wish_priority"]
          title?: string
          updated_at?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_items_occasion_same_owner"
            columns: ["occasion_id", "owner_id"]
            isOneToOne: false
            referencedRelation: "occasions"
            referencedColumns: ["id", "owner_id"]
          },
          {
            foreignKeyName: "wishlist_items_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_couple: { Args: never; Returns: string }
      create_couple_invitation: {
        Args: never
        Returns: {
          code: string
          couple_id: string
          created_at: string
          created_by: string
          expires_at: string
          id: string
          redeemed_at: string | null
          redeemed_by: string | null
          revoked_at: string | null
        }
        SetofOptions: {
          from: "*"
          to: "couple_invitations"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      current_couple_id: { Args: never; Returns: string }
      partner_id: { Args: never; Returns: string }
      redeem_couple_invitation: { Args: { p_code: string }; Returns: string }
    }
    Enums: {
      reservation_status: "reserved" | "purchased"
      wish_priority: "low" | "medium" | "high"
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
    Enums: {
      reservation_status: ["reserved", "purchased"],
      wish_priority: ["low", "medium", "high"],
    },
  },
} as const
