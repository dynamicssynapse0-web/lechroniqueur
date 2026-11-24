import { cache } from 'react';
import { creerClientPublic } from './supabase/public';

export const lireJournaliste = cache(async (id) => {
  const supabase = creerClientPublic();
  const { data } = await supabase
    .from('journalistes')
    .select('id, prenom, nom, media, ville, pays, bio, photo_path')
    .eq('id', id)
    .maybeSingle();
  return data ?? null;
});

export async function lireArticlesDe(id) {
  const supabase = creerClientPublic();
  const { data } = await supabase
    .from('articles')
    .select('id, titre, slug, resume, categorie, image_path, image_alt, publie_le, auteur_id')
    .eq('auteur_id', id)
    .eq('statut', 'publie')
    .order('publie_le', { ascending: false })
    .limit(48);
  return data ?? [];
}
