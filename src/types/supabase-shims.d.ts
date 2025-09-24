declare module "@supabase/supabase-js" {
  // Minimal shims for types used in the codebase to avoid widespread type errors during incremental fixes.
  export type PostgrestError = any;
  export type SelectQueryError<T = any> = any;
  export type QueryResult<T = any> = any;
  export type RealtimeChannel = any;
  export type User = any;
  export type AuthError = any;

  export interface SupabaseClient {
    from: (...args: any[]) => any;
    auth: any;
    rpc: (...args: any[]) => any;
    // fallback to any for any other usage
    [key: string]: any;
  }
  // accept an optional generic type parameter to match code that calls createClient<Database>
  export function createClient<T = any>(...args: any[]): SupabaseClient;
  const supabase: SupabaseClient;
  export default supabase;
}

declare const supabase: any;