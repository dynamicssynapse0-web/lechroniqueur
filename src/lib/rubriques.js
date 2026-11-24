export const RUBRIQUES = [
  { nom: 'Politique', slug: 'politique' },
  { nom: 'Société', slug: 'societe' },
  { nom: 'Économie', slug: 'economie' },
  { nom: 'International', slug: 'international' },
  { nom: 'Sport', slug: 'sport' },
  { nom: 'Culture', slug: 'culture' },
  { nom: 'Santé', slug: 'sante' },
  { nom: 'Éducation', slug: 'education' },
  { nom: 'Environnement', slug: 'environnement' },
  { nom: 'Technologie', slug: 'technologie' },
];

export const rubriqueParSlug = (slug) => RUBRIQUES.find((r) => r.slug === slug);
export const rubriqueParNom = (nom) => RUBRIQUES.find((r) => r.nom === nom);

// Ne garde que les rubriques réellement alimentées par au moins un article.
export function rubriquesDepuisArticles(articles) {
  const noms = new Set(articles.map((a) => a.categorie).filter(Boolean));
  return RUBRIQUES.filter((r) => noms.has(r.nom));
}
