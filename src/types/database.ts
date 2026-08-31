/**
 * Tipos del esquema de Postgres.
 *
 * Escritos a mano para reflejar exactamente supabase/migrations/. En cuanto
 * exista un proyecto Supabase enlazado, se regeneran y este fichero pasa a ser
 * generado (no editar a mano):
 *   npx supabase gen types typescript --project-id <ref> > src/types/database.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type Timestamptz = string;

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string;
          avatar_url: string | null;
          created_at: Timestamptz;
          updated_at: Timestamptz;
        };
        Insert: {
          id: string;
          display_name: string;
          avatar_url?: string | null;
          created_at?: Timestamptz;
          updated_at?: Timestamptz;
        };
        Update: {
          id?: string;
          display_name?: string;
          avatar_url?: string | null;
          created_at?: Timestamptz;
          updated_at?: Timestamptz;
        };
        Relationships: [];
      };
      couples: {
        Row: {
          id: string;
          created_by: string | null;
          created_at: Timestamptz;
          updated_at: Timestamptz;
        };
        Insert: {
          id?: string;
          created_by?: string | null;
          created_at?: Timestamptz;
          updated_at?: Timestamptz;
        };
        Update: {
          id?: string;
          created_by?: string | null;
          created_at?: Timestamptz;
          updated_at?: Timestamptz;
        };
        Relationships: [];
      };
      couple_members: {
        Row: {
          couple_id: string;
          user_id: string;
          member_slot: number;
          joined_at: Timestamptz;
        };
        Insert: {
          couple_id: string;
          user_id: string;
          member_slot: number;
          joined_at?: Timestamptz;
        };
        Update: {
          couple_id?: string;
          user_id?: string;
          member_slot?: number;
          joined_at?: Timestamptz;
        };
        Relationships: [];
      };
      couple_invitations: {
        Row: {
          id: string;
          couple_id: string;
          code: string;
          created_by: string;
          created_at: Timestamptz;
          expires_at: Timestamptz;
          revoked_at: Timestamptz | null;
          redeemed_at: Timestamptz | null;
          redeemed_by: string | null;
        };
        Insert: {
          id?: string;
          couple_id: string;
          code: string;
          created_by: string;
          created_at?: Timestamptz;
          expires_at?: Timestamptz;
          revoked_at?: Timestamptz | null;
          redeemed_at?: Timestamptz | null;
          redeemed_by?: string | null;
        };
        Update: {
          id?: string;
          couple_id?: string;
          code?: string;
          created_by?: string;
          created_at?: Timestamptz;
          expires_at?: Timestamptz;
          revoked_at?: Timestamptz | null;
          redeemed_at?: Timestamptz | null;
          redeemed_by?: string | null;
        };
        Relationships: [];
      };
      occasions: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          occasion_date: string;
          created_at: Timestamptz;
          updated_at: Timestamptz;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          occasion_date: string;
          created_at?: Timestamptz;
          updated_at?: Timestamptz;
        };
        Update: {
          id?: string;
          owner_id?: string;
          name?: string;
          occasion_date?: string;
          created_at?: Timestamptz;
          updated_at?: Timestamptz;
        };
        Relationships: [];
      };
      wishlist_items: {
        Row: {
          id: string;
          owner_id: string;
          occasion_id: string | null;
          title: string;
          description: string | null;
          url: string | null;
          image_url: string | null;
          price_cents: number | null;
          currency: string;
          priority: Database["public"]["Enums"]["wish_priority"];
          created_at: Timestamptz;
          updated_at: Timestamptz;
        };
        Insert: {
          id?: string;
          owner_id: string;
          occasion_id?: string | null;
          title: string;
          description?: string | null;
          url?: string | null;
          image_url?: string | null;
          price_cents?: number | null;
          currency?: string;
          priority?: Database["public"]["Enums"]["wish_priority"];
          created_at?: Timestamptz;
          updated_at?: Timestamptz;
        };
        Update: {
          id?: string;
          owner_id?: string;
          occasion_id?: string | null;
          title?: string;
          description?: string | null;
          url?: string | null;
          image_url?: string | null;
          price_cents?: number | null;
          currency?: string;
          priority?: Database["public"]["Enums"]["wish_priority"];
          created_at?: Timestamptz;
          updated_at?: Timestamptz;
        };
        Relationships: [];
      };
      shared_wishlist_items: {
        Row: {
          id: string;
          couple_id: string;
          created_by: string | null;
          title: string;
          description: string | null;
          url: string | null;
          image_url: string | null;
          price_cents: number | null;
          currency: string;
          created_at: Timestamptz;
          updated_at: Timestamptz;
        };
        Insert: {
          id?: string;
          couple_id: string;
          created_by?: string | null;
          title: string;
          description?: string | null;
          url?: string | null;
          image_url?: string | null;
          price_cents?: number | null;
          currency?: string;
          created_at?: Timestamptz;
          updated_at?: Timestamptz;
        };
        Update: {
          id?: string;
          couple_id?: string;
          created_by?: string | null;
          title?: string;
          description?: string | null;
          url?: string | null;
          image_url?: string | null;
          price_cents?: number | null;
          currency?: string;
          created_at?: Timestamptz;
          updated_at?: Timestamptz;
        };
        Relationships: [];
      };
      gift_reservations: {
        Row: {
          id: string;
          wishlist_item_id: string;
          item_owner_id: string;
          reserver_id: string;
          status: Database["public"]["Enums"]["reservation_status"];
          purchased_at: Timestamptz | null;
          cancelled_at: Timestamptz | null;
          created_at: Timestamptz;
          updated_at: Timestamptz;
        };
        Insert: {
          id?: string;
          wishlist_item_id: string;
          item_owner_id: string;
          reserver_id: string;
          status?: Database["public"]["Enums"]["reservation_status"];
          purchased_at?: Timestamptz | null;
          cancelled_at?: Timestamptz | null;
          created_at?: Timestamptz;
          updated_at?: Timestamptz;
        };
        Update: {
          id?: string;
          wishlist_item_id?: string;
          item_owner_id?: string;
          reserver_id?: string;
          status?: Database["public"]["Enums"]["reservation_status"];
          purchased_at?: Timestamptz | null;
          cancelled_at?: Timestamptz | null;
          created_at?: Timestamptz;
          updated_at?: Timestamptz;
        };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      current_couple_id: {
        Args: Record<PropertyKey, never>;
        Returns: string | null;
      };
      partner_id: {
        Args: Record<PropertyKey, never>;
        Returns: string | null;
      };
      create_couple: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      create_couple_invitation: {
        Args: Record<PropertyKey, never>;
        Returns: Database["public"]["Tables"]["couple_invitations"]["Row"];
      };
      redeem_couple_invitation: {
        Args: { p_code: string };
        Returns: string;
      };
    };
    Enums: {
      wish_priority: "low" | "medium" | "high";
      reservation_status: "reserved" | "purchased";
    };
    CompositeTypes: { [_ in never]: never };
  };
};

type PublicSchema = Database["public"];

export type Tables<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Row"];
export type TablesInsert<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Update"];
export type Enums<T extends keyof PublicSchema["Enums"]> =
  PublicSchema["Enums"][T];
