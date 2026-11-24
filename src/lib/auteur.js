import { redirect } from 'next/navigation';
import { creerClientServeur } from './supabase/serveur';

// Réserve une page aux comptes « actifs » et renvoie les infos de l’auteur.
export async function exigerAuteurActif() {
  const supabase = await creerClientServeur();
  const { data: session } = await supabase.auth.getClaims();
  const utilisateurId = session?.claims?.sub;
  if (!utilisateurId) redirect('/connexion');

  const { data: profil } = await supabase
    .from('profiles')
    .select('prenom, nom, media, statut')
    .eq('id', utilisateurId)
    .maybeSingle();

  if (!profil) redirect('/connexion');
  if (profil.statut !== 'actif') redirect(profil.statut === 'accepte' ? '/profil' : '/suivi');

  const nom = `${profil.prenom} ${profil.nom}`.trim() || 'Rédaction lechroniqueur';
  return { supabase, utilisateurId, auteur: { nom, media: profil.media } };
}