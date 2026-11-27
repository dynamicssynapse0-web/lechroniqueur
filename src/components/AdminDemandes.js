'use client';

import { useState, useRef, useEffect } from 'react';
import { creerClientNavigateur } from '../lib/supabase/client';
import './admin-photo.css';

const ONGLETS = [
  { statut: 'en_attente', nom: 'En attente' },
  { statut: 'accepte', nom: 'Acceptées' },
  { statut: 'refuse', nom: 'Rejetées' },
];

const VIDE = {
  en_attente: 'Aucune demande en attente pour le moment.',
  accepte: 'Aucune demande acceptée pour le moment.',
  refuse: 'Aucune demande rejetée pour le moment.',
};

function formaterDate(iso) {
  if (!iso) return 'Date inconnue';
  return new Date(iso).toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short' });
}

function dansOnglet(d, onglet) {
  return onglet === 'accepte'
    ? d.statut === 'accepte' || d.statut === 'actif'
    : d.statut === onglet;
}

function Carte({ d, nom, onZoom }) {
  if (!d.carteUrl) {
    return <p className="aide">Aucune carte de presse trouvée pour cette demande.</p>;
  }
  if (d.carteEstPdf) {
    return (
      <a
        className="btn-secondaire btn-lien-pdf"
        href={d.carteUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        Ouvrir la carte (PDF)
      </a>
    );
  }
  return (
    <button type="button" className="miniature" onClick={() => onZoom(d)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={d.carteUrl} alt={`Carte de presse de ${nom}`} />
      <span>Agrandir la carte</span>
    </button>
  );
}

function PhotoProfil({ d, nom }) {
  if (!d.photoUrl) {
    return (
      <p>
        <span className="badge badge-rouge" style={{ marginLeft: 0 }}>
          Photo de profil manquante
        </span>
      </p>
    );
  }
  return (
    <a
      className="photo-profil-demande"
      href={d.photoUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Ouvrir la photo de profil de ${nom} en grand (nouvel onglet)`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={d.photoUrl} alt="" />
      <span>Photo de profil</span>
    </a>
  );
}

export default function AdminDemandes({ demandesInitiales }) {
  const [demandes, setDemandes] = useState(demandesInitiales);
  const [onglet, setOnglet] = useState('en_attente');
  const [motifs, setMotifs] = useState({});
  const [annonce, setAnnonce] = useState('');
  const [erreur, setErreur] = useState('');
  const [occupe, setOccupe] = useState(null);
  const [zoom, setZoom] = useState(null);
  const dialogue = useRef(null);

  const compter = (statut) => demandes.filter((d) => dansOnglet(d, statut)).length;
  const liste = demandes.filter((d) => dansOnglet(d, onglet));
  const enAttente = compter('en_attente');

  useEffect(() => {
    const d = dialogue.current;
    if (!d) return;
    if (zoom && !d.open) d.showModal();
    if (!zoom && d.open) d.close();
  }, [zoom]);

  async function decider(demande, statut) {
    setErreur('');
    setAnnonce('');
    setOccupe(demande.id);

    const motif = statut === 'refuse' ? (motifs[demande.id] || '').trim() : '';
    const supabase = creerClientNavigateur();
    const { error } = await supabase.rpc('decider_demande', {
      p_cible: demande.id,
      p_decision: statut,
      p_motif: motif || null,
    });
    setOccupe(null);

    if (error) {
      setErreur('La décision n’a pas pu être enregistrée. Actualisez la page et réessayez.');
      return;
    }

    setDemandes((courantes) =>
      courantes.map((d) =>
        d.id === demande.id ? { ...d, statut, motif, nouvelle: false } : d
      )
    );

    let notifications = '';
    try {
      const reponse = await fetch('/api/notifier-decision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: demande.id, statut }),
      });
      if (reponse.ok) {
        const resultat = await reponse.json();
        const email = resultat.email?.ok ? 'email envoyé' : 'email non envoyé';
        const whatsapp = resultat.whatsapp?.ok ? 'WhatsApp envoyé' : 'WhatsApp indisponible';
        notifications = ` Notification : ${email}, ${whatsapp}.`;
      } else {
        notifications = ' Notification indisponible.';
      }
    } catch {
      notifications = ' Notification indisponible.';
    }

    const nom = `${demande.prenom} ${demande.nom}`;
    if (statut === 'accepte') {
      setAnnonce(`La demande de ${nom} est acceptée.${notifications}`);
    } else if (statut === 'refuse') {
      setAnnonce(`La demande de ${nom} est rejetée, avec le motif indiqué.${notifications}`);
    } else {
      setAnnonce(`La demande de ${nom} est remise en attente.`);
    }
  }

  return (
    <div className="admin">
      <div className="admin-entete">
        <p className="compteur">
          <strong>{enAttente}</strong>{' '}
          {enAttente > 1 ? 'demandes en attente' : 'demande en attente'}
        </p>
      </div>

      <div className="filtres" role="group" aria-label="Filtrer les demandes">
        {ONGLETS.map((o) => (
          <button
            key={o.statut}
            type="button"
            className="filtre"
            aria-pressed={onglet === o.statut}
            onClick={() => setOnglet(o.statut)}
          >
            {o.nom} <span className="nombre">{compter(o.statut)}</span>
          </button>
        ))}
      </div>

      <div aria-live="polite">
        {annonce && <p className="info">{annonce}</p>}
        {erreur && <p className="erreur" role="alert">{erreur}</p>}
      </div>

      {liste.length === 0 && <p className="vide">{VIDE[onglet]}</p>}

      <div className="liste-demandes">
        {liste.map((d) => {
          const nom = `${d.prenom} ${d.nom}`.trim() || d.email;
          return (
            <article key={d.id} className="demande" aria-labelledby={`nom-${d.id}`}>
              <div className="visuels-demande">
                <Carte d={d} nom={nom} onZoom={setZoom} />
                <PhotoProfil d={d} nom={nom} />
              </div>

              <div className="demande-corps">
                <h3 id={`nom-${d.id}`}>
                  {nom}
                  {d.nouvelle && <span className="badge badge-rouge">Nouvelle soumission</span>}
                </h3>

                <dl className="infos-demande">
                  <div>
                    <dt>Média</dt>
                    <dd>{d.media || 'Non renseigné'}</dd>
                  </div>
                  <div>
                    <dt>Email</dt>
                    <dd>{d.email}</dd>
                  </div>
                  <div>
                    <dt>N° de carte</dt>
                    <dd>{d.numeroCarte || 'Non renseigné'}</dd>
                  </div>
                  <div>
                    <dt>Demande reçue le</dt>
                    <dd>{formaterDate(d.recue)}</dd>
                  </div>
                </dl>

                {d.statut === 'en_attente' && (
                  <div className="decision">
                    <label htmlFor={`motif-${d.id}`}>Motif en cas de rejet (facultatif)</label>
                    <textarea
                      id={`motif-${d.id}`}
                      rows={2}
                      maxLength={300}
                      value={motifs[d.id] || ''}
                      onChange={(e) => setMotifs((m) => ({ ...m, [d.id]: e.target.value }))}
                      aria-describedby={`aide-motif-${d.id}`}
                    />
                    <p className="aide" id={`aide-motif-${d.id}`}>
                      Ce texte sera affiché au journaliste pour qu’il comprenne le refus.
                    </p>
                    <div className="boutons-decision">
                      <button
                        type="button"
                        className="btn-accepter"
                        disabled={occupe === d.id}
                        onClick={() => decider(d, 'accepte')}
                        aria-label={`Accepter la demande de ${nom}`}
                      >
                        Accepter
                      </button>
                      <button
                        type="button"
                        className="btn-rejeter"
                        disabled={occupe === d.id}
                        onClick={() => decider(d, 'refuse')}
                        aria-label={`Rejeter la demande de ${nom}`}
                      >
                        Rejeter
                      </button>
                    </div>
                  </div>
                )}

                {d.statut !== 'en_attente' && (
                  <div className="decision">
                    <p>
                      {d.statut === 'refuse' ? (
                        <span className="badge badge-rouge">Rejetée</span>
                      ) : d.statut === 'actif' ? (
                        <span className="badge badge-bleu">Profil complété</span>
                      ) : (
                        <span className="badge badge-bleu">Acceptée</span>
                      )}
                    </p>
                    {d.statut === 'refuse' && (
                      <p className="motif">
                        <strong>Motif indiqué :</strong> {d.motif || 'Aucun motif indiqué.'}
                      </p>
                    )}
                    {d.statut !== 'actif' && (
                      <button
                        type="button"
                        className="btn-secondaire"
                        disabled={occupe === d.id}
                        onClick={() => decider(d, 'en_attente')}
                        aria-label={`Remettre la demande de ${nom} en attente`}
                      >
                        Remettre en attente
                      </button>
                    )}
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>

      <dialog
        ref={dialogue}
        className="zoom"
        aria-label="Carte de presse agrandie"
        onClose={() => setZoom(null)}
        onClick={(e) => {
          if (e.target === e.currentTarget) setZoom(null);
        }}
      >
        {zoom && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={zoom.carteUrl} alt={`Carte de presse de ${zoom.prenom} ${zoom.nom}, en grand`} />
            <button type="button" className="btn-secondaire" onClick={() => setZoom(null)}>
              Fermer
            </button>
          </>
        )}
      </dialog>
    </div>
  );
}
