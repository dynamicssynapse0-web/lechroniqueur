import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

const PAGES_PROTEGEES = ['/admin', '/espace', '/profil', '/suivi'];

export async function updateSession(request) {
  let reponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesAEcrire, entetes) {
          cookiesAEcrire.forEach(({ name, value }) => request.cookies.set(name, value));
          reponse = NextResponse.next({ request });
          cookiesAEcrire.forEach(({ name, value, options }) =>
            reponse.cookies.set(name, value, options)
          );
          Object.entries(entetes ?? {}).forEach(([cle, valeur]) =>
            reponse.headers.set(cle, valeur)
          );
        },
      },
    }
  );

  // Rafraîchit la session si besoin. Ne rien placer entre la création du client et cet appel.
  const { data } = await supabase.auth.getClaims();
  const connecte = Boolean(data?.claims);

  const chemin = request.nextUrl.pathname;
  const protegee = PAGES_PROTEGEES.some(
    (p) => chemin === p || chemin.startsWith(`${p}/`)
  );

  if (protegee && !connecte) {
    const url = request.nextUrl.clone();
    url.pathname = '/connexion';
    url.search = '';
    const redirection = NextResponse.redirect(url);
    reponse.cookies.getAll().forEach((c) => redirection.cookies.set(c));
    return redirection;
  }

  return reponse;
}