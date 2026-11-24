'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { creerClientNavigateur } from '../lib/supabase/client';

const ETAPES = ['Compte créé', 'Email confirmé', 'Vérification', 'Profil', 'Publication'];

const ETAPE_DU_STATUT = {
  email_a_confirmer: 1,
  en_attente: 2,
  refuse: 2,
  accepte: 3,
  actif: 5,
};

const EXTENSIONS = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'application/pdf': 'pdf',
};
const TAILLE_MAX = 5 * 1024 * 1024;

function etatEtape(index, statut) {
  const courante = ETAPE_DU_STATUT[statut];
  if (index < courante) return 'fait';
  if (index === courante) return statut === 'refuse' ? 'erreur' : 'courant';
  return 'a-venir';
}

const LIBELLE_ETAT = {
  fait: 'terminée',
  courant: 'en cours',
  erreur: 'refusée',
  'a-venir': 'à venir',
};

export default function SuiviDemande({ profil, utilisateurId }) {
  const router = useRouter();
  const statut = profil.statut;

  const [fichier, setFichier] = useState(null);
  const [erreurFichier, setErreurFichier] = useState('');
  const [enCours, setEnCours] = useState(false);
  const [resoumis, setResoumis] = useState(false);

  // Vérifie le statut toutes les 30 secondes
  useEffect(() => {
    if (statut === 'actif') return;
    const minuteur = setInterval(() => router.refresh(), 30000);
    return () => clearInterval(minuteur);
  }, [statut, router]);

  function choisirFichier(e) {
    const f = e.target.files?.[0];
    if (!f) return;

    if (!EXTENSIONS[f.type]) {
      setErreurFichier('Format non accepté. Utilisez un fichier JPG, PNG ou PDF.');
      setFichier(null);
      e.target.value = '';
      return;
    }
    if (f.size > TAILLE_MAX) {
      setErreurFichier('Le fichier est trop lourd (5 Mo maximum).');
      setFichier(null);
      e.target.value = '';
      return;
    }
    setErreurFichier('');
    setFichier(f);
  }

  async function envoyerCarte() {
    if (!fichier) {
      setErreurFichier('Choisissez d’abord un fichier.');
      return;
    }

    setEnCours(true);
    setErreurFichier('');
    const supabase = creerClientNavigateur();
    const chemin = `${utilisateurId}/${crypto.randomUUID()}.${EXTENSIONS[fichier.type]}`;

    const { error: erreurEnvoi } = await supabase.storage
      .from('cartes-presse')
      .upload(chemin, fichier, { contentType: fichier.type, upsert: false });

    if (erreurEnvoi) {
      setEnCours(false);
      setErreurFichier('L’envoi du fichier a échoué. Réessayez.');
      return;
    }

    const { error } = await supabase.rpc('soumettre_nouvelle_carte', { p_chemin: chemin });
    setEnCours(false);

    if (error) {
      setErreurFichier('Impossible d’enregistrer la nouvelle carte. Réessayez.');
      return;
    }

    setFichier(null);
    setResoumis(true);
    router.refresh();
  }

  return (
    <div className="suivi">
      <ol className="progression" aria-label="Avancement de votre demande">
        {ETAPES.map((nom, index) => {
          const etat = etatEtape(index, statut);
          const atteint = index <= ETAPE_DU_STATUT[statut];
          return (
            <li
              key={nom}
              className={`etape-suivi ${etat}${atteint ? ' atteint' : ''}`}
              aria-current={etat === 'courant' || etat === 'erreur' ? 'step' : undefined}
            >
              <span className="pastille" aria-hidden="true">
                {etat === 'fait' ? '✓' : etat === 'erreur' ? '!' : index + 1}
              </span>
              <span className="libelle">
                {nom}
                <span className="sr-only"> ({LIBELLE_ETAT[etat]})</span>
              </span>
            </li>
          );
        })}
      </ol>

      <section
        className={`carte-statut statut-${statut}`}
        aria-live="polite"
        aria-labelledby="titre-statut"
      >
        <p className="bonjour">Bonjour {profil.prenom},</p>

        {statut === 'email_a_confirmer' && (
          <>
            <h2 id="titre-statut">Confirmez votre adresse email</h2>
            <p>
              Nous avons envoyé un lien à <strong>{profil.email}</strong>. Cliquez
              dessus pour que votre demande soit transmise à notre équipe.
            </p>
          </>
        )}

        {statut === 'en_attente' && (
          <>
            <h2 id="titre-statut">Votre carte de presse est en cours de vérification</h2>
            {resoumis && (
              <p className="info" role="status">
                Votre nouvelle carte de presse a bien été reçue.
              </p>
            )}
            <p>
              Notre équipe examine votre demande. Vous pouvez quitter cette page :
              reconnectez-vous plus tard pour voir où en est votre dossier. Cette page
              se met à jour automatiquement.
            </p>
          </>
        )}

        {statut === 'refuse' && (
          <>
            <h2 id="titre-statut">Votre demande n’a pas été acceptée</h2>
            <p className="motif">
              <strong>Motif indiqué par l’équipe :</strong>{' '}
              {profil.motif || 'Aucun motif n’a été indiqué.'}
            </p>
            <p>
              Vous pouvez envoyer une nouvelle photo de votre carte de presse. Votre
              demande sera alors examinée de nouveau.
            </p>

            <div className="depot" data-erreur={erreurFichier ? 'oui' : undefined}>
              <label htmlFor="nouvelle-carte" className="etiquette-depot">
                Nouvelle photo de votre carte de presse
              </label>
              <input
                id="nouvelle-carte"
                type="file"
                accept="image/jpeg,image/png,application/pdf"
                onChange={choisirFichier}
                aria-invalid={erreurFichier ? 'true' : undefined}
                aria-describedby="nouvelle-carte-message"
              />
              {fichier && <p className="nom-fichier">Fichier choisi : {fichier.name}</p>}
              {erreurFichier ? (
                <p className="erreur" id="nouvelle-carte-message" role="alert">{erreurFichier}</p>
              ) : (
                <p className="aide" id="nouvelle-carte-message">
                  JPG, PNG ou PDF, 5 Mo maximum. Le texte doit être lisible.
                </p>
              )}
            </div>

            <button type="button" className="btn-principal" onClick={envoyerCarte} disabled={enCours}>
              {enCours ? 'Envoi en cours…' : 'Envoyer la nouvelle carte'}
            </button>
          </>
        )}

        {statut === 'accepte' && (
          <>
            <h2 id="titre-statut">Félicitations, votre demande est acceptée</h2>
            <p>
              Votre carte de presse a été vérifiée. Il reste une dernière étape :
              compléter votre profil avec votre ville, votre numéro de téléphone et
              votre pays.
            </p>
            <Link href="/profil" className="btn-principal btn-lien">Continuer</Link>
          </>
        )}

        {statut === 'actif' && (
          <>
            <h2 id="titre-statut">Bienvenue dans votre univers médiatique</h2>
            <p>
              Votre profil est complet. Vous pouvez maintenant rédiger et publier
              vos articles : ils seront visibles par tous les lecteurs.
            </p>
            <Link href="/espace/nouvel-article" className="btn-principal btn-lien">
              Écrire mon premier article
            </Link>
          </>
        )}
      </section>
    </div>
  );
}