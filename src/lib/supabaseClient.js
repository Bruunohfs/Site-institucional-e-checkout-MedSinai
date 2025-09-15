// src/lib/supabaseClient.js

import { createClient } from '@supabase/supabase-js';

// Pega as variáveis de ambiente
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Cria e exporta a ÚNICA instância do cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseKey, {
 functions: { __is_local: false }
});