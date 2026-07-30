import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wbfelwheluldhkffltun.supabase.co';
// WARNING: Please provide your SUPABASE_ANON_KEY in your environment variables.
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);
