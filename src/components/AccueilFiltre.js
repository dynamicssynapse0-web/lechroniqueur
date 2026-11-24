'use client';

import { useState } from 'react';
import Link from 'next/link';
import Avatar from './Avatar';
import CarteArticle from './CarteArticle';
import { normaliser } from '../lib/journalistes';

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

export default function AccueilFiltre({ articles, rubriques = [] }) {
  const [recherche, setRecherche] = useState('');
  const [rubrique, setRubrique] = useState('');

  const mots = normaliser(recherche).split(' ').filter(Boolean);
  const actif = mots.length > 0 || rubrique !== '';

  const visibles = articles.filter((a) => {
    if (rubrique && a.categorie !== rubrique) return false;
    return mots.every((mot) => a.recherche.includes(mot));
  });

  function reinitialiser() {
    setRecherche('');
    setRubrique('');
  }

  return (
    <div className="accueil-filtre">
      <div className="filtres-articles" role="search">
        <div className="champ">
          <label htmlFor="filtre-recherche" className="sr-only">
            Rechercher un article, un mot-clé ou un journaliste
          </label>
          <input
            id="filtre-recherche"
            type="search"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="Rechercher un article, un mot-clé ou un journaliste…"
          />
        </div>

        <div className="pilules-rubriques" role="group" aria-label="Filtrer par rubrique">
          <button
            type="button"
            className={rubrique === '' ? 'pilule-rubrique active' : 'pilule-rubrique'}
            aria-pressed={rubrique === ''}
            onClick={() => setRubrique('')}
          >
            Tout
          </button>
          {rubriques.map((r) => (
            <button
              key={r.slug}
              type="button"
              className={rubrique === r.nom ? 'pilule-rubrique active' : 'pilule-rubrique'}
              aria-pressed={rubrique === r.nom}
              onClick={() => setRubrique(r.nom)}
            >
              {r.nom}
            </button>
          ))}
        </div>
      </div>

      <div className="filtres-resume" role="status" aria-live="polite">
        <p>
          {rubrique ? (
            <>
              <span className="etiquette-rubrique">{rubrique}</span> —{' '}
            </>
          ) : (
            'Tous les articles — '
          )}
          {visibles.length} publication{visibles.length > 1 ? 's' : ''}
          {actif ? ` trouvée${visibles.length > 1 ? 's' : ''}` : ''}
        </p>
        {actif && (
          <button type="button" className="fil-effacer" onClick={reinitialiser}>
            Réinitialiser le filtre
          </button>
        )}
      </div>

      {visibles.length === 0 ? (
        <p className="vide">Aucun article trouvé.</p>
      ) : (
        <div className="accueil-editorial">
          <section className="une-colonne" aria-labelledby="titre-une">
            <h2 id="titre-une" className="titre-section titre-colonne">
              {actif ? 'Articles correspondants' : 'À la une'}
            </h2>

            <article className="une-principale">
              {visibles[0].imageUrl && (
                <Link
                  href={visibles[0].lien}
                  className="une-principale-image"
                  tabIndex={-1}
                  aria-hidden="true"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={visibles[0].imageUrl} alt="" />
                </Link>
              )}

              <div className="une-principale-corps">
                {visibles[0].categorie && (
                  <p className="etiquette-rubrique">{visibles[0].categorie}</p>
                )}
                <h3>
                  <Link href={visibles[0].lien}>{visibles[0].titre}</Link>
                </h3>
                {visibles[0].resume && <p className="carte-resume">{visibles[0].resume}</p>}
                <AuteurArticle vue={visibles[0]} className="une-principale-auteur" />
                <Link href={visibles[0].lien} className="btn-principal btn-lien une-principale-lire">
                  Lire l’article
                </Link>
              </div>
            </article>

            {visibles.length > 1 && (
              <div className="une-suite">
                <h3 className="sous-titre-colonne">À découvrir aussi</h3>
                <div className="grille-a-la-une">
                  {visibles.slice(1, 4).map((a) => (
                    <CarteArticle key={a.id} article={a} />
                  ))}
                </div>
              </div>
            )}
          </section>

          {visibles.length > 4 && (
            <section className="fil-publications" aria-labelledby="titre-fil">
              <h2 id="titre-fil" className="titre-section titre-colonne">
                Dernières publications
              </h2>
              <ul className="fil-liste">
                {visibles.slice(4).map((a) => (
                  <li key={a.id} className="fil-item">
                    <Link href={a.lien} className="fil-lien">
                      {a.categorie && <span className="etiquette-rubrique">{a.categorie}</span>}
                      <span className="fil-titre">{a.titre}</span>
                      {a.extrait && <span className="fil-extrait">{a.extrait}</span>}
                      <span className="fil-meta">
                        <span className="fil-auteur">
                          <Avatar taille="s" photoUrl={a.photoUrl} initiales={a.initiales} />
                          <span>
                            {a.auteurNom}
                            {a.auteurMedia ? `, ${a.auteurMedia}` : ''}
                          </span>
                        </span>
                        <time dateTime={a.dateIso}>{a.dateTexte}</time>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
