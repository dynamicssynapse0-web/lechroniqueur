'use client';

import { useState } from 'react';
import { creerClientNavigateur } from '../lib/supabase/client';

const BIO_MAX = 600;

export default function ModifierBio({ utilisateurId, bioInitiale }) {
  const [bio, setBio] = useState(bioInitiale || '');
  const [enCours, setEnCours] = useState(false);
  const [message, setMessage] = useState('');
  const [erreur, setErreur] = useState('');

  async function enregistrer(e) {
    e.preventDefault();
    setMessage('');
    setErreur('');
    setEnCours(true);

    const supabase = creerClientNavigateur();
    const { error } = await supabase
      .from('journalistes')
      .update({ bio: bio.trim() })
      .eq('id', utilisateurId);

    setEnCours(false);

    if (error) {
      setErreur(`Enregistrement impossible : ${error.message}`);
      return;
    }

    setMessage('Bio enregistrée. Elle est visible sur votre profil public.');
  }

  return (
    <form onSubmit={enregistrer} className="formulaire">
      <div className="champ">
        <label htmlFor="bio">Votre biographie</label>
        <textarea
          id="bio"
          name="bio"
          rows={6}
          maxLength={BIO_MAX}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          aria-describedby="bio-aide"
        />
        <p className="aide" id="bio-aide">
          Présentez votre parcours, vos spécialités, vos médias. Cette bio apparaît
          sur votre profil public et peut être lue par Google.
        </p>
        <p className="compteur-champ">{bio.length} / {BIO_MAX}</p>
      </div>

      {message && <p className="info" role="status">{message}</p>}
      {erreur && <p className="erreur" role="alert">{erreur}</p>}

      <button type="submit" className="btn-principal" disabled={enCours}>
        {enCours ? 'Enregistrement…' : 'Enregistrer ma bio'}
      </button>
    </form>
  );
}