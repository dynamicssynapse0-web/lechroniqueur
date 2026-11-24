'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supprimerArticle } from '../app/espace/actions';
import './supprimer.css';

export default function SupprimerArticle({ id, titre, publie }) {
  const router = useRouter();
  const dialogue = useRef(null);
  const [ouvert, setOuvert] = useState(false);
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState('');

  useEffect(() => {
    const d = dialogue.current;
    if (!d) return;
    if (ouvert && !d.open) d.showModal();
    if (!ouvert && d.open) d.close();
  }, [ouvert]);

  async function confirmer() {
    setEnCours(true);
    setErreur('');
    const resultat = await supprimerArticle(id);
    setEnCours(false);

    if (resultat?.erreur) {
      setErreur(resultat.erreur);
      return;
    }
    setOuvert(false);
    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        className="btn-supprimer"
        onClick={() => {
          setErreur('');
          setOuvert(true);
        }}
        aria-label={`Supprimer l’article ${titre}`}
      >
        Supprimer
      </button>

      <dialog
        ref={dialogue}
        className="dialogue-confirmation"
        aria-labelledby={`titre-sup-${id}`}
        onClose={() => setOuvert(false)}
        onClick={(e) => {
          if (e.target === e.currentTarget && !enCours) setOuvert(false);
        }}
      >
        <h2 id={`titre-sup-${id}`}>Supprimer cet article ?</h2>
        <p><strong>{titre}</strong></p>
        <p>
          {publie ? 'Cet article est publié : il disparaîtra immédiatement du site. ' : ''}
          La suppression est définitive, avec son image de couverture.
        </p>
        {erreur && <p className="erreur" role="alert">{erreur}</p>}
        <div className="boutons-dialogue">
          <button type="button" className="btn-secondaire" onClick={() => setOuvert(false)} disabled={enCours}>
            Annuler
          </button>
          <button type="button" className="btn-danger" onClick={confirmer} disabled={enCours}>
            {enCours ? 'Suppression…' : 'Supprimer définitivement'}
          </button>
        </div>
      </dialog>
    </>
  );
}
