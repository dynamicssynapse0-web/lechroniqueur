import { createClient } from '@supabase/supabase-js';

// Client sans session : pour les pages publiques, mises en cache par Next.js.
export function creerClientPublic() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
