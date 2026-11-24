'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { creerClientNavigateur } from '../lib/supabase/client';

const ETAPES = ['Compte créé', 'Email confirmé', 'Vérification', 'Profil', 'Publication'];

const PAYS = [
  { nom: 'Cameroun', indicatif: '+237' },
  { nom: 'France', indicatif: '+33' },
  { nom: 'Belgique', indicatif: '+32' },
  { nom: 'Suisse', indicatif: '+41' },
  { nom: 'Canada', indicatif: '+1' },
  { nom: 'Luxembourg', indicatif: '+352' },
  { nom: 'Sénégal', indicatif: '+221' },
  { nom: 'Côte d’Ivoire', indicatif: '+225' },
  { nom: 'Gabon', indicatif: '+241' },
  { nom: 'Congo', indicatif: '+242' },
  { nom: 'RD Congo', indicatif: '+243' },
  { nom: 'Tchad', indicatif: '+235' },
  { nom: 'Centrafrique', indicatif: '+236' },
  { nom: 'Guinée équatoriale', indicatif: '+240' },
  { nom: 'Bénin', indicatif: '+229' },
  { nom: 'Togo', indicatif: '+228' },
  { nom: 'Mali', indicatif: '+223' },
  { nom: 'Burkina Faso', indicatif: '+226' },
  { nom: 'Niger', indicatif: '+227' },
  { nom: 'Guinée', indicatif: '+224' },
  { nom: 'Mauritanie', indicatif: '+222' },
  { nom: 'Madagascar', indicatif: '+261' },
  { nom: 'Burundi', indicatif: '+257' },
  { nom: 'Rwanda', indicatif: '+250' },
  { nom: 'Djibouti', indicatif: '+253' },
  { nom: 'Comores', indicatif: '+269' },
  { nom: 'Maroc', indicatif: '+212' },
  { nom: 'Algérie', indicatif: '+213' },
  { nom: 'Tunisie', indicatif: '+216' },
  { nom: 'Nigeria', indicatif: '+234' },
  { nom: 'Ghana', indicatif: '+233' },
  { nom: 'Haïti', indicatif: '+509' },
  { nom: 'États-Unis', indicatif: '+1' },
  { nom: 'Royaume-Uni', indicatif: '+44' },
  { nom: 'Allemagne', indicatif: '+49' },
  { nom: 'Espagne', indicatif: '+34' },
  { nom: 'Italie', indicatif: '+39' },
];


