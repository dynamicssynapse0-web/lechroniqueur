import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function creerClientServeur() {
  const magasin = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return magasin.getAll();
        },
        setAll(cookiesAEcrire) {
          try {
            cookiesAEcrire.forEach(({ name, value, options }) =>
              magasin.set(name, value, options)
            );
          } catch {
            // Appelé depuis un composant serveur : le proxy s'en charge.
          }
        },
      },
    }
  );
}