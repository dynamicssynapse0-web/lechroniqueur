export function formaterDate(iso) {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function minutesLecture(texte) {
  const t = (texte || '').trim();
  const mots = t ? t.split(/\s+/).length : 0;
  return Math.max(1, Math.round(mots / 200));
}
