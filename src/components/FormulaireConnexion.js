'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { creerClientNavigateur } from '../lib/supabase/client';
import { destinationApresConnexion } from '../lib/destination';

export default function FormulaireConnexion({ lienInvalide = false }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [voirMdp, setVoirMdp] = useState(false);
  const [erreurs, setErreurs] = useState({});
  const [enCours, setEnCours] = useState(false);
  const [erreurServeur, setErreurServeur] = useState('');
  const [nonConfirme, setNonConfirme] = useState(false);
  const [renvoye, setRenvoye] = useState(false);

  function valider() {
    const e = {};
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) e.email = 'Entrez une adresse email valide.';
    if (!motDePasse) e.motDePasse = 'Entrez votre mot de passe.';
    return e;
  }

  async function soumettre(evenement) {
    evenement.preventDefault();
    setErreurServeur('');
    setNonConfirme(false);
    setRenvoye(false);

    const trouvees = valider();
    setErreurs(trouvees);

    const premier = Object.keys(trouvees)[0];
    if (premier) {
      document.getElementById(premier)?.focus();
      return;
    }

    setEnCours(true);
    const supabase = creerClientNavigateur();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: motDePasse,
    });

    if (error) {
      setEnCours(false);
      if (error.code === 'email_not_confirmed') {
        setNonConfirme(true);
      } else if (error.status === 429) {
        setErreurServeur('Trop de tentatives. Patientez quelques minutes avant de réessayer.');
      } else {
        setErreurServeur('Adresse email ou mot de passe incorrect.');
      }
      return;
    }

    const { data: profil } = await supabase
      .from('profiles')
      .select('role, statut')
      .eq('id', data.user.id)
      .maybeSingle();

    router.push(destinationApresConnexion(profil));
    router.refresh();
  }

  async function renvoyer() {
    const supabase = creerClientNavigateur();
    const { error } = await supabase.auth.resend({ type: 'signup', email: email.trim() });
    if (error) {
      setErreurServeur('Impossible de renvoyer l’email pour le moment. Réessayez dans quelques minutes.');
    } else {
      setRenvoye(true);
    }
  }

  return (
    <section className="formulaire carte-auth" aria-labelledby="titre-connexion">
      <h2 id="titre-connexion">Votre espace journaliste</h2>

      {lienInvalide && (
        <p className="erreur" role="alert">
          Ce lien n’est plus valide ou a expiré. Connectez-vous : si votre adresse
          n’est pas encore confirmée, vous pourrez demander un nouvel email.
        </p>
      )}

      <form onSubmit={soumettre} noValidate>
        <div className="grille-champs">
          <div className="champ">
            <label htmlFor="email">Adresse email</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErreurs((er) => ({ ...er, email: undefined }));
              }}
              aria-invalid={erreurs.email ? 'true' : undefined}
              aria-describedby={erreurs.email ? 'email-message' : undefined}
            />
            {erreurs.email && (
              <p className="erreur" id="email-message" role="alert">{erreurs.email}</p>
            )}
          </div>

          <div className="champ">
            <label htmlFor="motDePasse">Mot de passe</label>
            <div className="mdp">
              <input
                id="motDePasse"
                name="motDePasse"
                type={voirMdp ? 'text' : 'password'}
                autoComplete="current-password"
                value={motDePasse}
                onChange={(e) => {
                  setMotDePasse(e.target.value);
                  setErreurs((er) => ({ ...er, motDePasse: undefined }));
                }}
                aria-invalid={erreurs.motDePasse ? 'true' : undefined}
                aria-describedby={erreurs.motDePasse ? 'motDePasse-message' : undefined}
              />
              <button
                type="button"
                onClick={() => setVoirMdp(!voirMdp)}
                aria-label={voirMdp ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              >
                {voirMdp ? 'Masquer' : 'Afficher'}
              </button>
            </div>
            {erreurs.motDePasse && (
              <p className="erreur" id="motDePasse-message" role="alert">{erreurs.motDePasse}</p>
            )}
          </div>

          <p className="mdp-oublie"><Link href="/mot-de-passe-oublie">Mot de passe oublié ?</Link></p>

          {erreurServeur && <p className="erreur" role="alert">{erreurServeur}</p>}

          {nonConfirme && (
            <div className="info" role="alert">
              <p>
                Votre adresse email n’est pas encore confirmée. Cliquez sur le lien
                reçu par email, ou demandez-en un nouveau.
              </p>
              <button type="button" className="btn-secondaire" onClick={renvoyer} disabled={renvoye}>
                {renvoye ? 'Email renvoyé' : 'Renvoyer l’email de confirmation'}
              </button>
            </div>
          )}

          {renvoye && (
            <p className="info" role="status">
              Un nouvel email vient d’être envoyé. Pensez à regarder dans vos courriers indésirables.
            </p>
          )}

          <button type="submit" className="btn-principal" disabled={enCours}>
            {enCours ? 'Connexion en cours…' : 'Se connecter'}
          </button>

          <p className="deja-compte">
            Pas encore de compte ? <Link href="/inscription">Devenir journaliste</Link>
          </p>
        </div>
      </form>
    </section>
  );
}