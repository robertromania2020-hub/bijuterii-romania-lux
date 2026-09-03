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
      addresses: {
        Row: {
          additional_information: string | null
          apartment: string | null
          building: string | null
          city: string
          country: string
          county: string
          created_at: string
          entrance: string | null
          first_name: string
          floor: string | null
          id: string
          is_default: boolean
          label: string
          last_name: string
          phone: string
          postal_code: string
          recipient: string
          street: string
          street_number: string
          updated_at: string
          user_id: string
        }
        Insert: {
          additional_information?: string | null
          apartment?: string | null
          building?: string | null
          city?: string
          country?: string
          county?: string
          created_at?: string
          entrance?: string | null
          first_name?: string
          floor?: string | null
          id?: string
          is_default?: boolean
          label?: string
          last_name?: string
          phone?: string
          postal_code?: string
          recipient?: string
          street?: string
          street_number?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          additional_information?: string | null
          apartment?: string | null
          building?: string | null
          city?: string
          country?: string
          county?: string
          created_at?: string
          entrance?: string | null
          first_name?: string
          floor?: string | null
          id?: string
          is_default?: boolean
          label?: string
          last_name?: string
          phone?: string
          postal_code?: string
          recipient?: string
          street?: string
          street_number?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      attribute_definitions: {
        Row: {
          category_slugs: Json
          created_at: string
          department_slug: string | null
          filterable: boolean
          id: string
          key: string
          label: string
          options: Json
          position: number
          show_on_product: boolean
          type: string
          unit: string | null
          updated_at: string
        }
        Insert: {
          category_slugs?: Json
          created_at?: string
          department_slug?: string | null
          filterable?: boolean
          id: string
          key: string
          label: string
          options?: Json
          position?: number
          show_on_product?: boolean
          type?: string
          unit?: string | null
          updated_at?: string
        }
        Update: {
          category_slugs?: Json
          created_at?: string
          department_slug?: string | null
          filterable?: boolean
          id?: string
          key?: string
          label?: string
          options?: Json
          position?: number
          show_on_product?: boolean
          type?: string
          unit?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      brands: {
        Row: {
          active: boolean
          created_at: string
          id: string
          logo: string | null
          name: string
          position: number
          slug: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id: string
          logo?: string | null
          name: string
          position?: number
          slug: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          logo?: string | null
          name?: string
          position?: number
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          active: boolean
          created_at: string
          department_slug: string
          id: string
          image: string
          name: string
          position: number
          seo_description: string | null
          seo_title: string | null
          slug: string
          tone: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          department_slug: string
          id: string
          image?: string
          name: string
          position?: number
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          tone?: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          department_slug?: string
          id?: string
          image?: string
          name?: string
          position?: number
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          tone?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_department_slug_fkey"
            columns: ["department_slug"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["slug"]
          },
        ]
      }
      collections: {
        Row: {
          active: boolean
          created_at: string
          department_slug: string | null
          description: string
          id: string
          image: string
          name: string
          position: number
          slug: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          department_slug?: string | null
          description?: string
          id: string
          image?: string
          name: string
          position?: number
          slug: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          department_slug?: string | null
          description?: string
          id?: string
          image?: string
          name?: string
          position?: number
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "collections_department_slug_fkey"
            columns: ["department_slug"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["slug"]
          },
        ]
      }
      departments: {
        Row: {
          active: boolean
          created_at: string
          description: string
          id: string
          image: string
          name: string
          position: number
          seo_description: string | null
          seo_title: string | null
          slug: string
          tone: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string
          id: string
          image?: string
          name: string
          position?: number
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          tone?: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string
          id?: string
          image?: string
          name?: string
          position?: number
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          tone?: string
          updated_at?: string
        }
        Relationships: []
      }
      discounts: {
        Row: {
          active: boolean
          ends_at: string
          id: string
          name: string
          starts_at: string
          target_slug: string
          target_type: string
          type: string
          updated_at: string
          value: number
        }
        Insert: {
          active?: boolean
          ends_at?: string
          id: string
          name: string
          starts_at?: string
          target_slug: string
          target_type: string
          type?: string
          updated_at?: string
          value?: number
        }
        Update: {
          active?: boolean
          ends_at?: string
          id?: string
          name?: string
          starts_at?: string
          target_slug?: string
          target_type?: string
          type?: string
          updated_at?: string
          value?: number
        }
        Relationships: []
      }
      inventory_history: {
        Row: {
          changed_by: string | null
          created_at: string
          id: string
          new_quantity: number
          previous_quantity: number
          product_id: string | null
          quantity_change: number
          reason: string
          reference_id: string | null
          reference_type: string | null
          variant_id: string | null
        }
        Insert: {
          changed_by?: string | null
          created_at?: string
          id?: string
          new_quantity?: number
          previous_quantity?: number
          product_id?: string | null
          quantity_change?: number
          reason?: string
          reference_id?: string | null
          reference_type?: string | null
          variant_id?: string | null
        }
        Update: {
          changed_by?: string | null
          created_at?: string
          id?: string
          new_quantity?: number
          previous_quantity?: number
          product_id?: string | null
          quantity_change?: number
          reason?: string
          reference_id?: string | null
          reference_type?: string | null
          variant_id?: string | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          department_slug: string
          discount_amount: number
          id: string
          order_id: string
          product_id: string | null
          product_image_snapshot: string | null
          product_name_snapshot: string
          quantity: number
          sku_snapshot: string
          total: number
          unit_price: number
          variant_id: string | null
          variant_name_snapshot: string | null
        }
        Insert: {
          created_at?: string
          department_slug?: string
          discount_amount?: number
          id?: string
          order_id: string
          product_id?: string | null
          product_image_snapshot?: string | null
          product_name_snapshot: string
          quantity?: number
          sku_snapshot?: string
          total?: number
          unit_price?: number
          variant_id?: string | null
          variant_name_snapshot?: string | null
        }
        Update: {
          created_at?: string
          department_slug?: string
          discount_amount?: number
          id?: string
          order_id?: string
          product_id?: string | null
          product_image_snapshot?: string | null
          product_name_snapshot?: string
          quantity?: number
          sku_snapshot?: string
          total?: number
          unit_price?: number
          variant_id?: string | null
          variant_name_snapshot?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_status_history: {
        Row: {
          changed_by: string | null
          created_at: string
          id: string
          new_status: string
          note: string | null
          old_status: string | null
          order_id: string
        }
        Insert: {
          changed_by?: string | null
          created_at?: string
          id?: string
          new_status: string
          note?: string | null
          old_status?: string | null
          order_id: string
        }
        Update: {
          changed_by?: string | null
          created_at?: string
          id?: string
          new_status?: string
          note?: string | null
          old_status?: string | null
          order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_status_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          admin_notes: string | null
          awb: string | null
          city: string
          county: string
          coupon_code: string | null
          created_at: string
          customer_email: string
          customer_name: string
          customer_notes: string | null
          customer_phone: string
          discount: number
          id: string
          items: Json
          notes: string | null
          number: string
          paid_at: string | null
          payment_method: string
          payment_status: string
          refund_status: string
          refunded_amount: number
          shipping: number
          shipping_address: Json
          status: string
          stripe_checkout_session_id: string | null
          stripe_payment_intent_id: string | null
          stripe_refund_id: string | null
          subtotal: number
          total: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          awb?: string | null
          city?: string
          county?: string
          coupon_code?: string | null
          created_at?: string
          customer_email: string
          customer_name: string
          customer_notes?: string | null
          customer_phone?: string
          discount?: number
          id: string
          items?: Json
          notes?: string | null
          number: string
          paid_at?: string | null
          payment_method?: string
          payment_status?: string
          refund_status?: string
          refunded_amount?: number
          shipping?: number
          shipping_address?: Json
          status?: string
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_refund_id?: string | null
          subtotal?: number
          total?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          awb?: string | null
          city?: string
          county?: string
          coupon_code?: string | null
          created_at?: string
          customer_email?: string
          customer_name?: string
          customer_notes?: string | null
          customer_phone?: string
          discount?: number
          id?: string
          items?: Json
          notes?: string | null
          number?: string
          paid_at?: string | null
          payment_method?: string
          payment_status?: string
          refund_status?: string
          refunded_amount?: number
          shipping?: number
          shipping_address?: Json
          status?: string
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_refund_id?: string | null
          subtotal?: number
          total?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      product_attribute_values: {
        Row: {
          attribute_key: string
          created_at: string
          id: string
          product_id: string
          value: Json
        }
        Insert: {
          attribute_key: string
          created_at?: string
          id?: string
          product_id: string
          value: Json
        }
        Update: {
          attribute_key?: string
          created_at?: string
          id?: string
          product_id?: string
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "product_attribute_values_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          alt: string | null
          created_at: string
          id: string
          is_primary: boolean
          position: number
          product_id: string
          storage_path: string | null
          updated_at: string
          url: string
        }
        Insert: {
          alt?: string | null
          created_at?: string
          id?: string
          is_primary?: boolean
          position?: number
          product_id: string
          storage_path?: string | null
          updated_at?: string
          url: string
        }
        Update: {
          alt?: string | null
          created_at?: string
          id?: string
          is_primary?: boolean
          position?: number
          product_id?: string
          storage_path?: string | null
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          active: boolean
          attribute_label: string
          created_at: string
          id: string
          image: string | null
          label: string
          min_stock: number
          position: number
          price: number | null
          product_id: string
          sku: string
          stock: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          attribute_label?: string
          created_at?: string
          id: string
          image?: string | null
          label: string
          min_stock?: number
          position?: number
          price?: number | null
          product_id: string
          sku?: string
          stock?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          attribute_label?: string
          created_at?: string
          id?: string
          image?: string | null
          label?: string
          min_stock?: number
          position?: number
          price?: number | null
          product_id?: string
          sku?: string
          stock?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          brand_slug: string | null
          category_slug: string
          collection_slug: string | null
          created_at: string
          department_slug: string
          description: string
          id: string
          is_bestseller: boolean
          is_featured: boolean
          is_new: boolean
          min_stock: number
          name: string
          old_price: number | null
          popularity: number
          price: number
          seo_description: string | null
          seo_title: string | null
          sku: string
          slug: string
          status: string
          stock: number
          updated_at: string
        }
        Insert: {
          brand_slug?: string | null
          category_slug: string
          collection_slug?: string | null
          created_at?: string
          department_slug: string
          description?: string
          id: string
          is_bestseller?: boolean
          is_featured?: boolean
          is_new?: boolean
          min_stock?: number
          name: string
          old_price?: number | null
          popularity?: number
          price?: number
          seo_description?: string | null
          seo_title?: string | null
          sku: string
          slug: string
          status?: string
          stock?: number
          updated_at?: string
        }
        Update: {
          brand_slug?: string | null
          category_slug?: string
          collection_slug?: string | null
          created_at?: string
          department_slug?: string
          description?: string
          id?: string
          is_bestseller?: boolean
          is_featured?: boolean
          is_new?: boolean
          min_stock?: number
          name?: string
          old_price?: number | null
          popularity?: number
          price?: number
          seo_description?: string | null
          seo_title?: string | null
          sku?: string
          slug?: string
          status?: string
          stock?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_brand_fk"
            columns: ["brand_slug"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["slug"]
          },
          {
            foreignKeyName: "products_category_fk"
            columns: ["category_slug"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["slug"]
          },
          {
            foreignKeyName: "products_collection_fk"
            columns: ["collection_slug"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["slug"]
          },
          {
            foreignKeyName: "products_department_fk"
            columns: ["department_slug"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["slug"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          phone: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          phone?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          phone?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      stripe_events: {
        Row: {
          created_at: string
          id: string
          order_id: string | null
          type: string
        }
        Insert: {
          created_at?: string
          id: string
          order_id?: string | null
          type: string
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string | null
          type?: string
        }
        Relationships: []
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      adjust_stock: {
        Args: {
          p_new_quantity: number
          p_product_id: string
          p_reason?: string
          p_variant_id: string
        }
        Returns: number
      }
      admin_customers: {
        Args: never
        Returns: {
          created_at: string
          email: string
          first_name: string
          last_name: string
          last_order_at: string
          orders_count: number
          phone: string
          total_spent: number
          user_id: string
        }[]
      }
      apply_stripe_payment_event: {
        Args: {
          p_event_id: string
          p_event_type: string
          p_order_id: string
          p_outcome: string
          p_payment_intent_id?: string
          p_session_id?: string
        }
        Returns: Json
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      place_order: {
        Args: {
          p_coupon_code?: string
          p_customer: Json
          p_customer_notes?: string
          p_items: Json
          p_payment_method?: string
          p_shipping: Json
        }
        Returns: Json
      }
      set_order_status: {
        Args: { p_note?: string; p_order_id: string; p_status: string }
        Returns: undefined
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
      app_role: ["admin", "user"],
    },
  },
} as const
