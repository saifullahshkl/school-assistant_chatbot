import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,  // <-- Reads from .env
  import.meta.env.VITE_SUPABASE_ANON_KEY // <-- Reads from .env
);
