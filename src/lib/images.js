// Adresse publique d'une image de couverture (stockage « couvertures »).
// Module sans dépendance Supabase : utilisable aussi bien côté serveur que côté client.
export function urlImage(chemin) {
  return chemin
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/couvertures/${chemin}`
    : '';
}
