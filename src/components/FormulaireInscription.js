'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { envoyerDemande } from '../lib/inscription';
import './formulaire-photo.css';

const TYPES_ACCEPTES = ['image/jpeg', 'image/png', 'application/pdf'];
const TYPES_PHOTO = ['image/jpeg', 'image/png', 'image/webp'];
const TAILLE_MAX = 5 * 1024 * 1024;
const DIMENSION_MIN = 200;

const VALEURS_INITIALES = {
  prenom: '',
  nom: '',
  media: '',
  email: '',
  numeroCarte: '',
  motDePasse: '',
  confirmation: '',
  accepte: false,
};

function Champ({ id, label, erreur, aide, children }) {
  return (
    <div className="champ">
      <label htmlFor={id}>{label}</label>
      {children}
      {erreur ? (
        <p className="erreur" id={`${id}-message`} role="alert">{erreur}</p>
      ) : aide ? (
        <p className="aide" id={`${id}-message`}>{aide}</p>
      ) : null}
    </div>
  );
}

// Lit la taille d’une image, ou renvoie null si elle est illisible.
function lireDimensions(url) {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () =>
      resolve({ largeur: image.naturalWidth, hauteur: image.naturalHeight });
    image.onerror = () => resolve(null);
    image.src = url;
  });
}

