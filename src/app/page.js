import Link from 'next/link';
import Avatar from '../components/Avatar';
import CarteArticle from '../components/CarteArticle';
import FilPublications from '../components/FilPublications';
import { lireArticlesPublies, urlImage } from '../lib/publics';
import { RUBRIQUES } from '../lib/rubriques';
import { formaterDate } from '../lib/format';
import { auteurAffichage, extrait, normaliser } from '../lib/journalistes';

export const revalidate = 60;

export const metadata = {
  alternates: { canonical: '/' },
};

// Assez pour alimenter le fil continu avec l’ensemble des articles publiés.
const LIMITE_ARTICLES = 500;
const NB_SECONDAIRES = 3;

function versVue(a) {
  const j = a.auteur;
  const auteur = auteurAffichage(j);
  return {
    id: a.id,
    titre: a.titre,
    resume: a.resume,
    extrait: extrait(a.resume, 110),
    categorie: a.categorie,
    lien: `/article/${a.slug}`,
    imageUrl: urlImage(a.image_path),
    dateIso: a.publie_le,
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

function AuteurArticle({ vue, className }) {
  return (
    <div className={className}>
      <Avatar taille="m" photoUrl={vue.photoUrl} initiales={vue.initiales} />
      <p>
        <strong>
          {vue.auteurLien ? <Link href={vue.auteurLien}>{vue.auteurNom}</Link> : vue.auteurNom}
        </strong>
        <span>
          {vue.auteurMedia ? `${vue.auteurMedia} · ` : ''}
          <time dateTime={vue.dateIso}>{vue.dateTexte}</time>
        </span>
      </p>
    </div>
  );
}

export default async function Accueil() {
  const articles = await lireArticlesPublies({ limite: LIMITE_ARTICLES });
  const vues = articles.map(versVue);
  const aLaUne = vues[0];
  const secondaires = articles.slice(1, 1 + NB_SECONDAIRES);

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

      {!aLaUne ? (
        <p className="vide">Aucun article n’est publié pour le moment.</p>
      ) : (
        <div className="accueil-editorial">
          <FilPublications articles={vues} />

          <section className="une-colonne" aria-labelledby="titre-une">
            <h2 id="titre-une" className="titre-section titre-colonne">
              À la une
            </h2>

            <article className="une-principale">
              {aLaUne.imageUrl && (
                <Link
                  href={aLaUne.lien}
                  className="une-principale-image"
                  tabIndex={-1}
                  aria-hidden="true"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={aLaUne.imageUrl} alt="" />
                </Link>
              )}

              <div className="une-principale-corps">
                {aLaUne.categorie && <p className="etiquette-rubrique">{aLaUne.categorie}</p>}
                <h3>
                  <Link href={aLaUne.lien}>{aLaUne.titre}</Link>
                </h3>
                {aLaUne.resume && <p className="carte-resume">{aLaUne.resume}</p>}
                <AuteurArticle vue={aLaUne} className="une-principale-auteur" />
                <Link href={aLaUne.lien} className="btn-principal btn-lien une-principale-lire">
                  Lire l’article
                </Link>
              </div>
            </article>

            {secondaires.length > 0 && (
              <div className="une-suite">
                <h3 className="sous-titre-colonne">À découvrir aussi</h3>
                <div className="grille-a-la-une">
                  {secondaires.map((a) => (
                    <CarteArticle key={a.id} article={a} />
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>
      )}
    </section>
  );
}
