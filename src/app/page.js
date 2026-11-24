import Link from 'next/link';
import UneEtPile from '../components/UneEtPile';
import CarteArticle from '../components/CarteArticle';
import { lireArticlesPublies, urlImage } from '../lib/publics';
import { RUBRIQUES } from '../lib/rubriques';
import { urlPhoto } from '../lib/photos';
import { formaterDate } from '../lib/format';
import { nomComplet, initiales, lienJournaliste } from '../lib/journalistes';

export const revalidate = 60;

export const metadata = {
  alternates: { canonical: '/' },
};

// Nombre d'articles dans le bloc « à la une » (les suivants vont dans la grille).
const NB_UNE = 8;

function versVue(a) {
  const j = a.auteur;
  return {
    id: a.id,
    titre: a.titre,
    resume: a.resume,
    categorie: a.categorie,
    lien: `/article/${a.slug}`,
    imageUrl: urlImage(a.image_path),
    dateIso: a.publie_le,
    dateTexte: formaterDate(a.publie_le),
    auteurNom: j ? nomComplet(j) : 'Rédaction lechroniqueur',
    auteurMedia: j?.media || '',
    auteurLien: j ? lienJournaliste(j) : null,
    photoUrl: j ? urlPhoto(j.photo_path) : '',
    initiales: j ? initiales(j) : 'L',
  };
}

export default async function Accueil() {
  const articles = await lireArticlesPublies({ limite: 20 });
  const une = articles.slice(0, NB_UNE).map(versVue);
  const suite = articles.slice(NB_UNE);

  return (
    <section>
      <h1>Les articles de ceux qui font l’actualité</h1>

      <nav aria-label="Rubriques" className="rubriques">
        <ul>
          {RUBRIQUES.map((r) => (
            <li key={r.slug}>
              <Link href={`/rubrique/${r.slug}`}>{r.nom}</Link>
            </li>
          ))}
        </ul>
      </nav>

      {une.length === 0 && <p className="vide">Aucun article n’est publié pour le moment.</p>}

      {une.length > 0 && <UneEtPile articles={une} />}

      {suite.length > 0 && (
        <>
          <h2 className="titre-section">Derniers articles</h2>
          <div className="grille-articles">
            {suite.map((a) => (
              <CarteArticle key={a.id} article={a} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
