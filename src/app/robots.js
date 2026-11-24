import { SITE_URL } from '../lib/site-url';

export default function robots() {
  return {
    rules: [
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/admin', '/espace', '/auth/'],
      },
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/espace', '/auth/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
