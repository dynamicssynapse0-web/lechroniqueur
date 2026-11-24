// Adresse publique d'une photo de profil (stockage « photos-profil »).
export function urlPhoto(chemin) {
  return chemin
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/photos-profil/${chemin}`
    : '';
}
