// 占位文件：使用命令生成正式类型
// supabase gen types typescript --project-id <YOUR_PROJECT_ID> > src/types/database.ts
export interface Database {
  public: {
    Tables: {
      favorites: {
        Row: {
          id: string;
          user_id: string;
          tool_id: string | null;
          product_id: string | null;
          created_at: string;
        };
        Insert: {
          user_id: string;
          tool_id?: string | null;
          product_id?: string | null;
        };
      };
      tools: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          url: string;
          icon: string | null;
          category_id: string;
          click_count: number;
          is_featured: boolean;
          status: string;
          created_at: string;
          updated_at: string | null;
          created_by: string | null;
          meta_title: string | null;
          meta_description: string | null;
          sort_order: number | null;
        };
      };
      products: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          short_description: string | null;
          price: number | null;
          original_price: number | null;
          currency: string | null;
          category_id: string;
          is_featured: boolean;
          is_digital: boolean;
          stock_quantity: number | null;
          status: string;
          created_at: string;
          updated_at: string | null;
          created_by: string | null;
          meta_title: string | null;
          meta_description: string | null;
          sort_order: number | null;
          images?: string[] | null;
          features?: string[] | null;
          demo_url?: string | null;
          download_url?: string | null;
        };
      };
    };
  };
}
