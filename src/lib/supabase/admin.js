import { createClient } from '@supabase/supabase-js';

// Client réservé au serveur : la clé de service ne doit jamais être exposée au navigateur.
// Renvoie null si la variable n'est pas définie (les notifications restent alors possibles
// par email, mais le numéro WhatsApp ne peut pas être relu depuis auth.users).
export function creerClientAdmin() {
  const cle = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!cle) return null;

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    cle,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
