import { creerClientPublic } from '../../lib/supabase/public';
import { RUBRIQUES } from '../../lib/rubriques';
import { lienJournaliste } from '../../lib/journalistes';
import { SITE_URL } from '../../lib/site-url';

// Le sitemap est régénéré au plus toutes les heures.
export const revalidate = 3600;

function echapperXml(texte) {
  return String(texte)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function entreeSitemap(chemin, dateMiseAJour) {
  const loc = echapperXml(encodeURI(`${SITE_URL}${chemin}`));
  const date = dateMiseAJour ? new Date(dateMiseAJour) : null;
  const lastmod =
    date && !Number.isNaN(date.getTime())
      ? `\n    <lastmod>${date.toISOString()}</lastmod>`
      : '';

  return `  <url>\n    <loc>${loc}</loc>${lastmod}\n  </url>`;
}

export async function GET() {
  const supabase = creerClientPublic();

  const { data: articles } = await supabase
    .from('articles')
    .select('slug, updated_at, publie_le')
    .eq('statut', 'publie')
    .order('publie_le', { ascending: false })
    .limit(5000);

  const { data: journalistes } = await supabase
    .from('journalistes')
    .select('id, prenom, nom')
    .limit(5000);

  const pages = [
    '',
    '/articles',
    '/journalistes',
    '/a-propos',
    '/contact',
    '/inscription',
    '/mentions-legales',
    '/confidentialite',
    '/conditions',
  ].map((chemin) => entreeSitemap(chemin));

  const rubriques = RUBRIQUES.map((rubrique) =>
    entreeSitemap(`/rubrique/${rubrique.slug}`)
  );

  const urlsArticles = (articles ?? []).map((article) =>
    entreeSitemap(
      `/article/${article.slug}`,
      article.updated_at ?? article.publie_le
    )
  );

  const profils = (journalistes ?? []).map((journaliste) =>
    entreeSitemap(lienJournaliste(journaliste))
  );

  const xml =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://sitemaps.org">\n' +
    [...pages, ...rubriques, ...urlsArticles, ...profils].join('\n') +
    '\n</urlset>\n';

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control':
        'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
