'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Avatar from './Avatar';
import { PAYS } from '../lib/pays';
import { initiales } from '../lib/journalistes';
import { urlPhoto } from '../lib/photos';
import { verifierPhoto, EXTENSIONS_PHOTO } from '../lib/verifierPhoto';
import { creerClientNavigateur } from '../lib/supabase/client';
import { enregistrerProfil } from '../app/espace/profil/actions';

const BIO_MAX = 500;

function heure() {
  return new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

export default function EditerProfil({ utilisateurId, photoChemin, identite, initial, lienPublic }) {
  const [valeurs, setValeurs] = useState(initial);
  const [erreurs, setErreurs] = useState({});
  const [enCours, setEnCours] = useState(false);
  const [modifie, setModifie] = useState(false);
  const [message, setMessage] = useState('');
  const [erreurServeur, setErreurServeur] = useState('');
  const [photoUrl, setPhotoUrl] = useState(urlPhoto(photoChemin));
  const [photo, setPhoto] = useState(null);
  const [apercuPhoto, setApercuPhoto] = useState('');
  const [cleFichier, setCleFichier] = useState(0);

  const paysConnus = PAYS.some((p) => p.nom === initial.pays);

  useEffect(() => {
    return () => {
      if (apercuPhoto) URL.revokeObjectURL(apercuPhoto);
    };
  }, [apercuPhoto]);

  // Prévient avant de quitter la page avec des changements non enregistrés
  useEffect(() => {
    if (!modifie) return;
    const avertir = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', avertir);
    return () => window.removeEventListener('beforeunload', avertir);
  }, [modifie]);

  function changer(e) {
    const { name, value } = e.target;
    setValeurs((v) => ({ ...v, [name]: value }));
    setModifie(true);
    setMessage('');
    setErreurServeur('');
    if (erreurs[name]) setErreurs((er) => ({ ...er, [name]: undefined }));
  }

  async function choisirPhoto(e) {
    const fichier = e.target.files?.[0];
    const champ = e.target;
    if (!fichier) return;

    const probleme = await verifierPhoto(fichier);
    if (probleme) {
      setPhoto(null);
      setApercuPhoto('');
      setErreurs((er) => ({ ...er, photo: probleme }));
      champ.value = '';
      return;
    }

    setPhoto(fichier);
    setApercuPhoto(URL.createObjectURL(fichier));
    setModifie(true);
    setMessage('');
    setErreurServeur('');
    setErreurs((er) => ({ ...er, photo: undefined }));
  }

  async function soumettre(evenement) {
    evenement.preventDefault();
    setMessage('');
    setErreurServeur('');

    const e = {};
    if (valeurs.ville.trim().length < 2) e.ville = 'Indiquez votre ville.';
    if (!valeurs.pays) e.pays = 'Choisissez votre pays.';
    if (valeurs.bio.length > BIO_MAX) e.bio = `La biographie ne doit pas dépasser ${BIO_MAX} caractères.`;
    setErreurs(e);

    const premier = Object.keys(e)[0];
    if (premier) {
      document.getElementById(premier)?.focus();
      return;
    }

    setEnCours(true);
    const supabase = creerClientNavigateur();
    let chemin = '';

    // 1. Envoi de la nouvelle photo, s'il y en a une
    if (photo) {
      chemin = `${utilisateurId}/${crypto.randomUUID()}.${EXTENSIONS_PHOTO[photo.type]}`;
      const { error } = await supabase.storage
        .from('photos-profil')
        .upload(chemin, photo, {
          contentType: photo.type,
          upsert: false,
          cacheControl: '31536000',
        });
      if (error) {
        setEnCours(false);
        setErreurServeur('L’envoi de la photo a échoué. Vérifiez votre connexion et réessayez.');
        return;
      }
    }

    // 2. Enregistrement du profil
    const resultat = await enregistrerProfil({ ...valeurs, photoPath: chemin });
    setEnCours(false);

    if (resultat?.erreur) {
      if (chemin) await supabase.storage.from('photos-profil').remove([chemin]);
      setErreurServeur(resultat.erreur);
      return;
    }

    if (chemin) {
      setPhotoUrl(urlPhoto(chemin));
      setPhoto(null);
      setApercuPhoto('');
      setCleFichier((c) => c + 1);
    }
    setModifie(false);
    setMessage(`Profil enregistré à ${heure()}.`);
  }

  const restant = BIO_MAX - valeurs.bio.length;

  return (
    <div className="edition-profil">
      <section className="formulaire" aria-labelledby="titre-identite">
        <h2 id="titre-identite">Mon identité</h2>
        <dl className="infos-lecture">
          <div>
            <dt>Nom</dt>
            <dd>{`${identite.prenom} ${identite.nom}`.trim()}</dd>
          </div>
          <div>
            <dt>Média</dt>
            <dd>{identite.media}</dd>
          </div>
          <div>
            <dt>Adresse email (privée)</dt>
            <dd>{identite.email}</dd>
          </div>
        </dl>
        <p className="aide">
          Ces informations ont été vérifiées avec votre carte de presse et ne se
          modifient pas ici. Pour une correction, contactez l’équipe lechroniqueur.
        </p>
      </section>

      <section className="formulaire" aria-labelledby="titre-public">
        <h2 id="titre-public">Mon profil public</h2>

        <form onSubmit={soumettre} noValidate>
          <div className="grille-champs">
            <div className="champ">
              <label htmlFor="photo">Photo de profil</label>
              <div className="bloc-photo">
                <Avatar
                  taille="xl"
                  photoUrl={apercuPhoto || photoUrl}
                  initiales={initiales(identite)}
                />
                <div className="bloc-photo-champ">
                  <input
                    key={cleFichier}
                    id="photo"
                    name="photo"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={choisirPhoto}
                    aria-invalid={erreurs.photo ? 'true' : undefined}
                    aria-describedby="photo-message"
                  />
                  {erreurs.photo ? (
                    <p className="erreur" id="photo-message" role="alert">{erreurs.photo}</p>
                  ) : (
                    <p className="aide" id="photo-message">
                      {photo
                        ? 'Nouvelle photo choisie : elle sera enregistrée avec le profil.'
                        : photoUrl
                          ? 'Choisissez un fichier pour remplacer votre photo.'
                          : 'Vous n’avez pas encore de photo : ajoutez-en une.'}{' '}
                      Un portrait net, JPG, PNG ou WebP, 5 Mo maximum, 200 × 200 pixels minimum.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="champ">
              <label htmlFor="bio">Biographie</label>
              <textarea
                id="bio"
                name="bio"
                rows={7}
                maxLength={BIO_MAX}
                value={valeurs.bio}
                onChange={changer}
                aria-invalid={erreurs.bio ? 'true' : undefined}
                aria-describedby="bio-message"
              />
              {erreurs.bio ? (
                <p className="erreur" id="bio-message" role="alert">{erreurs.bio}</p>
              ) : (
                <p className="aide" id="bio-message">
                  Présentez-vous en quelques phrases : votre parcours, vos sujets de
                  prédilection. Évitez d’y mettre votre téléphone ou votre email : cette
                  page est publique.
                </p>
              )}
              <p className="compteur-champ">
                {restant} caractère{restant > 1 ? 's' : ''} restant{restant > 1 ? 's' : ''}
              </p>
            </div>

            <div className="champ">
              <label htmlFor="ville">Ville</label>
              <input
                id="ville"
                name="ville"
                type="text"
                autoComplete="address-level2"
                value={valeurs.ville}
                onChange={changer}
                aria-invalid={erreurs.ville ? 'true' : undefined}
                aria-describedby={erreurs.ville ? 'ville-message' : undefined}
              />
              {erreurs.ville && (
                <p className="erreur" id="ville-message" role="alert">{erreurs.ville}</p>
              )}
            </div>

            <div className="champ">
              <label htmlFor="pays">Pays</label>
              <select
                id="pays"
                name="pays"
                autoComplete="country-name"
                value={valeurs.pays}
                onChange={changer}
                aria-invalid={erreurs.pays ? 'true' : undefined}
                aria-describedby={erreurs.pays ? 'pays-message' : undefined}
              >
                <option value="">Choisissez votre pays</option>
                {!paysConnus && initial.pays && (
                  <option value={initial.pays}>{initial.pays}</option>
                )}
                {PAYS.map((p) => (
                  <option key={p.nom} value={p.nom}>{p.nom}</option>
                ))}
              </select>
              {erreurs.pays && (
                <p className="erreur" id="pays-message" role="alert">{erreurs.pays}</p>
              )}
            </div>

            <div aria-live="polite">
              {erreurServeur && <p className="erreur" role="alert">{erreurServeur}</p>}
              {message && (
                <p className="info" role="status">
                  {message} <Link href={lienPublic}>Voir mon profil public</Link>
                </p>
              )}
            </div>

            <div className="actions-profil">
              <button type="submit" className="btn-principal" disabled={enCours}>
                {enCours ? 'Enregistrement…' : 'Enregistrer'}
              </button>
              <Link href="/espace">Retour à mes articles</Link>
            </div>
          </div>
        </form>
      </section>
    </div>
  );
}
