import { creerClientPublic } from '../lib/supabase/public';
import { RUBRIQUES } from '../lib/rubriques';
import { lienJournaliste } from '../lib/journalistes';

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

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
  ].map((p) => ({ url: `${SITE}${p}` }));
  const rubriques = RUBRIQUES.map((r) => ({ url: `${SITE}/rubrique/${r.slug}` }));
  const articles = (data ?? []).map((a) => ({
    url: `${SITE}/article/${a.slug}`,
    lastModified: new Date(a.updated_at),
  }));
  const profils = (journalistes ?? []).map((j) => ({
    url: `${SITE}${lienJournaliste(j)}`,
  }));

  return [...pages, ...rubriques, ...articles, ...profils];
}
