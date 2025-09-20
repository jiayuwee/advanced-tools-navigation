// Supabase 数据库类型定义
export interface Database {
  public: {
    Tables: {
      // 工具表
      tools: {
        Row: {
          id: string;
          name: string;
          description: string;
          url: string;
          icon: string | null;
          category_id: string;
          is_featured: boolean;
          click_count: number;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          status: "active" | "inactive" | "pending";
          meta_title: string | null;
          meta_description: string | null;
          sort_order: number;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          url: string;
          icon?: string | null;
          category_id: string;
          is_featured?: boolean;
          click_count?: number;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          status?: "active" | "inactive" | "pending";
          meta_title?: string | null;
          meta_description?: string | null;
          sort_order?: number;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          url?: string;
          icon?: string | null;
          category_id?: string;
          is_featured?: boolean;
          click_count?: number;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          status?: "active" | "inactive" | "pending";
          meta_title?: string | null;
          meta_description?: string | null;
          sort_order?: number;
        };
      };

      // 分类表
      categories: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          icon: string;
          color: string;
          parent_id: string | null;
          sort_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          icon: string;
          color: string;
          parent_id?: string | null;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          icon?: string;
          color?: string;
          parent_id?: string | null;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };

      // 产品表
      products: {
        Row: {
          id: string;
          name: string;
          description: string;
          short_description: string | null;
          price: number;
          original_price: number | null;
          currency: string;
          category_id: string;
          images: string[];
          features: string[];
          demo_url: string | null;
          download_url: string | null;
          is_featured: boolean;
          is_digital: boolean;
          stock_quantity: number | null;
          status: "active" | "inactive" | "draft";
          created_at: string;
          updated_at: string;
          created_by: string;
          meta_title: string | null;
          meta_description: string | null;
          sort_order: number;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          short_description?: string | null;
          price: number;
          original_price?: number | null;
          currency?: string;
          category_id: string;
          images?: string[];
          features?: string[];
          demo_url?: string | null;
          download_url?: string | null;
          is_featured?: boolean;
          is_digital?: boolean;
          stock_quantity?: number | null;
          status?: "active" | "inactive" | "draft";
          created_at?: string;
          updated_at?: string;
          created_by: string;
          meta_title?: string | null;
          meta_description?: string | null;
          sort_order?: number;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          short_description?: string | null;
          price?: number;
          original_price?: number | null;
          currency?: string;
          category_id?: string;
          images?: string[];
          features?: string[];
          demo_url?: string | null;
          download_url?: string | null;
          is_featured?: boolean;
          is_digital?: boolean;
          stock_quantity?: number | null;
          status?: "active" | "inactive" | "draft";
          created_at?: string;
          updated_at?: string;
          created_by?: string;
          meta_title?: string | null;
          meta_description?: string | null;
          sort_order?: number;
        };
      };

      // 产品分类表
      product_categories: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          icon: string;
          color: string;
          parent_id: string | null;
          sort_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          icon: string;
          color: string;
          parent_id?: string | null;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          icon?: string;
          color?: string;
          parent_id?: string | null;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };

      // 用户资料表
      user_profiles: {
        Row: {
          id: string;
          email: string;
          username: string | null;
          full_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          website: string | null;
          location: string | null;
          role: "user" | "admin" | "super_admin";
          is_active: boolean;
          email_verified: boolean;
          created_at: string;
          updated_at: string;
          last_login_at: string | null;
        };
        Insert: {
          id: string;
          email: string;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          website?: string | null;
          location?: string | null;
          role?: "user" | "admin" | "super_admin";
          is_active?: boolean;
          email_verified?: boolean;
          created_at?: string;
          updated_at?: string;
          last_login_at?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          website?: string | null;
          location?: string | null;
          role?: "user" | "admin" | "super_admin";
          is_active?: boolean;
          email_verified?: boolean;
          created_at?: string;
          updated_at?: string;
          last_login_at?: string | null;
        };
      };

      // 收藏表
      favorites: {
        Row: {
          id: string;
          user_id: string;
          tool_id: string | null;
          product_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          tool_id?: string | null;
          product_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          tool_id?: string | null;
          product_id?: string | null;
          created_at?: string;
        };
      };

      // 订单表
      orders: {
        Row: {
          id: string;
          user_id: string;
          total_amount: number;
          currency: string;
          status: "pending" | "paid" | "cancelled" | "refunded";
          payment_method: string | null;
          payment_id: string | null;
          billing_address: {
            street: string;
            city: string;
            state: string;
            postal_code: string;
            country: string;
          } | null;
          created_at: string;
          updated_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          total_amount: number;
          currency?: string;
          status?: "pending" | "paid" | "cancelled" | "refunded";
          payment_method?: string | null;
          payment_id?: string | null;
          billing_address?: {
            street: string;
            city: string;
            state: string;
            postal_code: string;
            country: string;
          } | null;
          created_at?: string;
          updated_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          total_amount?: number;
          currency?: string;
          status?: "pending" | "paid" | "cancelled" | "refunded";
          payment_method?: string | null;
          payment_id?: string | null;
          billing_address?: {
            street: string;
            city: string;
            state: string;
            postal_code: string;
            country: string;
          } | null;
          created_at?: string;
          updated_at?: string;
          completed_at?: string | null;
        };
      };

      // 订单项表
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          quantity: number;
          unit_price: number;
          total_price: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          quantity: number;
          unit_price: number;
          total_price: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string;
          quantity?: number;
          unit_price?: number;
          total_price?: number;
          created_at?: string;
        };
      };

      // 支付表
      payments: {
        Row: {
          id: string;
          order_id: string;
          amount: number;
          currency: string;
          payment_method: string;
          payment_provider: string | null;
          provider_payment_id: string | null;
          status: "pending" | "completed" | "failed" | "cancelled";
          created_at: string;
          updated_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          order_id: string;
          amount: number;
          currency?: string;
          payment_method: string;
          payment_provider?: string | null;
          provider_payment_id?: string | null;
          status?: "pending" | "completed" | "failed" | "cancelled";
          created_at?: string;
          updated_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          order_id?: string;
          amount?: number;
          currency?: string;
          payment_method?: string;
          payment_provider?: string | null;
          provider_payment_id?: string | null;
          status?: "pending" | "completed" | "failed" | "cancelled";
          created_at?: string;
          updated_at?: string;
          completed_at?: string | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
