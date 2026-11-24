import { creerClientPublic } from '../lib/supabase/public';
import { RUBRIQUES } from '../lib/rubriques';
import { lienJournaliste } from '../lib/journalistes';
import { SITE_URL } from '../lib/site-url';

export const revalidate = 3600;

export default async function sitemap() {
  const supabase = creerClientPublic();

  const { data } = await supabase
    .from('articles')
    .select('slug, updated_at')
    .eq('statut', 'publie')
    .order('publie_le', { ascending: false })
    .limit(5000);

  const { data: journalistes } = await supabase
    .from('journalistes')
    .select('id, prenom, nom')
    .limit(5000);

  const pages = [
    '',
    '/journalistes',
    '/a-propos',
    '/contact',
    '/inscription',
    '/mentions-legales',
    '/confidentialite',
    '/conditions',
  ].map((p) => ({ url: `${SITE_URL}${p}` }));
  const rubriques = RUBRIQUES.map((r) => ({ url: `${SITE_URL}/rubrique/${r.slug}` }));
  const articles = (data ?? []).map((a) => ({
    url: `${SITE_URL}/article/${a.slug}`,
    lastModified: new Date(a.updated_at),
  }));
  const profils = (journalistes ?? []).map((j) => ({
    url: `${SITE_URL}${lienJournaliste(j)}`,
  }));

  return [...pages, ...rubriques, ...articles, ...profils];
}