export default function FormulaireInscription() {
  const [valeurs, setValeurs] = useState(VALEURS_INITIALES);
  const [carte, setCarte] = useState(null);
  const [apercu, setApercu] = useState('');
  const [photo, setPhoto] = useState(null);
  const [apercuPhoto, setApercuPhoto] = useState('');
  const [erreurs, setErreurs] = useState({});
  const [voirMdp, setVoirMdp] = useState(false);
  const [enCours, setEnCours] = useState(false);
  const [envoye, setEnvoye] = useState(false);
  const [erreurServeur, setErreurServeur] = useState('');

  useEffect(() => {
    return () => {
      if (apercu) URL.revokeObjectURL(apercu);
    };
  }, [apercu]);

  useEffect(() => {
    return () => {
      if (apercuPhoto) URL.revokeObjectURL(apercuPhoto);
    };
  }, [apercuPhoto]);

  function champ(id, avecAide = false) {
    return {
      id,
      name: id,
      value: valeurs[id],
      onChange: changer,
      'aria-invalid': erreurs[id] ? 'true' : undefined,
      'aria-describedby': erreurs[id] || avecAide ? `${id}-message` : undefined,
    };
  }

  function changer(e) {
    const { name, value, type, checked } = e.target;
    setValeurs((v) => ({ ...v, [name]: type === 'checkbox' ? checked : value }));
    if (erreurs[name]) setErreurs((er) => ({ ...er, [name]: undefined }));
  }

  function choisirFichier(e) {
    const fichier = e.target.files?.[0];
    if (!fichier) return;

    let message = '';
    if (!TYPES_ACCEPTES.includes(fichier.type)) {
      message = 'Format non accepté. Utilisez un fichier JPG, PNG ou PDF.';
    } else if (fichier.size > TAILLE_MAX) {
      message = 'Le fichier est trop lourd (5 Mo maximum).';
    }

    if (message) {
      setCarte(null);
      setApercu('');
      setErreurs((er) => ({ ...er, carte: message }));
      e.target.value = '';
      return;
    }

    setCarte(fichier);
    setApercu(fichier.type === 'application/pdf' ? '' : URL.createObjectURL(fichier));
    setErreurs((er) => ({ ...er, carte: undefined }));
  }

  async function choisirPhoto(e) {
    const fichier = e.target.files?.[0];
    const champFichier = e.target;
    if (!fichier) return;

    function refuser(message) {
      setPhoto(null);
      setApercuPhoto('');
      setErreurs((er) => ({ ...er, photo: message }));
      champFichier.value = '';
    }

    if (!TYPES_PHOTO.includes(fichier.type)) {
      return refuser('Format non accepté. Utilisez une image JPG, PNG ou WebP.');
    }
    if (fichier.size > TAILLE_MAX) {
      return refuser('La photo est trop lourde (5 Mo maximum).');
    }

    const url = URL.createObjectURL(fichier);
    const dimensions = await lireDimensions(url);

    if (!dimensions) {
      URL.revokeObjectURL(url);
      return refuser('Cette image est illisible. Essayez un autre fichier.');
    }
    if (Math.min(dimensions.largeur, dimensions.hauteur) < DIMENSION_MIN) {
      URL.revokeObjectURL(url);
      return refuser(`La photo est trop petite (${DIMENSION_MIN} × ${DIMENSION_MIN} pixels minimum).`);
    }

    setPhoto(fichier);
    setApercuPhoto(url);
    setErreurs((er) => ({ ...er, photo: undefined }));
  }

  function valider() {
    const e = {};
    if (!valeurs.prenom.trim()) e.prenom = 'Indiquez votre prénom.';
    if (!valeurs.nom.trim()) e.nom = 'Indiquez votre nom.';
    if (!valeurs.media.trim()) e.media = 'Indiquez le nom de votre média.';
    if (!/^\S+@\S+\.\S+$/.test(valeurs.email.trim())) e.email = 'Entrez une adresse email valide.';
    if (valeurs.motDePasse.length < 8) e.motDePasse = 'Le mot de passe doit contenir au moins 8 caractères.';
    if (valeurs.confirmation !== valeurs.motDePasse) e.confirmation = 'Les deux mots de passe ne correspondent pas.';
    if (!carte) e.carte = 'Ajoutez une photo de votre carte de presse.';
    if (!photo) e.photo = 'Ajoutez votre photo de profil.';
    if (!valeurs.accepte) e.accepte = 'Vous devez accepter pour continuer.';
    return e;
  }

  async function soumettre(evenement) {
    evenement.preventDefault();
    const trouvees = valider();
    setErreurs(trouvees);

    const premier = Object.keys(trouvees)[0];
    if (premier) {
      document.getElementById(premier)?.focus();
      return;
    }

    setErreurServeur('');
    setEnCours(true);
    const erreurEnvoi = await envoyerDemande(valeurs, carte, photo);
    if (erreurEnvoi) {
      setEnCours(false);
      setErreurServeur(erreurEnvoi);
      return;
    }
    setEnCours(false);
    setEnvoye(true);
  }

  if (envoye) {
    return (
      <div className="succes" role="status">
        <h2>Demande envoyée</h2>
        <p>
          Merci {valeurs.prenom}. Si cette adresse n’est pas déjà utilisée, un email de confirmation vient d’être envoyé à{' '}
          <strong>{valeurs.email}</strong>. Cliquez sur le lien qu’il contient
          pour que votre demande soit transmise à notre équipe.
        </p>
        <p>
          Nous vérifierons ensuite votre carte de presse. Vous pourrez suivre
          l’avancement de votre demande en vous connectant.
        </p>
        <Link href="/connexion" className="btn-principal btn-lien">
          Suivre ma demande
        </Link>
      </div>
    );
  }

  return (
    <div className="inscription">
      <aside className="etapes" aria-labelledby="titre-etapes">
        <h2 id="titre-etapes">Comment ça marche</h2>
        <ol>
          <li>
            <strong>Créez votre compte</strong>
            <span>Renseignez vos informations et envoyez votre carte de presse et votre photo de profil.</span>
          </li>
          <li>
            <strong>Confirmez votre email</strong>
            <span>Un lien vous est envoyé pour valider votre adresse.</span>
          </li>
          <li>
            <strong>Vérification de votre carte</strong>
            <span>Notre équipe examine votre demande et vous répond.</span>
          </li>
          <li>
            <strong>Complétez votre profil</strong>
            <span>Ajoutez votre ville et votre pays, puis publiez vos articles.</span>
          </li>
        </ol>
        <p className="confidentialite">
          Votre carte de presse reste privée : seule l’équipe lechroniqueur peut la
          consulter, uniquement pour vérifier votre statut. Votre photo de profil,
          elle, sera affichée publiquement avec vos articles une fois votre demande
          acceptée.
        </p>
      </aside>

      <section className="formulaire" aria-labelledby="titre-formulaire">
        <h2 id="titre-formulaire">Vos informations</h2>

        <form onSubmit={soumettre} noValidate>
          <div className="grille-champs">
            <div className="grille-champs deux">
              <Champ id="prenom" label="Prénom" erreur={erreurs.prenom}>
                <input type="text" autoComplete="given-name" {...champ('prenom')} />
              </Champ>
              <Champ id="nom" label="Nom" erreur={erreurs.nom}>
                <input type="text" autoComplete="family-name" {...champ('nom')} />
              </Champ>
            </div>

            <Champ
              id="media"
              label="Nom du média"
              erreur={erreurs.media}
              aide="Journal, radio, télévision, site d’actualité…"
            >
              <input type="text" autoComplete="organization" {...champ('media', true)} />
            </Champ>

            <Champ id="email" label="Adresse email" erreur={erreurs.email}>
              <input type="email" autoComplete="email" inputMode="email" {...champ('email')} />
            </Champ>

            <div className="grille-champs deux">
              <Champ
                id="motDePasse"
                label="Mot de passe"
                erreur={erreurs.motDePasse}
                aide="Au moins 8 caractères."
              >
                <div className="mdp">
                  <input
                    type={voirMdp ? 'text' : 'password'}
                    autoComplete="new-password"
                    {...champ('motDePasse', true)}
                  />
                  <button
                    type="button"
                    onClick={() => setVoirMdp(!voirMdp)}
                    aria-label={voirMdp ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    {voirMdp ? 'Masquer' : 'Afficher'}
                  </button>
                </div>
              </Champ>
              <Champ id="confirmation" label="Confirmer le mot de passe" erreur={erreurs.confirmation}>
                <input
                  type={voirMdp ? 'text' : 'password'}
                  autoComplete="new-password"
                  {...champ('confirmation')}
                />
              </Champ>
            </div>

            <Champ
              id="numeroCarte"
              label="Numéro de carte de presse (facultatif)"
              aide="Il nous aide à vérifier votre carte plus rapidement."
            >
              <input type="text" {...champ('numeroCarte', true)} />
            </Champ>

            <Champ
              id="carte"
              label="Photo de votre carte de presse"
              erreur={erreurs.carte}
              aide="JPG, PNG ou PDF, 5 Mo maximum. Le texte doit être lisible."
            >
              <div className="depot" data-erreur={erreurs.carte ? 'oui' : undefined}>
                <input
                  id="carte"
                  name="carte"
                  type="file"
                  accept="image/jpeg,image/png,application/pdf"
                  onChange={choisirFichier}
                  aria-invalid={erreurs.carte ? 'true' : undefined}
                  aria-describedby="carte-message"
                />
                {carte && <p className="nom-fichier">Fichier choisi : {carte.name}</p>}
                {apercu && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className="apercu" src={apercu} alt="Aperçu de la carte de presse choisie" />
                )}
              </div>
            </Champ>

            <Champ
              id="photo"
              label="Votre photo de profil"
              erreur={erreurs.photo}
              aide={`Un portrait net où l’on reconnaît bien votre visage. JPG, PNG ou WebP, 5 Mo maximum, ${DIMENSION_MIN} × ${DIMENSION_MIN} pixels minimum. Elle sera affichée publiquement avec vos articles une fois votre demande acceptée.`}
            >
              <div className="depot depot-photo" data-erreur={erreurs.photo ? 'oui' : undefined}>
                {apercuPhoto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className="apercu-photo" src={apercuPhoto} alt="Aperçu de votre photo de profil" />
                ) : (
                  <span className="photo-vide" aria-hidden="true">+</span>
                )}
                <input
                  id="photo"
                  name="photo"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={choisirPhoto}
                  aria-invalid={erreurs.photo ? 'true' : undefined}
                  aria-describedby="photo-message"
                />
                {photo && <p className="nom-fichier">Fichier choisi : {photo.name}</p>}
              </div>
            </Champ>

            <div className="champ">
              <label className="consentement" htmlFor="accepte">
                <input
                  type="checkbox"
                  id="accepte"
                  name="accepte"
                  checked={valeurs.accepte}
                  onChange={changer}
                  aria-invalid={erreurs.accepte ? 'true' : undefined}
                  aria-describedby={erreurs.accepte ? 'accepte-message' : undefined}
                />
                <span>
                  Je certifie être journaliste et que les informations fournies
                  sont exactes. J’accepte que ma carte de presse soit consultée par
                  l’équipe lechroniqueur uniquement pour vérifier mon statut, et que ma
                  photo de profil soit affichée publiquement avec mes articles et mon
                  profil une fois ma demande acceptée. J’ai lu la{' '}
                  <Link href="/confidentialite" target="_blank" rel="noopener noreferrer">
                    politique de confidentialité
                  </Link>{' '}
                  et j’accepte les{' '}
                  <Link href="/conditions" target="_blank" rel="noopener noreferrer">
                    conditions d’utilisation
                  </Link>.
                </span>
              </label>
              {erreurs.accepte && (
                <p className="erreur" id="accepte-message" role="alert">{erreurs.accepte}</p>
              )}
            </div>

            {erreurServeur && (
              <p className="erreur" role="alert">{erreurServeur}</p>
            )}

            <button type="submit" className="btn-principal" disabled={enCours}>
              {enCours ? 'Envoi en cours…' : 'Envoyer ma demande'}
            </button>

            <p className="deja-compte">
              Vous avez déjà un compte ? <Link href="/connexion">Se connecter</Link>
            </p>
          </div>
        </form>
      </section>
    </div>
  );
}
