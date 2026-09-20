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
  public: {
    Tables: {
      fx_rate: {
        Row: {
          id: string
          updated_at: string
          updated_by: string | null
          usd_to_ngn: number
        }
        Insert: {
          id?: string
          updated_at?: string
          updated_by?: string | null
          usd_to_ngn: number
        }
        Update: {
          id?: string
          updated_at?: string
          updated_by?: string | null
          usd_to_ngn?: number
        }
        Relationships: []
      }
      leads: {
        Row: {
          created_at: string
          email: string | null
          id: string
          item_type: string | null
          message: string | null
          mode: string | null
          name: string
          phone: string
          pickup_city: string | null
          source: string
          weight_kg: number | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          item_type?: string | null
          message?: string | null
          mode?: string | null
          name: string
          phone: string
          pickup_city?: string | null
          source?: string
          weight_kg?: number | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          item_type?: string | null
          message?: string | null
          mode?: string | null
          name?: string
          phone?: string
          pickup_city?: string | null
          source?: string
          weight_kg?: number | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          cbm: number | null
          created_at: string
          customer_id: string
          description: string
          estimated_delivery_date: string | null
          goods_type: Database["public"]["Enums"]["goods_type"]
          id: string
          internal_code: string | null
          photo_url: string | null
          pickup_location: Database["public"]["Enums"]["pickup_location"]
          shipping_mode: Database["public"]["Enums"]["shipping_mode"]
          status: Database["public"]["Enums"]["order_status"]
          tracking_number: string
          updated_at: string
          warehouse_city: string | null
          weight_kg: number | null
        }
        Insert: {
          cbm?: number | null
          created_at?: string
          customer_id: string
          description: string
          estimated_delivery_date?: string | null
          goods_type?: Database["public"]["Enums"]["goods_type"]
          id?: string
          internal_code?: string | null
          photo_url?: string | null
          pickup_location?: Database["public"]["Enums"]["pickup_location"]
          shipping_mode?: Database["public"]["Enums"]["shipping_mode"]
          status?: Database["public"]["Enums"]["order_status"]
          tracking_number: string
          updated_at?: string
          warehouse_city?: string | null
          weight_kg?: number | null
        }
        Update: {
          cbm?: number | null
          created_at?: string
          customer_id?: string
          description?: string
          estimated_delivery_date?: string | null
          goods_type?: Database["public"]["Enums"]["goods_type"]
          id?: string
          internal_code?: string | null
          photo_url?: string | null
          pickup_location?: Database["public"]["Enums"]["pickup_location"]
          shipping_mode?: Database["public"]["Enums"]["shipping_mode"]
          status?: Database["public"]["Enums"]["order_status"]
          tracking_number?: string
          updated_at?: string
          warehouse_city?: string | null
          weight_kg?: number | null
        }
        Relationships: []
      }
      otps: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          id: string
          is_verified: boolean
          metadata: Json
          otp_code: string
          purpose: string
        }
        Insert: {
          created_at?: string
          email: string
          expires_at: string
          id?: string
          is_verified?: boolean
          metadata?: Json
          otp_code: string
          purpose: string
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          is_verified?: boolean
          metadata?: Json
          otp_code?: string
          purpose?: string
        }
        Relationships: []
      }
      parcels: {
        Row: {
          created_at: string
          description: string
          expected_weight_kg: number | null
          id: string
          mode: string
          quantity: number
          seller: string | null
          status: string
          tracking_number: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description: string
          expected_weight_kg?: number | null
          id?: string
          mode?: string
          quantity?: number
          seller?: string | null
          status?: string
          tracking_number: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string
          expected_weight_kg?: number | null
          id?: string
          mode?: string
          quantity?: number
          seller?: string | null
          status?: string
          tracking_number?: string
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          admin_note: string | null
          amount: number | null
          confirmed_by: string | null
          created_at: string
          id: string
          method: Database["public"]["Enums"]["payment_method"]
          order_id: string
          receipt_url: string | null
          reference: string | null
          status: Database["public"]["Enums"]["payment_status"]
          updated_at: string
        }
        Insert: {
          admin_note?: string | null
          amount?: number | null
          confirmed_by?: string | null
          created_at?: string
          id?: string
          method?: Database["public"]["Enums"]["payment_method"]
          order_id: string
          receipt_url?: string | null
          reference?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
        }
        Update: {
          admin_note?: string | null
          amount?: number | null
          confirmed_by?: string | null
          created_at?: string
          id?: string
          method?: Database["public"]["Enums"]["payment_method"]
          order_id?: string
          receipt_url?: string | null
          reference?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      procurement_requests: {
        Row: {
          budget_ngn: number | null
          created_at: string
          id: string
          item_name: string
          notes: string | null
          product_url: string | null
          quantity: number
          status: string
          user_id: string
        }
        Insert: {
          budget_ngn?: number | null
          created_at?: string
          id?: string
          item_name: string
          notes?: string | null
          product_url?: string | null
          quantity?: number
          status?: string
          user_id: string
        }
        Update: {
          budget_ngn?: number | null
          created_at?: string
          id?: string
          item_name?: string
          notes?: string | null
          product_url?: string | null
          quantity?: number
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          business_name: string | null
          city: string | null
          created_at: string
          full_name: string | null
          id: string
          km_code: string | null
          phone: string | null
        }
        Insert: {
          business_name?: string | null
          city?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          km_code?: string | null
          phone?: string | null
        }
        Update: {
          business_name?: string | null
          city?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          km_code?: string | null
          phone?: string | null
        }
        Relationships: []
      }
      rate_card: {
        Row: {
          currency: string
          id: string
          label: string
          min_cbm: number | null
          mode: Database["public"]["Enums"]["shipping_mode"]
          rate: number
          sort_order: number
          tier: string
          unit: string
          updated_at: string
        }
        Insert: {
          currency: string
          id?: string
          label: string
          min_cbm?: number | null
          mode: Database["public"]["Enums"]["shipping_mode"]
          rate: number
          sort_order?: number
          tier: string
          unit?: string
          updated_at?: string
        }
        Update: {
          currency?: string
          id?: string
          label?: string
          min_cbm?: number | null
          mode?: Database["public"]["Enums"]["shipping_mode"]
          rate?: number
          sort_order?: number
          tier?: string
          unit?: string
          updated_at?: string
        }
        Relationships: []
      }
      recipients: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          full_name: string
          id: string
          phone: string
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          full_name: string
          id?: string
          phone: string
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          full_name?: string
          id?: string
          phone?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      rmb_transactions: {
        Row: {
          amount_ngn: number
          amount_rmb: number
          created_at: string
          id: string
          purpose: string | null
          rate: number
          status: string
          user_id: string
        }
        Insert: {
          amount_ngn: number
          amount_rmb: number
          created_at?: string
          id?: string
          purpose?: string | null
          rate: number
          status?: string
          user_id: string
        }
        Update: {
          amount_ngn?: number
          amount_rmb?: number
          created_at?: string
          id?: string
          purpose?: string | null
          rate?: number
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      shipment_events: {
        Row: {
          id: string
          note: string | null
          occurred_at: string
          shipment_id: string
          stage: string
        }
        Insert: {
          id?: string
          note?: string | null
          occurred_at?: string
          shipment_id: string
          stage: string
        }
        Update: {
          id?: string
          note?: string | null
          occurred_at?: string
          shipment_id?: string
          stage?: string
        }
        Relationships: [
          {
            foreignKeyName: "shipment_events_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments"
            referencedColumns: ["id"]
          },
        ]
      }
      shipments: {
        Row: {
          cbm: number | null
          created_at: string
          description: string
          eta: string | null
          id: string
          mode: string
          origin: string
          pickup_city: string
          status: string
          updated_at: string
          user_id: string | null
          waybill: string
          weight_kg: number | null
        }
        Insert: {
          cbm?: number | null
          created_at?: string
          description: string
          eta?: string | null
          id?: string
          mode?: string
          origin?: string
          pickup_city?: string
          status?: string
          updated_at?: string
          user_id?: string | null
          waybill: string
          weight_kg?: number | null
        }
        Update: {
          cbm?: number | null
          created_at?: string
          description?: string
          eta?: string | null
          id?: string
          mode?: string
          origin?: string
          pickup_city?: string
          status?: string
          updated_at?: string
          user_id?: string | null
          waybill?: string
          weight_kg?: number | null
        }
        Relationships: []
      }
      shipping_requests: {
        Row: {
          created_at: string
          email: string
          id: string
          item_details: string
          mode: string
          name: string
          phone: string
          pickup_city: string
          staff_notified: boolean
          status: string
          updated_at: string
          user_id: string | null
          weight_kg: number | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          item_details: string
          mode?: string
          name: string
          phone: string
          pickup_city?: string
          staff_notified?: boolean
          status?: string
          updated_at?: string
          user_id?: string | null
          weight_kg?: number | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          item_details?: string
          mode?: string
          name?: string
          phone?: string
          pickup_city?: string
          staff_notified?: boolean
          status?: string
          updated_at?: string
          user_id?: string | null
          weight_kg?: number | null
        }
        Relationships: []
      }
      status_events: {
        Row: {
          actor_id: string | null
          batch_id: string | null
          created_at: string
          id: string
          new_status: Database["public"]["Enums"]["order_status"]
          note: string | null
          old_status: Database["public"]["Enums"]["order_status"] | null
          order_id: string
          triggered_by: string
        }
        Insert: {
          actor_id?: string | null
          batch_id?: string | null
          created_at?: string
          id?: string
          new_status: Database["public"]["Enums"]["order_status"]
          note?: string | null
          old_status?: Database["public"]["Enums"]["order_status"] | null
          order_id: string
          triggered_by?: string
        }
        Update: {
          actor_id?: string | null
          batch_id?: string | null
          created_at?: string
          id?: string
          new_status?: Database["public"]["Enums"]["order_status"]
          note?: string | null
          old_status?: Database["public"]["Enums"]["order_status"] | null
          order_id?: string
          triggered_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "status_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      warehouse_arrivals: {
        Row: {
          claimed_at: string | null
          claimed_by: string | null
          created_at: string
          id: string
          imported_by: string | null
          photo_url: string | null
          tracking_key: string | null
          tracking_number: string
          updated_at: string
          warehouse_city: string | null
        }
        Insert: {
          claimed_at?: string | null
          claimed_by?: string | null
          created_at?: string
          id?: string
          imported_by?: string | null
          photo_url?: string | null
          tracking_key?: string | null
          tracking_number: string
          updated_at?: string
          warehouse_city?: string | null
        }
        Update: {
          claimed_at?: string | null
          claimed_by?: string | null
          created_at?: string
          id?: string
          imported_by?: string | null
          photo_url?: string | null
          tracking_key?: string | null
          tracking_number?: string
          updated_at?: string
          warehouse_city?: string | null
        }
        Relationships: []
      }
      warehouse_imports: {
        Row: {
          created_at: string
          file_name: string
          id: string
          imported_by: string
          matched_count: number
          row_count: number
          unmatched_count: number
          unmatched_tracking_numbers: string[]
        }
        Insert: {
          created_at?: string
          file_name: string
          id?: string
          imported_by: string
          matched_count?: number
          row_count?: number
          unmatched_count?: number
          unmatched_tracking_numbers?: string[]
        }
        Update: {
          created_at?: string
          file_name?: string
          id?: string
          imported_by?: string
          matched_count?: number
          row_count?: number
          unmatched_count?: number
          unmatched_tracking_numbers?: string[]
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_operate: { Args: { _user_id: string }; Returns: boolean }
      can_warehouse: { Args: { _user_id: string }; Returns: boolean }
      generate_km_code: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
      is_super_admin: { Args: { _user_id?: string }; Returns: boolean }
      promote_to_super_admin: { Args: { _email: string }; Returns: Json }
      track_shipment: { Args: { _waybill: string }; Returns: Json }
    }
    Enums: {
      app_role: "super_admin" | "operations" | "warehouse" | "support"
      goods_type: "normal" | "special_hk" | "express"
      order_status:
        | "unavailable"
        | "in_warehouse"
        | "in_transit"
        | "arrived"
        | "payment_pending"
        | "payment_submitted"
        | "payment_confirmed"
        | "completed"
      payment_method: "manual_transfer" | "card_online"
      payment_status: "pending" | "confirmed" | "rejected"
      pickup_location: "lagos_ajao" | "lagos_tradefair" | "onitsha" | "kano"
      shipping_mode: "air" | "sea"
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
    Enums: {
      app_role: ["super_admin", "operations", "warehouse", "support"],
      goods_type: ["normal", "special_hk", "express"],
      order_status: [
        "unavailable",
        "in_warehouse",
        "in_transit",
        "arrived",
        "payment_pending",
        "payment_submitted",
        "payment_confirmed",
        "completed",
      ],
      payment_method: ["manual_transfer", "card_online"],
      payment_status: ["pending", "confirmed", "rejected"],
      pickup_location: ["lagos_ajao", "lagos_tradefair", "onitsha", "kano"],
      shipping_mode: ["air", "sea"],
    },
  },
} as const
