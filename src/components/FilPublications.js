'use client';

import { useState } from 'react';
import Link from 'next/link';
import Avatar from './Avatar';
import { RUBRIQUES } from '../lib/rubriques';
import { normaliser } from '../lib/journalistes';

export default function FilPublications({ articles }) {
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
    <section className="fil-publications" aria-labelledby="titre-fil">
      <h2 id="titre-fil" className="titre-section titre-colonne">
        Dernières publications
      </h2>

      <form
        className="fil-filtres"
        role="search"
        onSubmit={(e) => e.preventDefault()}
      >
        <div className="champ fil-recherche">
          <label htmlFor="fil-recherche" className="sr-only">
            Rechercher un article, un mot-clé ou un journaliste
          </label>
          <input
            id="fil-recherche"
            type="search"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="Rechercher un article, un mot-clé, un journaliste…"
          />
        </div>

        <div className="champ fil-rubrique">
          <label htmlFor="fil-rubrique" className="sr-only">
            Filtrer par rubrique
          </label>
          <select
            id="fil-rubrique"
            value={rubrique}
            onChange={(e) => setRubrique(e.target.value)}
          >
            <option value="">Toutes</option>
            {RUBRIQUES.map((r) => (
              <option key={r.slug} value={r.nom}>
                {r.nom}
              </option>
            ))}
          </select>
        </div>
      </form>

      <p className="fil-compteur" role="status" aria-live="polite">
        {visibles.length} publication{visibles.length > 1 ? 's' : ''}
        {actif ? ` trouvée${visibles.length > 1 ? 's' : ''}` : ''}
        {actif && (
          <button type="button" className="fil-effacer" onClick={reinitialiser}>
            Effacer les filtres
          </button>
        )}
      </p>

      {visibles.length === 0 ? (
        <p className="vide">Aucune publication ne correspond à votre recherche.</p>
      ) : (
        <ul className="fil-liste">
          {visibles.map((a) => (
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
      )}
    </section>
  );
}