export default function FinaliserProfil({ profil }) {
  const DEMO = profil;
  const [etape, setEtape] = useState('resume');
  const [valeurs, setValeurs] = useState({ ville: '', pays: '', telephone: '' });
  const [erreurs, setErreurs] = useState({});
  const [enCours, setEnCours] = useState(false);
  const [erreurServeur, setErreurServeur] = useState('');

  const titre = useRef(null);
  const premierAffichage = useRef(true);

  // Déplace le focus sur le titre à chaque changement d’étape (accessibilité)
  useEffect(() => {
    if (premierAffichage.current) {
      premierAffichage.current = false;
      return;
    }
    titre.current?.focus();
  }, [etape]);

  const pays = PAYS.find((p) => p.nom === valeurs.pays);
  const courante = etape === 'bienvenue' ? 4 : 3;

  function changer(e) {
    const { name, value } = e.target;
    setValeurs((v) => ({ ...v, [name]: value }));
    if (erreurs[name]) setErreurs((er) => ({ ...er, [name]: undefined }));
  }

  function valider() {
    const e = {};
    if (valeurs.ville.trim().length < 2) e.ville = 'Indiquez votre ville.';
    if (!valeurs.pays) e.pays = 'Choisissez votre pays.';
    const chiffres = valeurs.telephone.replace(/[\s.\-()]/g, '');
    if (!/^\d{6,12}$/.test(chiffres)) {
      e.telephone = 'Entrez votre numéro avec 6 à 12 chiffres, sans l’indicatif du pays.';
    }
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

    setEnCours(true);
    const supabase = creerClientNavigateur();
    const { error } = await supabase.rpc('completer_profil', {
      p_ville: valeurs.ville,
      p_pays: valeurs.pays,
      p_telephone: `${pays ? pays.indicatif : ''} ${valeurs.telephone}`.trim(),
    });
    if (error) {
      setEnCours(false);
      setErreurServeur('Enregistrement impossible. Vérifiez vos informations et réessayez.');
      return;
    }
    setEnCours(false);
    setEtape('bienvenue');
  }

  return (
    <div className="suivi">
      <ol className="progression" aria-label="Avancement de votre inscription">
        {ETAPES.map((nom, index) => {
          const etat = index < courante ? 'fait' : index === courante ? 'courant' : 'a-venir';
          return (
            <li
              key={nom}
              className={`etape-suivi ${etat}${index <= courante ? ' atteint' : ''}`}
              aria-current={etat === 'courant' ? 'step' : undefined}
            >
              <span className="pastille" aria-hidden="true">
                {etat === 'fait' ? '✓' : index + 1}
              </span>
              <span className="libelle">
                {nom}
                <span className="sr-only">
                  {etat === 'fait' ? ' (terminée)' : etat === 'courant' ? ' (en cours)' : ' (à venir)'}
                </span>
              </span>
            </li>
          );
        })}
      </ol>

      {etape === 'resume' && (
        <section className="carte-statut" aria-labelledby="titre-profil">
          <h2 id="titre-profil" ref={titre} tabIndex={-1}>
            Votre demande est acceptée, {DEMO.prenom}
          </h2>
          <p>Voici les informations de votre inscription. Vérifiez-les avant de continuer.</p>

          <dl className="infos-lecture">
            <div>
              <dt>Prénom</dt>
              <dd>{DEMO.prenom}</dd>
            </div>
            <div>
              <dt>Nom</dt>
              <dd>{DEMO.nom}</dd>
            </div>
            <div>
              <dt>Média</dt>
              <dd>{DEMO.media}</dd>
            </div>
            <div>
              <dt>Adresse email</dt>
              <dd>{DEMO.email}</dd>
            </div>
          </dl>

          <p className="aide">
            Ces informations ne se modifient pas ici. Pour une correction, contactez
            l’équipe lechroniqueur.
          </p>

          <button type="button" className="btn-principal" onClick={() => setEtape('formulaire')}>
            Continuer
          </button>
        </section>
      )}

      {etape === 'formulaire' && (
        <section className="formulaire" aria-labelledby="titre-profil">
          <h2 id="titre-profil" ref={titre} tabIndex={-1}>Complétez votre profil</h2>

          <form onSubmit={soumettre} noValidate>
            <div className="grille-champs">
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
                  {PAYS.map((p) => (
                    <option key={p.nom} value={p.nom}>{p.nom}</option>
                  ))}
                </select>
                {erreurs.pays && (
                  <p className="erreur" id="pays-message" role="alert">{erreurs.pays}</p>
                )}
              </div>

              <div className="champ">
                <label htmlFor="telephone">Numéro de téléphone</label>
                <div className="telephone">
                  <span className="indicatif" aria-hidden="true">{pays ? pays.indicatif : '+…'}</span>
                  <input
                    id="telephone"
                    name="telephone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel-national"
                    value={valeurs.telephone}
                    onChange={changer}
                    aria-invalid={erreurs.telephone ? 'true' : undefined}
                    aria-describedby="telephone-message"
                  />
                </div>
                {erreurs.telephone ? (
                  <p className="erreur" id="telephone-message" role="alert">{erreurs.telephone}</p>
                ) : (
                  <p className="aide" id="telephone-message">
                    {pays
                      ? `L’indicatif ${pays.indicatif} est ajouté automatiquement. `
                      : 'Choisissez d’abord votre pays pour voir l’indicatif. '}
                    Votre numéro reste privé : il n’est visible que par l’équipe lechroniqueur.
                  </p>
                )}
              </div>

              <p className="aide">
                Votre ville et votre pays apparaîtront sur votre profil public.
              </p>

              {erreurServeur && (
                <p className="erreur" role="alert">{erreurServeur}</p>
              )}

              <button type="submit" className="btn-principal" disabled={enCours}>
                {enCours ? 'Enregistrement…' : 'Valider mon profil'}
              </button>
              <button type="button" className="lien-retour" onClick={() => setEtape('resume')}>
                Retour
              </button>
            </div>
          </form>
        </section>
      )}

      {etape === 'bienvenue' && (
        <section className="carte-statut" aria-labelledby="titre-profil">
          <h2 id="titre-profil" ref={titre} tabIndex={-1}>
            Bienvenue dans votre univers médiatique
          </h2>
          <p>
            Votre profil est complet, {DEMO.prenom}. Vous pouvez maintenant rédiger et
            publier vos articles : ils seront visibles par tous les lecteurs de lechroniqueur.
          </p>
          <Link href="/espace/nouvel-article" className="btn-principal btn-lien">
            Écrire mon premier article
          </Link>
        </section>
      )}
    </div>
  );
}