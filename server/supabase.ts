import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.warn('[SERVER] Supabase admin credentials (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) não configuradas. Usando modo local JSON.');
}

// Para evitar erro do construtor no Vite/Node quando não há variáveis de ambiente configuradas,
// injetamos strings vazias válidas ou placeholders. As rotas verificam isSupabaseConfigured antes de usar.
export const supabaseAdmin = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseServiceRoleKey || 'placeholder_key', 
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
