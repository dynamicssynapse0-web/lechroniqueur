'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { creerClientNavigateur } from '../lib/supabase/client';

const CATEGORIES = [
  'Politique', 'Société', 'Économie', 'International', 'Sport',
  'Culture', 'Santé', 'Éducation', 'Environnement', 'Technologie',
];

const TYPES_IMAGE = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
const TAILLE_MAX = 5 * 1024 * 1024;
const L = { titreMin: 10, titreMax: 110, resumeMin: 50, resumeMax: 160, motsMin: 50, caracteresMin: 200 };

function creerSlug(texte) {
  return texte
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/g, '');
}

function compterMots(texte) {
  const t = texte.trim();
  return t ? t.split(/\s+/).length : 0;
}

function enLigne(texte) {
  return texte.split(/(\*\*[^*]+\*\*)/g).map((morceau, i) =>
    morceau.length > 4 && morceau.startsWith('**') && morceau.endsWith('**')
      ? <strong key={i}>{morceau.slice(2, -2)}</strong>
      : morceau
  );
}

function ApercuTexte({ contenu }) {
  const blocs = contenu.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
  return blocs.map((b, i) => {
    if (b.startsWith('## ')) return <h3 key={i}>{enLigne(b.slice(3))}</h3>;
    if (b.startsWith('> ')) return <blockquote key={i}>{enLigne(b.replace(/^> ?/gm, ' ').trim())}</blockquote>;
    if (b.startsWith('- ')) {
      return (
        <ul key={i}>
          {b.split('\n').map((ligne, j) => (
            <li key={j}>{enLigne(ligne.replace(/^- /, ''))}</li>
          ))}
        </ul>
      );
    }
    return <p key={i}>{enLigne(b.replace(/\n/g, ' '))}</p>;
  });
}

function messageErreur(error) {
  if (error?.code === '23514') {
    return 'Cet article ne remplit pas encore toutes les conditions de publication (titre, résumé, rubrique, image et longueur du texte).';
  }
  if (error?.code === '42501' || error?.code === 'PGRST116') {
    return 'Vous n’avez pas l’autorisation d’enregistrer cet article. Votre compte doit être actif.';
  }
  if (error?.code === 'slug') {
    return 'Impossible de créer une adresse unique pour cet article. Modifiez légèrement le titre.';
  }
  return 'L’enregistrement a échoué. Réessayez dans un instant.';
}

