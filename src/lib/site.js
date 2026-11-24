// =====================================================================
// Informations légales de lechroniqueur.
// Remplacez chaque texte « À COMPLÉTER … » par vos vraies informations,
// puis enregistrez. Toutes les pages légales lisent ce fichier.
// =====================================================================
export const SITE_INFOS = {
  nom: 'lechroniqueur',

  // Qui édite le site (vous, ou votre société / association)
  editeur: 'lechroniqueur (Synapse Dynamics)',
  statut: 'Entreprise individuelle',
  adresse: 'Douala, Cameroun',
  email: 'dynamicssynapse0@gmail.com',
  telephone: '', // facultatif : laissez vide pour ne pas l'afficher
  responsablePublication: 'Aubin Simo Kaigom',

  // Hébergement et données
  hebergeur: 'Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis',
  regionDonnees: 'Union européenne',

  // Engagements
  dureeRefus: '3 mois',
  droitApplicable: 'Droit camerounais et tribunaux compétents de Douala',

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
