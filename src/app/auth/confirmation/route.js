import { NextResponse } from 'next/server';
import { creerClientServeur } from '../../../lib/supabase/serveur';

const TYPES_AUTORISES = ['email', 'signup', 'recovery'];

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type');

  if (tokenHash && TYPES_AUTORISES.includes(type)) {
    const supabase = await creerClientServeur();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });

    if (!error) {
      const suite = type === 'recovery' ? '/nouveau-mot-de-passe' : '/suivi';
      return NextResponse.redirect(`${origin}${suite}`);
    }
  }

  return NextResponse.redirect(`${origin}/connexion?erreur=lien`);
}