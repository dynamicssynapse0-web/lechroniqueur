'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { creerClientNavigateur } from '../lib/supabase/client';

export default function FormulaireNouveauMotDePasse() {
  const [motDePasse, setMotDePasse] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [voirMdp, setVoirMdp] = useState(false);
  const [erreurs, setErreurs] = useState({});
  const [enCours, setEnCours] = useState(false);
  const [termine, setTermine] = useState(false);
  const [erreurLien, setErreurLien] = useState('');

  useEffect(() => {
    let actif = true;
    const supabase = creerClientNavigateur();

    supabase.auth.getSession().then(({ data }) => {
      if (actif && !data.session) {
        setErreurLien(
          'Votre lien de réinitialisation est invalide ou expiré. Demandez un nouvel email depuis la page « Mot de passe oublié ».'
        );
      }
    });

    return () => {
      actif = false;
    };
  }, []);

  async function soumettre(evenement) {
    evenement.preventDefault();

    const e = {};
    if (motDePasse.length < 8) e.motDePasse = 'Le mot de passe doit contenir au moins 8 caractères.';
    if (confirmation !== motDePasse) e.confirmation = 'Les deux mots de passe ne correspondent pas.';
    setErreurs(e);

    const premier = Object.keys(e)[0];
    if (premier) {
      document.getElementById(premier)?.focus();
      return;
    }

    setEnCours(true);
    const supabase = creerClientNavigateur();
    const { error } = await supabase.auth.updateUser({ password: motDePasse });

    setEnCours(false);
    if (error) {
      console.error('[nouveau-mot-de-passe] échec', error.message);
      setErreurs((precedentes) => ({
        ...precedentes,
        formulaire: error.message,
      }));
      return;
    }
    setTermine(true);
  }

  if (termine) {
    return (
      <div className="succes carte-auth" role="status">
        <h2>Mot de passe modifié</h2>
        <p>Votre nouveau mot de passe est enregistré. Vous pouvez maintenant vous connecter.</p>
        <Link href="/connexion" className="btn-principal btn-lien">Se connecter</Link>
      </div>
    );
  }

  return (
    <section className="formulaire carte-auth" aria-labelledby="titre-nouveau">
      <h2 id="titre-nouveau">Choisissez un nouveau mot de passe</h2>

      {erreurLien && (
        <p className="erreur" role="alert">
          {erreurLien}{' '}
          <Link href="/mot-de-passe-oublie">Demander un nouvel email</Link>
        </p>
      )}
      {erreurs.formulaire && (
        <p className="erreur" role="alert">{erreurs.formulaire}</p>
      )}

      <form onSubmit={soumettre} noValidate>
        <div className="grille-champs">
          <div className="champ">
            <label htmlFor="motDePasse">Nouveau mot de passe</label>
            <div className="mdp">
              <input
                id="motDePasse"
                name="motDePasse"
                type={voirMdp ? 'text' : 'password'}
                autoComplete="new-password"
                value={motDePasse}
                onChange={(e) => {
                  setMotDePasse(e.target.value);
                  setErreurs((er) => ({ ...er, motDePasse: undefined }));
                }}
                aria-invalid={erreurs.motDePasse ? 'true' : undefined}
                aria-describedby="motDePasse-message"
              />
              <button
                type="button"
                onClick={() => setVoirMdp(!voirMdp)}
                aria-label={voirMdp ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              >
                {voirMdp ? 'Masquer' : 'Afficher'}
              </button>
            </div>
            {erreurs.motDePasse ? (
              <p className="erreur" id="motDePasse-message" role="alert">{erreurs.motDePasse}</p>
            ) : (
              <p className="aide" id="motDePasse-message">Au moins 8 caractères.</p>
            )}
          </div>

          <div className="champ">
            <label htmlFor="confirmation">Confirmer le nouveau mot de passe</label>
            <input
              id="confirmation"
              name="confirmation"
              type={voirMdp ? 'text' : 'password'}
              autoComplete="new-password"
              value={confirmation}
              onChange={(e) => {
                setConfirmation(e.target.value);
                setErreurs((er) => ({ ...er, confirmation: undefined }));
              }}
              aria-invalid={erreurs.confirmation ? 'true' : undefined}
              aria-describedby={erreurs.confirmation ? 'confirmation-message' : undefined}
            />
            {erreurs.confirmation && (
              <p className="erreur" id="confirmation-message" role="alert">{erreurs.confirmation}</p>
            )}
          </div>

          <button type="submit" className="btn-principal" disabled={enCours}>
            {enCours ? 'Enregistrement…' : 'Enregistrer le mot de passe'}
          </button>
        </div>
      </form>
    </section>
  );
}