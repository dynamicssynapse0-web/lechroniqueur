import { cache } from 'react';
import { creerClientPublic } from './supabase/public';

const COLONNES_LISTE =
  'id, titre, slug, resume, categorie, image_path, image_alt, publie_le, auteur_id';

export function urlImage(chemin) {
  return chemin
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/couvertures/${chemin}`
    : '';
}

async function ajouterAuteurs(supabase, articles) {
  const ids = [...new Set(articles.map((a) => a.auteur_id))];
  if (ids.length === 0) return articles.map((a) => ({ ...a, auteur: null }));

  const { data } = await supabase
    .from('journalistes')
    .select('id, prenom, nom, media, photo_path')
    .in('id', ids);

  const parId = Object.fromEntries((data ?? []).map((j) => [j.id, j]));
  return articles.map((a) => ({ ...a, auteur: parId[a.auteur_id] ?? null }));
}

export async function lireArticlesPublies({ limite = 12, categorie = null } = {}) {
  const supabase = creerClientPublic();
  let requete = supabase
    .from('articles')
    .select(COLONNES_LISTE)
    .eq('statut', 'publie')
    .order('publie_le', { ascending: false })
    .limit(limite);

  if (categorie) requete = requete.eq('categorie', categorie);

  const { data, error } = await requete;
  if (error || !data) return [];
  return ajouterAuteurs(supabase, data);
}

export const lireArticle = cache(async (slug) => {
  const supabase = creerClientPublic();
  const { data } = await supabase
    .from('articles')
    .select(`${COLONNES_LISTE}, contenu, updated_at`)
    .eq('slug', slug)
    .eq('statut', 'publie')
    .maybeSingle();

  if (!data) return null;

  const { data: auteur } = await supabase
    .from('journalistes')
    .select('id, prenom, nom, media, ville, pays, bio, photo_path')
    .eq('id', data.auteur_id)
    .maybeSingle();

  return { ...data, auteur: auteur ?? null };
});
