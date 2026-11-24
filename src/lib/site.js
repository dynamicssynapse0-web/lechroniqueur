// =====================================================================
// Informations légales de lechroniqueur.
// Remplacez chaque texte « À COMPLÉTER … » par vos vraies informations,
// puis enregistrez. Toutes les pages légales lisent ce fichier.
// =====================================================================
export const SITE_INFOS = {
  nom: 'lechroniqueur',

  // Qui édite le site (vous, ou votre société / association)
  editeur: 'lechroniqueur',
  statut: 'À COMPLÉTER : statut juridique (ex. entreprise individuelle, société, association)',
  adresse: 'Paris, France',
  email: 'dynamicssynapse0@gmail.com',
  telephone: '', // facultatif : laissez vide pour ne pas l'afficher
  responsablePublication: 'À COMPLÉTER : nom du responsable de la publication',

  // Hébergement et données
  hebergeur: 'À COMPLÉTER : nom et adresse de l’hébergeur du site',
  regionDonnees: 'À COMPLÉTER : région de stockage des données (visible dans les paramètres de votre projet Supabase)',

  // Engagements
  dureeRefus: 'À COMPLÉTER : durée de conservation d’une demande refusée (ex. 3 mois)',
  droitApplicable: 'À COMPLÉTER : pays dont le droit s’applique et tribunaux compétents',

  miseAJour: '22 novembre 2026',
};

// Vrai tant qu'il reste un texte « À COMPLÉTER » dans les informations.
export function infosIncompletes() {
  return Object.values(SITE_INFOS).some(
    (v) => typeof v === 'string' && v.includes('À COMPLÉTER')
  );
}

export function emailValide() {
  return /^\S+@\S+\.\S+$/.test(SITE_INFOS.email);
}
