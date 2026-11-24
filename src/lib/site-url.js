// URL canonique utilisée par le sitemap, robots.txt, metadataBase et les JSON-LD.
// NEXT_PUBLIC_SITE_URL reste prioritaire, mais une URL Vercel (*.vercel.app) est
// ignorée : ce n’est pas le domaine public et cela casse l’indexation Google.
const brute = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.SITE_URL ||
  ''
).trim();

const domaineVercel = /\.vercel\.app(?:\/|$)/i.test(brute);
const source = domaineVercel ? '' : brute;

export const SITE_URL = (source || 'https://lechroniqueur.com').replace(/\/+$/, '');
