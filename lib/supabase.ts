import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const isValidSupabaseUrl = (value: string | undefined) => {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

const validSupabaseUrl = isValidSupabaseUrl(supabaseUrl) ? supabaseUrl : null;

export const supabase = validSupabaseUrl && supabaseKey
  ? createClient(validSupabaseUrl, supabaseKey)
  : null;