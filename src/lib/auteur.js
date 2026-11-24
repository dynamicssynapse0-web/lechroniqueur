import { redirect } from 'next/navigation';
import { NOM_REDACTION } from './journalistes';
import { creerClientServeur } from './supabase/serveur';

// Réserve une page aux comptes « actifs » et aux administrateurs.
export async function exigerAuteurActif() {
  const supabase = await creerClientServeur();
  const { data: session } = await supabase.auth.getClaims();
  const utilisateurId = session?.claims?.sub;
  if (!utilisateurId) redirect('/connexion');

  const { data: profil } = await supabase
    .from('profiles')
    .select('prenom, nom, media, statut, role')
    .eq('id', utilisateurId)
    .maybeSingle();

  if (!profil) redirect('/connexion');
  // Un admin peut rédiger même si son statut de journaliste n’est pas « actif ».
  if (profil.role !== 'admin' && profil.statut !== 'actif') {
    redirect(profil.statut === 'accepte' ? '/profil' : '/suivi');
  }

  const nom = `${profil.prenom} ${profil.nom}`.trim() || NOM_REDACTION;
  return { supabase, utilisateurId, auteur: { nom, media: profil.media } };
}