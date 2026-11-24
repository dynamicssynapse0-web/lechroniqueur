// Où envoyer une personne connectée, selon son rôle et son statut.
export function destinationApresConnexion(profil) {
  if (!profil) return '/suivi';
  if (profil.role === 'admin') return '/admin';
  if (profil.statut === 'actif') return '/espace';
  if (profil.statut === 'accepte') return '/profil';
  return '/suivi';
}