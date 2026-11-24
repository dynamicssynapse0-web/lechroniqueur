// Outils partagés par l'annuaire et les profils des journalistes.

// Minuscules, sans accents : « Aïcha » et « aicha » se retrouvent.
export function normaliser(texte) {
  return (texte ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

export function nomComplet(j) {
  return `${j.prenom ?? ''} ${j.nom ?? ''}`.trim() || 'Journaliste';
}

export function initiales(j) {
  const p = (j.prenom ?? '').trim().charAt(0);
  const n = (j.nom ?? '').trim().charAt(0);
  return (p + n).toUpperCase() || '?';
}

export function lieu(j) {
  return [j.ville, j.pays].filter(Boolean).join(', ');
}

export function extrait(texte, max = 140) {
  const t = (texte ?? '').trim();
  if (t.length <= max) return t;
  return t.slice(0, max).replace(/\s+\S*$/, '') + '…';
}

export function slugifier(texte) {
  return normaliser(texte)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/g, '');
}

// Adresse publique d'un profil : nom lisible + identifiant.
export function lienJournaliste(j) {
  const nom = slugifier(nomComplet(j)) || 'journaliste';
  return `/journalistes/${nom}-${j.id}`;
}

const UUID_FIN = /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i;

// Retrouve l'identifiant à la fin de l'adresse, ou null si elle est invalide.
export function idDepuisParam(param) {
  const m = UUID_FIN.exec(param ?? '');
  return m ? m[1].toLowerCase() : null;
}
