import AccueilFiltre from '../components/AccueilFiltre';
import { lireArticlesPublies } from '../lib/publics';
import { urlImage } from '../lib/images';
import { rubriquesDepuisArticles } from '../lib/rubriques';
import { formaterDate } from '../lib/format';
import { auteurAffichage, extrait, normaliser } from '../lib/journalistes';

export const revalidate = 60;

export const metadata = {
  alternates: { canonical: '/' },
};

// Assez pour alimenter le fil continu avec l’ensemble des articles publiés.
const LIMITE_ARTICLES = 500;

function versVue(a) {
  const j = a.auteur;
  const auteur = auteurAffichage(j);
  return {
    ...a,
    extrait: extrait(a.resume, 110),
    lien: `/article/${a.slug}`,
    imageUrl: urlImage(a.image_path),
    dateTexte: formaterDate(a.publie_le),
    auteurNom: auteur.nom,
    auteurMedia: j?.media || '',
    auteurLien: auteur.lien,
    photoUrl: auteur.photoUrl,
    initiales: auteur.initiales,
    recherche: normaliser(
      [a.titre, a.resume, a.categorie, auteur.nom, j?.media || ''].join(' ')
    ),
  };
}

export default async function Accueil() {
  const articles = await lireArticlesPublies({ limite: LIMITE_ARTICLES });
  const vues = articles.map(versVue);
  const rubriques = rubriquesDepuisArticles(articles);

  return (
    <section id="articles">
      <h1>Les articles de ceux qui font l’actualité</h1>

      {vues.length === 0 ? (
        <p className="vide">Aucun article n’est publié pour le moment.</p>
      ) : (
        <AccueilFiltre articles={vues} rubriques={rubriques} />
      )}
    </section>
  );
}
