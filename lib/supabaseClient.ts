import { createClient } from '@supabase/supabase-js';

// Vite injects env variables into `import.meta.env`.
// If this code runs in a browser without a build step (e.g., opening `index.html` directly),
// `import.meta.env` will be undefined, causing a crash.
const env = (import.meta as any).env;

if (!env) {
    throw new Error(
        'Vite environment variables not found. This app must be run via the Vite development server (`npm run dev`) or after being built (`npm run build`).'
    );
}

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase environment variables VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are required. Please check your .env file or Vercel configuration.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);