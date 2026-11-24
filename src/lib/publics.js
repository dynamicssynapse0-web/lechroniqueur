import { cache } from 'react';
import { creerClientPublic } from './supabase/public';
import { rubriquesDepuisArticles } from './rubriques';
import { urlImage } from './images';

// Conservé pour les appelants existants ; l'implémentation vit dans `lib/images.js`
// afin de pouvoir être importée depuis un composant client sans charger Supabase.
export { urlImage };

const COLONNES_LISTE =
  'id, titre, slug, resume, categorie, image_path, image_alt, publie_le, auteur_id';

// Les articles ne stockent pas le nom ni l'avatar : auteur_id relie la ligne à
// la table `journalistes` (le même UUID que `profiles` pour le compte auteur).
async function ajouterAuteurs(supabase, articles) {
  const ids = [...new Set(articles.map((a) => a.auteur_id).filter(Boolean))];
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

// Rubriques du menu : on ne propose que celles qui ont au moins un article publié.
export async function lireRubriquesDisponibles() {
  const supabase = creerClientPublic();
  const { data, error } = await supabase
    .from('articles')
    .select('categorie')
    .eq('statut', 'publie');

  if (error || !data) return [];
  return rubriquesDepuisArticles(data);
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
