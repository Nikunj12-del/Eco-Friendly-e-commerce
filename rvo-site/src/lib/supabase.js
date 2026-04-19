import { createClient } from '@supabase/supabase-js';

// 1. Pull the keys using Vite's specific syntax
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 2. Initialize the client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);