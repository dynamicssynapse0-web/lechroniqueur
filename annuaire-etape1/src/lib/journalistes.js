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
