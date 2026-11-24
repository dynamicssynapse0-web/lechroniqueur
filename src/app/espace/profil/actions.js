'use server';

import { revalidatePath } from 'next/cache';
import { creerClientServeur } from '../../../lib/supabase/serveur';

const texte = (v) => (typeof v === 'string' ? v.replace(/\r\n/g, '\n').trim() : '');
const FORME_PHOTO = /^[0-9a-f-]{36}\/[0-9a-f-]{36}\.(jpg|png|webp)$/i;

export async function enregistrerProfil(valeurs) {
  const bio = texte(valeurs?.bio);
  const ville = texte(valeurs?.ville);
  const pays = texte(valeurs?.pays);
  const photoPath = texte(valeurs?.photoPath);

  if (bio.length > 500) {
    return { erreur: 'La biographie ne doit pas dépasser 500 caractères.' };
  }
  if (ville.length < 2 || ville.length > 80) {
    return { erreur: 'Indiquez une ville valide.' };
  }
  if (pays.length < 2 || pays.length > 80) {
    return { erreur: 'Choisissez un pays valide.' };
  }
  if (photoPath && !FORME_PHOTO.test(photoPath)) {
    return { erreur: 'La photo envoyée n’est pas valide.' };
  }

  const supabase = await creerClientServeur();
  const { data: session } = await supabase.auth.getClaims();
  const utilisateurId = session?.claims?.sub;
  if (!utilisateurId) {
    return { erreur: 'Votre session a expiré. Reconnectez-vous.' };
  }
  if (photoPath && !photoPath.startsWith(`${utilisateurId}/`)) {
    return { erreur: 'La photo envoyée n’est pas valide.' };
  }

  // On retient l'ancienne photo pour la supprimer une fois la nouvelle enregistrée.
  let ancienne = '';
  if (photoPath) {
    const { data } = await supabase
      .from('profiles')
      .select('photo_path')
      .eq('id', utilisateurId)
      .maybeSingle();
    ancienne = data?.photo_path ?? '';
  }

  const { error } = await supabase.rpc('modifier_mon_profil', {
    p_bio: bio,
    p_ville: ville,
    p_pays: pays,
    p_photo: photoPath || null,
  });
  if (error) {
    return { erreur: 'L’enregistrement a échoué. Réessayez dans un instant.' };
  }

  // Seules les photos du dossier personnel peuvent être supprimées par leur auteur.
  if (ancienne && ancienne !== photoPath && ancienne.startsWith(`${utilisateurId}/`)) {
    await supabase.storage.from('photos-profil').remove([ancienne]);
  }

  // Les pages publiques et le menu des rubriques se mettent à jour tout de suite.
  revalidatePath('/', 'layout');
  revalidatePath('/journalistes');
  revalidatePath('/journalistes/[slug]', 'page');
  revalidatePath('/article/[slug]', 'page');
  revalidatePath('/rubrique/[slug]', 'page');

  return { ok: true };
}
