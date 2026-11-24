import { creerClientPublic } from '../lib/supabase/public';
import { RUBRIQUES } from '../lib/rubriques';

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

  const pages = ['', '/journalistes', '/a-propos', '/inscription'].map((p) => ({
    url: `${SITE}${p}`,
  }));
  const rubriques = RUBRIQUES.map((r) => ({ url: `${SITE}/rubrique/${r.slug}` }));
  const articles = (data ?? []).map((a) => ({
    url: `${SITE}/article/${a.slug}`,
    lastModified: new Date(a.updated_at),
  }));

  return [...pages, ...rubriques, ...articles];
}
