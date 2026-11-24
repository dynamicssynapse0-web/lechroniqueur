import { notFound } from 'next/navigation';
import Link from 'next/link';
import Avatar from '../../../components/Avatar';
import TexteArticle from '../../../components/TexteArticle';
import { lireArticle, urlImage } from '../../../lib/publics';
import { formaterDate, minutesLecture } from '../../../lib/format';
import { rubriqueParNom } from '../../../lib/rubriques';
import { auteurAffichage, lienJournaliste } from '../../../lib/journalistes';
import './article.css';

export const revalidate = 60;

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const SLUG_VALIDE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  if (!SLUG_VALIDE.test(slug)) return {};

  const article = await lireArticle(slug);
  if (!article) return {};

  const image = urlImage(article.image_path);
  const auteur = article.auteur;
  const nomAuteur = auteur ? `${auteur.prenom} ${auteur.nom}`.trim() : '';
  const urlAuteur = auteur ? `${SITE}${lienJournaliste(auteur)}` : '';

  return {
    title: article.titre,
    description: article.resume,
    alternates: { canonical: `/article/${article.slug}` },
    authors: nomAuteur ? [{ name: nomAuteur, url: urlAuteur }] : undefined,
    openGraph: {
      type: 'article',
      siteName: 'lechroniqueur',
      locale: 'fr_FR',
      title: article.titre,
      description: article.resume,
      url: `/article/${article.slug}`,
      publishedTime: article.publie_le,
      modifiedTime: article.updated_at,
      authors: urlAuteur ? [urlAuteur] : undefined,
      images: image ? [{ url: image, alt: article.image_alt || article.titre }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.titre,
      description: article.resume,
      images: image ? [image] : undefined,
    },
  };
}

export default async function PageArticle({ params }) {
  const { slug } = await params;
  if (!SLUG_VALIDE.test(slug)) notFound();

  const article = await lireArticle(slug);
  if (!article) notFound();

  const image = urlImage(article.image_path);
  const auteur = auteurAffichage(article.auteur);
  const nomAuteur = auteur.nom;
  const lienAuteur = auteur.lien;
  const photoAuteur = auteur.photoUrl;
  const initialesAuteur = auteur.initiales;
  const rubrique = rubriqueParNom(article.categorie);
  const minutes = minutesLecture(article.contenu);

  const donnees = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.titre,
    description: article.resume,
    image: image ? [image] : undefined,
    datePublished: article.publie_le,
    dateModified: article.updated_at,
    author: {
      '@type': 'Person',
      name: nomAuteur,
      url: lienAuteur ? `${SITE}${lienAuteur}` : undefined,
      image: photoAuteur || undefined,
    },
    publisher: { '@type': 'Organization', name: 'lechroniqueur' },
    mainEntityOfPage: `${SITE}/article/${article.slug}`,
    articleSection: article.categorie || undefined,
    inLanguage: 'fr',
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(donnees).replace(/</g, '\\u003c') }}
      />

      <article className="apercu-article article-public">
        {article.categorie && (
          <p className="rubrique">
            {rubrique ? <Link href={`/rubrique/${rubrique.slug}`}>{article.categorie}</Link> : article.categorie}
          </p>
        )}

        <h1>{article.titre}</h1>

        <div className="signature-bloc">
          <Avatar taille="m" photoUrl={photoAuteur} initiales={initialesAuteur} />
          <p className="signature">
            Par{' '}
            {lienAuteur ? <Link href={lienAuteur}>{nomAuteur}</Link> : nomAuteur}
            {auteur?.media ? `, ${auteur.media}` : ''} ·{' '}
            <time dateTime={article.publie_le}>{formaterDate(article.publie_le)}</time> ·{' '}
            {minutes} min de lecture
          </p>
        </div>

        {image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={article.image_alt || ''} fetchPriority="high" />
        )}

        <p className="chapeau">{article.resume}</p>

        <div className="texte">
          <TexteArticle contenu={article.contenu} />
        </div>

        {auteur && (
          <aside className="auteur-encadre" aria-label="À propos de l’auteur">
            <div className="auteur-ligne">
              <Avatar taille="l" photoUrl={photoAuteur} initiales={initialesAuteur} />
              <div>
                <p>
                  <strong>
                    <Link href={lienAuteur}>{nomAuteur}</Link>
                  </strong>
                  {auteur.media ? `, ${auteur.media}` : ''}
                  {auteur.ville || auteur.pays
                    ? ` · ${[auteur.ville, auteur.pays].filter(Boolean).join(', ')}`
                    : ''}
                </p>
                {auteur.bio && <p className="auteur-bio">{auteur.bio}</p>}
                <p>
                  <Link href={lienAuteur} className="auteur-lien">
                    Voir son profil et tous ses articles →
                  </Link>
                </p>
              </div>
            </div>
          </aside>
        )}
      </article>
    </>
  );
}
