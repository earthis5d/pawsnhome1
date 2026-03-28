import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('Initializing Supabase client...');
console.log('URL:', supabaseUrl ? 'Set' : 'Missing');
console.log('Anon Key:', supabaseAnonKey ? 'Set' : 'Missing');
console.log('Anon Key starts with:', supabaseAnonKey?.substring(0, 15) + '...');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Anon Key is missing. Please check your environment variables.');
}

if (supabaseAnonKey && supabaseAnonKey.startsWith('sb_publishable_')) {
  console.warn('WARNING: The Supabase Anon Key provided appears to be a Stripe API key (starts with "sb_publishable_"). This will likely cause Supabase operations to fail.');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');
