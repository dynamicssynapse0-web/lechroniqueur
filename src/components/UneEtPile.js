'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import Avatar from './Avatar';
import './une-et-pile.css';

export default function UneEtPile({ articles }) {
  const [indice, setIndice] = useState(0);
  const zone = useRef(null);

  const courant = articles[indice] ? indice : 0;
  const une = articles[courant];
  const plusieurs = articles.length > 1;

  function choisir(i) {
    setIndice(i);
    // Sur téléphone, la liste est sous l'article : on remonte vers lui.
    if (window.matchMedia('(max-width: 899px)').matches) {
      const reduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      zone.current?.scrollIntoView({ behavior: reduit ? 'auto' : 'smooth', block: 'start' });
    }
  }

  return (
    <div className={plusieurs ? 'une-et-pile' : 'une-et-pile seul'}>
      <div className="une-zone" ref={zone}>
        <p className="sr-only" role="status">Article affiché : {une.titre}</p>

        <div key={une.id} className="une">
          <Link href={une.lien} className="une-image" tabIndex={-1} aria-hidden="true">
            {une.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={une.imageUrl} alt="" />
            )}
          </Link>

          <div className="une-corps">
            {une.categorie && <p className="etiquette-rubrique">{une.categorie}</p>}
            <h2>
              <Link href={une.lien}>{une.titre}</Link>
            </h2>
            {une.resume && <p className="carte-resume">{une.resume}</p>}

            <div className="une-auteur">
              <Avatar taille="m" photoUrl={une.photoUrl} initiales={une.initiales} />
              <p>
                <strong>
                  {une.auteurLien ? <Link href={une.auteurLien}>{une.auteurNom}</Link> : une.auteurNom}
                </strong>
                <span>
                  {une.auteurMedia ? `${une.auteurMedia} · ` : ''}
                  <time dateTime={une.dateIso}>{une.dateTexte}</time>
                </span>
              </p>
            </div>

            <Link href={une.lien} className="btn-principal btn-lien une-lire">
              Lire l’article
            </Link>
          </div>
        </div>
      </div>

      {plusieurs && (
        <section className="pile" aria-labelledby="titre-pile">
          <h2 id="titre-pile" className="titre-pile">Plus d’articles</h2>
          <div className="pile-zone">
            <ul className="pile-defilement">
              {articles.map((a, i) => (
                <li key={a.id}>
                  <button
                    type="button"
                    className="pile-item"
                    aria-pressed={i === courant}
                    onClick={() => choisir(i)}
                  >
                    <span className="pile-vignette" aria-hidden="true">
                      {a.imageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={a.imageUrl} alt="" loading="lazy" />
                      )}
                    </span>
                    <span className="pile-texte">
                      {a.categorie && <span className="etiquette-rubrique">{a.categorie}</span>}
                      <span className="pile-titre">{a.titre}</span>
                      <span className="pile-meta">
                        <Avatar taille="s" photoUrl={a.photoUrl} initiales={a.initiales} />
                        <span>{a.auteurNom} · {a.dateTexte}</span>
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </div>
  );
}
