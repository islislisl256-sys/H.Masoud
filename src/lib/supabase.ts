import { createClient, SupabaseClient } from '@supabase/supabase-js';

const mainUrl = 'https://wbfelwheluldhkffltun.supabase.co';
// WARNING: Please provide your SUPABASE_ANON_KEY in your environment variables.
const mainKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const mainSupabase = createClient(mainUrl, mainKey);

let customSupabaseClient: SupabaseClient | null = null;

export const initDynamicSupabase = (url: string | null, key: string | null) => {
  if (url && key) {
    customSupabaseClient = createClient(url, key);
  } else {
    customSupabaseClient = null;
  }
};

// Auto-init on load if running in browser
if (typeof window !== 'undefined') {
  try {
     const customUrl = localStorage.getItem('custom_db_url');
     const customKey = localStorage.getItem('custom_db_key');
     if (customUrl && customKey) {
        customSupabaseClient = createClient(customUrl, customKey);
     }
  } catch(e) {}
}

// Proxy object that acts exactly like a Supabase client, but forwards all calls to the appropriate client
export const supabase = new Proxy({}, {
  get(target, prop) {
    const activeClient = customSupabaseClient || mainSupabase;
    const value = (activeClient as any)[prop];
    
    if (typeof value === 'function') {
      return value.bind(activeClient);
    }
    return value;
  }
}) as SupabaseClient;
