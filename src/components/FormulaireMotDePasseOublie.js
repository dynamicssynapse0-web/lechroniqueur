'use client';

import { useState } from 'react';
import Link from 'next/link';
import { creerClientNavigateur } from '../lib/supabase/client';

export default function FormulaireMotDePasseOublie() {
  const [email, setEmail] = useState('');
  const [erreur, setErreur] = useState('');
  const [enCours, setEnCours] = useState(false);
  const [envoye, setEnvoye] = useState(false);

  async function soumettre(evenement) {
    evenement.preventDefault();

    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setErreur('Entrez une adresse email valide.');
      document.getElementById('email')?.focus();
      return;
    }

    setErreur('');
    setEnCours(true);

    const supabase = creerClientNavigateur();
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/nouveau-mot-de-passe`,
    });

    setEnCours(false);
    if (error) {
      console.error('[mot-de-passe-oublie] échec', error.message);
      setErreur(`L’envoi a échoué : ${error.message}`);
      return;
    }
    setEnvoye(true);
  }

  if (envoye) {
    return (
      <div className="succes carte-auth" role="status">
        <h2>Vérifiez votre boîte mail</h2>
        <p>
          Si un compte existe avec l’adresse <strong>{email.trim()}</strong>, un
          email contenant un lien pour choisir un nouveau mot de passe vient
          d’être envoyé. Ce lien est valable pendant une durée limitée.
        </p>
        <p>Pensez à regarder dans vos courriers indésirables.</p>
        <p className="deja-compte">
          <Link href="/connexion">Retour à la connexion</Link>
        </p>
      </div>
    );
  }

  return (
    <section className="formulaire carte-auth" aria-labelledby="titre-oubli">
      <h2 id="titre-oubli">Réinitialiser mon mot de passe</h2>

      <form onSubmit={soumettre} noValidate>
        <div className="grille-champs">
          <div className="champ">
            <label htmlFor="email">Adresse email de votre compte</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErreur('');
              }}
              aria-invalid={erreur ? 'true' : undefined}
              aria-describedby={erreur ? 'email-message' : undefined}
            />
            {erreur && (
              <p className="erreur" id="email-message" role="alert">{erreur}</p>
            )}
          </div>

          <button type="submit" className="btn-principal" disabled={enCours}>
            {enCours ? 'Envoi en cours…' : 'Envoyer le lien'}
          </button>

          <p className="deja-compte">
            <Link href="/connexion">Retour à la connexion</Link>
          </p>
        </div>
      </form>
    </section>
  );
}