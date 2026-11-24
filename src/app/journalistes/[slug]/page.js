import { notFound, permanentRedirect } from 'next/navigation';
import Link from 'next/link';
import Avatar from '../../../components/Avatar';
import CarteArticle from '../../../components/CarteArticle';
import { lireJournaliste, lireArticlesDe } from '../../../lib/profils';
import {
  nomComplet,
  initiales,
  lieu,
  extrait,
  lienJournaliste,
  idDepuisParam,
} from '../../../lib/journalistes';
import { urlPhoto } from '../../../lib/photos';
import { SITE_URL } from '../../../lib/site-url';
import './profil.css';

export const revalidate = 60;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const id = idDepuisParam(slug);
  if (!id) return {};

  const j = await lireJournaliste(id);
  if (!j) return {};

  const nom = nomComplet(j);
  const photo = urlPhoto(j.photo_path);
  const description = j.bio
    ? extrait(j.bio, 155)
    : `Découvrez les articles de ${nom}${j.media ? `, journaliste à ${j.media}` : ''}${
        lieu(j) ? ` (${lieu(j)})` : ''
      } sur lechroniqueur.`;

  return {
    title: j.media ? `${nom}, journaliste à ${j.media}` : `${nom}, journaliste`,
    description,
    alternates: { canonical: lienJournaliste(j) },
    openGraph: {
      type: 'profile',
      siteName: 'lechroniqueur',
      locale: 'fr_FR',
      title: nom,
      description,
      url: lienJournaliste(j),
      images: photo ? [{ url: photo, alt: nom }] : undefined,
    },
  };
}

export default async function ProfilJournaliste({ params }) {
  const { slug } = await params;
  const id = idDepuisParam(slug);
  if (!id) notFound();

  const j = await lireJournaliste(id);
  if (!j) notFound();

  // Une seule adresse par profil : on corrige un nom mal écrit dans l'adresse.
  const canonique = lienJournaliste(j);
  if (`/journalistes/${slug}` !== canonique) permanentRedirect(canonique);

  const nom = nomComplet(j);
  const photo = urlPhoto(j.photo_path);
  const articles = (await lireArticlesDe(id)).map((a) => ({ ...a, auteur: j }));

  const donnees = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: nom,
    jobTitle: 'Journaliste',
    description: j.bio || undefined,
    image: photo || undefined,
    url: `${SITE_URL}${canonique}`,
    worksFor: j.media ? { '@type': 'Organization', name: j.media } : undefined,
    address:
      j.ville || j.pays
        ? {
            '@type': 'PostalAddress',
            addressLocality: j.ville || undefined,
            addressCountry: j.pays || undefined,
          }
        : undefined,
  };

  return (
    <section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(donnees).replace(/</g, '\\u003c') }}
      />

      <Link href="/journalistes" className="retour">← Tous les journalistes</Link>

      <header className="profil-tete">
        <Avatar taille="xl" photoUrl={photo} initiales={initiales(j)} />
        <div>
          <h1>{nom}</h1>
          {j.media && <p className="profil-media">{j.media}</p>}
          {lieu(j) && <p className="profil-lieu">{lieu(j)}</p>}
          {j.bio && <p className="profil-bio">{j.bio}</p>}
        </div>
      </header>

      <h2 className="titre-section">
        {articles.length === 0
          ? 'Articles publiés'
          : articles.length === 1
            ? '1 article publié'
            : `${articles.length} articles publiés`}
      </h2>

      {articles.length === 0 ? (
        <p className="vide">Ce journaliste n’a pas encore publié d’article.</p>
      ) : (
        <div className="grille-articles">
          {articles.map((a) => (
            <CarteArticle key={a.id} article={a} sansAuteur />
          ))}
        </div>
      )}
    </section>
  );
}
