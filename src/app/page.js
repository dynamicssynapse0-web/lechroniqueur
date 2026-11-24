import Link from 'next/link';
import Avatar from '../components/Avatar';
import CarteArticle from '../components/CarteArticle';
import { lireArticlesPublies, urlImage } from '../lib/publics';
import { RUBRIQUES } from '../lib/rubriques';
import { urlPhoto } from '../lib/photos';
import { formaterDate } from '../lib/format';
import {
  nomComplet,
  initiales,
  lienJournaliste,
  extrait,
} from '../lib/journalistes';

export const revalidate = 60;

export const metadata = {
  alternates: { canonical: '/' },
};

// Assez pour alimenter le fil continu avec l’ensemble des articles publiés.
const LIMITE_ARTICLES = 500;
const NB_SECONDAIRES = 3;

function versVue(a) {
  const j = a.auteur;
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
    auteurNom: j ? nomComplet(j) : 'Rédaction lechroniqueur',
    auteurMedia: j?.media || '',
    auteurLien: j ? lienJournaliste(j) : null,
    photoUrl: j ? urlPhoto(j.photo_path) : '',
    initiales: j ? initiales(j) : 'L',
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
          <section className="fil-publications" aria-labelledby="titre-fil">
            <h2 id="titre-fil" className="titre-section titre-colonne">
              Dernières publications
            </h2>
            <ul className="fil-liste">
              {vues.map((a) => (
                <li key={a.id} className="fil-item">
                  <Link href={a.lien} className="fil-lien">
                    {a.categorie && <span className="etiquette-rubrique">{a.categorie}</span>}
                    <span className="fil-titre">{a.titre}</span>
                    {a.extrait && <span className="fil-extrait">{a.extrait}</span>}
                    <span className="fil-meta">
                      <span>
                        {a.auteurNom}
                        {a.auteurMedia ? `, ${a.auteurMedia}` : ''}
                      </span>
                      <time dateTime={a.dateIso}>{a.dateTexte}</time>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

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
