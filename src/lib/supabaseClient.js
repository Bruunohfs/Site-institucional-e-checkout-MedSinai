import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY; // Você usou supabaseKey aqui, o que está ótimo.

// A instância do cliente Supabase.
export const supabase = createClient(supabaseUrl, supabaseKey);
