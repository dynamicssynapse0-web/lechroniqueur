import { redirect } from 'next/navigation';
import AdminDemandes from '../../components/AdminDemandes';
import { creerClientServeur } from '../../lib/supabase/serveur';
import { urlPhoto } from '../../lib/photos';

export const metadata = {
  title: 'Espace administrateur',
  robots: { index: false, follow: false },
};

export default async function Admin() {
  const supabase = await creerClientServeur();
  const { data: session } = await supabase.auth.getClaims();
  const utilisateurId = session?.claims?.sub;
  if (!utilisateurId) redirect('/connexion');

  const { data: moi } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', utilisateurId)
    .maybeSingle();
  if (moi?.role !== 'admin') redirect('/suivi');

  const { data: lignes, error } = await supabase
    .from('profiles')
    .select('id, prenom, nom, media, email, numero_carte, carte_path, photo_path, statut, motif_refus, nouvelle_soumission, demande_le')
    .eq('role', 'journaliste')
    .in('statut', ['en_attente', 'accepte', 'refuse', 'actif'])
    .order('demande_le', { ascending: false, nullsFirst: false });

  let demandes = [];
  if (!error && lignes) {
    const chemins = lignes.map((l) => l.carte_path).filter(Boolean);
    const liens = {};
    if (chemins.length > 0) {
      const { data: signes } = await supabase.storage
        .from('cartes-presse')
        .createSignedUrls(chemins, 600);
      (signes ?? []).forEach((s) => {
        if (s.signedUrl) liens[s.path] = s.signedUrl;
      });
    }
    demandes = lignes.map((l) => ({
      id: l.id,
      prenom: l.prenom,
      nom: l.nom,
      media: l.media,
      email: l.email,
      numeroCarte: l.numero_carte ?? '',
      recue: l.demande_le,
      statut: l.statut,
      motif: l.motif_refus ?? '',
      nouvelle: l.nouvelle_soumission,
      carteUrl: liens[l.carte_path] ?? null,
      carteEstPdf: (l.carte_path ?? '').toLowerCase().endsWith('.pdf'),
      photoUrl: urlPhoto(l.photo_path) || null,
    }));
  }

  return (
    <section>
      <h1>Espace administrateur</h1>
      <p className="intro-page">
        Examinez les cartes de presse, comparez le visage de la photo de profil avec
        celui de la carte, puis décidez d’accepter ou de rejeter chaque demande. Les
        liens des cartes expirent au bout de 10 minutes : actualisez la page si une
        image ne s’affiche plus.
      </p>
      {error ? (
        <p className="erreur" role="alert">
          Impossible de charger les demandes. Actualisez la page.
        </p>
      ) : (
        <AdminDemandes demandesInitiales={demandes} />
      )}
    </section>
  );
}
