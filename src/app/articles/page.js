import Accueil from '../page';

export const revalidate = 60;

export const metadata = {
  title: 'Tous les articles',
  alternates: { canonical: '/articles' },
};

// L'accueil est déjà le fil complet des publications : /articles en est l'alias
// public référencé dans le sitemap.
export default function Articles() {
  return <Accueil />;
}