function heure() {
  return new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

export default function EditeurArticle({ utilisateurId, auteur, articleInitial = null }) {
  const [valeurs, setValeurs] = useState({
    titre: articleInitial?.titre ?? '',
    resume: articleInitial?.resume ?? '',
    categorie: articleInitial?.categorie ?? '',
    contenu: articleInitial?.contenu ?? '',
    texteAlt: articleInitial?.imageAlt ?? '',
  });
  const [image, setImage] = useState(null);
  const [urlImage, setUrlImage] = useState('');
  const [imagePath, setImagePath] = useState(articleInitial?.imagePath ?? '');
  const [cleFichier, setCleFichier] = useState(0);
  const [articleId, setArticleId] = useState(articleInitial?.id ?? null);
  const [slug, setSlug] = useState(articleInitial?.slug ?? '');
  const [statut, setStatut] = useState(articleInitial?.statut ?? 'brouillon');
  const [aDejaPublie, setADejaPublie] = useState(Boolean(articleInitial?.publieLe));
  const [erreurs, setErreurs] = useState({});
  const [onglet, setOnglet] = useState('ecrire');
  const [modifie, setModifie] = useState(false);
  const [message, setMessage] = useState('');
  const [erreurServeur, setErreurServeur] = useState('');
  const [enCours, setEnCours] = useState(false);
  const zoneTexte = useRef(null);
  const cheminEnLigne = useRef(articleInitial?.imagePath ?? '');

  const mots = compterMots(valeurs.contenu);
  const minutes = Math.max(1, Math.round(mots / 200));
  const slugAffiche = aDejaPublie && slug ? slug : creerSlug(valeurs.titre) || 'titre-de-l-article';
  const urlStockee = imagePath
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/couvertures/${imagePath}`
    : '';
  const urlAffichee = urlImage || urlStockee;

  useEffect(() => {
    return () => {
      if (urlImage) URL.revokeObjectURL(urlImage);
    };
  }, [urlImage]);

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
    if (erreurs[name]) setErreurs((er) => ({ ...er, [name]: undefined }));
  }

  function choisirImage(e) {
    const fichier = e.target.files?.[0];
    if (!fichier) return;

    let probleme = '';
    if (!TYPES_IMAGE[fichier.type]) probleme = 'Format non accepté. Utilisez une image JPG, PNG ou WebP.';
    else if (fichier.size > TAILLE_MAX) probleme = 'L’image est trop lourde (5 Mo maximum).';

    if (probleme) {
      setErreurs((er) => ({ ...er, image: probleme }));
      e.target.value = '';
      return;
    }

    setImage(fichier);
    setUrlImage(URL.createObjectURL(fichier));
    setModifie(true);
    setErreurs((er) => ({ ...er, image: undefined }));
  }

  function retirerImage() {
    setImage(null);
    setUrlImage('');
    setImagePath('');
    setCleFichier((c) => c + 1);
    setValeurs((v) => ({ ...v, texteAlt: '' }));
    setModifie(true);
  }

  function inserer(avant, apres, modele, bloc) {
    const zone = zoneTexte.current;
    if (!zone) return;
    const debut = zone.selectionStart;
    const fin = zone.selectionEnd;
    const texte = zone.value;
    const choisi = texte.slice(debut, fin) || modele;
    const prefixe = bloc && debut > 0 && texte[debut - 1] !== '\n' ? '\n\n' : '';
    const nouveau = texte.slice(0, debut) + prefixe + avant + choisi + apres + texte.slice(fin);
    const place = debut + prefixe.length + avant.length;

    setValeurs((v) => ({ ...v, contenu: nouveau }));
    setModifie(true);
    setMessage('');
    requestAnimationFrame(() => {
      zone.focus();
      zone.setSelectionRange(place, place + choisi.length);
    });
  }

  function validerBrouillon() {
    const e = {};
    if (valeurs.titre.trim().length < 3) e.titre = 'Donnez au moins un titre à votre brouillon.';
    return e;
  }

  function validerPublication() {
    const e = {};
    if (valeurs.titre.trim().length < L.titreMin) e.titre = `Le titre doit contenir au moins ${L.titreMin} caractères.`;
    if (valeurs.resume.trim().length < L.resumeMin) e.resume = `Le résumé doit contenir au moins ${L.resumeMin} caractères.`;
    if (!valeurs.categorie) e.categorie = 'Choisissez une rubrique.';
    if (!urlAffichee) e.image = 'Ajoutez une image de couverture.';
    else if (!valeurs.texteAlt.trim()) e.texteAlt = 'Décrivez l’image en quelques mots.';
    if (mots < L.motsMin) e.contenu = `L’article doit contenir au moins ${L.motsMin} mots (il en compte ${mots}).`;
    else if (valeurs.contenu.trim().length < L.caracteresMin) e.contenu = `L’article doit contenir au moins ${L.caracteresMin} caractères.`;
    return e;
  }

  async function ecrire(supabase, champs, slugBase) {
    for (let essai = 0; essai < 4; essai++) {
      const ligne = aDejaPublie
        ? champs
        : { ...champs, slug: essai === 0 ? slugBase : `${slugBase}-${crypto.randomUUID().slice(0, 5)}` };

      const requete = articleId
        ? supabase.from('articles').update(ligne).eq('id', articleId)
        : supabase.from('articles').insert({ ...ligne, auteur_id: utilisateurId });

      const { data, error } = await requete.select('id, slug, statut, publie_le').single();
      if (!error) return { data };
      if (error.code !== '23505' || aDejaPublie) return { error };
    }
    return { error: { code: 'slug' } };
  }

  async function sauvegarder(publier) {
    const trouvees = publier ? validerPublication() : validerBrouillon();
    setErreurs(trouvees);
    setMessage('');
    setErreurServeur('');

    const premier = Object.keys(trouvees)[0];
    if (premier) {
      setOnglet('ecrire');
      setTimeout(() => document.getElementById(premier)?.focus(), 0);
      return;
    }

    setEnCours(true);
    const supabase = creerClientNavigateur();
    let nouveauChemin = '';

    try {
      if (image) {
        const chemin = `${utilisateurId}/${crypto.randomUUID()}.${TYPES_IMAGE[image.type]}`;
        const { error: erreurEnvoi } = await supabase.storage
          .from('couvertures')
          .upload(chemin, image, { contentType: image.type, upsert: false, cacheControl: '31536000' });
        if (erreurEnvoi) {
          setErreurServeur('L’envoi de l’image a échoué. Vérifiez votre connexion et réessayez.');
          return;
        }
        nouveauChemin = chemin;
      }

      const cheminFinal = nouveauChemin || imagePath;
      const champs = {
        titre: valeurs.titre.trim(),
        resume: valeurs.resume.trim(),
        categorie: valeurs.categorie || null,
        contenu: valeurs.contenu,
        image_path: cheminFinal || null,
        image_alt: valeurs.texteAlt.trim() || null,
        statut: publier ? 'publie' : 'brouillon',
      };
      const slugBase = creerSlug(champs.titre) || 'article';

      const { data, error } = await ecrire(supabase, champs, slugBase);

      if (error) {
        if (nouveauChemin) await supabase.storage.from('couvertures').remove([nouveauChemin]);
        setErreurServeur(messageErreur(error));
        return;
      }

      if (cheminEnLigne.current && cheminEnLigne.current !== cheminFinal) {
        await supabase.storage.from('couvertures').remove([cheminEnLigne.current]);
      }
      cheminEnLigne.current = cheminFinal;

      if (nouveauChemin) {
        setImagePath(nouveauChemin);
        setImage(null);
        setUrlImage('');
        setCleFichier((c) => c + 1);
      }

      if (!articleId) {
        window.history.replaceState(null, '', `/espace/modifier/${data.id}`);
      }

      setArticleId(data.id);
      setSlug(data.slug);
      setStatut(data.statut);
      setADejaPublie(Boolean(data.publie_le));
      setModifie(false);
      setMessage(
        data.statut === 'publie'
          ? `Article publié à ${heure()}. Adresse : /article/${data.slug}`
          : `Brouillon enregistré à ${heure()}.`
      );
    } finally {
      setEnCours(false);
    }
  }

  async function retirer() {
    if (!articleId) return;
    setErreurServeur('');
    setMessage('');
    setEnCours(true);

    const supabase = creerClientNavigateur();
    const { data, error } = await supabase
      .from('articles')
      .update({ statut: 'brouillon' })
      .eq('id', articleId)
      .select('id');

    setEnCours(false);
    if (error || !data || data.length === 0) {
      setErreurServeur('Impossible de retirer l’article de la publication. Réessayez.');
      return;
    }
    setStatut('brouillon');
    setMessage(`L’article n’est plus public : il est repassé en brouillon (${heure()}).`);
  }

  const titreAffiche = valeurs.titre.trim() || 'Titre de votre article';
  const resumeAffiche = valeurs.resume.trim() || 'Le résumé de votre article apparaîtra ici.';

  return (
    <div className="editeur">
      <div className="editeur-entete">
        <p>
          <span className={`badge ${statut === 'publie' ? 'badge-bleu' : 'badge-rouge'}`}>
            {statut === 'publie' ? 'Publié' : 'Brouillon'}
          </span>
          {modifie && <span className="aide"> Modifications non enregistrées</span>}
        </p>
      </div>

      <div className="onglets-ed" role="group" aria-label="Affichage">
        <button type="button" className="filtre" aria-pressed={onglet === 'ecrire'} onClick={() => setOnglet('ecrire')}>
          Écrire
        </button>
        <button type="button" className="filtre" aria-pressed={onglet === 'apercu'} onClick={() => setOnglet('apercu')}>
          Aperçu
        </button>
      </div>

      <div className="editeur-grille">
        <div>
          {onglet === 'ecrire' ? (
            <form className="formulaire" onSubmit={(e) => e.preventDefault()} noValidate>
              <div className="grille-champs">
                <div className="champ">
                  <label htmlFor="titre">Titre</label>
                  <input
                    id="titre"
                    name="titre"
                    type="text"
                    maxLength={L.titreMax}
                    value={valeurs.titre}
                    onChange={changer}
                    aria-invalid={erreurs.titre ? 'true' : undefined}
                    aria-describedby="titre-message"
                  />
                  {erreurs.titre
                    ? <p className="erreur" id="titre-message" role="alert">{erreurs.titre}</p>
                    : <p className="aide" id="titre-message">Clair et précis : c’est le titre affiché dans Google.</p>}
                  <p className="compteur-champ">{valeurs.titre.length} / {L.titreMax}</p>
                </div>

                <div className="champ">
                  <label htmlFor="resume">Résumé</label>
                  <textarea
                    id="resume"
                    name="resume"
                    rows={3}
                    maxLength={L.resumeMax}
                    value={valeurs.resume}
                    onChange={changer}
                    aria-invalid={erreurs.resume ? 'true' : undefined}
                    aria-describedby="resume-message"
                  />
                  {erreurs.resume
                    ? <p className="erreur" id="resume-message" role="alert">{erreurs.resume}</p>
                    : <p className="aide" id="resume-message">Une ou deux phrases qui donnent envie de lire. Il sert aussi de description dans Google.</p>}
                  <p className="compteur-champ">{valeurs.resume.length} / {L.resumeMax}</p>
                </div>

                <div className="champ">
                  <label htmlFor="categorie">Rubrique</label>
                  <select
                    id="categorie"
                    name="categorie"
                    value={valeurs.categorie}
                    onChange={changer}
                    aria-invalid={erreurs.categorie ? 'true' : undefined}
                    aria-describedby={erreurs.categorie ? 'categorie-message' : undefined}
                  >
                    <option value="">Choisissez une rubrique</option>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {erreurs.categorie && <p className="erreur" id="categorie-message" role="alert">{erreurs.categorie}</p>}
                </div>

                <div className="champ">
                  <label htmlFor="image">Image de couverture</label>
                  <div className="depot" data-erreur={erreurs.image ? 'oui' : undefined}>
                    <input
                      key={cleFichier}
                      id="image"
                      name="image"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={choisirImage}
                      aria-invalid={erreurs.image ? 'true' : undefined}
                      aria-describedby="image-message"
                    />
                    {urlAffichee && (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img className="apercu" src={urlAffichee} alt="Aperçu de l’image de couverture" />
                        {image && <p className="nom-fichier">{image.name}</p>}
                        <button type="button" className="lien-retour" onClick={retirerImage}>Retirer l’image</button>
                      </>
                    )}
                  </div>
                  {erreurs.image
                    ? <p className="erreur" id="image-message" role="alert">{erreurs.image}</p>
                    : <p className="aide" id="image-message">JPG, PNG ou WebP, 5 Mo maximum. Format paysage conseillé. Cette image sera publique.</p>}
                </div>

                {urlAffichee && (
                  <div className="champ">
                    <label htmlFor="texteAlt">Description de l’image</label>
                    <input
                      id="texteAlt"
                      name="texteAlt"
                      type="text"
                      maxLength={140}
                      value={valeurs.texteAlt}
                      onChange={changer}
                      aria-invalid={erreurs.texteAlt ? 'true' : undefined}
                      aria-describedby="texteAlt-message"
                    />
                    {erreurs.texteAlt
                      ? <p className="erreur" id="texteAlt-message" role="alert">{erreurs.texteAlt}</p>
                      : <p className="aide" id="texteAlt-message">Décrit l’image aux personnes malvoyantes et à Google. Exemple : « Le ministre devant les journalistes à Yaoundé ».</p>}
                  </div>
                )}

                <div className="champ">
                  <label htmlFor="contenu">Contenu de l’article</label>
                  <div className="barre-outils" role="group" aria-label="Mise en forme">
                    <button type="button" onClick={() => inserer('## ', '', 'Sous-titre', true)}>Sous-titre</button>
                    <button type="button" onClick={() => inserer('**', '**', 'texte important', false)}>Gras</button>
                    <button type="button" onClick={() => inserer('> ', '', 'Citation', true)}>Citation</button>
                    <button type="button" onClick={() => inserer('- ', '', 'Élément de liste', true)}>Liste</button>
                  </div>
                  <textarea
                    id="contenu"
                    name="contenu"
                    ref={zoneTexte}
                    rows={16}
                    value={valeurs.contenu}
                    onChange={changer}
                    aria-invalid={erreurs.contenu ? 'true' : undefined}
                    aria-describedby="contenu-message"
                  />
                  {erreurs.contenu
                    ? <p className="erreur" id="contenu-message" role="alert">{erreurs.contenu}</p>
                    : <p className="aide" id="contenu-message">Séparez les paragraphes par une ligne vide. Les boutons ajoutent la mise en forme ; l’onglet Aperçu montre le résultat.</p>}
                  <p className="compteur-champ">{mots} mots · environ {minutes} min de lecture</p>
                </div>
              </div>
            </form>
          ) : (
            <article className="apercu-article" aria-label="Aperçu de l’article">
              <p className="rubrique">{valeurs.categorie || 'Rubrique'}</p>
              <h2>{titreAffiche}</h2>
              <p className="signature">
                Par {auteur.nom}, {auteur.media} ·{' '}
                {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })} ·{' '}
                {minutes} min de lecture
              </p>
              {urlAffichee && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={urlAffichee} alt={valeurs.texteAlt || ''} />
              )}
              <p className="chapeau">{resumeAffiche}</p>
              <div className="texte">
                {valeurs.contenu.trim()
                  ? <ApercuTexte contenu={valeurs.contenu} />
                  : <p className="aide">Rien à afficher : écrivez votre article dans l’onglet Écrire.</p>}
              </div>
            </article>
          )}
        </div>

        <aside className="panneau panneau-lateral" aria-labelledby="titre-publication">
          <h2 id="titre-publication">Publication</h2>

          <div aria-live="polite">
            {message && <p className="info">{message}</p>}
            {erreurServeur && <p className="erreur-panneau" role="alert">{erreurServeur}</p>}
          </div>

          <button type="button" className="btn-principal" disabled={enCours} onClick={() => sauvegarder(true)}>
            {enCours ? 'Enregistrement…' : statut === 'publie' ? 'Mettre à jour l’article' : 'Publier'}
          </button>
          {statut !== 'publie' && (
            <button type="button" className="btn-secondaire" disabled={enCours} onClick={() => sauvegarder(false)}>
              Enregistrer le brouillon
            </button>
          )}
          {statut === 'publie' && (
            <button type="button" className="btn-secondaire" disabled={enCours} onClick={retirer}>
              Retirer de la publication
            </button>
          )}
          <Link href="/espace" className="btn-secondaire btn-lien-pdf">Mes articles</Link>

          <div>
            <h3 className="sous-titre-panneau">Aperçu dans Google</h3>
            <div className="apercu-google">
              <p className="g-titre">{titreAffiche.slice(0, 60)}{titreAffiche.length > 60 ? '…' : ''} | lechroniqueur</p>
              <p className="g-url">lechroniqueur.com › article › {slugAffiche}</p>
              <p className="g-desc">{resumeAffiche}</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}